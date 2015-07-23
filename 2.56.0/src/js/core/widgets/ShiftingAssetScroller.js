var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.ShiftingAssetScroller = ( function() {

	/**
	 * Object representing a Shifting Asset Scroller. The scroller is initialy created with a list of assets but only the first n are displayed.
	 * The object exposes a method to switch into view the next asset in the list and move the first asset in the list out of view.
	 * @class $U.core.widgets.ShiftingAssetScroller
	 * @param {HTMLElement} container scroller container that holds the scroller
	 * @param {Boolean}landscale if the scroller is a landscape scroller
	 * @param {number} rowOrColCount how may rows or columns of assets the scroller will contain
	 * @param {number} padding padding around the asset tile
	 * @param {Object} indicatorX id of the div used for the horizontal scrollbar
	 * @param {Object} indicatorY id of the div used for the vertical scrollbar
	 * @param {Object} extraOptions more options to pass through to the NagraScroller
	 * @param {String} name the name of the scroller
	 * @param {Function} assetClickHandler function used as the click handler for asset tiles created bt this scroller.
	 * @param {Boolean} parentalRatings if parental ratings should be taken into account when rendering this scroller
	 */
	function ShiftingAssetScroller(container, landscape, rowOrColCount, padding, indicatorX, indicatorY, extraOptions, name, assetClickHandler, parentalRatings) {
		this.assetClickHandler = assetClickHandler;
		this._parentalRatings = parentalRatings;
		superClass.call(this, container, landscape, rowOrColCount, padding, indicatorX, indicatorY, extraOptions, name);
	}

	var superClass = $U.core.widgets.AssetScroller;
	$N.apps.util.Util.extend(ShiftingAssetScroller, superClass);

	/**
	 * Ovverride the superclass _createAssetTile method.
	 * @private
	 */
	ShiftingAssetScroller.prototype._createAssetTile = function(asset, div) {
		var assetTile, name, type, imageSrc, width, height, isBlocked = false;

		name = asset.title;
		imageSrc = asset.promoImageURL;
		type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.LARGE;
		width = this._largeW;
		if (this._isLandscape) {
			height = this._rowHeight;
		} else {
			height = this._largeH;
		}
		if (this._parentalRatings) {
			isBlocked = $U.core.parentalcontrols.ParentalControls.isRatingPermitted(asset.rating) ? false : true;
		}
		assetTile = new $U.core.widgets.assettile.TimeAssetTile(name, div, this, asset, width, height, this._landscapeAspectRatio, type, imageSrc, this.assetClickHandler, isBlocked);
		return assetTile;
	};

	/**
	 * Removes an asset from the scroller and the DOM.
	 * @private
	 */
	ShiftingAssetScroller.prototype._removeAsset = function(asset) {
		this._rows.forEach(function (row) {
			var index = row.indexOf(asset);
			if (index !== -1) {
				row = row.splice(index, 1);
			}
		});
		asset.removeFromDOM();
		asset.destroy();
		this._assetTiles.splice(0, 1);
	};

	/**
	 * Override the populate method so that all items don't get displayed straight away.
	 * @param {Array} items the array of assets
	 * @param {boolean} suppressPageLoader whether to suppress the page loader for this AssetScroller
	 * @param {String} categoryId the id of the category that is being populated
	 * @param {Number} pageSize the number of assets per page from the data source
	 * @param {Number} pageOffset the offset of the first asset from the data source
	 * @param {Number} totalAssetCount the total number of assets available from the data source
	 * @param {Number} numberToRender the number of items to display in the list
	 */
	ShiftingAssetScroller.prototype.populate = function(items, suppressPageLoader, categoryId, pageSize, pageOffset, totalAssetCount, numberToRender) {
		var i, item, itemsToRender;
		this._items = items;
		this._lastItemRenderedIndex = this._getLastRenderedIndex(numberToRender, items);
		items = this._getItemsToRender(this._truncateItems(items), numberToRender);

		this._categoryId = categoryId;
		this._pageSize = pageSize;
		this._pageOffset = pageOffset;
		this._totalAssetCount = totalAssetCount;

		this._isDesktop = $U.core.Device.isDesktop();
		this._canPage = pageSize !== undefined && pageOffset !== undefined && totalAssetCount !== undefined;
		this._canPagePrev = this._canPage && pageOffset > 0;
		this._canPageNext = this._canPage && pageOffset + items.length < totalAssetCount;

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
		this._determineOnNow();
		if (!this._isDesktop && this._canPage) {
			this._attachArrows();
		}
		this.resizeHandler();
	};

	return ShiftingAssetScroller;
}());
