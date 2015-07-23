var $U = $U || {};
$U.core = $U.core || {};
$U.core.dialogs = $U.core.dialogs || {};

$U.core.dialogs.PlaybackWarningDialog = ( function() {
	var MOBILE_VIDEO_OPTIONS = {
			WARN: "warn",
			YES: "yes",
			NO: "no"
		},
		PROCEED_BTN_NAME = "proceed",
		RETRY_BTN_NAME = "retry",
		CLOSE_BTN_NAME = "close",
		LOCAL_STORE_SETTING = "mobilevideo",
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
			MSG: "txtMobileNetworkMessage",
			PROCEED: "txtMobileNetworkProceed",
			RETRY: "txtMobileNetworkRetry",
			CLOSE: "txtMobileNetworkClose"
		},
		checkingConnection;

	function showDialog(callback, mobileVideoSetting) {
		var configurationObject = {}, proceedButton, reloadButton, closeButton;
		
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

		closeButton = {};
		closeButton.text = $U.core.util.StringHelper.getString(DIALOG_STRINGS.CLOSE);
		closeButton.name = CLOSE_BTN_NAME;
		closeButton.icon = {
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
						$U.core.NetworkHandler.playbackNetworkCheck(callback);
					}, 1000);
					break;
				case CLOSE_BTN_NAME : 
					$U.core.View.hideDialog();
					break;
				}
			}
		};

		configurationObject.buttons.push(closeButton);
		configurationObject.buttons.push(reloadButton);
		if (mobileVideoSetting === MOBILE_VIDEO_OPTIONS.WARN) {
			configurationObject.buttons.push(proceedButton);
		}
		$U.core.View.showDialog(configurationObject, _clickHandler);
	}	

	return {
		showDialog : showDialog
	};
}());

