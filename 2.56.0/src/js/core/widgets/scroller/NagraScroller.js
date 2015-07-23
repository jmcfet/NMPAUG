var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.scroller = $U.core.widgets.scroller || {};

$U.core.widgets.scroller.NagraScroller = ( function() {

	/**
	 * Extension of ZyngaScroller
	 * In addition to options supported by Scroller.js we also support:
	 *     measureContent:true if we don't know the size of the content div
	 *
	 * @class $U.core.widgets.scroller.NagraScroller
	 * @extends $U.core.widgets.scroller.Scroller
	 *
	 * @constructor
	 * @param {Object} content A div that contains the content we want to scroll. The div needs to be in a container div.
	 * @param {Object} options Name:value pairs.
	 */

	var logger = $U.core.Logger.getLogger("NagraScroller");

	// used to allow click to happen when the mouse has been move this amount of pixels
	var MIN_MOVE_FOR_SCROLL = 3;

	var timer = {
		scrollIndicator : {
			total : 0,
			count : 0,
			dropped : 0
		}
	};

	var instances = null;

	function instanceMatcher(a, b) {
		return a.name === b.name;
	}

	function addInstance(instance) {

		if (instances === null) {
			instances = new $U.core.util.SimpleSet();
		}

		if (logger) {
			if (instances.containsMatch(instance, instanceMatcher)) {
				logger.log("addInstance", "instance with name", instance.name, "already exists");
			}
		}

		if (!instances.add(instance)) {
			if (logger) {
				logger.log("addInstance", "instance already exists in set", instance);
			}
		}
	}

	function removeInstance(instance) {
		if (!instances.remove(instance)) {
			if (logger) {
				logger.log("removeInstance", "instance does not exist in set", instance);
			}
		}
		$U.core.Launch.removeFromDestroyList(instance);
	}

	/**
	 * Self executing function that creates a function to move an element to a given left, top position.
	 * Function created will use translate3d, translate or margin
	 * @return {Function}
	 */
	var setElementPosition = ( function() {

		var perspectiveProperty = $U.core.Device.getJSPropertyName("perspective");
		var transformProperty = $U.core.Device.getJSPropertyName("transform");

		if (logger) {
			logger.log("setElementPosition", "perspectiveProperty:", perspectiveProperty, "transformProperty:", transformProperty);
		}

		if (perspectiveProperty) {
			if (logger) {
				logger.log("setElementPosition", "using", transformProperty, "-> translate3d");
			}
			return function(element, left, top) {
				element.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0)';
			};

		} else if (transformProperty) {
			if (logger) {
				logger.log("setElementPosition", "using", transformProperty, "-> translate");
			}
			return function(element, left, top) {
				element.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px)';
			};

		} else {
			if (logger) {
				logger.log("setElementPosition", "using margin");
			}
			return function(element, left, top) {
				element.style.marginLeft = left ? (-left) + 'px' : '';
				element.style.marginTop = top ? (-top) + 'px' : '';
			};
		}

	}());

	var NagraScroller = function(content, options, name) {
		var self = this;

		this.name = name;
		if (logger) {
			logger.log("constructor", "name:", this.name);
		}

		$U.destroyList.push(this);

		this.scrollerListeners = new $U.core.util.SimpleSet();
		this.completedListeners = new $U.core.util.SimpleSet();

		this._argComplete = options.scrollingComplete;
		options.scrollingComplete = function() {
			if (self._argComplete) {
				self._argComplete();
			}

			var listeners = self.completedListeners.toArray();
			var l = listeners.length;
			for (var i = 0; i < l; i++) {
				listeners[i].completedCallback(self);
			}
		};

		this.content = content;
		this.container = content.parentNode;
		this.options = options || {};
		this.options.indicatorX = options.indicatorX || {};
		this.options.indicatorY = options.indicatorY || {};
		this.linked = [];
		this.lastLeft = 0;

		// create Scroller instance
		this.scroller = new $U.core.widgets.scroller.Scroller(this, options);
		//this.scroller = new Scroller(function(left, top, zoom, isLink) {

		// keeps track of user actions
		this.mousedown = false;
		this.hasScrolled = false;

		// bind events
		this.bindEvents();

		// the content element needs a correct transform origin for zooming
		this.content.style[NagraScroller.vendorPrefix + 'TransformOrigin'] = "left top";

		// reflow for the first time
		this.reflow();

		// special case if we don't know the size of the content
		// the first reflow call above will cause the content's scrollWidth and scrollHeight to be set
		// this second call will use the scrollWidth and scrollHeight
		if (this.options.measureContent) {
			this.reflow();
		}

		addInstance(this);

	};

	NagraScroller.X_AXIS = {};

	NagraScroller.Y_AXIS = {};

	/**
	 * Add a scroll event listener.
	 */
	NagraScroller.prototype.addScrollerListener = function(listener) {
		this.scrollerListeners.add(listener);
	};

	/**
	 * Remove a scroll event listener
	 */
	NagraScroller.prototype.removeScrollerListener = function(listener) {
		this.scrollerListeners.remove(listener);
	};

	/**
	 * Add a completed event listener.
	 */
	NagraScroller.prototype.addCompletedListener = function(listener) {
		this.completedListeners.add(listener);
	};

	/**
	 * Remove a completed event listener
	 */
	NagraScroller.prototype.removeCompletedListener = function(listener) {
		this.completedListeners.remove(listener);
	};

	/**
	 * Calls back to registered listeners when actions are performed in the scroller such as edge detection, moving etc.
	 * @param {number} left
	 * @param {number} top
	 * @param {number} zoom
	 * @param {boolean} isLink
	 */
	NagraScroller.prototype.scrollerCallback = function(left, top, zoom, isLink) {

		var listeners = this.scrollerListeners.toArray();
		var i, l = listeners.length;

		for ( i = 0; i < l; i++) {
			listeners[i].scrollerCallback(this, left, this.scroller.__maxScrollLeft, top, this.scroller.__maxScrollTop);
		}

		/* Callback function that notifies the passed-in function when an 'edge' event occurs (top/bottom/left/right)
		 * No smoothing of the callbacks is performed (this should happen in the callBack function), so this may emit several callbacks in a short time period
		 */
		if (this.options.notifyEdge) {

			var width = this.container.clientWidth;
			var height = this.container.clientHeight;
			var scrollWidth = this.content.scrollWidth;
			var scrollHeight = this.content.scrollHeight;

			if (left <= 0) {
				this.options.notifyEdge("left");
			} else if (left > 0) {
				this.options.notifyEdge("notleft");
			}
			if (Math.ceil(left + width) >= scrollWidth) {
				this.options.notifyEdge("right");
			} else {
				this.options.notifyEdge("notright");
			}

			if (top <= 0) {
				this.options.notifyEdge("top");
			} else {
				this.options.notifyEdge("nottop");
			}
			if (Math.ceil(top + height) >= scrollHeight) {
				this.options.notifyEdge("bottom");
			} else {
				this.options.notifyEdge("notbottom");
			}
		}

		setElementPosition(this.content, left, top);

		// If scroll indicaator is true
		if (this.options.indicatorX.active || this.options.indicatorY.active) {
			this._moveScrollIndicator(left, top);
			//this.activateScrollIndicators(this.options.indicatorX.active, this.options.indicatorY.active);
		}

		// If this isn't already a result of a linked scroll then
		// broadcast to any linked scrollers
		if (!isLink) {
			for (l in this.linked) {
				if (this.linked.hasOwnProperty(l)) {
					var axis = this.linked[l].axis;
					left = (axis === NagraScroller.Y_AXIS ? null : left);
					top = (axis === NagraScroller.X_AXIS ? null : top);
					this.linked[l].linkedScroller.scroller.scrollTo(left, top, false, zoom, true);
				}
			}
		}

	};

	/**
	 *Add a linked NagraScroller
	 * @param {Object} linked the linked NagraScroller
	 */
	NagraScroller.prototype.addLinked = function(linked, axis) {
		this.linked.push({
			linkedScroller : linked,
			axis : axis
		});
	};

	/**
	 * Scrolls the scroller to a given set of co-ordinates
	 * @param {number} left
	 * @param {number} top
	 * @param {boolean} animate
	 */
	NagraScroller.prototype.scrollTo = function(left, top, animate) {
		this.scroller.scrollTo(left, top, animate, 1, false);
	};
	
	NagraScroller.prototype.scrollToRightEdge = function(animate) {
		this.scroller.scrollTo(this.content.scrollWidth, null, animate, 1, false);	
	};	

	NagraScroller.prototype.scrollToBottomEdge = function(animate) {
		this.scroller.scrollTo(null, this.content.scrollHeight, animate, 1, false);	
	};	

	/**
	 * Works out how much the given element is out of the currently viewed scroll window
	 * @param {HTMLElement} element The DOM element to be checked
	 * @return {Object} Object containing offsets for {left,top,bottom,right}, where negative numbers are the amount that the element is out of view in that value e.g. left: -114 means the object is just out of view to its left by 114 pixels)
	 */
	NagraScroller.prototype.deriveElementPosition = function(element) {

		// Doing these verbose so logic can be followed more easily
		var visibleWindow = {
			left : this.scroller.getValues().left,
			top : this.scroller.getValues().top,
			bottom : this.scroller.getValues().top + this.container.clientHeight,
			right : this.scroller.getValues().left + this.container.clientWidth
		};
		var elementPosition = {
			left : element.offsetLeft,
			top : element.offsetTop,
			bottom : this.container.clientHeight < element.offsetHeight ? element.offsetTop + this.container.clientHeight : element.offsetTop + element.offsetHeight,
			right : this.container.clientWidth < element.offsetWidth ? element.offsetLeft + this.container.clientWidth : element.offsetLeft + element.offsetWidth
		};
		return {
			left : elementPosition.left - visibleWindow.left,
			top : elementPosition.top - visibleWindow.top,
			bottom : visibleWindow.bottom - elementPosition.bottom,
			right : visibleWindow.right - elementPosition.right
		};
	};

	/**
	 * Scroll the scroller to put a given DOM element (defined by its ID) into view
	 * @param {HTMLElement} element The DOM element to be scrolled to
	 * @param {boolean} animate Whether to animate the scrolling action.  Defaults to false
	 */
	NagraScroller.prototype.scrollToElement = function(element, animate) {
		var shouldAnimate = animate || false;
		var visibilityOffsets = this.deriveElementPosition(element);

		var newLeft = 0;
		var newTop = 0;

		// Make sure this element is within our scroller
		if (this.container.contains(element)) {

			// We default to scrolling it into view top/left if the element is out of view in both top/bottom or left/right
			if (visibilityOffsets.bottom < 0) {
				newTop = Math.abs(visibilityOffsets.bottom);
			}
			if (visibilityOffsets.right < 0) {
				newLeft = Math.abs(visibilityOffsets.right);
			}

			if (visibilityOffsets.left < 0) {
				newLeft = visibilityOffsets.left;
			}
			if (visibilityOffsets.top < 0) {
				newTop = visibilityOffsets.top;
			}

			this.scroller.scrollBy(newLeft, newTop, shouldAnimate);
		}
	};

	/**
	 * Resets the scroller back to top 0 left 0
	 */
	NagraScroller.prototype.reset = function() {
		this.scroller.scrollTo(0, 0, false, 1, false);
	};

	/**
	 * Reflows the scroller , making it take into account added/removed contents/sizes
	 */
	NagraScroller.prototype.reflow = function() {
		this.findSizes();
		// set the right scroller dimensions
		if (this.options.measureContent) {
			// use the scrollWidth and scrollHeight
			this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.scrollWidth, this.content.scrollHeight);
		} else {
			// use the offsetWidth and offsetHeight
			this.scroller.setDimensions(this.container.clientWidth, this.container.clientHeight, this.content.offsetWidth, this.content.offsetHeight);
		}

		// refresh the position for zooming purposes
		var rect = this.container.getBoundingClientRect();
		this.scroller.setPosition(rect.left + this.container.clientLeft, rect.top + this.container.clientTop);
	};

	/**
	 *Add a scroll Indicator to the scroll bar
	 * @param {number} left number of pixels scroller has moved left (x axis)
	 * @param {number} top number of pixels scroller has moved from top (y axis)
	 */
	NagraScroller.prototype._moveScrollIndicator = function(left, top) {

		var indicatorMoveX;
		var indicatorMoveY;

		if (this.options.indicatorX.active) {
			left = Math.max(left, 0);

			//Gearing ratio
			indicatorMoveX = left / this._sizes.ratioX;

			// if the movement is greater than the indicator container size set movement to maximum avoids bounce of indicator
			indicatorMoveX = ((indicatorMoveX > this._sizes.indicatorContainerMinusIndicatorSizeX) ? this._sizes.indicatorContainerMinusIndicatorSizeX : indicatorMoveX);

			//Perform animation of indicator
			setElementPosition(this.options.indicatorX.indicatorElement, -indicatorMoveX, 0);
		}

		if (this.options.indicatorY.active) {
			top = Math.max(top, 0);

			//Gearing ratio
			indicatorMoveY = top / this._sizes.ratioY;

			// if the movement is greater than the indicator container size set movement to maximum avoids bounce of indicator
			indicatorMoveY = ((indicatorMoveY > this._sizes.indicatorContainerMinusIndicatorSizeY) ? this._sizes.indicatorContainerMinusIndicatorSizeY : indicatorMoveY);

			//Perform animation of indicator
			setElementPosition(this.options.indicatorY.indicatorElement, 0, -indicatorMoveY);
		}
	};

	/**
	 * Bind touch/click s/scroll etc. events to the scroller
	 * @return void
	 */
	NagraScroller.prototype.bindEvents = function() {

		var that = this;
		//mousewheel has different names for FF
		var mousewheelevt = $U.core.Device.isFirefox() ? "DOMMouseScroll" : "mousewheel";

		this.eventListeners = {};

		this.eventListeners.resize = function(e) {
			that.reflow();
		};

		// reflow handling
		window.addEventListener("resize", this.eventListeners.resize, false);

		// touch devices bind touch events
		if ('ontouchstart' in window) {

			this.eventListeners.touchstart = function(e) {

				// Don't react if initial down happens on a form element
				if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
					return;
				}
				that._startPageX = e.pageX;
				that._startPageY = e.pageY;
				that.hasScrolled = false;

				that.scroller.doTouchStart(e.touches, e.timeStamp);
				//	e.preventDefault();
			};

			this.eventListeners.touchmove = function(e) {
				that.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
				e.preventDefault();

				if (that.options.scrollingX) {
					that._movedPageX = e.pageX;
					if (Math.abs(that._movedPageX - that._startPageX) > MIN_MOVE_FOR_SCROLL) {
						that.hasScrolled = true;
					}
				}

				if (that.options.scrollingY) {
					that._movedPageY = e.pageY;
					if (Math.abs(that._movedPageY - that._startPageY) > MIN_MOVE_FOR_SCROLL) {
						that.hasScrolled = true;
					}
				}
			};

			this.eventListeners.touchend = function(e) {
				that.scroller.doTouchEnd(e.timeStamp);
			};

			this.eventListeners.touchcancel = function(e) {
				that.scroller.doTouchEnd(e.timeStamp);
			};

			this.eventListeners.click = function(e) {
				if (that.hasScrolled) {
					e.stopPropagation();
				}
				that.hasScrolled = false;
			};

			this.container.addEventListener("touchstart", this.eventListeners.touchstart, false);
			this.container.addEventListener("click", this.eventListeners.click, true);
			document.addEventListener("touchmove", this.eventListeners.touchmove, false);
			document.addEventListener("touchend", this.eventListeners.touchend, false);
			document.addEventListener("touchcancel", this.eventListeners.touchcancel, false);

			// non-touch bind mouse events
		} else {

			this.eventListeners.mousedown = function(e) {

				if (e.target.tagName.match(/input|textarea|select/i)) {
					return;
				}

				that._startPageX = e.pageX;
				that._startPageY = e.pageY;

				that.scroller.doTouchStart([{
					pageX : e.pageX,
					pageY : e.pageY
				}], e.timeStamp);

				that.mousedown = true;
				e.preventDefault();

			};

			this.eventListeners.mousemove = function(e) {

				if (!that.mousedown) {
					that.hasScrolled = false;
					return;
				}

				that.scroller.doTouchMove([{
					pageX : e.pageX,
					pageY : e.pageY
				}], e.timeStamp);

				if (that.options.scrollingX) {
					that._movedPageX = e.pageX;
					if (Math.abs(that._movedPageX - that._startPageX) > MIN_MOVE_FOR_SCROLL) {
						that.hasScrolled = true;
					}
				}

				if (that.options.scrollingY) {
					that._movedPageY = e.pageY;
					if (Math.abs(that._movedPageY - that._startPageY) > MIN_MOVE_FOR_SCROLL) {
						that.hasScrolled = true;
					}
				}

			};

			this.eventListeners.mouseup = function(e) {
				if (!that.mousedown) {
					return;
				}
				that.scroller.doTouchEnd(e.timeStamp);
				that.mousedown = false;
			};

			this.eventListeners.click = function(e) {
				if (that.hasScrolled) {
					e.stopPropagation();
				}
				that.hasScrolled = false;
			};

			this.eventListeners.mousewheel = function(e) {
				var delta = e.detail ? e.detail * (-120) : e.wheelDelta;
				var scrollBy = 0 - (delta / 2);
				that.scroller.scrollBy(0, scrollBy, true);
				if (that.options.zooming) {
					that.scroller.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
					e.preventDefault();
				}
			};

			this.container.addEventListener("mousedown", this.eventListeners.mousedown, false);
			this.container.addEventListener("click", this.eventListeners.click, true);

			this.container.addEventListener(mousewheelevt, this.eventListeners.mousewheel, false);
			document.addEventListener("mousemove", this.eventListeners.mousemove, false);
			document.addEventListener("mouseup", this.eventListeners.mouseup, false);
		}

	};

	/**
	 * This gets called on creation of scroller and on rotation
	 * the indicator may have own class so can't just replace the class
	 * also adjusts the size of the indicator so that it is representative to the amount of content in the scroller
	 * @param {Object} indX
	 * @param {Object} indY
	 */
	NagraScroller.prototype.activateScrollIndicators = function(indX, indY) {
		var percentX, percentY = 5;

		if (this.options.indicatorX) {
			//calculate the width of the scrollbar indicator (don't want to show it if scroller won't scroll)
			this._scrollerSizeX = this.content.scrollWidth || 0;
			this._scrollInViewX = this.container.getBoundingClientRect().width || 0;
			if (this._scrollerSizeX > 0) {
				percentX = (this._scrollInViewX / this._scrollerSizeX) * 100;
				if (percentX >= 100) {
					indX = false;
				}
			}

			this.options.indicatorX.active = indX;
			if (indX) {
				if ($(this.options.indicatorX.indicatorElement).hasClass("hide")) {
					$(this.options.indicatorX.indicatorElement).toggleClass("show hide");
				} else {
					$(this.options.indicatorX.indicatorElement).addClass("show");
				}
				this.options.indicatorX.indicatorElement.style.width = percentX + "%";
			} else {
				if ($(this.options.indicatorX.indicatorElement).hasClass("show")) {
					$(this.options.indicatorX.indicatorElement).toggleClass("show hide");
				} else {
					$(this.options.indicatorX.indicatorElement).addClass("hide");
				}
			}
		}
		if (this.options.indicatorY) {
			//calculate the height of the scrollbar indicator (don't want to show it if scroller won't scroll)
			this._scrollerSizeY = this.content.scrollHeight || 0;
			this._scrollInViewY = this.container.getBoundingClientRect().height || 0;
			if (this._scrollerSizeY > 0) {
				percentY = (this._scrollInViewY / this._scrollerSizeY) * 100;
				if (percentY >= 100) {
					indY = false;
				}
			}

			this.options.indicatorY.active = indY;
			if (indY) {
				if ($(this.options.indicatorY.indicatorElement).hasClass("hide")) {
					$(this.options.indicatorY.indicatorElement).toggleClass("show hide");
				} else {
					$(this.options.indicatorY.indicatorElement).addClass("show");
				}
				this.options.indicatorY.indicatorElement.style.height = percentY + "%";
			} else {
				if ($(this.options.indicatorY.indicatorElement).hasClass("show")) {
					$(this.options.indicatorY.indicatorElement).toggleClass("show hide");
				} else {
					$(this.options.indicatorY.indicatorElement).addClass("hide");
				}
			}
		}

		this.findSizes();
	};

	NagraScroller.prototype.findSizes = function() {

		if (this.options.indicatorX.active) {
			this._sizes = {
				scrollerSizeX : this.content.scrollWidth,
				scrollInViewX : this.container.getBoundingClientRect().width,
				indicatorContainerSizeX : this.options.indicatorX.indicatorContainerElement.offsetWidth,
				indicatorSizeX : this.options.indicatorX.indicatorElement.offsetWidth
			};

			this._sizes.widthOfScrollMinusInViewX = this._sizes.scrollerSizeX - this._sizes.scrollInViewX;
			this._sizes.indicatorContainerMinusIndicatorSizeX = this._sizes.indicatorContainerSizeX - this._sizes.indicatorSizeX;
			this._sizes.ratioX = (this._sizes.widthOfScrollMinusInViewX / 100) / ((this._sizes.indicatorContainerMinusIndicatorSizeX) / 100);
		}

		if (this.options.indicatorY.active) {
			this._sizes = {
				scrollerSizeY : this.content.scrollHeight,
				scrollInViewY : this.container.getBoundingClientRect().height,
				indicatorContainerSizeY : this.options.indicatorY.indicatorContainerElement.offsetHeight,
				indicatorSizeY : this.options.indicatorY.indicatorElement.offsetHeight
			};

			this._sizes.widthOfScrollMinusInViewY = this._sizes.scrollerSizeY - this._sizes.scrollInViewY;
			this._sizes.indicatorContainerMinusIndicatorSizeY = this._sizes.indicatorContainerSizeY - this._sizes.indicatorSizeY;
			this._sizes.ratioY = (this._sizes.widthOfScrollMinusInViewY / 100) / ((this._sizes.indicatorContainerMinusIndicatorSizeY) / 100);
		}

	};

	NagraScroller.prototype.getScrollLeft = function() {
		return this.scroller.getValues().left;
	};

	NagraScroller.prototype.getScrollTop = function() {
		return this.scroller.getValues().top;
	};

	/**
	 * Destroys references that cause memory leak.
	 * This NagraScroller must unregister event listeners and delete circular DOM references.
	 */
	NagraScroller.prototype.destroy = function() {
		var i;
		var a;

		if (logger) {
			logger.log("destroy", "name:", this.name);
		}

		window.removeEventListener("resize", this.eventListeners.resize);
		this.container.removeEventListener("click", this.eventListeners.click);

		this.container.removeEventListener("mousedown", this.eventListeners.mousedown);
		this.container.removeEventListener("mousewheel", this.eventListeners.mousewheel);
		document.removeEventListener("mousemove", this.eventListeners.mousemove);
		document.removeEventListener("mouseup", this.eventListeners.mouseup, false);

		this.container.removeEventListener("touchstart", this.eventListeners.touchstart);
		document.removeEventListener("touchmove", this.eventListeners.touchmove);
		document.removeEventListener("touchend", this.eventListeners.touchend);
		document.removeEventListener("touchcancel", this.eventListeners.touchcancel);
		delete this.eventListeners;
		delete this.scroller.__listener;
		delete this.scroller;
		delete this.content;
		delete this.options;
		delete this.container;
		delete this._indicatorContainerX;
		delete this._indicatorContainerY;
		delete this._indicatorElementX;
		delete this._indicatorElementY;

		for ( i = 0; i < this.linked.length; i++) {
			delete this.linked[i];
		}
		delete this.scrollerListeners;
		delete this.completedListeners;

		removeInstance(this);
	};

	/**
	 * Automatically attach an EasyScroller to elements found with the right data attributes
	 * @return {Object}
	 */
	NagraScroller.createScrollers = function() {

		var elements = document.querySelectorAll('[data-scrollable],[data-zoomable]'), element, scrollers = [];
		for (var i = 0; i < elements.length; i++) {
			element = elements[i];
			var measureContent = element.dataset.measure || false;
			var scrollable = element.dataset.scrollable;
			var zoomable = element.dataset.zoomable || '';
			var zoomOptions = zoomable.split('-');
			var minZoom = zoomOptions.length > 1 && parseFloat(zoomOptions[0]);
			var maxZoom = zoomOptions.length > 1 && parseFloat(zoomOptions[1]);

			scrollers.push(new NagraScroller(element, {
				scrollingX : scrollable === 'true' || scrollable === 'x',
				scrollingY : scrollable === 'true' || scrollable === 'y',
				zooming : zoomable === 'true' || zoomOptions.length > 1,
				minZoom : minZoom,
				maxZoom : maxZoom,
				measureContent : measureContent
			}));
		}
		return scrollers;
	};

	return NagraScroller;

}());
