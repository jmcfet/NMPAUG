var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

$U.core.util.DomEl = ( function() {

	var TAG_DIV = "div";

	/**
	 * @class $U.core.util.DomEl
	 * Construct a DomEl
	 * @constructor
	 * @param {Object} tagName
	 * @param {Object} id
	 */
	function DomEl(tagName, id) {
		this._el = document.createElement(tagName);
		if (id) {
			this.setId(id);
		}
	}

	/**
	 * Create a div DomEl
	 */
	DomEl.createDiv = function() {
		return new DomEl(TAG_DIV);
	};

	/**
	 * Create an element
	 * @param {String} tagName the tag to use e.g. h1, p	*
	 */
	DomEl.createEl = function(tagName) {
		var el = new DomEl(tagName);
		return el;
	};

	/**
	 * Create an element with a single text node
	 * @param {String} tagName the tag to use e.g. h1, p
	 * @param {String} text
	 */
	DomEl.createElWithText = function(tagName, text) {
		var el = new DomEl(tagName);
		el.appendChild(document.createTextNode(text));
		return el;
	};

	/**
	 * Create an element with inner html
	 * @param {String} tagName the tag to use e.g. h1, p
	 * @param {String} html
	 */
	DomEl.createElWithHTML = function(tagName, html) {
		var el = new DomEl(tagName);
		return el.setInnerHTML(html);
	};

	/**
	 * Create an anchor element, either with text or image
	 * @param {String} url the URL to link to
	 * @param {String} text the text to show on the link (or alt-text if image)
	 * @param {String} img optional image src to show
	 */
	DomEl.createLink = function(url, text, img) {
		var el = new DomEl("a");
		var imgEl;
		var openUrl = function() {
			if ($U.core.Device.isDesktop()) {
				window.open(url);
			} else {
				window.userAgent.openUrl(url);
			}
		};
		if (img) {
			imgEl = document.createElement("img");
			imgEl.src = img;
			if (text) {
				imgEl.alt = text;
				imgEl.title = text;
			}
			el.appendChild(imgEl);
		} else {
			el.appendChild(document.createTextNode(text));
		}
		el.asElement().addEventListener("click", openUrl, false);
		return el;
	};

	var proto = DomEl.prototype;

	proto.__isDomEl = true;

	proto.asElement = function() {
		return this._el;
	};

	proto.setId = function(id) {
		this._el.id = id;
		return this;
	};

	proto.setAttribute = function(name, value) {
		this._el.setAttribute(name, value);
		return this;
	};

	proto.setAttributes = function(attributes) {
		var l = attributes.length;
		var i, a;
		for ( i = 0; i < l; i++) {
			a = attributes[i];
			this.setAttribute(a.name, a.value);
		}
		return this;
	};

	proto.setClassName = function(className) {
		this._el.className = className;
		return this;
	};

	proto.setInnerHTML = function(innerHTML) {
		this._el.innerHTML = innerHTML;
		return this;
	};

	proto.attachTo = function(el) {
		el.appendChild(this._el);
		return this;
	};

	proto.prependTo = function(el) {
		el.insertBefore(this._el, el.firstChild);
		return this;
	};

	proto.appendChild = function(el) {
		this._el.appendChild(el.__isDomEl ? el._el : el);
	};

	return DomEl;

}());
