/**
 * PhoneMediaCardScreen is a specialisation of a $U.mediaCard.MediaCardScreen
 *
 * @class $U.mediacard.PhoneMediaCardScreen
 * @constructor
 * Create a new PhoneMediaCardScreen
 * @param {Object} owner - $U.core.View
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.PhoneMediaCardScreen = ( function() {

	var logger = $U.core.Logger.getLogger("PhoneMediaCardScreen");

	// The scroller's name'
	var SCROLLER_NAME = "PhoneMediaCardScreen";

	var superClass = $U.mediaCard.MediaCardScreen;

	var proto;

	function PhoneMediaCardScreen(owner) {
		superClass.call(this, owner);

		this._scrollerContainerEl = superClass._createDiv("mediaCardScrollerContainer", "mc-screen-scroller-container", this._screenContainerEl);
		this._scrollerEl = superClass._createDiv("mediaCardScroller", "", this._scrollerContainerEl);
		this._sideBarEl = superClass._createDiv("mediaCardSideBar", "mc-sidebar", this._screenContainerEl);
		this._verticalIndicatorContainerEl = superClass._createDiv("mediaCardScrollIndicatorContainer", "scroller-vertical-indicator-container", this._sideBarEl);
		this._verticalIndicatorEl = superClass._createDiv("mediaCardScrollIndicator", "scroller-vertical-indicator", this._verticalIndicatorContainerEl);

		this._scrollerEl.appendChild(this._mediaContainerEl);

		this._mediaContainerEl.insertBefore(this._actionBarScrollerEl, $U.mediaCard.MediaCardController.getMetaInfoContainerEl());
		this._scrollerEl.appendChild(this._moreLikeThisContainerEl);

		this._scroller = new $U.core.widgets.scroller.NagraScroller(this._scrollerEl, {
			scrollingX : false,
			scrollingY : true,
			indicatorY : {
				active : true,
				indicatorContainerElement : this._verticalIndicatorContainerEl,
				indicatorElement : this._verticalIndicatorEl
			},
			zooming : false,
			minZoom : 1,
			maxZoom : 1,
			measureContent : true,
			bouncing : false,
			paging : false
		});
	}

	$N.apps.util.Util.extend(PhoneMediaCardScreen, superClass);
	proto = PhoneMediaCardScreen.prototype;

	/**
	 * Activates the mediacard screen
	 */
	proto.activate = function() {
		superClass.prototype.activate.call(this);
		//  PR89863/MSUI-1094 Set the scroller back to the start on activation
		this._scroller.reset();
	};

	/**
	 * Handles resizes
	 */
	proto.resizeHandler = function() {
		if (logger) {
			logger.log("resizeHandler", "enter");
		}
		$U.mediaCard.MediaCardController.resizeInfoCard();
		// $U.mediaCard.MediaCardController.resizeMlt();

		this._multiMoreLikeThis.reflow();
		this._scroller.reflow();
		// PR89863/MSUI-1094 - This has been removed and pushed up into the activate method as it was reseting
		// after every resize/orientation change
		// this._scroller.reset();
		this._scroller.activateScrollIndicators(false, true);
	};

	return PhoneMediaCardScreen;

}());
