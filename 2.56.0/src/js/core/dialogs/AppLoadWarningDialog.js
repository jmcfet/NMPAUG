var $U = $U || {};
$U.core = $U.core || {};
$U.core.dialogs = $U.core.dialogs || {};

$U.core.dialogs.AppLoadWarningDialog = ( function() {
	var PROCEED_BTN_NAME = "proceed",
		RETRY_BTN_NAME = "retry",
		EXIT_BTN_NAME = "close",
		ICONS = {
			OK: "icon-ok-sign",
			REFRESH: "icon-refresh",
			REMOVE: "icon-remove"
		}, 
		ALIGNMENT = {
			LEFT: "left"
		}, 
		DIALOG_STRINGS = {
			TITLE: "txtMobileNetworkDetected",
			MSG: "txtMobileNetorkAppLoadMessage",
			PROCEED: "txtMobileNetworkProceed",
			RETRY: "txtMobileNetworkRetry",
			EXIT: "txtMobileNetworkExit"
		},
		checkingConnection;

	function _showDialog(callback) {
		var configurationObject = {}, proceedButton, reloadButton, exitButton;
		
		checkingConnection = false;
		configurationObject.modal = true;
		configurationObject.type = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : null;
		configurationObject.title = $U.core.util.StringHelper.getString(DIALOG_STRINGS.TITLE);
		configurationObject.message = $U.core.util.StringHelper.getString(DIALOG_STRINGS.MSG);
		configurationObject.buttons = [];
		
		proceedButton = {};
		proceedButton.text = $U.core.util.StringHelper.getString(DIALOG_STRINGS.PROCEED);
		proceedButton.name = PROCEED_BTN_NAME;
		proceedButton.icon = {
			iconClass : ICONS.OK,
			iconPos : ALIGNMENT.LEFT
		};
		
		reloadButton = {};
		reloadButton.text = $U.core.util.StringHelper.getString(DIALOG_STRINGS.RETRY);
		reloadButton.name = RETRY_BTN_NAME;
		reloadButton.icon = {
			iconClass : ICONS.REFRESH,
			iconPos : ALIGNMENT.LEFT
		};

		exitButton = {};
		exitButton.text = $U.core.util.StringHelper.getString(DIALOG_STRINGS.EXIT);
		exitButton.name = EXIT_BTN_NAME;
		exitButton.icon = {
			iconClass : ICONS.REMOVE,
			iconPos : ALIGNMENT.LEFT
		};

		var _clickHandler = function(interactiveElements, owner) {
			var reloadElement = document.querySelectorAll("[data-attribute='retry']")[0];
			
			if (!checkingConnection) {
				switch (interactiveElements[0].buttonClicked) {
				case PROCEED_BTN_NAME :
					$U.core.View.hideDialog();
					return ( callback() );
				case RETRY_BTN_NAME : 
					checkingConnection = true;
					$U.core.View.getDialog().setButtonIcon(reloadElement, "dialog-button-icon-left icon-spinner icon-spin");
					setTimeout(function() {
						$U.core.View.hideDialog();
						$U.core.NetworkHandler.appLoadNetworkCheck(callback);
					}, 1000);
					break;
				case EXIT_BTN_NAME :
					$U.core.View.hideDialog();
					if (window.userAgent && window.userAgent.quit) {
						window.userAgent.quit();
					}
					break;
				}
			}
		};

		configurationObject.buttons.push(exitButton);
		configurationObject.buttons.push(reloadButton);
		configurationObject.buttons.push(proceedButton);
		$U.core.View.showDialog(configurationObject, _clickHandler);
	}

	return {
		showDialog : _showDialog
	};
}());

