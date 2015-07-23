/**
 * Object that represents a phone header bar
 *
 * @class $U.header.PhoneHeaderBar
 * @extends $U.header.HeaderBar
 *
 * @constructor
 * Create a new PhoneHeaderBar
 * @param {Object} owner
 */

var $U = $U || {};
$U.header = $U.header || {};
$U.header.PhoneHeaderBar = ( function() {

	var superClass = $U.header.HeaderBar;
	var proto;
	var menuButton;
	var menuButtonEventListener;

	var ATTRIBUTE_TYPES = $U.header.HeaderBar.ATTRIBUTE_TYPES;
	var HEADER_EL = $U.header.HeaderBar.HEADER_EL;
	var HEADER_ICONS = $U.header.HeaderBar.HEADER_ICONS;

	var PhoneHeaderBar = function(owner) {
		superClass.call(this, owner);

	};

	$N.apps.util.Util.extend(PhoneHeaderBar, $U.header.HeaderBar);
	proto = PhoneHeaderBar.prototype;

	/**
	 * Create the toolbar
	 * @private
	 */
	proto._createToolBar = function() {

		var toolContainer;
		var tool;
		var icon;

		this._buttons.push($U.header.HeaderBar.createButtonObj("Menu", "menuButton", "menu-button", HEADER_ICONS.iconMenu, this._toolsHandler.bind(this)));
		this._buttons.push($U.header.HeaderBar.createButtonObj("Search", "searchButton", "search", HEADER_ICONS.iconSearch, this._toolsHandler.bind(this)));

		superClass.prototype._createToolBar.call(this);
	};

	/**
	 * Populate the header bar
	 * @private
	 */
	proto._populate = function() {
		this._createHeaderTitle();
		this._createToolBar();
	};

	/**
	 * creates the tabs
	 * @private
	 */
	proto._createHeaderTitle = function() {
		//@formatter:off
		this._headerTitle = $U.core.util.DomEl.createElWithText(
			"h1", $U.core.util.StringHelper.getString("btnBrowse")
		).setId(
			"headerTitle"
		).setAttribute(
			"data-attribute", "browse"
		).setClassName(
			"tabs-title"
		).attachTo(
			this._container
		).asElement();
		//@formatter:on
	};

	/**
	 *Callback used when a tool item is clicked
	 * @param {Object} item an object representing the tool clicked
	 */
	proto._toolsHandler = function(evt) {
		var dataAttr = evt.currentTarget.getAttribute(ATTRIBUTE_TYPES.DATA_ATTRIBUTE);

		switch (dataAttr) {
		case "search" :
			// Check if the option menu is in flow if so close it
			if ($U.core.Options.inFlow()) {
				$U.core.Options.toggle();
			}

			this._clearHeaderBar();

			// Show the search bar
			this._searchBar.show();
			break;
		case "menu-button" :
			// Show/hide Options Menu
			$U.core.Options.toggle();
			break;
		}
	};

	/**
	 * Sets the header title
	 * @private
	 */
	proto._setHeaderTitle = function(title) {
		var titleEl = this._headerTitle;
		titleEl.textContent = title;
	};

	/**
	 * runs the code when a tab becomes active
	 * in this case putting the context name into the header
	 * @param {Object} context
	 * @param {boolean} hasHistory
	 */
	proto.activateTab = function(context, hasHistory) {
		var title = "";

		if (context !== $U.core.View.SCREENID.SEARCH) {
			this._searchBar.hide();
			this._searchBarOpen = false;
			this.restoreHeaderBar();
		}

		switch (context) {
		case $U.core.View.SCREENID.EPG:
			title = $U.core.util.StringHelper.getString("btnChannels");
			break;
		case $U.core.View.SCREENID.BROWSE:
			title = $U.core.util.StringHelper.getString("btnBrowse");
			break;
		case $U.core.View.SCREENID.CATEGORY:
			title = $U.core.util.StringHelper.getString("txtCategories");
			break;
		case $U.core.View.SCREENID.DIALOG:
			title = $U.core.View.getDialog().getTitle();
			break;
		}

		this._setBackButtonOrLogo(context, hasHistory);
		this._showHeaderTitle();
		this._setHeaderTitle(title);

	};

	return PhoneHeaderBar;

}());
