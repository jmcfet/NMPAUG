var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.EPGRows = ( function() {
	
	var _isVisible = true;
	var _container;
	var _index;

	/**
	 * Object representing an EPG Row in Channels screen
	 * @class $U.core.widgets.EPGRows
	 * @param {Object} a single row DOM
	 */
	var EPGRows = function(container, index) {
		this._container = container;
		this._index = index;
		
		this.calculateSizes();
	};

	var proto = EPGRows.prototype;

	///Methods needed to represent a VirtualizingNagraScroller item.
	
	proto.getContainer = function() {
//		return this._container.parentNode;
		return this._container;
	};
	
	proto.hide = function() {
		$(this._container).addClass("hide");
		_isVisible = false;
	};
	
	proto.show = function() {
		$(this._container).removeClass("hide");
		_isVisible = true;
	};
	
	proto.isShown = function() {
		return _isVisible;
	};
	
	proto.getWidth = function() {
		return this._itemWidth;
	};
	
	proto.getHeight = function() {
		return this._itemHeight;
	};
	
	proto.getLeft = function() {
		return this._itemLeft;
	};
	
	proto.getTop = function() {
		return this._itemTop;
	};
	
	proto.setLeft = function(left) {
		this._itemLeft = left;
	};
	
	proto.setTop = function(top) {
		this._itemTop = top;
	};
	
	proto.calculateSizes = function() {
		this._itemWidth = this._container.offsetWidth;
		this._itemHeight = $U.epg.EPGScreen.getPixelsPerChannel();
		this._itemTop = $U.epg.EPGScreen.getPixelsPerChannel() * (this._index + 1);
	};
	
	return EPGRows;

}());
