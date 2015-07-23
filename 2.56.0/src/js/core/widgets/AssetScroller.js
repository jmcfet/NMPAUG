var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.AssetScroller = ( function() {

	var logger = $U.core.Logger.getLogger("AssetScroller");

	var EMPTY_INDICATOR = {};

	var ARROW_SIZE = 60;

	/**
	 * Object representing an Asset Scroller in Browse
	 * @class $U.core.widgets.AssetScroller
	 * @extends $U.core.widgets.AssetContainer
	 * @param {HTMLElement} container scroller container that holds the scroller
	 * @param {number} rowOrColCount how may rows or columns of assets the scroller will contain
	 * @param {number} padding padding around the asset tile
	 * @param {Object} indicatorX id of the div used for the horizontal scrollbar
	 * @param {Object} indicatorY id of the div used for the vertical scrollbar
	 * @param {Object} extraOptions more options to pass through to the NagraScroller
	 */
	var AssetScroller = function(container, landscape, rowOrColCount, padding, indicatorX, indicatorY, extraOptions, name) {

		if (logger) {
			logger.log("constructor", "name:", name);
		}

		superClass.call(this);

		$U.destroyList.push(this);

		this._container = container;

		this._isLandscape = landscape;

		this._rowCount = rowOrColCount;

		this._originalRowOrColCount = rowOrColCount;

		this.createEmptyRows();

		this._padding = padding || {
			left : 0,
			right : 0
		};

		this._PADDING_DIV = document.createElement("div");

		this._createArrows();

		if (this._isLandscape) {
			$U.core.util.HtmlHelper.setWidth(this._PADDING_DIV, this._padding.right);
		} else {
			$U.core.util.HtmlHelper.setHeight(this._PADDING_DIV, this._gutter);
		}

		this._PADDING_DIV.className = $U.core.Device.isWebkitRenderFixNecessary() ? "asset-item-padding webkit-render-fix" : "asset-item-padding";

		this._maxRight = 0;

		var scrollerOptions = {
			scrollingX : this._isLandscape,
			scrollingY : !this._isLandscape,
			zooming : false,
			minZoom : 1,
			maxZoom : 1,
			measureContent : true,
			bouncing : true,
			paging : false,
			indicatorX : indicatorX || EMPTY_INDICATOR,
			indicatorY : indicatorY || EMPTY_INDICATOR
		};
		if (extraOptions) {
			for (var attrname in extraOptions) {
				if (extraOptions.hasOwnProperty(attrname)) {
					scrollerOptions[attrname] = extraOptions[attrname];
				}
			}
		}
		if (this._container) {
			this._scroller = new $U.core.widgets.scroller.NagraScroller(this._container, scrollerOptions, name);
		}

		if (this._container) {
			if (this._isLandscape) {
				this._calculateSizes(this._container.clientHeight);
			} else {
				this._calculateSizes(this._container.clientWidth);
			}
		}

		this._adjustScrollbars();
	};

	var superClass = $U.core.widgets.AssetContainer;
	$N.apps.util.Util.extend(AssetScroller, superClass);

	var proto = AssetScroller.prototype;

	proto._pagePrev = function() {
		if (this._canPagePrev) {
			if (logger) {
				logger.log("_pagePrev", "page prev");
			}
			$U.core.View.pageMobile(this._categoryId, this._pageSize, Math.max(0, this._pageOffset - this._pageSize), true);
		}
	};

	proto._pageNext = function() {
		if (this._canPageNext) {
			if (logger) {
				logger.log("_pageNext", "page next");
			}
			$U.core.View.pageMobile(this._categoryId, this._pageSize, this._pageOffset + this._pageSize);
		}
	};

	/**
	 * Expose the underlying NagraScroller's addScrollerListener method.
	 * @param {Function} listener
	 */
	proto.addScrollerListener = function(listener) {
		this._scroller.addScrollerListener(listener);
	};

	/**
	 * Expose the underlying NagraScroller's removeScrollerListener method.
	 * @param {Function} listener
	 */
	proto.removeScrollerListener = function(listener) {
		this._scroller.removeScrollerListener(listener);
	};

	/**
	 * Clears the asset scroller DOM elements
	 */
	proto.clearDOM = function() {

		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		this._scroller.reset();
		this._assetTiles = [];
		this.createEmptyRows();
	};

	/**
	 * Adjusts the scrollbars
	 * changes scroller direction and hide/show relevant scrollbarage
	 * @private
	 */
	proto._adjustScrollbars = function() {
		if (this._scroller && this._scroller.options.indicatorX !== EMPTY_INDICATOR) {
			this._scroller.scroller.setScrollingDirections(this._isLandscape, !this._isLandscape);
			this._scroller.activateScrollIndicators(this._isLandscape, !this._isLandscape);
		}
	};

	/**
	 * Sets the orientation of this AssetScroller
	 * @param {Boolean} landscape whether the AssetScroller should be landscape
	 */
	proto.setOrientation = function(landscape, rowOrColCount) {
		if (logger) {
			logger.log("setOrientation", " landscape:", landscape, " rowOrColCount:", rowOrColCount);
		}
		this._isLandscape = landscape;
		this._rowCount = rowOrColCount;
		this._originalRowOrColCount = rowOrColCount;
		this._adjustScrollbars();
		this.createEmptyRows();
		this._hideAllArrows();
	};

	proto.isLandscape = function() {
		return this._isLandscape;
	};

	/**
	 * @return the number of rows in the scroller
	 */
	proto.getRowCount = function() {
		return this._rowCount;
	};

	/**
	 * Creates empty rows to fill the given space
	 */
	proto.createEmptyRows = function() {
		var r;
		this._rows = [];
		this._rowWidths = [];
		for ( r = 0; r < this._rowCount; r++) {
			this._rowWidths.push(0);
			this._rows.push([]);
		}
	};

	/*
	 * Populate an AssetScroller with an array of assets.
	 * @param {Array} items the array of assets
	 * @param {boolean} suppressPageLoader whether to suppress the page loader for this AssetScroller
	 * @param {String} categoryId the id of the category that is being populated
	 * @param {Number} pageSize the number of assets per page from the data source
	 * @param {Number} pageOffset the offset of the first asset from the data source
	 * @param {Number} totalAssetCount the total number of assets available from the data source
	 */
	proto.populate = function(items, suppressPageLoader, categoryId, pageSize, pageOffset, totalAssetCount) {

		var i, item;

		items = this._truncateItems(items);

		this._items = items;
		this._categoryId = categoryId;
		this._pageSize = pageSize;
		this._pageOffset = pageOffset;
		this._totalAssetCount = totalAssetCount;

		this._isDesktop = $U.core.Device.isDesktop();
		this._canPage = pageSize !== undefined && pageOffset !== undefined && totalAssetCount !== undefined;
		this._canPagePrev = this._canPage && pageOffset > 0;
		this._canPageNext = this._canPage && totalAssetCount > (pageOffset + pageSize);

		this._rowCount = this._originalRowOrColCount;
		this.clearDOM();

		this._tileCount = items.length;
		this._toLoadCount = this._tileCount;

		this._sizeCalculator();

		if (items.length > 0) {
			if (!suppressPageLoader) {
				$U.core.widgets.PageLoading.show(this);
			}
			for ( i = 0; i < this._tileCount; i++) {
				item = items[i % items.length];
				this._addAssetTile(item, i);
			}
		}

		if (!this._isDesktop && this._canPage) {
			this._attachArrows();
		}
		this.resizeHandler();
	};

	proto._createArrows = function() {
		var leftArrow = document.createElement("i");
		var rightArrow = document.createElement("i");
		var topArrow = document.createElement("i");
		var bottomArrow = document.createElement("i");
		var webkitRenderNecessary = $U.core.Device.isWebkitRenderFixNecessary();

		var that = this;

		this._leftArrowDiv = document.createElement("div");
		this._rightArrowDiv = document.createElement("div");

		this._topArrowDiv = document.createElement("div");
		this._bottomArrowDiv = document.createElement("div");

		this._leftArrowDiv.className = webkitRenderNecessary ? "asset-page-arrow asset-page-arrow-left webkit-render-fix" : "asset-page-arrow asset-page-arrow-left";
		leftArrow.className = "icon-chevron-left icon-3x";

		this._rightArrowDiv.className = webkitRenderNecessary ? "asset-page-arrow asset-page-arrow-right webkit-render-fix" : "asset-page-arrow asset-page-arrow-right";
		rightArrow.className = "icon-chevron-right icon-3x";

		this._topArrowDiv.className = webkitRenderNecessary ? "asset-page-arrow asset-page-arrow-top webkit-render-fix" : "asset-page-arrow asset-page-arrow-top";
		topArrow.className = "icon-chevron-up icon-3x";

		this._bottomArrowDiv.className = webkitRenderNecessary ? "asset-page-arrow asset-page-arrow-bottom webkit-render-fix" : "asset-page-arrow asset-page-arrow-bottom";
		bottomArrow.className = "icon-chevron-down icon-3x";

		this._leftArrowDiv.appendChild(leftArrow);
		this._rightArrowDiv.appendChild(rightArrow);

		this._topArrowDiv.appendChild(topArrow);
		this._bottomArrowDiv.appendChild(bottomArrow);

		// Position of arrows
		$U.core.util.HtmlHelper.setLeft(this._leftArrowDiv, this._gutter);
		$U.core.util.HtmlHelper.setTop(this._topArrowDiv, this._gutter);
		// Right and bottom arrow will be repositioned
		$U.core.util.HtmlHelper.setLeft(this._rightArrowDiv, 0);
		$U.core.util.HtmlHelper.setTop(this._topArrowDiv, 0);

		//put some logic on the arrow buttons
		this._leftArrowDiv.addEventListener("click", function() {
			that._pagePrev();
		});

		this._rightArrowDiv.addEventListener("click", function() {
			that._pageNext();
		});

		this._topArrowDiv.addEventListener("click", function() {
			that._pagePrev();
		});

		this._bottomArrowDiv.addEventListener("click", function() {
			that._pageNext();
		});

	};

	proto._attachArrows = function() {
		this._container.appendChild(this._leftArrowDiv);
		this._container.appendChild(this._rightArrowDiv);
		this._container.appendChild(this._topArrowDiv);
		this._container.appendChild(this._bottomArrowDiv);
	};

	proto._hideAllArrows = function() {
		$U.core.util.HtmlHelper.setDisplayNone(this._leftArrowDiv);
		$U.core.util.HtmlHelper.setDisplayNone(this._rightArrowDiv);
		$U.core.util.HtmlHelper.setDisplayNone(this._topArrowDiv);
		$U.core.util.HtmlHelper.setDisplayNone(this._bottomArrowDiv);
	};

	/**
	 * Adds an asset tile to the asset scroller
	 * For landscape scrollers there are a fixed number of rows so this checks to see which row is the shortest then adds the asset to that row.
	 * For vertical scrollers this checks to see if it can fit the asset in any existing rows, if not it creates a new row and puts it in there
	 * @private
	 * @param {Object} asset
	 * @param {string} id
	 */
	proto._addAssetTile = function(asset, id) {
		var narrowestRow;
		var r;
		var assetTile;
		var div;
		var assetClass;

		assetClass = $U.core.Device.isWebkitRenderFixNecessary() ? "asset-item webkit-render-fix" : "asset-item";

		if (this._isLandscape) {
			// Find the narrowest row (top down)
			narrowestRow = 0;
			for ( r = 1; r < this._rowCount; r++) {
				if (this._rowWidths[r] < this._rowWidths[narrowestRow]) {
					narrowestRow = r;
				}
			}
		} else {
			var nextAssetWidth = this._smallW;
			if (asset.searchMatches && asset.isTileLarge()) { //[D-02006][TK-15085] only perform this check for search results. Breaks folder functionality on Gateway otherwise.
				nextAssetWidth = this._largeW;
			}
			narrowestRow = -1;
			for ( r = 0; r < this._rowCount; r++) {
				if ((this._rowWidths[r] + nextAssetWidth) < (this._rowWidth + this._gutter)) {
					narrowestRow = r;
					r = this._rowCount;
				}
			}
			//if there isn't one create it
			if (narrowestRow === -1) {
				narrowestRow = this._rowCount;
				this._rowCount++;
				this._rows.push([]);
				this._rowWidths.push(0);
			}
		}

		// Create the div to hold the AssetTile and position it in the narrowest row
		div = document.createElement("div");
		div.className = assetClass;
		this._container.appendChild(div);

		// Create the AssetTile
		assetTile = this._createAssetTile(asset, div);
		assetTile.load();

		// Add the AssetTile to the lists
		this._assetTiles.push(assetTile);
		this._rows[narrowestRow].push(assetTile);

		// Update the width of the narrowest row
		// TODO: take the tile shape into account
		this._rowWidths[narrowestRow] += assetTile.getTileWidth() + this._gutter;

		this.assetTileLoad(assetTile);
	};

	/**
	 * Calculates the size of an asset, for landscape scollers the height is important.
	 * @private
	 */
	proto._sizeCalculator = function() {
		if (this._isLandscape) {
			this._calculateSizes(this._container.clientHeight);
		} else {
			this._calculateSizes(this._container.clientWidth);
		}
	};

	/**
	 * Calculates the sizes for the assets, used in association with the _sizeCalculator function to work out whether the width or height used to guide the size
	 * @private
	 * @param {number} height
	 */
	proto._calculateSizes = function(height) {
		//for portrait we get sent through the width
		var width = height;

		if (this._isLandscape) {
			this._rowHeight = Math.floor((height - this._gutter * (this._rowCount - 1)) / this._rowCount);
			this._largeW = Math.round(this._rowHeight * this._landscapeAspectRatio);
			this._smallH = Math.round((this._rowHeight - this._gutter) / 2);
			this._smallW = Math.round((this._rowHeight * this._landscapeAspectRatio - this._gutter) / 2);
		} else {
			this._rowWidth = Math.floor((width - (this._gutter * 2)));
			this._rowHeight = Math.round(this._rowWidth / this._landscapeAspectRatio);
			this._largeW = this._rowWidth;
			this._largeH = this._rowHeight;
			this._smallW = Math.round((this._rowWidth - this._gutter) / 2);
			//this._smallH = Math.round((this._rowWidth * this._portraitAspectRatio - this._gutter) / 2);
			this._smallH = this._rowHeight;
		}
	};

	/**
	 * Handles asset scroller resize events
	 * Utilises the size calculator functions to make the assets fit into the newly sized screen
	 * @returns {number} the height of the scroller
	 */
	proto.resizeHandler = function() {

		this._sizeCalculator();

		var r, t, l, asset, x, y;
		var width, height;
		var totalWidth;

		for ( r = 0; r < this._rowCount; r++) {
			x = this._padding.left + (!this._isDesktop && this._isLandscape && this._canPagePrev ? ARROW_SIZE + this._gutter : 0);
			y = r * (this._rowHeight + this._gutter) + this._topArrowPixels();
			l = this._rows[r].length;
			for ( t = 0; t < l; t++) {
				asset = this._rows[r][t];
				$U.core.util.HtmlHelper.setLeft(asset._container, x);
				$U.core.util.HtmlHelper.setTop(asset._container, y);
				switch (asset.getType()) {
				case $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE:
					width = this._largeW;
					height = this._rowHeight;
					break;
				case $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER:
					width = this._smallW;
					height = this._rowHeight;
					break;
				}

				asset.setSize(width, height);
				totalWidth = asset._container.offsetLeft + width;

				if ((this._padding.right > 0) && (totalWidth > this._maxRight)) {
					this._maxRight = totalWidth;
				}

				x += width + this._gutter;
			}
		}

		if (!this._isDesktop) {
			this._hideAllArrows();
		}
		if (!this._isDesktop && this._canPage) {
			if (this._canPagePrev) {
				if (this._isLandscape) {
					$U.core.util.HtmlHelper.setDisplayBlock(this._leftArrowDiv);
				} else {
					$U.core.util.HtmlHelper.setDisplayBlock(this._topArrowDiv);
				}
			}

			if (this._canPageNext) {
				if (this._isLandscape) {
					$U.core.util.HtmlHelper.setLeft(this._rightArrowDiv, this._maxRight + this._gutter);
					$U.core.util.HtmlHelper.setDisplayBlock(this._rightArrowDiv);
					this._maxRight += ARROW_SIZE + this._gutter;
				} else {
					$U.core.util.HtmlHelper.setTop(this._bottomArrowDiv, this._rowPixels() + this._topArrowPixels());
					$U.core.util.HtmlHelper.setDisplayBlock(this._bottomArrowDiv);
				}
			}
		}

		if (this._padding.right > 0) {
			if (this._isLandscape) {
				$U.core.util.HtmlHelper.setLeft(this._PADDING_DIV, (this._maxRight + 1));
				$U.core.util.HtmlHelper.setTop(this._PADDING_DIV, 0);
				if ($U.core.Device.isPhone()) {
					$U.core.util.HtmlHelper.setWidth(this._PADDING_DIV, this._gutter);
				}
				$U.core.util.HtmlHelper.setHeight(this._PADDING_DIV, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
			} else {
				$U.core.util.HtmlHelper.setWidth(this._PADDING_DIV, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
				$U.core.util.HtmlHelper.setHeight(this._PADDING_DIV, this._gutter);
				$U.core.util.HtmlHelper.setLeft(this._PADDING_DIV, 0);
			}

			this._container.appendChild(this._PADDING_DIV);
			this._maxRight = 0;
		}

		this._scroller.reflow();
		this._adjustScrollbars();

		return {
			width : x,
			height : (this._rowCount * this._rowHeight)
		};
	};

	/**
	 * Destroys references that cause memory leak.
	 * This AssetScroller deletes all AssetTile references.
	 */
	proto.destroy = function() {
		var i;
		var j;

		if (this._assetTiles) {
			for ( i = 0; i < this._assetTiles.length; i++) {
				delete this._assetTiles[i]._owner;
				delete this._assetTiles[i]._wrappedAsset;
				delete this._assetTiles[i];
			}
		}

		if (this._rows) {
			for ( i = 0; i < this._rowCount; i++) {
				for ( j = 0; j < this._rows[i].length; j++) {
					delete this._rows[i][j];
				}
			}
		}
		delete this._scroller;
	};

	proto._topArrowPixels = function() {
		return !this._isDesktop && !this._isLandscape && this._canPagePrev ? ARROW_SIZE + this._gutter : 0;
	};

	proto._bottomArrowPixels = function() {
		return !this._isDesktop && !this._isLandscape && this._canPageNext ? ARROW_SIZE + this._gutter : 0;
	};

	proto._rowPixels = function() {
		return !this._isDesktop && this._rowCount * (this._rowHeight + this._gutter);
	};

	return AssetScroller;

}());
