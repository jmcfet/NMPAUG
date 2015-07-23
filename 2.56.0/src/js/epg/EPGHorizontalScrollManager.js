var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.EPGHorizontalScrollManager = $U.epg.EPGHorizontalScrollManager || {};

$U.epg.EPGHorizontalScrollManager = ( function() {
	
	var _epgElem;
	var _scrollerContainerGrid;
	var _miniMediaCardElem;
	var _epgGridScroller;
	var _leftArrow;
	var _rightArrow;
	
	var _timeLastMovement = 0;
	var _showingArrows = false;
	var _previousX = -1;
	var _previousY = -1;

	/**
	 * Manages automatic scroller on the EPG
	 * 
	 * @class $U.epg.EPGHorizontalScrollManager
	 * 
	 * @constructor
	 * @param {Object} epgElem A div that contains the full epg.
	 * @param {Object} scrollerContainerGrid A div that contains the epg grid.
	 * @param {Object} miniMediaCardElem A div that contains the mini media card below.
	 * @param {Object} epgGridScroller A VirtualizingNagraScroller that scrolls the epg grid.
	 * @param {Object} leftArrow A div with the arrow to scroll left.
	 * @param {Object} rightArrow A div with the arrow to scroll right.
	 */
	var EPGHorizontalScrollManager = function(epgElem, scrollerContainerGrid, miniMediaCardElem, epgGridScroller, leftArrow, rightArrow) {
		var self = this;

		_epgElem = epgElem;
		_scrollerContainerGrid = scrollerContainerGrid;
		_miniMediaCardElem = miniMediaCardElem;
		_epgGridScroller = epgGridScroller;
		_leftArrow = leftArrow;
		_rightArrow = rightArrow;
		
		_epgGridScroller.addCompletedListener(this);

		_epgElem.addEventListener("mousemove", function(e) {
			self._onMousemoveEvent(e);
		}, false);
		
		_leftArrow.addEventListener("mousedown", function(e) {
			self._onLeftArrowMouseDown(e);
		}, false);
		_rightArrow.addEventListener("mousedown", function(e) {
			self._onRightArrowMouseDown(e);
		}, false);
		
		_leftArrow.addEventListener("click", function(e) {
			self._onLeftArrowClicked(e);
		}, false);
		
		_rightArrow.addEventListener("click", function(e) {
			self._onRightArrowClicked(e);
		}, false);
		
		$U.core.util.HtmlHelper.setDisplayNone(_leftArrow);
		$U.core.util.HtmlHelper.setDisplayNone(_rightArrow);
		
		setInterval(this._onMovementInterval, 200);
	};
	
	var proto = EPGHorizontalScrollManager.prototype;
	
	/**
	 * Callback for the mousedown event on the left arrow
	 * @param {Event} e Event details of the click
	 */
	proto._onLeftArrowMouseDown = function(e) {
		if(_showingArrows) {
			var curLeft = _epgGridScroller.getScrollLeft();
			if(curLeft > 0) {
				e.stopPropagation();
			}
		}
	};
	
	/**
	 * Callback for the mousedown event on the right arrow
	 * @param {Event} e Event details of the click
	 */
	proto._onRightArrowMouseDown = function(e) {
		if(_showingArrows) {
			var curLeft = _epgGridScroller.getScrollLeft();
			if(curLeft < _epgGridScroller.content.offsetWidth - _scrollerContainerGrid.offsetWidth) {
				e.stopPropagation();
			}
		}
	};
	
	/**
	 * Callback for when the left arrow is clicked
	 * @param {Event} e Event details of the click
	 */
	proto._onLeftArrowClicked = function(e) {
		if(_showingArrows) {
			var curLeft = _epgGridScroller.getScrollLeft();
			if(curLeft > 0) {
				var curTop = _epgGridScroller.getScrollTop();
				
				var pageScrollAmmount = _scrollerContainerGrid.offsetWidth;
	
				var newPos = curLeft - Math.floor(pageScrollAmmount*0.7);
	
				_epgGridScroller.scrollTo(newPos, curTop, true);
				
				if(newPos < _epgGridScroller.content.offsetWidth - _scrollerContainerGrid.offsetWidth) {
					$U.core.util.HtmlHelper.setDisplayInlineBlock(_rightArrow);
					$(_rightArrow).addClass("display");
				}
				
				_timeLastMovement = new Date().getTime(); //Reset timer when clicking so that it doesn't disappear too son.

				e.preventDefault();
				e.stopPropagation();
			}
		}
	};
	
	/**
	 * Callback for when the right arrow is clicked
	 * @param {Event} e Event details of the click
	 */
	proto._onRightArrowClicked = function(e) {
		if(_showingArrows) {
			var curLeft = _epgGridScroller.getScrollLeft();

			if(curLeft < _epgGridScroller.content.offsetWidth - _scrollerContainerGrid.offsetWidth) {
				var curTop = _epgGridScroller.getScrollTop();

				var pageScrollAmmount = _scrollerContainerGrid.offsetWidth;

				var newPos = curLeft + Math.floor(pageScrollAmmount*0.7);

				_epgGridScroller.scrollTo(newPos, curTop, true);

				if(newPos > 0) {
					$U.core.util.HtmlHelper.setDisplayInlineBlock(_leftArrow);
					$(_leftArrow).addClass("display");
				}

				_timeLastMovement = new Date().getTime(); //Reset timer when clicking so that it doesn't disappear too son.

				e.preventDefault();
				e.stopPropagation();
			}
		}
	};

	/**
	 * Callback for when the mouse is moving over the epg
	 * @param {Event} e Event details of the mouse movement
	 */
	proto._onMousemoveEvent = function(e) {
		if(_previousX !== e.clientX && _previousY !== e.clientY) {
			_timeLastMovement = new Date().getTime();
			_previousX = e.clientX;
			_previousY = e.clientY;
	
			_showingArrows = true;
			var curLeft = _epgGridScroller.getScrollLeft();
			if(curLeft > 0) {
				$U.core.util.HtmlHelper.setDisplayInlineBlock(_leftArrow);
				$(_leftArrow).addClass("display");
			}
			if(curLeft < _epgGridScroller.content.offsetWidth - _scrollerContainerGrid.offsetWidth) {
				$U.core.util.HtmlHelper.setDisplayInlineBlock(_rightArrow);
				$(_rightArrow).addClass("display");
			}
		}
	};
	
	proto._onMovementInterval = function() {
		if(_showingArrows) {
			var curTime = new Date().getTime();
			if(curTime - _timeLastMovement > 1100) {
				$(_leftArrow).removeClass("display");
				$(_rightArrow).removeClass("display");
				$U.core.util.HtmlHelper.setDisplayNone(_leftArrow);
				$U.core.util.HtmlHelper.setDisplayNone(_rightArrow);
				_showingArrows = false;
			}
		}
	};
	
	/**
	 * Called from a scroller we have registered as a complete listener.  
	 * @param {Object} scroller The NagraScroller that is calling us. 
	 */
	proto.completedCallback = function(scroller) {
		if(_showingArrows) {
			var curLeft = _epgGridScroller.getScrollLeft();
	
			if(curLeft > 0) {
				$U.core.util.HtmlHelper.setDisplayInlineBlock(_leftArrow);
				$(_leftArrow).addClass("display");
			} else {
				$(_leftArrow).removeClass("display");
				$U.core.util.HtmlHelper.setDisplayNone(_leftArrow);
			}
			if(curLeft < _epgGridScroller.content.offsetWidth - _scrollerContainerGrid.offsetWidth) {
				$U.core.util.HtmlHelper.setDisplayInlineBlock(_rightArrow);
				$(_rightArrow).addClass("display");
			} else {
				$(_rightArrow).removeClass("display");
				$U.core.util.HtmlHelper.setDisplayNone(_rightArrow);
			}
		}
	};


	return EPGHorizontalScrollManager;

}());
