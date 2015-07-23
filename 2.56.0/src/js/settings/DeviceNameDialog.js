/**
 * Object that represents a dialog to handle a user changing their device name
 * @class $U.settings.DeviceNameDialog
 *
 * Object that represents a dialog to handle a user changing their device name. This is used via the AppSettings menu
 * @singleton
 */

var $U = $U || {};
$U.settings = $U.settings || {};
$U.settings.DeviceNameDialog = ( function() {

	var logger = $U.core.Logger.getLogger("DeviceNameDialog");

	// String bundle keys
	var CANCEL_KEY = "txtCancel";
	var OK_KEY = "txtOK";
	var CHANGE_DEVICE_KEY = "txtSettingsDeviceName";
	var CHANGE_DEVICE_MESSAGE_KEY = "txtDeviceNameChangeMessage";

	// Constants
	var CHANGE_DEVICE_BTN_NAME = "changeDevicename";
	var CLOSE_BTN_NAME = "close";

	var CHANGE_DEVICE_FAILURE_TITLE = "txtDevicenameSettingFailureTitle";
	var CHANGE_DEVICE_FAILURE_MESSAGE = "txtDeviceNameSettingFailureMessage";

	var INPUT_EL = "INPUT";
	var INPUT_NAME = "deviceName";
	var INPUT_TYPE = "text";

	var ICON_POS = "left";
	var ICON_OK = "icon-ok-sign";
	var ICON_REMOVE = "icon-remove-sign";

	var DIALOG_TYPE = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC;
	var DIALOG_POSITION = "defaultToolbar";
	var DIALOG_MODAL = true;

	/**
	 * Callback function for the change devicename dialog
	 * @param {Array} interactiveElements - all the possible elements that a user could have interacted with
	 * @param {Object} owner - the caller
	 */
	var _devicenameCallback = function(interactiveElements, owner) {

		var elements = interactiveElements;
		// button clicked is always the first item in the array
		var btn = elements[0].buttonClicked;
		// The selected language
		var deviceName;
		// The length of all interactive elements
		var l = elements.length;
		// counter
		var i;

		switch (btn) {
		case CHANGE_DEVICE_BTN_NAME :
			// loops through all interactive elements. If the element is an option and the user has checked one	update choosenLanguage
			for ( i = 0; i < l; i++) {
				if (elements[i].type === INPUT_EL && elements[i].name === INPUT_NAME) {
					deviceName = elements[i].value;
					break;
				}
			}
			if (deviceName) {
				var header = $U.core.View.getHeader();
				header.removeAllButtonsFromTop();
				$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
					header.restoreAllButtonsToTop();
					if (status) {
						_storeNMPDeviceName(deviceName);
					}
				});
			}
			break;
		case CLOSE_BTN_NAME :
			if ($U.core.Device.isPhone()) {
				$U.core.Options.goBack();
			} else {
				$U.settings.AppSettings.deactivate();
			}
			break;
		}
	};

	/**
	 * Store the devicename
	 * @param {string} name the name to store
	 */
	var _storeNMPDeviceName = function(name) {
		$U.core.widgets.PageLoading.show("ChangeDeviceName");
		$U.core.Device.storeNMPDeviceNameServer(name, function(result) {
			if (result) {
				$U.core.Device.storeNMPDeviceNameLocal(name);
				$U.core.widgets.PageLoading.hide("ChangeDeviceName");
				if ($U.core.Device.isPhone()) {
					$U.core.Options.goBack();
				} else {
					$U.settings.AppSettings.deactivate();
				}
			} else {
				_showFailureDialog();
			}
		});
	};

	/**
	 * Shows a dialog on a devicename setting failure
	 */
	var _showFailureDialog = function() {
		var config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(CHANGE_DEVICE_FAILURE_TITLE), $U.core.util.StringHelper.getString(CHANGE_DEVICE_FAILURE_MESSAGE));

		$U.core.widgets.PageLoading.hide("ChangeDeviceName");

		if ($U.core.View.getHeader().removeHighlightSettingsButton) {
			$U.core.View.getHeader().removeHighlightSettingsButton();
		}

		$U.core.View.showDialog(config, function() {
			$U.core.View.hideDialog();
			if ($U.core.View.getHeader().highlightSettingsButton) {
				$U.core.View.getHeader().highlightSettingsButton();
			}
		});
	};

	/**
	 * Configuration object for the devicename Dialog
	 * @param {string} devicename the devicename
	 * @return {Object}
	 */
	var _getDeviceNameDialogConf = function(devicename) {
		var dialogConf;
		var fields = [];
		var deviceName;
		var input;

		// The configuration object to be returned
		dialogConf = {
			title : $U.core.util.StringHelper.getString(CHANGE_DEVICE_KEY),
			modal : DIALOG_MODAL,
			type : DIALOG_TYPE,
			position : DIALOG_POSITION,
			message : $U.core.util.StringHelper.getString(CHANGE_DEVICE_MESSAGE_KEY)
		};

		input = {};
		input.name = INPUT_NAME;
		input.type = INPUT_TYPE;
		input.required = true;
		input.value = devicename;
		//input.maxlength = 20;
		input.placeholder = $U.core.util.StringHelper.getString("txtDevice");
		fields.push(input);

		// Add the form fields to the configuration object as defined above
		dialogConf.form = {
			fields : fields
		};
		// Add the buttons to the configuration object as defined above
		dialogConf.buttons = [{
			text : $U.core.util.StringHelper.getString(OK_KEY),
			name : CHANGE_DEVICE_BTN_NAME,
			icon : {
				iconClass : ICON_OK,
				iconPos : ICON_POS
			}
		},
		//no cancel buttons for the full screen dialogs
		$U.core.Device.isPhone() ? null : {
			text : $U.core.util.StringHelper.getString(CANCEL_KEY),
			name : CLOSE_BTN_NAME,
			icon : {
				iconClass : ICON_REMOVE,
				iconPos : ICON_POS
			}
		}];

		return dialogConf;
	};

	/**
	 * Shows the Change Devicename Dialog
	 * @param {Object} owner
	 */
	var showDialog = function(owner) {
		// Get the device name...
		var devicename;
		$U.core.Device.fetchNMPDeviceNameLocal(function(value) {
			devicename = value;
			// .. then continue
			_showDialogContinue(owner, devicename);
		});
	};

	/**
	 * Continue with showing the dialog once the device name is available.
	 * @param {Object} owner
	 * @param {Object} devicename
	 * @private
	 */
	var _showDialogContinue = function(owner, devicename) {
		$U.core.View.showDialog(_getDeviceNameDialogConf(devicename), _devicenameCallback, owner);
		if ($U.core.Device.isPhone()) {
			//need to register that we're loading the change devicename dialog
			$U.core.Options.showMenu($U.core.Options.MENUID.CHANGE_DEVICENAME);
		}
	};

	return {
		showDialog : showDialog
	};

}());
