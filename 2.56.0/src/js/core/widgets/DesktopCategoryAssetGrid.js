var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.DesktopCategoryAssetGrid = ( function() {

	var EMPTY_INDICATOR = {};

	var OrientationType = {
		PORTRAIT : {},
		LANDSCAPE : {}
	};

	//this is 202 because the mixing of landscape and portrait tiles gets messy on 200
	//it doesn't calculate the widths correctly (at 200) causing the grid to be off-centre
	var ASSET_HEIGHT = 202;

	/**
	 * Object representing an Asset Grid
	 * @class $U.core.widgets.DesktopCategoryAssetGrid
	 * @extends $U.core.widgets.AssetContainer
	 * @param {HTMLElement} container scroller container that holds the scroller
	 */
	var DesktopCategoryAssetGrid = function(container, indicatorY) {

		superClass.call(this);

		this._container = container;
		this._assetTiles = [];
		this._items = [];
	};

	var superClass = $U.core.widgets.AssetContainer;
	$N.apps.util.Util.extend(DesktopCategoryAssetGrid, superClass);

	var proto = DesktopCategoryAssetGrid.prototype;

	proto._checkOrientation = function() {
		this._orientation = (window.innerHeight < window.innerWidth) ? OrientationType.LANDSCAPE : OrientationType.PORTRAIT;
	};

	/**
	 * Clears the asset scroller DOM elements
	 */
	proto.clearDOM = function() {

		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		this._assetTiles = [];
	};

	/*
	 * Populate an AssetScroller with an array of assets.
	 * @param {Array} items the array of assets
	 */
	proto.populate = function(items, add) {

		var i, item, startIndex;
		
		if(add) {
			startIndex = this._items.length;
			this._items = items;
		} else {
			startIndex = 0;
			items = this._truncateItems(items);
			this._items = items;
			this.clearDOM();
		}

		this._tileCount = items.length;
		this._toLoadCount = this._tileCount;

		for ( i = startIndex; i < this._tileCount; i++) {
			item = items[i % items.length];
			this._addAssetTile(item, i);
		}

		this.resizeHandler();
	};

	/**
	 * Adds an asset tile to the asset grid
	 * @private
	 * @param {Object} asset
	 * @param {string} id
	 */
	proto._addAssetTile = function(asset, id) {

		var assetTile;
		var div;

		// Create the div to hold the AssetTile and position it in the narrowest row
		div = document.createElement("div");
		div.className = "asset-item";
		this._container.appendChild(div);

		// Create the AssetTile
		assetTile = this._createAssetTile(asset, div);
		assetTile.load();

		// Add the AssetTile to the lists
		this._assetTiles.push(assetTile);
	};

	/**
	 */
	proto.resizeHandler = function() {

		var i;
		var l = this._assetTiles.length;
		var asset;
		var width, height;
		var x = this._gutter;
		var y = this._gutter;
		var largeW, smallW;
		var containerWidth = this._container.parentNode.parentNode.clientWidth;
		var contentWidth = 0;

		this._checkOrientation();
		//this._sizeCalculator();

		height = ASSET_HEIGHT;

		largeW = Math.round(height * this._landscapeAspectRatio);
		smallW = Math.round((height * this._landscapeAspectRatio - this._gutter) / 2);

		for ( i = 0; i < l; i++) {
			asset = this._assetTiles[i];

			switch (asset.getType()) {
			case $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE:
				width = largeW;
				break;
			case $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER:
				width = smallW;
				break;
			}

			if (x + width + this._gutter > containerWidth) {
				if (x > contentWidth) {
					contentWidth = x;
				}
				x = this._gutter;
				y += height + this._gutter;
			}

			asset._container.style.left = x + "px";
			asset._container.style.top = y + "px";
			asset.setSize(width, height);

			x += width + this._gutter;
		}

		this._container.style.height = (y + height + this._gutter) + "px";
		if (!contentWidth) {
			contentWidth = containerWidth;
		}
		this._container.style.width = (contentWidth + this._gutter) + "px";
	};

	return DesktopCategoryAssetGrid;

}());
