/**
 * Class to represents an event that needs to be triggered after a given timeSpan of time 'asleep'
 * @class $U.core.applicationevent.SleepEvent
 * @extends $U.core.applicationevent.ApplicationEvent
 * @constructor
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.applicationevent = $U.core.applicationevent || {};
$U.core.applicationevent.SleepEvent = ( function() {

	var logger = $U.core.Logger.getLogger("$U.core.applicationevent.SleepEvent");

	var superClass = $U.core.applicationevent.ApplicationEvent;

	/**
	 * Builds and returns a SpanEvent listener object
	 * @param {Function} callback
	 * @param {number} timeSpan Span of time to trigger after (milliseconds)
	 * @return {$U.core.applicationevent.SpanEvent} the SpanEvent object
	 */
	function SleepEvent(callback, timeSpan) {
		superClass.call(this, callback, timeSpan);
	}

	var proto = SleepEvent.prototype;

	/**
	 * Method to assess whether event needs to be triggered (override of ApplicationEvent.shouldTriggerEvent())
	 * @param {number} callTime milliseconds elapsed between application handler 'ticks'
	 * @return {boolean} True if the listener needs to be triggered, false if not
	 */
	proto.shouldEventTrigger = function(callTime) {
		if ((callTime - this.startTime) > this.timeSpan) {
			return true;
		} else {
			this.startTime = new Date().getTime();
			return false;
		}
	};

	/**
	 * Takes a timestamp of when the system slept
	 * @param {Object} timeStamp
	 */
	proto.setSleep = function(timeStamp) {
		this.startTime = timeStamp;
	};

	return SleepEvent;

}());
