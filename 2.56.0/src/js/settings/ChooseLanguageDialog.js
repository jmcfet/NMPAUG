/**
 * Object that represents a dialog to handle a user changing language
 * @class $U.settings.ChooseLanguageDialog
 *
 * Object that represents a dialog to handle a user changing language. This is used via the AppSettings menu
 * @singleton
 */

var $U = $U || {};
$U.settings = $U.settings || {};
$U.settings.ChooseLanguageDialog = ( function() {

	// String bundle keys
	var CANCEL_KEY = "txtCancel";
	var OK_KEY = "txtOK";
	var CHANGE_LANGUAGE_KEY = "txtSettingsChangeLanguage";
	var CHANGE_LANGUAGE_MESSAGE_KEY = "txtLanguageChangeMessage";

	// Constants
	var CHANGE_LANGUAGE_BTN_NAME = "changeLanguage";
	var CLOSE_BTN_NAME = "close";

	var INPUT_EL = "INPUT";
	var INPUT_NAME = "option";
	var INPUT_TYPE = "radio";

	var ICON_POS = "left";
	var ICON_OK = "icon-ok-sign";
	var ICON_REMOVE = "icon-remove-sign";

	// Dialog configuration values
	var DIALOG_TYPE = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS;
	var DIALOG_POSITION = "defaultToolbar";
	var DIALOG_MODAL = true;

	/**
	 * Callback function for the choose language dialog
	 * @param {Array} interactiveElements - all the possible elements that a user could have interacted with
	 * @param {Object} owner - the caller
	 */
	var _chooseLanguageCallback = function(interactiveElements, owner) {

		var elements = interactiveElements;
		// button clicked is always the first item in the array
		var btn = elements[0].buttonClicked;
		// The selected language
		var chosenLanguage;
		// The length of all interactive elements
		var l = elements.length;
		// counter
		var i;

		switch (btn) {
		case CHANGE_LANGUAGE_BTN_NAME :
			// loops through all interactive elements. If the element is an option and the user has checked one	update choosenLanguage
			for ( i = 0; i < l; i++) {
				if (elements[i].type === INPUT_EL && elements[i].name === INPUT_NAME) {
					if (elements[i].checked) {
						chosenLanguage = elements[i].value;
						break;
					}
				}
			}
			// If the chosen language is different to the one we have already set update and reload
			if ($U.core.Locale.getLocale() !== chosenLanguage) {

				if ($U.core.Device.isPhone()) {
					$U.core.Options.goBack();
				} else {
					$U.core.View.hideDialog();
				}

				$U.settings.AppSettings.deactivate();
				
				$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
					if (status) {		
						$U.core.Locale.resetLocale(chosenLanguage);

						/* Refresh the UI*/
						$U.core.RefreshApplication.refresh();
					}
				});

			} else {
				if ($U.core.Device.isPhone()) {
					$U.core.Options.goBack();
				} else {
					$U.settings.AppSettings.deactivate();
				}
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

	/*
	 * Configuration object for the  Language Dialog
	 * @return {Object}
	 */
	var _getLanguageDialogConf = function() {
		var dialogConf;
		var fields = [];
		var locales = $U.core.Locale.getSupportedLocales();
		var input;
		var l = locales.length;

		if (l > 1) {
			for (var i = 0; i < l; i++) {
				input = {};
				input.name = INPUT_NAME;
				input.type = INPUT_TYPE;
				input.label = locales[i].displayName;
				input.value = locales[i].localeString;
				input.checked = (locales[i].localeString === $U.core.Locale.getLocale()) ? true : false;
				input.id = i;
				fields.push(input);
			}
		}

		// The configuration object to be returned
		dialogConf = {
			title : $U.core.util.StringHelper.getString(CHANGE_LANGUAGE_KEY),
			modal : DIALOG_MODAL,
			type : DIALOG_TYPE,
			position : DIALOG_POSITION,
			message : ""//$U.core.util.StringHelper.getString(CHANGE_LANGUAGE_MESSAGE_KEY)
		};

		if (fields.length > 0) {
			// Add the form fields to the configuration object as defined above
			dialogConf.form = {
				fields : fields
			};
			// Add the buttons to the configuration object as defined above
			dialogConf.buttons = [{
				text : $U.core.util.StringHelper.getString(OK_KEY),
				name : CHANGE_LANGUAGE_BTN_NAME,
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
		}
		return dialogConf;
	};

	/**
	 * Shows the Choose Language Dialog
	 * @param {Object} owner
	 */
	var showDialog = function(owner) {
		$U.core.View.showDialog(_getLanguageDialogConf(), _chooseLanguageCallback, owner);
		if ($U.core.Device.isPhone()) {
			//need to register that we're loading the choose language dialog
			$U.core.Options.showMenu($U.core.Options.MENUID.CHANGE_LANGUAGE);
		}
	};

	return {
		showDialog : showDialog
	};

}());
