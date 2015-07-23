var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.AssetGrid = ( function() {

	var OrientationType = {
		PORTRAIT : {},
		LANDSCAPE : {}
	};

	/**
	 * Object representing an Asset Grid
	 * @class $U.core.widgets.AssetGrid
	 * @extends $U.core.widgets.AssetContainer
	 * @param {HTMLElement} container scroller container that holds the scroller
	 */
	var AssetGrid = function(container) {

		superClass.call(this);

		this._container = container;
		this._assetTiles = [];

		this._container.addEventListener("touchstart", function(e) {
			this._moved = false;
			this.startX = e.touches[0].clientX;
			this.startY = e.touches[0].clientY;

		}, false);

		this._container.addEventListener("touchmove", function(e) {
			if (Math.abs(e.touches[0].clientX - this.startX) > 10 || Math.abs(e.touches[0].clientY - this.startY) > 10) {
				this._moved = true;
			}
		}, false);

		this._container.addEventListener("click", function(e) {
			if (this._moved) {
				e.preventDefault();
				e.stopPropagation();
			}
		}, true);

	};

	var superClass = $U.core.widgets.AssetContainer;
	$N.apps.util.Util.extend(AssetGrid, superClass);

	var proto = AssetGrid.prototype;

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
	proto.populate = function(items) {

		var i, item;

		items = this._truncateItems(items);
		this._items = items;

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
		var assetClass;

		assetClass = $U.core.Device.isWebkitRenderFixNecessary() ? "asset-item webkit-render-fix" : "asset-item";

		// Create the div to hold the AssetTile and position it in the narrowest row
		div = document.createElement("div");
		div.className = assetClass;
		this._container.appendChild(div);

		// Create the AssetTile
		assetTile = this._createAssetTile(asset, div);
		assetTile.load();

		// Add the AssetTile to the lists
		this._assetTiles.push(assetTile);

	};

	/**
	 * resizes the grid based on the with of the container
	 * @returns {Object} the width and height of the grid
	 */
	proto.resizeHandler = function() {

		var i;
		var l = this._assetTiles.length;
		var asset;
		var width, height;
		var x = this._gutter;
		var y = this._gutter;
		var columns;
		var rowHeight, largeW, smallW;
		var containerWidth = this._container.clientWidth;

		this._checkOrientation();
		columns = (this._orientation === OrientationType.PORTRAIT) ? 1 : 2;

		largeW = Math.floor((containerWidth - this._gutter * (columns + 1)) / columns);
		smallW = Math.floor((largeW - this._gutter) / 2);
		rowHeight = Math.floor(largeW / this._landscapeAspectRatio);

		for ( i = 0; i < l; i++) {
			asset = this._assetTiles[i];

			switch (asset.getType()) {
			case $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE:
				width = largeW;
				height = rowHeight;
				break;
			case $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER:
				width = smallW;
				height = rowHeight;
				break;
			case $U.core.widgets.assettile.AssetTile.TILE_TYPE.WIDE:
				width = largeW;
				height = rowHeight / 2;
				break;
			}

			if (x + width + this._gutter > containerWidth) {
				x = this._gutter;
				y += height + this._gutter;
			}

			$U.core.util.HtmlHelper.setLeft(asset._container, x);
			$U.core.util.HtmlHelper.setTop(asset._container, y);
			asset.setSize(width, height);

			x += width + this._gutter;
		}


		return {width: containerWidth, height: (y + rowHeight)};
	};

	return AssetGrid;

}());
