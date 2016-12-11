// JavaScript Document

var controllers = {};

controllers.Grid = function( $scope , $rootScope , $timeout , $interval , dataFactory , service ){
	$scope.showGrid = {};
	$scope.partials = {};
	$scope.showLangBtn = false;

	var initInterval = $interval(function(){
		console.log('deviceInitComplete :: ' + deviceInitComplete);
		if( deviceInitComplete ){
			$interval.cancel(initInterval);
			checkLocale();
		}
	},50);
	
	if( deviceInitComplete ){
		$interval.cancel(initInterval);
		checkLocale();
	}


	function checkLocale(){
		if( onlyEnglish ){
			lang = 'en';
			$scope.showLangBtn = false;
			$scope.appInit();
			return;
		}
		dataFactory.getIpInfo( service.getUserObj() )
			.success(function ( data ) {
				countryInitObj = data;
				if( data.country.toLowerCase() == 'il' ){
					$scope.showLangBtn = true;
					lang = ( localStorage.getItem('lang') == null ||  localStorage.getItem('lang') == undefined ||  localStorage.getItem('lang') == 'undefined' ) ? 'he' : localStorage.getItem('lang');
				}else{
					lang = 'en';
				}
				$scope.appInit();
			})
			.error(function (error) {
				lang = 'en';
				$scope.appInit();
			});
	}

	$scope.appInit = function(){
		initComplete = true;
		localStorage.setItem('lang' , lang)

		$scope.partials.header = 'partials/' + lang + '/header.html';
		$scope.partials.footer = 'partials/' + lang + '/footer.html';
		$scope.partials.loading = 'partials/shared/loading.html';
		$scope.langEn = ( lang == 'en' ) ? true : false;
		if( $scope.langEn ){
			$('html').addClass('en');
		}else{
			$('html').removeClass('en');
		}
		$scope.userData = service.getUserObj();
		for(var key in deviceObj) {
			var value = deviceObj[key];
			$scope.userData[key] = value;
		}
		$scope.userData.language = lang;
		service.setUserObj( $scope.userData );
		$scope.userData.user_guid = localStorage.getItem('user_guid');

		user_guid = localStorage.getItem('user_guid');
		user_status = localStorage.getItem('user_status');

		$timeout(function(){
			if( user_guid == null ){
				location.href = '#/login';
			}else{
				if( user_status == null ){
					location.href = '#/activation';
				} else {
					location.href = '#/audio';
				}
			}
		},100);

	}



	$scope.changeLang = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'Change language to ' + lang );

		$scope.userData = service.getUserObj();
		$scope.langEn = ( lang == 'en' ) ? true : false;
		if( $scope.langEn ){
			$('html').addClass('en');
		}else{
			$('html').removeClass('en');
		}

		$scope.partials.header = 'partials/' + lang + '/header.html';
		$scope.partials.footer = 'partials/' + lang + '/footer.html';

		service.setAudioObj( {} );
		service.setAboutObj( {} );
		$scope.userData.language = lang;
		service.setUserObj( $scope.userData );

		dataFactory.changeLang( service.getUserObj() )
			.success(function ( data ) {
				location.href = '#/';
				location.href = '#/' + service.getCurrentPage();

				if( data == '0' ){
					debugger
					return;
				}

			})
			.error(function (error) {
				//if( !debug ) window.analytics.trackEvent('Audio guide', 'Flow', 'Audio guide load error');
				debugger
			});
	};

	$scope.$on('$includeContentLoaded' , function(){
		utils.replaceSvgImgs();
	});

	$scope.langBtnClick = function(){
		$scope.langOpen = ( $scope.langOpen ) ? false : true;
		if( $(event.currentTarget).attr('val') == lang ) return;
		lang = $(event.currentTarget).attr('val');
		localStorage.setItem('lang' , lang)
		$scope.changeLang();
	};

	$scope.headerClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'Header' );
		console.log('header click');
		if( localStorage.getItem('user_status') == null ) return;
		$scope.showSubMenu = false;
		location.href = "#/audio";
	};


	$scope.homeBtnClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'Home' );
		$scope.showSubMenu = false;
		location.href = "#/audio";
	};

	$scope.moreBtnClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'More' );
		$scope.showSubMenu = ( $scope.showSubMenu ) ? false : true;
	};

	$scope.callBtnClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'Call' );
		if(isIOS){
			window.open('tel:0732580080', '_system');
		}else{
			window.open('tel:*6046', '_system');
		}
	};

	$scope.tradeBtnClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'Trade form' );
		$scope.showSubMenu = false;
		location.href = "#/tradeForm";
	};

	$scope.aboutBtnClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'About' );
		$scope.showSubMenu = false;
		location.href = "#/about";
	};

	$scope.shareBtnClick = function(){
		sendEventAnalytics( 'Grid' , 'click' , 'Share' );
		var shareObj = service.getShareObj();

		if(isIOS) shareURL = shareObj.iosLink;
		if(isAndroid) shareURL = shareObj.androidLink;
		if( localStorage.getItem('lang') == 'he' ) shareTitle = shareObj.title;
		if( localStorage.getItem('lang') == 'en' ) shareTitle = shareObj.titleEn;

		window.plugins.socialsharing.share(
			shareTitle,
			'Tradology',
			'https://hooliganspro.co.il/colmex/podcastapp/page/01/images/share-icon.png',
			shareURL,
			function(result){
				debugger
			},
			function(result){
				debugger
			}
		);
	};

	$scope.reportBtnClick = function(){
		sendEventAnalytics('Grid', 'click', 'Report bug form' );
		$scope.showSubMenu = false;
		location.href = "#/report";
	};

	$scope.showLoading = function( msg ){
		$scope.loading_msg = msg;
		$scope.showGrid.loading = true;
	}

	$scope.hideLoading = function(){
		$scope.showGrid.fadeLoading = true;
		$timeout(function(){
			$scope.showGrid.loading = $scope.showGrid.fadeLoading = false;
		},250);
	}
};

controllers.Login = function( $scope , $sce , $timeout , dataFactory , service ){
	$scope.showGrid.header = true;
	$scope.showGrid.footer = false;
	service.setCurrentPage('login');
	$scope.$on('$viewContentLoaded', function(event) {
		utils.restrictFormInput();
	});
	$scope.userData = service.getUserObj();
	$scope.userData.language = ( $scope.userData.language == undefined ) ? 'he' : $scope.userData.language;
	$scope.validation = {};
	$scope.userData.approve= '1';

	$scope.countryCodes = {};

	if( utils.checkObjEmpty( service.getCountryCodesObj() ) ){
		dataFactory.getCountryCodes()
			.success(function ( data ) {
				$scope.countryCodes.list = [];
				for( var i = 0; i<data.countryCodes.length; i++){
					var country = utils.checkEnglish( data.countryCodes[i][0] ).toLowerCase();
					var countryCode = -1;
					$.grep( data.countryCodesNum, function(e){
						if( e.country_name.toLowerCase().split(' ').slice(0,2).join(' ') == country ){
							countryCode = e.country_code;
						}
					});
					//console.log('i :: ' + i + ', country :: ' + country);
					$scope.countryCodes.list[i] = {
						name: data.countryCodes[i][0],
						iso2: data.countryCodes[i][1],
						dialCode: data.countryCodes[i][2],
						priority: data.countryCodes[i][3] || 0,
						areaCodes: data.countryCodes[i][4] || null,
						countryCode: countryCode || -1
					};
				}

				$.get("http://ipinfo.io", function() {}, "jsonp")
					.always(function(resp) {
						$scope.countryCodes.geo = (resp && resp.country) ? resp.country : "";
						service.setCountryCodesObj( $scope.countryCodes );
						setCountriesSelect();
						$scope.$digest();
				});
			}).
			error(function( error ) {
				debugger
			});
	}else{
		setCountriesSelect();
	}

	function setCountriesSelect(){
		$scope.countryCodes = service.getCountryCodesObj();
		$('#phone').intlTelInput({
			autoPlaceholder: false,
			utilsScript: 'js/build/utils.js'
		});

		if( !$scope.countryCodes.selectedCountry ){
			for( var i=0; i<$scope.countryCodes.list.length; i++){
				if( $scope.countryCodes.list[i].iso2.toLowerCase() == $scope.countryCodes.geo.toLowerCase() ){
					$scope.countryCodes.selectedCountry = $scope.countryCodes.list[i];
					break;
				}
			}
		}
		$scope.userData.country = $scope.countryCodes.selectedCountry.name;
		$scope.userData.countryObj = $scope.countryCodes.selectedCountry;
		if( localStorage.getItem('lang') == 'en' ){
			if( !$scope.userData.phone || $scope.userData.phone.length < 8 ) $scope.userData.phone = '+' + $scope.countryCodes.selectedCountry.dialCode;
			var countryCode = $scope.countryCodes.selectedCountry.iso2.toLowerCase();
		} else {
			if( !$scope.userData.phone || $scope.userData.phone.length < 8 ) $scope.userData.phone = '';
			countryCode = 'il';
		}
		$('#phone').val( $scope.userData.phone );
		$('#phone').intlTelInput('setCountry', countryCode );
	}

	if( $scope.userData.gender != undefined ){
		if( $scope.userData.gender == 'male' ) $("#gender-male").prop("checked", true);
		if( $scope.userData.gender == 'female' ) $("#gender-female").prop("checked", true);
	}

	for(var key in deviceObj) {
		var value = deviceObj[key];
		$scope.userData[key] = value;
	}

	$scope.updateCountry = function(){
		$scope.userData.country = $scope.countryCodes.selectedCountry.name;
		$scope.userData.countryObj = $scope.countryCodes.selectedCountry;
		if( localStorage.getItem('lang') == 'en' ){
			$scope.userData.phone = '+' + $scope.countryCodes.selectedCountry.dialCode;
			var countryCode = $scope.countryCodes.selectedCountry.iso2.toLowerCase();
		} else {
			countryCode = 'il';
		}
		$('#phone').val( $scope.userData.phone );
		$('#phone').intlTelInput('setCountry', countryCode );
	}

	$scope.fbConnectClick = function(){

		msg = ( localStorage.getItem('lang') == 'he' ) ? 'מתחבר לפייסבוק' : 'connecting to facebook';
		$scope.showLoading( msg );

		sendEventAnalytics('Login form', 'click', 'Facebook connect' );
		var fbLoginSuccess = function (userData) {

			facebookConnectPlugin.api( userData.authResponse.userID+'/?fields=first_name,last_name,id,email', ['email'], function (result) {
					console.log('fb result :: ' + JSON.parse(JSON.stringify(result)));

					sendEventAnalytics('Login form', 'flow', 'Facebook connect success');
					$scope.hideLoading();

					$scope.userData.facebookId = result.id;
					$scope.userData.email = result.email;
					$scope.userData.fname = result.first_name;
					$scope.userData.lname = result.last_name;
					$scope.$digest();
				},
				function (error) {
					sendEventAnalytics('Login form', 'flow', 'Facebook connect error');
					$scope.hideLoading();

					msg = ( localStorage.getItem('lang') == 'he' ) ? 'ההתחברות נכשלה' : 'The connection failed';
					$scope.showLoading( msg );
					$timeout(function(){ $scope.hideLoading },2000);
			});
		}
		facebookConnectPlugin.login( ['public_profile','email'], fbLoginSuccess, function(error){
			sendEventAnalytics('Login form', 'flow', 'Facebook connect error');
			$scope.hideLoading();

			msg = ( localStorage.getItem('lang') == 'he' ) ? 'ההתחברות נכשלה' : 'The connection failed';
			$scope.showLoading( msg );
			$timeout(function(){ $scope.hideLoading },2000);
		});

	};

	$scope.loginClick = function(){
		service.setUserObj( $scope.userData );
		sendEventAnalytics('Login form', 'click', 'send' );

		if( formValid() ){

			$scope.userData.appsFlyer_id = appsFlyerObj.user_id;
			$scope.userData.media_source = appsFlyerObj.media_source;
			$scope.userData.campaign = appsFlyerObj.campaign;
			$scope.userData.countryObj = JSON.stringify( $scope.userData.countryObj );

			console.log('send data login');
			sendEventAnalytics('Login form', 'flow', 'send start');
			$scope.userData.gender = ( $("input:radio[name=gender]:checked").val() == undefined ) ? 'male' : $("input:radio[name=gender]:checked").val();

			msg = ( localStorage.getItem('lang') == 'he' ) ? 'שולח טופס' : 'sending form';
			$scope.showLoading( msg );

			debugger

			dataFactory.sendUser( $scope.userData )
				.success(function ( data ) {
					sendEventAnalytics('Login form', 'flow', 'send success');
					sendAppsflyerEvent( 'Login form' , $scope.userData );
					$timeout(function(){ $scope.hideLoading(); } , 500 );
					user_guid = $scope.userData.user_guid = data;
					localStorage.setItem( 'user_guid' , data );
					location.href = "#/activation";
				}).
				error(function( error ) {
					sendEventAnalytics('Login form', 'flow', 'send error');
					msg = ( localStorage.getItem('lang') == 'he' ) ? 'השליחה נכשלה.<br>אנא נסו שוב מאוחר יותר' : 'There was an error sending the form.<br>Please try againg later';
					$scope.showLoading( msg );
					$timeout(function(){ $scope.hideLoading(); } , 4000 );
				});

		}
	};

	function formValid(){
		$scope.validation = {};
		if( $scope.userData.fname == '' || $scope.userData.fname == undefined ){
			$scope.validation.fnameErr = true;
			$scope.validation.fnameErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש להזין שם פרטי') : $sce.trustAsHtml('please enter first name');
		}
		if( $scope.userData.lname == '' || $scope.userData.lname == undefined ){
			$scope.validation.lnameErr = true;
			$scope.validation.lnameErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש להזין שם משפחה') : $sce.trustAsHtml('please enter last name');
		}
		if( $scope.userData.email == '' || $scope.userData.email == undefined ){
			$scope.validation.emailErr = true;
			if( $('#user-mail').val() == '' ){
				$scope.validation.emailErr_txt = ( localStorage.getItem('lang') == 'he' )
				? $sce.trustAsHtml('יש להזין מייל') : $sce.trustAsHtml('please enter email');
			}else{
				$scope.validation.emailErr_txt = ( localStorage.getItem('lang') == 'he' )
				? $sce.trustAsHtml('כתובת המייל אינה חוקית') : $sce.trustAsHtml('email address is not valid');
			}
		}
		$scope.userData.phone = $('#phone').val();
		if( $scope.userData.phone == '' || $scope.userData.phone == undefined ){
			$scope.validation.phoneErr = true;
			$scope.validation.phoneErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש להזין מספר טלפון') : $sce.trustAsHtml('please enter phone number');
		} else {
			if( !$("#phone").intlTelInput("isValidNumber") && ($('#phone').val() != '0555555555')/*APPLE DEVELOPERS*/ ) {
				$scope.validation.phoneErr_txt = ( localStorage.getItem('lang') == 'he' )
				? $sce.trustAsHtml('מספר הטלפון אינו תקין') : $sce.trustAsHtml('phone number is invalid');
			}
		}
		if( $scope.userData.approve == '0' || $scope.userData.approve == undefined ){
			$scope.validation.cbErr = true;
			$scope.validation.cbErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש לאשר קבלת חומרים פרסומיים מחברת Colmex') : $sce.trustAsHtml('please agree to receive learning and advertising materials from Colmex');
		}
		if( utils.checkObjEmpty( $scope.validation ) ) return true;
	}

};

controllers.Activation = function( $scope , $sce , $timeout , dataFactory , service ){
	$scope.showGrid.header = true;
	$scope.showGrid.footer = false;
	service.setCurrentPage('activation');
	$scope.$on('$viewContentLoaded', function(event) {
		utils.restrictFormInput();
	});

	$scope.userData = service.getUserObj();
	$scope.validation = $scope.activation = {};

	if( $scope.userData.fname == undefined ){
		dataFactory.getUserProfile( localStorage.getItem('user_guid') )
			.success(function ( data ) {
				debugger
				//json.parse
				$scope.userData = data[0];
				service.setUserObj( $scope.userData );
			}).
			error(function( error ) {
				debugger
			});
	}

	$scope.resendSMS = function(){
		sendEventAnalytics('Activation form', 'click', 'resend SMS' );
		msg = ( localStorage.getItem('lang') == 'he' ) ? 'שולח קוד חדש' : 'sending a new code';
		$scope.showLoading( msg );

		dataFactory.resendSms( service.getUserObj() )

			.success(function ( data ) {
				$scope.form_return_msg = ( localStorage.getItem('lang') == 'he' ) ? $sce.trustAsHtml('קוד חדש נשלח אליך') : $sce.trustAsHtml('A new code has been sent');
			}).
			error(function( error ) {
				$scope.form_return_msg = ( localStorage.getItem('lang') == 'he' ) ? $sce.trustAsHtml('יש בעייה עם שליחת קוד חדש.<br>אנא נסו שוב מאוחר יותר') : $sce.trustAsHtml('There was an error sending a new code.<br>Please try again later.');
			});
			$timeout(function(){

				$scope.showThanks = true;
				$scope.hideLoading();
				$timeout(function(){
					$scope.showThanks = false;
				},3000);
			},1000);

	}

	$scope.backgToLoginClick = function(){
		sendEventAnalytics('Activation form', 'click', 'back to login' );
		location.href = "#/login";
	}

	$scope.smsSubmitClick = function(){
		sendEventAnalytics('Activation form', 'click', 'send' );
		$scope.validation = {};
		if( $scope.activation.sms == '' || $scope.activation.sms == undefined ){
			sendErr();
		}else if( $scope.activation.sms.length < 6 ){
			sendErr();
		}

		if( utils.checkObjEmpty( $scope.validation ) ){
			sendEventAnalytics('Activation form', 'flow', 'send start');

			msg = ( localStorage.getItem('lang') == 'he' ) ? 'מאמת קוד' : 'verifying Code';
			$scope.showLoading( msg );

			if( debug && $scope.activation.sms == '123456' ){
				localStorage.setItem('user_status' , 'logged_in');
				$timeout(function(){ location.href = "#/audio"; } , 800);
				return;
			}

			dataFactory.checkSms( service.getUserObj() , $scope.activation.sms )
				.success(function ( data ) {

					if( data == '1' ){
						sendEventAnalytics('Activation form', 'flow', 'send success');
						sendAppsflyerEvent( 'Activation' , $scope.userData );
						localStorage.setItem('user_status' , 'logged_in');
						$timeout(function(){ location.href = "#/audio"; } , 800);
					}
					if( data == '0' ){
						sendEventAnalytics('Activation form', 'flow', 'send error, sms not valid');
						$timeout(function(){ $scope.hideLoading(); } , 500 );
						$scope.validation.smsErr = true;
						$scope.validation.smsErr_txt = ( localStorage.getItem('lang') == 'he' )
						? $sce.trustAsHtml('הקוד שהזנת שגוי') : $sce.trustAsHtml('the code is invalid');
					}
				}).
				error(function( error ) {
					sendEventAnalytics('Activation form', 'flow', 'send error');
					msg = ( localStorage.getItem('lang') == 'he' ) ? 'השליחה נכשלה.<br>אנא נסו שוב מאוחר יותר' : 'There was an error sending the form.<br>Please try againg later';
					$scope.showLoading( msg );
					$timeout(function(){ $scope.hideLoading(); } , 4000 );
				});
		}

	};

	function sendErr(){
		$scope.validation.smsErr = true;
		$scope.validation.smsErr_txt = ( localStorage.getItem('lang') == 'he' )
		? $sce.trustAsHtml('יש להזין קוד בן 6 ספרות') : $sce.trustAsHtml('please enter 6 digit code');
	}
};

controllers.TradeForm = function( $scope , $sce , $timeout , dataFactory , service ){
	$scope.showGrid.header = $scope.showGrid.footer = true;
	service.setCurrentPage('tradeForm');
	$scope.tradeForm = {};
	$scope.countryCodes = {};
	debugger
	for(var key in service.getUserObj()) {
		var value = service.getUserObj()[key];
		$scope.tradeForm[key] = value;
	}
	$scope.tradeForm.approve = '1';


	if( utils.checkObjEmpty( service.getCountryCodesObj() ) ){
		dataFactory.getCountryCodes()
			.success(function ( data ) {
				$scope.countryCodes.list = [];
				for( var i = 0; i<data.countryCodes.length; i++){
					$scope.countryCodes.list[i] = {
						name: data.countryCodes[i][0],
						iso2: data.countryCodes[i][1],
						dialCode: data.countryCodes[i][2],
						priority: data.countryCodes[i][3] || 0,
						areaCodes: data.countryCodes[i][4] || null
					};
				}
				service.setCountryCodesObj( $scope.countryCodes );
				$scope.countryCodes.selectedCountry = $scope.tradeForm.countryObj;
				setCountriesSelect();
			}).
			error(function( error ) {
				debugger
			});
	}else{
		setCountriesSelect();
	}

	function setCountriesSelect(){
		$scope.countryCodes = service.getCountryCodesObj();

		$('#phone').intlTelInput({
			autoPlaceholder: false,
			utilsScript: 'js/build/utils.js'
		});

		$scope.tradeForm.country = $scope.countryCodes.selectedCountry.name;
		$scope.tradeForm.countryObj = $scope.countryCodes.selectedCountry;
		if( localStorage.getItem('lang') == 'en' ){
			var countryCode = $scope.countryCodes.selectedCountry.iso2.toLowerCase();
		} else {
			countryCode = 'il';
		}
		$('#phone').val( $scope.tradeForm.phone );
		$('#phone').intlTelInput('setCountry', countryCode );
	}

	$scope.updateCountry = function(){
		$scope.tradeForm.country = $scope.countryCodes.selectedCountry.name;
		$scope.tradeForm.countryObj = $scope.countryCodes.selectedCountry;
		if( localStorage.getItem('lang') == 'en' ){
			$scope.tradeForm.phone = '+' + $scope.countryCodes.selectedCountry.dialCode;
			var countryCode = $scope.countryCodes.selectedCountry.iso2.toLowerCase();
		} else {
			countryCode = 'il';
		}
		$('#phone').val( $scope.tradeForm.phone );
		$('#phone').intlTelInput('setCountry', countryCode );
	}

	$scope.submitFormClick = function(){
		sendEventAnalytics('Trade form', 'click', 'send' );
		console.log( $scope.tradeForm );
		if( formValid() ){

			$scope.tradeForm.countryObj = JSON.stringify( $scope.tradeForm.countryObj );
			msg = ( localStorage.getItem('lang') == 'he' ) ? 'שולח טופס' : 'sending form';
			$scope.showLoading( msg );

			console.log('send data lead');
			$scope.tradeForm.is_guide = '0';
			sendEventAnalytics('Trade form', 'flow', 'send start' );

			dataFactory.sendForm( $scope.tradeForm )
				.success(function ( data ) {
					sendEventAnalytics('Trade form', 'flow', 'send success' );
					sendAppsflyerEvent( 'Trade form' , $scope.userData );
					$timeout(function(){
						$scope.hideLoading();
						$timeout(function(){ location.href = "#/audio"; } , 4000);
					} , 1000);
					if( data == '1' ){
						//success
						$scope.form_return_msg = ( localStorage.getItem('lang') == 'he' ) ? $sce.trustAsHtml('תודה,<br>הטופס נשלח') : $sce.trustAsHtml('Thanks, <br>The form has been submited');
						$scope.showThanks = true;
					} else {
						$scope.form_return_msg = ( localStorage.getItem('lang') == 'he' ) ? $sce.trustAsHtml('תקלה בשליחת הטופס,<br>אנא נסו שוב מאוחר יותר') : $sce.trustAsHtml('There was as error sending the form, <br>Please try again later');
						$scope.showThanks = true;
					}
				}).
				error(function( error ) {
					sendEventAnalytics('Trade form', 'flow', 'send error' );
					msg = ( localStorage.getItem('lang') == 'he' ) ? 'השליחה נכשלה.<br>אנא נסו שוב מאוחר יותר' : 'There was an error sending the form.<br>Please try againg later';
					$scope.showLoading( msg );
					$timeout(function(){ $scope.hideLoading(); } , 4000 );
				});

		}
	}

	function formValid(){
		$scope.validation = {};
		if( $scope.tradeForm.fname == '' || $scope.tradeForm.fname == undefined ){
			$scope.validation.fnameErr = true;
			$scope.validation.fnameErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש להזין שם פרטי') : $sce.trustAsHtml('please enter first name');
		}
		if( $scope.tradeForm.lname == '' || $scope.tradeForm.lname == undefined ){
			$scope.validation.lnameErr = true;
			$scope.validation.lnameErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש להזין שם משפחה') : $sce.trustAsHtml('please enter last name');
		}
		if( $scope.tradeForm.email == '' || $scope.tradeForm.email == undefined ){
			$scope.validation.emailErr = true;
			if( $('#user-mail').val() == '' ){
				$scope.validation.emailErr_txt = ( localStorage.getItem('lang') == 'he' )
				? $sce.trustAsHtml('יש להזין מייל') : $sce.trustAsHtml('please enter email');
			}else{
				$scope.validation.emailErr_txt = ( $scope.tradeForm.language == 'he' )
				? $sce.trustAsHtml('כתובת המייל אינה חוקית') : $sce.trustAsHtml('email address is not valid');
			}
		}

		$scope.tradeForm.phone = $('#phone').val();
		if( $scope.tradeForm.phone == '' || $scope.tradeForm.phone == undefined ){
			$scope.validation.phoneErr = true;
			$scope.validation.phoneErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש להזין מספר טלפון') : $sce.trustAsHtml('please enter phone number');
		} else {
			if( !$("#phone").intlTelInput("isValidNumber") ) {
				$scope.validation.phoneErr_txt = ( localStorage.getItem('lang') == 'he' )
				? $sce.trustAsHtml('מספר הטלפון אינו תקין') : $sce.trustAsHtml('phone number is invalid');
			}
		}
		if( $scope.tradeForm.approve == '0' || $scope.tradeForm.approve == undefined ){
			$scope.validation.cbErr = true;
			$scope.validation.cbErr_txt = ( localStorage.getItem('lang') == 'he' )
			? $sce.trustAsHtml('יש לאשר קבלת חומרים פרסומיים מחברת Colmex') : $sce.trustAsHtml('please agree to receive learning and advertising materials from Colmex');
		}
		if( utils.checkObjEmpty( $scope.validation ) ) return true;
	}

};

controllers.Report = function( $scope ,$sce , $timeout , dataFactory , service ){
	$scope.showGrid.header = $scope.showGrid.footer = true;
	service.setCurrentPage('report');
	$scope.reportForm = {};
	$scope.validation = {};
	$scope.device_details = $sce.trustAsHtml('os: ' + deviceObj.os + '<br>model: ' + deviceObj.model + '<br>Version: ' + deviceObj.version + '<br>manufacturer : ' + deviceObj.manufacturer);
	$scope.reportForm.device = 'os: ' + deviceObj.os + ', model: ' + deviceObj.model + ', Version: ' + deviceObj.version + ', manufacturer : ' + deviceObj.manufacturer

	for(var key in deviceObj) {
		var value = deviceObj[key];
		$scope.reportForm[key] = value;
	}

	for(var key in service.getUserObj() ) {
		var value = service.getUserObj()[key];
		$scope.reportForm[key] = value;
	}

	$scope.submitFormClick = function(){

		sendEventAnalytics('Report bug form', 'click', 'send' );

		$scope.validation = {};
		if( $scope.reportForm.comments == '' || $scope.reportForm.comments == undefined ){
			$scope.validation.reportErr = true;
			$scope.validation.reportErr_txt = ( service.getUserObj().language == 'he' )
			? $sce.trustAsHtml('יש לפרט את הבעייה') : $sce.trustAsHtml('please describe the issue');
		}

		if( utils.checkObjEmpty( $scope.validation ) ){
			sendEventAnalytics('Report bug form', 'flow', 'send start' );

			msg = ( localStorage.getItem('lang') == 'he' ) ? 'שולח טופס' : 'sending form';
			$scope.showLoading( msg );

			console.log('send data report');

			dataFactory.sendReport( $scope.reportForm )
				.success(function ( data ) {
					sendEventAnalytics('Report bug form', 'flow', 'send success' );
					$timeout(function(){
						$scope.hideLoading();
						$timeout(function(){ location.href = "#/audio"; } , 4000);
					} , 1000);
					if( data == '1' ){
						//success
						$scope.form_return_msg = ( localStorage.getItem('lang') == 'he' ) ? $sce.trustAsHtml('תודה,<br>הטופס נשלח') : $sce.trustAsHtml('Thanks, <br>The form has been submited');
						$scope.showThanks = true;
					} else {
						$scope.form_return_msg = ( localStorage.getItem('lang') == 'he' ) ? $sce.trustAsHtml('תקלה בשליחת הטופס,<br>אנא נסו שוב מאוחר יותר') : $sce.trustAsHtml('There was as error sending the form, <br>Please try again later');
						$scope.showThanks = true;
					}
				}).
				error(function( error ) {
					sendEventAnalytics('Report bug form', 'flow', 'send error' );
					msg = ( localStorage.getItem('lang') == 'he' ) ? 'השליחה נכשלה.<br>אנא נסו שוב מאוחר יותר' : 'There was an error sending the form.<br>Please try againg later';
					$scope.showLoading( msg );
					$timeout(function(){ $scope.hideLoading(); } , 4000 );
				});
		}
	}
};

controllers.About = function( $scope , $sce , dataFactory , service ){
	$scope.showGrid.header = $scope.showGrid.footer = true;
	service.setCurrentPage('about');

	$scope.content = '';

	if( utils.checkObjEmpty( service.getAboutObj() ) ){
		dataFactory.getAbout( service.getUserObj() )
			.success(function ( data ) {
				service.setAboutObj( data[0] );
				$scope.content = $sce.trustAsHtml( data[0].text );

				if( data == '0' ){
					debugger
					return;
				}
			})
			.error(function (error) {
				//if( !debug ) window.analytics.trackEvent('Audio guide', 'Flow', 'Audio guide load error');
				debugger
			});
	} else {
		$scope.content = $sce.trustAsHtml( service.getAboutObj().text );
	}
};

controllers.Audio = function( $scope , $timeout , $interval , $sce , dataFactory , service ){
	$scope.showGrid.header = $scope.showGrid.footer = true;
	service.setCurrentPage('audio');

	var audio = $('#audio-ui audio').get(0);
	var timerInterval,
		bookTimer;

	$scope.audioGuides = {};
	$scope.audioStatus = {};
	$scope.audioPlayerParams = {};
	$scope.onAudioPause;


	$scope.$on('$viewContentLoaded', function(event) {
		utils.replaceSvgImgs();
	});

	if( utils.checkObjEmpty( service.getAudioObj() ) ){
		loadAudioTree();
	}else{
		$scope.audioGuides = service.getAudioObj();
		updateParams();
	}

	function loadAudioTree(){
		sendEventAnalytics('Audio', 'flow', 'load guides start' );
		msg = ( localStorage.getItem('lang') == 'he' ) ? 'המדריך בטעינה' : 'loading guides';
		$scope.showLoading( msg );

		dataFactory.getAudioTree( service.getUserObj() )
			.success(function ( data ) {
				sendEventAnalytics('Audio', 'flow', 'load guides success' );
				data[0].userProfile[0].countryObj = JSON.parse( data[0].userProfile[0].countryObj );
				service.setUserObj( data[0].userProfile[0] );
				service.setAudioObj( data[1].audioObj );
				$scope.audioGuides = data[1].audioObj;
				service.setShareObj( data[2].link[0] );

				if(isIOS){
					dataFactory.clearBadge( service.getUserObj() )
						.success(function ( data ) {
							console.log('clear badge success');
						})
						.error(function (error) {
							debugger
							//$scope.status = 'Unable to load customer data: ' + error.message;
						});
				}

				updateParams();
				$timeout(function(){ $scope.hideLoading(); } , 1000);

				if( data == '0' ){
					debugger
					return;
				}

			})
			.error(function (error) {
				sendEventAnalytics('Audio', 'flow', 'load guides error' );
				debugger
			});
	}

	function updateParams(){
		angular.forEach( $scope.audioGuides , function( guide , guide_index ){
			if( guide.status == '0' ) guide.soon = true;
			if( guide.last_audio_pos != '' ) guide.hasLastPos = true;
			guide.bg_img = urlBase + '/Areas/uploads/' + guide.img_url;
			var guid_complete_time = 0;

			angular.forEach( guide.children , function( chapter , chapter_index ){
				if(chapter.is_Complete == '1') guid_complete_time += parseInt( chapter.audio_length );
				var chapter_complete_time = 0;

				angular.forEach( chapter.children , function( audio , index ){
					if(audio.is_Complete == '1'){
						chapter_complete_time += parseInt( audio.audio_length );
						audio.isComplete = true;
					}
				});

				$scope.audioGuides[guide_index].children[chapter_index].complete_time = chapter_complete_time;
			});

			$scope.audioGuides[guide_index].complete_time = guid_complete_time;
		});

		$timeout( function(){
			utils.findWALLST();
			utils.replaceSvgImgs();
		});
	}

	$scope.formatTime = function( time ){
		return utils.formatTime(parseInt(time)/1000);
	}

	$scope.playLastPosClick = function( guide ){
		sendEventAnalytics('Audio', 'click', 'play last position' );
		var _audioPosArr = guide.last_audio_pos.toLowerCase().split(',');
		for( var i=0; i<guide.children.length; i++){
			if( guide.children[i].audio_guid == _audioPosArr[1] ){
				$scope.audioPlayerParams.chapter = guide.children[i];
				for(var k=0; k<guide.children[i].children.length; k++){
					if( guide.children[i].children[k].audio_guid == _audioPosArr[2] ){
						$scope.audioPlayerParams.audio = guide.children[i].children[k];
						break;
					}
				}
				break;
			}
		}
		$scope.audioPlayerParams.guide = guide;
		$scope.audioPlayerParams.start_time = _audioPosArr[3];
		prepAudioParams();
		startAudioFile();
	}

	$scope.parentClick = function( guide , chapter ){
		if( $(event.currentTarget).hasClass('soon') ) return;
		$(event.currentTarget.parentElement).toggleClass('open');
		if( !$(event.currentTarget.parentElement).hasClass('open') ){
			$(event.currentTarget.parentElement).find('li').removeClass('open');
		}else{
			$timeout(function( obj ){
				if( $(obj.target).hasClass('chapter-btn') ) {
					sendEventAnalytics('Audio', 'click', 'Chapter button ' + guide.title + '/' + chapter.title );
					$('#guide-ui .scroll-content').animate({ scrollTop : parseInt( $(obj.target).position().top ) + parseInt( $('.guide-btn').outerHeight() ) } , 200 );
				}else{
					sendEventAnalytics('Audio', 'click', 'Guide button ' + guide.title );
				}
			},10 , true , { target : $(event.currentTarget) , guide : guide , chapter : chapter } );
		}
	};

	$scope.audioBtnClick = function( guideObj , chapterObj , audioObj ){
		sendEventAnalytics('Audio', 'click', 'Audio button ' + guideObj.title + '/' + chapterObj.title + '/' + audioObj.title );
		$scope.audioPlayerParams.guide = guideObj;
		$scope.audioPlayerParams.chapter = chapterObj;
		$scope.audioPlayerParams.audio = audioObj;
		$scope.audioPlayerParams.start_time = 0;
		prepAudioParams();
		startAudioFile();
	}

	function prepAudioParams(){
		$scope.audioPlayerParams.total_time = $scope.formatTime( $scope.audioPlayerParams.audio.audio_length );
		$scope.audioPlayerParams.firstTrack = $scope.audioPlayerParams.lastTrack = false;
		if( $scope.audioPlayerParams.chapter.index == 0 && $scope.audioPlayerParams.audio.index == 0 ) $scope.audioPlayerParams.firstTrack = true;
		if( $scope.audioPlayerParams.chapter.index == $scope.audioPlayerParams.guide.children.length-1 && $scope.audioPlayerParams.audio.index == $scope.audioPlayerParams.chapter.children.length-1 ) $scope.audioPlayerParams.lastTrack = true;
		$scope.audioStatus.onAudio = $scope.showGrid.slideHeader = $scope.showGrid.slideFooter = true;
		if( $scope.audioPlayerParams.guide.bookObj  == undefined ){
			loadBook();
		} else {
			scrollBookToChapter();
		}
	}

	function loadBook(){

		sendEventAnalytics('Audio', 'flow', 'load book ' + $scope.audioPlayerParams.guide.title + 'start' );

		dataFactory.getBook( $scope.audioPlayerParams.guide.audio_guid )
			.success(function ( data ) {
				sendEventAnalytics('Audio', 'flow', 'load book ' + $scope.audioPlayerParams.guide.title + 'sucess' );
				$scope.audioPlayerParams.guide.bookObj = data[0];
				angular.forEach( $scope.audioPlayerParams.guide.bookObj.chapters , function( chapter , index ){
					chapter.title = $sce.trustAsHtml(chapter.title);
					angular.forEach( chapter.chapters , function( sub_chapter , sub_index ){
						sub_chapter.title = $sce.trustAsHtml(sub_chapter.title);
						sub_chapter.text = $sce.trustAsHtml(sub_chapter.text);
					});
				});

				$timeout( function(){
					utils.findWALLST();
					scrollBookToChapter();
				});

				if( data == '0' ){
					debugger
					return;
				}

			})
			.error(function (error) {
				sendEventAnalytics('Audio', 'flow', 'load book ' + $scope.audioPlayerParams.guide.title + 'error' );
				debugger
			});
	}

	function scrollBookToChapter(){
		$('#audio-book').scrollTop(0);
		var curSection = $('#audio-book .book-chapter' ).eq($scope.audioPlayerParams.chapter.index).find('.sub-chapter').eq($scope.audioPlayerParams.audio.index);

		bookTimer = $timeout(function(){
			var lastScrollPos = $('#audio-book').scrollTop();
			$('#audio-book').scrollTop(0);
			var scrollPos = (isIOS) ? $(curSection).offset().top - 110 : $(curSection).offset().top - 90;
			$('#audio-book').scrollTop( lastScrollPos );
			speed = ( (Math.abs( scrollPos - lastScrollPos ) / 5) < 600 ) ? 600 : (Math.abs( scrollPos - lastScrollPos ) / 5);
			$('#audio-book').animate({ scrollTop : scrollPos } , speed );
		},3000);
	}

	$scope.bookChapterClick = function(){
		sendEventAnalytics('Audio', 'click', 'book chapter' );
		$('#audio-book').scrollTop(0);
		$('#audio-book').scrollTop( $('#audio-book').find('#' + $(event.currentTarget).attr('link')).offset().top - 90 );
	}

	$scope.stopAudio = function(){
		audio.pause();
		$(audio).unbind('ended');
		if( timerInterval ) $interval.cancel(timerInterval);
		if( bookTimer ) $timeout.cancel(bookTimer);
		document.getElementById('audio-element').removeEventListener( 'loadedmetadata' , onAudioStart );
	}

	$scope.backBtnClick = function(){
		sendEventAnalytics('Player', 'click', 'Back to guide');
		$scope.sendCurrentPos();
		$scope.stopAudio();
		$scope.audioStatus.onAudio = $scope.showGrid.slideHeader = $scope.showGrid.slideFooter = false;
	}

	$scope.scrubTime = function($event){
		sendEventAnalytics('Player', 'click', 'Scrub time');
		var per = $event.coords.start.x / parseFloat( $('#audio-status-bar').outerWidth() );
		audio.currentTime = audio.duration * per;
		if( $scope.onAudioPause ) $scope.$digest();
		$('body').bind('touchmove mousemove',function( e ){
			if( $('html').hasClass('mobile-device') ){
				var touch = event.touches[0];
				clientX = touch.pageX;
			}else{
				clientX = event.clientX;
			}
			var per = clientX / parseFloat( $('#audio-status-bar').outerWidth() );
			audio.currentTime = audio.duration*per;
			onAudioPlaying();
			$scope.$digest();
		});
		$('body').bind('touchend mouseup',function(){
			$('body').unbind('touchmove mousemove touchend mouseup');
		});
	}

	$scope.togglePlayClick = function(){
		if( $scope.onAudioPause ){
			sendEventAnalytics('Player', 'click', 'Play');
			audio.play();
			timerInterval = $interval( onAudioPlaying , 100 );
			$scope.onAudioPause = false;
		}else{
			sendEventAnalytics('Player', 'click', 'Pause');
			$scope.sendCurrentPos();
			audio.pause();
			$interval.cancel(timerInterval);
			$scope.onAudioPause = true;
		}
	}

	$scope.nextChapterClick = function(){
		sendEventAnalytics('Player', 'click', 'Next chapter');
		$scope.stopAudio();
		if( $scope.audioPlayerParams.audio.index < $scope.audioPlayerParams.chapter.children.length-1 ){
			$scope.audioPlayerParams.audio = $scope.audioPlayerParams.chapter.children[ $scope.audioPlayerParams.audio.index + 1 ];
		}else{
			$scope.audioPlayerParams.chapter = $scope.audioPlayerParams.guide.children[ $scope.audioPlayerParams.chapter.index + 1 ];
			$scope.audioPlayerParams.audio = $scope.audioPlayerParams.chapter.children[ 0 ];
		}
		$scope.audioPlayerParams.start_time = 0;
		prepAudioParams();
		startAudioFile();
	}

	$scope.prevChapterClick = function(){
		sendEventAnalytics('Player', 'click', 'Previous chapter');
		$scope.stopAudio();
		if( $scope.audioPlayerParams.audio.index > 0 ){
			$scope.audioPlayerParams.audio = $scope.audioPlayerParams.chapter.children[ $scope.audioPlayerParams.audio.index - 1 ];
		}else{
			$scope.audioPlayerParams.chapter = $scope.audioPlayerParams.guide.children[ $scope.audioPlayerParams.chapter.index - 1 ];
			$scope.audioPlayerParams.audio = $scope.audioPlayerParams.chapter.children[ $scope.audioPlayerParams.chapter.children.length - 1 ];
		}
		$scope.audioPlayerParams.start_time = 0;
		prepAudioParams();
		startAudioFile();
	}

	$scope.next30secClick = function(){
		sendEventAnalytics('Player', 'click', 'Ff 30 seconds');
		audio.currentTime = audio.currentTime + 30;
		if( $scope.onAudioPause ) $scope.togglePlayClick();
	}

	$scope.prev30secClick = function(){
		sendEventAnalytics('Player', 'click', 'Rw 30 seconds');
		audio.currentTime = audio.currentTime - 30;
		if( $scope.onAudioPause ) $scope.togglePlayClick();
	}

	$scope.sendCurrentPos = function(){
		$scope.audioPlayerParams.guide.last_audio_pos = $scope.audioPlayerParams.guide.audio_guid + ',' + $scope.audioPlayerParams.chapter.audio_guid + ',' + $scope.audioPlayerParams.audio.audio_guid + ',' + audio.currentTime;

		dataFactory.sendCurrentPos( service.getUserObj() , $scope.audioPlayerParams.audio.audio_guid , audio.currentTime )
			.success(function (data) {
				console.log('audio current pos success');
			})
			.error(function (error) {
				debugger
			});
	}

	$(document).bind('onAppPause' , function(){
		console.log('app pause');
		if( $scope.audioStatus.onAudio ){
			$scope.sendCurrentPos();
		}
	});

	function startAudioFile(){
		$('#audio-status-bar .load-bar , #audio-status-bar .prog-bar').css('width' , '0%' );
		$('#audio-status-bar .scrubber').css({ 'left' : '0%' , 'margin-left' : '0px' });
		$scope.onAudioPause = false;
		$scope.audio_src = $sce.trustAsResourceUrl( urlBase + '/Areas/uploads/' + $scope.audioPlayerParams.audio.audio_url );
		$timeout(function(){
			audio.load();
			console.log( 'start time :: ' + $scope.audioPlayerParams.start_time );

			document.getElementById('audio-element').addEventListener( 'loadedmetadata' , onAudioStart );

		});
	}

	function onAudioStart(){
		console.log('audio start');
		audio.play();
		audio.currentTime = $scope.audioPlayerParams.start_time;

		timerInterval = $interval( onAudioPlaying , 100 );
		$(audio).bind('ended', function() {
			onAudioComplete();
		});
	}

	function onAudioPlaying(){
		//console.log('audio playing');
		audio.play();
		$scope.audioPlayerParams.cur_time = $scope.formatTime( audio.currentTime*1000 );
		$('#audio-status-bar .load-bar').css('width' , ( (audio.buffered.end(0) / audio.duration) * 100 ) + '%' );
		$('#audio-status-bar .prog-bar').css('width' , ( (audio.currentTime / audio.duration) * 100 ) + '%' );
		$('#audio-status-bar .scrubber').css({
			'left' : (audio.currentTime / audio.duration) * 100 + '%',
			'margin-left' : - (audio.currentTime / audio.duration) * 20 + 'px'
		});
	}

	function onAudioComplete(){
		sendEventAnalytics('Player', 'flow', 'Audio complete ' + $scope.audioPlayerParams.guide.title + '/' + $scope.audioPlayerParams.chapter.title + '/' + $scope.audioPlayerParams.audio.title );
		$scope.stopAudio();
		$scope.audioPlayerParams.audio.is_Complete = '1';

		var completeStatus = 'guide ' + ( $scope.audioPlayerParams.guide.index + 1 ) + ', chapter ' + ( $scope.audioPlayerParams.chapter.index + 1 ) + ', audio ' + ( $scope.audioPlayerParams.audio.index + 1 );

		dataFactory.sendAudioComplete( service.getUserObj() , $scope.audioPlayerParams.audio.audio_guid , '0' , 'audio complete, ' + completeStatus )
			.success(function (data) {
				console.log('audio complete success');
			})
			.error(function (error) {
				debugger
			});

		if( isObjComplete( $scope.audioPlayerParams.chapter ) ){
			sendEventAnalytics('Player', 'flow', 'Chapter complete ' + $scope.audioPlayerParams.guide.title + '/' + $scope.audioPlayerParams.chapter.title );
			$scope.audioPlayerParams.chapter.is_Complete = '1';
			dataFactory.sendAudioComplete( service.getUserObj() , $scope.audioPlayerParams.chapter.audio_guid , '0' , 'chapter complete, ' + completeStatus )
				.success(function (data) {
					console.log('chapter complete success');
				})
				.error(function (error) {
					debugger
				});
		}

		if( isObjComplete( $scope.audioPlayerParams.guide ) ){
			sendEventAnalytics('Player', 'flow', 'Guide complete ' + $scope.audioPlayerParams.guide.title );
			$scope.audioPlayerParams.guide.is_Complete = '1';
			dataFactory.sendAudioComplete( service.getUserObj() , $scope.audioPlayerParams.guide.audio_guid , '1' , 'guide complete, ' + completeStatus )
				.success(function (data) {
					console.log('guide complete success');
				})
				.error(function (error) {
					debugger
				});
		}

		updateParams();
		if( $scope.audioPlayerParams.lastTrack ){
			$scope.backBtnClick();
		}else{
			$scope.nextChapterClick();
		}
	}

	function isObjComplete( obj ){
		if( obj.is_Complete == '1' ) return true;
		for(var i=0; i < obj.children.length; i++){
			if( obj.children[i].is_Complete == '0' ){
				return false;
			}
		}
		return true;
	}

}



ngColmexApp.controller( controllers );
