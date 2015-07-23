var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.AssetContainer = ( function() {

	var logger = $U.core.Logger.getLogger("AssetContainer");

	var FALLBACK_IMAGE = {
		name : "video_poster",
		src : "images/video_poster.png"
	};

	var HEADINGS = {
		ON_NOW: "On Now",
		ON_NEXT: "On Next",
		NONE: null
	};

	/**
	 * Asset container class
	 * @class $U.core.widgets.AssetContainer
	 * @constructor
	 * Asset container class
	 */
	var AssetContainer = function() {
		if ($U.core.Device.isPhone()) {
			this._gutter = 10;
		} else {
			this._gutter = 20;
		}
		this._portraitAspectRatio = 2 / 3;
		this._landscapeAspectRatio = 14 / 9;
	};

	var proto = AssetContainer.prototype;

	proto._truncateItems = function(items) {
		if ($U.core.Configuration.MAX_ASSET_TILES && items.length > $U.core.Configuration.MAX_ASSET_TILES) {
			if (logger) {
				logger.log("populate", "WARNING: truncated list of items from " + items.length + " to " + $U.core.Configuration.MAX_ASSET_TILES);
			}
			items = items.slice(0, $U.core.Configuration.MAX_ASSET_TILES);
		}
		return items;
	};

	/**
	 * Creates an asset tile
	 * @private
	 * @param {Object} asset
	 * @param {HTMLElement} div
	 * @return {Object}
	 */
	proto._createAssetTile = function(asset, div) {

		var assetTile, name, type, imageSrc, width, height;

		switch(asset.type) {
		case $U.core.mediaitem.MediaItemType.SERIES_CONTAINER:
			name = asset.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;

			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			assetTile = new $U.core.widgets.assettile.SeriesContainerAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			break;

		case $U.core.mediaitem.MediaItemType.VOD:

			if (asset.seriesItem || asset.seriesRef) {
				name = asset.title;
				imageSrc = asset.promoImageURL;

				type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
				width = this._largeW;

				if (this._isLandscape) {
					height = this._rowHeight;
				} else {
					height = this._largeH;
				}
				assetTile = new $U.core.widgets.assettile.VodSeriesAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			} else {
				name = asset.title;
				imageSrc = asset.coverImageURL;

				type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER;
				width = this._smallW;

				if (this._isLandscape) {
					height = this._rowHeight;
				} else {
					height = this._smallH;
				}

				assetTile = new $U.core.widgets.assettile.VodAssetTile(name, div, this, asset, width, height, this._portraitAspectRatio, type, imageSrc);
			}
			break;
		case $U.core.mediaitem.MediaItemType.BTVCHANNEL:
			name = asset.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER;
			width = this._smallW;

			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._smallH;
			}

			assetTile = new $U.core.widgets.assettile.ChannelAssetTile(name, div, this, asset, width, height, this._portraitAspectRatio, type, imageSrc);
			break;
		case $U.core.mediaitem.MediaItemType.ONNOW:
			name = asset.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;
			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			assetTile = new $U.core.widgets.assettile.OnNowAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			break;
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
			name = asset.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;
			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			assetTile = new $U.core.widgets.assettile.EventAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			break;
		case $U.core.mediaitem.MediaItemType.NPVR:
			name = asset._data.title;
			imageSrc = asset._data.image;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;
			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			if (asset.recordingType === $N.data.Recording.RECORDING_TYPE.SERIES) {
				assetTile = new $U.core.widgets.assettile.NpvrFolderAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, asset.promoImageURL);
			} else {
				assetTile = new $U.core.widgets.assettile.EventAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);				
			}

			break;
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
			name = asset.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;
			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			assetTile = new $U.core.widgets.assettile.PvrRecordedAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			break;

		case $U.core.mediaitem.MediaItemType.PVR_SCHEDULED:
			name = asset._data.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;
			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			assetTile = new $U.core.widgets.assettile.PvrScheduledAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			break;

		case $U.core.mediaitem.MediaItemType.CATCHUP:
			name = asset.title;
			imageSrc = asset.promoImageURL;

			type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
			width = this._largeW;

			if (this._isLandscape) {
				height = this._rowHeight;
			} else {
				height = this._largeH;
			}
			assetTile = new $U.core.widgets.assettile.CatchUpAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc);
			break;
		}

		return assetTile;
	};

	/**
	 * Callback for a successful tile load
	 * @param {Object} assetTile
	 */
	proto.assetTileLoadSuccess = function(assetTile) {
		// if (logger) {
		// logger.log("assetTileLoadSuccess", assetTile);
		// }
		this.assetTileLoad(assetTile);
	};

	/**
	 * Callback a failed tile load
	 * @param {Object} assetTile
	 */
	proto.assetTileLoadFailure = function(assetTile) {
		// if (logger) {
		// logger.log("assetTileLoadFailure", assetTile);
		// }
		this.assetTileLoad(assetTile);
	};

	/**
	 * Loads the asset tile
	 * @param {Object} assetTile
	 */
	proto.assetTileLoad = function(assetTile) {
		this._toLoadCount--;
		// if (logger) {
		// logger.log("assetTileLoad", "toLoadCount: " + this._toLoadCount);
		// }
		if (this._toLoadCount === 0) {
			$U.core.widgets.PageLoading.hide(this);
		}
	};

	/**
	 * Adds the remove button to each of the asset tiles in the container
	 * @param {Function} clickEvent what happens when the remove button is clicked
	 */
	proto.addRemoveButtons = function(clickEvent) {
		var len = this._assetTiles.length;
		var i;

		for ( i = 0; i < len; i++) {
			this._assetTiles[i].addRemoveButton(clickEvent);
		}
	};

	proto.getItems = function() {
		return this._items;
	};

	/**
	 * Sets the onNow and onNext indicator strings based on the provided onNowAsset
	 * @param {Object} onNowAsset The currently live event
	 */
	proto.setOnNowOnNext = function(onNowAsset) {
		var onNextTileIndex,
			self = this;
		this._assetTiles.forEach(function (tile, index) {
			if (tile._wrappedAsset.startTime === onNowAsset.startTime) {
				tile.setHeading(HEADINGS.ON_NOW);
				onNextTileIndex = index + 1;
			} else {
				if (index !== onNextTileIndex) {
					tile.setHeading(HEADINGS.NONE);
				} else {
					tile.setHeading(HEADINGS.ON_NEXT);
				}
			}
		});
	};

	/**
	 * Loops through the scroller assetTiles and determines which is the current live event
	 * @private
	 */
	proto._determineOnNow = function() {
		var onNowAsset,
			onNextTileIndex,
			self = this;

		this._assetTiles.every(function (tile) {
			if (tile._wrappedAsset.isOnNow) {
				self.setOnNowOnNext(tile._wrappedAsset);
				return false;
			} else {
				return true;
			}
		});
	};

	/**
	 * Gets the head asset stored in the container
	 * @return {Object} the head asset
	 */
	proto.getHeadAsset = function() {
		return this._assetTiles[0] && this._assetTiles[0]._wrappedAsset ? this._assetTiles[0]._wrappedAsset : null;
	};

	/**
	 * Gets the items to render based on the provided numberToRender value
	 * @private
	 */
	proto._getItemsToRender = function(items, numberToRender) {
		return items.slice(0, numberToRender);
	};

	/**
	 * Moves the next asset into view and removes the first from view.
	 */
	proto.shiftNextIntoView = function() {
		var assetToRemove = this._assetTiles[0];
		if (assetToRemove) {
			this._removeAsset(assetToRemove);
		}
		if (this._lastItemRenderedIndex < this._items.length -1) {
			this._addAssetTile(this._items[this._lastItemRenderedIndex +1]);
			this._lastItemRenderedIndex++;
		}
		this.resizeHandler();
		$U.core.View.resizeHandler();
	};

	/**
	 * Returns the lastRenderedItem index based on the number of items to render and the total number of items.
	 * @private
	 */
	proto._getLastRenderedIndex = function(numberToRender, items) {
		return (numberToRender > items.length) ? items.length -1: numberToRender -1;
	};
	return AssetContainer;

}());
