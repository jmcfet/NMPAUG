/**
 * Object that represents a the application settings dialog
 * @class $U.settings.AppSettingsDialog
 *
 * Object that represents a the application settings dialog. This allows user interaction with application settings
 * @template
 * @constructor
 * @param {Object} owne
 */

var $U = $U || {};
$U.settings = $U.settings || {};
$U.settings.AppSettingsDialog = ( function() {

	// String bundle keys
	var SETTINGS_KEY = "txtSettingsHeading";
	var CHANGE_LANGUAGE_KEY = "txtSettingsChangeLanguage";
	var DEVICE_KEY = "txtSettingsDeviceName";
	var PARENTAL_KEY = "txtParentalControls";
	var ABOUT_KEY = "txtSettingsAbout";
	var SUBTITLES_KEY = "txtSubtitles";
	var MOBILE_PLAYBACK_KEY = "txtMobileNetworkPlayback";

	// Buttons names for case statement
	var CHANGE_LANGUAGE_BTN_NAME = "changeLanguage";
	var CHANGE_DEVICE_BTN_NAME = "changeDeviceName";
	var CHANGE_PARENTAL_BTN_NAME = "changeParentalName";
	var ABOUT_BTN_NAME = "about";
	var CHANGE_SUBTITLE_BTN_NAME = "changeSubtitle";
	var MOBILE_PLAYBACK_BTN_NAME = "mobileNetworkPlayback";

	// Dialog configuration values
	var DIALOG_TYPE = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS;
	var DIALOG_POSITION = "defaultToolbar";
	var DIALOG_MODAL = true;

	/**
	 * Callback function for the application settings menu
	 * @param {Array} interactiveElements - all the possible elements that a user could have interacted with
	 * @param {Object} owner - the caller
	 */
	var _settingsDialogCallback = function(interactiveElements, owner) {

		var elements = interactiveElements;
		// button clicked is always the first item in the array
		var btn = elements[0].buttonClicked;

		switch (btn) {
		case CHANGE_LANGUAGE_BTN_NAME :
			// if the device is a phone just show the choose language dialog over the settings dialog */
			if ($U.core.Device.isPhone()) {
				$U.settings.ChooseLanguageDialog.showDialog(this);
			} else {
				// otherwise hide the dialog before showing the choose Language dialog
				$U.core.View.hideDialog();
				$U.settings.ChooseLanguageDialog.showDialog(this);
			}
			break;
		case CHANGE_DEVICE_BTN_NAME :
			// if the device is a phone just show the change dialog over the settings dialog */
			if ($U.core.Device.isPhone()) {
				$U.settings.DeviceNameDialog.showDialog(this);
			} else {
				// otherwise hide the dialog before showing the choose Language dialog
				$U.core.View.hideDialog();
				$U.settings.DeviceNameDialog.showDialog(this);
			}
			break;
		case CHANGE_PARENTAL_BTN_NAME :
			if ($U.core.Device.isPhone()) {
				$U.core.Options.showMenu($U.core.Options.MENUID.PARENTAL_LIST);
			} else {
				// otherwise hide the dialog before showing the choose Language dialog
				$U.core.View.hideDialog();
				$U.core.Options.showMenu($U.core.Options.MENUID.PARENTAL_LIST);
			}
			break;
		case ABOUT_BTN_NAME :
			// if the device is a phone then toggle the menu as the version dialog is a pop up dialog
			if ($U.core.Device.isPhone()) {
				$U.core.version.VersionDialog.show();
			} else {
				// otherwise hide the dialog using the deactivate method
				$U.settings.AppSettings.deactivate();
				$U.core.version.VersionDialog.show();
			}
			break;
		case CHANGE_SUBTITLE_BTN_NAME :
			if ($U.core.Device.isPhone()) {
				$U.settings.SubtitlesDialog.showDialog(this);
			} else {
				$U.core.View.hideDialog();
				$U.settings.SubtitlesDialog.showDialog(this);
			}
			break;
		case MOBILE_PLAYBACK_BTN_NAME :
			if ($U.core.Device.isPhone()) {
				$U.settings.MobileVideoDialog.showDialog(this);
			} else {
				$U.core.View.hideDialog();
				$U.settings.MobileVideoDialog.showDialog(this);
			}
			break;
		default :
			if ($U.core.Device.isPhone()) {
				$U.core.Options.toggle();
			} else {
				$U.settings.AppSettings.deactivate();
			}
		}
	};

	/**
	 * Configuration Object for the settings Dialog
	 * @return {Object}
	 */
	var _getSettingsDialogConf = function() {
		var currentParentalRating = "";
		var listItems = [];
		if ($U.core.parentalcontrols.ParentalControls.getRatingForDisplay().length) {
			currentParentalRating = " (" + $U.core.parentalcontrols.ParentalControls.getRatingForDisplay() + ")";
		} else {
			currentParentalRating = "";
		}

		// Language seting
		listItems.push({
			text : $U.core.Device.isPhone() ? $U.core.util.StringHelper.getString(CHANGE_LANGUAGE_KEY).toUpperCase() : $U.core.util.StringHelper.getString(CHANGE_LANGUAGE_KEY),
			icon : "icon-globe",
			name : CHANGE_LANGUAGE_BTN_NAME
		});

		// Device name setting
		listItems.push({
			text : $U.core.Device.isPhone() ? $U.core.util.StringHelper.getString(DEVICE_KEY).toUpperCase() : $U.core.util.StringHelper.getString(DEVICE_KEY),
			icon : "icon-tablet",
			name : CHANGE_DEVICE_BTN_NAME
		});

		// Parental controls (if on mobile)
		if ($U.core.Device.isPhone()) {
			listItems.push({
				text : $U.core.util.StringHelper.getString(PARENTAL_KEY) + currentParentalRating,
				icon : $U.core.parentalcontrols.ParentalControls.isLocked() ? "icon-lock" : "icon-unlock",
				name : CHANGE_PARENTAL_BTN_NAME
			});
		}

		if ($U.core.Configuration.SUPPORT_SUBTITLES && $U.core.Configuration.SUPPORT_SUBTITLES.SUPPORT()) {
			listItems.push({
				text : $U.core.Device.isPhone() ? $U.core.util.StringHelper.getString(SUBTITLES_KEY).toUpperCase() : $U.core.util.StringHelper.getString(SUBTITLES_KEY),
				icon : "icon-comment",
				name : CHANGE_SUBTITLE_BTN_NAME
			});
		}

		if (($U.core.Device.isPhone() || $U.core.Device.isTablet()) && $U.core.Configuration.MOBILE_NETWORK.allowVideoPlayback) {
			listItems.push({
				text : $U.core.Device.isPhone() ? $U.core.util.StringHelper.getString(MOBILE_PLAYBACK_KEY).toUpperCase() : $U.core.util.StringHelper.getString(MOBILE_PLAYBACK_KEY),
				icon : "icon-signal",
				name : MOBILE_PLAYBACK_BTN_NAME
			});
		}

		// About button
		listItems.push({
			text : $U.core.Device.isPhone() ? $U.core.util.StringHelper.getString(ABOUT_KEY).toUpperCase() : $U.core.util.StringHelper.getString(ABOUT_KEY),
			icon : "icon-question",
			name : ABOUT_BTN_NAME
		});

		return {
			title : $U.core.util.StringHelper.getString(SETTINGS_KEY),
			modal : DIALOG_MODAL,
			type : DIALOG_TYPE,
			position : DIALOG_POSITION,
			listItems : listItems
		};
	};

	// Shows the Dialog
	var showDialog = function(owner) {
		$U.core.View.showDialog(_getSettingsDialogConf(), _settingsDialogCallback, owner);
	};

	return {
		showDialog : showDialog
	};

}());
