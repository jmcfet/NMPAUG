var $U = $U || {};
$U.settings = $U.settings || {};
$U.settings.MobileVideoDialog = (function () {

	var logger = $U.core.Logger.getLogger("MobileVideoDialog"),
		DIALOG = {
			FIELD_TYPE: "radio",
			FIELD_NAME: "mobileVideoOptions",
			TYPE: $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS,
			POSITION: "defaultToolbar",
			MODAL: false
		},
		BUTTONS = {
			CANCEL: "close",
			OK: "ok"
		},
		DIALOG_STRINGS = {
			TITLE: "txtMobileVideo",
			OK_BTN: "txtOK",
			CANCEL_BTN: "txtCancel"
		},
		ICONS = {
			OK: "icon-ok-sign",
			REMOVE: "icon-remove-sign"
		}, 
		POSITIONS = {
			LEFT: "left"
		},
		MOBILE_VIDEO_OPTIONS = {
			WARN: "warn",
			YES: "yes",
			NO: "no"
		},
		OPTIONS = [{
			value: MOBILE_VIDEO_OPTIONS.YES,
			label: "Yes",
			id: "yesId"
		}, {
			value: MOBILE_VIDEO_OPTIONS.NO,
			label: "No",
			id: "noId"	
		}, {
			value: MOBILE_VIDEO_OPTIONS.WARN,
			label: "Warn",
			id: "warnId"
		}],
		LOCAL_STORE_ITEM = "mobilevideo",
		INPUT = "INPUT";


	/**
	 * Configuration of the Mobile ViCdeo Dialog
	 */
	function _getDialogConfig(mobileVideoObject) {
		var dialog,
			fields = [],
			checkedOption = mobileVideoObject ? mobileVideoObject.value : MOBILE_VIDEO_OPTIONS.WARN;	

		OPTIONS.forEach(function(option) {
			fields.push({
				name : DIALOG.FIELD_NAME,
				type : DIALOG.FIELD_TYPE,
				label : option.label,
				value : option.value,
				checked : option.value === checkedOption ? true : false,
				id : option.id
			});
		});

		dialog = {
			title : $U.core.util.StringHelper.getString(DIALOG_STRINGS.TITLE),
			type : DIALOG.TYPE,
			position : DIALOG.POSITION,
			modal : DIALOG.MODAL
		};

		dialog.form = {
			fields : fields
		};

		dialog.buttons = [{
			text : $U.core.util.StringHelper.getString(DIALOG_STRINGS.OK_BTN),
			name : BUTTONS.OK,
			icon : {
				iconClass : ICONS.OK,
				iconPos : POSITIONS.LEFT
			}
		}, $U.core.Device.isPhone() ? null : {
			text : $U.core.util.StringHelper.getString(DIALOG_STRINGS.CANCEL_BTN),
			name : BUTTONS.CANCEL,
			icon : {
				iconClass : ICONS.REMOVE,
				iconPos : POSITIONS.LEFT
			}
		}];
		return dialog;
	}

	/**
	 * Writes the mobilevideo option to local storage
	 * @param {Boolean} is mobile video playback enabled.
	 */
	function _writeToLocalStorage(enableMobileVideo) {
		$U.core.store.LocalStore.setItem(LOCAL_STORE_ITEM, JSON.stringify({
			value : enableMobileVideo
		}));
	}

	/**
	 * Helper function to close the dialog
	 */
	function _exitDialogOrMenu() {
		if ($U.core.Device.isPhone()) {
			$U.core.Options.goBack();
		} else {
			$U.settings.AppSettings.deactivate();
		}
	}

	/**
	 * Callback fired when closing dialog
	 */
	function _mobileVideoDialogCallback(elements, owner) {
		var btn = elements ? elements[0].buttonClicked : null;
		var playbackValue;

		switch (btn) {
		case BUTTONS.OK:
			if (logger) {
				logger.log("_mobileVideoDialogCallback", "Saving mobile video playback option");
			}
			elements.forEach(function(item) {
				if (item.type === INPUT && item.name === DIALOG.FIELD_NAME) {
					if (item.checked) {
						playbackValue = item.value;
					}
				}
			});
			_writeToLocalStorage(playbackValue);
			_exitDialogOrMenu();
			break;
		case BUTTONS.CANCEL:
			_exitDialogOrMenu();
			break;
		}
	}

	/**
	 * Called once the movilevideo option item has been retrieved from local storage
	 */
	function _getItemCallback(item, owner) {
		var parsedObj = JSON.parse(item);
		var dialogConf = _getDialogConfig(parsedObj);
		$U.core.View.showDialog(dialogConf, _mobileVideoDialogCallback, owner);

		if ($U.core.Device.isPhone()) {
			$U.core.Options.showMenu($U.core.Options.MENUID.MOBILE_VIDEO);
		}
	}

	/**
	 * Show the Mobile Video Dialog
	 * @param {Object} caller
	 */
	function showDialog(caller) {
		$U.core.store.LocalStore.getItem(LOCAL_STORE_ITEM, function (item) {
			_getItemCallback(item, caller);
		});
	}

	return {
		showDialog : showDialog
	};

}());

