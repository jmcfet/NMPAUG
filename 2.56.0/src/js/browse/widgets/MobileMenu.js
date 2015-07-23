/**
 * Menu Class that implements the pop out category menu on the browse screen for mobile devices.
 * @class $U.browse.widgets.MobileMenu
 * @extends $U.browse.widgets.Menu
 *
 * @constructor
 * Constructs a new Menu Object and appends a HTML representation to the DOM
 *
 * @param {string} id ID of the HTML element being generated to represent the menu
 */

var $U = $U || {};
$U.browse = $U.browse || {};
$U.browse.widgets = $U.browse.widgets || {};

$U.browse.widgets.MobileMenu = ( function() {

	var DATA_ATTRIBUTE = "data-attribute";
	var superClass = $U.browse.widgets.Menu;
	var proto;

	var MobileMenu = function(id) {
		// Call the parent constructor as MobileMenu is a child of Menu
		superClass.call(this, id);
		this._isVisible = false;
	};

	// Extend Abstract class Menu
	$N.apps.util.Util.extend(MobileMenu, $U.browse.widgets.Menu);
	proto = MobileMenu.prototype;

	function getTransformProperty() {
		return $U.core.Device.getVendorPrefix().js + "Transform";
	}

	function getTransitionProperty() {
		return $U.core.Device.getVendorPrefix().js + "Transition";
	}

	function getTranslateXValue(Xvalue) {
		return "translateX" + "(" + Xvalue + "px)";
	}

	function getTransformValue() {
		return $U.core.Device.getVendorPrefix().css + "transform 0.2s linear";
	}

	/**
	 * Overrides the _clickHandler in Menu.js but calls its parent method also
	 * Triggered after user clicks on an item within the menu
	 * @param {Object} evt - the event that was fired
	 */
	proto._clickHandler = function(evt) {
		superClass.prototype._clickHandler.call(this, evt);
		//moved the closing of the menu into the View.showCategoryMobile so cannot see the existing category before it closes (MSUI-981)
		//$U.core.Options.goBack(true);
	};

	/**
	 * Flipflop function, either showing or hiding the menu depending on its current state
	 * @deprecated
	 */
	proto.showHide = function() {
		if (this._isVisible) {
			this.hide();
		} else {
			this.show();
		}
	};

	/**
	 * Makes the menu display in the dom by applying css classes to it
	 */
	proto.show = function() {
		var transProp;
		// Hide the category menu to begin with
		$U.core.util.HtmlHelper.setDisplayNone(this._parent);
		// Append the menu to the view
		$U.core.View.getViewContainer().appendChild(this._parent);
		// Set the category menu to be out of view
		this._parent.style[getTransformProperty()] = getTranslateXValue(window.innerWidth);
		// Apply the CSS transition property
		this._parent.style[getTransitionProperty()] = getTransformValue();

		// Now that we have set the menu out of view using translateX set it back to display block
		// so that it is ready for a transition back in
		$U.core.util.HtmlHelper.setDisplayBlock(this._parent);
		// Force a layout so to make sure the transition property has been applied
		transProp = window.getComputedStyle(this._parent)[getTransitionProperty()];
		// As the category menu is still out of view move it into view.
		this._parent.style[getTransformProperty()] = getTranslateXValue(0);

		this._isVisible = true;
		this.menuScroller.reflow();
	};

	/**
	 * Hide the menu
	 */
	proto.hide = function() {
		var that = this;
		// Set the Mobile Menu back out of the view
		this._parent.style[getTransformProperty()] = getTranslateXValue(window.innerWidth);
		// Use the setTimeout method to destroy the Mobile menu after it has been moved out of view
		// better to use the timeout method than a transitionEnd listener as not 100% cross browser reliable
		// the transition takes aprox 200ms
		setTimeout(function() {
			if(that._isVisible){
				that._parent.parentNode.removeChild(that._parent);
				that._isVisible = false;
			}
		}, 200);
	};

	/**
	 * Overrides its parent method
	 * removes all active classes before adding the active class to the item clicked.
	 * @param {HTMLElement} item - the item clicked
	 */
	proto._redrawMenu = function(item) {
		$(".category-menu li").removeClass("active");
		$U.core.util.HtmlHelper.setClass(item, "active");
	};

	/**
	 * Dummy function that returns null,
	 * is empty so that it doesn't popout automagically like the default menu
	 *
	 * @param {Object} scroller Scroller object to target
	 * @param {number} left Pixels left to position scroller
	 * @param {number} maxleft maximum left to scroller scroller
	 */
	proto.scrollerCallback = function(scroller, left, maxLeft /*, top, maxTop*/) {
		return;
	};

	return MobileMenu;
}());
