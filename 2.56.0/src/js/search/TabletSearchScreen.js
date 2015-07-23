/**
 * TabletSearchScreen is a special type of Search Screen
 *
 * @class $U.Search.TabletSearchScreen
 * @extends $U.Search.SearchScreen
 *
 * @constructor
 * Create a new TabletSearchScreen
 * @param {Object} owner
 * @param {string} id that will be assigned to the screens container
 */

var $U = $U || {};
$U.search = $U.search || {};

$U.search.TabletSearchScreen = ( function() {

	var logger = $U.core.Logger.getLogger("SearchScreen");

	var superClass;

	var proto;

	var NO_SEARCHRESULTS_KEY = "txtNoResultsInSearch";

	var SCROLLER_PADDING = {
		//this should ideally be read from SCSS $app_padding
		left : 20,
		right : 20// This needs to be the same as the catalogue menu width defined in menu.scss
	};

	function TabletSearchScreen(owner, docRef) {
		superClass.call(this, owner, docRef);

		// Create a new seach bar
		this._searchBar = $U.core.widgets.search.SearchBar.create(this);

		// Initialise the search bar with the container
		this._searchBar.init(document.getElementById(this._container.id));

	}

	// TabletSearchScreen Screen extends SearchScreen
	superClass = $U.search.SearchScreen;

	$N.apps.util.Util.extend(TabletSearchScreen, superClass);

	proto = TabletSearchScreen.prototype;


	/**
	 * Activates the Screen
	 */
	proto.activate = function() {

		superClass.prototype.activate.call(this);

		if (logger) {
			logger.log("activate", "enter");
		}

		if (!this._searchBar.isInSync()) {
			this._searchBar.performSearch();
		}
	};

	/**
	 * Deactivates the Screen
	 */
	proto.deactivate = function() {

		superClass.prototype.activate.call(this);

		if (logger) {
			logger.log("deactivate", "enter");
		}
		if (!this._searchBar.isInSync(0)) {
			this._clearNoItemsMessage();
			this._populateAssets([]);
		}
	};

	proto.resizeHandler = function() {
		superClass.prototype.resizeHandler.call(this);
		this._searchBar.resizeHandler();
	};

	/**
	 * returns the SCROLLER_PADDING used in the scrollers for this page
	 */
	proto.getScrollerPadding = function() {
		return SCROLLER_PADDING;
	};

	return TabletSearchScreen;

}());
