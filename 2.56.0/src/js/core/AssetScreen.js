var $U = $U || {};
$U.core = $U.core || {};
$U.core.AssetScreen = ( function() {
	/**
	 * @class $U.core.AssetScreen
	 * Implements the AssetScreen, which is the parent to screens that show assets
	 * @return {Object}
	 */
	var proto;
	var logger = $U.core.Logger.getLogger("AssetScreen");

	// The asset screen scroller's name
	var SCROLLER_NAME = "AssetScreenScroller";

	// Number of rows in a landscape scroller
	var DEFAULT_ROWS = $U.core.Device.isPhone() ? 1 : 2;

	// Number of columns in a landscape scroller
	var DEFAULT_COLS = 2;

	var ORIENTATION_TYPE = {
		LANDSCAPE : {
			name : "landscape"
		},
		PORTRAIT : {
			name : "portrait"
		}
	};

	function AssetScreen(owner) {
		// Owner is the object which instantiated the AssetScreen
		this._owner = owner;
		this._viewContainer = $U.core.View.getViewContainer();
		this._container = $U.core.util.DomEl.createDiv().setClassName("screen hide").asElement();
		this._scrollerContainer = $U.core.util.DomEl.createDiv().setClassName("browse-scroller-container").asElement();

		if (!$U.core.Device.isDesktop()) {
			this._scroller = $U.core.util.DomEl.createDiv().setClassName("scroller").asElement();
			this._sideBar = $U.core.util.DomEl.createDiv().setClassName("browse-sidebar").asElement();
			this._verticalIndicatorContainer = $U.core.util.DomEl.createDiv().setClassName("scroller-vertical-indicator-container").asElement();
			this._verticalIndicator = $U.core.util.DomEl.createDiv().setClassName("scroller-vertical-indicator").asElement();
			this._footerBar = $U.core.util.DomEl.createDiv().setClassName("footer").asElement();
			this._horizontalIndicatorContainer = $U.core.util.DomEl.createDiv().setClassName("scroller-horizontal-indicator-container").asElement();
			this._horizontalIndicator = $U.core.util.DomEl.createDiv().setClassName("scroller-horizontal-indicator").asElement();
		}


		this._container.appendChild(this._scrollerContainer);

		if (!$U.core.Device.isDesktop()) {
			this._scrollerContainer.appendChild(this._scroller);
			this._container.appendChild(this._sideBar);
			this._sideBar.appendChild(this._verticalIndicatorContainer);
			this._verticalIndicatorContainer.appendChild(this._verticalIndicator);
			this._container.appendChild(this._footerBar);
			this._footerBar.appendChild(this._horizontalIndicatorContainer);
			this._horizontalIndicatorContainer.appendChild(this._horizontalIndicator);
		}

		this._viewContainer.appendChild(this._container);

		this._assets = null;
		this._currentOrientation = null;

		// The DOM element used to display the "no items message"
		// Will be created / destroyed as necessary
		this._noItemsElement = null;
	}

	proto = AssetScreen.prototype;

	proto._initialiseForDevice = function() {
		if ($U.core.Device.isPhone()) {
			this._initialiseForMobile();
		} else if ($U.core.Device.isDesktop()) {
			this._initialiseForDesktop();
		} else {
			this._initialiseForTablet();
		}
	};

	proto._initialiseForDesktop = function() {
		this._assetScroller = new $U.core.widgets.DesktopCategoryAssetGrid(this._scrollerContainer);
	};

	proto._initialiseForTablet = function() {
		this._assetScroller = this._createScroller(true, true, false);
	};

	/**
	 * Initialises the Mobile Browse Screen,
	 * sets up the orientation change callback
	 * @private
	 */
	proto._initialiseForMobile = function() {
		var supportsOrientationChange = "onorientationchange" in window;
		var that = this;

		if (supportsOrientationChange) {
			window.addEventListener("onorientationchange", function() {
				that._orientationEventListener();
			}, false);
		}

		//check what the initial orientation is
		this._currentOrientation = this._getOrientation();
		this._redrawScroller();
	};

	/**
	 * Orientation Event Listener applied in _initialiseForMobile
	 * which sets the orientation and redraws the scrollers
	 * @private
	 */
	proto._orientationEventListener = function() {
		if (window.orientation === 90 || window.orientation === -90) {//landscape
			this._currentOrientation = ORIENTATION_TYPE.LANDSCAPE;
			this._redrawScroller();
		} else if (window.orientation) {
			this._currentOrientation = ORIENTATION_TYPE.PORTRAIT;
			this._redrawScroller();
		} else {
			this.resizeHandler();
		}
	};

	/**
	 * Creates the scroller for the screen.
	 * @param {boolean} landscape whether the scroller should be landscape
	 * @param {boolean} xIndictorActive sets x-axis scroller indicator if set to true
	 * @param {boolean} yIndictorActive sets y-axis scroller indicator if set to true
	 * @private
	 */
	proto._createScroller = function(landscape, xIndictorActive, yIndictorActive) {
		var rowCount = landscape ? DEFAULT_ROWS : DEFAULT_COLS;
		var scroller = new $U.core.widgets.AssetScroller(this._scroller, landscape, rowCount, this.getScrollerPadding(), {
			active : xIndictorActive,
			indicatorContainerElement : this._horizontalIndicatorContainer,
			indicatorElement : this._horizontalIndicator
		}, {
			active : yIndictorActive,
			indicatorContainerElement : this._verticalIndicatorContainer,
			indicatorElement : this._verticalIndicator
		}, null, SCROLLER_NAME);

		return scroller;
	};

	/**
	 * Redraws the asset scroller in landscape or portrait.
	 * Also sets whether or not the scroller indicators should be shown or hidden
	 * @private
	 *
	 */

	proto._redrawScroller = function() {
		if (!$U.core.Device.isDesktop()) {
			var needToReaddAssets = false;
			var supressLoader = false;
			if (this._assetScroller) {
				this.clearAssets();
				needToReaddAssets = true;
			}
			if (this._getOrientation() === ORIENTATION_TYPE.LANDSCAPE) {

				if (!this._assetScroller) {
					this._assetScroller = this._createScroller(true, true, false);
				} else {
					if(this._assetScroller.isLandscape()){
						supressLoader = true;
					}
					this._assetScroller.setOrientation(true, DEFAULT_ROWS);
				}

				$U.core.util.HtmlHelper.setDisplayNone(this._sideBar);
				$U.core.util.HtmlHelper.setDisplayBlock(this._footerBar);
				this._scrollerContainer.style.bottom = null;
			} else {
				if (!this._assetScroller) {
					this._assetScroller = this._createScroller(false, false, true);
				} else {
					if(!this._assetScroller.isLandscape){
						supressLoader = true;
					}
					this._assetScroller.setOrientation(false, DEFAULT_COLS);
				}

				$U.core.util.HtmlHelper.setDisplayBlock(this._sideBar);
				$U.core.util.HtmlHelper.setDisplayNone(this._footerBar);
				this._scrollerContainer.style.bottom = "10px";
			}
			if (needToReaddAssets) {
				if (this._assets) {
					this._populateAssets(this._assets, supressLoader, this._categoryId, this._pageSize, this._pageOffset, this._totalAssetCount);
				}
			}
		}
	};

	/**
	 * Populates the AssetScroller with items
	 *
	 * @param {Object} items Items to add to the scroller
	 */
	proto._populateAssets = function(items, supressLoader, categoryId, pageSize, pageOffset, totalAssetCount, scrollToEnd) {
	//	$U.core.widgets.PageLoading.hide("loadAssets");
		this._assets = items;
		this._categoryId = categoryId;
		this._pageSize = pageSize;
		this._pageOffset = pageOffset;
		this._totalAssetCount = totalAssetCount;
		this._assetScroller.populate(this._assets, supressLoader, categoryId, pageSize, pageOffset, totalAssetCount);
		if (this._catID === $U.core.category.favourites.FavouritesCategoryProvider.ID) {
			this._assetScroller.addRemoveButtons($U.core.category.favourites.FavouritesRemove.showRemoveDialog);
		}
		if (this._catID === $U.core.category.pvr.PVRRecordedCategoryProvider.ID || this._catID === $U.core.category.pvr.PVRScheduledCategoryProvider.ID) {
			this._assetScroller.addRemoveButtons($U.core.category.pvr.PVRRemove.showRemoveDialog);
		}
		if (this._catID === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID || this._catID === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID) {
			this._assetScroller.addRemoveButtons($U.core.NPVRManager.getInstance().deleteFromTile);
		}
		if (scrollToEnd) {
			if ($U.core.Device.isPhone() && this._currentOrientation === ORIENTATION_TYPE.PORTRAIT) {
				this._assetScroller._scroller.scrollToBottomEdge();
			} else {
				this._assetScroller._scroller.scrollToRightEdge();
			}
		}
	};

	/**
	 * Clears the AssetScroller of items
	 */
	proto.clearAssets = function() {
		this._assetScroller.clearDOM();
	};

	/**
	 * Clears the AssetScroller of items, then empties the assets array
	 * Useful for changing the contents on the AssetScreen
	 */
	proto.deepClearAssets = function() {
		this.clearAssets();
		this._assets = [];
	};

	/**
	 * Clears the "No items" message
	 */
	proto.clearNoItemsMessage = function() {
		this._clearNoItemsMessage();
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
			this._assets.splice(i, 1);
			this.populate(this._assets, this._catID);
		}
	};

	/**
	 * Checks to see if display is portrait or landscape,
	 * uses the width of the screen vs the height
	 * @return {Boolean} true if is landscape
	 */
	proto._getOrientation = function() {
		if (window.innerHeight < window.innerWidth) {
			return ORIENTATION_TYPE.LANDSCAPE;
		} else {
			return ORIENTATION_TYPE.PORTRAIT;
		}
	};

	/**
	 * Add a scroller listener to the assetScroller
	 * @param {Object} listener
	 */
	proto.addScrollerListener = function(listener) {
		this._assetScroller.addScrollerListener(listener);
	};

	/**
	 * Remove a scroller listener from the assetScroller
	 * @param {Object} listener
	 */
	proto.removeScrollerListener = function(listener) {
		this._assetScroller.removeScrollerListener(listener);
	};

	/**
	 * handles the resize
	 *
	 * @param {Boolean} forceRedraw
	 */
	proto.resizeHandler = function() {
		var newOrientation;
		if ($U.core.Device.isPhone()) {
			newOrientation = this._getOrientation();
			if (this._currentOrientation !== newOrientation) {
				this._currentOrientation = newOrientation;
				this._redrawScroller();
			}
		}

		this._assetScroller.resizeHandler();
	};

	/**
	 * Sets the message that nothing is available for display on this screen
	 * @param {String} key Key string of the language bundle asset required.
	 */
	proto._setNoItemsMessage = function(key) {
		var msg = $U.core.util.StringHelper.getString(key);
		var msgClass = $U.core.Device.isWebkitRenderFixNecessary() ? "browse-no-results webkit-render-fix" : "browse-no-results";
		this._clearNoItemsMessage();
		
		this._noItemsElement = $U.core.util.DomEl.createElWithText("div", msg).setClassName(msgClass).asElement();
		this._scrollerContainer.insertBefore(this._noItemsElement, this._scroller);
	};

	/**
	 * Clears the message that nothing is available for display on this screen
	 */
	proto._clearNoItemsMessage = function() {
		if (this._noItemsElement) {
			this._noItemsElement.parentNode.removeChild(this._noItemsElement);
		}
		this._noItemsElement = null;
	};

	AssetScreen.ORIENTATION_TYPE = ORIENTATION_TYPE;
	return AssetScreen;

}());
