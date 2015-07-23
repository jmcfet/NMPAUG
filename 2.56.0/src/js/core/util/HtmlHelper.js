var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

/**
 * Manages HTML interactions in the application
 * @class $U.core.util.HtmlHelper
 */
$U.core.util.HtmlHelper = ( function() {

	var DISPLAY = {
		NONE : {
			value : "none"
		},
		BLOCK : {
			value : "block"
		},
		INLINE_BLOCK : {
			value : "inline-block"
		}
	};

	var VISIBILITY = {
		VISIBLE : {
			value : "visible"
		},
		HIDDEN : {
			value : "hidden"
		},
		INHERIT : {
			value : "inherit"
		}
	};

	var UNIT_TYPE = {
		/** Unit: pixels */
		PX : {
			value : "px"
		},
		/** Unit: centimetres */
		CM : {
			value : "cm"
		},
		/** Unit: percent */
		PC : {
			value : "%"
		}
	};

	var BORDER_RADIUS = {
		TOP : "0.3em 0.3em 0em 0em",
		BOTTOM : "0em 0em 0.3em 0.3em",
		FULL : "0.3em 0.3em 0.3em 0.3em"
	};

	/**
	 * Sets the element display type
	 * @param {HTMLElement} element
	 * @param {Object} displayType
	 */
	var setDisplay = function(element, display) {
		element.style.display = display.value;
	};

	var setDisplayNone = function(element) {
		element.style.display = DISPLAY.NONE.value;
	};

	var setDisplayBlock = function(element) {
		element.style.display = DISPLAY.BLOCK.value;
	};

	var setDisplayInlineBlock = function(element) {
		element.style.display = DISPLAY.INLINE_BLOCK.value;
	};

	/**
	 * Sets the element visibility
	 * @param {HTMLElement} element
	 * @param {Object} visibilityType
	 */
	var setVisibility = function(element, visibility) {
		element.style.visibility = visibility.value;
	};

	var setVisibilityVisible = function(element) {
		element.style.visibility = VISIBILITY.VISIBLE.value;
	};

	var setVisibilityHidden = function(element) {
		element.style.visibility = VISIBILITY.HIDDEN.value;
	};

	var setVisibilityInherit = function(element) {
		element.style.visibility = VISIBILITY.INHERIT.value;
	};

	/**
	 * Empties the given element
	 * @param {HTMLElement} element
	 */
	var emptyEl = function(element) {
		$(element).empty();
	};

	/**
	 * Sets a given element's class name
	 * @param {HTMLElement} element
	 * @param {String} className css class to apply
	 */
	var setClass = function(element, className) {
		$(element).addClass(className);
	};

	/**
	 * Removes a given element's class name
	 * @param {HTMLElement} element
	 * @param {String} className css class to remove
	 */
	var removeClass = function(element, className) {
		$(element).removeClass(className);
	};

	/**
	 * Sets the value of the left style element in the given unit
	 * @param {HTMLElement} element the element to work on
	 * @param {number} settingValue the value to set the element style to
	 * @param {Object} [units] Unit of the value (see ENUM in this class for values - defaults to px if not supplied)
	 */
	var setLeft = function(element, settingValue, units) {
		var sUnits = units || UNIT_TYPE.PX;
		element.style.left = settingValue + sUnits.value;
	};

	/**
	 * Sets the value of the right style element in the given unit
	 * @param {HTMLElement} element the element to work on
	 * @param {number} settingValue the value to set the element style to
	 * @param {Object} [units] Unit of the value (see ENUM in this class for values - defaults to px if not supplied)
	 */
	var setRight = function(element, settingValue, units) {
		var sUnits = units || UNIT_TYPE.PX;
		element.style.right = settingValue + sUnits.value;
	};

	/**
	 * Sets the value of the width style element in the given unit
	 * @param {HTMLElement} element the element to work on
	 * @param {number} settingValue the value to set the element style to
	 * @param {Object} [units] Unit of the value (see ENUM in this class for values - defaults to px if not supplied)
	 */
	var setWidth = function(element, settingValue, units) {
		var sUnits = units || UNIT_TYPE.PX;
		element.style.width = settingValue + sUnits.value;
	};

	/**
	 * Sets the value of the height style element in the given unit
	 * @param {HTMLElement} element the element to work on
	 * @param {number} settingValue the value to set the element style to
	 * @param {Object} [units] Unit of the value (see ENUM in this class for values - defaults to px if not supplied)
	 */
	var setHeight = function(element, settingValue, units) {
		var sUnits = units || UNIT_TYPE.PX;
		element.style.height = settingValue + sUnits.value;
	};

	/**
	 * Sets the value of the top style element in the given unit
	 * @param {HTMLElement} element the element to work on
	 * @param {number} settingValue the value to set the element style to
	 * @param {Object} [units] Unit of the value (see ENUM in this class for values - defaults to px if not supplied)
	 */
	var setTop = function(element, settingValue, units) {
		var sUnits = units || UNIT_TYPE.PX;
		element.style.top = settingValue + sUnits.value;
	};

	/**
	 * Sets the value of the bottom style element in the given unit
	 * @param {HTMLElement} element the element to work on
	 * @param {number} settingValue the value to set the element style to
	 * @param {Object} [units] Unit of the value (see ENUM in this class for values - defaults to px if not supplied)
	 */
	var setBottom = function(element, settingValue, units) {
		var sUnits = units || UNIT_TYPE.PX;
		element.style.bottom = settingValue + sUnits.value;
	};

	var setBorderRadiusTop = function(element) {
		element.style.WebkitBorderRadius = BORDER_RADIUS.TOP;
		element.style.MozBorderRadius = BORDER_RADIUS.TOP;
		element.style.borderRadius = BORDER_RADIUS.TOP;
	};

	var setBorderRadiusBottom = function(element) {
		element.style.WebkitBorderRadius = BORDER_RADIUS.BOTTOM;
		element.style.MozBorderRadius = BORDER_RADIUS.BOTTOM;
		element.style.borderRadius = BORDER_RADIUS.BOTTOM;
	};

	var setBorderRadiusFull = function(element) {
		element.style.WebkitBorderRadius = BORDER_RADIUS.FULL;
		element.style.MozBorderRadius = BORDER_RADIUS.FULL;
		element.style.borderRadius = BORDER_RADIUS.FULL;
	};

	/**
	 * Takes a given element and calculates where to set its top and left to centre it within its parent element.
	 * @param {HTMLElement} element The element to centre
	 */
	var centreElementInParent = function(element) {
		var parentWidth = element.parentElement.offsetWidth;
		var parentHeight = element.parentElement.offsetHeight;
		var elementWidth = element.offsetWidth;
		var elementHeight = element.offsetHeight;

		setTop(element, ((parentHeight / 2) - (elementHeight / 2)));
		setLeft(element, ((parentWidth / 2) - (elementWidth / 2)));
	};

	/**
	 *
	 */
	function getTransformProperty() {
		return $U.core.Device.getVendorPrefix().dom + "Transform";
	}

	/**
	 *
	 */
	function getTransitionProperty() {
		return $U.core.Device.getVendorPrefix().dom + "Transition";
	}

	/**
	 *
	 * @param {Object} Xvalue
	 */
	function getTranslateXValue(Xvalue) {
		return "translateX" + "(" + Xvalue + "px)";
	}

	/**
	 *
	 * @param {Object} Yvalue
	 */
	function getTranslateYValue(Yvalue) {
		return "translateY" + "(" + Yvalue + "px)";
	}

	/**
	 *
	 * @param {Object} transformSpeed
	 */
	function getTransitionValue(transition, transformSpeed) {
		return $U.core.Device.getVendorPrefix().css + transition + " " + transformSpeed + " " + "linear";
	}

	return {
		setDisplay : setDisplay,
		setDisplayNone : setDisplayNone,
		setDisplayBlock : setDisplayBlock,
		setDisplayInlineBlock : setDisplayInlineBlock,
		setVisibility : setVisibility,
		setVisibilityVisible : setVisibilityVisible,
		setVisibilityHidden : setVisibilityHidden,
		setVisibilityInherit : setVisibilityInherit,
		emptyEl : emptyEl,
		setLeft : setLeft,
		setRight : setRight,
		setWidth : setWidth,
		setHeight : setHeight,
		setTop : setTop,
		setBottom : setBottom,
		setClass : setClass,
		removeClass : removeClass,
		setBorderRadiusTop : setBorderRadiusTop,
		setBorderRadiusBottom : setBorderRadiusBottom,
		setBorderRadiusFull : setBorderRadiusFull,
		centreElementInParent : centreElementInParent,
		getTransformProperty : getTransformProperty,
		getTransitionProperty : getTransitionProperty,
		getTranslateXValue : getTranslateXValue,
		getTranslateYValue : getTranslateYValue,
		getTransitionValue : getTransitionValue,
		VISIBILITY : VISIBILITY,
		DISPLAY : DISPLAY,
		UNIT_TYPE : UNIT_TYPE
	};

}());
