/**
 * BTVControlAdaptor is responsible for passing messages between $U.mediaCard.VideoControls and
 * the BTV player.
 * @class $U.mediaCard.BTVControlAdaptor
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.BTVControlAdaptor = ( function() {

	var logger = $U.core.Logger.getLogger("BTVControlAdaptor");

	//true if we want to show a progressbar on the controller
	var SHOW_PROGRESS = true;
	//true if we want to show a time indicator on the controller
	var SHOW_TIME = true;
	//true if we want to show a time remaining indicator on the controller
	var SHOW_REMAINING = false;

	var SHOW_BRING_TO_LIVE = true;

	/**
	 * Creates an array of buttons to display on the controller
	 * The order they are added to the array is the order they get shown on the controller
	 * @param {Object} button the list of available buttons, passed from $U.mediaCard.VideoControls
	 * @return {Array} the array of buttons
	 */
	var getButtons = function(button) {
		var buttonArray = [];

		buttonArray.push(button.PAUSE);
		// buttonArray.push(button.EXITFULLSCREEN);
		buttonArray.push(button.FULLSCREEN);

		return buttonArray;
	};

	/**
	 * Called by the Player this is used to send back to the controller some progress information.
	 * In this case it updates the time with how longs they user has been watching the current stream
	 */

	var updateProgress = function() {

		if ($U.core.Device.isDesktop()) {
			var currentTime = $U.core.Player.player.currentTime;
			var start = $U.core.Player.player.seekable.start(0);
			var end = $U.core.Player.player.seekable.end(0);
			var seekableTime = end - start;
			var percent = Math.ceil((currentTime - start) / (end - start) * 100);
			var controls = $U.mediaCard.MediaCardController.getVideoControls();
			var remainingTime = Math.ceil($U.core.Player.player.currentTime - $U.core.Player.player.seekable.end(0));

			if (controls) {
				controls.updateProgressBar(percent);
				if (SHOW_TIME) {
					if (remainingTime < 0) {
						controls.updateTimeField("-" + $U.core.util.Formatter.formatSecondsToDigitalClock(Math.abs(remainingTime)));
					}
				}

				if (SHOW_REMAINING) {
					controls.updateRemainingTimeField($U.core.util.Formatter.formatTime(new Date()));
				}
				
				if (SHOW_BRING_TO_LIVE) {
					controls.activateBringToLiveButton();
				}
			}
		}

	};

	/**
	 * Plays the item currently loaded in the player
	 */
	var play = function() {
		$U.core.Player.player.play();
	};

	/**
	 * Stops the item currently loaded in the player
	 */
	var stop = function() {
		$U.mediaCard.MediaCardController.deactivatePlayer();
		if ($U.core.Gateway.isGatewayAvailable()) {
			$U.mediaCard.MediaCardController.reload();
		} else {
			$U.mediaCard.MediaCardController.reactivatePlayer();
		}

	};

	/**
	 * puts the current player into fullscreen
	 */
	var fullscreen = function() {
		$U.core.Player.fullscreen();
	};

	/**
	 * exits the current player from fullscreen
	 */
	var exitFullscreen = function() {
		$U.core.Player.exitFullScreen();
	};

	/**
	 * Handles the click on the progress bar
	 * @param {Number} percent the distance (in percent) along the progress bar gutter the user clicked
	 */
	var progressBarClickedAt = function(percent) {
		if ($U.core.Device.isDesktop()) {

			var currentlyPaused = $U.core.Player.player.paused;
			var start = $U.core.Player.player.seekable.start(0);
			var end = $U.core.Player.player.seekable.end(0);
			var newPos = start + Math.ceil((end - start) * percent / 100);
			var controls = $U.mediaCard.MediaCardController.getVideoControls();

			$U.core.Player.player.currentTime = newPos;

			if (SHOW_BRING_TO_LIVE) {
				controls.activateBringToLiveButton();
			}
		}
	};

	/**
	 * Pauses the item currently loaded in the player
	 */
	var pause = function() {
		$U.core.Player.player.pause();
	};

	return {
		getButtons : getButtons,
		updateProgress : updateProgress,
		play : play,
		stop : stop,
		pause : pause,
		fullscreen : fullscreen,
		exitFullscreen : exitFullscreen,
		SHOW_TIME : SHOW_TIME,
		SHOW_PROGRESS : SHOW_PROGRESS,
		SHOW_REMAINING : SHOW_REMAINING,
		SHOW_BRING_TO_LIVE : SHOW_BRING_TO_LIVE,
		progressBarClickedAt : progressBarClickedAt
	};

}());
