var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.ShiftingAssetGrid = ( function() {

	var OrientationType = {
		PORTRAIT : {},
		LANDSCAPE : {}
	},
	HEADINGS = {
		ON_NOW: "On Now",
		ON_NEXT: "On Next",
		NONE: null
	};

	/**
	 * Object representing an Asset Grid
	 * @class $U.core.widgets.AssetGrid
	 * @extends $U.core.widgets.AssetContainer
	 * @param {HTMLElement} container scroller container that holds the scroller
	 */
	var ShiftingAssetGrid = function(container, assetClickHandler, parentalRatings) {
		superClass.call(this, container);
		this._assetClickHandler = assetClickHandler;
		this._parentalRatings = parentalRatings;
	};

	var superClass = $U.core.widgets.AssetGrid;
	$N.apps.util.Util.extend(ShiftingAssetGrid, superClass);

	var proto = ShiftingAssetGrid.prototype;

	/*
	 * Populate an AssetScroller with an array of assets.
	 * @param {Array} items the array of assets
	 * @param {Number} numberToRender the number of items to display in the list
	 */
	proto.populate = function(items, numberToRender) {
		var i, item;

		this._items = items;
		this._lastItemRenderedIndex = this._getLastRenderedIndex(numberToRender, items);
		items = this._truncateItems(this._getItemsToRender(items, numberToRender));

		this.clearDOM();

		this._tileCount = items.length;
		this._toLoadCount = this._tileCount;

		if (this._toLoadCount > 0) {
			$U.core.widgets.PageLoading.show(this);

			for ( i = 0; i < this._tileCount; i++) {
				item = items[i % items.length];
				this._addAssetTile(item, i);
			}
		}
		this._determineOnNow();
		this.resizeHandler();
	};

	/**
	 * Removes an asset from the grid and the DOM.
	 * @private
	 */
	proto._removeAsset = function(asset) {
		asset.removeFromDOM();
		asset.destroy();
		this._assetTiles.splice(0, 1);
	};

	/**
	 * Creates an asset tile
	 * @private
	 * @param {Object} asset
	 * @param {HTMLElement} div
	 * @return {Object}
	 */
	proto._createAssetTile = function(asset, div) {
		var assetTile, name, type, imageSrc, width, height, isBlocked = false;

		name = asset.title;
		imageSrc = asset.promoImageURL;

		type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.WIDE;
		width = this._largeW;
		if (this._isLandscape) {
			height = this._rowHeight;
		} else {
			height = this._largeH;
		}
		if (this._parentalRatings) {
			isBlocked = $U.core.parentalcontrols.ParentalControls.isRatingPermitted(asset.rating) ? false : true;
		}
		assetTile = new $U.core.widgets.assettile.WideTimeAssetTile2(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc, this._assetClickHandler, isBlocked);

		return assetTile;
	};

	return ShiftingAssetGrid;

}());
