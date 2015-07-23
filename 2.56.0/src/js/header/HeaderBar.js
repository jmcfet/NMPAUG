/**
 * Object that represents a header bar
 * @class $U.header.HeaderBar

 * Object that represents a Header
 * @template
 * @constructor
 * @param {HTMLElement} container
 */
var $U = $U || {};
$U.header = $U.header || {};

$U.header.HeaderBar = ( function() {

	var proto;
	var ATTRIBUTE_TYPES = {
		DATA_ATTRIBUTE : "data-attribute"
	};
	//font awesome icon class names used throughout the header bar
	var HEADER_ICONS = {
		iconLock : "header-icons icon-lock icon-2x",
		iconUnlock : "header-icons icon-unlock icon-2x",
		iconSettings : "header-icons icon-cog icon-2x",
		iconSearch : "header-icons icon-search icon-2x",
		iconMenu : "header-icons icon-reorder icon-2x"
	};
	// Elements used throughout the header bar
	var HEADER_EL = {
		a : "a",
		i : "i",
		div : "div",
		li : "li",
		ul : "ul",
		image : "img",
		sup : "sup",
		input : "input",
		button : "button"
	};

	var HeaderBar = function(owner) {
		var parentalIcon;

		parentalIcon = $U.core.parentalcontrols.ParentalControls.isLocked() ? HEADER_ICONS.iconLock : $U.header.HeaderBar.HEADER_ICONS.iconUnlock;

		this._buttons = [];
		this._tabs = [];
		this._build();
		this._context = null;
		this._searchOpenDefault = $U.core.Device.isDesktop() ? true : false;
		this._buttonsOnTop = [];

		if ($U.core.Gateway.isGatewayAllowed()) {
			HeaderBar.gestureEvent = new window.Hammer(this._container);
			HeaderBar.gestureEvent.on('swipedown', function(ev) {
				$U.core.Gateway.swipeToFetchGesture();
			});
		}
		// Create the search component
		this._searchBar = $U.core.widgets.search.SearchBar.create(this);
		this._populate();
	};

	proto = HeaderBar.prototype;

	/**
	 * Depending on which device we are using choose create the header
	 *  @param {Object} owner
	 */
	HeaderBar.create = function(owner) {
		var result = null;
		switch ($U.core.Device.getFF()) {
		case $U.core.Device.FF.PHONE:
			result = new $U.header.PhoneHeaderBar(owner);
			break;

		case $U.core.Device.FF.TABLET:
			result = new $U.header.TabletHeaderBar(owner);
			break;

		case $U.core.Device.FF.DESKTOP:
			result = new $U.header.DesktopHeaderBar(owner);
			break;
		}
		return result;
	};

	HeaderBar.createButtonObj = function(name, id, dataAttr, icon, clickHandler) {
		return {
			name : name,
			id : id,
			dataAttr : dataAttr,
			icon : icon,
			eventListener : clickHandler
		};
	};

	HeaderBar.createTabsObj = function(name, id, dataAttr, clickHandler) {
		return {
			name : name,
			id : id,
			dataAttr : dataAttr,
			eventListener : clickHandler
		};
	};

	proto._build = function() {
		var backButtonContainer;
		var backButton;

		//@formatter:off

		this._container = this._createDomEl(HEADER_EL.div, "header", "header", $U.core.View.getViewContainer());
		this._toolBarContainer = this._createDomEl(HEADER_EL.div, "defaultToolbar", "toolbar", this._container);
		this._logoContainer = this._createDomEl(HEADER_EL.div, "logo", "header-logo show", this._container);

		backButtonContainer = this._createDomEl(HEADER_EL.div, "backButton", "back-button", this._container);
		backButton = $U.core.util.DomEl.createEl(HEADER_EL.i).setClassName("header-icons icon-chevron-left icon-2x").attachTo(backButtonContainer).asElement();

		backButtonContainer.addEventListener("click", function() {
			$(".tabbed-nav .tabs a").removeClass("active");
			$U.core.View.goBack();
		});
	};

	/**
	 * Populates the header bar
	 * @private
	 */
	proto._populate = function() {
		this._createTabs();
		this._createToolBar();
	};

	/**
	 * Create the toolbar
	 * @private
	 **/
	proto._createToolBar = function() {
		var icon;
		var parentalIcon;
		var buttonContainer;
		var button;

		buttonContainer = document.getElementById("defaultToolbar");

		for (var i = 0; i < this._buttons.length; i++) {
			// Create each of the buttons in the toolbar
			button = this._createDomEl(HEADER_EL.button, this._buttons[i].id, "tools webkit-render-fix", this._toolBarContainer, this._buttons[i].dataAttr);

            // Attach the event handler
            if ($U.core.Device.isIE9() || $U.core.Device.isIE10()) {
                //TK-17223: hack needed on IE10 and IE9, it avoids calling the click if it comes from a keydown on the search input.
                button.addEventListener("click", (function(btnIndex, evt) {
                    if (!this._searchBar.isKeyDowneventInProgress()) {
                        this._buttons[btnIndex].eventListener(evt);
                    }
                }).bind(this, i));
            } else {
                button.addEventListener("click", this._buttons[i].eventListener);
            }



			// When creating a parental control icon we want to show the rating for display
			if(this._buttons[i].dataAttr === "parental"){
				$U.core.util.DomEl.createElWithText(HEADER_EL.sup, $U.core.parentalcontrols.ParentalControls.getRatingForDisplay())
					.attachTo(button)
					.asElement();
			}

			this._createDomEl(HEADER_EL.i,"", this._buttons[i].icon, button);
		}

		// If the search by is not open by default then initialise and then hide it
		if(!this._searchOpenDefault){
			this._searchBar.init(this.getSearchButton().parentNode);
			this._searchBar.hide();
		} else {
			this._searchBar.init(this._toolBarContainer);
		}
	};

	/**
	 * creates the tabs
	 * @private
	 */
	proto._createTabs = function() {
		var tabContainer;
		var tab;
		var button;

		this._tabs.push(HeaderBar.createTabsObj($U.core.util.StringHelper.getString("btnBrowse"), "browseButton", "browse", this._tabsHandler));
		this._tabs.push(HeaderBar.createTabsObj($U.core.util.StringHelper.getString("btnChannels"), "channelsButton", "epg", this._tabsHandler));

		//@formatter:off
		tabContainer = $U.core.util.DomEl.createEl(HEADER_EL.ul)
			.setClassName("tabbed-nav")
			.attachTo(this._container);
		//@formatter:on

		for (var i = 0; i < this._tabs.length; i++) {
			tab = $U.core.util.DomEl.createEl("li").setClassName("tabs").attachTo(tabContainer);
			button = this._createDomElText(HEADER_EL.a, this._tabs[i].name, this._tabs[i].id, "", tab, this._tabs[i].dataAttr);
			button.addEventListener("click", this._tabs[i].eventListener.bind(this));
		}
	};

	proto._createDomEl = function(element, id, className, attachToEl, dataAttr) {
		return $U.core.util.DomEl.createEl(element).setId(id).setClassName(className).attachTo(attachToEl).setAttribute("data-attribute", dataAttr).asElement();
	};

	proto._createDomElText = function(element, text, id, className, attachToEl, dataAttr) {
		return $U.core.util.DomEl.createElWithText(element, text).setId(id).setClassName(className).attachTo(attachToEl).setAttribute("data-attribute", dataAttr).asElement();
	};
	
	/**
	 * Handler for the tabs
	 * @param {Event} evt
	 * @private
	 */
	proto._tabsHandler = function(evt) {
		var buttonDataAttribute = evt.currentTarget.getAttribute(ATTRIBUTE_TYPES.DATA_ATTRIBUTE);

		this.deactivateTabs();
		
		var curScreenId = $U.core.View.getCurrentScreenId();
		var self = this;
		
		switch (buttonDataAttribute) {
		case "browse" :
			$U.core.View.showBrowseScreen(false, false, function() {
					self._activateTabHandlerFromScreenId(curScreenId);
				});
			break;
		case "epg" :
			$U.core.View.showEPGScreen(function() {
					self._activateTabHandlerFromScreenId(curScreenId);
				});
			break;
		}
	};
	
	proto._activateTabHandlerFromScreenId = function(currentScreenId) {
		if(currentScreenId === $U.core.View.SCREENID.EPG) {
			this.activateChannelsTab();
		} else if((currentScreenId === $U.core.View.SCREENID.BROWSE) ||
				  (currentScreenId === $U.core.View.SCREENID.SEARCH) ||
				  (currentScreenId === $U.core.View.SCREENID.CATEGORY) ||
				  (currentScreenId === $U.core.View.SCREENID.MULTICATEGORY)) {
			this.activateBrowseTab();
		}
	};

	/**
	 *Callback used when a tool item is clicked
	 * @param {Object} item an object representing the tool clicked
	 */
	proto._toolsHandler = function(evt) {
		var dataAttr = evt.currentTarget.getAttribute(ATTRIBUTE_TYPES.DATA_ATTRIBUTE);

		switch (dataAttr) {
		case "parental" :
			if (!$U.core.View.getDialog()) {
				$U.core.parentalcontrols.ParentalControls.showMenu();
				this.highlightParentalButton();
				this._buttonsOnTop = [];
				this._buttonsOnTop.push(this.getParentalButton());
			} else {
				$U.core.View.hideDialog();
				this.removeHighlightParentalButton();
				this._buttonsOnTop = [];
			}
			break;
		case "settings" :
			if (!$U.core.View.getDialog()) {
				$U.settings.AppSettings.showMenu();
				this.highlightSettingsButton();
				this._buttonsOnTop = [];
				this._buttonsOnTop.push(this.getSettingsButton());
			} else {
				$U.core.View.hideDialog();
				this.removeHighlightSettingsButton();
				this._buttonsOnTop = [];
			}
			break;
		case "search" :
			this._clearHeaderBar();
			// Show the search bar
			this._searchBar.show();

			break;
		}
	};

	/**
	 * runs the code when a tab becomes active
	 * in this case just highlighting it
	 * @param {Object} context the context being shown
	 */
	proto.activateTab = function(context, hasHistory) {

		this._context = context;
		this._hasHistory = hasHistory;

		if (this._context !== $U.core.View.SCREENID.SEARCH) {
			if (!this._searchOpenDefault) {
				this._searchBar.hide();
				this.restoreHeaderBar();
			}
		}
		switch (this._context) {
		case $U.core.View.SCREENID.EPG:
			this.activateChannelsTab();
			break;
		case $U.core.View.SCREENID.BROWSE:
		case $U.core.View.SCREENID.CATEGORY:
		case $U.core.View.SCREENID.MULTICATEGORY:
			this.activateBrowseTab();
			break;
		}

		this._setBackButtonOrLogo(this._context, this._hasHistory);
	};

	proto._setBackButtonOrLogo = function(context, hasHistory) {
		/* jshint noempty: false */
		var ctx = context || $U.core.View.getCurrentScreenId();

		switch(ctx) {
		case $U.core.View.SCREENID.MEDIACARD:
		case $U.core.View.SCREENID.DIALOG:
		case $U.core.View.SCREENID.CATEGORY:
		case $U.core.View.SCREENID.MULTICATEGORY:
			this._hideLogo();
			this._showBackButton();
			break;
		default :

			if (context === $U.core.View.SCREENID.SEARCH && this._searchBar.getIsShown()) {
				// do nothing
			} else if(hasHistory){
				this._hideLogo();
				this._showBackButton();
			} else {
				this._showLogo();
				this._hideBackButton();
			}
		}
	};

	/**
	 * activates the browse tab
	 */
	proto.activateBrowseTab = function() {
		$U.core.util.HtmlHelper.setClass(this.getBrowseTab(), "active");
	};
	/**
	 * activates the channel tab
	 */
	proto.activateChannelsTab = function() {
		$U.core.util.HtmlHelper.setClass(this.getChannelsTab(), "active");
	};

	/**
	 * deactivates all tabs
	 * removes the activation class from the tab
	 * @param {Object} context
	 */
	proto.deactivateTabs = function() {
		this.deactiveBrowseTab();
		this.deactiveChannelsTab();
	};
	/**
	 * deactivates the browse tab
	 */
	proto.deactiveBrowseTab = function() {
		$U.core.util.HtmlHelper.removeClass(this.getBrowseTab(), "active");
	};
	/**
	 * deactivates the channels tab
	 */
	proto.deactiveChannelsTab = function() {
		$U.core.util.HtmlHelper.removeClass(this.getChannelsTab(), "active");
	};

	/**
	 * get the height of the header
	 */
	proto.getHeight = function() {
		return this._container.offsetHeight;
	};

	/**
	 * Enable the HeaderBar. Does nothing in this implementation. Override if required.
	 */
	proto.enable = function() {

	};

	/**
	 * Disable the HeaderBar. Does nothing in this implementation. Override if required.
	 */
	proto.disable = function() {

	};

	/**
	 * Hides the search Icon
	 */
	proto._hideSearchIcon = function() {
		var searchButton = this.getSearchButton();
		if (searchButton) {
			$U.core.util.HtmlHelper.setDisplayNone(searchButton);
		}
	};

	/**
	 * Shows the search Icon
	 */
	proto._showSearchIcon = function() {
		var searchButton = this.getSearchButton();
		if (searchButton) {
			$U.core.util.HtmlHelper.setDisplayInlineBlock(searchButton);
		}
	};

	proto._hideMenuButton = function() {
		var menuButton = this.getMenuButton();
		if (menuButton) {
			$U.core.util.HtmlHelper.setDisplayNone(menuButton);
		}
	};

	proto._showMenuButton = function() {
		var menuButton = this.getMenuButton();
		if (menuButton) {
			$U.core.util.HtmlHelper.setDisplayInlineBlock(menuButton);
		}
	};

	proto._hideParentalButton = function() {
		var parentalButton = this.getParentalButton();
		if (parentalButton) {
			$U.core.util.HtmlHelper.setDisplayNone(parentalButton);
		}
	};

	proto._showParentalButton = function() {
		var parentalButton = this.getParentalButton();
		if (parentalButton) {
			$U.core.util.HtmlHelper.setDisplayInlineBlock(parentalButton);
		}
	};

	proto._hideSettingsButton = function() {
		var settingsButton = this.getSettingsButton();
		if (settingsButton) {
			$U.core.util.HtmlHelper.setDisplayNone(settingsButton);
		}
	};

	proto._showSettingsButton = function() {
		var settingsButton = this.getSettingsButton();
		if (settingsButton) {
			$U.core.util.HtmlHelper.setDisplayInlineBlock(settingsButton);
		}
	};

	proto._hideBrowseTab = function() {
		var browseTab = this.getBrowseTab();
		if (browseTab) {
			$U.core.util.HtmlHelper.setDisplayNone(browseTab);
		}
	};

	proto._showBrowseTab = function() {
		var browseTab = this.getBrowseTab();
		if (browseTab) {
			$U.core.util.HtmlHelper.setDisplayBlock(browseTab);
		}
	};

	proto._hideChannelsTab = function() {
		var channelsTab = this.getChannelsTab();
		if (channelsTab) {
			$U.core.util.HtmlHelper.setDisplayNone(channelsTab);
		}
	};

	proto._showChannelsTab = function() {
		var channelsTab = this.getChannelsTab();
		if (channelsTab) {
			$U.core.util.HtmlHelper.setDisplayBlock(channelsTab);
		}
	};

	proto._hideLogo = function() {
		var logo = this.getLogo();
		if (logo) {
			$U.core.util.HtmlHelper.setDisplayNone(logo);
		}
	};

	proto._showTitle = function() {
		var title = this.getTitle();
		if (title) {
			$U.core.util.HtmlHelper.setDisplayInlineBlock(title);
		}
	};

	proto._hideTitle = function() {
		var title = this.getTitle();
		if (title) {
			$U.core.util.HtmlHelper.setDisplayNone(title);
		}
	};

	proto._showLogo = function() {
		var logo = this.getLogo();
		if (logo) {
			$U.core.util.HtmlHelper.setDisplayBlock(logo);
		}
	};

	/**
	 * hides the header title
	 *
	 */
	proto._hideHeaderTitle = function() {
		if (this._headerTitle) {
			$U.core.util.HtmlHelper.setDisplayNone(this._headerTitle);
		}
	};

	/**
	 * shows the header title
	 */
	proto._showHeaderTitle = function() {
		if (this._headerTitle) {
			$U.core.util.HtmlHelper.setDisplayInlineBlock(this._headerTitle);
		}
	};

	/**
	 * hides the back button
	 */
	proto._hideBackButton = function() {
		var backButton = this.getBackButton();
		if (backButton) {
			$U.core.util.HtmlHelper.setDisplayNone(backButton);
		}
	};

	/**
	 * shows the header title
	 */
	proto._showBackButton = function() {
		var backButton = this.getBackButton();
		if (backButton) {
			$U.core.util.HtmlHelper.setDisplayBlock(backButton);
		}
	};

	proto._clearHeaderBar = function() {
		var defaultToolbarEl = document.getElementById("defaultToolbar");
		this._hideSearchIcon();
		this._hideMenuButton();
		this._hideParentalButton();
		this._hideSettingsButton();
		this._hideBrowseTab();
		this._hideChannelsTab();
		this._hideLogo();
		this._hideBackButton();
		this._hideTitle();
		defaultToolbarEl.style.width = "100%";
	};

	proto.restoreHeaderBar = function() {
		var defaultToolbarEl = document.getElementById("defaultToolbar");
		this._searchBar.hide();
		this._showSearchIcon();
		this._showMenuButton();
		this._showParentalButton();
		this._showSettingsButton();
		this._showBrowseTab();
		this._showChannelsTab();
		this._showTitle();
		this._setBackButtonOrLogo();
		defaultToolbarEl.style.width = "auto";
	};

	/**
	 * sets the parental icon to locked
	 */
	proto.setParentalIconLocked = function() {
		var parentalButton = this.getParentalButton();
		var icon = parentalButton.getElementsByTagName("i")[0];
		icon.className = HEADER_ICONS.iconLock;
	};
	/**
	 * sets the parental icon to unlocked
	 */
	proto.setParentalIconUnLocked = function() {
		var parentalButton = this.getParentalButton();
		var icon = parentalButton.getElementsByTagName("i")[0];
		icon.className = HEADER_ICONS.iconUnlock;
	};

	/**
	 * internal method for deactivating a button
	 * @param {Object} btn an object representing a tool button
	 * @private
	 */
	proto._deactivateButton = function(btn) {
		if (btn) {
			btn.setAttribute("disabled", "disabled");
			$U.core.util.HtmlHelper.setClass(btn, "deactivate");
		}
	};
	/**
	 * internal method for activating a button
	 * @param {Object} btn an object representing a tool button
	 * @private
	 */
	proto._activateButton = function(btn) {
		if (btn) {
			btn.removeAttribute("disabled");
			$U.core.util.HtmlHelper.removeClass(btn, "deactivate");
		}
	};

	/**
	 * internal method for adding a highlight to a button
	 * @param {Object} btn an object representing a tool button
	 * @private
	 */
	proto._highlightButton = function(btn) {
		if (btn) {
			this._moveButtonToTop(btn);
			$U.core.util.HtmlHelper.setClass(btn, "active");
		}
	};

	/**
	 * internal method for removing a highlight from a button
	 * @param {Object} btn an object representing a tool button
	 * @private
	 */
	proto._removeHighlightButton = function(btn) {
		if (btn) {
			this._removeButtonFromTop(btn);
			$U.core.util.HtmlHelper.removeClass(btn, "active");
		}
	};
	
	/**
	 * internal method for moving a button over everything else
	 * @param {Object} btn an object representing a tool button
	 * @private
	 */
	proto._moveButtonToTop = function(btn) {
		if (btn) {
			btn.style.zIndex = 1;
		}
	};
	
	/**
	 * internal method for moving a button to its original z position
	 * @param {Object} btn an object representing a tool button
	 * @private
	 */
	proto._removeButtonFromTop = function(btn) {
		if (btn) {
			btn.style.zIndex = 0;
		}
	};

	/**
	 * Deactivate parental button
	 */
	proto.deactivateParentalButton = function() {
		this._deactivateButton(this.getParentalButton());
	};
	/**
	 * Deactivate settings button
	 */
	proto.deactivateSettingsButton = function() {
		this._deactivateButton(this.getSettingsButton());
	};
	/**
	 * Deactivate search button
	 */
	proto.deactivateSearchButton = function() {
		this._deactivateButton(this.getSearchButton());
	};
	/**
	 * Activates parental button
	 */
	proto.activateParentalButton = function() {
		this._activateButton(this.getParentalButton());
	};
	/**
	 * Activates settings button
	 */
	proto.activateSettingsButton = function() {
		this._activateButton(this.getSettingsButton());
	};
	/**
	 * Activates search button
	 */
	proto.activateSearchButton = function() {
		this._activateButton(this.getSearchButton());
	};

	/**
	 * Highlight parental button
	 */
	proto.highlightParentalButton = function() {
		this._highlightButton(this.getParentalButton());
	};
	/**
	 * Highlight settings button
	 */
	proto.highlightSettingsButton = function() {
		this._highlightButton(this.getSettingsButton());
	};
	/**
	 * Highlight search button
	 */
	proto.highlightSearchButtonButton = function() {
		this._highlightButton(this.getSearchButton());
	};
	/**
	 * removes the highlight on parental button
	 */
	proto.removeHighlightParentalButton = function() {
		this._removeHighlightButton(this.getParentalButton());
	};
	/**
	 * removes the highlight on search button
	 */
	proto.removeHighlightSearchButton = function() {
		this._removeHighlightButton(this.getSearchButton());
	};
	/**
	 * removes the highlight on settings button
	 */
	proto.removeHighlightSettingsButton = function() {
		this._removeHighlightButton(this.getSettingsButton());
	};

	proto.removeHighlightAllButtons = function() {
		var that = this;
		this._buttons.forEach(function(item, ind, arr) {
			that._removeHighlightButton(item);
		});
	};
	
	/**
	 * Removes all buttons from top z position so that they don't appear over a dialog.
	 */
	proto.removeAllButtonsFromTop = function() {
		var self = this;
		this._buttonsOnTop.forEach(function(item, ind, arr) {
			self._removeButtonFromTop(item);
		});
	};
	
	/**
	 * Restore all buttons to previous top z position.
	 */
	proto.restoreAllButtonsToTop = function() {
		var self = this;
		this._buttonsOnTop.forEach(function(item, ind, arr) {
			self._moveButtonToTop(item);
		});
	};
		
	/**
	 * gets the menu button
	 * @returns {Object}
	 */
	proto.getMenuButton = function() {
		return document.getElementById("menuButton");
	};

	/**
	 * gets the parental button
	 * @returns {Object}
	 */
	proto.getParentalButton = function() {
		return document.getElementById("parentalButton");
	};
	/**
	 * gets the settings button
	 * @returns {Object}
	 */
	proto.getSettingsButton = function() {
		return document.getElementById("settingsButton");
	};
	/**
	 * gets the search button
	 * @returns {Object}
	 */
	proto.getSearchButton = function() {
		return document.getElementById("searchButton");
	};
	/**
	 * gets the browse tab
	 * @returns {Object}
	 */
	proto.getBrowseTab = function() {
		return document.getElementById("browseButton");
	};
	/**
	 * gets the channels tab
	 * @returns {Object}
	 */
	proto.getChannelsTab = function() {
		return document.getElementById("channelsButton");
	};
	/**
	 * gets the logo
	 * @returns {Object}
	 */
	proto.getLogo = function() {
		return document.getElementById("logo");
	};

	/**
	 * gets the logo
	 * @returns {Object}
	 */
	proto.getTitle = function() {
		return document.getElementById("headerTitle");
	};

	/**
	 * get the back button
	 */
	proto.getBackButton = function() {
		return document.getElementById("backButton");
	};

	proto.isSearchBarOpen = function() {
		return this._searchBarOpen;
	};

	HeaderBar.HEADER_EL = HEADER_EL;
	HeaderBar.HEADER_ICONS = HEADER_ICONS;
	HeaderBar.ATTRIBUTE_TYPES = ATTRIBUTE_TYPES;

	return HeaderBar;

}());
