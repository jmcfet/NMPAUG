/**
 * PVRNowPlayingCategoryProvider delivers the currently playing items from the network devices
 *
 * @class $U.core.category.pvr.PVRNowPlayingCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRNowPlayingCategoryProvider = (function() {

	var superClass = $U.core.category.CategoryProvider;

	var logger = $U.core.Logger.getLogger("PVRNowPlayingCategoryProvider");

	var ID = "$NOW_PLAYING_CATEGORY_PROVIDER";
	var TITLE = "menuNowPlaying";
	var DISPLAY_ORDER = 1;

	function PVRNowPlayingCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(PVRNowPlayingCategoryProvider, superClass);

	var proto = PVRNowPlayingCategoryProvider.prototype;

	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of playing items
	 * @return {Object} A customCategory containing the Now Playing
	 */
	proto._createCustomCategory = function(items) {
		var custCat = {
			id: this.id,
			name: this.title,
			active: false,
			content: items
		};

		return custCat;
	};

	/**
	 * Reloads the item nowplaying on gateway and transforms them into the custom category structure to populate the assetscroller
	 * @private
	 */
	proto._fetchItems = function() {
		var that = this;
		$U.core.Gateway.fetchNowPlaying(function(gatewayItems) {
			var items = [];
			var i;
			var parentalBlocked = false;
			if (gatewayItems.length > 0) {
				for (i = 0; i < gatewayItems.length; i++) {
					if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(gatewayItems[i].rating)) {
						items.push(gatewayItems[i]);
					} else {
						parentalBlocked = true;
					}
				}
			}
			that._createCustomCategory(items);
			if (items.length === 0 && parentalBlocked) {
				that._browseCallback(items, that, parentalBlocked);
			} else {
				that._browseCallback(items, that);
			}

		});
	};

	PVRNowPlayingCategoryProvider.ID = ID;

	return PVRNowPlayingCategoryProvider;
}());