/**
 * @class $U.epg.widgets.TimeBar
 * Class that represents the Time Bar in an EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Object} EPGConfig EP configuration object
 * @param {Object} EPGState EPG State object
 * @param {Object} owner Owner object (most likely its caller)
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.TimeBar = ( function() {
	
	var MILLIS_PER_HOUR = 60 * 60 * 1000;
	
	var SCROLLER_NAME = "EPGTimeScroller";
	
	var superClass = $U.epg.widgets.EPGScrollerWidget;

	function TimeBar(container, epgState) {
		this._container = container;
		this._epgState = epgState;
		this._hoursInBar = [];
		this._currentActiveHour = null;
		superClass.call(this, container, SCROLLER_NAME, true, false);
	}


	$N.apps.util.Util.extend(TimeBar, superClass);

	TimeBar.prototype.setEPGState = function(epgState) {
		this._epgState = epgState;
	};

	/**
	 * Populates the timebar with times according to the EPGConfig/state passed in during construction
	 */
	TimeBar.prototype.populate = function() {

		var i;
		var hourBar;
		var timeStart = this._epgState.windowStart;
		var timeEnd = this._epgState.windowEnd;
		var baseTime = timeStart;
		var numberOfHoursRequired = Math.ceil((timeEnd.getTime() - timeStart.getTime()) / MILLIS_PER_HOUR);
		
		while(this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}

		for ( i = 0; i < numberOfHoursRequired; i = i + 1) {

			hourBar = document.createElement("a");
			hourBar.className = "epg-time-span";

			this._hoursInBar.push(baseTime.getHours());
			
			hourBar.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(baseTime)));
			
			baseTime = new Date(baseTime.getTime() + MILLIS_PER_HOUR);

			this._container.appendChild(hourBar);
		}
	};

	/**
	 * Highlights the hour that is currently 'Now' based on the time passed in
	 * @param {Date} timeNow
	 */
	TimeBar.prototype.highlightCurrentHour = function(timeNow) {
		var timeNowHr = timeNow.getHours();
		var positionOfHour = this._hoursInBar.indexOf(timeNowHr);

		if (positionOfHour !== -1) {
			if (!this._currentActiveHour) {
				$(this._container).children().eq(positionOfHour).addClass("active-hour");
				this._currentActiveHour = timeNowHr;
			} else if (this._currentActiveHour !== timeNowHr) {
				$(this._container).children().removeClass("active-hour");
				$(this._container).children().eq(positionOfHour).addClass("active-hour");
				this._currentActiveHour = timeNowHr;
			}
		}
	};

	/**
	 * Hides the highlighting on the timebar
	 */
	TimeBar.prototype.hideCurrentHour = function() {
		this._currentActiveHour = null;
		$(this._container).children().removeClass("active-hour");
	};

	return TimeBar;

}());
