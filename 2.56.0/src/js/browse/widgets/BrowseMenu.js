/**
 * @class $U.browse.widgets.BrowseMenu
 * Menu Class that implements the pop out menu on the browse screen.
 *
 * @constructor
 * Constructs a new Menu Object and appends a HTML representation to the DOM
 * @param {string} id ID of the HTML element being generated to represent the menu
 */

var $U = $U || {};
$U.browse = $U.browse || {};
$U.browse.widgets = $U.browse.widgets || {};

$U.browse.widgets.BrowseMenu = (function() {

	var DATA_ATTRIBUTE = "data-attribute";

	function BrowseMenu(id) {
		this._id = id;
		this._parent = $U.core.util.DomEl.createDiv().setClassName("browse-category-menu-scroller").asElement();
		this._data = [];
		this._menuItems = [];
		this._activeItem = document.createElement("li");
	}

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

	var proto = BrowseMenu.prototype;

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
		var goToCategory = true;
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
				goToCategory = false;
				activeEl = getActiveElement(children.children);
				if (activeEl) {
					$U.core.util.HtmlHelper.removeClass(activeEl, "active");
					goToCategory = true;
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
		return goToCategory;
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
		if (this._redrawMenu(target, node)) {
			$U.core.View.loadCategory(node.id);
		}
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
		span = $U.core.util.DomEl.createElWithText("span", data.name).attachTo(li).asElement();

		if (data.id === $U.core.Configuration.DEFAULT_CATALOGUE_UID) {
			li.className = "active";
		}
		return li;
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
		var frag = document.createDocumentFragment();
		var menuItem;
		var i;
		for (i = 0; i < data.length; i++) {
			menuItem = this._createMenuItem(data[i]);
			ul.appendChild(menuItem);
			if (data[i].children.length > 0) {
				this.createChildItem(data[i].children, menuItem);
			}
		}
		frag.appendChild(ul);
		return frag;
	};

	/**
	 * Entry point for creating the menu and populating it with data.
	 * @param {Object} data - The Menu Data
	 */
	proto.populate = function(data) {
		this._data = data;
		this._menu = this._createMenu(this._data);
		this._parent.appendChild(this._menu);

		// initially hidden until the show method is called
		this._parent.style.display = "none";

		// Hide PageLoading shown by SignOn
		$U.core.widgets.PageLoading.hide($U.core.signon.SignOn);
	};

	/**
	 * Makes the menu display in the dom by applying css classes to it
	 */
	proto.show = function() {
		var transProp;
		var browseScreenHeight;
		var that = this;
		// Get the current height of the browseScreen
		browseScreenHeight = document.getElementById("desktopBrowseScrollerContainer").clientHeight;
		// Apply the CSS transition property
		this._parent.style[$U.core.util.HtmlHelper.getTransitionProperty()] = $U.core.util.HtmlHelper.getTransitionValue("transform", "0.75s");
		// Show the menu
		$U.core.util.HtmlHelper.setDisplayBlock(this._parent);
		// Set the height of the menu to be the height of the browseScreen
		$U.core.util.HtmlHelper.setHeight(this._parent, browseScreenHeight);
		// Force layout to make sure transition is applied before performing the transform
		transProp = window.getComputedStyle(this._parent).display;
		// Set the Y property of the menu to be 0;
		this._parent.style[$U.core.util.HtmlHelper.getTransformProperty()] = $U.core.util.HtmlHelper.getTranslateYValue("0");
	};

	/**
	 * Hide the menu
	 */
	proto.hide = function() {
		var computedStyle;
		var translateYValue;
		var height;

		// Get the computed style of the Menu
		computedStyle = window.getComputedStyle(this._parent);
		// Get the current height of the browseScreen if it is zero then try and derive from the menu itself
		height = document.getElementById("desktopBrowseScrollerContainer").clientHeight || parseInt(computedStyle.height, 10);
		// Set the translate Y property
		translateYValue = parseInt(computedStyle.marginTop, 10) + height;
		// Apply the translate Y property
		this._parent.style[$U.core.util.HtmlHelper.getTransformProperty()] = $U.core.util.HtmlHelper.getTranslateYValue(-translateYValue);
	};

	/**
	 * returns the parent container for the Menu
	 * @return {HTMLElement} this._parent
	 */
	proto.getContainer = function() {
		return this._parent;
	};

	return BrowseMenu;

}());