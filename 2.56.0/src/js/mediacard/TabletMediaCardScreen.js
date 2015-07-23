/**
 * TabletMediaCardScreen is a specialisation of a $U.mediaCard.MediaCardScreen
 *
 * @class $U.mediacard.TabletMediaCardScreen
 * @constructor
 * Create a new TabletMediaCardScreen
 * @param {Object} owner - $U.core.View
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.TabletMediaCardScreen = ( function() {

	var logger = $U.core.Logger.getLogger("TabletMediaCardScreen");

	// CONSTANTS
	// These variables are used to maintain the screen size on resize
	var FIXED_HEIGHT_ELEMENTS = 218;
	var MEDIA_CONTAINER_HEIGHT_RATIO = 0.7;

	var superClass = $U.mediaCard.MediaCardScreen;
	var proto;

	function TabletMediaCardScreen(owner) {
		superClass.call(this, owner);
	}

	$N.apps.util.Util.extend(TabletMediaCardScreen, superClass);
	proto = TabletMediaCardScreen.prototype;

	/**
	 * Handles resizes
	 */
	proto.resizeHandler = function() {
		if (logger) {
			logger.log("resizeHandler", "enter");
		}
		// calls the set layout method
		this._setLayout();
		// resize the info card
		$U.mediaCard.MediaCardController.resizeInfoCard();
		// resize the more like this container
		$U.mediaCard.MediaCardController.resizeMlt();
	};

	/**
	 * Maintains screen ratios on the display of the media card
	 * @private
	 */
	proto._setLayout = function() {
		var height = $U.core.View.getViewContainer().clientHeight - FIXED_HEIGHT_ELEMENTS;
		var mcH = height * MEDIA_CONTAINER_HEIGHT_RATIO;
		var mltH = height - mcH;

		$U.core.util.HtmlHelper.setHeight(this.getmediaContainerEl(), mcH);
		
		this._multiMoreLikeThis.setHeight(mltH);
		// $U.mediaCard.MediaCardController.setMltHeight(mltH);
	};

	return TabletMediaCardScreen;

}());
