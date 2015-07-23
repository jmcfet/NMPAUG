/**
 * @class $U.epg.widgets.NowBar
 * Class that represents the Now bar in an EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Object} owner Owner object (most likely its caller)
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.NowBar = ( function() {
	
	
	function NowBar(container) {
		this._container = container;
		this._currentLocation = 0;
		this._attached = false;
	}
	
	var proto = NowBar.prototype;

	/**
	 * Attach the NowBar to the EPG
	 */
	proto.attach = function() {
		$U.core.util.HtmlHelper.setVisibilityInherit(this._container);
		this._attached = true;
	};

	/**
	 *   Detach the NowBar from the EPG
	 */
	proto.hide = function() {
		$U.core.util.HtmlHelper.setVisibilityHidden(this._container);
		this._attached = false;
		this.currentLocation = 0;
		this.update(0);
	};

	/**
	 * Move the NowBar across the EPG
	 * @param {Number} pixelsToMove Number of pixels to move the nowbar across the EPG
	 */
	proto.update = function(pixelsToMove) {
		this._container.style.left = pixelsToMove + 'px';
		this._currentLocation = pixelsToMove;
	};

	/** Return the location (in pixels) of the Nowbar
	 *@return {Number} Number of pixels the nowbar is currently across from the left of the EPG
	 */
	proto.getLocation = function() {
		return this._currentLocation;
	};
		
	proto.setHeight = function(height) {
		$U.core.util.HtmlHelper.setHeight(this._container, height);
	};	

	return NowBar;
}());
