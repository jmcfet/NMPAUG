/**
 * PVRChannelsCategoryProvider delivers PVRRecorded items for a non-catalogue category
 *
 * @class $U.core.category.pvr.PVRChannelsCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRChannelsCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var logger = $U.core.Logger.getLogger("PVRChannelsCategoryProvider");

	var ID = "$CHANNELS_CATEGORY_PROVIDER";
	var TITLE = "menuChannels";
	var DISPLAY_ORDER = 1;

	function PVRChannelsCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(PVRChannelsCategoryProvider, superClass);

	var proto = PVRChannelsCategoryProvider.prototype;

	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of recorded
	 * @return {Object} A customCategory containing the recorded items
	 */
	proto._createCustomCategory = function() {
		var custCat = {
			id : this.id,
			name : this.title,
			active : false,
			content : $U.core.category.pvr.PVRChannels.getCustomCategoryItems()
		};

		return custCat;
	};

	/**
	 * Custom loadMediaItems call that doesn't use IDs to populate the system, as recorded/scheduled items are data complete from the DLNA server.
	 * @param {Array} results
	 */
	proto.loadMediaItems = function(results) {
		// if (logger) {
		// logger.log("loadMediaItems", JSON.stringify(results));
		// }
		var i;

		var len = results.length;
		var id;

		this._loaders = [];
		this._channels = results;

		for ( i = 0; i < len; i++) {
			//this._loaders.push(new $U.core.mediaitem.mediaitemloader.OnNowItemLoader(results[i].data.serviceId, this));
			this._loaders.push(new $U.core.mediaitem.mediaitemloader.BTVChannelItemLoader(results[i].data.serviceId, this));
		}

		this._loadedCount = this._loaders.length;
		//this._browseCallback(this._loaders, this);
		if (this._loadedCount === 0) {
			//we don't have any results so send empty array back to asset container
			this._browseCallback(this._loaders, this);
		} else {
			for ( i = 0; i < len; i++) {
				this._loaders[i].load();
			}
		}
	};

	/*
	 * Callback for the itemLoaders to call when they have finished loading their mediaItem
	 */
	proto.loaded = function() {
		this._loadedCount--;
		if (this._loadedCount === 0) {
			this._checkItems();
		}
	};
	/*
	 * Checks the items that have been loaded, removes them if they are null (not loaded) or if they have too high a parental rating.<br>
	 * Once checked they are pumped into the assetContainer
	 * @private
	 */
	proto._checkItems = function() {
		var i;
		var len = this._loaders.length;
		var loadedCount = 0;
		var that = this;
		this._fetchedItems = [];
		for ( i = 0; i < len; i++) {
			if (this._loaders[i].hasItem) {
				if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(this._loaders[i].item.rating)) {
					this._fetchedItems.push(this._loaders[i].item);
				}
				loadedCount++;
			}
		}
		window.setTimeout(function() {
			that._browseCallback(that._fetchedItems, that);
		}, 1);
		//TODO: look at why this doesn't work
		if ($U.core.Device.isDesktop() && len > 0 && loadedCount === 0) {
			//MDS channels haven't loaded yet, will try again in 5 secs
			window.setTimeout(function() {
				$U.core.View.refreshCategory(ID);
			}, 5000);
		}
	};

	/**
	 * Reloads the recorded items from the server and transforms them into the custom category structure to populate the assetscroller
	 * @private
	 */

	proto._fetchItems = function() {
		var that = this;
		var serverCallback = function() {
			var customCategory = that._createCustomCategory();
			var result = $U.core.category.CategoryProvider._getAssetsFromCustomCategory(customCategory);
			that.loadMediaItems(result);
		};

		$U.core.category.pvr.PVRChannels.getChannelsFromServer(serverCallback);
	};

	PVRChannelsCategoryProvider.ID = ID;

	return PVRChannelsCategoryProvider;
}());
