var $U = $U || {};
$U.browse = $U.browse || {};

$U.browse.BrowseScreen = ( function() {

	var logger = $U.core.Logger.getLogger("BrowseScreen");

	var currentContext = false;
	var superClass = $U.core.AssetScreen;
	var proto;
	var NO_RESULTS_KEY = "txtNoResultsInCategory";
	var NO_RESULTS_PARENTAL_KEY = "txtNoResultsParentalInCategory";
	var NO_FAVOURITES_KEY = "txtNoResultsInFavourites";
	var CONTAINER_ID = "browse";

	var SCROLLER_PADDING = {
		//this should ideally be read from SCSS
		// SCSS $app_padding
		left : $U.core.Device.isPhone() ? 10 : 20,
		right : $U.core.Device.isPhone() ? 10 : 300 // This needs to be the same as the catalogue menu width defined in menu.scss
	};


	/**
	 * Object that represents a browse screen
	 * @class $U.browse.BrowseScreen
	 * @extends $U.core.AssetScreen
	 * @constructor
	 * @param owner
	 */
	function BrowseScreen(owner) {
		superClass.call(this, owner);
		this._menu = $U.core.View.getCatalogueMenu();

		this._container.id = CONTAINER_ID;
		this._initialiseForDevice();
	}


	$N.apps.util.Util.extend(BrowseScreen, superClass);
	proto = BrowseScreen.prototype;

	proto._initialiseForTablet = function() {
		this._container.insertBefore(this._menu.getContainer(), this._footerBar);
		superClass.prototype._initialiseForTablet.call(this);
	};

	proto._initialiseForDesktop = function() {
		this._container.insertBefore(this._menu.getContainer(), this._footerBar);
		superClass.prototype._initialiseForDesktop.call(this);
	};

	proto._removeAssetGroup = function(item) {
		var displayItems,
			itemCount;

		if (this._cachedItems && this._allItems) {
			this._removeFromCachedItems(item);
		}
		if (this._allItems && this._allItems.length > 0) {
			itemCount = this._allItems.length;
			// Check to see if deleted all from the end.
			if (this._pageOffset === itemCount) {
				this._pageOffset = itemCount - this._pageSize;
			}
			// Chop the right bit of the cache
			displayItems = this._allItems.slice(this._pageOffset, this._pageOffset + this._pageSize);
		} else {
			displayItems = [];
		}
		this.populate(displayItems, this._catID, this._pageSize, this._pageOffset, (this._allItems && this._allItems.length) || 0);
	};

	proto._removeAssetItem = function(item, i) {
		this._assets.splice(i, 1);
		this.populate(this._assets, this._catID, null, null, null, null, true);
	};

	/**
	 * Removes an asset from being displayed on the screen
	 * @param {$U.core.mediaitem.MediaItem} item the item to be removed from the screen
	 */
	proto.removeAsset = function(item) {
		var i = this._assets.indexOf(item);

		if (i > -1) {
			if (logger) {
				logger.log("removeAsset", "yes I can remove this asset");
			}
			if (!this._isSubCategory && item.recordingType) {
				this._removeAssetGroup(item);
			} else {
				this._removeAssetItem(item, i);
			}
		}
	};

	proto.setCachedItems = function(items) {
		this._cachedItems = items;
	};

	proto.setAllProcessedItems = function(items) {
		this._allItems = items;
	};

	/**
	 * Removes an asset from the list of saved assets
	 * @param {$U.core.mediaitem.MediaItem} item the item to be removed from the screen
	 */
	proto._removeFromCachedItems = function(item) {
		var that = this;

		this._allItems.forEach(function(savedItem, index) {
			if (item === savedItem) {
				that._allItems.splice(index, 1);
			}
		});

		this._cachedItems.forEach(function(savedItem, index) {
			if (item._data === savedItem) {
				that._cachedItems.splice(index, 1);
			}
		});
	};

	proto.populate = function(items, id, pageSize, pageOffset, totalAssetCount, scrollToEnd, isSubCategory, parentalBlocked) {
		this._catID = id;
		this._isSubCategory = isSubCategory || false;
		if (items.length === 0) {
			if (this._catID === $U.core.category.favourites.FavouritesCategoryProvider.ID) {
				this._setNoItemsMessage(NO_FAVOURITES_KEY);
			} else if (parentalBlocked) {
				this._setNoItemsMessage(NO_RESULTS_PARENTAL_KEY);
			} else {
				this._setNoItemsMessage(NO_RESULTS_KEY);
			}
		}

		this._populateAssets(items, false, id, pageSize, pageOffset, totalAssetCount, scrollToEnd, isSubCategory);
		this.resizeHandler();
	};

	//will need to be refactored when the PVR stuff is back:
	proto._loadAssetsForRecordedCategory = function(assets) {
		var i;
		var len = assets.length;
		for ( i = 0; i < len; i++) {
			assets[i].customType = $U.core.CategoryConfiguration.CONTENT_TYPE.RECORDING;
		}
		if (assets.length > 0) {
			this._populateAssets(assets);
		}
		//$U.core.widgets.PageLoading.hide("loadAssets");
	};

	proto.setHeading = function(heading) {
		if (!this._headingTag) {
			this._headingTag = document.createElement("h1");
			this._headingTag.id = "browseTitle";
			this._headingTag.className = "title";
			this._container.insertBefore(this._headingTag, this._scrollerContainer);
		}
		this._title = heading;
		this._headingTag.innerHTML = heading;
	};

	/**
	 * Activates the Screen
	 * @param {boolean} skipReload true if the scrollers shouldn't reload when the page is re-activated
	 */
	proto.activate = function(skipReload) {
		if (logger) {
			logger.log("activate", "enter");
		}
		if (!skipReload  &&
			(
				this._catID === $U.core.category.recommendations.RecommendationsCategoryProvider.ID ||
				this._catID === $U.core.category.favourites.FavouritesCategoryProvider.ID ||
				this._catID === $U.core.category.recentlyviewed.RecentlyViewedCategoryProvider.ID ||
				this._catID === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID ||
				this._catID === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID ||
				this._catID === $U.core.category.pvr.PVRScheduledCategoryProvider.ID ||
				this._catID === $U.core.category.pvr.PVRRecordedCategoryProvider.ID ||
				this._catID === $U.core.category.pvr.PVRNowPlayingCategoryProvider.ID ||
				this._catID === $U.core.category.pvr.PVRChannelsCategoryProvider.ID
			)
			) {
			//reload the favourites if they are on the deactivated screen
			$U.core.View.loadCategory(this._catID, true);
		} else {
			this.resizeHandler();
		}
	};

	/**
	 * Deactivates the Screen
	 */
	proto.deactivate = function() {
		if (logger) {
			logger.log("deactivate", "enter");
		}
	};

	/**
	 * returns the SCROLLER_PADDING used in the scrollers for this page
	 */
	proto.getScrollerPadding = function() {
		return SCROLLER_PADDING;
	};

	/**
	 * handles the resize
	 */
	proto.resizeHandler = function() {
		var that = this;
		var scrollToCat = function() {
			that._menu.scrollToActive();
		};
		window.setTimeout(scrollToCat, 100);

		superClass.prototype.resizeHandler.call(this);
	};

	proto.refreshCategory = function(uid) {
		if (uid === this._catID) {
			$U.core.View.loadCategory(this._catID);
		}
	};

	proto.refreshCategoryTitle = function(uid) {
		if (uid === this._catID) {
			if (uid === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || uid === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
				this.setHeading($U.core.NPVRManager.getInstance().getBrowseHeading(uid));
			}
		}
	};

	/**
	 * @return all the information needed to display into a screen
	 */
	proto.getScreenData = function() {
		var returnObj = {
			id : this._catID,
			title : this._title,
			assets : this._assets,
			pageOffset : this._pageOffset,
			pageSize : this._pageSize,
			assetCount: this._totalAssetCount
		};
		return returnObj;
	};

	return BrowseScreen;

}());
