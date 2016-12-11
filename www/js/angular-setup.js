// JavaScript Document

var ngColmexApp = angular.module( 'ngColmexApp' , ['ngRoute' , 'ngTouch' , 'mn'] );

ngColmexApp.config(function ( $routeProvider ) {
	$routeProvider
		.when('/',{
			templateUrl: function(){
				if( !initComplete ) return;
				if(typeof user_guid === "undefined") return;
				if( user_guid == null ){
					location.href = '#/login';
				}
			}
		})
		.when('/login',{
			controller: 'Login',
			templateUrl: function(){
				sendTrackAnalytics( 'Login' );
				return 'partials/' + lang + '/login.html'
			}
		})
		.when('/activation',{
			controller: 'Activation',
			templateUrl: function(){
				sendTrackAnalytics( 'Activation' );
				return 'partials/' + lang + '/activation.html'
			}
		})
		.when('/audio',{
			controller: 'Audio',
			templateUrl: function(){
				sendTrackAnalytics( 'Audio' );
				$('.footer-btn').removeClass('selected');
				$('.footer-btn.home-btn').addClass('selected');
				return 'partials/' + lang + '/audio.html'
			}
		})
		.when('/tradeForm',{
			controller: 'TradeForm',
			templateUrl: function(){
				sendTrackAnalytics( 'Trade form' );
				$('.footer-btn').removeClass('selected');
				$('.footer-btn.trade-btn').addClass('selected');
				return 'partials/' + lang + '/tradeForm.html'
			}
		})
		.when('/report',{
			controller: 'Report',
			templateUrl: function(){
				sendTrackAnalytics( 'Report form' );
				$('.footer-btn').removeClass('selected');
				return 'partials/' + lang + '/report.html'
			}
		})
		.when('/benefits',{
			controller: 'Benefits',
			templateUrl: 'partials/' + lang + '/benefits.html'
		})
		.when('/about',{
			controller: 'About',
			templateUrl: function(){
				sendTrackAnalytics( 'About Collmex' );
				$('.footer-btn').removeClass('selected');
				return 'partials/' + lang + '/about.html'
			}
		})
		.otherwise({ redirectTo: '/' });
});

ngColmexApp.factory( 'dataFactory' , ['$http', function ( $http ){
	var dataFactory = {};

	dataFactory.sendUser = function( user ){
		return $http({
			method:'POST',
			url:urlBase + '/home/sendUser/',
			data:$.param(user),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	dataFactory.getUserProfile = function( user_guid ){
		return $http.get(urlBase + 'home/getUserProfile/?user_guid=' + user_guid );
	}

	dataFactory.checkSms = function( userObj , sms ){
		return $http.get(urlBase + 'home/checkSms/?user_guid=' + userObj.user_guid + '&sms=' + sms);
	}

	dataFactory.resendSms = function( userObj ){
		return $http.get(urlBase + 'home/ResendSms2User/?user_guid=' + userObj.user_guid);
	}

	dataFactory.resetStatus = function(){
		return $http.get(urlBase + '/deactivateUser.html?guid=' + loginData.user_guid);
	}

	dataFactory.changeLang = function( userObj ){
		return $http.get(urlBase + 'home/changeLang/?user_guid=' + userObj.user_guid + '&language=' + userObj.language );
	}

	dataFactory.getAudioTree = function( userObj ){
		return $http.get(urlBase + 'home/getJson/?user_guid=' + userObj.user_guid );
	}

	dataFactory.getBook = function( book_guid ){
		return $http.get(urlBase + 'home/getBook/?book_guid='+book_guid);
	}

	dataFactory.getAbout = function( userObj ){
		return $http.get(urlBase + 'home/getAbout/?language=' + userObj.language);
	}

	dataFactory.sendAudioComplete = function( userObj , audio_guid , is_guide , description ){
		return $http.get(urlBase + 'home/sendComplete/?user_guid=' + userObj.user_guid + '&audio_guid=' + audio_guid + '&is_guide=' + is_guide + '&description=' + description );
	}

	dataFactory.sendCurrentPos = function( userObj , audio_guid , time ){
		return $http.get(urlBase + 'home/sendCurrentPos/?user_guid=' + userObj.user_guid + '&audio_guid=' + audio_guid + '&time=' + time);
	}

	dataFactory.sendForm = function( formData ){
		return $http({
			method:'POST',
			url:urlBase + '/home/SendLead1/',
			data:$.param(formData),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	dataFactory.sendReport = function( formData ){
		return $http({
			method:'POST',
			url:urlBase + '/home/sendReport/',
			data:$.param(formData),
			headers:{ 'Content-Type': 'application/x-www-form-urlencoded' }
		})
	}

	dataFactory.clearBadge = function( userObj ){
		return $http.get(urlBase + 'home/getJson/?clearBadge=' + userObj.user_guid );
	}

	dataFactory.getCountryCodes = function(){
		return $http.get('json/countryCodes.json' );
	}

	dataFactory.getIpInfo = function(){
		return $http.get('http://ipinfo.io' );
	}


	return dataFactory;

}]);

ngColmexApp.service( 'service' , function(){

	var currentPage = '';
	var userObj = {};
	var audioObj = {};
	var aboutObj = {};
	var shareObj = {};
	var countryCodesObj = {};

	var setCurrentPage = function( str ){
		currentPage = str;
	}

	var getCurrentPage = function(){
		return currentPage;
	}

	var setUserObj = function( _userObj ){
		userObj = _userObj;
	}

	var getUserObj = function(){
		//if( debug && userObj.user_guid == undefined ) userObj.user_guid = 'ECE57831-06A7-4C2B-82AD-15A6AB033B72';
		return userObj;
	}

	var setAudioObj = function( _audioObj ){
		audioObj = _audioObj;
	}

	var getAudioObj = function(){
		return audioObj;
	}

	var setAboutObj = function( _aboutObj ){
		aboutObj = _aboutObj;
	}

	var getAboutObj = function(){
		return aboutObj;
	}

	var setShareObj = function( _shareObj ){
		shareObj = _shareObj;
	}

	var getShareObj = function(){
		return shareObj;
	}

	var setCountryCodesObj = function( _countryCodesObj ){
		countryCodesObj = _countryCodesObj;
	}

	var getCountryCodesObj = function(){
		return countryCodesObj;
	}




	return {
		setCurrentPage: setCurrentPage,
		getCurrentPage: getCurrentPage,

		setUserObj: setUserObj,
		getUserObj: getUserObj,

		setAudioObj: setAudioObj,
		getAudioObj: getAudioObj,

		setAboutObj: setAboutObj,
		getAboutObj: getAboutObj,

		setShareObj: setShareObj,
		getShareObj: getShareObj,

		setCountryCodesObj: setCountryCodesObj,
		getCountryCodesObj: getCountryCodesObj
	};

});
