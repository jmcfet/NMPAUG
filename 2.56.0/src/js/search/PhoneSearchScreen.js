/**
 * TabletSearchScreen is a special type of Search Screen
 *
 * @class $U.Search.PhoneSearchScreen
 * @extends $U.Search.SearchScreen
 *
 * @constructor
 * Create a new PhoneSearchScreen
 * @param {Object} owner
 * @param {string} id that will be assigned to the screens container
 */

var $U = $U || {};
$U.search = $U.search || {};

$U.search.PhoneSearchScreen = ( function() {

	var logger = $U.core.Logger.getLogger("SearchScreen");

	var superClass;

	var proto;

	var NO_SEARCHRESULTS_KEY = "txtNoResultsInSearch";

	var SCROLLER_PADDING = {
		//this should ideally be read from SCSS $app_padding
		left : 10,
		right : 10// This needs to be the same as the catalogue menu width defined in menu.scss
	};

	function PhoneSearchScreen(owner, docRef) {
		superClass.call(this, owner, docRef);
	}

	// PhoneSearchScreen Screen extends SearchScreen
	superClass = $U.search.SearchScreen;

	$N.apps.util.Util.extend(PhoneSearchScreen, superClass);

	proto = PhoneSearchScreen.prototype;

	/**
	 * Activates the Screen
	 */
	proto.activate = function() {
		superClass.prototype.activate.call(this);
	};

	/**
	 * Deactivates the Screen
	 */
	proto.deactivate = function() {
		superClass.prototype.activate.call(this);
	};

	/**
	 * Populates the SearchScreen
	 * @param {Object} items
	 * @param {String} searchTerm
	 */

	proto.populate = function(items, searchTerm, startIndex, endIndex, totalItems) {

		var that = this;
		$U.core.View.showSearchScreen(function() {

			superClass.prototype.activate.call(that);

			if (items.length === 0) {
				that._setNoItemsMessage(NO_SEARCHRESULTS_KEY);
			} else {
				that._clearNoItemsMessage();
			}

			that._populateAssets(items, false, null, endIndex-startIndex, startIndex, totalItems, false);
			that.setTitle(searchTerm);
		});
	}; 


	/**
	 * Sets the title of the search screen
	 * @param {String} searchTerm
	 */
	proto.setTitle = function(searchTerm) {

		var title = $U.core.util.StringHelper.getString("txtSearchResults") + " " + searchTerm;

		if (!this._titleEl) {
			this._titleEl = $U.core.util.DomEl.createElWithText("h1", title).setClassName("category-title").attachTo(this._container).asElement();
		} else {
			this._titleEl.textContent = title;
		}
	};

	/**
	 * returns the SCROLLER_PADDING used in the scrollers for this page
	 */
	proto.getScrollerPadding = function() {
		return SCROLLER_PADDING;
	};

	/**
	 * Calls its parents initaliseMobile method and then performs search screen specific
	 * @private
	 */
	proto._initialiseForMobile = function() {
		var that = this;

		//Call the parents intilaiseForMobile method
		superClass.prototype._initialiseForMobile.call(this);

		//the phone search browser needs to be lower
		$(this._scrollerContainer).addClass("search-browser-container");
		$(this._sideBar).addClass("search-browser-container");
	};

	return PhoneSearchScreen;

}());
