/**
 * Responsible for fading out image overlay, fading in video player and any other effects
 * @class $U.mediaCard.MediaCardTransitions
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardTransitions = ( function() {

	var TRANSITION_STATE = {
		START : {
			name : "start"
		},
		END : {
			name : "end"
		},
		BLOCKED : {
			name : "blocked"
		},
		END_UNAVAILABLE : {
			name : "ended and no longer available"
		}
	};

	var getTransitionEvent = function() {
		var r;
		var t;
		// create a dummy element to test if transitions are supported on it
		var el = document.createElement("div");
		// different types of prefixed transition event names
		var transitions = {
			"transition" : "transitionend",
			"MozTransition" : "transitionend",
			"WebkitTransition" : "webkitTransitionEnd"
		};
		// only check if the device is not android as video fade out does not fire when in fullscreen playout

		// check if any of the transitions are supported on the element
		for (t in transitions) {
			if (el.style[t] !== undefined) {
				r = transitions[t];
				break;
			}
		}
		return r;
	};

	var logger = $U.core.Logger.getLogger("MediaCardTransitions");

	var movePlayerInAndShow;

	var goFullscreenAndShowControls;

	var showReplay;

	// Length of transition time for fade with 50 millisecond buffer
	var WAIT_FOR_TRANSITION = 250;

	/**
	 *
	 * @param {$U.mediaCard.MediaCardTransitions.TRANSITION_STATE} state
	 */
	var initPlayerTransition = function(passedInState) {

		var state = passedInState,
			supportTransition = getTransitionEvent() ? true : false,
			currentMediaItem = $U.mediaCard.MediaCardController.getCurrentlyPlaying();

		switch(state) {
		case TRANSITION_STATE.START :
			if (supportTransition) {

				$U.mediaCard.MediaCardController.hideMediaButtons();

				if (!$U.core.Device.isHandHeld()) {
					// hide the image overlay
					$U.mediaCard.MediaCardController.setImageOpacity(0);
				}

				movePlayerInAndShow = window.setTimeout(function() {
					// move the player into view
					$U.mediaCard.MediaCardController.movePlayerIntoView();
					// finally show the player
					$U.mediaCard.MediaCardController.showPlayer();

					if ($U.core.Device.isHandHeld() || currentMediaItem.type !== $U.core.mediaitem.MediaItemType.TRAILER) {
						goFullscreenAndShowControls = window.setTimeout(function() {
							//go full screen
							// Fix for Mac fullscreen
							if (!$U.core.Device.isMac()) {
								$U.core.Player.fullscreen();
							}
							// show the video controls
							$U.mediaCard.MediaCardController.showVideoControls();
						}, WAIT_FOR_TRANSITION);
					} else {
						$U.mediaCard.MediaCardController.showVideoControls();
					}
				}, WAIT_FOR_TRANSITION);
			} else {
				// fall back for browsers that do not support transitions

				$U.mediaCard.MediaCardController.hideMediaButtons();

				if (!$U.core.Device.isHandHeld()) {
					// hide the image overlay
					$U.mediaCard.MediaCardController.setImageOpacity(0);
				}

				// move player into the viewport
				$U.mediaCard.MediaCardController.movePlayerIntoView();
				// fade the player in by setting opacity
				$U.mediaCard.MediaCardController.showPlayer();
				// show the video controls
				$U.mediaCard.MediaCardController.showVideoControls();
				// go full screen
				// Fix for Mac fullscreen
				if (!$U.core.Device.isMac()) {
					$U.core.Player.fullscreen();
				}
			}

			break;
		case TRANSITION_STATE.CANCEL :
			// Clear any potential timeouts that may have been set
			window.clearTimeout(movePlayerInAndShow);
			window.clearTimeout(goFullscreenAndShowControls);
			window.clearTimeout(showReplay);
			break;
		case TRANSITION_STATE.END_UNAVAILABLE :
			// Set the asset state to unavailable
			$U.mediaCard.MediaCardController.setAssetState($U.mediaCard.MediaCardController.ASSET_STATE.UNAVAILABLE);
			// Deactivate the player
			$U.mediaCard.MediaCardController.deactivatePlayer();
			// Adjust the state
			$U.mediaCard.MediaCardController.adjustMediaCardOnState();
			break;
		case TRANSITION_STATE.END :
		case TRANSITION_STATE.BLOCKED :
			if ($U.mediaCard.MediaCardController.getCurrentlyPlaying().type === $U.core.mediaitem.MediaItemType.TRAILER) {
				state = TRANSITION_STATE.START;
			}
			$U.mediaCard.MediaCardController.deactivatePlayer();

			if (supportTransition) {
				// Deactivate the player
				showReplay = window.setTimeout(function() {
					$U.mediaCard.MediaCardController.activateButtonOverlay(state);
				}, WAIT_FOR_TRANSITION);

			} else {
				// fall back for browsers that do not support transitions
				$U.mediaCard.MediaCardController.activateButtonOverlay(state);
			}
			break;
		}
	};

	var afterPurchaseTransition = function() {
		var imgContainer = document.getElementById("mediaImageContainer");

		// Add the CSS class responsible for the animation which takes 0.2s
		$U.core.util.HtmlHelper.setClass(imgContainer, "mc-animate-video-container");

		setTimeout(function() {
			// Remove the class after the animation has completed
			$U.core.util.HtmlHelper.removeClass(imgContainer, "mc-animate-video-container");
		}, WAIT_FOR_TRANSITION);
	};

	return {
		TRANSITION_STATE : TRANSITION_STATE,
		initPlayerTransition : initPlayerTransition,
		afterPurchaseTransition : afterPurchaseTransition
	};

}());
