/**
 * The InfoCard is responsible for showing meta information of a $U.core.mediaItem.MediaItem
 * This Desktop one just adds a video control to the tablet version
 * @class $U.mediacard.DesktopInfoCard
 *
 * @constructor
 * Create a new DesktopInfoCard
 * @param {HTMLElement} - the html element which contains the info card
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.DesktopInfoCard = ( function() {

	var FIXED_HEIGHT_ELEMENTS =  228;
	var GUTTERS = 40;

	var superClass = $U.mediaCard.TabletInfoCard;
	var superSuperClass = $U.mediaCard.InfoCard;
	var proto;

	function DesktopInfoCard(parent) {
		superSuperClass.call(this, parent);
		this.fixedHeightElements = FIXED_HEIGHT_ELEMENTS;
		//controller container for the video controls
		//this._videoControlsEl = this._createDiv("mc-video-controls", this._parentEl, "videoControls");
	}


	$N.apps.util.Util.extend(DesktopInfoCard, superClass);

	proto = DesktopInfoCard.prototype;

	/**
	 * Entry to point to the info card. Calls its super class
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item used to activate the info card
	 */
	proto.activate = function(mediaItem) {
		superSuperClass.prototype.activate.call(this, mediaItem);
	};

	/**
	 * Sets the layout, called by the resize handler on populate and on resize
	 * @private
	 */
	proto._setLayout = function() {
		superClass.prototype._setLayout.call(this);
	};

	return DesktopInfoCard;

}());
