/**
 * Application State API.  Manages interaction with the NMP API for state changes so UI can react to app being minimised/backgrounded on NMP-enabled devices
 * @class $U.core.ApplicationState
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.ApplicationState = ( function() {

	var logger = $U.core.Logger.getLogger("ApplicationState");

	var attach = function() {

		/* Check we have the ability to get Appstate events (are we in NMP or not) */
		if (window.userAgent && typeof window.userAgent.registerEventListener === "function") {
			window.onStateChanged = new $U.core.ApplicationState.userAgentStateChanged();
			window.userAgent.registerEventListener("onStateChanged");
			if (logger) {
				logger.log("attach", "Listening for ApplicationState events, am in NMP");
			}
		} else {
			if (logger) {
				logger.log("attach", "Not listening for ApplicationState events, not NMP");
			}
		}
	};

	/**
	 * Called by the NMP Application when an application state event has occured (app going to background, restarting etc.)
	 */
	var userAgentStateChanged = function() {

		this.stateChanged = function(state) {

			// Handle state transitions as required.  States are:-
			var APPSTATE = {
				ACTIVE : 0,
				INACTIVE : 10,
				BACKGROUND : 20
			};

			switch(Number(state)) {
			case APPSTATE.ACTIVE:
				if (logger) {
					logger.log("userAgentStateChanged", "State is Active");
				}
				$U.core.LifecycleHandler.appActivated();
				break;
			case APPSTATE.INACTIVE:
				// iOS - triggers on home button before transitioning to background, or in and back to active if notifications panel is drawn down by user.
				if (logger) {
					logger.log("userAgentStateChanged", "State is Inactive");
				}
				break;
			case APPSTATE.BACKGROUND:
				// iOS - triggers on home button after inactive.  App can be killed at this point and we would not know.  Persist here if required for a restart.
				if (logger) {
					logger.log("userAgentStateChanged", "State is Background");
				}
				$U.core.LifecycleHandler.appBackgrounded(new Date().getTime());
				break;
			default:
				/* No default, silently ignore invalid actions */
				break;
			}
		};
	};
	return {
		userAgentStateChanged : userAgentStateChanged,
		attach : attach
	};
}());
