/**
 * @class $U.browse.widgets.Menu
 * Menu Class that implements the pop out menu on the browse screen.
 *
 * @constructor
 * Constructs a new Menu Object and appends a HTML representation to the DOM
 * @param {string} id ID of the HTML element being generated to represent the menu
 */

var $U = $U || {};
$U.browse = $U.browse || {};
$U.browse.widgets = $U.browse.widgets || {};

$U.browse.widgets.Menu = (function() {

	// The menu scroller's name'
	var SCROLLER_NAME = "MenuScroller";

	var DATA_ATTRIBUTE = "data-attribute";
	// The class which applies a highlight colour
	var HIGHLIGHT = "category-menu-touch-active";
	// The amount of time to wait before applying the highlight
	var HIGHLIGHT_AFTER = 25;
	// The reference to the timeout for the highlight
	var highlightTimeout;

	function Menu(id) {
		this._id = id;
		this._parent = $U.core.util.DomEl.createDiv().setId("categoryMenuScroller").setClassName("browse-category-menu-scroller").asElement();
		this._data = [];
		this._menuItems = [];
		this._previousScrollLeft = 0;
		this._activeItem = document.createElement("li");
		this._isVisible = true;
	}


	Menu.create = function(id) {
		var result = null;
		switch ($U.core.Device.getFF()) {
			case $U.core.Device.FF.PHONE:
				result = new $U.browse.widgets.MobileMenu(id);
				break;
			case $U.core.Device.FF.TABLET:
				result = new Menu(id);
				break;
			case $U.core.Device.FF.DESKTOP:
				result = new $U.browse.widgets.BrowseMenu(id, document);
				break;
		}
		return result;
	};

	function getChildListElements(parentElement) {
		var l = parentElement.children.length;
		var i;
		for (i = 0; i < l; i++) {
			if (parentElement.children[i].nodeName === "UL") {
				return parentElement.children[i];
			}
		}
	}

	function getSiblings(element, skipItem) {
		var r = [];
		var el;
		for (el = element; el !== null; el = el.nextSibling) {
			if (el.nodeType === 1 && el !== skipItem) {
				r.push(el);
			}
		}
		return r;
	}

	/**
	 * Returns a HTML element which has a class name of "active"
	 * @param {Array} elList - A list of HTML elements
	 * @return {HTMLElement} the menu item that has an active class applied
	 */
	function getActiveElement(elList) {
		for (var i = 0; i < elList.length; i++) {
			if (elList[i].className.indexOf("active") >= 0) {
				return elList[i];
			}
		}
	}

	/**
	 * Wrapper function for jQuery's removeClass method
	 */
	function removeAllActive() {
		$(".category-menu li").removeClass("active");
	}

	/**
	 * Wrapper function for jQuery's hide method
	 */
	function hideAllChildren() {
		$(".category-menu li ul").hide();
	}

	var proto = Menu.prototype;

	/**
	 * Redraws the menu using an accordion style open & close system
	 * @param {HTMLElement} itemClicked - the menu item that was clicked on
	 * @param {Object} node - MenuData node
	 */
	proto._redrawMenu = function(itemClicked, node) {
		var activeEl;
		var item = itemClicked;
		var children = getChildListElements(item);
		var isParent = node.parentId === "-1" ? true : false;
		var siblings = getSiblings(item.parentNode.firstChild, item);
		var sibLength = siblings.length;
		var niblings = [];
		var i;

		//a menuItem item is clicked so check if it is already active
		if (item !== this._activeItem) {
			if (sibLength > 0) {
				for (i = 0; i < sibLength; i++) {
					niblings = getChildListElements(siblings[i]);
					$U.core.util.HtmlHelper.removeClass(siblings[i], "active");
					if (niblings !== undefined) {
						activeEl = getActiveElement(niblings.children);
						if (activeEl) {
							$U.core.util.HtmlHelper.removeClass(activeEl, "active");
						}
						$U.core.util.HtmlHelper.setDisplayNone(niblings);
					}
				}
			}
			// if the menu item does have children then get them and show them
			if (children !== undefined) {
				activeEl = getActiveElement(children.children);
				if (activeEl) {
					$U.core.util.HtmlHelper.removeClass(activeEl, "active");
				}
				$U.core.util.HtmlHelper.setClass(item, "active");
				$U.core.util.HtmlHelper.setDisplayBlock(children);
			} else {
				activeEl = getActiveElement(siblings);
				$U.core.util.HtmlHelper.removeClass(activeEl, "active");
				$U.core.util.HtmlHelper.setClass(item, "active");
			}
			// overwrite previous activeItem with current
			this._activeItem = item;
		}
		this.menuScroller.reflow();
	};
	/**
	 * Find the node in the MenuData Object that relates to nodeId passed in.
	 * @param {Object} nodeId
	 * @return {Object} MenuData Node found in the MenuData structure
	 */
	proto._getNodeById = function(nodeId) {
		var r = null;
		var l = this._data.length;
		var i;
		for (i = 0; i < l; i++) {
			r = this._data[i].getNode(nodeId);
			if (r) {
				break;
			}
		}
		return r;
	};

	/**
	 * @event _clickHandler
	 * Triggered after user clicks on an item within the menu
	 * @param {Object} evt - the event that was fired
	 */
	proto._clickHandler = function(evt) {
		var target = evt.currentTarget;
		var id = target.getAttribute("data-id");
		var name = target.getAttribute("data-name");
		var node = this._getNodeById(id);

		evt.stopPropagation();
		this._redrawMenu(target, node);
		$U.core.View.loadCategory(node.id, true, 0);
	};

	/**
	 * Creates DOM elements to structure the menu. Handler attached to each list item
	 * created.
	 * @param data - The Menu data
	 * @return {HTMLElement} li - The generated DOM menu item
	 * @private
	 */
	proto._createMenuItem = function(data) {
		var li;
		var span;

		li = $U.core.util.DomEl.createEl("li").setAttributes([{
			name: "data-id",
			value: data.id
		}, {
			name: "data-name",
			value: data.name
		}]).asElement();

		li.addEventListener("click", this._clickHandler.bind(this));

		// We need to apply a highlight to show that the user has touched a menu item but only for phone/tablet
		if (!$U.core.Device.isDesktop()) {
			li.addEventListener("touchstart", this._applyHighlight);
			li.addEventListener("touchmove", this._removeHighlight);
			li.addEventListener("touchend", this._removeHighlight);
		}

		span = $U.core.util.DomEl.createElWithText("span", data.name).attachTo(li).asElement();

		if (data.id === $U.core.Configuration.DEFAULT_CATALOGUE_UID) {
			li.className = "active";
		}
		return li;
	};

	/**
	 * Applies a highlight when the user taps the menu item but only after 25ms
	 * @param Object - event Object
	 * @private
	 */
	proto._applyHighlight = function(evt) {
		var that = this;
		if (this === evt.target.parentNode) {
			highlightTimeout = setTimeout(function() {
				$U.core.util.HtmlHelper.setClass(that, HIGHLIGHT);
			}, HIGHLIGHT_AFTER);
		}
	};

	/**
	 * Removes the highlight when touch ends or touch moves fires
	 * @param Object - event Object
	 * @private
	 */
	proto._removeHighlight = function(evt) {
		if (highlightTimeout) {
			clearTimeout(highlightTimeout);
		}
		$U.core.util.HtmlHelper.removeClass(this, HIGHLIGHT);
	};

	/**
	 * Creates DOM elements to structure the child items in the menu. Handler attached to each list item
	 * created.
	 * @param data - The Menu data
	 * @return {HTMLElement} li - The generated DOM menu item
	 * @private
	 */
	proto.createChildItem = function(data, parentEl) {
		var li;
		var ul;
		var i;

		ul = $U.core.util.DomEl.createEl("ul").attachTo(parentEl).asElement();

		for (i = 0; i < data.length; i++) {
			li = this._createMenuItem(data[i]);
			ul.appendChild(li);
			if (data[i].children.length > 0) {
				this.createChildItem(data[i].children, li);
			}
		}
	};

	/**
	 * Kicks off the creation of the menu
	 * created.
	 * @param data - The Menu data
	 * @return {HTMLElement} frag - The generated Document Fragment
	 * @private
	 */
	proto._createMenu = function(data) {
		var ul = $U.core.util.DomEl.createEl("ul").setId(this._id).setClassName("category-menu").asElement();
		var menuItem;
		var i;
		for (i = 0; i < data.length; i++) {
			menuItem = this._createMenuItem(data[i]);
			ul.appendChild(menuItem);
			if (data[i].children.length > 0) {
				this.createChildItem(data[i].children, menuItem);
			}
		}
		return ul;
	};

	/**
	 * Entry point for creating the menu and populating it with data.
	 * Makes the Menu a Nagra Scroller
	 * @param {Object} data - The Menu Data
	 */
	proto.populate = function(data) {
		this._data = data;
		this._menu = this._createMenu(this._data);
		this._parent.appendChild(this._menu);

		/* Make the menu scrollable */

		this.menuScroller = new $U.core.widgets.scroller.NagraScroller(this._menu, {
			scrollingX: false,
			scrollingY: true,
			zooming: false,
			minZoom: 1,
			maxZoom: 1,
			measureContent: true,
			bouncing: true,
			paging: false
		}, SCROLLER_NAME);

		// Hide PageLoading shown by SignOn
		$U.core.widgets.PageLoading.hide($U.core.signon.SignOn);
	};

	/**
	 * Handle a callback from a Scroller we're listening to.
	 * For the Tablet Menu this will be the BrowseScroller
	 *
	 * @param {Object} scroller Scroller object to target
	 * @param {Number} left Pixels left to position scroller
	 * @param {Number} maxleft maximum left to scroller scroller
	 */
	proto.scrollerCallback = function(scroller, left, maxLeft /*, top, maxTop*/ ) {
		var dLeft = Math.abs(this._previousScrollLeft - left);

		if ((dLeft > 5) && (left !== 0)) {
			this.hide();
		}

		if (this.showMenuTimeout) {
			clearTimeout(this.showMenuTimeout);
		}

		if (dLeft < 1 || left === maxLeft || left === 0) {
			var that = this;
			var showMenuTimeout = function() {
				that.show();
			};
			this.showMenuTimeout = setTimeout(showMenuTimeout, 750);
		}

		this._previousScrollLeft = left;
	};

	/**
	 * Makes the menu display in the dom by applying css classes to it
	 */
	proto.show = function() {
		$(this._parent).removeClass("transition-out");
		$(this._parent).addClass("transition-in");
		this._isVisible = true;
	};

	/**
	 * Hide the menu
	 */
	proto.hide = function() {
		$(this._parent).removeClass("transition-in");
		$(this._parent).addClass("transition-out");
		this._isVisible = false;
	};

	/**
	 * returns the parent container for the Menu
	 * @return {HTMLElement} this._parent
	 */
	proto.getContainer = function() {
		return this._parent;
	};

	proto.setHeight = function(h) {
		this._parent.style.height = h + 'px';
	};

	proto.isVisible = function() {
		return this._isVisible;
	};

	/**
	 * Scrolls the currently active category into view
	 */
	proto.scrollToActive = function() {
		if (this._isVisible) {
			if (this.menuScroller) {
				var activeNode = this._parent.getElementsByClassName("active");
				this.menuScroller.scrollToElement(activeNode[activeNode.length - 1], true);
			}
		}
	};

	return Menu;

}());