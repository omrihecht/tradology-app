// JavaScript Document

var urlBase = 'http://hooliganspro.co.il/Colmex/audioGuidesApp/';
var lang = '';
var utils = new Utils();
var deviceObj = { 'os' : '' , 'push_registration_id' : '' };
var appsFlyerObj = { 'user_id' : '' , 'media_source' : '' , 'campaign' : '' };
var countryInitObj = {};
var appInit = {};
var initComplete, deviceInitComplete , onlyEnglish;

var isIOS = false,
	isAndroid = false;

var debug = false;


$(document).ready(function(e) {
	location.href = '#';
	if(debug){
		startApp();
	}else{
		document.addEventListener('deviceready', onDeviceReady, false);
	}
});

function handleOpenURL(url) {
	console.log("received url: " + url);
}

function onDeviceReady(id){

	window.analytics.startTrackerWithId('UA-77025511-1');

	setTimeout(function(){
		window.plugins.sim.getSimInfo(simSuccessCallback, simErrorCallback);
	});

	function simSuccessCallback(result) {
		console.log('sim result :: ' + JSON.parse(JSON.stringify(result)));

		deviceObj.phoneNumber = result.phoneNumber;
		console.log('sim :: ' + result.phoneNumber);

		appInit.simReady = true;
		checkAppReady();
	}

	function simErrorCallback(error) {
		console.log('sim :: ' + error);
	}

	document.addEventListener("pause",function(){
		console.log('pause');
		app_paused = true;
		$.event.trigger({
			type : 'onAppPause'
		});
	});
	document.addEventListener("resume",function(){
		setTimeout(function(){
			console.log('resume');
		},10);
	});
	document.addEventListener("offline",function(){
		console.log('offline');
		$('html').addClass('no-internet');
	});
	document.addEventListener("online",function(){
		console.log('online');
		$('html').removeClass('no-internet');
	});

	console.log('deviceready: ', id);

	console.log('cordova: ', device.cordova);
	console.log('model: ', device.model);
	console.log('platform: ', device.platform);
	console.log('uuid: ', device.uuid);
	console.log('version: ', device.version);
	console.log('manufacturer: ', device.manufacturer);
	console.log('isVirtual: ', device.isVirtual);
	console.log('serial: ', device.serial);

	deviceObj.os = device.platform;
	deviceObj.model = device.model;
	deviceObj.version = device.version;
	deviceObj.manufacturer = device.manufacturer;
	deviceObj.uuid = device.uuid;

	var push = PushNotification.init({
		android: {
			senderID: "359124208994"
		},
		ios: {
			alert: "true",
			badge: "true",
			sound: "true",
			clearBadge: "true"
		},
		windows: {}
	});

	push.on('registration', function(data) {
		// data.registrationId
		console.log('registrationId: ', data.registrationId);
		deviceObj.push_registration_id = data.registrationId;

		appInit.regReady = true;
		checkAppReady();
	});

	push.on('notification', function(data) {

		if( device.platform == 'iOS' ){
			setTimeout(function(){
				console.log( 'notification :: ' + data.additionalData.link );
				push_link = data.additionalData.link;
			});
		}else{
			console.log( 'notification :: ' + data.additionalData.link[0] );
			push_link = data.additionalData.link[0];
		}

		if(app_paused){
			//location.href = '#/benefits';
		}
		// data.additionalData.link[0]
		// data.message,
		// data.title,
		// data.count,
		// data.sound,
		// data.image,
		// data.additionalData
	});

	push.on('error', function(e) {
		debugger
		// e.message
	});

	//push.badge.clear();

	setTimeout(function(){
		checkAppReady();
	},10);


	/****  AppsFlyer  ***/
    var args = [];
    var devKey = "SiKJMTqMgfXWX9xbRfRkcT";	// your AppsFlyer devKey
    args.push(devKey);
    var userAgent = window.navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test( userAgent )) {
        var appId = "1108036125";			// your ios app id in app store
        args.push(appId);
    }
    window.plugins.appsFlyer.initSdk(args);


	document.addEventListener('onInstallConversionDataLoaded', function(e){
		//var attributionData = (JSON.stringify(e.detail));
		debugger
		if( e.detail.af_status.toLowerCase() == "organic" ){
			appsFlyerObj.media_source = 'Organic';
		} else {
			appsFlyerObj.campaign = e.detail.campaign;
			appsFlyerObj.media_source = e.detail.media_source;
			if( e.detail.loc == 'localeEn' ) onlyEnglish = true;
		}
		appInit.appsFlyerReady = true;
		checkAppReady();

	}, false);

	var getUserIdCallbackFn = function(id) {
		debugger
		appsFlyerObj.user_id = id;
		//var appsFlyerObj = { 'user_id' : '' , 'media_source' : '' , 'campaign' : '' };
	}
	window.plugins.appsFlyer.getAppsFlyerUID(getUserIdCallbackFn);

}

function checkAppReady(){
	if( appInit.regReady && appInit.simReady && appInit.appsFlyerReady ){
		setTimeout(function(){
			startApp();
		},10);
	}
}

function sendTrackAnalytics( name ){
	if( debug ) return;
	window.analytics.trackView( name );
	window.plugins.appsFlyer.trackEvent( 'trackView' , name );
}

function sendEventAnalytics( category , type , value ){
	if( debug ) return;
	window.analytics.trackEvent( category , type , value );
}

function sendAppsflyerEvent( eventName , userData ){
	if( debug ) return;
	var eventValues = { "user_name" : (userData.fname + ' ' + userData.lname) , "user_email" : userData.email , "user_phone" : userData.phone };
	window.plugins.appsFlyer.trackEvent( eventName , eventValues );
}

function startApp() {
	var md = new MobileDetect(window.navigator.userAgent);
	if(md.tablet() != null){
		isIpad = true;
		$('html').addClass('ipad-device');
	}
	if(md.phone() != null){
		isMobile = true;
		$('html').addClass('mobile-device');
		if(md.os() == 'AndroidOS'){
			isAndroid = true;
			$('html').addClass('AndroidOS');
		}
		if(md.os() == 'iOS'){
			isIOS = true;
			$('html').addClass('IOS');
		}
	}

	setPage();
}

function setPage(){
	debugger
	deviceInitComplete = true;

	$(document).on('click' , 'a' , function(event ){
		event.preventDefault();
		window.open( $(this).attr('href') , '_system');
	});
	$('#no-internet-pop .close-btn').click(function(){
		$('html').removeClass('no-internet');
	});

	//user_guid = null;
	//user_status = null;

}
