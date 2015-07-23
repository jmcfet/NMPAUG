var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

/**
 * Manages the events for adding highlights to particular elements
 * @class $U.core.util.Highlighter
 */
$U.core.util.Highlighter = ( function() {

	var TOUCH_EVENTS = {
		TOUCH_START : "touchstart",
		TOUCH_END : "touchend",
		TOUCH_MOVE : "touchmove"
	};

	var logger = $U.core.Logger.getLogger("$U.core.util.Highlighter");

	var applyTouchHighlight = function(htmlElement, cssStyle) {

		var timeoutId;
		var element = htmlElement;
		var style = cssStyle;

		htmlElement.addEventListener(TOUCH_EVENTS.TOUCH_START, function(evt) {
			var isCurrTarget = false;
			var target = evt.target;

			while(target && !isCurrTarget) {
				if(target === evt.currentTarget){
					isCurrTarget = true;
				} else {
					target = target.parentNode;
				}
			}

			if (isCurrTarget) {
				timeoutId = setTimeout(function() {
					$U.core.util.HtmlHelper.setClass(element, cssStyle);
				}, 25);
			} else {
				return false;
			}
		});

		window.addEventListener(TOUCH_EVENTS.TOUCH_MOVE, function(evt) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = undefined;
			}
			$U.core.util.HtmlHelper.removeClass(element, cssStyle);
		});

		window.addEventListener(TOUCH_EVENTS.TOUCH_END, function(evt) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = undefined;
			}
			$U.core.util.HtmlHelper.removeClass(element, cssStyle);
		});
	};

	return {
		applyTouchHighlight : applyTouchHighlight
	};

}());
