/**
 * @class $U.epg.util.TimeHelper
 * Utility component that manages things like when 'Now' is, when the EPG starts and ends in milliseconds, how many pixels are
 * there in a minute for a given hour Span etc
 *
 * Example - 'Now' is server time, not local Javascript time, so a function to return the local time offset by the difference in server time is a useful
 * function to use for the NowBar/EPGCurrent events if the local Javascript time is wrong (badly set clock)
 * @singleton
 *
 * @constructor
 * @param {Object} EPGConfig EP configuration object
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.util = $U.epg.util || {};

$U.epg.util.TimeHelper = ( function() {
	
	
	var TimeHelper = function(EPGConfig) {
		this._offset = 0;
		this._EPGConfig = EPGConfig;
		this._DAYOFFSET = Math.ceil((86400000 / 2));
		this._SPANOFFSET = Math.ceil((this._EPGConfig.eventWindowSpan / 2));
	};

	/**
	 * Returns the time of the device, +/- the offset from server time
	 * @return {Date}
	 */
	TimeHelper.prototype.getNow = function() {
		return new Date(new Date().getTime() - this._offset);
		//return $U.core.util.BroadcastClock.getTime();
	};

	/**
	 * Returns the epgStart time
	 * @return {Date}
	 */
	TimeHelper.prototype.getEPGStart = function() {
		return new Date((this.getNow().getTime() - this._EPGConfig.previousSpan));
	};

	/**
	 * Returns the epgEnd time
	 * @return {Date}
	 */
	TimeHelper.prototype.getEPGEnd = function() {
		return new Date((this.getEPGStart().getTime() + this._EPGConfig.span));
	};

	/**
	 * Returns the 'today' based on the epg window
	 * @return {Date}
	 */
	TimeHelper.prototype.getToday = function() {
		var today = this.getNow();
		return this.getDay(today);
	};
	
	/**
	 * Returns the 'day' based on the parameter date
	 * @param {Date} date
	 * @return {Date}
	 */
	TimeHelper.prototype.getDay = function(date) {
		var copyDate = new Date(date.getTime());
		copyDate.setHours(this._EPGConfig.eventWindowStart, 0, 0, 0);
		// Special case where the time passed in falls before the start of the calendar day and the start of the EPG day
		if (date.getTime() < copyDate.getTime()) {
			copyDate = new Date(copyDate.getTime() - (24 * 60 * 60 * 1000));
		}
		return copyDate;
	};
	
	/**
	 * Returns the span based on the parameter date
	 * @param {Date} date
	 * @return {Date}
	 */
	TimeHelper.prototype.getSpan = function(date) {
		var copyDate = new Date(date.getTime());
		copyDate.setHours(this._EPGConfig.eventWindowStart, 0, 0, 0);
		if (date.getHours() < this._EPGConfig.eventWindowStart) {
			while(copyDate > date) {
				copyDate = new Date(copyDate.getTime() - this._EPGConfig.eventWindowSpan);
			}
		} else {
			var dateMinusOffset = new Date(date.getTime() - this._EPGConfig.eventWindowSpan);
			while(copyDate <= dateMinusOffset) {
				copyDate = new Date(copyDate.getTime() + this._EPGConfig.eventWindowSpan);
			}
		}
		return copyDate;
	};

	/**
	 * Returns 'next day' based on 'day'
	 * @param {Date} day
	 * @return {Date}
	 */
	TimeHelper.prototype.getNextDay = function(day) {
		var copyDay = new Date(day.getTime());  //Avoid modifying the parameter
		copyDay.setHours(this._EPGConfig.eventWindowStart, 0, 0, 0);
		return new Date(copyDay.getTime() + this._DAYOFFSET);
	};
	
	/**
	 * Returns 'next span' based on 'date'
	 * @param {Date} date
	 * @return {Date}
	 */
	TimeHelper.prototype.getNextSpan = function(date) {
		var copyDate = new Date(date.getTime()+ this._EPGConfig.eventWindowSpan);
		return this.getSpan(copyDate);
	};

	/**
	 * Returns 'yesterday' based on 'today'
	 * @param {Date} day
	 * @return {Date}
	 */
	TimeHelper.prototype.getPreviousDay = function(day) {
		var copyDay = new Date(day.getTime());  //Avoid modifying the parameter
		copyDay.setHours(this._EPGConfig.eventWindowStart, 0, 0, 0);
		return new Date(copyDay.getTime() - this._DAYOFFSET);
	};
	
	/**
	 * Returns 'previous span' based on 'date'
	 * @param {Date} date
	 * @return {Date}
	 */
	TimeHelper.prototype.getPreviousSpan = function(date) {
		var copyDate = new Date(date.getTime() - this._EPGConfig.eventWindowSpan);
		return this.getSpan(copyDate);
	};

	/**
	 * Returns a YYYY_M_D string from a date object
	 * e.g. a date of 10/3/2013 returns 2013_3_10
	 * @param {Date} date
	 * @return {Date}
	 * */
	TimeHelper.prototype.getYMD = function(date) {
		return (date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate());
	};

	/** Returns a formatted EPG Window from the given date
	 * @param {Date} date
	 * @return {Object} EPGWindow object with start/end times
	 */
	TimeHelper.prototype.getEPGWindow = function(date) {
		var copyDate = new Date(date.getTime());
		var EPGWindowStart = new Date(copyDate.setHours(this._EPGConfig.eventWindowStart, 0, 0, 0));
		var EPGWindowEnd = new Date(EPGWindowStart.getTime() + this._EPGConfig.eventWindowSpan);
		return {
			EPGWindowStart : EPGWindowStart,
			EPGWindowEnd : EPGWindowEnd
		};
	};

	/**
	 * Returns the number of days an EPGConfig span is over
	 * @return {Number} Number of days
	 */
	TimeHelper.prototype.getEPGSpanInDays = function() {
		return this._EPGConfig.span / this._EPGConfig.eventWindowSpan;
	};

	return TimeHelper;
}());
