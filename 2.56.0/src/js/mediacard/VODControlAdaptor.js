/**
 * VODControlAdaptor is responsible for passing messages between $U.mediaCard.VideoControls and
 * the VOD player.
 * @class $U.mediaCard.VODControlAdaptor
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.VODControlAdaptor = ( function() {

	var logger = $U.core.Logger.getLogger("VODControlAdaptor");
	//true if we want to show a progressbar on the controller
	var SHOW_PROGRESS = true;
	//true if we want to show a time indicator on the controller
	var SHOW_TIME = true;
	//true if we want to show a time remaining indicator on the controller
	var SHOW_REMAINING = true;
	/**
	 * Creates an array of buttons to display on the controller
	 * The order they are added to the array is the order they get shown on the controller
	 * @param {Object} button the list of available buttons, passed from $U.mediaCard.VideoControls
	 * @return {Array} the array of buttons
	 */
	var getButtons = function(button) {
		var buttonArray = [];

		//buttonArray.push(button.SKIPBACK);
		//buttonArray.push(button.RWND);
		buttonArray.push(button.PAUSE);
		//buttonArray.push(button.FFWD);
		//buttonArray.push(button.SKIPFWD);
		// buttonArray.push(button.EXITFULLSCREEN);
		buttonArray.push(button.FULLSCREEN);

		return buttonArray;
	};

	/**
	 * Called by the Player this is used to send back to the controller some progress information.
	 * In this case it updates the time and progressbar
	 */
	var updateProgress = function() {
		var currentTime = Math.round($U.core.Player.player.currentTime);
		var duration = Math.round($U.core.Player.player.duration);
		var timeLeft = duration - currentTime;
		var percent = (currentTime / duration) * 100;
		var controls = $U.mediaCard.MediaCardController.getVideoControls();

		if (controls) {
			controls.updateProgressBar(percent);
			if (SHOW_TIME) {
				controls.updateTimeField($U.core.util.Formatter.formatSecondsToDigitalClock(currentTime));
			}
			if (SHOW_REMAINING) {
				controls.updateRemainingTimeField($U.core.util.Formatter.formatSecondsToDigitalClock(timeLeft));
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
	 * Pauses the item currently loaded in the player
	 */
	var pause = function() {
		$U.core.Player.player.pause();
	};

	/**
	 * fastForwards the item currently loaded in the player
	 */
	var fastForward = function() {
		$U.core.Player.player.fastForward();
	};

	/**
	 * Skips the play Forwards by 20 seconds for the item currently loaded in the player
	 */
	var skipForward = function() {
		$U.core.Player.player.trickplay.skip(20);
	};

	/**
	 * Skips the play Backwards by 20 seconds for the item currently loaded in the player
	 */
	var skipBackward = function() {
		$U.core.Player.player.trickplay.skip(-20);
	};

	/**
	 * rewinds the item currently loaded in the player
	 */
	var rewind = function() {
		$U.core.Player.player.rewind();
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
	 * Handles the click on the progressbar
	 * @param {Number} percent the distance (in percent) along the progressbar gutter the user clicked
	 */
	var progressBarClickedAt = function(percent) {
		var newPos = $U.core.Player.player.duration * percent / 100;	
		$U.core.Player.player.currentTime = newPos;
		updateProgress();
	};

	return {
		getButtons : getButtons,
		updateProgress : updateProgress,
		play : play,
		pause : pause,
		fastForward : fastForward,
		skipForward : skipForward,
		rewind : rewind,
		skipBackward : skipBackward,
		fullscreen : fullscreen,
		exitFullscreen : exitFullscreen,
		progressBarClickedAt : progressBarClickedAt,
		SHOW_TIME : SHOW_TIME,
		SHOW_PROGRESS : SHOW_PROGRESS,
		SHOW_REMAINING : SHOW_REMAINING
	};

}());
