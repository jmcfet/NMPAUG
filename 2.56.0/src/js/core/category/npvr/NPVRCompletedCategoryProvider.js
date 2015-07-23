/**
 * NPVRCompletedCategoryProvider delivers NPVRItems for a non-catalogue category
 *
 * @class $U.core.category.npvr.NPVRCompletedCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.npvr = $U.core.category.npvr || {};

$U.core.category.npvr.NPVRCompletedCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var logger = $U.core.Logger.getLogger("NPVRCompletedCategoryProvider");

	var ID = "$NPVR_COMPLETED_CATEGORY_PROVIDER";
	var TITLE = "menuNPVRCompleted";
	var DISPLAY_ORDER = 1;

	function NPVRCompletedCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(NPVRCompletedCategoryProvider, superClass);

	var proto = NPVRCompletedCategoryProvider.prototype;

	/**
	 * @return {boolean}
	 */
	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of recorded
	 * @return {Object} A customCategory containing the recorded items
	 */
	proto._createCustomCategory = function(items) {
		var custCat = {
			id : this.id,
			name : this.title,
			active : false,
			content : items
		};

		return custCat;
	};

	/**
	 * Reloads the recording task items from the server and transforms them into the custom category structure to populate the assetscroller
	 * @private
	 */

	proto._fetchItems = function() {
		var that = this;

		var callback = function(NPVRItems) {
			var items = [];
			if (NPVRItems && NPVRItems.length > 0) {
				NPVRItems.forEach(function(item, ind, arr) {
					//if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(item.rating)) {
					items.push(item);
					//}
				});
			}
			//sort the items DESC by start times
			items.sort(function(a, b) {
				return b.startTime - a.startTime;
			});
			that._createCustomCategory(items);
			window.setTimeout(function() {
				that._browseCallback(items, that);
			}, 1);
		};

		$U.core.NPVRManager.getInstance().fetchCompletedRecordings(callback);
	};

	NPVRCompletedCategoryProvider.ID = ID;

	return NPVRCompletedCategoryProvider;
}());
