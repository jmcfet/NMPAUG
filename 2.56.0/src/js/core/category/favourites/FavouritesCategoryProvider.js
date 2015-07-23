/**
 * FavouritesCategoryProvider
 *
 * @class $U.core.category.favourites.FavouritesCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.favourites = $U.core.category.favourites || {};

$U.core.category.favourites.FavouritesCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var ID = "$FAVOURITES_CATEGORY_PROVIDER";

	var TITLE = "menuFavourites";

	var DISPLAY_ORDER = 0;

	function FavouritesCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(FavouritesCategoryProvider, superClass);

	var proto = FavouritesCategoryProvider.prototype;

	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of favourites
	 * @return a customCategory containing the favourites
	 */
	proto._createCustomCategory = function() {
		var custCat = {
			id : this.id,
			name : this.title,
			active : false,
			content : $U.core.category.favourites.Favourites.getCustomCategoryItems()
		};

		return custCat;
	};

	/**
	 * Reloads the favourite items from the server and transforms them into the custom category structure to populate the assetscroller
	 */
	proto._fetchItems = function() {
		var that = this;
		var serverCallback = function() {
			var customCategory = that._createCustomCategory();
			var result = $U.core.category.CategoryProvider._getAssetsFromCustomCategory(customCategory);
			that.loadMediaItems(result);
		};
		$U.core.category.favourites.Favourites.getFavs(serverCallback);
	};

	FavouritesCategoryProvider.ID = ID;

	return FavouritesCategoryProvider;
}());
