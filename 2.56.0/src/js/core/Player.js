/*global Nice264Analytics:true*/
var $U = $U || {};
$U.core = $U.core || {};

/**
 * Player configuration API
 * @class $U.core.Player
 * @singleton
 */
$U.core.Player = ( function() {

	var MAC_HIDE_CONTROLS_AFTER = 5000;

	var MAC_PLAYER_LEFT = 20;

	var MAC_PLAYER_TOP = 80;

	var logger = $U.core.Logger.getLogger("$U.core.Player");

	var videoLoadedCalled = false;

	var recentlyWatchedTimeout;

	var isPlaying;

	var currentTime = 0;

	var currentDuration = 0;

	var macFullScreen = false;

	var _startOver;

	var PLAYER_STATE = {
		PLAYING : "PLAYING",
		STOPPED : "STOPPED",
		SEEKING : "SEEKING",
		WAITING : "WAITING",
		BUFFERING : "BUFFERING",
		PAUSED : "PAUSED",
		ERROR : "ERROR",
		UNKNOWN : "UNKNOWN"
	};

	var _playerState = PLAYER_STATE.UNKNOWN;

	function _handlePlayingState(){
		setIsPlaying(true);
		$U.mediaCard.MediaCardController.getVideoControls().setPaused(false);
	}

	function _handlePausedState(){
		setIsPlaying(false);
		$U.mediaCard.MediaCardController.getVideoControls().setPaused(true);
	}

	function _handleWaitingState(){
		//Player is waiting for content, not paused BUT not playing.
		setIsPlaying(true);
		$U.mediaCard.MediaCardController.getVideoControls().setPaused(false);
	}

	function _handleBufferingState(){
		//Spinner?
	}

	function _handleStoppedState(){
		setIsPlaying(false);
		$U.mediaCard.MediaCardController.getVideoControls().setPaused(true);
	}

	function _convertPlayerState(state) {

		state = state.toLowerCase();

        switch(state) {
        case "playing":
			_handlePlayingState();
            return PLAYER_STATE.PLAYING;
        case "buffering":
			_handleBufferingState();
            return PLAYER_STATE.BUFFERING;
        case "waiting":
			_handleWaitingState();
            return PLAYER_STATE.WAITING;
        case "stopped":
			_handleStoppedState();
            return PLAYER_STATE.STOPPED;
        case "paused":
			_handlePausedState();
            return  PLAYER_STATE.PAUSED;
        default:
            return  PLAYER_STATE.UNKNOWN;
        }
    }

	function setPlayerState(state, reason) {
		var stateMessage, newState = _convertPlayerState(state), buffered;

		_playerState = newState;

		if (logger) {
			if (!reason) {
				stateMessage = 'Player state set to: '+newState;
			} else {
				stateMessage = 'Player state set to: '+newState+" by: "+reason.toString();
			}
			logger.log(stateMessage);
		}
	}

	function getPlayerState() {
		return _playerState;
	}

	/**
	 * Checks to see whether the player is a plugin or not
	 * @return {boolean}
	 */
	var isPlatformPlugin = function() {
		var objectElements = document.getElementsByTagName("object");
		var i;

		for ( i = 0; i < objectElements.length; i = i + 1) {
			if (objectElements[i].drmAgent) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Add support for subtitles
	 */
	var deactivateSubTitle = function() {
		if (logger) {
			logger.log("Player", "deactivate subtitle");
		}
		var currentTrack = $U.core.Player.player.tracks.getActiveSubtitleTrack();
		$U.core.Player.player.tracks.deactivateTrack(currentTrack || null);
	};

	var activateSubTitle = function(language) {
		var i,
			tracks = $U.core.Player.player.tracks.getSubtitleTracks();

		if (logger) {
			logger.log("Player", "activate subtitle");
		}

		if (tracks && tracks.length) {
			if (language) {
				for (i = 0; i < tracks.length; i++) {
					if (tracks[i].language === language) {
						$U.core.Player.player.tracks.activateTrack(tracks[i]);
						break;
					}
				}
			} else {
				$U.core.Player.player.tracks.activateTrack(tracks[0]);
			}
		}
	};

	var _isSubTitleOverrideOn = function() {
		if (($U.mediaCard.MediaCardController.getSubtitleState() &&
			$U.mediaCard.MediaCardController.getSubtitleState().name ===
			$U.mediaCard.MediaCardPlayer.SUBTITLE_STATE.ON.name)) {
			if (logger) {
				logger.log("Player", "subtitle override = true");
			}
			return true;
		}
		if (logger) {
			logger.log("Player", "subtitle override = false");
		}
		return false;
	};

	var _isSubTitleOverrideOff = function() {
		if (($U.mediaCard.MediaCardController.getSubtitleState() &&
			$U.mediaCard.MediaCardController.getSubtitleState().name ===
			$U.mediaCard.MediaCardPlayer.SUBTITLE_STATE.OFF.name)) {
			return true;
		}
		return false;
	};

	var _checkIfSubTitleRequired = function() {
		$U.core.store.LocalStore.getItem("subtitles", function(itemJSON) {
			var item;
			if (itemJSON) {
				item = $N.apps.util.JSON.parse(itemJSON);
				if (item.on === true) {
					if (_isSubTitleOverrideOff()) {
						deactivateSubTitle();
					} else {
						activateSubTitle(item.language || null);
					}
				} else {
					if (_isSubTitleOverrideOn()) {
						activateSubTitle();
					} else {
						deactivateSubTitle();
					}
				}
			} else {
				if (_isSubTitleOverrideOn()) {
					activateSubTitle();
				} else {
					deactivateSubTitle();
				}
			}
		});
	};

	var _tracksChangedCallback = function() {
		_checkIfSubTitleRequired();
	};

	/**
	 * Continue with initialisation if video has loaded and Plugin OK
	 */
	var continueInitialisation = function() {
		if ($N.Config.TRACKS) {
			$U.core.Player.player.tracks.setTracksChangedCallback(_tracksChangedCallback);
		}
		$U.core.Player.player.setVideoPath($U.core.Configuration.VIDEO_PATH);
		$U.core.Player.player.setSOCUVideoPath($U.core.Configuration.SOCU_VIDEO_PATH);
	};

	var createGatewayContentMappers = function() {
		var gwrtspMapper = new $U.core.StarHubGWRTSPContentMapper();
		var gwMapper = new $U.core.StarHubGWContentMapper();
		return [gwrtspMapper, gwMapper];
	};

	var createOTTContentMappers = function() {
		var mapperArray = [],
			ottMapper = new $N.platform.output.OTTContentMapper(),
			gwMapper = new $N.platform.output.GWContentMapper(),
			trailerMapper = null;

		if ($U.core.TrailerContentMapper) {
			trailerMapper = new $U.core.TrailerContentMapper();
			mapperArray.push(trailerMapper);
		}
		mapperArray.push(ottMapper);
		mapperArray.push(gwMapper);
		return mapperArray;
	};

	/**
	 * Create an instance of the video player
	 * @param {Function} pluginStatusCallback callback to execute once the presence of the plugin has been determined.
	 */
	var createPlayer = function(pluginStatusCallback) {

		var noPlugin = function () {
			pluginStatusCallback(false);
		};

		var videoLoaded = function () {
			var pluginSecureStorageAgent;
			var videoElement = null;
			if (!videoLoadedCalled) {
				_setVideoLoaded(true);

				// Expose the pluginSecureStorageAgent on the window
				videoElement = document.getElementById("videoContainer").firstChild;
				pluginSecureStorageAgent = videoElement && videoElement.secureStorageAgent;
				if (pluginSecureStorageAgent) {
					window.pluginSecureStorageAgent = pluginSecureStorageAgent;
				}
				continueInitialisation();
				pluginStatusCallback(true);
			}
		};

		var plugins = null;
		var autoPlay = $U.core.Device.isAndroid() ? true : false;

		var playerConfig = {
			parent : document.getElementById("videoContainer"),
			videoLoadedCallback : videoLoaded,
			noPluginCallback : noPlugin,
			forceHTML : $U.core.Configuration.FORCE_HTML,
			attributes : {
				controls : true,
				autoPlay : autoPlay
			}
		};

		if ($U.core.Gateway.isGatewayAvailable()) {
			playerConfig.contentMappers = createGatewayContentMappers();
		} else {
			playerConfig.contentMappers = createOTTContentMappers();
		}

		if ($U.core.Configuration.SUPPORT_SUBTITLES && $U.core.Configuration.SUPPORT_SUBTITLES.SUPPORT()) {
			$N.Config.TRACKS = true;
		}

		if ($U.core.Configuration.NICE264_PLUGIN_ENABLED) {
			playerConfig.plugins = [{
				plugin : new Nice264Analytics(),
				name : $U.core.Configuration.NICE264_PLUGIN_CONFIG.PLUGIN_NAME,
				initParams : {
					service : $U.core.Configuration.NICE264_PLUGIN_CONFIG.SERVICE,
					system : $U.core.Configuration.NICE264_PLUGIN_CONFIG.SYSTEM,
					playInfo : {
						username : $U.core.Configuration.NICE264_PLUGIN_CONFIG.USERNAME,
						transaction : $U.core.Configuration.NICE264_PLUGIN_CONFIG.TRANSACTION
					}
				}
			}];
		}

		// This flag must be set to true if the operator would like to restrict the number of streams available per account
		if ($U.core.Configuration.MAXIMUM_STREAM_RESTRICTION) {
			playerConfig.sessionsEnabled = true;
		}

		$U.core.Player.player = new $N.platform.output.PlayoutManager(playerConfig);
		if ($U.core.Configuration.NPVR_ENABLED) {
			$U.core.Player.player.setHarmonicVideoPath($U.core.Configuration.LOCKER_CONFIG.HARMONIC_PATH);
		}

		if ($U.core.Configuration.VIDEO_ENCODER) {
			$N.Config.VIDEO_ENCODER = $U.core.Configuration.VIDEO_ENCODER;
		}

		if ($U.core.Device.isMac()) {
			macFix();
		}
	};

	// Fix for Mac fullscreen
	function macFix() {
		var videoWrapper;
		var videoContainer;
		var videoControls;
		var overlay;
		var left;
		var top;
		var macInactivityTimeout;

		if (logger) {
			logger.log("createPlayer", "mac plugin");
		}
		videoWrapper = document.getElementById("videoWrapper");
		videoContainer = document.getElementById("videoContainer");

		var fullscreenEvent = function() {

			if (document.webkitIsFullScreen || document.mozFullScreen) {
				if (logger) {
					logger.log("webkitfullscreenchange || mozFullScreen", "enter fullscreen");
				}
				// We do not want to manually position the video container in fullscreen so set values to 0
				$U.core.util.HtmlHelper.setLeft(videoWrapper, 0);
				$U.core.util.HtmlHelper.setTop(videoWrapper, 0);
				// Set the video container to be 100% height and width in fullscreen
				$U.core.util.HtmlHelper.setWidth(videoContainer, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
				$U.core.util.HtmlHelper.setHeight(videoContainer, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
				macFullScreen = true;
				$U.mediaCard.MediaCardController.toggleFullscreenControl(macFullScreen);

				// when going full screen grab the controls from their initial position and stick them in the video container
				videoContainer.appendChild(document.getElementById("videoControls"));
				// We want to centre the controls when in full screen so add this class
				$U.core.util.HtmlHelper.setClass(document.getElementById("videoControls"), "mc-video-controls-centre");

			} else {
				if (logger) {
					logger.log("webkitfullscreenchange", "exit fullscreen");
				}

				if (getIsPlaying()) {
					$U.core.util.HtmlHelper.setLeft(videoWrapper, MAC_PLAYER_LEFT);
					$U.core.View.setSuppressResize(false);
					$U.core.View.resizeHandler();
					$U.mediaCard.MediaCardController.showVideoControls();
				}

				macFullScreen = false;
				$U.core.util.HtmlHelper.setTop(videoWrapper, MAC_PLAYER_TOP);
				$U.mediaCard.MediaCardController.toggleFullscreenControl(macFullScreen);
				// when exiting full screen grab the controls from the video container and stick them back in their initial container
				document.getElementById("mediaContainer").appendChild(document.getElementById("videoControls"));
				// We want the controls to look the same prior to fullscreen so remove the class we added
				$U.core.util.HtmlHelper.removeClass(document.getElementById("videoControls"), "mc-video-controls-centre");

			}
		};

		var clickExitFullscreen = function() {
			if (logger) {
				logger.log("dblclick", "toggling fullscreen");
			}
			if (macFullScreen) {
				exitFullScreen();
			} else {
				fullscreen();
			}
		};

		var userActivity = function() {

			if (document.webkitIsFullScreen || document.mozFullScreen) {
				clearTimeout(macInactivityTimeout);
				macInactivityTimeout = setTimeout(function() {
					if (document.webkitIsFullScreen || document.mozFullScreen) {
						$U.mediaCard.MediaCardController.hideVideoControls();
					}
				}, MAC_HIDE_CONTROLS_AFTER);
				$U.mediaCard.MediaCardController.showVideoControls();
			}
		};

		document.addEventListener("webkitfullscreenchange", fullscreenEvent, false);
		document.addEventListener("mozfullscreenchange", fullscreenEvent, false);

		overlay = $U.core.util.DomEl.createDiv().setClassName("mc-plugin-media-overlay").attachTo(document.getElementById("videoContainer")).asElement();
		overlay.addEventListener("dblclick", clickExitFullscreen, false);
		overlay.addEventListener("mousemove", userActivity);
	}

	/**
	 * Attempts to set the video player full screen
	 * @param {HTMLElement} videoEl
	 */
	var fullscreen = function() {
		var video;
		var videoWrapper = document.getElementById("videoWrapper");
		var videoContainer = document.getElementById("videoContainer");

		if ($U.core.Device.isMacPlugin()) {
			try {
				if (videoContainer.requestFullscreen) {
					videoContainer.requestFullscreen();
				} else if (videoContainer.mozRequestFullScreen) {
					videoContainer.mozRequestFullScreen();
				} else if (videoContainer.webkitRequestFullscreen) {
					videoContainer.webkitRequestFullscreen();
				} else if (videoContainer.webkitEnterFullscreen) {
					videoContainer.webkitEnterFullscreen();
				}
			} catch (e) {
				// alert(e);
			}
			macFullScreen = true;
			$U.core.View.setSuppressResize(true);

		} else if ($U.core.Device.isMacPlayer()){
			// We do not want to manually position the video container in fullscreen so set values to 0
			$U.core.util.HtmlHelper.setLeft(videoWrapper, 0);
			$U.core.util.HtmlHelper.setTop(videoWrapper, 0);
			// Set the video container to be 100% height and width in fullscreen
			$U.core.util.HtmlHelper.setWidth(videoWrapper, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
			$U.core.util.HtmlHelper.setHeight(videoWrapper, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
			$U.core.util.HtmlHelper.setWidth(videoContainer, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
			$U.core.util.HtmlHelper.setHeight(videoContainer, 100, $U.core.util.HtmlHelper.UNIT_TYPE.PC);

			macFullScreen = true;
			$U.mediaCard.MediaCardController.toggleFullscreenControl(macFullScreen);

			// when going full screen grab the controls from their initial position and stick them in the video container
			videoContainer.appendChild(document.getElementById("videoControls"));
			// We want to centre the controls when in full screen so add this class
			$U.core.util.HtmlHelper.setClass(document.getElementById("videoControls"), "mc-video-controls-centre");

			$U.core.View.setSuppressResize(true);

		} else if (isPlatformPlugin()) {
			window.userAgent.fullScreen = true;
		} else {
			video = document.getElementById("videoContainer").getElementsByTagName("video")[0];
			try {
				if (video.requestFullscreen) {
					video.requestFullscreen();
				} else if (video.mozRequestFullScreen) {
					video.mozRequestFullScreen();
				} else if (video.webkitRequestFullscreen) {
					video.webkitRequestFullscreen();
				} else if (video.webkitEnterFullscreen) {
					video.webkitEnterFullscreen();
				}
			} catch (e) {
				// alert(e);
			}
		}
	};

	var exitFullScreen = function() {
		var video;
		var videoContainer = document.getElementById("videoContainer");
		var videoWrapper = document.getElementById("videoWrapper");

		if (logger) {
			logger.log("exitFullScreen", "exit fullscreen enter");
		}

		if ($U.core.Device.isMacPlugin()) {
			// Fix for Mac fullscreen
			macFullScreen = false;
			try {
				if (document.cancelFullscreen) {
					document.cancelFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				} else if (document.webkitExitFullScreen) {
					document.webkitExitFullScreen();
				}
			} catch (e) {
			}
			$U.core.View.setSuppressResize(false);

		} else if ($U.core.Device.isMacPlayer()) {

			if (getIsPlaying()) {
				$U.core.util.HtmlHelper.setLeft(videoWrapper, MAC_PLAYER_LEFT);
				$U.core.View.setSuppressResize(false);
				$U.core.View.resizeHandler();
				$U.mediaCard.MediaCardController.showVideoControls();
			}
			macFullScreen = false;
			$U.core.util.HtmlHelper.setTop(videoWrapper, MAC_PLAYER_TOP);
			$U.mediaCard.MediaCardController.toggleFullscreenControl(macFullScreen);
			// when exiting full screen grab the controls from the video container and stick them back in their initial container
			document.getElementById("mediaContainer").appendChild(document.getElementById("videoControls"));
			// We want the controls to look the same prior to fullscreen so remove the class we added
			$U.core.util.HtmlHelper.removeClass(document.getElementById("videoControls"), "mc-video-controls-centre");

		} else if (isPlatformPlugin()) {
			window.userAgent.fullScreen = false;
		} else {
			video = videoContainer.getElementsByTagName("video")[0];

			if (logger) {
				logger.log("exitFullScreen video element", video);
			}

			try {
				if (video.cancelFullscreen) {
					video.cancelFullscreen();
				} else if (video.mozCancelFullScreen) {
					video.mozCancelFullScreen();
				} else if (video.webkitCancelFullScreen) {
					video.webkitCancelFullScreen();
				} else if (video.webkitExitFullScreen) {
					video.webkitExitFullScreen();
				}
			} catch (e) {

			}
		}
	};

	/**
	 * Reports whether the player is in full screen or not
	 */
	var isFullScreen = function() {
		return window.userAgent.fullScreen;
	};

	/**
	 * Stops the player
	 */
	var stop = function() {
		if ($U.core.Gateway.isGatewayAvailable()) {
			$U.core.Gateway.stopTranscoding($U.core.Player.player.currentSrc || $U.core.Player.player.cachedSrc);
		}
		if ($U.core.Player.player.currentSrc) {
			$U.core.Player.player.stop();
			setPlayerState("stopped");
		}

		// Clear the register watch timeout if required (item is no longer being watched)
		window.clearTimeout(recentlyWatchedTimeout);
	};

	/**
	 * Starts playback of a given playable object
	 */
	var play = function(playObj, startOver) {

		var trailerContentMapper;

		if ($U.core.Gateway.isGatewayAvailable()) {
			return gatewayPlay(playObj, startOver);
		}

		_setIsStartOver(startOver);

		_bindEvents();

		switch (playObj.type) {
		case $U.core.mediaitem.MediaItemType.TRAILER:
			trailerContentMapper = new $U.core.TrailerContentMapper();
			$U.core.Player.player.playContent(playObj, null, trailerContentMapper);
			break;
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
			$U.core.Player.player.playContent(playObj.contentToPlay);
			break;
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
			if (startOver) {
				$U.core.Player.player.playContent(playObj.dataObject);
			} else if (playObj.isCatchUp && !playObj.isOnNow) {
				$U.core.Player.player.playContent(playObj.dataObject);
			} else if (playObj.inLocker && playObj.completed) {
				$U.core.Player.player.playContent(playObj.recordedObject);
			} else {
				$U.core.Player.player.playContent(playObj.contentToPlay);
			}
			break;
		case $U.core.mediaitem.MediaItemType.NPVR:
			$U.core.Player.player.playContent(playObj.contentToPlay);
			break;
		case $U.core.mediaitem.MediaItemType.VOD:
		case $U.core.mediaitem.MediaItemType.CATCHUP:
			if (playObj.contentToPlay.length === 1) {
				$U.core.Player.player.playContent(playObj.contentToPlay[0]);
			} else if (playObj.contentToPlay.length > 1) {
				$U.mediaCard.MediaCardPlayDialog.showPlayOptionsDialog(playObj.contentToPlay, playObj.title, $U.mediaCard.MediaCardController.multiplePlayableOptionsCallback);
			}
			break;
		}
	};

	/**
	 * Starts playback of a given playable object
	 */
	var gatewayPlay = function(playObj, startOver) {
		_bindEvents();

		switch (playObj.type) {
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
			$U.core.Player.player.playContent(playObj.contentToPlay, playObj.playbackPosition);
			if ($U.core.Device.isAndroid()) {
				window.videoAgent.controls = true;
			}
			break;
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
			if (startOver) {
				//treat as VOD for StarHub
				_playRTSP(playObj);
				//$U.core.Player.player.playContent(playObj.dataObject);
			} else if (playObj.isCatchUp && !playObj.isOnNow) {
				//treat as VOD for StarHub
				_playRTSP(playObj);
				//$U.core.Player.player.playContent(playObj.dataObject);
			} else if (playObj.inLocker && playObj.completed) {
				$U.core.Player.player.playContent(playObj.recordedObject);
			} else {
				$U.core.Player.player.playContent(playObj.contentToPlay);
			}
			if ($U.core.Device.isAndroid()) {
				window.videoAgent.controls = false;
			}
			break;
		case $U.core.mediaitem.MediaItemType.NPVR:
			$U.core.Player.player.playContent(playObj.contentToPlay);
			break;
		case $U.core.mediaitem.MediaItemType.TRAILER:
		case $U.core.mediaitem.MediaItemType.VOD:
		case $U.core.mediaitem.MediaItemType.CATCHUP:
			_playRTSP(playObj);
			break;
		}
	};

	var _playRTSP = function(playObj) {
		//Also used by BTVEvent StartOver and CatchUp
		// should use the channel.catchUpUri and event Id for the URIs
		//TODO: the fakeContent was added so that can play VOD as a stream from the gateway
		var fakeContent = {
			assetId : "c2e1b6c0-4177-4e62-beb4-86662050e0de",
			entitlement : "12177c8b-5cf3-46d7-ad35-0a00ea1bc645"
		};

		if (playObj.type === $U.core.mediaitem.MediaItemType.TRAILER) {
			fakeContent.assetId = playObj.id;
			fakeContent.entitlement = "";
		}

		//if (playObj.contentToPlay.length === 1) {
		if (logger) {
			logger.log("PLAY", "playing the content ------------------" + JSON.stringify(fakeContent));
		}
		if (playObj.fetchedInfo){
			$U.core.Player.player.playContent(playObj.fetchedInfo, playObj.playbackPosition);
		} else if (playObj.contentToPlay && playObj.type !== $U.core.mediaitem.MediaItemType.TRAILER) {
			$U.core.Player.player.playContent(playObj.contentToPlay[0], 0, fakeContent);
		} else {
			$U.core.Player.player.playContent(playObj, 0, fakeContent);
		}
		if ($U.core.Device.isAndroid()) {
			window.videoAgent.controls = true;
		}
		//} else if (playObj.contentToPlay.length > 1) {
		//	$U.mediaCard.MediaCardPlayDialog.showPlayOptionsDialog(playObj.contentToPlay, playObj.title, $U.mediaCard.MediaCardController.multiplePlayableOptionsCallback);
		//}
	};

	function _addEventHandler(eventName, eventHandler, eventSource) {
        var IS_IE = $U.core.Device.isIE10() || $U.core.Device.isIE11() || $U.core.Device.isIE9();
        if (typeof eventSource === 'undefined') {
            eventSource = $U.core.Player.player;
        }
        if (window.addEventListener && !IS_IE) {
			eventSource.addEventListener(eventName, eventHandler, false);
        } else {
			eventSource.attachEvent('on' + eventName, eventHandler);
        }
    }

	var _bindEvents = function() {
		/* D-03727 new videoElement events added - locking to desktop / browser plugin only */
		if ($U.core.Device.isDesktop()) {
			if (window.userAgent) {
				// NagraMediaElement handles IE / non-IE events for videoElement only.
				_addEventHandler("fullscreenchange", $U.mediaCard.MediaCardPlayerEvents.desktopFullScreenListener,window.userAgent);
			}

			// This has been moved to be registered AFTER the initial Playing event listener has exited in MediaCardPlayerEvents
			// playing - Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
			//$U.core.Player.player.addEventListener("playing", $U.mediaCard.MediaCardPlayerEvents.bufferingListener);

			// play	- Sent when playback of the media starts after having been paused; that is, when playback is resumed after a prior pause event.
			$U.core.Player.player.addEventListener("play", $U.mediaCard.MediaCardPlayerEvents.playListener);

			// seeking - Sent when a seek operation begins.
			$U.core.Player.player.addEventListener("seeking", $U.mediaCard.MediaCardPlayerEvents.seekingListener);

			// seeked - Sent when a seek operation completes.
			$U.core.Player.player.addEventListener("seeked", $U.mediaCard.MediaCardPlayerEvents.seekedListener);

			//loadstart	- Sent when loading of the media begins
			$U.core.Player.player.addEventListener("loadstart", $U.mediaCard.MediaCardPlayerEvents.loadstartListener);

			// loadeddata - The first frame of the media has finished loading.
			$U.core.Player.player.addEventListener("loadeddata", $U.mediaCard.MediaCardPlayerEvents.loadeddataListener);

			// waiting - Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).
			$U.core.Player.player.addEventListener("waiting", $U.mediaCard.MediaCardPlayerEvents.waitingListener);

			// abort - Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.
			$U.core.Player.player.addEventListener("abort", $U.mediaCard.MediaCardPlayerEvents.abortListener);

			// progress - Sent periodically to inform interested parties of progress downloading the media.
			// Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.
			$U.core.Player.player.addEventListener("progress", $U.mediaCard.MediaCardPlayerEvents.progressListener);

			// emptied - The media has become empty; for example, this event is sent if the media has already been loaded
			// (or partially loaded), and the load() method is called to reload it.
			$U.core.Player.player.addEventListener("emptied", $U.mediaCard.MediaCardPlayerEvents.emptiedListener);

			//Not presently supported by NMPBP
			//stalled - Sent when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
			//$U.core.Player.player.addEventListener("stalled", $U.mediaCard.MediaCardPlayerEvents.stalledListener);
			//suspend - Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.
			//$U.core.Player.player.addEventListener("suspend", $U.mediaCard.MediaCardPlayerEvents.suspendListener);

			// durationchange could be used to set the seekable range / handle progress bar initialisation
			// durationchange - The metadata has loaded or changed, indicating a change in duration of the media.
			// This is sent, for example, when the media has loaded enough that the duration is known.
			// $U.core.Player.player.addEventListener("durationchange", $U.mediaCard.MediaCardPlayerEvents.durationchangeListener);
		}

		// Add playing event listener. We add when user clicks play and then it removes itself when fired to prevent
		// repeatedly firing when buffering etc.

		$U.core.Player.player.addEventListener("loadedmetadata", $U.mediaCard.MediaCardPlayerEvents.loadedmetadataListener);
		$U.core.Player.player.addEventListener("canplay", $U.mediaCard.MediaCardPlayerEvents.canplayListener);
		$U.core.Player.player.addEventListener("canplaythrough", $U.mediaCard.MediaCardPlayerEvents.canplaythroughListener);

		// playing - Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
		$U.core.Player.player.addEventListener("playing", $U.mediaCard.MediaCardPlayerEvents.playingListener);
		// Add timeupdate which is responsible for updating the seek bar on the video controls
		$U.core.Player.player.addEventListener("timeupdate", $U.mediaCard.MediaCardPlayerEvents.updateProgress);
		// Attach error event listener this will help us display useful error feedback to the user
		$U.core.Player.player.addEventListener("error", $U.mediaCard.MediaCardPlayerEvents.errorListener);
		// Add webkitEndFullScreen listener so that when iPhone exists full screen we can attach a particular behaviour
		$U.core.Player.player.addEventListener("webkitendfullscreen", $U.mediaCard.MediaCardPlayerEvents.exitFullScreenListener);
		// Add endFullScreen listener so that when ANDROID exists full screen we can attach a particular behaviour
		$U.core.Player.player.addEventListener("endFullScreen", $U.mediaCard.MediaCardPlayerEvents.exitFullScreenListener);
		$U.core.Player.player.addEventListener("endfullscreen", $U.mediaCard.MediaCardPlayerEvents.exitFullScreenListener);

		// Attach errorChanged event listener this will help us display errors when the state of the GW changed
		if (window.networkAgent && window.networkAgent.addEventListener) {
			window.networkAgent.addEventListener("errorChanged", $U.mediaCard.MediaCardPlayerEvents.errorChangedListener);
		}
		// Ended event listener used to provide the user with a replay button
		$U.core.Player.player.addEventListener("ended", $U.mediaCard.MediaCardPlayerEvents.endedEventListener);
		// Event listener for the swipe in fullScreen video mode used to throw content to the mediaDevice
		if ($U.core.Gateway.isGatewayAvailable()) {
			$U.core.Player.player.addEventListener("flinged", function() { $U.core.Gateway.swipeToThrowGesture(); });
		}
		$U.core.Player.player.addEventListener("pause", $U.mediaCard.MediaCardPlayerEvents.pausedEventListener);
	};

	/**
	 * Sets a flag to tell us if the video is in a playing state or not
	 * @param {Boolean} playing
	 * @private
	 */
	var setIsPlaying = function(playing) {
		isPlaying = playing;
		if (isPlaying) {
			recentlyWatchedTimeout = window.setTimeout($U.mediaCard.MediaCardController.registerRecentlyWatched, $U.core.Configuration.RECENTLY_VIEWED.AFTER);
		}
	};

	var setCurrentTime = function(time) {
		if (time) {
			currentTime = time;
		}
	};

	var setDuration = function(duration) {
		currentDuration = duration;
	};

	var getDuration = function() {
		return currentDuration;
	};

	var getCurrentTime = function() {
		return currentTime;
	};

	/**
	 * Reports whether the player is in a playing state or not
	 * @return {Boolean} isPlaying
	 */
	var getIsPlaying = function() {
		return isPlaying;
	};

	var _setVideoLoaded = function(isLoaded) {
		videoLoadedCalled = isLoaded;
	};

	var getVideoLoaded = function() {
		return videoLoadedCalled;
	};

	var _setIsStartOver = function(startOver) {
		_startOver = startOver;
	};

	var getIsStartOver = function() {
		return _startOver;
	};

	return {
		createPlayer : createPlayer,
		isPlatformPlugin : isPlatformPlugin,
		fullscreen : fullscreen,
		exitFullScreen : exitFullScreen,
		isFullScreen : isFullScreen,
		stop : stop,
		play : play,
		getVideoLoaded : getVideoLoaded,
		continueInitialisation : continueInitialisation,
		getIsPlaying : getIsPlaying,
		getCurrentTime : getCurrentTime,
		setCurrentTime : setCurrentTime,
		setDuration : setDuration,
		getDuration : getDuration,
		activateSubTitle : activateSubTitle,
		deactivateSubTitle : deactivateSubTitle,
		getIsStartOver : getIsStartOver,
		getPlayerState : getPlayerState,
		setPlayerState : setPlayerState,
		PLAYER_STATE : PLAYER_STATE
	};
}());
