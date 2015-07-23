/**
 * @class $U.epg.widgets.EPGScrollerWidget
 * Class that represents an EPG widget with a scroller
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this widget
 */

var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.EPGScrollerWidget = ( function() {

	function EPGScrollerWidget(container, scrollerName, scrollX, scrollY, measureContent, notifyEdge) {
		// Default to true
		if (measureContent === undefined) {
			measureContent = true;
		}
		this._container = container;
		this._scroller = new $U.core.widgets.scroller.NagraScroller(container, {
			scrollingX : scrollX,
			scrollingY : scrollY,
			zooming : false,
			minZoom : 1,
			maxZoom : 1,
			measureContent : measureContent,
			bouncing : false,
			paging : false,
			notifyEdge : notifyEdge
		}, scrollerName);

	}

	var proto = EPGScrollerWidget.prototype;

	Object.defineProperties(proto, {

		/**
		 * @property {Number} width the widget's width
		 * @readonly
		 */
		"width" : {
			get : function() {
				return this._container.clientWidth;
			}
		},

		/**
		 * @property {Number} height the widget's height
		 * @readonly
		 */
		"height" : {
			get : function() {
				return this._container.clientHeight;
			}
		},

		/**
		 * @property {Number} scrollLeft this widget's scroll left
		 * @readonly
		 */
		"scrollLeft" : {
			get : function() {
				return this._scroller.getScrollLeft();
			}
		},

		/**
		 * @property {Number} scrollTop this widget's scroll top
		 * @readonly
		 */
		"scrollTop" : {
			get : function() {
				return this._scroller.getScrollTop();
			}
		}
	});

	proto.addLinked = function(linked, axis) {
		this._scroller.addLinked(linked._scroller, axis);
	};

	proto.reflow = function() {
		this._scroller.reflow();
	};

	proto.scrollTo = function(left, top, animate) {
		this._scroller.scrollTo(left, top, animate);
	};

	proto.setWidth = function(width) {
		$U.core.util.HtmlHelper.setWidth(this._container, width);
	};

	proto.setHeight = function(height) {
		$U.core.util.HtmlHelper.setHeight(this._container, height);
	};

	proto.addHeight = function(height) {
		$U.core.util.HtmlHelper.setHeight(this._container, this._container.offsetHeight + height);
	};

	return EPGScrollerWidget;
}());

