var $U = $U || {};
$U.settings = $U.settings || {};
$U.settings.SubtitlesDialog = (function () {

	var SUBTITLES_TXT_KEY = "txtSubtitles";
	var TURN_ON_OFF_TXT_KEY = "txtEnableDisableSubtitles";

	var OK_KEY = "txtOK";
	var CANCEL_KEY = "txtCancel";

	var CLOSE_BTN_NAME = "close";
	var CHANGE_SUBTITLES_BTN = "updateSubtitles";

	var ENABLE_DISABLE_SUBTITLES = "onoffSubtitles";

	var ICON_POS = "left";
	var ICON_OK = "icon-ok-sign";
	var ICON_REMOVE = "icon-remove-sign";

	var DIALOG_TYPE = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS;
	var DIALOG_POSITION = "defaultToolbar";
	var DIALOG_MODAL = false;

	var SUPPORTED_SUB_LANGS = $U.core.Configuration.SUPPORT_SUBTITLES &&  $U.core.Configuration.SUPPORT_SUBTITLES.LANGUAGES ? $U.core.Configuration.SUPPORT_SUBTITLES.LANGUAGES : [];

	var logger = $U.core.Logger.getLogger();

	var eventListeners = {};

	var EVENT = {
		SUBTITLES_ON: 1,
		SUBTITLES_OFF: 2
	};

	/**
	 * Configuration of the Subtitles Dialog
	 */
	function _getDialogConfig(subtitleObj) {
		var dialog;
		var i, l;

		l = SUPPORTED_SUB_LANGS.length;

		// Standard Key/values needed for a dialog
		dialog = {
			title : $U.core.util.StringHelper.getString(SUBTITLES_TXT_KEY),
			type : DIALOG_TYPE,
			position : DIALOG_POSITION,
			modal : DIALOG_MODAL
		};

		dialog.form = {
			fields : [{
				name : ENABLE_DISABLE_SUBTITLES,
				type : "checkbox",
				id : ENABLE_DISABLE_SUBTITLES,
				label : $U.core.util.StringHelper.getString(TURN_ON_OFF_TXT_KEY),
				checked : subtitleObj ? subtitleObj.on : false,
				changeEvt : function () {
					_subtitlessDialogCallback(null, null);
				}
			}]
		};

		// Only if there is more than 1 language choice should we show it to the user
		// if there is only one language then the we should automatically set it
		if (SUPPORTED_SUB_LANGS.length > 1) {
			for (i = 0; i < l; i++) {
				dialog.form.fields.push({
					name : "option",
					type : "radio",
					id : "sublang" + i,
					value : SUPPORTED_SUB_LANGS[i].code,
					label : SUPPORTED_SUB_LANGS[i].name,
					hidden : subtitleObj ? !subtitleObj.on : true,
					checked : subtitleObj ? subtitleObj.language === SUPPORTED_SUB_LANGS[i].code : false
				});
			}
		}

		// Key values needed to generate buttons on a dialog
		dialog.buttons = [{
			text : $U.core.util.StringHelper.getString(OK_KEY),
			name : CHANGE_SUBTITLES_BTN,
			icon : {
				iconClass : ICON_OK,
				iconPos : ICON_POS
			}
		}, $U.core.Device.isPhone() ? null : {
			text : $U.core.util.StringHelper.getString(CANCEL_KEY),
			name : CLOSE_BTN_NAME,
			icon : {
				iconClass : ICON_REMOVE,
				iconPos : ICON_POS
			}
		}];

		return dialog;

	}

	function _fireEvent(event) {
		var listeners = eventListeners[event],
			i;
		if (listeners) {
			for (i = 0; i < listeners.length; i++) {
				listeners[i]();
			}
		}
	}

	/**
	 * Callback fired when closing dialog
	 */
	function _subtitlessDialogCallback(elements, owner) {

		var isChecked, i, displayType, languageOptions, languageSelected, btn = elements ? elements[0].buttonClicked : null, enableCheckbox = document.getElementById(ENABLE_DISABLE_SUBTITLES);

		// Check if the subtitle option is checked
		isChecked = enableCheckbox ? enableCheckbox.checked : false;

		// display type is block if checked is true
		displayType = isChecked ? "block" : "none";

		// Language options if available
		languageOptions = document.getElementsByName("option");

		for (i = 0; i < languageOptions.length; i++) {
			languageOptions[i].parentNode.style.display = displayType;
		}

		// Helper function to return which language option selected
		function whichLanguage() {
			for ( i = 0; i < languageOptions.length; i++) {
				if (languageOptions[i].checked) {
					return languageOptions[i].value;
				}
			}
			return;
		}

		switch (btn) {
		case CHANGE_SUBTITLES_BTN :

			if (logger) {
				logger.log("_subtitlessDialogCallback", "Change button clicked");
			}

			// If there is only one supported subtitle language set it automatically
			if (isChecked) {
				_fireEvent(EVENT.SUBTITLES_ON);
				if (SUPPORTED_SUB_LANGS.length <= 1) {
					if (logger) {
						logger.log("_subtitlessDialogCallback", "User selected to turn on subtitles and there is only one language so set it");
					}

					if (SUPPORTED_SUB_LANGS.length === 0) {
						$U.core.store.LocalStore.setItem("subtitles", JSON.stringify({
							on : true
						}));
					} else {
						$U.core.store.LocalStore.setItem("subtitles", JSON.stringify({
							on : true,
							language : SUPPORTED_SUB_LANGS[0].code
						}));
					}

					if (logger) {
						logger.log("_subtitlessDialogCallback", "Set subtitles on in local storage");
					}

					$U.core.Player.activateSubTitle();

					if ($U.core.Device.isPhone()) {
						$U.core.Options.goBack();
					} else {
						$U.settings.AppSettings.deactivate();
					}

					return;

				} else if (SUPPORTED_SUB_LANGS.length > 1) {
					if (logger) {
						logger.log("_subtitlessDialogCallback", "User selected to turn on and there are multiple subtitle options, the user must select one");
					}
					if (whichLanguage()) {
						if (logger) {
							logger.log("_subtitlessDialogCallback", "User has selected a language");
						}
						$U.core.store.LocalStore.setItem("subtitles", JSON.stringify({
							on : true,
							language : whichLanguage()
						}));

						if (logger) {
							logger.log("_subtitlessDialogCallback", "Set subtitles on and language is set in local storage");
						}

						$U.core.Player.activateSubTitle(whichLanguage());

						if ($U.core.Device.isPhone()) {
							$U.core.Options.goBack();
						} else {
							$U.settings.AppSettings.deactivate();
						}
						return;
					} else {
						// Show error dialog user must select one language if there are multiple to choose from
						$U.core.View.showDialog($U.core.widgets.dialog.Dialog.getGenericMessageDialog("Subtitle Error", "As there are mutliple subtitle languages available you must select one", null, null), $U.core.View.hideDialog);

						if (logger) {
							logger.log("_subtitlessDialogCallback", "ERROR: the user must select at least one language if there are multiple to choose from");
						}
						return;
					}
				}
			} else {
				_fireEvent(EVENT.SUBTITLES_OFF);
				$U.core.store.LocalStore.removeItem("subtitles");
				$U.core.Player.deactivateSubTitle();
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
			console.log("close button clicked");
			break;
		}
	}

	/**
	 * Callback function for retrieving an item from local store
	 */
	function _getItemCallback(item, owner) {
		// We stored the data as a stringified object so parse it back
		var parsedObj = JSON.parse(item);
		// Get the dialogs configuration
		var dialogConf = _getDialogConfig(parsedObj);

		// Finally show the dialog
		$U.core.View.showDialog(dialogConf, _subtitlessDialogCallback, owner);

		if ($U.core.Device.isPhone()) {
			//need to register that we're loading the choose language dialog
			$U.core.Options.showMenu($U.core.Options.MENUID.CHANGE_SUBTITLES);
		}
	}

	/**
	 * Show the Subtitles Dialog
	 * @param {Object} caller
	 */
	function showDialog(caller) {
		$U.core.store.LocalStore.getItem("subtitles", function(item) {
			_getItemCallback(item, caller);
		});
	}

	/**
	 * Registers the listener for the given event
	 * @method addEventListener
	 * @param {Object} event
	 * @param {Object} listener
	 */
	function addEventListener(event, listener) {
		if (eventListeners[event] === undefined) {
			eventListeners[event] = [];
		}
		eventListeners[event].push(listener);
	}

	return {
		showDialog : showDialog,
		addEventListener: addEventListener,
		EVENT: EVENT
	};

}());

