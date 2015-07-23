var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.BreadCrumb = ( function() {

	var logger = $U.getLogger("BreadCrumb");
	var EMPTY_INDICATOR = {};

	/**
	 * Object representing a Bread Crumb to ease navigation
	 * @class $U.core.widgets.BreadCrumb
	 * @param {HTMLElement} container where the breadcrumb is going to be created
	 * @param {function} Callback function when user presses a navigation object
	 */
	var BreadCrumb = function(container, callback) {
		this._container = container;

		this._navigation = [];
		this._values = [];

		this._callback = callback;
	};

	var proto = BreadCrumb.prototype;

	/**
	 * Clears the bread crumb DOM elements
	 */
	proto.clearDOM = function() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}
	};

	/*
	 * Add a navigation item to the breadcrumb
	 * @param {String} navigation item's name
	 * @param {Object} Custom callback value for this item. If none provided, navigation item's name will be used
	 */
	proto.add = function(navigationItem, navigationValue) {
		this._navigation.push(navigationItem);
		this._values.push(navigationValue !== undefined ? navigationValue : navigationItem);

		this.redraw();
	};

	/*
	 * Removes the last navigation item of the breadcrumb
	 */
	proto.pop = function() {
		var size = this._navigation.length;
		if (size !== 0) {
			this._navigation.pop();
			this._values.pop();

			this.redraw();
		}
	};

	/*
	 * Clean and redraw the breadcrumb using navigation items
	 */
	proto.redraw = function() {
		var i;

		// Clear DOM before redrawing

		this.clearDOM();

		for ( i = 0; i < this._navigation.length; ++i) {
			if (i !== 0) {
				// If not the first element, add a separator

				var separator = document.createElement('div');
				separator.className = 'breadcrumb-separator';
				separator.innerHTML = '>';

				this._container.appendChild(separator);
			}

			var element = document.createElement('div');

			element.innerHTML = this._navigation[i];

			if (i === this._navigation.length - 1){
				element.className = 'breadcrumb-last-item';
			} else {
				var self = this;
				element.className = 'breadcrumb-item';
				element.type = this._values[i];
				this.createClickEventListener(element);
			}

			this._container.appendChild(element);
		}
	};
	
	proto.createClickEventListener = function(element) {
		var self = this;
		element.addEventListener("click", function(e) {
			self._callback(this.type);
		});
	}; 

	return BreadCrumb;
}());
