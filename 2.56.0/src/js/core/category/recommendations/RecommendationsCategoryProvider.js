/**
 * RecommendationsCategoryProvider
 *
 * @class $U.core.category.recommended.RecommendationsCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.recommendations = $U.core.category.recommendations || {};
$U.core.category.recommendations.RecommendationsCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var ID = "$RECOMMENDATIONS_CATEGORY_PROVIDER";

	var TITLE = "menuRecommendedForMe";

	var DISPLAY_ORDER = 0;

	function RecommendationsCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}
	
	$N.apps.util.Util.extend(RecommendationsCategoryProvider, superClass);
	
	var proto = RecommendationsCategoryProvider.prototype;
	
	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of recently viewed
	 * @return a customCategory containing the recently viewed
	 */
	proto._createCustomCategory = function(items) {
		var custCat = {
			id : this.id,
			name : this.title,
			active : false,
			content : items,
			totalAssetCount : items.length
		};

		return custCat;
	};

	/**
	 * Reloads the recently viewed items from the server and transforms them into the custom category structure to populate the assetscroller
	 */
	proto._fetchItems = function() {
		var that = this,
		returnMediaItems = function (items) {
			var customCategory = that._createCustomCategory(items);
			that._browseCallback(items, that);	
		};
		
		//$U.core.category.recommendations.Recommendations.getDynamicRecommendations(serverCallback);
		$U.core.menudata.ContentDiscovery.getDynamicRecommendationsForMe(returnMediaItems);
	};

	RecommendationsCategoryProvider.ID = ID;

	return RecommendationsCategoryProvider;
}());
