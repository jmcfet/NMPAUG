
/**
 * @class $U.epg.widgets.MiniMediaCard
 * Class that represents the MiniMediaCard in the EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Object} owner Owner object (most likely its caller)
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.MiniMediaCard = ( function() {

	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape.png";

	var that;
	var DATA_ATTRIBUTE = "data-call-to-action-button";
	var UNSUBSCRIBED_TXT_KEY = "txtUnsubscribed";
	var CATCHUP_INDICATOR_KEY = "txtCatchup";

	var logger = $U.core.Logger.getLogger("MiniMediaCard");

	// MMC scroller name
	var SCROLLER_NAME = "MMCScroller";

	var minWidthForImageDisplay = 800;
	var refreshMiniMediaCard;

	var MiniMediaCard = function(container, owner) {

		that = this;
		this._container = container;
		this._owner = owner;

		// DOM elements for mini-media card
		this._miniCardImageContainer = document.getElementById("miniCardImageContainer");
		this._miniCardImage = document.getElementById("miniCardImage");
		this._miniCardTitle = document.getElementById("miniCardTitle");
		this._miniCardTime = document.getElementById("miniCardTime");
		this._miniCardDuration = document.getElementById("miniCardDuration");
		this._miniCardCatchupText = document.getElementById("miniCardCatchupText");
		this._miniCardCatchupText.innerHTML = $U.core.util.StringHelper.getString(CATCHUP_INDICATOR_KEY);
		this._miniCardCatchupIndicator = document.getElementById("_miniCardCatchupIndicator");
		this._miniCardDesc = document.getElementById("miniCardDesc");
		this._closeButton = document.getElementById("closeButton");
		this._miniActionBar = document.getElementById("miniActionBar");
		this._miniMediaCardDetail = document.getElementById("miniMediaCardDetail");

		// Components used for mini media card
		this._callToActionBar = new $U.mediaCard.MediaCardCallToActionBar(this._miniActionBar, this.actionbarHandler);

		this._buttonOverlay = $U.mediaCard.MediaCardButtonOverlay.create(document.getElementById("miniCardButtonContainer"),this, true);

		// Scroller for where the action bar is too long for the mini media card
		this._scroller = new $U.core.widgets.scroller.NagraScroller(this._miniActionBar, {
			scrollingX : true,
			scrollingY : false,
			measureContent : true,
			bouncing : false,
			active : true
		}, SCROLLER_NAME);
		this._closeButton.addEventListener("click", this.hide, true);
	};

	/**
	 * Populates the minicard with the given epgevent data ready for display
	 *
	 * @param {Object} EPGchannel channel that this EPGEvent is part of
	 * @param {Object} EPGEvent EPGEvent object
	 */
	MiniMediaCard.prototype.populate = function(EPGEvent) {
		var timeNow = new Date().getTime();
		//this._EPGchannel = EPGEvent.channel;
		if (this._mediaItem !== EPGEvent || (this._playable !== EPGEvent.isPlayable)) {
			this._mediaItem = EPGEvent;
			this._playable = this._mediaItem.isPlayable;
			// Deactivate before re-populating (to remove the previous refresh)
			this.deactivate();
			this.reload();
		} else {
			this._createUpdateListener();
		}
	};

	MiniMediaCard.prototype.deactivate = function() {
		$U.core.LifecycleHandler.unregisterListener(refreshMiniMediaCard);
		this._buttonOverlay.deactivate();
	};

	/**
	 * Creates the listener that updates the MMC every X seconds
	 */
	MiniMediaCard.prototype._createUpdateListener = function() {
		var that = this;

		refreshMiniMediaCard = function() {
			that.populate(that._mediaItem);
		};

		// Attach the refresh to the life cycle handler
		$U.core.LifecycleHandler.registerListener(refreshMiniMediaCard, $U.core.Configuration.LIFECYCLE_TIMINGS.REFRESH_MINI_MEDIA_CARD);
	};

	/**
	 * Reloads the MiniMediaCard with the current event
	 */
	MiniMediaCard.prototype.reload = function() {
		var that = this;

		this.sizeMediaCard();

		// Hide the promo image
		$U.core.util.HtmlHelper.setVisibilityHidden(this._miniCardImage);

		this._mediaItem.enrich(function() {
			that.setImage(that._mediaItem.promoImageURL);
		});

		// create the buttons
		this._buttonOverlay.activate(that._mediaItem);

		this._miniCardTitle.innerHTML = this._mediaItem.title;
		this._miniCardTime.innerHTML = $U.core.util.Formatter.formatTime(new Date(this._mediaItem.startTime)) + " - " + $U.core.util.Formatter.formatTime(new Date(this._mediaItem.endTime));
		this._miniCardDuration.innerHTML = $U.core.util.Formatter.formatDuration(this._mediaItem.startTime, this._mediaItem.endTime);

		// Show a catchup indicator if event is catchup
		if (this._mediaItem.isCatchUp) {
			$U.core.util.HtmlHelper.setDisplayBlock(this._miniCardCatchupIndicator);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._miniCardCatchupIndicator);
		}

		// Unsubscribed channels do not get a synopsis
		if (this._mediaItem.subscribed) {
			this._miniCardDesc.innerHTML = this._mediaItem.synopsis ? this._mediaItem.synopsis : this._mediaItem.description;
		} else {
			this._miniCardDesc.innerHTML = $U.core.util.StringHelper.getString(UNSUBSCRIBED_TXT_KEY);
		}

		this._createUpdateListener();

		this.setActionBar();
	};

	/**
	 * Click handler for the promo image/More info Buttons
	 */
	MiniMediaCard.prototype._mediaClickHandler = function(evt) {
		var startOver;
		if(evt.currentTarget === this._playButton || evt.currentTarget === this._moreButton){
			// Go to the media card with autoplay if this event is playable
			$U.core.View.showMediaCardScreen(that._mediaItem, null, that._playable);
		} else if (evt.currentTarget === this._startOverButton) {
			startOver = true;
			$U.core.View.showMediaCardScreen(that._mediaItem, null, that._playable, startOver);
		}
	};

	/**
	 * Sets the promo image.  Promo/channel logo/default fallback
	 * @param {string} imageURL Canonical URL to the image required
	 */
	MiniMediaCard.prototype.setImage = function(imageURL) {
		$U.core.ImageLoader.loadImageAndFitToSize(this._miniCardImage, [imageURL, this._mediaItem.channelLogo, DEFAULT_LANDSCAPE_IMAGE], $U.core.ImageLoader.CENTRE, 276, 155);
	};

	/**
	 * Based on the type of event, sets the Call to Action bar buttons
	 */
	MiniMediaCard.prototype.setActionBar = function() {
		// Build a call to action bar custom for this event
		that._callToActionBar.populate(that._mediaItem, true);
	};

	/**
	 * Handles all Call to action bar click events
	 * @param {String} buttonName
	 */
	MiniMediaCard.prototype.actionbarHandler = function(buttonName) {
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;

		switch(buttonName) {
		case button.MORE_INFO.name:
			that._moreInfoListener();
			break;
		case button.RECORD.name :
			that._recordListener();
			break;
		case button.NPVR_RECORD.name :
			that.npvrRecordListener();
			break;
		case button.NPVR_DELETE.name :
			that.npvrDeleteListener();
			break;
		case button.NPVR_PROTECT.name :
			that.npvrProtectListener();
			break;
		case button.NPVR_UNPROTECT.name :
			that.npvrUnprotectListener();
			break;
		case button.FAVOURITES_ADD.name :
			that.favouriteListener();
			break;
		case button.STAR_RATING.name :
			that.starRatingListener();
			break;
		// Add more handlers as required here
		default:
		/* No default, silently ignore invalid actions */
		}
	};

	/**
	 * Click Listner for the more info button
	 */
	MiniMediaCard.prototype._moreInfoListener = function() {
		// Go to the media card without autoplay
		$U.core.View.showMediaCardScreen(that._mediaItem, null, false);
	};

	/**
	 * function used when the user clicks on either of the favourites buttons
	 */
	MiniMediaCard.prototype.favouriteListener = function() {
		$U.core.category.favourites.Favourites.toggleFav(this._mediaItem, this.setActionBar);
	};

	/**
	 * function used when the user clicks the record button
	 */
	MiniMediaCard.prototype._recordListener = function() {
		$U.core.Gateway.recordingDialog(that._mediaItem, this);
	};

	/**
	 * function used when the user clicks on npvr record button
	 */
	MiniMediaCard.prototype.npvrRecordListener = function() {
		var that = this;
		var recordCallback = function(event) {
			$U.epg.EPGScreen.updateEPGEvent(event.id);
			that.reload();
		};
		$U.core.NPVRManager.getInstance().recordEvent(this._mediaItem, recordCallback);
	};

	/**
	 * function used when the user clicks on npvr delete button
	 */
	MiniMediaCard.prototype.npvrDeleteListener = function() {
		var that = this;
		var deleteCallback = function(event) {
			$U.epg.EPGScreen.updateEPGEvent(event.id);
			that.reload();
		};
		$U.core.NPVRManager.getInstance().deleteEvent(this._mediaItem, deleteCallback);
	};

	/**
	 * function used when the user clicks on npvr delete button
	 */
	MiniMediaCard.prototype.npvrProtectListener = function() {
		var that = this;
		var protectCallback = function(event) {
			that.reload();
		};
		$U.core.NPVRManager.getInstance().protectRecording(this._mediaItem, protectCallback);
	};

	/**
	 * function used when the user clicks on npvr delete button
	 */
	MiniMediaCard.prototype.npvrUnprotectListener = function() {
		var that = this;
		var unprotectCallback = function(event) {
			that.reload();
		};
		$U.core.NPVRManager.getInstance().unprotectRecording(this._mediaItem, unprotectCallback);
	};

	/**
	 * Display the mini media card
	 */
	MiniMediaCard.prototype.show = function() {
		that._container.className = "epg-mmc show";
		that._scroller.reflow();
		that._scroller.scrollTo(0);
	};

	/**
	 * Hide the mini media card
	 */
	MiniMediaCard.prototype.hide = function() {
		$U.core.util.HtmlHelper.removeClass(that._container, "show");
		$U.core.util.HtmlHelper.setClass(that._container, "hide");
		$U.epg.EPGScreen.hideMiniMediaCard();
		that.deactivate();
	};

	/**
	 * Resize handler for the the mini media card
	 */
	MiniMediaCard.prototype.sizeMediaCard = function() {
		if ($U.core.Device.getDeviceWidth() <= minWidthForImageDisplay) {
			$U.core.util.HtmlHelper.setDisplayNone(this._miniCardImageContainer);
			$U.core.util.HtmlHelper.setClass(this._miniMediaCardDetail, "epg-mmc-noimage");
		} else {
			$U.core.util.HtmlHelper.setDisplayBlock(this._miniCardImageContainer);
			$U.core.util.HtmlHelper.removeClass(this._miniMediaCardDetail, "epg-mmc-noimage");
		}
	};

	MiniMediaCard.prototype.starRatingListener = function() {
  		$U.mediaCard.StarRatingDialog.show(this._mediaItem);
	};
	
	return MiniMediaCard;

}());
