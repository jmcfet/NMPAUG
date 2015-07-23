/**
 * Controls application freshness via different methods such as reloading data, re-rendering UI elements or rebooting the entire application.
 * @class $U.core.RefreshApplication
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.RefreshApplication = ( function() {

	var logger = $U.core.Logger.getLogger("RefreshApplication");

	var refreshCount = 0;

	var CANCEL_KEY = "txtCancel";
	var OK_KEY = "txtOK";
	var REFRESH_APPLICATION_TITLE_KEY = "txtRefreshApplicationTitle";
	var REFRESH_APPLICATION_MESSAGE_KEY = "txtRefreshApplicationMessage";

	var RELOAD_APPLICATION_TITLE_KEY = "txtReloadApplicationTitle";
	var RELOAD_APPLICATION_MESSAGE_KEY = "txtReloadApplicationMessage";

	var ICON_POS = "left";
	var ICON_OK = "icon-ok-sign";
	var ICON_REMOVE = "icon-remove-sign";

	// Constants
	var REFRESH_BTN_NAME = "refreshApplication";
	var RELOAD_BTN_NAME = "reloadApplication";
	var CLOSE_BTN_NAME = "close";

	var DIALOG_MODAL = true;
	var DIALOG_POSITION = null;

	/**
	 * Makes the application reload in the environment.  Complete reload, not refresh
	 */
	var reload = function() {
		window.location.reload();
	};

	var reloadDialog = function() {

		// on iOS windowed playback can interfere with display of this dialog, so we deactivate
		// the mediacard on all platforms by default before dialog appears */
		$U.mediaCard.MediaCardController.deactivate();

		$U.core.View.showDialog(_reloadDialogConf(), function(interactiveElements, owner) {
			var btn = interactiveElements[0].buttonClicked;
			if (btn === RELOAD_BTN_NAME) {
				$U.settings.AppSettings.deactivate();
				reload();
			}
		});
	};

	/**
	 * Refresh the application (not a reload).  Rebuilds the UI/re-requests data as required
	 */
	var refresh = function() {
		if (logger) {
			logger.log("refresh", ++refreshCount);
		}
		$U.destroyList.push($U.core.Options);
		$U.core.View.destroyAllDialogs();
		$U.epg.EPGScreen.resetEPGState();
		$U.mediaCard.MultiMoreLikeThis.removeScrollerReferences();
		$U.core.util.HtmlHelper.emptyEl(document.getElementById("masterContainer"));
		setTimeout(function(){
			$U.core.Launch.refreshUIEntryPoint();
		}, 0);
	};

	/**
	 * Version of refresh that pops up a cancellable dialog to confirm reset.
	 * @param {Function} callback Function to call if 'OK' is chosen.
	 */
	var refreshDialog = function(callback) {

		if ( typeof callback !== "function") {
			callback = function() {
			};
		}

		// on iOS windowed playback can interfere with display of this dialog, so we deactivate
		// the mediacard on all platforms by default before dialog appears */
		$U.mediaCard.MediaCardController.deactivatePlayer();

		// Any menus being interacted with need to be tidied up as well (tablet only).
		if ($U.core.Device.isTablet()) {
			$U.core.parentalcontrols.ParentalControlsDialog.deactivate();
			$U.settings.AppSettings.deactivate();
		}

		$U.core.View.showDialog(_refreshDialogConf(), function(interactiveElements, owner) {
			var btn = interactiveElements[0].buttonClicked;
			if (btn === REFRESH_BTN_NAME) {
				callback();
				refresh();
			} else if (btn === CLOSE_BTN_NAME) {
				cancelRefresh();
				$U.core.View.hideDialog();
			}
		});
	};

	var _refreshDialogConf = function() {
		var dialogConf;
		var fields = [];
		var input;

		// The configuration object to be returned
		dialogConf = {
			title : $U.core.util.StringHelper.getString(REFRESH_APPLICATION_TITLE_KEY),
			modal : DIALOG_MODAL,
			type : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC,
			position : DIALOG_POSITION,
			message : $U.core.util.StringHelper.getString(REFRESH_APPLICATION_MESSAGE_KEY)
		};

		// Add the buttons to the configuration object as defined above
		dialogConf.buttons = [{
			text : $U.core.util.StringHelper.getString(OK_KEY),
			name : REFRESH_BTN_NAME,
			icon : {
				iconClass : ICON_OK,
				iconPos : ICON_POS
			}
		}, {
			text : $U.core.util.StringHelper.getString(CANCEL_KEY),
			name : CLOSE_BTN_NAME,
			icon : {
				iconClass : ICON_REMOVE,
				iconPos : ICON_POS
			}
		}];

		return dialogConf;
	};

	var _reloadDialogConf = function() {
		var dialogConf;
		var fields = [];
		var input;

		// The configuration object to be returned
		dialogConf = {
			title : $U.core.util.StringHelper.getString(RELOAD_APPLICATION_TITLE_KEY),
			modal : DIALOG_MODAL,
			type : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC,
			position : DIALOG_POSITION,
			message : $U.core.util.StringHelper.getString(RELOAD_APPLICATION_MESSAGE_KEY)
		};

		// Add the buttons to the configuration object as defined above
		dialogConf.buttons = [{
			text : $U.core.util.StringHelper.getString(OK_KEY),
			name : RELOAD_BTN_NAME,
			icon : {
				iconClass : ICON_OK,
				iconPos : ICON_POS
			}
		}];

		return dialogConf;
	};
	/**
	 * Functions that get run when the user cancels the refresh dialog, either from the dialog buttons or the back button on the phone options.
	 */
	var cancelRefresh = function() {
		$U.mediaCard.MediaCardController.reactivatePlayer();
		$U.core.LifecycleHandler.registerListener($U.core.RefreshApplication.refreshDialog, $U.core.Configuration.LIFECYCLE_TIMINGS.SLEEP_REFRESH, $U.core.LifecycleHandler.APPEVENT_TYPES.SLEEP);
	};

	return {
		reload : reload,
		reloadDialog : reloadDialog,
		refresh : refresh,
		refreshDialog : refreshDialog,
		cancelRefresh : cancelRefresh
	};

}());
