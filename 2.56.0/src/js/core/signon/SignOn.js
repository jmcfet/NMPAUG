var $U = $U || {};
$U.core = $U.core || {};
$U.core.signon = $U.core.signon || {};
$U.core.signon.SignOn = ( function() {

	/**
	 * @class $U.core.signon.SignOn
	 * @singleton
	 * Core bootstrap class that handles sign on and feature initialisation
	 */

	var userCredentials = {},
		CONFIG_REF = $U.core.Configuration,
		logger = $U.core.Logger.getLogger("SignOn"),
		store,
		directModeUrl = null,
		upgradeData,
		upgradeManagerService = null,
		MISSING_GATEWAY_ERROR = {},
		signonMethod,
		SIGNON_METHODS = {
			USER: 1,
			DEVICE: 2
		};

	$U.core.signon.user = {};
	/**
	 * Sets up the sign on process with failure and successful callbacks.
	 * @param  {Function} success Callback executed on success
	 * @param  {Number} method  Current sign on method
	 */
	var initialise = function(success, method) {

		var signonSuccess = function(res) {
			$N.services.sdp.Signon.unregisterListener(signonSuccess);
			success(res);
		};
		signonMethod = method;

		$N.services.sdp.Signon.setSignonFailedCallback(showErrorSignOn);
		$N.services.sdp.Signon.registerListener(signonSuccess, this);

		if ($U.core.Configuration.UPGRADE_MANAGER_CONFIG && $U.core.Configuration.UPGRADE_MANAGER_CONFIG.URL) {
			upgradeManagerService = new $N.services.multidrm.UpgradeManagerService($U.core.Configuration.UPGRADE_MANAGER_CONFIG.URL, null, null, false);
		}

		if ($U.core.Configuration.DIRECT_MODE_SIGNON) {
			$N.Config.DIRECT_MODE_SIGNON = true;
			directModeUrl = $U.core.Configuration.DIRECT_MODE_URL;
		} else {
			$N.Config.DIRECT_MODE_SIGNON = false;
		}
		store = $U.core.store.Store;
		retrieveCredentials();
	};

	/**
	 * Retrieve crededtials from the store.
	 * This is the first of a callback chain that ends with prepareUserCredentials
	 */
	function retrieveCredentials() {

		// Clear the credentials if configured
		if ($U.core.Configuration.CLEAR_CREDENTIALS) {
			store.removeItem("username");
			store.removeItem("devicename");
			store.removeItem("password");
		}

		// Get the username
		store.getItem("username", usernameCallback);
	}

	/**
	 * Deal with the username from store
	 */
	function usernameCallback(username) {
		userCredentials.username = username;
		// Get the devicename next
		store.getItem("devicename", devicenameCallback);
	}

	/**
	 * Deal with the devicename from store
	 */
	function devicenameCallback(devicename) {
		userCredentials.devicename = devicename;
		// Get the password next
		store.getItem("password", passwordCallback);
	}

	/**
	 * Deal with the password from store
	 */
	function passwordCallback(password) {
		userCredentials.password = password;
		prepareUserCredentials();
	}

	/**
	 * Prepare the user credentials for sign on.
	 */
	function prepareUserCredentials() {
		if (userCredentials.username && userCredentials.password) {
			// We got username and password so try to sign on with them
			doSignOn(userCredentials);
		} else {
			if (!userCredentials.username) {
				// Since we didn't find a username, clear anything we did find
				userCredentials.password = undefined;
				userCredentials.devicename = undefined;
			}
			createSignOnDialog();
		}
	}

	/**
	 * Builds and displays the sign on dialog
	 */
	var createSignOnDialog = function() {
		var dialog;

		$U.core.widgets.PageLoading.hideAll();

		while ($U.core.View.getDialog()) {
			$U.core.View.hideDialog();
		}

		dialog = $U.core.signon.SignOnDialog.show(userCredentials.username, userCredentials.devicename);
		createLanguageLinks(dialog);

		//createMoreInfoLink(dialog);

		$U.core.util.HtmlHelper.setVisibilityVisible($U.core.View.getViewContainer());
		// $U.core.util.ScrollableHelper.enableScrollForContainer($U.core.View.getViewContainer());

		// this is used for performance logging:
		// $.get("appInstalled?signOnPageLoaded").fail(function() {
		// 	console.warn("failed to connect");
		// }).success(function() {
		// 	console.warn("managed to connect");
		// });
	};

	function continueLaunch() {
		$N.services.sdp.ServiceFactory.get("ContextService").getCurrentContext(this, function(context) {
			$U.core.signon.user.userUid = context.userUid;
			$U.core.signon.user.accountUid = context.accountUid;
			$U.core.signon.user.locale = context.locale;
			$U.core.signon.user.deviceUid = context.deviceUid;
			$U.core.signon.user.accountNumber = context.accountNumber;
			$U.core.signon.user.accountSpid = context.spid;

			// If multi-price feature is enabled we must look up the account by the accountNumber retrieved from the current context
			if (!$U.core.Configuration.MULTI_PRICING_ENABLED) {
				//save the credentials into secure storage as we had a successful sign on.
				storeCredentials();
				updateDeviceNameFromServer();
			} else {
				$N.services.sdp.ServiceFactory.get("AccountService").getByAccountNumber(this, function(account) {
					// store the account locality (actually priceCategory)
					$U.core.signon.priceCategory = account.locality;

					//save the credentials into secure storage as we had a successful sign on.
					storeCredentials();
					updateDeviceNameFromServer();

				}, function() {
					if (logger) {
						logger.log("continueLaunch", "AccountService.getByAccountNumber", "failure");
					}
				}, context.accountNumber);
			}

		}, function() {
			if (logger) {
				logger.log("continueLaunch", "ContextService.getCurrentContext", "failure");
			}
		});
	}

	/**
	 * Update the locally stored NMP device name from the server.
	 * This is needed especially If this is a first time login and the user doesn't
	 * choose a device then the server allocate a name.
	 * @private
	 */
	function updateDeviceNameFromServer() {
		$U.core.Device.fetchNMPDeviceNameServer(fetchNMPDeviceNameServerCallback);
	}

	/**
	 *
	 * @private
	 */
	function fetchNMPDeviceNameServerCallback(name) {
		if (name) {
			$U.core.Device.storeNMPDeviceNameLocal(name);
		}
		if(logger){
			logger.timeStampLog("GOT ACCOUNT DATA FROM SDP");
		}
		$U.core.Launch.postSignOnInitialise();
	}

	/**
	 * Responsible for storing the successful login details of the user into local (secure) storage
	 * @private
	 */
	function storeCredentials() {
		store.setItem("username", userCredentials.username);
		store.setItem("devicename", userCredentials.devicename);
		if (store.isSecure()) {
			store.setItem("password", userCredentials.password);
		}
	}

	/**
	 * Signs onto SDP using a username and password. If we are looking at in the clear content i.e. nmp.nagra.com then we only needs
	 * to sign on using username and password. However if we are looking at encrypted content then we need to sign on and initliase the device
	 * @param {Object} formdata the data that is acquired through the sign on dialog
	 * @private
	 */
	function signOnByUserNameAndPassword(formdata) {
		userCredentials.username = formdata.username;
		userCredentials.password = formdata.password;
		userCredentials.devicename = formdata.devicename;

		if ($U.core.Configuration.FORCE_HTML || signonMethod === SIGNON_METHODS.USER) {
			$N.services.sdp.Signon.signonByUser(userCredentials.username, userCredentials.password);
		} else if ($U.core.Gateway.isGatewayAllowed()) {
			//for the GW need to signon to the homeDomain
			var homeDomainSignOn = function(scId) {
				if (!scId.handle) {
					userCredentials.smartcardId = scId;
					if (logger) {
						logger.log("signOnByUserNameAndPassword", "going to log into the home domain with " + JSON.stringify(userCredentials));
					}
					if (CONFIG_REF.SDP_CONFIG.HDM) {
						$N.services.sdp.Signon.signonToHomeDomain(userCredentials);
					} else {
						$N.services.sdp.Signon.signonAndInitialiseForNMP(userCredentials.username, userCredentials.password, userCredentials.devicename, directModeUrl);
					}

				} else {
					if (logger) {
						logger.log("signOnByUserNameAndPassword", "an error occurred getting the smartCardId: " + JSON.stringify(scId));
					}
					if (CONFIG_REF.SDP_CONFIG.HDM) {
						showErrorSignOn({
							failure : MISSING_GATEWAY_ERROR,
							response : scId
						});
					} else {
						$N.services.sdp.Signon.signonAndInitialiseForNMP(userCredentials.username, userCredentials.password, userCredentials.devicename, directModeUrl);
					}
				}
			};
			if (!$N.services.gateway.dlna.MediaDevice.getGWSmartCardID(homeDomainSignOn)) {
				showErrorSignOn({
					failure : MISSING_GATEWAY_ERROR,
					response : "no dmsUDN"
				});
			}
		} else {
			if ($U.core.Configuration.FORCE_HTML) {
				if (logger) {
					logger.log("signOnByUserNameAndPassword", "FORCE HTML head end so using signonByUser");
				}
				$N.services.sdp.Signon.signonByUser(userCredentials.username, userCredentials.password);
			} else {
				if (logger) {
					logger.log("signOnByUserNameAndPassword", "Using signonAndInitialiseForNMP");
				}
				$N.services.sdp.Signon.signonAndInitialiseForNMP(userCredentials.username, userCredentials.password, userCredentials.devicename, directModeUrl, upgradeManagerService);
			}
		}
	}

	/**
	 * Callback from the sign-on form submission, takes the user entered details and signs on using them
	 * @param {Object} formData
	 */
	var doSignOn = function(formData) {
		$U.core.util.HtmlHelper.setVisibilityVisible($U.core.View.getViewContainer());
		$U.core.util.ScrollableHelper.disableScrollForContainer($U.core.View.getViewContainer());
		signOnByUserNameAndPassword(formData);
	};

	function createLanguageLinks(dialog) {

		var languageTable;
		var languageLink;
		var locales = $U.core.Configuration.SUPPORTED_LOCALES;
		var l = locales.length;
		var i;

		if (l > 1) {
			languageTable = $U.core.util.DomEl.createDiv().setClassName("dialog-language-table");

			for ( i = 0; i < l; i++) {
				if ($U.core.Locale.getLocale() === locales[i].localeString) {
					languageLink = $U.core.util.DomEl.createElWithText("div", locales[i].displayName).setClassName("dialog-language-cell-selected").attachTo(languageTable).asElement();
				} else {
					languageLink = $U.core.util.DomEl.createElWithText("a", locales[i].displayName).setClassName("dialog-language-cell").attachTo(languageTable).asElement();
					languageLink.addEventListener("click", createLanguageLinkClickListener(locales[i]), false);
				}
			}
			dialog.appendElement(languageTable.asElement());
		}
	}

	function createLanguageLinkClickListener(locale) {
		return function() {
			$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
				if (status) {
					$U.core.Locale.resetLocale(locale.localeString);
					$U.core.RefreshApplication.reload();
				}
			});
		};
	}

	function createMoreInfoLink(dialog) {
		var moreInfoTable = $U.core.util.DomEl.createDiv().setClassName("dialog-language-table");
		var moreInfoLink = $U.core.util.DomEl.createLink("http://www.nagra.com", "Nagra", "images/nagra_logo_white_90.png").setClassName("dialog-language-cell").attachTo(moreInfoTable);

		dialog.appendElement(moreInfoTable.asElement());
	}

	/**
	 * Callback function assigned to $N.services.sdp.Signon.setSignonFailedCallback
	 * shows a "useful" error message to the user when sign on fails.
	 * @private
	 */
	function showErrorSignOn(result) {
		var errorText;
		var errType = $N.services.sdp.Signon.ERROR;
		var showButtons = true;
		var buttonText = null;
		var dialogConfig;
		var stringReplacement;
		var upgradeRequired;

		var dialogCallback = function() {
			createSignOnDialog();
		};
		$U.core.widgets.PageLoading.hideAll();

		if (!result.failure) {
			result.response = result;
		}

		switch(result.failure) {
		case errType.SERVER_CONNECTION:
			errorText = $U.core.util.StringHelper.getString("txtSignOnConnectionError");
			break;
		case errType.SIGNON_BY_USER:
		case errType.SIGNON_BY_USER_DEVICE_ID:
			// Inspect the result for specific error information
			errorText = getSpecificErrorText(result, $U.core.util.StringHelper.getString("txtSignOnPasswordError"));
			break;
		case errType.MAXIMUM_DEVICES_REACHED:
			errorText = $U.core.util.StringHelper.getString("txtSignOnMaxDevicesError");
			break;
		case errType.DEVICE_ACTIVATION_LIMIT_REACHED:
			errorText = $U.core.util.StringHelper.getString("txtSignOnMaxDeviceActivationLimitError");
			break;
		case errType.DEVICE_LIMIT_REACHED:
			errorText = $U.core.util.StringHelper.getString("txtSignOnMaxDeviceLimitError");
			break;
		case errType.DEVICE_CLASS_LIMIT_REACHED:
			errorText = $U.core.util.StringHelper.getString("txtSignOnMaxDeviceClassLimitError");
			break;
		case errType.SIGNON_BY_DEVICE_ID:
		case errType.INVALID_DEVICE_ID:
		case errType.INITIALIZE_DEVICE:
		case errType.PERSONALIZE_DEVICE:
			errorText = $U.core.util.StringHelper.getString("txtErrorSignOn");
			// + "\n" + result.response;
			break;
		case errType.SET_DEVICE_NAME:
			errorText = $U.core.util.StringHelper.getString("txtSignOnDeviceNameError");
			break;
		case errType.PLAYER_UPGRADE_REQUIRED:
			upgradeRequired = true;
			if ($U.core.Device.isIOS()) {
				errorText = $U.core.util.StringHelper.getString("txtSignOnPlayerUpgradeIOS");
				buttonText = $U.core.util.StringHelper.getString("txtUpgrade");
				dialogCallback = function () {
					window.userAgent.openUrl(result.response.downloadURL);
				};
			} else if ($U.core.Device.isAndroid()) {
				errorText = $U.core.util.StringHelper.getString("txtSignOnPlayerUpgradeAndroid");
				buttonText = $U.core.util.StringHelper.getString("txtUpgrade");
				dialogCallback = function () {
					window.userAgent.openUrl(result.response.downloadURL);
				};
			} else if ($U.core.Device.isDesktop()) {
				stringReplacement = {
					"VERSION": result.response.masterVersion || result.response.version,
					"URL": result.response.downloadURL || result.response.downloadUrl
				};
				errorText = $U.core.util.StringHelper.getString("txtSignOnPlayerUpgradePlugin", stringReplacement);
				showButtons = false;
			}
			break;
		case MISSING_GATEWAY_ERROR:
			errorText = $U.core.util.StringHelper.getString("txtGatewayNotFound") + "\n" + JSON.stringify(result.response);
			break;
		default:
			// Inspect the result for specific error information
			errorText = getSpecificErrorText(result, $U.core.util.StringHelper.getString("txtErrorSignOn"));
			// + "\n" + result.response;
			break;
		}
		if (logger) {
			logger.log("showErrorSignOn", "result: " + JSON.stringify(result));
		}
		if (showButtons) {
			dialogConfig = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString("txtERROR"), errorText, false, buttonText);
		} else {
			dialogConfig = $U.core.widgets.dialog.Dialog.getTerminalMessageDialog($U.core.util.StringHelper.getString("txtERROR"), errorText, true);
		}
		if (upgradeRequired && $U.core.Configuration.PLUGIN_DOWNLOAD_OPTIONS.DOWNLOAD_REQUIRED_UPDATES && $U.core.Device.isDesktop() && !$U.core.Device.isMacPlayer() && !$U.core.Device.isPCPlayer()) {
			$U.core.signon.PluginChecker.upgradePlugin();
		} else {
			$U.core.View.showDialog(dialogConfig, dialogCallback);
		}
	}

	function getUserCredentials() {
		return userCredentials;
	}

	function getSpecificErrorText(result, defaultErrorText) {

		// The default errorText if we don't find a specific error
		var errorText = defaultErrorText;

		// The response text is either a property of the result object or it is the result string
		var response = result && result.response ? result.response : result;

		// Check that we're dealing with a string
		if (response.indexOf) {
			// Check for the codes that indicate account is suspended
			if ((response.indexOf("23017:23005") !== -1) || (response.indexOf("23017:23015") !== -1)) {
				errorText = $U.core.util.StringHelper.getString("txtSignOnAccountSuspended");
			} else if ((response.indexOf("23017:23008") !== -1)) {
				errorText = $U.core.util.StringHelper.getString("txtSignOnPasswordError");
			}
		}

		return errorText;
	}

	function getUpgradeManagerService() {
		return upgradeManagerService;
	}

	return {
		initialise : initialise,
		doSignOn : doSignOn,
		getUserCredentials : getUserCredentials,
		continueLaunch : continueLaunch,
		SIGNON_METHODS: SIGNON_METHODS,
		getUpgradeManagerService: getUpgradeManagerService
	};
}());
