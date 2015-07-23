var $U = $U || {};
$U.core = $U.core || {};

$U.core.PhoneNavigationMenu = ( function() {
	/**
	 * @class $U.core.PhoneNavigationMenu
	 * Contains configuration object for phoneMenu dialog and it's associated callback handler
	 */
	var ATTRIBUTE_TYPES = $U.header.HeaderBar.ATTRIBUTE_TYPES;
	var HEADER_EL = $U.header.HeaderBar.HEADER_EL;

	// Configuration values for dialog
	var DIALOG_TYPE = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS;
	var DIALOG_POSITION = "defaultToolbar";

	// String bundle key
	var PHONE_NAV_OPTIONS_KEY = "txtOptions";
	var PHONE_NAV_BROWSE_KEY = "txtBrowse";
	var PHONE_NAV_CATEGORIES_KEY = "txtCategories";
	var PHONE_NAV_CHANNELS_KEY =  "txtChannels";
	var PHONE_NAV_SEARCH_KEY  = "txtSearch";
	var PHONE_NAV_SETTINGS_KEY = "txtSettings";

	var getPhoneMenuDialog = function(currentScreenId) {
		var phoneMenuDialog = {
			title : $U.core.util.StringHelper.getString(PHONE_NAV_OPTIONS_KEY),
			position : DIALOG_POSITION,
			dialogBodyClass : "dialog-body dialog-no-padding",
			type : DIALOG_TYPE
		};
		var menuOpts = [];

		if (currentScreenId === $U.core.View.SCREENID.DIALOG) {
			currentScreenId = $U.core.View.getTopScreenId();
		}

		if (currentScreenId !== $U.core.View.SCREENID.BROWSE) {
			menuOpts.push({
				text : $U.core.util.StringHelper.getString(PHONE_NAV_BROWSE_KEY),
				icon : "icon-eye-open",
				name : "browse"
			});
		} else {
			menuOpts.push({
				text : $U.core.util.StringHelper.getString(PHONE_NAV_CATEGORIES_KEY),
				icon : "icon-list",
				name : "menu"
			});
		}

		if (currentScreenId !== $U.core.View.SCREENID.EPG) {
			menuOpts.push({
				text : $U.core.util.StringHelper.getString(PHONE_NAV_CHANNELS_KEY),
				icon : "icon-desktop",
				name : "epg"
			});
		}
		
		menuOpts.push({
			text : $U.core.util.StringHelper.getString(PHONE_NAV_SETTINGS_KEY),
			icon : "icon-cog",
			name : "settings"
		});

		phoneMenuDialog.listItems = menuOpts;
		return phoneMenuDialog;
	};

	/**
	 * Phone Menu Dialog handler function
	 * @param interactiveElements
	 * @param owner
	 */
	var dialogClickHandler = function(interactiveElements, owner) {
		switch (interactiveElements[0].buttonClicked) {
		case "browse" :
			$U.core.View.goBack();
			$U.core.View.showBrowseScreen();
			break;
		case "menu" :
			$U.core.Options.showMenu($U.core.Options.MENUID.CATEGORIES);
			break;
		case "epg" :
			$U.core.View.goBack();
			$U.core.View.showEPGScreen();
			break;
		case "search" :
			$(".tabbed-nav .tabs a").removeClass("active");
			$U.core.View.goBack();
			$U.core.View.showSearchScreen();
			break;
		case "settings" :
			$U.core.Options.showMenu($U.core.Options.MENUID.SETTINGS);
			break;
		}
	};

	/**
	 * Uses View to show the dialog
	 * @param owner
	 */
	var show = function(owner) {
		$U.core.View.showDialog(getPhoneMenuDialog($U.core.View.getCurrentScreenId()), dialogClickHandler, owner);
	};

	return {
		show : show
	};

}());
