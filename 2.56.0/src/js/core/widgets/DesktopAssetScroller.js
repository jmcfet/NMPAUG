var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.DesktopAssetScroller = ( function() {

	var logger = $U.core.Logger.getLogger("DesktopAssetScroller");

	var EMPTY_INDICATOR = {};
	var ANIMATION_DURATION = 250;
	
	/**
	 * Object representing a Desktop Asset Scroller in Browse
	 * @class $U.core.widgets.DesktopAssetScroller
	 * @param {HTMLElement} container scroller container that holds the scroller
	 * @param {number} rowCount how may rows of assets the scroller will contain - 0 = the scroller will scroll vertically
	 * @param {number} padding padding around the asset tile
	 * @param {boolean} indicatorX id of the div used for the horizontal scrollbar
	 * @param {boolean} indicatorY id of the div used for the vertical scrollbar
	 */
	var DesktopAssetScroller = function(title, parentElement, shouldHideIfEmpty, name) {

		var that = this;

		this._title = title;
		this._shouldHideIfEmpty = shouldHideIfEmpty;
		this._domElement = this._createScrollerElements(title);
		parentElement.appendChild(this._domElement);

		//rowCount > 0 means it's landscape
		this._isLandscape = true;

		this._rowCount = 1;
		this._originalRowOrColCount = 1;

		this.createEmptyRows();

		this._padding = {
			left : 20,
			right : 20
		};

		this._PADDING_DIV = document.createElement("div");
		$U.core.util.HtmlHelper.setWidth(this._PADDING_DIV, this._padding.right);
		this._PADDING_DIV.className = "asset-item-padding";

		this._scroller = new $U.core.widgets.scroller.NagraScroller(this._container, {
			scrollingX : this._isLandscape,
			scrollingY : !this._isLandscape,
			zooming : false,
			minZoom : 1,
			maxZoom : 1,
			measureContent : true,
			bouncing : true,
			paging : false,
			snapping : true,
			animationDuration : ANIMATION_DURATION,
			scrollingComplete : function() {
				that.checkScrollerPages();
			}
		}, name);

		this._gutter = 20;
		this._portraitAspectRatio = 2 / 3;
		this._landscapeAspectRatio = 14 / 9;

		this._calculateSizes(this._container.clientHeight);
		this._scroller.scroller.setSnapSize(this._smallW + this._gutter, this._smallH);

		this._scroller.addScrollerListener(this);
	};

	// Extend Abstract class AssetScroller
	var superClass = $U.core.widgets.AssetScroller;
	$N.apps.util.Util.extend(DesktopAssetScroller, superClass);

	var proto = DesktopAssetScroller.prototype;

	Object.defineProperties(proto, {
		/**
		 * @property {Object} domElement this DesktopAssetScroller's DOM element
		 * @readonly
		 */
		"domElement" : {
			get : function() {
				return this._domElement;
			}
		}
	});

	//should be put into the assetScroller:
	proto._createScrollerElements = function(categoryName) {

		var self = this;

		//create some HTML elements
		var scrollerContainerContainer = document.createElement("div");
		var scrollerContainer = document.createElement("div");
		var scroller = document.createElement("div");
		var categoryTitleDiv = document.createElement("div");
		this._categoryTitle = document.createElement("h1");
		var leftArrowDiv = document.createElement("div");
		var leftArrow = document.createElement("i");
		var rightArrowDiv = document.createElement("div");
		var rightArrow = document.createElement("i");

		//make them pretty
		scrollerContainerContainer.className = "desktop-browse-scroller-container-container";
		scrollerContainer.className = "desktop-browse-scroller-container";
		scroller.className = "scroller-horizontal asset-scroller";
		this._categoryTitle.className = "title";
		leftArrowDiv.className = "desktop-assetscroller-arrow arrow-left left-in-container";
		leftArrow.className = "icon-chevron-left icon-2x";
		rightArrowDiv.className = "desktop-assetscroller-arrow arrow-right right-in-container";
		rightArrow.className = "icon-chevron-right icon-2x";

		//add the title text
		this._categoryTitle.innerHTML = categoryName;

		//put some logic on the left/right buttons
		leftArrowDiv.addEventListener("click", function() {
			self._pagePrev();
		});
		rightArrowDiv.addEventListener("click", function() {
			self._pageNext();
		});

		categoryTitleDiv.appendChild(this._categoryTitle);
		// This is necessary to prevent complete layout failure in Firefox.
		categoryTitleDiv.style.overflow = "hidden";

		scrollerContainerContainer.appendChild(categoryTitleDiv);
		scrollerContainer.appendChild(scroller);
		scrollerContainerContainer.appendChild(scrollerContainer);
		leftArrowDiv.appendChild(leftArrow);
		rightArrowDiv.appendChild(rightArrow);
		scrollerContainerContainer.appendChild(leftArrowDiv);
		scrollerContainerContainer.appendChild(rightArrowDiv);

		this._container = scroller;
		this._leftArrowDiv = leftArrowDiv;
		this._rightArrowDiv = rightArrowDiv;

		return scrollerContainerContainer;
	};

	proto._pagePrev = function() {
		if (this._atLeftEdge && this._canPagePrev) {
			if (logger) {
				logger.log("_pagePrev", "page prev");
			}
			$U.browse.MultiBrowseScreen.pageCategory(this._categoryId, this._pageSize, Math.max(0, this._pageOffset - this._pageSize), true);
		} else {
			if (logger) {
				logger.log("_pagePrev", "scroll prev");
			}			
			this._pageBy(-(this._scroller.container.clientWidth - 200));
		}
	};

	proto._pageNext = function() {
		if (this._atRightEdge && this._canPageNext) {
			if (logger) {
				logger.log("_pageNext", "page next");
			}			
			$U.browse.MultiBrowseScreen.pageCategory(this._categoryId, this._pageSize, this._pageOffset + this._pageSize);
		} else {
			if (logger) {
				logger.log("_pageNext", "scroll next");
			}						
			this._pageBy(this._scroller.container.clientWidth - 200);
		}
	};

	proto._pageBy = function(offset) {
		var that = this;
		this._scroller.scroller.scrollBy(offset, 0, true);
		window.setTimeout(function() {
			that._scrollFinished();
		}, this.getAnimationDuration());
	};

	/**
	 * populates the scroller
	 * @param {Array} items the array of assets
	 */
	proto.populate = function(items, suppressPageLoader, categoryId, pageSize, pageOffset, totalAssetCount, scrollToEnd) {		
		// suppressPageLoader is true for DesktopAssetScrollers
		suppressPageLoader = true;
		superClass.prototype.populate.call(this, items, suppressPageLoader, categoryId, pageSize, pageOffset, totalAssetCount);
		if (this._shouldHideIfEmpty && items.length === 0) {
			if (logger) {
				logger.log("populate", "Hiding empty scroller: ", this._title);
			}
			this._domElement.style.display = "none";
		} else {
			this._domElement.style.display = "block";
		}
		if (scrollToEnd) {
			this._scroller.scrollToRightEdge();
		}
		this.checkScrollerPages();		
	};

	/**
	 * Updates the title displayed in the scroller
	 * @param title the new title for the scroller
	 */
	proto.updateTitle = function(title) {
		this._categoryTitle.innerHTML = title;
	};

	/**
	 * Adjusts the scrollbars
	 * changes scroller direction and hide/show relevant scrollbarage
	 * @private
	 */
	proto._adjustScrollbars = function() {
		// Does nothing in this implementation
	};
	/**
	 * Handle a callback from a Scroller we're listening to.
	 * This checks to see when the scroller has finished scrolling
	 *
	 * @param {Object} scroller Scroller object to target
	 * @param {Number} left Pixels left to position scroller
	 * @param {Number} maxleft maximum left to scroller scroller
	 */
	proto.scrollerCallback = function(scroller, left, maxLeft /*, top, maxTop*/) {
		var dLeft = Math.abs(this._previousScrollLeft - left);
		// if (dLeft < 2 || left === maxLeft || left === 0) {
		// this._scrollFinished();
		// }
		this._previousScrollLeft = left;
	};

	/**
	 * Called when the scroller has finished scrolling,
	 * goes through the items in the scroller and checks to see if they are currently on the screen
	 * if they are then the image is loaded for the tile
	 */
	proto._scrollFinished = function() {
		var i;
		var len = this._assetTiles.length;
		var scrollerRect = {
			left : this._previousScrollLeft,
			top : 0,
			right : this._scroller.container.offsetWidth + this._previousScrollLeft,
			bottom : this._scroller.container.offsetHeight
		};
		var imgRect;
		for ( i = 0; i < len; i++) {
			imgRect = {
				left : this._assetTiles[i]._container.offsetLeft,
				right : this._assetTiles[i]._container.offsetLeft + this._assetTiles[i]._container.clientWidth,
				top : 0,
				bottom : this._assetTiles[i]._container.clientHeight
			};

			// if (this._doRectsIntesect(scrollerRect, imgRect)) {
			// //this._assetTiles[i].load();
			// }
			if (this._isRectRightOf(scrollerRect, imgRect)) {
				//might as well stop we know that this tile is off the screen
				i = len;
			}
		}
	};

	/**
	 * check to see if the two rectangles intersect
	 * @param {Object} r1 first rectangle
	 * @param {Object} r2 second rectangle
	 */
	proto._doRectsIntesect = function(r1, r2) {
		return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
	};

	/**
	 * check to see if r2 is to the right of r1
	 * @param {Object} r1 first rectangle
	 * @param {Object} r2 second rectangle
	 */
	proto._isRectRightOf = function(r1, r2) {
		return (r2.left > r1.right);
	};

	/**
	 * Implementation of _loadAssetTile that doesn't load the tile but calls the callback to say it does (to hide the loading screen)
	 * @param {$U.core.widgets.assettile.AssetTile} assetTile the tile that is 'loaded'
	 */

	proto._loadAssetTile = function(assetTile) {
		//don't load the tile yet
		this.assetTileLoad();
	};

	proto.getAnimationDuration = function() {
		return ANIMATION_DURATION;
	};

	///Methods needed to represent a VirtualizingNagraScroller item.

	proto.getContainer = function() {
		return this._container.parentNode;
	};

	proto.hide = function() {
		$(this._container).addClass("hide");
		this._scroller.setVisible(false);
	};

	proto.show = function() {
		$(this._container).removeClass("hide");
		this._scroller.setVisible(true);
	};

	proto.isShown = function() {
		return this._scroller.isVisible();
	};

	proto.getWidth = function() {
		return this._itemWidth;
	};

	proto.getHeight = function() {
		return this._itemHeight;
	};

	proto.getLeft = function() {
		return this._itemLeft;
	};

	proto.getTop = function() {
		return this._itemTop;
	};

	proto.setLeft = function(left) {
		this._itemLeft = left;
	};

	proto.setTop = function(top) {
		this._itemTop = top;
	};

	proto.calculateSizes = function() {
		this._itemWidth = this._container.parentNode.offsetWidth;
		this._itemHeight = this._container.parentNode.offsetHeight;
	};

	proto.resizeHandler = function() {
		var a = 0;
		superClass.prototype.resizeHandler.call(this);
		this.checkScrollerPages();
	};

	/**
	 * Checks the position of the scroller and disables or enables paging arrows as necessary
	 *
	 */
	proto.checkScrollerPages = function() {

		// If assets won't fill the screen, we don't want any buttons shown

		var clientWidth = this.domElement.clientWidth;

		if (this._scroller.scroller.__scrollLeft <= 0) {
			this._atLeftEdge = true;
			if (!this._canPagePrev) {
				$(this._leftArrowDiv).addClass('disabled-arrow');
			}
		} else {
			this._atLeftEdge = false;
			$(this._leftArrowDiv).removeClass('disabled-arrow');
		}

		if (this._scroller.scroller.__contentWidth - this._scroller.scroller.__scrollLeft <= clientWidth) {
			this._atRightEdge = true;
			if (!this._canPageNext) {
				$(this._rightArrowDiv).addClass('disabled-arrow');
			}
		} else {
			this._atRightEdge = false;
			$(this._rightArrowDiv).removeClass('disabled-arrow');
		}

		if (this._scroller.scroller.__contentWidth <= clientWidth) {
			if (!this._canPagePrev) {
				$(this._leftArrowDiv).addClass('hide');
			}
			$(this._rightArrowDiv).addClass('hide');
		} else {
			$(this._leftArrowDiv).removeClass('hide');
			$(this._rightArrowDiv).removeClass('hide');
		}
	};

	return DesktopAssetScroller;

}());
