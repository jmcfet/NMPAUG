/**
 * The InfoCard is responsible for showing meta information of a $U.core.mediaItem.MediaItem
 *
 * @class $U.mediacard.TabletInfoCard
 *
 * @constructor
 * Create a new TabletInfoCard
 * @param {HTMLElement} - the html element which contains the info card
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.TabletInfoCard = ( function() {

	// The info scroller name
	var SCROLLER_NAME = "InfoScroller";

	var MINIMUM_INFOCARD_WIDTH = 300;
	var FIXED_HEIGHT_ELEMENTS = 218;
	var MEDIA_CONTAINER_HEIGHT_RATIO = 0.7;

	var GUTTERS = 40;

	var superClass = $U.mediaCard.InfoCard;
	var proto;

	function TabletInfoCard(parent) {
		superClass.call(this, parent);
		this.fixedHeightElements = FIXED_HEIGHT_ELEMENTS;

		this._verticalIndicatorContainer = this._createDiv("scroller-vertical-indicator-container", this._metaInfoScrollContainer, "");
		this._verticalIndicator = this._createDiv("scroller-vertical-indicator", this._verticalIndicatorContainer, "");

	}


	$N.apps.util.Util.extend(TabletInfoCard, superClass);

	proto = TabletInfoCard.prototype;

	/** Populates the Info card and calls it's super class
	 * @private
	 */
	proto._populate = function() {
		this.setAvailableLayout(false, false);
		superClass.prototype._populate.call(this);
	};

	/**
	 * Sets the layout after a purchase has taken place and calls layout. Also calls its super class because
	 * we need to set the expiration date on tablet and on phone.
	 * @param {Boolean} useTransition
	 */
	proto.setAvailableLayout = function(useTransition, fromPurchase) {
		// Assume that we want a transition unless false parameter passed in explicitly stating it is not
		var transtion = (useTransition === undefined) ? true : useTransition;
		// Assume that we are from purchase unless false parameter passed in explicitly stating it is not
		var purchase = (fromPurchase === undefined) ? true : fromPurchase;

		superClass.prototype.setAvailableLayout.call(this);
		// Apply the transition events for the media image
		/*
		if (transtion) {
			$U.mediaCard.MediaCardTransitions.afterPurchaseTransition();
		}
		*/
		// Change the aspect ratio of the image so that the layout can update
		this.setImgAspectRatio($U.mediaCard.InfoCard.LANDSCAPE);

		if (purchase) {
			// We already have all the logic to determine which buttons should be shown so call reactivatePlayer
			$U.mediaCard.MediaCardController.reactivatePlayer();
		}
		this._setLayout();
	};

	/**
	 * Entry to point to the info card. Calls its super class
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item used to activate the info card
	 */
	proto.activate = function(mediaItem) {
		var scrollerOptions;

		superClass.prototype.activate.call(this, mediaItem);

		// Destory the info scroller if it already exists before creating a new one
		if (this._infoScroller) {
			this._infoScroller.destroy();
		}

		// Configuration object for Nagra Scroller
		scrollerOptions = {
			scrollingX : false,
			scrollingY : true,
			zooming : false,
			minZoom : 1,
			maxZoom : 1,
			measureContent : true,
			bouncing : false,
			paging : false,
			indicatorY : {
				active : true,
				indicatorContainerElement : this._verticalIndicatorContainer,
				indicatorElement : this._verticalIndicator
			}
		};
		// Create a new scroller for the meta information
		this._infoScroller = new $U.core.widgets.scroller.NagraScroller(this._metaInfoContainer, scrollerOptions, SCROLLER_NAME);
	};

	/**
	 * Sets the layout, called by the resize handler on populate and on resize
	 * @private
	 */
	proto._setLayout = function() {

		var height = $U.core.View.getViewContainer().clientHeight - this.fixedHeightElements;
		var mediaH = height * MEDIA_CONTAINER_HEIGHT_RATIO - GUTTERS;
		var width = Math.round(mediaH * this._imgAspectRatio);
		var imgVidW = $U.core.View.getViewContainer().clientWidth - GUTTERS - MINIMUM_INFOCARD_WIDTH;
		var cardL = width;

		var img = this.getCardImgEl();
		var metaInfoContainer = this.getMetaInfoContainerEl();
		var aspectR = this._imgAspectRatio;

		if (width > imgVidW) {
			width = imgVidW;
			this._setHeight(this._blurImageContainer, (width / aspectR));
			this._setHeight(this._imgContainer, (width / aspectR));
			this._setHeight($U.mediaCard.MediaCardController.getPlayerContainerEl(), (width / aspectR));
			$U.core.Player.player.height = (width / aspectR);
		} else {
			this._setHeight(this._blurImageContainer, mediaH);
			this._setHeight(this._imgContainer, mediaH);
			this._setHeight($U.mediaCard.MediaCardController.getPlayerContainerEl(), mediaH);
			$U.core.Player.player.height = mediaH;
		}

		this._setWidth($U.mediaCard.MediaCardController.getPlayerContainerEl(), width);
		this._setWidth(this._imgContainer, width);
		this._setWidth(this._blurImageContainer, width);

		$U.core.Player.player.width = width;

		cardL = width + GUTTERS;

		$U.core.util.HtmlHelper.setLeft(metaInfoContainer, cardL);
		this._setHeight(metaInfoContainer, mediaH);

		// If we have an info scroller then reflow it after set Layouts
		if (this._infoScroller) {
			this._infoScroller.reflow();
			this._infoScroller.activateScrollIndicators(false, true);
		}
		$U.mediaCard.MediaCardController.resizeVideoControls(parseInt($U.core.Player.player.height, 10) + parseInt(GUTTERS/2, 10), $U.core.Player.player.width);
	};

	return TabletInfoCard;

}());
