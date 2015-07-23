/**
 * @class $U.core.util.Formatter
 * A Formatter class, capable of formatting date, times, currency etc..
 * only returns mins if less than hour
 * only returns hours if a round number of hours (e.g. 3600 seconds = 1 hour)
 * otherwise returns mixture of hours and mins
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

$U.core.util.Formatter = ( function() {

	var TIME_FORMAT_KEY = "timeFormat";
	var DATE_FORMAT_KEY = "dateFormat";
	var MERIDIAN_FORMAT_KEY = "meridianFormat";
	var DAYSHORT_KEY = "daysShort";
	var DAYS_KEY = "days";
	var MONTHSSHORT_KEY = "monthsShort";
	var MONTHS_KEY = "months";
	var HOUR_KEY = "txtHour";
	var HOURS_KEY = "txtHours";
	var MINUTE_KEY = "txtMin";
	var MINUTES_KEY = "txtMins";
	var LESS_MINUTE_KEY = "txtLessThanMin";

	var SECONDS_PER_MINUTE = 60;
	var MINUTES_PER_HOUR = 60;
	var SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
	var MILLIS_PER_SECOND = 1000;

	/**
	 * Formats a give span of time into a readable duration string e.g. 1 hour 15 mins
	 * @param {Number} startTimeInMillis Start time in milliseconds
	 * @param {Number} endTimeInMillis End time in milliseconds
	 * @return {string} Formatted duration string
	 */
	function formatDuration(startTimeInMillis, endTimeInMillis) {
		var seconds = (endTimeInMillis - startTimeInMillis) / MILLIS_PER_SECOND;
		return _formatTimeToString(0, 0, seconds);
	}

	/**
	 * Formats a given number of minutes into a readable duration string e.g. 1 hour 15 mins
	 * @param {Number} minutes
	 * @return {string} Formatted duration string
	 */
	function formatMinutesToHours(minutes) {
		return _formatTimeToString(0, minutes, 0);
	}

	/**
	 * Formats a given number of seconds into a readable duration string e.g. 1 hour 15 mins
	 * @param {Number} seconds
	 * @param {boolean} noUnitsIfZero true if the "hours" string should be missing
	 * @return {string} Formatted duration string
	 */
	function formatSecondsToHours(seconds, noUnitsIfZero) {
		return seconds > 0 || (seconds === 0 && noUnitsIfZero) ? _formatTimeToString(0, 0, seconds) : "0 " + $U.core.util.StringHelper.getString(HOURS_KEY);
	}

	/**
	 * Formats a given number of seconds to a digital clock
	 * so 120 -> 02:00
	 * if over 1hr then will add an hour
	 * @param seconds the number of seconds to convert
	 * @return formatted time string
	 */
	function formatSecondsToDigitalClock(seconds){
		if (!seconds || isNaN(seconds)) {
			seconds = 0;
		}
		var parseSeconds = parseInt(seconds,10);
		var durationHours =  Math.floor(parseSeconds / 3600);
		var durationMinutes = Math.floor((parseSeconds - (durationHours * 3600)) / 60);
		var durationSeconds = Math.floor((parseSeconds - (durationHours * 3600) - (durationMinutes*60)));
		var timeString = durationHours > 0 ? durationHours + ":" : "";
		timeString += durationMinutes > 9 ? durationMinutes + ":" : "0" + durationMinutes + ":";
		timeString += durationSeconds > 9 ? durationSeconds : "0" + durationSeconds;
		
		return timeString;
	}

	/**
	 * Formats the given datetime object as a time string according to the format held in the language bundle
	 * @param {Date} dateObject
	 * @return {String} Formatted time string
	 */
	function formatTime(dateObject) {
		return $N.apps.util.Util.formatTime(dateObject, $U.core.util.StringHelper.getString(TIME_FORMAT_KEY), $U.core.util.StringHelper.getString(MERIDIAN_FORMAT_KEY).split(","));
	}

	/**
	 * Formats the given datetime object as a date string according to the format held in the language bundle
	 * @param {Date} dateObject
	 * @return {String} Formatted date string
	 */
	function formatDate(dateObject) {
		return $N.apps.util.Util.formatDate(dateObject, $U.core.util.StringHelper.getString(DATE_FORMAT_KEY), $U.core.util.StringHelper.getString(MONTHS_KEY).split(","), $U.core.util.StringHelper.getString(MONTHSSHORT_KEY).split(","), $U.core.util.StringHelper.getString(DAYS_KEY).split(","), $U.core.util.StringHelper.getString(DAYSHORT_KEY).split(","));
	}

	/**
	 * Formats a given duration in hours, minutes and seconds into a readable duration string
	 * @param {Number} h hours, will be floored to integer
	 * @param {Number} m minutes, will be floored to integer
	 * @param {Number} s seconds, will be floored to integer
	 * @return {string} Formatted duration string
	 */
	function _formatTimeToString(h, m, s) {

		var result = [];		
		
		// Convert h, m, s in to seconds, flooring to ignore fractions
		s = Math.floor(s) + Math.floor(m) * SECONDS_PER_MINUTE + Math.floor(h) * SECONDS_PER_HOUR;
		
		// Carry seconds into minutes
		m = Math.floor(s / SECONDS_PER_MINUTE);
		
		// Carry minutes into hours
		h = Math.floor(m / MINUTES_PER_HOUR);
		
		// Take the carried hours off the minutes
		m %= MINUTES_PER_HOUR;
		
		// Take the carried minutes off the seconds
		s %= SECONDS_PER_MINUTE;	
		
		// do the rounding correctly so if 30 sec or more round time up
		if (s >= SECONDS_PER_MINUTE / 2) {
			m++;
			if (m >= MINUTES_PER_HOUR) {
				m = 0;
				h++;
			}
		}
		
		
		if (h >= 1) {
			result.push(h + " " + (h > 1 ? $U.core.util.StringHelper.getString(HOURS_KEY) : $U.core.util.StringHelper.getString(HOUR_KEY))); 
		}

		if (m >= 1) {
			result.push(m + " " + (m > 1 ? $U.core.util.StringHelper.getString(MINUTES_KEY) : $U.core.util.StringHelper.getString(MINUTE_KEY))); 
		}
		
		if (h === 0 && m === 0 && s > 0) {
			result.push($U.core.util.StringHelper.getString(LESS_MINUTE_KEY));
		}
		
		return result.join(" ");
	}

	return {
		formatDuration : formatDuration,
		formatMinutesToHours : formatMinutesToHours,
		formatSecondsToHours : formatSecondsToHours,
		formatSecondsToDigitalClock : formatSecondsToDigitalClock,
		formatTime : formatTime,
		formatDate : formatDate
	};

}());
