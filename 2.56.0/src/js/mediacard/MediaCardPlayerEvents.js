/**
 * Responsible for adding all events to the media cards player
 * @class $U.mediaCard.MediaCardPlayerEvents
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardPlayerEvents = ( function() {

	var PLAYBACK_ERROR_TITLE_KEY = "txtPlaybackError";
	var PLAYBACK_ERROR_INVALID_LICENSE_KEY = "txtPlaybackErrorInvalidLicense";
	var PLAYBACK_ERROR_LICENSE_EXPIRED_KEY = "txtPlaybackErrorLicenseExpired";
	var PLAYBACK_ERROR_GENERIC_KEY = "txtPlaybackErrorGeneric";
	var PLAYBACK_ERROR_MAX_DEVICES = "txtPlaybackErrorMaxDevices";
	var PLAYBACK_ERROR_SESSION_LIMIT_KEY = "txtPlaybackSessionLimitReached";
	var PLAYBACK_ERROR_SESSION_SP_LIMIT_KEY = "txtPlaybackSessionSPLimitReached";
	var BOOKMARK_PLAYBACK_DELAY = 1500;

	var logger = $U.core.Logger.getLogger("MediaCardPlayerEvents");
	// Short hand for MediaCardController
	var controller = $U.mediaCard.MediaCardController;
	// Short hand for MediaCardTransitions
	var mediaTransitions = $U.mediaCard.MediaCardTransitions;

	var isBlocked = false;

	var __CHECK_INTERVAL = 1000;
	// ms for playhead change checking
	var __nagraTimer, __checkPlayback;

	/**
	 * Adds playing event listener, if we are using the plugin we move it from -9999px left into view
	 * or if we are using native video tag then add native controls.
	 */
	function playingListener() {
		var currentlyPlaying = controller.getCurrentlyPlaying();
		if (logger) {
			logger.log("playingListener", "playingListener event enter");
		}

		$U.core.Player.setPlayerState("playing", "Player triggered initial play...");
		//Store the duration
		$U.core.Player.setDuration($U.core.Player.player.duration);
		//deactivate parental controls and settings
		controller.deactivateDialogButtons();

		if (currentlyPlaying.type === $U.core.mediaitem.MediaItemType.TRAILER) {
			controller.updateCtab();
		}

		// remove the controls at this point, if on GW and Live
		if ($U.core.Gateway.isGatewayAvailable() && $U.core.Device.isAndroid() && currentlyPlaying.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			$U.core.Player.player.controls = false;
		} else {
			$U.core.Player.player.controls = true;
		}

		//user has clicked play so fade image out and video in
		mediaTransitions.initPlayerTransition(mediaTransitions.TRANSITION_STATE.START);

		// Remove this event listener to prevent it firing multipe times
		$U.core.Player.player.removeEventListener("playing", playingListener);

		//Register a new one for buffering during playback
		if ($U.core.Device.isDesktop()) {
			// playing -Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
			$U.core.Player.player.addEventListener("playing", $U.mediaCard.MediaCardPlayerEvents.bufferingListener);
		}
	}

	/**
	 * Fires when the current play list has ended
	 */
	function endedEventListener() {
		if (logger) {
			logger.log("endedEventListener", "video has ended");
		}
		$U.core.Player.setPlayerState("stopped", "Player reached the end of content.");
		// SetTimeout required for iOS player.ended event
		setTimeout(function() {
			if ($U.core.Player.player.ended) {

				if (logger) {
					logger.log("endedEventListener", "video has ended and current time is equal to duration " + $U.core.Player.player.currentTime + "==" + $U.core.Player.player.duration);
				}

				// remove the controls at this point
				// $U.core.Player.player.controls = false;
				controller.updateCtab();
				//reactivate the parental and settings buttons
				controller.activateDialogButtons();

				if ((controller.getCurrentlyPlaying().type === $U.core.mediaitem.MediaItemType.VOD) && (!controller.getCurrentlyPlaying().isAssetPurchased && !controller.getCurrentlyPlaying().isAssetSubscribed)) {
					mediaTransitions.initPlayerTransition(mediaTransitions.TRANSITION_STATE.END_UNAVAILABLE);
				} else {
					// video has ended so return media card to pre play state
					mediaTransitions.initPlayerTransition(mediaTransitions.TRANSITION_STATE.END);
				}

				if (controller.getCurrentlyPlaying().type !== $U.core.mediaitem.MediaItemType.TRAILER) {
					// As we have reached the end of the video we should delete the book mark
					$U.mediaCard.MediaCardController.deleteBookmark(controller.getCurrentlyPlaying(), function() {
						controller.getCurrentlyPlaying().bookmarkPosition = 0;
					});
				}
			}
		}, 100);
		// Remove this event listener to prevent it firing multiple times
		$U.core.Player.player.removeEventListener("ended", endedEventListener);
	}

	function _setOrDeleteBookmarkCallback() {
		if (logger) {
			logger.log("_setOrDeleteBookmarkCallback", "_setOrDeleteBookmarkCallback enter");
		}
		$U.mediaCard.MediaCardController.activateButtonOverlay();
	}

	/**
	 * Fires when an event becomes blocked
	 */
	function blockedListener() {

		if (logger) {
			logger.log("blockedListener", "blockedListener event enter");
		}
		isBlocked = true;
		// Set the media card to blocked and deactivates play back
		controller.setBlocked();
		// video has ended so return media card to pre play state
		// mediaTransitions.initPlayerTransition(mediaTransitions.TRANSITION_STATE.BLOCKED);

		// remove the controls at this point
		// $U.core.Player.player.controls = false;
	}

	/**
	 * Gets the error dialog to display when an asset fires an error
	 */
	function getErrorDialog(title, message) {
		return $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(title), $U.core.util.StringHelper.getString(message));
	}

	/**
	 * Callback function for the error dialog
	 */
	function getErrorDialogHandler(errCode) {
		return function() {
			$U.core.View.hideDialog();
		};
	}

	/**
	 * Error event listener which fires when there is a problem with playback from the Gateway box
	 * Handles http errors generated by the box itself
	 */
	function errorChangedListener() {
		if ($U.core.Player.player.httpError) {
			var err = $U.core.Player.player.httpError;
			var currPlaying = controller.getCurrentlyPlaying();
			controller.deactivatePlayer();
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, err.code + " : " + err.description), getErrorDialogHandler());

			if (currPlaying.type === $U.core.mediaitem.MediaItemType.TRAILER) {
				controller.populate(currPlaying.parentItem);
				controller.setCurrentMedia(currPlaying.parentItem);
				window.setTimeout(function() {
					controller.updateCtab();
				}, 250);
			} else {
				controller.reload(true);
			}
		}
	}

	/**
	 * Error event listener which fires when there is a problem with play back
	 * Handles license errors as well as generic errors
	 */
	function errorListener(err) {

		if (logger) {
			logger.log("errorListener", "errorListener event enter");
		}

		var errCode = err ? err.code : undefined;
		// Error dialog Event handler
		var errorDialogHandler = getErrorDialogHandler();
		// Possible list of errors from $N playout manager
		var licenseErrors = $U.core.Player.player.drm.ErrorType;
		// Possible list of errors from the play (session management)
		var sessionErrors = $U.core.Player.player.ERROR_CODES;
		//check for valid PVR item
		var validCheck;
		var currentMediaItem = $U.mediaCard.MediaCardController.getCurrentlyPlaying();

		// If the asset is playing then deactivate playback as we cannot show a dialog over a playing asset
		if ($U.core.Player.getIsPlaying()) {
			$U.mediaCard.MediaCardController.deactivatePlayer();
		}

		// Switch on the error code
		switch (errCode) {
		case licenseErrors.LICENSE_EXPIRED :
			// Generally fires while video is playing back and license expires
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_LICENSE_EXPIRED_KEY), errorDialogHandler);
			// Refresh the ACL to update that the content is no longer valid
			$N.services.sdp.AcquiredContent.refresh();
			break;
		case licenseErrors.INVALID_LICENSE_DATA :
			// Generally fires when a user tries to initiate play back and the license has expired
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_INVALID_LICENSE_KEY), errorDialogHandler);
			$U.mediaCard.MediaCardController.activateButtonOverlay();
			// Refresh the ACL to update that the content is no longer valid
			$N.services.sdp.AcquiredContent.refresh();
			break;
		case licenseErrors.ENTITLEMENT_RETRIEVAL_FAILED:
		case sessionErrors.UNKNOWN_ERROR:
		case licenseErrors.SESSION_FAILED:
			// Generally fires in gateway use cases but message is generic
			validCheck = function(isThere) {
				if (isThere) {
					$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_GENERIC_KEY), errorDialogHandler);
					$U.mediaCard.MediaCardController.activateButtonOverlay();
				} else {
					$U.core.View.goBack();
				}
			};
			if (currentMediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING) {
				$U.core.Gateway.isPVRItemValid(currentMediaItem, validCheck);
			} else {
				validCheck(true);
			}

			break;
		case sessionErrors.MAX_DEVICES_REACHED:
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_MAX_DEVICES), errorDialogHandler);
			$U.mediaCard.MediaCardController.activateButtonOverlay();
			break;
		case sessionErrors.SESSION_LIMIT_REACHED:
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_SESSION_LIMIT_KEY), errorDialogHandler);
			$U.mediaCard.MediaCardController.activateButtonOverlay();
			break;
		case sessionErrors.SP_SESSION_LIMIT_REACHED:
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_SESSION_SP_LIMIT_KEY), errorDialogHandler);
			$U.mediaCard.MediaCardController.activateButtonOverlay();
			break;
		default:
			// Fallback incase no error is provided
			$U.core.View.showDialog(getErrorDialog(PLAYBACK_ERROR_TITLE_KEY, PLAYBACK_ERROR_GENERIC_KEY), errorDialogHandler);
			$U.mediaCard.MediaCardController.activateButtonOverlay();
			break;
		}
		$U.core.Player.player.removeEventListener("error", errorListener);

	}

	/**
	 * Function that takes a channel, gathers the currently scheduled programme then updates the
	 * mediacard display if it is a new programme (live stream mediacard updating).
	 */
	function whatsOnNowListener() {

		if (logger) {
			logger.log("whatsOnNowListener", "whatsOnNowListener event enter");
		}

		var currentlyDisplayed = controller.getCurrentlyPlaying();

		function go(onNow) {
			var isCurrentlyPlaying = $U.core.Player.getIsPlaying();
			var isAllowed = $U.core.parentalcontrols.ParentalControls.isRatingPermitted(onNow.rating);
			var programHasChanged = (currentlyDisplayed.id !== onNow.id) ? true : false;

			if (programHasChanged) {
				controller.updateScroller(onNow);
				if (!isAllowed) {
					blockedListener();
				} else {
					controller.populate(onNow);
					controller.showVideoControls();
				}
			} else {
				if (isAllowed) {
					$U.mediaCard.MediaCardController.activateButtonOverlay();
				}
			}
			// register the listener again as it unregisters itself when called
			$U.core.LifecycleHandler.registerListener($U.mediaCard.MediaCardPlayerEvents.whatsOnNowListener, $U.core.Configuration.LIFECYCLE_TIMINGS.WHATSON);
		}


		$U.epg.dataprovider.BTVDataProvider.getInstance().fetchCurrentEventForChannel(currentlyDisplayed.channel, go);
	}

	/**
	 * Event listener for when the player exits full screen
	 * Only apply if using phone
	 * @param fromEnded - true if the video has finished false if the user manually causes fullscreen to exit
	 */
	function exitFullScreenListener() {
		var currentlyPlayingItem;
		var noTranscoding = true;

		if (logger) {
			logger.log("exitFullScreenListener", "exitFullScreenListener event enter");
		}

		var currentTime = $U.core.Device.isIOS() && $U.core.Device.isPhone() ? $U.core.Player.getCurrentTime() : $U.core.Player.player.currentTime;
		var duration = $U.core.Player.player.duration;

		if ($U.mediaCard.MediaCardController.getCurrentlyPlaying().type === $U.core.mediaitem.MediaItemType.TRAILER) {
			$U.mediaCard.MediaCardController.stopTrailer();
		} else {
			if (!$U.core.Device.isIOS3x()) {
				$U.mediaCard.MediaCardController.setOrDeleteBookmark(controller.getCurrentlyPlaying(), currentTime, duration, _setOrDeleteBookmarkCallback);
			}
		}

		if ($U.core.Gateway.isGatewayAvailable() && $U.core.Device.isHandHeld()) {
			//might not have sent a call to stop at this point
			$U.mediaCard.MediaCardController.deactivatePlayer();
			$U.mediaCard.MediaCardController.reactivatePlayer();
			currentlyPlayingItem = $U.mediaCard.MediaCardController.getCurrentlyPlaying();
			if (currentlyPlayingItem) {
				$U.mediaCard.MediaCardController.populate($U.mediaCard.MediaCardController.getCurrentlyPlaying(), noTranscoding);
			}
		}

		$U.core.Player.player.removeEventListener("endFullScreen", exitFullScreenListener);
		$U.core.Player.player.removeEventListener("endfullscreen", exitFullScreenListener);
	}

	/**
	 * Event listener for when the Desktop player exits full screen - is this consistent across platforms now?
	 * @param fromEnded - true if the video has finished false if the user manually causes fullscreen to exit
	 */

	function desktopFullScreenListener() {
		//Do we need to check for !PC and !Mobile? $U.core.Device.isWindows()
		if (!$U.core.Device.isWindows()) {
			return;
		}

		updateProgress();

		//This uses our internal "playing" state to try and resynchronise state between fullscreen player and windowed mode.
		//Presently an issue in NMP which doesn't register an event when clicking play/pause whilst buffering / seeking means we can become unsynchronised.

		//Workaround for NMP issue noted above.
		//The code below means if the user has toggled play/pause during a seek in full screen and then gone to windowed mode we reset the state and require them to re-apply the event.

		if (!$U.core.Player.getIsPlaying()) {
			$U.core.Player.player.pause();
		} else {
			$U.core.Player.player.play();
		}
	}

	function loadeddataListener() {
		$U.core.Player.setPlayerState("buffering", "Player has loaded data.");
	}

	function emptiedListener() {
		$U.core.Player.setPlayerState("stopped", "Player was asked to return to beginning of content or end of content reached.");
	}

	function seekingListener() {
		$U.core.Player.setPlayerState("buffering", "Player is seeking.");
		updateProgress();
	}

	function playListener() {
		$U.core.Player.setPlayerState("playing", "Player requested to play [playListener].");
	}

	function seekedListener() {
		$U.core.Player.setPlayerState("buffering", "Player has seeked.");
		updateProgress();
	}

	function _canPlayback() {
		/*
		 HAVE_NOTHING        0   No information is available about the media resource.
		 HAVE_METADATA       1   Enough of the media resource has been retrieved that the metadata attributes are initialized.  Seeking will no longer raise an exception.
		 HAVE_CURRENT_DATA   2   Data is available for the current playback position, but not enough to actually play more than one frame.
		 HAVE_FUTURE_DATA    3   Data for the current playback position as well as for at least a little bit of time into the future is available (in other words, at least two frames of video, for example).
		 HAVE_ENOUGH_DATA    4   Enough data is available—and the download rate is high enough—that the media can be played through to the end without interruption.
		 */
		return ($U.core.Player.player.readyState > 1 && !$U.core.Player.player.paused) ? true : false;
	}

	function bufferingListener() {
		//This is a playing event
		var __checkPlaybackTimeout = function() {
			clearTimeout(__checkPlayback);
			if (__nagraTimer === $U.core.Player.player.currentTime && !$U.core.Player.player.paused) {
				__nagraTimer = $U.core.Player.player.currentTime;
				$U.core.Player.setPlayerState("buffering", "Playhead not moving.");
			} else {
				__nagraTimer = $U.core.Player.player.currentTime;
				if ($U.core.Player.getPlayerState() === ($U.core.Player.PLAYER_STATE.BUFFERING || $U.core.Player.PLAYER_STATE.WAITING) && _canPlayback()) {
					$U.core.Player.setPlayerState("playing", "Player resumed after buffering.");
				}
			}
			__checkPlayback = setTimeout(__checkPlaybackTimeout, __CHECK_INTERVAL);
		};
		__checkPlayback = setTimeout(__checkPlaybackTimeout, __CHECK_INTERVAL);
		$U.core.Player.setPlayerState("playing", "Player resumed playing.");
	}

	function loadstartListener() {
		$U.core.Player.setPlayerState("buffering", "Player asset load start.");
	}

	function waitingListener() {
		$U.core.Player.setPlayerState("waiting", "Player is waiting for content.");
	}

	function abortListener() {
		$U.core.Player.setPlayerState("buffering", "Player was asked to reload content due to an abort.");
	}

	function progressListener() {
		//spinner / check bufferedDuration during progress?
	}

	function pausedEventListener() {
		if (logger) {
			logger.log("pausedEventListener", "paused event enter");
		}

		$U.core.Player.setPlayerState("paused", "Player was asked to pause");

		var currentlyPlaying = $U.mediaCard.MediaCardController.getCurrentlyPlaying();
		var controller = $U.mediaCard.MediaCardController;
		var currentTime = $U.core.Device.isIOS() && $U.core.Device.isPhone() ? $U.core.Player.getCurrentTime() : $U.core.Player.player.currentTime;
		var duration = $U.core.Player.player.duration;

		if (logger) {
			logger.log("pausedEventListener", "current time - " + currentTime + "Duration - " + duration);
		}

		if (currentlyPlaying.type === $U.core.mediaitem.MediaItemType.TRAILER) {
			controller.stopTrailer();
			controller.activateButtonOverlay();
		} else {
			if (currentTime === 0) {
				$U.core.Player.player.stop();
			}
			if (currentlyPlaying.type !== $U.core.mediaitem.MediaItemType.BTVEVENT) {
				controller.setOrDeleteBookmark(controller.getCurrentlyPlaying(), currentTime, duration, _setOrDeleteBookmarkCallback);
			}
		}
	}

	function _removeEventHandler(evname, evhandler, evsource) {
		var IS_IE = $U.core.Device.isIE10() || $U.core.Device.isIE11() || $U.core.Device.isIE9();

		if ( typeof evsource === 'undefined') {
			evsource = $U.core.Player.player;
		}

		if (window.addEventListener && !IS_IE) {
			evsource.addEventListener(evname, evhandler, false);
		} else {
			evsource.attachEvent('on' + evname, evhandler);
		}
	}

	/**
	 * Removes all event listeners that are attached in the
	 * @param {$U.core.mediaitem.MediaItem} mediaItem
	 */
	function deactivateListeners(mediaItem) {

		if (logger) {
			logger.log("deactivateListeners", "deactivateListeners enter");
		}
		// Cancel any transitions that maybe in flow as they are wrapped up in timeouts
		mediaTransitions.initPlayerTransition(mediaTransitions.TRANSITION_STATE.CANCEL);

		if ($U.core.Device.isDesktop()) {
			if (window.userAgent) {
				// NagraMediaElement handles IE / non-IE events for videoElement only.
				_removeEventHandler("fullscreenchange", $U.mediaCard.MediaCardPlayerEvents.desktopFullScreenListener, window.userAgent);
			}

			$U.core.Player.player.removeEventListener("play", playListener);
			$U.core.Player.player.removeEventListener("playing", bufferingListener);
			$U.core.Player.player.removeEventListener("seeking", seekingListener);
			$U.core.Player.player.removeEventListener("seeked", seekedListener);
			$U.core.Player.player.removeEventListener("loadstart", loadstartListener);
			$U.core.Player.player.removeEventListener("waiting", waitingListener);
			$U.core.Player.player.removeEventListener("abort", abortListener);
			$U.core.Player.player.removeEventListener("progress", progressListener);
			$U.core.Player.player.removeEventListener("emptied", emptiedListener);
			$U.core.Player.player.removeEventListener("loadeddata", loadeddataListener);

			//Not presently supported by NMPBP
			//$U.core.Player.player.removeEventListener("stalled", stalledListener);
			//$U.core.Player.player.removeEventListener("suspend", suspendListener);

			// durationchange could be used to set the seekable range / handle progress bar initialisation
			// $U.core.Player.player.removeEventListener("durationchange", durationchangeListener);
		}

		// This should remove itself when executed however remove it incase it fails to remove itself
		$U.core.Player.player.removeEventListener("playing", playingListener);

		// Remove the webkitendfullscreen listener
		$U.core.Player.player.removeEventListener("webkitendfullscreen", exitFullScreenListener);

		$U.core.Player.player.removeEventListener("endFullScreen", exitFullScreenListener);
		$U.core.Player.player.removeEventListener("endfullscreen", exitFullScreenListener);

		// Remove ended event listener
		$U.core.Player.player.removeEventListener("ended", endedEventListener);
		// Remove the error event listener
		$U.core.Player.player.removeEventListener("error", errorListener);
		// Remove the timeupdate event listener
		$U.core.Player.player.removeEventListener("timeupdate", updateProgress);

		$U.core.Player.player.removeEventListener("pause", pausedEventListener);

		$U.core.Player.player.removeEventListener("canplay", canplayListener);
		$U.core.Player.player.removeEventListener("canplaythrough", canplaythroughListener);
		$U.core.Player.player.removeEventListener("loadedmetadata", loadedmetadataListener);

		//Remove http error listener - gateway specific will not work on IE (needs attachEvent)
		if (window.networkAgent && window.networkAgent.removeEventListener) {
			window.networkAgent.removeEventListener("errorChanged", errorChangedListener);
		}

		if (window.userAgent && $U.core.Device.isDesktop()) {
			_removeEventHandler("fullscreenchange", desktopFullScreenListener, window.userAgent);
		}

		if ($U.core.Gateway.isGatewayAvailable()) {
			$U.core.LifecycleHandler.unregisterListener($U.mediaCard.MediaCardPlayerEvents.gatewayFetchContentListener);
		}
	}

	/**
	 * Function used when the time updates on playback or to keep track of time for the bookmarks
	 */
	function updateProgress() {
		// Update the controls
		controller.getPlayer().getControlAdaptor().updateProgress();
		// Store our own current time of the player because iPhone throws aways the current time before we need it
		if ($U.core.Device.isPhone() && $U.core.Device.isIOS() || ($U.core.Device.isIOS3x())) {
			$U.core.Player.setCurrentTime($U.core.Player.player.currentTime);
		}
	}

	function loadedmetadataListener() {
		if (logger) {
			logger.log("loaded metadata event");
		}
		$U.core.Player.player.removeEventListener("loadedmetadata", loadedmetadataListener);
	}

	function canplayListener() {
		if (logger) {
			logger.log("canplay event");
		}
		_setBookmarkSeekPosition();
		_setStartOverSeekPosition();

		$U.core.Player.player.removeEventListener("canplay", canplayListener);
	}

	function canplaythroughListener() {

		if (logger) {
			logger.log("canplaythrough event");
		}

		// As auto play is set to false, call play in the can play through listener
		$U.core.Player.player.play();

		$U.core.Player.player.removeEventListener("canplaythrough", canplaythroughListener);
	}

	function _setBookmarkSeekPosition() {
		var currentlyPlaying = controller.getCurrentlyPlaying();

		// If the bookmarkPosition is not 0
		if (currentlyPlaying.bookmarkPosition) {
			if (logger) {
				logger.log("playingListener", "setting position of playback " + currentlyPlaying.bookmarkPosition);
			}

			$U.core.Player.player.currentTime = currentlyPlaying.bookmarkPosition;
		}
	}

	function _setStartOverSeekPosition() {
		// Start over not supported by Android
		if ($U.core.Player.getIsStartOver() && !$U.core.Device.isAndroid()) {
			$U.core.Player.player.currentTime = $U.core.Player.player.seekable.start(0);
		}
	}

	/**
	 * Callback used by the fetch content listener, uses the data from the gateway to repopulate the media card and update the video controller
	 * @param {Object} data returned from the gateway
	 */
	function gatewayFetchContentCallback(gatewayItems) {
		var currentlyDisplayed = controller.getCurrentlyPlaying();
		var gatewayItem;
		var foundIndex = -1;
		var needRefresh = false;
		var refetch = true;
		var i;
		if (gatewayItems.length === 0) {
			controller.getVideoControls().hide();
		} else {
			//1 - check if same item is in gatewayItems
			for ( i = 0; i < gatewayItems.length; i++) {
				//check to see if the same item is playing
				if (currentlyDisplayed.id === gatewayItems[i].id) {
					foundIndex = i;
					i = gatewayItems.length;
				}
			}

			if (foundIndex < 0) {
				//2 - check if same channel is in gatewayItems
				for ( i = 0; i < gatewayItems.length; i++) {
					//check to see if the same channel is playing
					gatewayItem = gatewayItems[i];
					if (gatewayItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
						if (currentlyDisplayed.channel === gatewayItem.channel) {
							foundIndex = i;
							i = gatewayItems.length;
							needRefresh = true;
						}
					}
				}
			}

			if (foundIndex < 0) {
				foundIndex = 0;
				needRefresh = true;
			}

			gatewayItem = gatewayItems[foundIndex];
			if (!$U.core.parentalcontrols.ParentalControls.isRatingPermitted(gatewayItem.rating)) {
				blockedListener();
			} else if (needRefresh || isBlocked) {
				//controller.setCurrentlyPlaying(gatewayItem);
				isBlocked = false;
				controller.populate(gatewayItem);
				refetch = false;
			} else {
				controller.setCurrentMedia(gatewayItem);
			}
			if ($U.core.Gateway.nowPlayingWasThrown() && !isBlocked) {
				$U.core.Gateway.fetchNowPlayingPosition(function(position) {
					gatewayItem.playbackPosition = position;
					controller.getPlayer().getControlAdaptor().updateProgress(gatewayItem);
				});
			} else {
				controller.getVideoControls().hide();
			}
		}
		if (refetch) {
			$U.core.LifecycleHandler.registerListener($U.mediaCard.MediaCardPlayerEvents.gatewayFetchContentListener, $U.core.Configuration.LIFECYCLE_TIMINGS.FETCH_CONTENT);
		}
	}

	/**
	 * Used to keep the data fresh on the 'Now Playing' Mediacard
	 */
	function gatewayFetchContentListener() {
		$U.core.Gateway.fetchNowPlaying(gatewayFetchContentCallback);
	}

	return {
		whatsOnNowListener : whatsOnNowListener,
		playingListener : playingListener,
		playListener : playListener,
		endedEventListener : endedEventListener,
		deactivateListeners : deactivateListeners,
		updateProgress : updateProgress,
		errorChangedListener : errorChangedListener,
		errorListener : errorListener,
		exitFullScreenListener : exitFullScreenListener,
		gatewayFetchContentListener : gatewayFetchContentListener,
		pausedEventListener : pausedEventListener,
		seekingListener : seekingListener,
		seekedListener : seekedListener,
		loadedmetadataListener : loadedmetadataListener,
		canplayListener : canplayListener,
		canplaythroughListener : canplaythroughListener,
		desktopFullScreenListener : desktopFullScreenListener,
		loadstartListener : loadstartListener,
		waitingListener : waitingListener,
		abortListener : abortListener,
		progressListener : progressListener,
		bufferingListener : bufferingListener,
		emptiedListener : emptiedListener,
		loadeddataListener : loadeddataListener
	};

}());
