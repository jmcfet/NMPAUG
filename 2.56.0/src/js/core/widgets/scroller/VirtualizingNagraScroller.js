var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.scroller = $U.core.widgets.scroller || {};

$U.core.widgets.scroller.VirtualizingNagraScroller = ( function() {
	
	/**
	 * Extension of NagraScroller to add virtualization
	 * 
	 * @class $U.core.widgets.scroller.VirtualizingNagraScroller
	 * @extends $U.core.widgets.scroller.NagraScroller
	 * 
	 * @constructor
	 * @param {Object} content A div that contains the content we want to scroll. The div needs to be in a container div.
	 * @param {Object} options Name:value pairs.
	 */
	var VirtualizingNagraScroller = function(content, options, name) {
		var self = this;
		this._previousComplete = options.scrollingComplete;
		options.scrollingComplete = function() {
			if(self._previousComplete) {
				self._previousComplete();
			}

			self.virtualize();
		};
		
		this._isVisible = false;
		this._scrollEventTimer = null;
		this._firstVirtualizationDone = false;

		superClass.call(this, content, options, name);

		// We want the mouse wheel to scroll the window
		this.content.addEventListener("mousewheel", function(e) {
			self._onWheelEvent(e);
		}, false);

	};
	
	var superClass = $U.core.widgets.scroller.NagraScroller;
	$N.apps.util.Util.extend(VirtualizingNagraScroller, superClass);

	var proto = VirtualizingNagraScroller.prototype;
	
	proto._onWheelEvent = function(e) {
		if(this.options.scrollingY) {
			this.scrollTo(null, this.scroller.__scrollTop - e.wheelDelta);
			e.preventDefault();
			e.stopPropagation();
		}
	};
	
	/**
	 * Sets the array of children items. Must have a getContainer method to get the HTML element and
	 * hide, show, getWidth, getHeight, getLeft, getTop, setLeft, setTop and calculateSizes methods.
	 * @param {Array} children items that represent the HTML elements inside the container we want to virtualize.  
	 */
	proto.setItems = function(items) {
		this._items = items;
		
		for(var i = 0; i < this._items.length; i++) {
			this._items[i].calculateSizes();
		}

		this.virtualize();
	};
	
	function getOffsetTopRelativeToAncestor(item, ancestor) {
		var top = item.getTop();
		if(top !== undefined) {
			return top;
		}

		var element = item.getContainer();

		var elemRect = element.getBoundingClientRect();
		var ancestorRect = ancestor.getBoundingClientRect();

		top = elemRect.top - ancestorRect.top;
		item.setTop(top);

		return top;
	}
	
	function getOffsetLeftRelativeToAncestor(item, ancestor) {
		var left = item.getLeft();
		if(left !== undefined) {
			return left;
		}

		var element = item.getContainer();

		var elemRect = element.getBoundingClientRect();
		var ancestorRect = ancestor.getBoundingClientRect();

		left = elemRect.left - ancestorRect.left;
		item.setLeft(left);
		
		return left;
	}
	
	proto.virtualize = function() {
		if(this._items) {
			var i;
			var containerSize;
			var itemPos;
			var itemSize;
			var scrollPos;
			var scrollerValues = this.scroller.getValues();
			
			var shownAreaFound = false;
			var afterScrollerVisibleAreaFound = false;
			
			for(i = 0; i < this._items.length; i++) {
				var item = this._items[i];
				
				if(this._firstVirtualizationDone && afterScrollerVisibleAreaFound) {
					item.hide();
				} else {
					if(this.options.scrollingY) {
						scrollPos = scrollerValues.top;
						containerSize = this._containerHeight;
						itemPos = getOffsetTopRelativeToAncestor(item, this.content);
						itemSize = item.getHeight();
					} else {
						scrollPos = scrollerValues.left;
						containerSize = this._containerWidth;
						itemPos = getOffsetLeftRelativeToAncestor(item, this.content);
						itemSize = item.getWidth();
					}
	
					if(this._isItemVisible(itemPos, itemSize, containerSize, scrollPos)) {
						item.show();
						shownAreaFound = true;
					} else {
						item.hide();
						if(shownAreaFound) {
							afterScrollerVisibleAreaFound = true;
						}
					}
				}
			}
			
			this._firstVirtualizationDone = true;
		}
	};
	
	proto._isItemVisible = function(itemPos, itemSize, containerSize, scrollPos) {
		if(itemPos + itemSize < scrollPos - 200) {
			//Before scroller visible area
			return false;
		} else if(itemPos > scrollPos + containerSize + 200) {
			//After scroller visible area
			return false;
		} else {
			//Inside scroller visible area
			return true;
		}
	};

	/**
	 * Reflows the scroller, making it take into account added/removed contents/sizes
	 */
	proto.reflow = function() {
		superClass.prototype.reflow.call(this);
		
		this._containerHeight = this.container.clientHeight;
		this._containerWidth = this.container.clientWidth;
		this._firstVirtualizationDone = false;

		this.virtualize();
	};

	/**
	 * Calls back to registered listeners when actions are performed in the scroller such as edge detection, moving etc.
	 * @param {number} left
	 * @param {number} top
	 * @param {number} zoom
	 * @param {boolean} isLink
	 */
	proto.scrollerCallback = function(left, top, zoom, isLink) {
		superClass.prototype.scrollerCallback.call(this, left, top, zoom, isLink);
		
		if(!this._scrollEventTimer) {
			var self = this;
			this._scrollEventTimer = setTimeout(function() {
				self._scrollEventTimer = null;
				self.virtualize();
			}, 300);
		}
	};
	
	proto.setVisible = function(isVisible) {
		this._isVisible = isVisible;
		if(isVisible) {
			this._containerHeight = this.container.clientHeight;
			this._containerWidth = this.container.clientWidth;
		}
	};
	
	proto.isVisible = function() {
		return this._isVisible;
	};
	
	return VirtualizingNagraScroller;

}());
