/**
 * RecentlyViewedCategoryProvider
 *
 * @class $U.core.category.recentlyviewed.RecentlyViewedCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.recentlyviewed = $U.core.category.recentlyviewed || {};

$U.core.category.recentlyviewed.RecentlyViewedCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var ID = "$RECENTLY_VIEWED_CATEGORY_PROVIDER";

	var TITLE = "menuRecentlyViewed";

	var DISPLAY_ORDER = 1;

	function RecentlyViewedCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}

	$N.apps.util.Util.extend(RecentlyViewedCategoryProvider, superClass);

	var proto = RecentlyViewedCategoryProvider.prototype;

	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of recently viewed
	 * @return a customCategory containing the recently viewed
	 */
	proto._createCustomCategory = function() {
		var custCat = {
			id : this.id,
			name : this.title,
			active : false,
			content : $U.core.category.recentlyviewed.RecentlyViewed.getCustomCategoryItems()
		};

		return custCat;
	};

	/**
	 * Reloads the recently viewed items from the server and transforms them into the custom category structure to populate the assetscroller
	 */
	proto._fetchItems = function() {
		var that = this;
		var serverCallback = function() {
			var customCategory = that._createCustomCategory();
			var result = $U.core.category.CategoryProvider._getAssetsFromCustomCategory(customCategory);
			that.loadMediaItems(result);
		};
		$U.core.category.recentlyviewed.RecentlyViewed.getRecentlyWatchedFromServer(serverCallback);
	};

	RecentlyViewedCategoryProvider.ID = ID;

	return RecentlyViewedCategoryProvider;
}());
