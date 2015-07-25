/**
 * Class to represents a generic timed 'Event' within the Application.  
 * When asked "shouldTriggerEvent()" with NOW it will derive whether it should or not be triggered.
 * @class $U.core.applicationevent.ApplicationEvent
 * @constructor  testing
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.applicationevent = $U.core.applicationevent || {};
$U.core.applicationevent.ApplicationEvent = ( function() {
	
	var logger = $U.core.Logger.getLogger("$U.core.applicationevent.SleepEvent");

	/**
	 * Builds and returns a ApplicationEvent listener object
	 * @param {Function} callback
	 * @param {number} timeSpan Span of time to trigger after (milliseconds)
	 * @return {$U.core.applicationevent.ApplicationEvent} the ApplicationEvent object
	 */
	function ApplicationEvent(callback, timeSpan) {
		this.callback = callback;
		this.timeSpan = timeSpan;
		this.startTime = new Date().getTime();
	}
	
	var proto = ApplicationEvent.prototype;

	/**
	 * Method to assess whether the Timed Event callback needs to be triggered
	 * @param {number} callTime milliseconds representation of 'now'
	 * @return {boolean} True if the callback needs to be triggered, false if not
	 */
	proto.shouldEventTrigger = function(callTime) {

		if ((this.timeSpan + this.startTime) <= callTime) {
			return true;
		} else {
			return false;
		}
	};

	return ApplicationEvent;

}());
