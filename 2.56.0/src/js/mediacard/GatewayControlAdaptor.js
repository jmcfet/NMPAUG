/**
 * GatewayControlAdaptor is responsible for passing messages between $U.mediaCard.VideoControls and
 * the content currently playing on the Gateway.
 * @class $U.mediaCard.GatewayControlAdaptor
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.GatewayControlAdaptor = ( function() {

	var logger = $U.core.Logger.getLogger("GatewayControlAdaptor");
	//true if we want to show a progressbar on the controller
	var SHOW_PROGRESS = true;
	//true if we want to show a time indicator on the controller
	var SHOW_TIME = true;
	//true if we want to show a time remaining indicator on the controller
	var SHOW_REMAINING = true;

	var fetchTimeout = null;

	var playSpeeds = ['-64','-32','-16','-8','-4','1','4','8','16','32','64'];
	var currentSpeed = '1';
	var currentSpeedPos = null;

	var position;
	/**
	 * Creates an array of buttons to display on the controller
	 * The order they are added to the array is the order they get shown on the controller
	 * @param {Object} button the list of available buttons, passed from $U.mediaCard.VideoControls
	 * @return {Array} the array of buttons
	 */
	var getButtons = function(button) {
		var buttonArray = [];

		//buttonArray.push(button.SKIPBACK);
		buttonArray.push(button.RWND);
		buttonArray.push(button.PAUSE);
		buttonArray.push(button.STOP);
		buttonArray.push(button.FFWD);
		//buttonArray.push(button.SKIPFWD);

		return buttonArray;
	};

	/**
	 * Called by the Player this is used to send back to the controller some progress information.
	 * In this case it updates the time and progressbar
	 * If there is no time data then then progressbar and times get hidden
	 */
	var updateProgress = function(data) {
		//console.log("Device Control : " + JSON.stringify(data));

		var percent = 0;
		var controls = $U.mediaCard.MediaCardController.getVideoControls();
		var timeLeft = 0;
		position = data.playbackPosition;

		if (data.type !== $U.core.mediaitem.MediaItemType.BTVEVENT) {
			//show everything
			percent = (position / data.durationInSeconds) * 100;
			timeLeft = data.durationInSeconds - position;

			if (controls) {
				//controls.setPaused($U.core.Player.player.paused);
				//might need some logic here for the BTV/VOD cases?
				if (SHOW_PROGRESS) {
					controls.updateProgressBar(percent);
					controls.showProgressBar();
				}
				if (SHOW_TIME) {
					controls.updateTimeField($U.core.util.Formatter.formatSecondsToDigitalClock(position));
					controls.showTimeField();
				}
				if (SHOW_REMAINING) {
					controls.updateRemainingTimeField($U.core.util.Formatter.formatSecondsToDigitalClock(timeLeft));
					controls.showRemainingTimeField();
				}
				controls.show();
			}
		} else {
			//don't have any time info so hide them
			if (controls) {
				if (SHOW_PROGRESS) {
					controls.hideProgressBar();
				}
				if (SHOW_TIME) {
					controls.hideTimeField();
				}
				if (SHOW_REMAINING) {
					controls.hideRemainingTimeField();
				}

			}
		}

	};

	var playCallback = function(data) {
		//console.log("Device Control : " + JSON.stringify(data));
	};

	/**
	 * Plays the item currently loaded in the player
	 */
	var play = function() {
		currentSpeed = '1';
		var options = {
			'Speed': currentSpeed
		};
		$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.PLAY, playCallback, options);
	};

	/**
	 * Pauses the item currently loaded in the player
	 */
	var pause = function() {
		currentSpeed = '1';
		var options = {
			'Speed': currentSpeed
		};
		$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.PAUSE, playCallback, options);
	};

	/**
	 * Stops the item currently loaded in the player
	 */
	var stop = function() {
		var options = {};
		$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.STOP, function() {
			$U.core.Gateway.setThrownItem();
			$U.core.Gateway.clearNowPlayingItems();
			$U.core.LifecycleHandler.unregisterListener($U.mediaCard.MediaCardPlayerEvents.gatewayFetchContentListener);
			$U.mediaCard.MediaCardController.reload();
		}, options);

	};

	/**
	 * rewind the item currently loaded in the player
	 */
	var rewind = function() {
		var options = {};
		currentSpeedPos = playSpeeds.indexOf(currentSpeed);
		if(currentSpeedPos !== 0) {
			currentSpeed = playSpeeds[currentSpeedPos-1];
			options.Speed = currentSpeed;
		} else {
			var restartLoop = playSpeeds.indexOf('1');
			currentSpeed = playSpeeds[restartLoop-1];
			options.Speed = currentSpeed;
		}
		$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.PLAY, playCallback, options);
	};

	/**
	 * fastForward the item currently loaded in the player
	 */
	var fastForward = function() {
		var options = {};
		currentSpeedPos = playSpeeds.indexOf(currentSpeed);
		if(currentSpeedPos !== playSpeeds.length -1) {
			currentSpeed = playSpeeds[currentSpeedPos+1];
			options.Speed = currentSpeed;
		} else {
			var restartLoop = playSpeeds.indexOf('1');
			currentSpeed = playSpeeds[restartLoop+1];
			options.Speed = currentSpeed;
		}
		$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.PLAY, playCallback, options);
	};

	/**
	 * Handles the click on the progressbar
	 * @param {Number} percent the distance (in percent) along the progressbar gutter the user clicked
	 */
	var progressBarClickedAt = function(percent) {
		var controls = $U.mediaCard.MediaCardController.getVideoControls();
		var mediaItem = $U.mediaCard.MediaCardController.getCurrentlyPlaying();
		var newPos = mediaItem.durationInSeconds * percent / 100;
		var options = {
			Unit : "REL_TIME",
			Target : $U.core.Gateway.msToTime(parseInt(newPos, 10) * 1000)
		};
		controls.updateProgressBar(percent);
		$N.services.gateway.dlna.MediaDevice.controlDevice($N.services.gateway.dlna.MediaDevice.PlayStates.SEEK, playCallback, options);

	};

	var getCurrentPosition = function() {
		var pos = 0;
		if (position && !isNaN(position)) {
			pos = position;
		}
		return pos;
	};

	var resetSpeed = function() {
		currentSpeed = '1';
	};

	return {
		getButtons : getButtons,
		updateProgress : updateProgress,
		play : play,
		pause : pause,
		stop : stop,
		rewind : rewind,
		fastForward : fastForward,
		progressBarClickedAt : progressBarClickedAt,
		SHOW_TIME : SHOW_TIME,
		SHOW_PROGRESS : SHOW_PROGRESS,
		SHOW_REMAINING : SHOW_REMAINING,
		getCurrentPosition : getCurrentPosition,
		resetSpeed : resetSpeed
	};

}());
