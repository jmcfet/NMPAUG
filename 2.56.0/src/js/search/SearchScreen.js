/**
 * SearchScreen is a special type of Asset Screen, it allows users to search VOD
 *
 * @class $U.Search.SearchScreen
 * @extends $U.core.AssetScreen
 *
 * @constructor
 * Create a new SearchScreen
 * @param {Object} owner
 * @param {string} id that will be assigned to the screens container
 */

var $U = $U || {};
$U.search = $U.search || {};

$U.search.SearchScreen = ( function() {

	var logger = $U.core.Logger.getLogger("SearchScreen");

	var superClass;

	var proto;

	var NO_SEARCHRESULTS_KEY = "txtNoResultsInSearch";

	function SearchScreen(owner, docRef) {
		var that = this;

		superClass.call(this, owner);

		this._docRef = docRef;
		//container created in assetScreen
		this._container.id = this._docRef;

		//Finally initialise for correct form factor
		this._initialiseForDevice();
	}

	// Search Screen extends AssetScreen
	superClass = $U.core.AssetScreen;

	$N.apps.util.Util.extend(SearchScreen, superClass);

	proto = SearchScreen.prototype;

	SearchScreen.create = function(owner, docRef) {
		var result = null;
		switch ($U.core.Device.getFF()) {
		case $U.core.Device.FF.TABLET:
		case $U.core.Device.FF.PHONE:
			result = new $U.search.PhoneSearchScreen(owner, docRef);
			break;
		case $U.core.Device.FF.DESKTOP:
			result = new $U.search.DesktopSearchScreen(owner, docRef);
			break;
		}
		return result;
	};

	/**
	 * Activates the Screen
	 */
	proto.activate = function() {
		this.resizeHandler();
	};

	/**
	 * Deactivates the Screen
	 */
	proto.deactivate = function() {
		// implemented by sub class
	};

	/**
	 * Populates the SearchScreen
	 * @param {Object} items
	 */
	proto.populate = function(items) {

		if (items.length === 0) {
			this._setNoItemsMessage(NO_SEARCHRESULTS_KEY);
		} else {
			this._clearNoItemsMessage();
		}

		this._populateAssets(items);
		this.resizeHandler();

	};

	proto.resizeHandler = function() {
		superClass.prototype.resizeHandler.call(this);
	};

	return SearchScreen;

}());
