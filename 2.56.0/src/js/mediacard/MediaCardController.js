/**
 * MediaCardController is responsible for passing messages between $U.mediaCard.MediaCardScreen and
 * other components such as the call to action bar, more like this grid and the player.
 * @class $U.mediaCard.MediaCardController
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.MediaCardController = ( function() {

	var ASSET_STATE = {
		AVAILABLE : {
			name : "available"
		},
		UNAVAILABLE : {
			name : "unavailable"
		},
		FAILED : {
			name : "failed"
		},
		RESET : {
			name : "reset"
		}
	};

	var BOOKMARK_TYPE = {
		ASSET : {
			name : "AST"
		},
		NPVR : {
			name : "NPVR"
		}
	};

	var logger = $U.core.Logger.getLogger("MediaCardController");

	var mcs;
	var player;
	var ctab;
	var card;
	var media;
	var videoControls;
	var autoplay;
	var startOver;
	var assetState;
	var playerInView = false;
	var playerOpaque = true;

	function initialise(mediaCardScreen) {
		// Create a shorthand for the media card screen
		mcs = mediaCardScreen;

		//Create a media card component
		card = $U.mediaCard.InfoCard.create(mcs.getmediaContainerEl());

		//Add the video controls
		if (card.getVideoControlsEl()) {
			videoControls = new $U.mediaCard.VideoControls(card.getVideoControlsEl());
		}

		//Create a media player
		player = new $U.mediaCard.MediaCardPlayer(this, this._mediaContainerEl);

		//Create an action bar component
		ctab = new $U.mediaCard.MediaCardCallToActionBar(mcs.getActionBarEl(), actionBarHandler);

		$U.settings.SubtitlesDialog.addEventListener($U.settings.SubtitlesDialog.EVENT.SUBTITLES_ON, setSubTitleOnButton);
		$U.settings.SubtitlesDialog.addEventListener($U.settings.SubtitlesDialog.EVENT.SUBTITLES_OFF, setSubTitleOffButton);
	}

	function setSubTitleOnButton() {
		player.setSubtitleState(player.SUBTITLE_STATE.ON);
	}

	function setSubTitleOffButton() {
		player.setSubtitleState(player.SUBTITLE_STATE.OFF);
	}

	function ACLRefreshCallback() {
		var fromACLRefresh = true;
		if (media.type === $U.core.mediaitem.MediaItemType.VOD) {
			// Only change the media card state if video is not playing
			if (!$U.core.Player.getIsPlaying()) {
				// If the asset is not purchased or no subscribed then it is unavailable
				if (!media.isAssetPlayable && assetState !== ASSET_STATE.FAILED) {
					setAssetState(ASSET_STATE.UNAVAILABLE);
				}
				// Adjust the state
				adjustMediaCardOnState(fromACLRefresh);
			}
		}
		$U.core.widgets.PageLoading.hide("purchase");
	}

	function adjustMediaCardOnState(fromACLRefresh) {
		switch (assetState) {
		case ASSET_STATE.AVAILABLE :
		case ASSET_STATE.UNAVAILABLE :
			card.setAvailableLayout();
			break;
		case ASSET_STATE.FAILED :
			// As there has been a failure it could be due to the asset already being purchased so check
			if (media.isAssetPurchased || media.isAssetSubscribed && !media.isAnyProductFree) {
				// Show the user that the asset has already been purchased
				$U.mediaCard.MediaCardPurchaseDialog.showAssetAlreadyPurchasedDialog();
				// Update the layout of the media card to reflect the post purchase layout
				card.setAvailableLayout();
			} else {
				// Show the purchase error dialog which allows user to retry or cancel
				$U.mediaCard.MediaCardPurchaseDialog.showPurchaseErrorDialog($U.mediaCard.MediaCardPurchaseWorkflow.purchaseErrorDialogCallback);
			}
			break;
		}
		setAssetState(ASSET_STATE.RESET);
	}

	/**
	 * handler for action bar button selections
	 * @param {String} buttonName the button identifier
	 */
	function actionBarHandler(buttonName) {
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;

		switch(buttonName) {
		case button.BUY.name:
			intialisePurchaseWorkFlow(media);
			break;
		case button.PLAY.name :
			player.playListener();
			break;
		case button.PLAY_TRAILER.name :
			player.playTrailer();
			break;
		case button.STOP_TRAILER.name :
			player.stopTrailer();
			break;
		case button.CHOOSE_SCREEN.name :
			player.throwListener();
			break;
		case button.NPVR_RECORD.name :
			player.npvrRecordListener();
			break;
		case button.NPVR_DELETE.name :
			player.npvrDeleteListener();
			break;
		case button.NPVR_PROTECT.name :
			player.npvrProtectListener();
			break;
		case button.NPVR_UNPROTECT.name :
			player.npvrUnprotectListener();
			break;
		case button.FAVOURITES_ADD.name :
			player.favouriteListener();
			break;
		case button.RECORD.name :
			player.recordListener();
			break;
		case button.DELETE.name :
			player.deleteListener();
			break;
		case button.SUBTITLE_ON.name :
			player.subtitlesListener(button.SUBTITLE_ON);
			break;
		case button.SUBTITLE_OFF.name :
			player.subtitlesListener(button.SUBTITLE_OFF);
			break;
		case button.STAR_RATING.name :
			player.starRatingListener();
			break;
		default:
		/* No default, silently ignore invalid actions */
		}
	}

	//TODO improve
	/**
	 * Initialises the purchase work flow dialogs.
	 *  @param {$U.mediaitem.VODItem} mediaItem
	 */
	function intialisePurchaseWorkFlow(mediaItem) {
		$U.mediaCard.MediaCardPurchaseDialog.showPurchaseOptions(function(interactiveEl) {
			$U.mediaCard.MediaCardPurchaseWorkflow.purchaseOptionsCallBack(interactiveEl, mediaItem);
		}, mediaItem);
	}

	/**
	 * Populates the media card and its components for the first time on activating the mediacard
	 * @param {$U.mediaitem.MediaItem} mediaItem
	 * @param {boolean} noTranscoding true if the transcoding request to the Gateway should be suppressed
	 */
	function populate(mediaItem, noTranscoding) {
		if ($U.core.Gateway.isGatewayAvailable()) {
			return gatewayPopulate(mediaItem, noTranscoding);
		}
		setCurrentlyPlaying(mediaItem);
		player.activate(mediaItem, autoplay, startOver);
		if (videoControls) {
			videoControls.populate(mediaItem.type);
		}
		autoplay = false;
		startOver = false;
		$N.services.sdp.AcquiredContent.registerAclChangeCallBack(ACLRefreshCallback);
	}

	/**
	 * Populates the media card and its components for the first time on activating the mediacard
	 * @param {$U.mediaitem.MediaItem} mediaItem
	 * @param {boolean} noTranscoding true if the transcoding request to the Gateway should be suppressed
	 */
	function gatewayPopulate(mediaItem, noTranscoding) {
		var nowPlaying = $U.core.Gateway.nowPlayingOnGateway(mediaItem);
		var wasThrown = $U.core.Gateway.nowPlayingWasThrown();
		var devices = $U.core.Gateway.getDevices();
		var transcode = mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT && !noTranscoding ? true : false;
		if(nowPlaying && !wasThrown && !autoplay){
			//mediaItem.throwId = mediaItem._data._data.refID;
			//$U.core.Gateway.fetchNowPlayingPosition(function(position){
			//don't need no stinking position
			$U.mediaCard.ThrowDialog.throwToDevice(devices[0].id, mediaItem, false, null);
			//});
		}
		setCurrentlyPlaying(mediaItem);
		player.activate(mediaItem, autoplay, startOver, transcode);
		if (videoControls) {
			videoControls.populate(mediaItem.type, nowPlaying && wasThrown);
			if (nowPlaying && wasThrown) {
				videoControls._adaptor.updateProgress(mediaItem);
			}
		}
		autoplay = false;
		startOver = false;
		$N.services.sdp.AcquiredContent.registerAclChangeCallBack(ACLRefreshCallback);
		//if on gateway need to keep track of what's playing
		if (nowPlaying) {
			$U.core.LifecycleHandler.registerListener($U.mediaCard.MediaCardPlayerEvents.gatewayFetchContentListener, $U.core.Configuration.LIFECYCLE_TIMINGS.FETCH_CONTENT);
		}
	}

	/**
	 * Sets a flag so that the next mediaItem populated is autoplayed.
	 */
	function autoPlayNextPopulate() {
		autoplay = true;
	}

	/**
	 * Sets a flag so that we know to playback from start of BTVEvent
	 */
	function startOverPlayback() {
		startOver = true;
	}

	function getCurrentBTVEventItem() {
		return $U.core.mediaitem.BTVEventItem.create(media.channel);
	}

	/**
	 * Deactivates buttons in header bar as they are turned off during playback
	 */
	function deactivateDialogButtons() {
		if ($U.core.View.getDialog()) {
			$U.core.View.hideDialog();
		}

		if (($U.core.Device.isTablet() && $U.core.Device.isIOS2x()) || $U.core.Device.isDesktop()) {
			$U.core.View.getHeader().deactivateParentalButton();
			$U.core.View.getHeader().deactivateSettingsButton();
		}
	}

	/**
	 * Deactivates buttons in header bar as they are turned off during playback
	 */
	function activateDialogButtons() {
		if (($U.core.Device.isTablet() && $U.core.Device.isIOS2x()) || $U.core.Device.isDesktop()) {
			$U.core.View.getHeader().activateParentalButton();
			$U.core.View.getHeader().activateSettingsButton();
		}
	}

	/* Register this item as watched after it has been playing the time set in configuration */
	function registerRecentlyWatched() {
		var recentlyWatched = function () {
			// Register this watch with the 'Recently Watched' system
			$U.core.category.recentlyviewed.RecentlyViewed.registerWatch(getCurrentlyPlaying());
		};

		if ($U.core.Configuration.recordUserActivity("WATCH")) {
			$U.core.menudata.ContentDiscovery.recordUserActivity(recentlyWatched, $U.core.Configuration.CDG_USER_ACTIVITIES.WATCH, getCurrentlyPlaying());
		} else {
			recentlyWatched();
		}
	}

	function multiplePlayableOptionsCallback(elements) {

		var btn, i, l, indx;

		l = elements.length;
		btn = elements[0].buttonClicked;

		switch (btn) {
		case "play" :
			for ( i = 0; i < l; i++) {
				if (elements[i].type === "INPUT" && elements[i].checked) {
					indx = elements[i].value;
				}
			}

			$U.core.Player.player.playContent(media.contentToPlay[indx]);
			break;
		case "cancel" :
			activateButtonOverlay();
			break;
		}
		$U.core.View.hideDialog();

	}

	// function getCurrentBTVEventItem() {
	// var result = {
	// id : "$NAUGHTY",
	// rating : 10,
	// title : "Naughty Title",
	// description : "Naughty Description",
	// startTime : 0,
	// endTime : 0,
	// type : $U.core.mediaitem.MediaItemType.BTVEVENT,
	// channel : {
	// serviceId : media.channel.serviceId
	// },
	// enrich : function(callback) {
	// callback();
	// }
	// };
	//
	// return result;
	// }

	/**
	 * currently Playing
	 */
	function setCurrentlyPlaying(mediaItem) {
		media = mediaItem;
		ctab.populate(media);
		card.activate(media);
	}

	function setCurrentMedia(mediaItem) {
		media = mediaItem;
	}

	/**
	 * Reloads the current media item into the page, used to reset the page after an error.
	 * (this is used mainly by the Gateway when the error comes from the Gateway)
	 * @param  {Boolean} noTranscoding true if the transcoding request should be suppressed on the reload
	 */
	function reload(noTranscoding){
		populate(media, noTranscoding);
	}

	/**
	 * Deactivates the player and the info card
	 */
	function deactivate() {
		deactivatePlayer();
		player.unregisterListeners();
		card.deactivate();
		// Remove the ACL callback
		$N.services.sdp.AcquiredContent.removeAclChangeCallback();
		if ($U.core.Gateway.isGatewayAvailable()) {
			$U.core.LifecycleHandler.unregisterListener($U.mediaCard.MediaCardPlayerEvents.gatewayFetchContentListener);
		}
	}

	function playListener(mediaItem, autoplay, startOver) {
		player.playListener(mediaItem, autoplay, startOver);
	}

	/**
	 * Deactivates the player
	 */
	function deactivatePlayer() {
		player.deactivate();
	}

	/**
	 * Reactivates the player with the same mediaItem
	 */
	function reactivatePlayer() {
		player.reactivate(media);
	}

	/**
	 * Sets the Info card to be blocked
	 */
	function setBlocked() {
		deactivatePlayer();
		card.setBlocked();
		ctab.setBlocked();
	}

	/**
	 * Shows and populates the required more like this compontent.
	 */
	function showMlt(items, type) {
		$U.mediaCard.MoreLikeThisController.showMoreLikeThis(items, type);
	}

	/**
	 * Hides the active more like this compontent.
	 */
	function hideMlt() {
		$U.mediaCard.MoreLikeThisController.hideMoreLikeThis();
	}

	/**
	 * Resizes the more like this widget
	 */
	function resizeMlt() {
		$U.mediaCard.MoreLikeThisController.resizeMlt();
	}

	/**
	 * Resizes the info card
	 */
	function resizeInfoCard() {
		card.resizeHandler();
	}

	/**
	 * resizes the video controls
	 * @param {Number} width
	 */
	function resizeVideoControls(top, width) {
		if (videoControls) {
			videoControls.resize(top, width);
		}
	}

	/**
	 * Sets the more like this height
	 * @param {Number} h - the height to set
	 */
	function setMltHeight(h) {
		$U.mediaCard.MoreLikeThisController.setHeight(h);
		resizeMlt();
	}

	/**
	 * Updates the current MoreLikeThis component based on the current media card asset
	 * @param {Object} currentAsset current media card asset
	 */
	function updateMlt(currentAsset) {
		$U.mediaCard.MoreLikeThisController.updateMlt(currentAsset);
	}

	/**
	 * Gets the currently playing media item
	 */
	function getCurrentlyPlaying() {
		return media;
	}

	/**
	 * Gets the image container element
	 * @return {HTMLElement}
	 */
	function getCardImgContainerEl() {
		return card.getImageContainerEl();
	}

	/**
	 * Gets the meta information container element
	 * @return {HTMLElement}
	 */
	function getMetaInfoContainerEl() {
		return card.getMetaInfoContainerEl();
	}

	/**
	 * Gets the element which contains the video player
	 * @return {HTMLElement}
	 */
	function getPlayerContainerEl() {
		return player.getPlayerContainerEl();
	}

	function setImageOpacity(opacityVal) {
		card.setImageOpacity(opacityVal);
	}

	/**
	 * Shows video controls
	 */
	function showVideoControls() {
		if (videoControls) {
			if ($U.core.Device.isDesktop() || ($U.core.Gateway.isGatewayAvailable() && getPlayer().getControlAdaptor() === $U.mediaCard.GatewayControlAdaptor && $U.core.Gateway.nowPlayingWasThrown())) {
				videoControls.show();
			}
		}
	}

	/**
	 * Hides Video controls
	 */
	function hideVideoControls() {
		if (videoControls) {
			videoControls.hide();
		}
	}

	/**
	 * Set Controls full screen or not
	 */
	function toggleFullscreenControl(fullscreen) {
		if (videoControls) {
			videoControls.setFullScreen(fullscreen);
		}
	}

	/**
	 * Shows the media player
	 */
	function movePlayerIntoView() {
		if (!playerInView) {
			player.movePlayerIntoView();
		}
		playerInView = true;
	}

	/**
	 * Hides the video player
	 */
	function movePlayerOutOfView() {
		if (playerInView) {
			player.movePlayerOutOfView();
		}
		playerInView = false;
	}

	function showPlayer() {
		if (playerOpaque) {
			player.showPlayer();
		}
		playerOpaque = false;
	}

	function hidePlayer() {
		if (!playerOpaque) {
			player.hidePlayer();
		}
		playerOpaque = true;
	}

	function updateCtab(newMedia) {
		if (!newMedia) {
			newMedia = media;
		}
		ctab.populate(newMedia);
	}

	function getVideoControls() {
		return videoControls;
	}

	function getPlayer() {
		return player;
	}

	function setAssetState(state) {
		assetState = state;
	}

	function hideMediaButtons() {
		player.hideMediaButtons();
	}

	function activateButtonOverlay(state) {
		player.activateButtonOverlay(state);
	}

	function getNextItemInMlt(item) {
		return mcs.getNextItemInMlt(item);
	}

	function getSubtitleState() {
		return player.getSubtitleState();
	}

	function stopTrailer() {
		player.stopTrailer();
	}

	function playTrailer() {
		player.playTrailer();
	}

	/**
	 * Sets or deletes a book mark based on the position and duration of an asset
	 * @param {Object} mediaItem
	 * @param {Number} position
	 * @param {Number} duration
	 * @param {Function} callback
	 */
	function setOrDeleteBookmark(mediaItem, position, duration, callback) {
		var handleBookmark = function () {
			if ($U.core.Gateway.isGatewayAvailable()) {
				return gatewaySetOrDeleteBookmark(mediaItem, position, duration, callback);
			}

			var bookmarkType = BOOKMARK_TYPE.ASSET;
			if (mediaItem.type === $U.core.mediaitem.MediaItemType.NPVR || mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
				bookmarkType = BOOKMARK_TYPE.NPVR;
			}
			if (position > 0 && duration > 0) {
				// Only set the book mark if we have the correct values
				if (logger) {
					logger.log("set bookmark", "id:", mediaItem.id, "bookmark:", position);
				}

				$N.services.sdp.Bookmark.deleteOrBookmarkCurrentPositionForContent(position, duration, mediaItem.id, bookmarkType.name, function(result) {
					callback(result);
				});
			} else {
				callback();
			}
		};
		// Story B-01328: The WLA will have a configuration object that will allow an operator to specify which activities they would like to store.
		if ($U.core.Configuration.recordUserActivity("BOOKMARK")) {
			$U.core.menudata.ContentDiscovery.recordUserActivity(handleBookmark, $U.core.Configuration.CDG_USER_ACTIVITIES.BOOKMARK, media);
		} else {
			handleBookmark();
		}
	}

	/**
	 * deletes the book mark for a given piece of content
	 * @param {Object} mediaItem
	 * @param {Function} callback
	 */

	function deleteBookmark(mediaItem, callback) {

		if ($U.core.Gateway.isGatewayAvailable()) {
			return gatewayDeleteBookmark(mediaItem, callback);
		}

		var bookmarkType = BOOKMARK_TYPE.ASSET;
		if (mediaItem.type === $U.core.mediaitem.MediaItemType.NPVR || mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			bookmarkType = BOOKMARK_TYPE.NPVR;
		}
		$N.services.sdp.Bookmark.deleteBookmarkForContent(mediaItem.id, bookmarkType.name, function() {
			mediaItem.bookmarkPosition = 0;
			callback();
		});
	}

	/**
	 * Sets or deletes a book mark based on the position and duration of an asset
	 * @param {Object} mediaItem
	 * @param {Number} position
	 * @param {Number} duration
	 * @param {Function} callback
	 */
	function gatewaySetOrDeleteBookmark(mediaItem, position, duration, callback) {
		var bookmarkType = BOOKMARK_TYPE.ASSET;
		if (mediaItem.type === $U.core.mediaitem.MediaItemType.NPVR || mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			bookmarkType = BOOKMARK_TYPE.NPVR;
		}
		if (mediaItem.type !== $U.core.mediaitem.MediaItemType.BTVEVENT) {
			if (position && duration) {
				// Only set the book mark if we have the correct values
				if (logger) {
					logger.log("set bookmark", "id:", mediaItem.id, "bookmark:", position);
				}
				if (mediaItem.type === $U.core.mediaitem.MediaItemType.VOD) {
					$N.services.sdp.Bookmark.deleteOrBookmarkCurrentPositionForContent(position, duration, mediaItem.id, bookmarkType.name, function(result) {
						callback(result);
					});
				} else {
					$U.core.Gateway.setBookmark(mediaItem.cdsObjectID, position, callback);
				}
			}
		}
	}

	/**
	 * deletes the book mark for a given piece of content
	 * @param {Object} mediaItem
	 * @param {Function} callback
	 */

	function gatewayDeleteBookmark(mediaItem, callback) {
		var bookmarkType = BOOKMARK_TYPE.ASSET;
		if (mediaItem.type === $U.core.mediaitem.MediaItemType.NPVR || mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			bookmarkType = BOOKMARK_TYPE.NPVR;
		}
		if (mediaItem.type !== $U.core.mediaitem.MediaItemType.BTVEVENT) {
			$U.core.Gateway.deleteBookmark(mediaItem.cdsObjectID, function() {
				mediaItem.bookmarkPosition = 0;
				callback();
			});
		}
	}

	function getMoreLikeThisItems(mediaItem, callback) {
		return mcs.getMoreLikeThisItems(callback);
	}

	function updateScroller(mediaCardAsset) {
		if (mediaCardAsset) {
			mcs.updateScroller(mediaCardAsset);
		}
	}

	return {
		BOOKMARK_TYPE : BOOKMARK_TYPE,
		initialise : initialise,
		populate : populate,
		autoPlayNextPopulate : autoPlayNextPopulate,
		startOverPlayback : startOverPlayback,
		resizeMlt : resizeMlt,
		setMltHeight : setMltHeight,
		resizeInfoCard : resizeInfoCard,
		resizeVideoControls : resizeVideoControls,
		getCardImgContainerEl : getCardImgContainerEl,
		getMetaInfoContainerEl : getMetaInfoContainerEl,
		getPlayerContainerEl : getPlayerContainerEl,
		deactivate : deactivate,
		deactivatePlayer : deactivatePlayer,
		reactivatePlayer : reactivatePlayer,
		showPlayer : showPlayer,
		hidePlayer : hidePlayer,
		showVideoControls : showVideoControls,
		hideVideoControls : hideVideoControls,
		toggleFullscreenControl : toggleFullscreenControl,
		movePlayerIntoView : movePlayerIntoView,
		movePlayerOutOfView : movePlayerOutOfView,
		intialisePurchaseWorkFlow : intialisePurchaseWorkFlow,
		updateCtab : updateCtab,
		getVideoControls : getVideoControls,
		deactivateDialogButtons : deactivateDialogButtons,
		activateDialogButtons : activateDialogButtons,
		getCurrentBTVEventItem : getCurrentBTVEventItem,
		setCurrentlyPlaying : setCurrentlyPlaying,
		getCurrentlyPlaying : getCurrentlyPlaying,
		setCurrentMedia : setCurrentMedia,
		reload : reload,
		setBlocked : setBlocked,
		getPlayer : getPlayer,
		multiplePlayableOptionsCallback : multiplePlayableOptionsCallback,
		registerRecentlyWatched : registerRecentlyWatched,
		ASSET_STATE : ASSET_STATE,
		setAssetState : setAssetState,
		adjustMediaCardOnState : adjustMediaCardOnState,
		setImageOpacity : setImageOpacity,
		hideMediaButtons : hideMediaButtons,
		setOrDeleteBookmark : setOrDeleteBookmark,
		deleteBookmark : deleteBookmark,
		activateButtonOverlay : activateButtonOverlay,
		playListener : playListener,
		getNextItemInMlt : getNextItemInMlt,
		getSubtitleState : getSubtitleState,
		showMlt : showMlt,
		hideMlt : hideMlt,
		updateMlt : updateMlt,
		getMoreLikeThisItems : getMoreLikeThisItems,
		stopTrailer: stopTrailer,
		playTrailer: playTrailer,
		updateScroller: updateScroller
	};

}());
