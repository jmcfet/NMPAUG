/**
 * Set up DOM elements, components and buttons
 * @class $U.mediaCard.MediaCardPlayer
 *
 * @constructor
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardPlayer = (function() {

	var logger = $U.core.Logger.getLogger("MediaCardPlayer");

	var proto;

	var BT = {
		PLAY : {},
		PURCHASE : {},
		PLAYPVR : {},
		NONE : {} //used on pvr screen when showing a scheduled asset
	};

	var SUBTITLE_STATE = {
		ON : {
			name : "on"
		},
		OFF : {
			name : "off"
		}
	};

	function MediaCardPlayer() {

		this._mediaItem = null;

		this._videoWrapper = document.getElementById("videoWrapper");
		// Set up the DOM elements
		this._videoContainer = document.getElementById("videoContainer");

		this._imgOverlay = $U.mediaCard.MediaCardController.getCardImgContainerEl();

		this._buttonContainer = $U.core.util.DomEl.createDiv().setId("mcButtonWrapper").setClassName("mc-button-wrapper").attachTo(this._imgOverlay).asElement();

		this._buttonOverlay = $U.mediaCard.MediaCardButtonOverlay.create(this._buttonContainer, this, false);

		this._subtitleState = undefined;
	}


	MediaCardPlayer.createDiv = function(id, className, attachTo) {
		return $U.core.util.DomEl.createDiv().setId(id).setClassName(className).attachTo(attachTo).asElement();
	};

	MediaCardPlayer.createEl = function(el, id, className, attachTo) {
		return $U.core.util.DomEl.createEl(el).setId(id).setClassName(className).attachTo(attachTo).asElement();
	};

	proto = MediaCardPlayer.prototype;

	/**
	 * Function that handles the user clicking the play button
	 * @param {Object} mediaItem
	 * @param {Boolean} autoplay
	 */
	proto.playListener = function(mediaItem, autoplay, startOver) {
		if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(mediaItem)) {
			mediaItem.bookmarkPosition = mediaItem.fetchPosition;
		}
		if (mediaItem.isAnyProductFree) {
			// As this asset is free do a free purchase
			this._doFreePurchase(mediaItem, autoplay);
		} else {
			this._doPlay(mediaItem, autoplay, startOver);
		}
	};

	/**
	 *  Function that handles purchase for a free asset
	 * @private
	 * @param {Object} mediaItem
	 * @param {Boolean} autoplay
	 */
	proto._doFreePurchase = function(mediaItem, autoplay) {
		var that = this;
		// Because the asset is free we must do a ghost purchase behind the scenes without user knowledge
		$N.services.sdp.VOD.subscribeToPolicyGroup(mediaItem.freeProduct.id, this, function() {
			// On success of the ghost purchase play the asset
			that._playFreeVODAfterPurchase(mediaItem, autoplay);
		}, function() {
			// If the purchase fails then try and play the asset anyway. (An example of where it fails might be where it is already purchased)
			// If some how the user shouldn't be able to play this license retrieval should fail anyway
			that._playFreeVODAfterPurchase(mediaItem, autoplay);
		});
	};

	proto._playFreeVODAfterPurchase = function(mediaItem, autoplay) {

		var that = this;

		$N.services.sdp.AcquiredContent.registerAclChangeCallBack(function() {
			if (mediaItem.isAssetPurchased) {
				that._doPlay(mediaItem, autoplay);
			}
		});
		// Refresh the ACL
		$N.services.sdp.AcquiredContent.refresh();
	};

	proto._doPlay = function(mediaItem, autoplay, startOver) {
		var that = this,
			playMedia = function () {
				var delay = 0;
				var config;
				if ($U.core.Gateway.isGatewayAvailable() && mediaItem.type === $U.core.mediaitem.MediaItemType.VOD && $U.core.Gateway.isNowPlayingVOD()) {
					var options = {};
					$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.STOP, function() {
						$U.core.Gateway.clearNowPlayingItems();
						that._doPlay(mediaItem, autoplay, startOver);
					}, options);
				} else {
					if ($U.core.Device.isAndroid()) {
						if (autoplay) {
							// A brief delay for Android to make sure that the media card
							// is visible before the content autoplays
							delay = 1000;
						}
					} else {
						if (autoplay) {
							if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(mediaItem)) {
								that._buildLoadingAnimation("txtFetching");
							} else {
								that._buildLoadingAnimation();
							}
						}
					}

					if (logger) {
						logger.log("_playContent", "delay", delay);
					}

					if ($U.core.Gateway.isGatewayAvailable()) {
						if (mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
							that._controlAdaptor = $U.mediaCard.BTVControlAdaptor;
						} else {
							that._controlAdaptor = $U.mediaCard.VODControlAdaptor;
						}
						$U.mediaCard.MediaCardController.getVideoControls().populate(mediaItem.type, false);
						$U.core.LifecycleHandler.unregisterListener($U.mediaCard.MediaCardPlayerEvents.gatewayFetchContentListener);
						that._controlAdaptor.updateProgress();
					}

					window.setTimeout(function() {
						$U.core.Player.play(mediaItem, startOver);
					}, delay);
				}
			};

		// Story B-01328: The WLA will have a configuration object that will allow an operator to specify which activities they would like to store.
		if ($U.core.Configuration.recordUserActivity("PLAY")) {
			$U.core.menudata.ContentDiscovery.recordUserActivity(playMedia, $U.core.Configuration.CDG_USER_ACTIVITIES.PLAY, mediaItem);
		} else {
			playMedia();
		}
	};

	/**
	 * Give the user a list of devices to play back on then throws the media over to that device
	 */
	proto.throwListener = function() {
		var that = this;
		var validCheck = function(isThere) {
			if (isThere) {
				$U.mediaCard.ThrowDialog.show(that._mediaItem);
			} else {
				$U.core.View.goBack();
			}
		};
		if (this._mediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING) {
			$U.core.Gateway.isPVRItemValid(this._mediaItem, validCheck);
		} else {
			validCheck(true);
		}
	};

	/**
	 * function used when the user clicks on npvr record button
	 */
	proto.npvrRecordListener = function() {
		var that = this;
		var handleRemoteRecord = function () {
			var recordCallback = function(event) {
				$U.epg.EPGScreen.updateEPGEvent(event.id);
				$U.mediaCard.MediaCardController.setCurrentlyPlaying(event);
			};
			$U.core.NPVRManager.getInstance().recordEvent(that._mediaItem, recordCallback);
		};

		if ($U.core.Configuration.recordUserActivity("REMOTERECORD")) {
			$U.core.menudata.ContentDiscovery.recordUserActivity(handleRemoteRecord, $U.core.Configuration.CDG_USER_ACTIVITIES.REMOTERECORD, this._mediaItem);
		} else {
			handleRemoteRecord();
		}
	};

	/**
	 * function used when the user clicks on npvr delete button
	 */
	proto.npvrDeleteListener = function() {
		var that = this;
		var deleteCallback = function(event) {
			if (event.type === $U.core.mediaitem.MediaItemType.NPVR) {
				//go back as there's nothing to show now
				$U.core.View.goBack(null, event);
			} else {
				$U.epg.EPGScreen.updateEPGEvent(event.id);
				$U.mediaCard.MediaCardController.setCurrentlyPlaying(event);
			}
		};
		$U.core.NPVRManager.getInstance().deleteEvent(this._mediaItem, deleteCallback);
	};

	/**
	 * function used when the user clicks on npvr protect button
	 */
	proto.npvrProtectListener = function() {
		var that = this;
		var protectCallback = function(event) {
			$U.mediaCard.MediaCardController.setCurrentlyPlaying(event);
		};
		$U.core.NPVRManager.getInstance().protectRecording(this._mediaItem, protectCallback);
	};

	/**
	 * function used when the user clicks on npvr unprotect button
	 */
	proto.npvrUnprotectListener = function() {
		var that = this;
		var unprotectCallback = function(event) {
			$U.mediaCard.MediaCardController.setCurrentlyPlaying(event);
		};
		$U.core.NPVRManager.getInstance().unprotectRecording(this._mediaItem, unprotectCallback);
	};

	/**
	 * function used when the user clicks on either of the favourites buttons
	 */
	proto.favouriteListener = function() {
		var favItem;
		if (this._mediaItem.type === $U.core.mediaitem.MediaItemType.CATCHUP && this._mediaItem._btvEvent) {
			favItem = this._mediaItem._channel;
		} else {
			favItem = this._mediaItem;
		}
		$U.core.category.favourites.Favourites.toggleFav(favItem, $U.mediaCard.MediaCardController.updateCtab);
	};

	proto.deleteListener = function() {
		var that = this;
		if ($U.core.Player.getIsPlaying()) {
			$U.mediaCard.MediaCardController.deactivatePlayer();
			$U.mediaCard.MediaCardController.reactivatePlayer();
		}
		$U.core.category.pvr.PVRRemove.showRemoveDialog(null, this._mediaItem, function() {
			//we need to pause befor getting the schedule tasks, otherwise it think the task hasn't been deleted
			window.setTimeout(function() {
				$U.core.View.goBack(null, that._mediaItem);
				$U.core.View.reloadCategoryIfEmpty();
			}, 100);
		});
	};

	proto.recordListener = function() {
		var that = this;
		var handleRecord = function () {
			$U.core.Gateway.recordingDialog(that._mediaItem, that);
		};

		if ($U.core.Configuration.recordUserActivity("RECORD")) {
			$U.core.menudata.ContentDiscovery.recordUserActivity(handleRecord, $U.core.Configuration.CDG_USER_ACTIVITIES.RECORD, this._mediaItem);
		} else {
			handleRecord();
		}
	};

	/**
	 * Resizes the video image overlay
	 */
	proto.resizeVideoImageOverlay = function() {
		$U.core.ImageLoader.setImageSize(this.videoImageOverlayEl, $U.core.ImageLoader.CENTRE, this.videoContainerEl.clientWidth, this.videoContainerEl.clientHeight);
	};

	proto.activate = function(mediaItem, autoplay, startOver, startTranscode) {
		var mi = mediaItem;
		var mt = mediaItem.type;
		var playable = false;
		var that = this;

		this._buttonOverlay.activate(mediaItem, null, autoplay);

		switch (mt) {

		case $U.core.mediaitem.MediaItemType.VOD:
		case $U.core.mediaitem.MediaItemType.CATCHUP:
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
			playable = true;
			if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(mediaItem)) {
				that._controlAdaptor = $U.mediaCard.GatewayControlAdaptor;
			} else {
				that._controlAdaptor = $U.mediaCard.VODControlAdaptor;
			}
			break;
		//TODO: should split these two out
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
		case $U.core.mediaitem.MediaItemType.NPVR:
			if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(mediaItem)) {
				that._controlAdaptor = $U.mediaCard.GatewayControlAdaptor;
			} else {
				that._controlAdaptor = ((mi.inLocker && mi.completed) || (mi.isPast && mi.isCatchUp)) ? $U.mediaCard.VODControlAdaptor : $U.mediaCard.BTVControlAdaptor;
			}
			playable = true;
			if (mt === $U.core.mediaitem.MediaItemType.BTVEVENT && !mi.inLocker && !mi.isPast) {
				$U.core.LifecycleHandler.registerListener($U.mediaCard.MediaCardPlayerEvents.whatsOnNowListener, $U.core.Configuration.LIFECYCLE_TIMINGS.WHATSON);
			}

			break;
		default:
			that._controlAdaptor = $U.mediaCard.VODControlAdaptor;
			break;
		}

		if ($U.core.Gateway.isGatewayAvailable() && startTranscode) {
			$U.core.Gateway.startTranscoding($U.core.Gateway.createContentURI(mediaItem.contentToPlay));
		}

		that._mediaItem = mi;
		if (autoplay && playable) {
			that._buttonOverlay.clearAllButtons();
			that.playListener(that._mediaItem, true, startOver);
		}
	};

	/**
	 * Stops playback depending on its current state
	 * @private
	 */
	proto._deactivatePlayback = function() {

		var currentTime = (($U.core.Device.isIOS() && $U.core.Device.isPhone()) || ($U.core.Device.isIOS3x())) ? $U.core.Player.getCurrentTime() : $U.core.Player.player.currentTime;
		var duration = $U.core.Player.player.duration;

		if (this._mediaItem) {

			if ($U.mediaCard.MediaCardController.getCurrentlyPlaying().type !== $U.core.mediaitem.MediaItemType.TRAILER) {
				$U.mediaCard.MediaCardController.setOrDeleteBookmark(this._mediaItem, currentTime, duration, this._setOrDeleteBookmarkCallback);
			}

			// Remove any listeners
			$U.mediaCard.MediaCardPlayerEvents.deactivateListeners(this._mediaItem);

			//Exit fullscreen
			$U.core.Player.exitFullScreen();

			// Set the opacity of the player to 0 (should transition)
			$U.mediaCard.MediaCardController.hidePlayer();
			// Move the player back to left -9999px
			$U.mediaCard.MediaCardController.movePlayerOutOfView();
			// Re-establish the image overlay by setting opacity back to 1 (should transition in)
			$U.mediaCard.MediaCardController.setImageOpacity(1);

			// Finally stop the player
			$U.core.Player.stop();
		}
	};

	/**
	 * Deactivates mediacard, puts the card back into a state so won't affect the other parts of the application
	 */
	proto.deactivate = function() {
		// Deactivate playback
		this._deactivatePlayback();

		// Remove any button elements & text straps from the video player
		this.hideMediaButtons();

		// Reactive the dialog buttons as we disable during playback
		$U.mediaCard.MediaCardController.activateDialogButtons();
		// Hide the video controls
		$U.mediaCard.MediaCardController.hideVideoControls();
		$U.core.widgets.PageLoading.hideAll(); //Defect 11256 could specifically target hide("purchase"), but perhaps better to kill all at this point.
		this._subtitleState = undefined;
	};

	proto._setOrDeleteBookmarkCallback = function(result) {
		if (logger) {
			logger.log("set bookmark", "bookmarked:", JSON.stringify(result));
		}
	};

	/**
	 * Unregisters any LifecycleHandler Listeners that have been created
	 */
	proto.unregisterListeners = function() {
		// When playing BTV Events we register a whats on now listener this needs to be removed if BTV event
		if (this._mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			$U.core.LifecycleHandler.unregisterListener($U.mediaCard.MediaCardPlayerEvents.whatsOnNowListener);
		}
	};

	proto.reactivate = function(mediaItem) {
		if (mediaItem) {
			this.activate(mediaItem);
		} else if (this._mediaItem) {
			this.activate(this._mediaItem);
		}
	};

	/**
	 * Removes all buttons from the button overlay array
	 */
	proto.hideMediaButtons = function() {
		this._buttonOverlay.clearAllButtons();
	};

	/**
	 * Build the loading animation
	 */
	proto._buildLoadingAnimation = function(text) {
		this._buttonOverlay.buildLoadingAnimation(text);
	};

	/**
	 * Move the player into view
	 */
	proto.movePlayerIntoView = function() {
		// There is no player to move in or out of view for Android/IOS
		if (!$U.core.Device.isHandHeld()) {
			var gutter;

			if ($U.core.Device.isMac() && $U.core.View.getCurrentScreenId() !== $U.core.View.SCREENID.MEDIACARD) {
				if (logger) {
					logger.log("movePlayerIntoView", "Aborting - media card is not current screen");
				}
				return;
			}

			gutter = 20;
			$U.core.util.HtmlHelper.setLeft(this._videoWrapper, gutter);

			if (logger) {
				logger.log("movePlayerIntoView");
			}
		}
	};

	/**
	 * Move the player out of view
	 */
	proto.movePlayerOutOfView = function() {
		// There is no player to move in or out of view for Android
		if (!$U.core.Device.isAndroid()) {
			$U.core.util.HtmlHelper.setLeft(this._videoWrapper, "-9999");
		}
		if (logger) {
			logger.log("movePlayerOutOfView");
		}
	};

	/**
	 * Show the player by setting it's opacity to 1
	 */
	proto.showPlayer = function() {

		if ($U.core.Device.isMac() && $U.core.View.getCurrentScreenId() !== $U.core.View.SCREENID.MEDIACARD) {
			if (logger) {
				logger.log("movePlayerIntoView", "Aborting - media card is not current screen");
			}
			return;
		}

		if (!$U.core.Device.isAndroid()) {
			this._videoContainer.style.opacity = "1";
		}
		if (logger) {
			logger.log("showPlayer");
		}
	};

	/**
	 * Hide the player by setting it's opacity to 0
	 */
	proto.hidePlayer = function() {
		if (!$U.core.Device.isAndroid()) {
			this._videoContainer.style.opacity = "0";
		}
		if (logger) {
			logger.log("hidePlayer");
		}
	};

	proto.getPlayerContainerEl = function() {
		return this._videoContainer;
	};

	proto.activateButtonOverlay = function(state) {
		this._buttonOverlay.activate(this._mediaItem, state);
	};

	/**
	 * Returns the control adaptor that passes information to the video controls
	 */
	proto.getControlAdaptor = function() {
		return this._controlAdaptor;
	};

	proto._setSubtitleState = function(state) {
		this._subtitleState = state;
	};

	proto.setSubtitleState = function(state) {
		this._subtitleState = state;
		$U.mediaCard.MediaCardController.updateCtab();
	};

	proto.getSubtitleState = function() {
		return this._subtitleState;
	};

	proto.subtitlesListener = function(subtitleButton) {

		switch (subtitleButton) {
		case $U.mediaCard.MediaCardCallToActionBar.BUTTON.SUBTITLE_ON:

			this._setSubtitleState(SUBTITLE_STATE.ON);

			$U.core.Player.activateSubTitle();

			$U.mediaCard.MediaCardController.updateCtab();

			break;
		case $U.mediaCard.MediaCardCallToActionBar.BUTTON.SUBTITLE_OFF:

			this._setSubtitleState(SUBTITLE_STATE.OFF);

			$U.core.Player.deactivateSubTitle();

			$U.mediaCard.MediaCardController.updateCtab();
			break;
		}
	};

	proto.starRatingListener = function() {
		$U.mediaCard.StarRatingDialog.show(this._mediaItem);
	};

	proto.stopTrailer = function() {
		var delay = 250;
		$U.mediaCard.MediaCardController.populate(this._mediaItem);
		$U.mediaCard.MediaCardController.setCurrentMedia(this._mediaItem);
		this._deactivatePlayback();
		window.setTimeout(function() {
			$U.mediaCard.MediaCardController.updateCtab();
		}, delay);
	};

	proto.playTrailer = function() {
		var	that = this,
			delay = 500,
			trailerId,
			i,
			successCallback = function(trailers) {
				var i,
					item,
					url,
					playableContent;
				for (i = 0; i < trailers.promotions.length; i++) {
					if (trailers.promotions[i].technicals && trailers.promotions[i].technicals.length > 0) {
					if (trailers.promotions[i].technicals[0].media.AV_PlaylistName || trailers.promotions[i].technicals[0].media.AV_ClearTS) {
							item = new $U.core.mediaitem.TrailerItem(trailers.promotions[i]);
						}
					} else if (trailers.promotions[i].id && !item) {
						item = new $U.core.mediaitem.TrailerItem(trailers.promotions[i]);
					}
				}
				if (item) {
					item.parentItem = that._mediaItem;
					$U.mediaCard.MediaCardController.setCurrentMedia(item);
					$U.core.Player.play(item);
				} else {
					failureCallback();
				}
			},
			failureCallback = function() {
				if (logger) {
					logger.log("failed to retrieve trailer details for " + trailerId);
				}
				$U.core.View.showDialog($U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString("txtTrailerErrorTitle"), $U.core.util.StringHelper.getString("txtTrailerErrorMessage")), function(){
					that._buttonOverlay.activate(that._mediaItem, null);
					$U.core.View.hideDialog();
				});
			},
			getTrailer = function() {
				var filter = null;
				if ($U.core.Gateway.isGatewayAvailable()) {
					filter = {"id": trailerId};
				}
				$N.services.sdp.VOD.getTrailerById(trailerId, filter, successCallback, failureCallback);
			};

		this._buttonOverlay.clearAllButtons();

		for (i = 0; i < this._mediaItem._data.technicals.length; i++) {
			if (this._mediaItem._data.technicals[i].promoRefs[0]) {
				trailerId = this._mediaItem._data.technicals[i].promoRefs[0];
				break;
			}
		}

		if ($U.core.Player.getIsPlaying()) {
			//$U.core.Player.player.addEventListener("stop", stopCallback);
			this._deactivatePlayback();
			window.setTimeout(function() {	//TODO: Check for stop events when available.
											//For now add delay so player stop has time to stop before attempting playback of trailer
				getTrailer();
			}, delay);
		} else {
			getTrailer();
		}
		this._buildLoadingAnimation();

	};

	proto.SUBTITLE_STATE = SUBTITLE_STATE;

	MediaCardPlayer.BT = BT;
	MediaCardPlayer.SUBTITLE_STATE = SUBTITLE_STATE;

	return MediaCardPlayer;

}());

