var $U = $U || {};
$U.core = $U.core || {};
$U.core.signon = $U.core.signon || {};

$U.core.signon.SignOnDialog = ( function() {
	/**
	 * @class $U.core.signon.SignOnDialog
	 * Simple class that hold the config for a signon Dialog
	 */

	// String bundle keys
	var USERNAME_INPUT_PLACEHOLDER_KEY = "txtUsername";
	var PASSWORD_INPUT_PLACEHOLDER_KEY = "txtPassword";
	var DEVICE_INPUT_PLACEHOLDER_KEY = "txtDevice";
	var WELCOME_KEY = "txtWelcome";
	var ENTER_DETAILS_KEY = "txtPleaseEnterDetails";
	var SIGN_IN_KEY = "txtSignIn";

	var buttonClicked;
	var buttonClickedEl;

	/**
	 * Create the dialog configuration
	 */
	function createtDialogConfiguration(username, devicename) {

		var dialogConfiguration = {
			title : $U.core.util.StringHelper.getString(WELCOME_KEY),
			message : $U.core.util.StringHelper.getString(ENTER_DETAILS_KEY),
			type : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN,
			modal : false,
			form : {
				fields : [{
					name : "username",
					type : "text",
					value : username,
					placeholder : $U.core.util.StringHelper.getString(USERNAME_INPUT_PLACEHOLDER_KEY),
					required : true
				}, {
					name : "password",
					type : "password",
					value : "",
					placeholder : $U.core.util.StringHelper.getString(PASSWORD_INPUT_PLACEHOLDER_KEY),
					required : true

				}, {
					name : "devicename",
					type : "text",
					value : devicename,
					placeholder : $U.core.util.StringHelper.getString(DEVICE_INPUT_PLACEHOLDER_KEY)
				}]
			},
			buttons : [{
				text : $U.core.util.StringHelper.getString(SIGN_IN_KEY),
				name : "sign-in",
				icon : {
					iconClass : "icon-check",
					iconPos : "right"
				}
			}]
		};
		buttonClicked = false;

		return dialogConfiguration;
	}

	/*
	 * Helper function to disable the sign on button
	 */
	function disableSignOnButton(element) {

		var disabled = true;
		var disabledOpacity = 0.6;
		var signOnButton = element;

		signOnButton.disabled = disabled;
		signOnButton.style.opacity = disabledOpacity;
	}

	/**
	 * Password dialog handler function
	 * @param {Object} interactiveElements
	 */
	function dialogCallback(interactiveElements) {
		var inputObj = {};
		buttonClickedEl = document.querySelectorAll("[data-attribute='sign-in']")[0];

		for (var i = 0; i < interactiveElements.length; i++) {
			if (interactiveElements[i].type === "INPUT" || interactiveElements[i].type === "PASSWORD") {
				if (interactiveElements[i].value) {
					inputObj[interactiveElements[i].name] = interactiveElements[i].value;
				}
			}
		}

		if (inputObj.username && inputObj.password && !buttonClicked) {
			$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
				if (status) {		
					buttonClicked = true;
					$U.core.View.getDialog().setButtonIcon(buttonClickedEl, "dialog-button-icon-right icon-spinner icon-spin");
					// This will prevent the user click multiple times
					disableSignOnButton(buttonClickedEl);
					$U.core.signon.SignOn.doSignOn(inputObj);
				}
			});
		}
	}

	/**
	 * Show sign on dialog
	 */
	function show(username, devicename) {
		return $U.core.View.showDialog(createtDialogConfiguration(username, devicename), dialogCallback);
	}

	return {
		show : show
	};

}());
