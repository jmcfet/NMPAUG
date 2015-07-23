/**
 * Implementation of application lifecycle management, to allow different modules of the application to register for alerts
 * to the passing of specific time spans (for updating data from SDP/checking for application updates/displaying advertising etc.)
 * @class $U.core.LifecycleHandler
 * @singleton
 * TODO - this is misnamed, it is not handling the lifecycle, it is handling timed events.  Rename when possible
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.LifecycleHandler = ( function() {

	// TODO - implement persistence of listeners so that they count up from initial setting on first app run, AND DO NOT DRIFT ON APP STARTUP/DESTRUCTION.

	var spanEvents = [];
	var sleepEvents = [];
	var intervalHandle = null;
	var autoRepeat = false;
	var backgroundTimeStamp;

	var APPEVENT_TYPES = {
		SPAN : {
			name : "Span"
		},
		SLEEP : {
			name : "Sleep"
		}
	};

	var logger = $U.core.Logger.getLogger("LifecycleHandler");

	/**
	 * Initialises the Lifecycle handler, or resets the timer if called more than once
	 * @param {number} checkSpan - span of time (in milliseconds) that the handler checks timings
	 */
	var initialise = function(checkSpan) {

		if (isNaN(checkSpan)) {
			if (intervalHandle !== null) {
				window.clearInterval(intervalHandle);
			}

			if (logger) {
				logger.log("initialise", "checkSpan is not a number.  Not initialised");
			}

		} else {

			if (intervalHandle === null) {
				intervalHandle = window.setInterval(_handleSpanCycle, checkSpan);
				if (logger) {
					logger.log("initialise", "Initialised to check every " + checkSpan / 1000 + " seconds");
				}
			} else {
				window.clearInterval(intervalHandle);
				intervalHandle = window.setInterval(_handleSpanCycle, checkSpan);
				if (logger) {
					logger.log("initialise", "Reset to check every " + checkSpan / 1000 + " seconds");
				}
			}

		}
	};

	/**
	 * Triggered when the application is backgrounded in NMP.  Stores a timestamp that can be used to check on wakeup to derive how long app has been asleep
	 */
	var appBackgrounded = function(timeStamp) {
		if (logger) {
			logger.log("appBackgrounded", "Application is being put in background, storing timestamp");
		}
		backgroundTimeStamp = timeStamp;
	};

	/**
	 * Immediately checks the slepEvents for triggers
	 */
	var appActivated = function() {
		if (logger) {
			logger.log("appActivated", "Application is being reactivated, handling lifecycle NOW");
		}

		for (var i = sleepEvents.length - 1; i > -1; i--) {
			sleepEvents[i].setSleep(backgroundTimeStamp);
		}
		_handleSleepCycle();
	};

	/**
	 * Stops the SPAN lifecycle interval, halting the handler.  To restart, re-initialise.
	 */
	var stop = function() {
		if (logger) {
			logger.log("stop", "Stopped handling span lifecycle");
		}
		window.clearInterval(intervalHandle);
	};

	/**
	 * Function that iterates over the array of span events to see which ones need triggering
	 * @private
	 */
	var _handleSpanCycle = function() {
		var i;
		var callTime = new Date().getTime();
		var callbackClone;

		/* Loop backwards so removal of an element does not alter the index */
		for ( i = spanEvents.length - 1; i > -1; i--) {
			if (spanEvents[i].shouldEventTrigger(callTime)) {

				callbackClone = _copyListener(spanEvents[i]);

				if (autoRepeat) {
					spanEvents[i].startTime = callTime;
				} else {
					unregisterListener(spanEvents[i].callback);
				}

				/* Do the callback now */
				_callListener(callbackClone.callback, (callTime - callbackClone.startTime) - callbackClone.timeSpan);
			}
		}
	};

	/**
	 * Function that iterates over the array of sleep events to see which ones need triggering
	 * @private
	 */
	var _handleSleepCycle = function() {
		var i;
		var callTime = new Date().getTime();
		var callbackClone;

		/* Loop backwards so removal of an element does not alter the index */
		for ( i = sleepEvents.length - 1; i > -1; i--) {
			if (sleepEvents[i].shouldEventTrigger(callTime)) {

				callbackClone = _copyListener(sleepEvents[i]);

				if (autoRepeat) {
					sleepEvents[i].startTime = callTime;
				} else {
					unregisterListener(sleepEvents[i].callback);
				}

				/* Do the callback now */
				_callListener(callbackClone.callback, (callTime - callbackClone.startTime) - callbackClone.timeSpan);
			}
		}
	};

	/**
	 * Listener object copier, used to clone it before it is reset/removed so asynch works correctly.
	 * @param {Object} listenerObject Object to copy
	 */
	var _copyListener = function(listenerObject) {
		var copy = {};
		for (var attr in listenerObject) {
			if (listenerObject.hasOwnProperty(attr)) {
				copy[attr] = listenerObject[attr];
			}
		}
		return copy;
	};

	/**
	 * Calls the event  callback with an elapsed time in milliseconds since it 'SHOULD'
	 * have been called (interval timer skew) sent as a parameter to the callback function
	 * @private
	 * @param {Function} callback
	 * @param {number} elapsedSpan span in milliseconds that has actually elapsed over and above the timeSpan
	 */
	var _callListener = function(callback, elapsedSpan) {
		if (logger) {
			logger.log("_callListener", "Listener callback triggered");
		}
		callback(elapsedSpan);
	};

	/**
	 * Registers a SPAN/SLEEP listener with its timeSpan (in milliseconds) ready for checking
	 * @param {Function} callback
	 * @param {number} timeSpan
	 * @param {Object} eventType Type of event to register
	 * @return {boolean} true if newly registered, false if already exists and was replaced
	 */
	var registerListener = function(callback, timeSpan, type) {
		var listenerAlreadyExists = false;
		var i;
		var eventType = type || APPEVENT_TYPES.SPAN;

		// Check and see if this callback is already registered
		for ( i = 0; i < spanEvents.length; i++) {

			if (spanEvents[i].callback === callback) {

				spanEvents[i].timeSpan = timeSpan;
				spanEvents[i].startTime = new Date().getTime();
				listenerAlreadyExists = true;
				if (logger) {
					logger.log("registerListener", "SPAN Listener updated");
				}
			}
		}

		for ( i = 0; i < sleepEvents.length; i++) {
			if (sleepEvents[i].callback === callback) {

				sleepEvents[i].timeSpan = timeSpan;
				sleepEvents[i].startTime = new Date().getTime();
				listenerAlreadyExists = true;
				if (logger) {
					logger.log("registerListener", "SLEEP Listener updated");
				}
			}
		}

		if (listenerAlreadyExists === false) {

			switch (eventType) {
			case APPEVENT_TYPES.SPAN :
				spanEvents.push(new $U.core.applicationevent.ApplicationEvent(callback, timeSpan));
				break;
			case APPEVENT_TYPES.SLEEP :
				sleepEvents.push(new $U.core.applicationevent.SleepEvent(callback, timeSpan));
				break;
			}

			if (logger) {
				logger.log("registerListener", eventType.name + " listener created");
			}

			return true;
		} else {

			return false;
		}
	};

	/**
	 * Removes a listener from the lifecycle system
	 * @param {Function} callback
	 * @return {boolean} true if found and removed, false if not found
	 */
	var unregisterListener = function(callback) {
		var i;

		for ( i = 0; i < spanEvents.length; i++) {
			if (spanEvents[i].callback === callback) {

				spanEvents.splice(i, 1);
				if (logger) {
					logger.log("unregisterListener", "SPAN Listener removed");
				}
				return true;
			}
		}
		
		for ( i = 0; i < sleepEvents.length; i++) {
			if (sleepEvents[i].callback === callback) {

				sleepEvents.splice(i, 1);
				if (logger) {
					logger.log("unregisterListener", "SLEEP Listener removed");
				}
				return true;
			}
		}
		
		if (logger) {
			logger.log("unregisterListener", "Listener not found");
		}
		return false;
	};

	return {
		initialise : initialise,
		registerListener : registerListener,
		appBackgrounded : appBackgrounded,
		appActivated : appActivated,
		unregisterListener : unregisterListener,
		stop : stop,
		APPEVENT_TYPES : APPEVENT_TYPES
	};

}());
