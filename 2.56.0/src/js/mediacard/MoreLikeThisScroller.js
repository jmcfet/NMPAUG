/**
 * Scroller used to display the assets that are related to main asset shown on the media card
 * @class $U.mediaCard.MoreLikeThisScroller
 *
 * @constructor
 * @param {HTMLElement} container containing element
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MoreLikeThisScroller = ( function() {

	// The more like this scroller's name
	var SCROLLER_NAME = "MoreLikeThisScroller";

	var SCROLLER_PADDING = {
		left : 0,
		right : 40
	};

	var ANIMATION_DURATION = 250;

	function MoreLikeThisScroller(container) {

		superClass.call(this, container);
		var that = this;

		function createDiv(className, parent) {
			return $U.core.util.DomEl.createDiv().setClassName(className).attachTo(parent).asElement();
		}

		var scrollerContainer = createDiv("mc-scroller-container", container);
		var scroller = createDiv("scroller", scrollerContainer);

		var footer = createDiv("footer", container);
		var scrollIndicatorContainer = createDiv("scroller-horizontal-indicator-container", footer);
		var scrollIndicator = createDiv("scroller-horizontal-indicator", scrollIndicatorContainer);
		if ($U.core.Device.isDesktop()) {
			var leftArrowDiv = createDiv("desktop-assetscroller-arrow arrow-left left-in-container", scrollerContainer);
			var rightArrowDiv = createDiv("desktop-assetscroller-arrow arrow-right right-in-container", scrollerContainer);

			var leftArrow = document.createElement("i");
			var rightArrow = document.createElement("i");

			leftArrow.className = "icon-chevron-left icon-2x";
			rightArrow.className = "icon-chevron-right icon-2x";

			leftArrowDiv.addEventListener("click", function() {
				that._pagePrev();
			});
			rightArrowDiv.addEventListener("click", function() {
				that._pageNext();
			});

			leftArrowDiv.appendChild(leftArrow);
			rightArrowDiv.appendChild(rightArrow);

			this._leftArrowDiv = leftArrowDiv;
			this._rightArrowDiv = rightArrowDiv;

			this._scroller = new $U.core.widgets.AssetScroller(scroller, true, 1, SCROLLER_PADDING, {
				active : true,
				indicatorContainerElement : scrollIndicatorContainer,
				indicatorElement : scrollIndicator
			}, {}, {
				animationDuration : ANIMATION_DURATION,
				scrollingComplete : function() {
					that.checkScrollerPages();
				}
			}, SCROLLER_NAME);
		} else {
			this._scroller = new $U.core.widgets.AssetScroller(scroller, true, 1, SCROLLER_PADDING, {
				active : true,
				indicatorContainerElement : scrollIndicatorContainer,
				indicatorElement : scrollIndicator
			}, null, null, SCROLLER_NAME);
		}

		this._scrollerContainer = scrollerContainer;
	}

	var superClass = $U.mediaCard.CategoryMoreLikeThis;
	$N.apps.util.Util.extend(MoreLikeThisScroller, superClass);

	var proto = MoreLikeThisScroller.prototype;

	/**
	 * Puts the assets into the scroller
	 * @param {Array} items items to put into the scroller
	 */
	proto.populateAssets = function(items) {
		// Only populate if the items are different to the current items
		if (items !== this._scroller.getItems()) {
			this._scroller.populate(items);
			this._items = items;
		}
	};

	/**
	 * Sets the height of the container that holds the scroller
	 * @param {number} height the height to set
	 */
	proto.setHeight = function(height) {
		var arrowTop;
		$U.core.util.HtmlHelper.setHeight(this._scrollerContainer, height);
		//change the top of the arrows
		if (this._leftArrowDiv) {
			arrowTop = (height - this._leftArrowDiv.clientHeight ) / 2;
			$U.core.util.HtmlHelper.setTop(this._leftArrowDiv, arrowTop);
			$U.core.util.HtmlHelper.setTop(this._rightArrowDiv, arrowTop);
		}
	};

	/**
	 * Handles the resize of the scroller
	 * @return {Object} the dimensions of the scroller after the resize
	 */
	proto.resizeHandler = function() {
		this.checkScrollerPages();
		return this._scroller.resizeHandler();
	};

	proto._pagePrev = function() {
		this._pageBy(-(this._scroller._scroller.container.clientWidth - 200));
	};

	proto._pageNext = function() {
		this._pageBy(this._scroller._scroller.container.clientWidth - 200);
	};

	proto._pageBy = function(offset) {
		this._scroller._scroller.scroller.scrollBy(offset, 0, true);
	};

	/**
	 * Checks the position of the scroller and disables or enables paging arrows as necessary
	 *
	 */
	proto.checkScrollerPages = function() {
		if ($U.core.Device.isDesktop()) {
			// If assets won't fill the screen, we don't want any buttons shown
			var clientWidth = this._container.clientWidth;

			if (this._scroller._scroller.scroller.__scrollLeft <= 0) {
				$(this._leftArrowDiv).addClass('disabled-arrow');
			} else {
				$(this._leftArrowDiv).removeClass('disabled-arrow');
			}

			if (this._scroller._scroller.scroller.__contentWidth - this._scroller._scroller.scroller.__scrollLeft <= clientWidth) {
				$(this._rightArrowDiv).addClass('disabled-arrow');
			} else {
				$(this._rightArrowDiv).removeClass('disabled-arrow');
			}

			if (this._scroller._scroller.scroller.__contentWidth <= clientWidth) {
				$(this._leftArrowDiv).addClass('hide');
				$(this._rightArrowDiv).addClass('hide');
			} else {
				$(this._leftArrowDiv).removeClass('hide');
				$(this._rightArrowDiv).removeClass('hide');
			}
		}
	};
	
	proto.destroy = function() {
		this._scroller.destroy();
	};

	return MoreLikeThisScroller;

}());
