/**
 * Implements the Options, which looks after the flow of the Options menu
 *
 * @class $U.core.Options
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.Options = ( function() {

	var logger = $U.core.Logger.getLogger("Options");

	var _inFlow = false;
	var menuStack = [];
	var MENUID = {
		MAIN : {
			name : "main"
		},
		CATEGORIES : {
			name : "categories"
		},
		PARENTAL_LIST : {
			name : "parental_list"
		},
		PARENTAL_PASSWORD : {
			name : "parental_password"
		},
		PARENTAL_REFRESH : {
			name : "parental_refresh"
		},
		PARENTAL_FAILURE : {
			name : "parental_failure"
		},
		SETTINGS : {
			name : "settings"
		},
		CHANGE_LANGUAGE : {
			name : "change_language"
		},
		REFRESH : {
			name : "refresh"
		},
		CHANGE_DEVICENAME : {
			name : "change_devicename"
		},
		CHANGE_SUBTITLES : {
			name : "change_subtitles"
		},
		MOBILE_VIDEO : {
			name : "mobile_video"
		}
	};
	var currentMenu;

	/*
	1) 3-bar button starts/stops the Option flow
	2) back button returns to the previous option screen
	3) View.js knows when in options, Options.js handles options flow
	4) options should use the same config files as the dialogs on the tablet/desktop
	5) Category menu should be brought into options
	6) layouts of options should be unified (category and options list look the same)
	7) resize handled elegantly
	*/

	/**
	 * starts the options flow (opens the options menu)
	 * @private (called by toggle)
	 */
	var _start = function() {
		_inFlow = true;
		currentMenu = null;
		showMenu(MENUID.MAIN);
	};

	/**
	 * stops the options flow (clears the options stack and returns to views stack)
	 * @private(called by toggle)
	 */
	var _stop = function() {
		var dialog = $U.core.View.popDialog();

		if ($U.core.View.getCatalogueMenu().isVisible()) {
			$U.core.View.hideCatalogueMenu();
		}

		_inFlow = false;
		menuStack = [];
		currentMenu = null;

		while (dialog) {
			dialog.hide();
			dialog = $U.core.View.popDialog();
		}
		$U.core.View.hideDialog();
		$U.core.View.goBack(true);
	};

	/**
	 * Calls the correct flow to show the desired menu, adds the id to the menuStack
	 * @param menuId the id of the menu to show
	 */
	var showMenu = function(menuId) {
		if (currentMenu && currentMenu !== menuId) {
			menuStack.push(currentMenu);
			if (logger) {
				logger.log("showMenu", "Stack : " + JSON.stringify(menuStack));
			}
		}
		currentMenu = menuId;
		switch(menuId) {
		case MENUID.MAIN:
			$U.core.PhoneNavigationMenu.show();
			break;
		case MENUID.CATEGORIES:
			$U.core.View.getHeader().activateTab($U.core.View.SCREENID.CATEGORY);
			$U.core.View.showCatalogueMenu();
			break;
		case MENUID.PARENTAL_LIST:
			$U.core.parentalcontrols.ParentalControls.showMenu();
			break;
		case MENUID.PARENTAL_PASSWORD:
			break;
		case MENUID.PARENTAL_REFRESH:
			break;
		case MENUID.PARENTAL_FAILURE:
			break;
		case MENUID.SETTINGS:
			$U.settings.AppSettings.showMenu();
			break;
		case MENUID.CHANGE_LANGUAGE:
			break;
		case MENUID.REFRESH:
			_inFlow = true;
			break;
		case MENUID.CHANGE_DEVICENAME:
			break;
		}
		if (menuId !== MENUID.CATEGORIES) {
			$U.core.View.getDialog().show();
		}
	};

	/**
	 * Goes back in the flow, pops the top item in the menuStack and calls showMenu with it
	 */
	var goBack = function(stop) {
		var menuId = menuStack.pop();
		if (logger) {
			logger.log("goBack", "Stack : " + JSON.stringify(menuStack) + "currentMenu : " + JSON.stringify(currentMenu));
		}
		if (currentMenu === MENUID.REFRESH) {
			$U.core.RefreshApplication.cancelRefresh();
		}
		if (stop || !menuId) {
			_stop();
			return;
		} else if (currentMenu === MENUID.CATEGORIES) {
			$U.core.View.hideCatalogueMenu();
		} else if (menuId) {
			$U.core.View.popDialog().hide();
		}
		currentMenu = menuId;
		$U.core.View.getHeader().activateTab($U.core.View.SCREENID.DIALOG);
	};

	/**
	 * Public function to expose the _inFlow boolean
	 * @return _inFlow
	 */
	var inFlow = function() {
		return _inFlow;
	};

	/**
	 * toggles the options flow
	 */
	var toggle = function() {
		if (inFlow()) {
			//_stop();
			goBack(true);
		} else {
			_start();
		}
	};

	function destroy() {
		_inFlow = false;
		menuStack = [];
		currentMenu = null;
	}

	return {
		MENUID : MENUID,
		showMenu : showMenu,
		goBack : goBack,
		inFlow : inFlow,
		toggle : toggle,
		destroy : destroy
	};
}());
