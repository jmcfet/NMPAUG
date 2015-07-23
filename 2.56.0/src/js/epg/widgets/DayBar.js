/**
 * Class representing the Day Bar element of the EPG
 * @class $U.epg.widgets.DayBar
 * @constructor
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.DayBar = ( function() {

	var SCROLLER_NAME = "EPGDayScroller";
	var DAY_SPAN = 86400000;

	var superClass = $U.epg.widgets.EPGScrollerWidget;

	function DayBar(container) {
		superClass.call(this, container, SCROLLER_NAME, true, false);
	}

	$N.apps.util.Util.extend(DayBar, superClass);		


	/**
	 * Builds day bar sections and appends them to the DOM
	 * @param {Object} EPGConfig Object containing configuration variables
	 */
	DayBar.prototype.populate = function(EPGConfig) {
		var i;
		var dayBarSection;
		var startDate;
		var currentDate;
		var numberOfDays;
		var width;

		/* get the starting date of the EPG */
		startDate = new Date(new Date().getTime() - EPGConfig.previousSpan);
		startDate.setHours(EPGConfig.eventWindowStart, 0, 0, 0);

		numberOfDays = EPGConfig.span / DAY_SPAN;
		width = 100 / numberOfDays;

		for ( i = 0; i < numberOfDays; i = i + 1) {

			currentDate = new Date(startDate.getTime() + ((DAY_SPAN) * i));
			dayBarSection = document.createElement("div");
			dayBarSection.className = "epg-day-bar-element";
			
			// Add highlight to day bar if user touches it for mobile devices only
			if(!$U.core.Device.isDesktop()){
				$U.core.util.Highlighter.applyTouchHighlight(dayBarSection, "epg-day-bar-highlight");
			}

			dayBarSection.style.width = width + "%";
			dayBarSection.id = currentDate.getFullYear() + "" + currentDate.getMonth() + "" + currentDate.getDate();
			dayBarSection.innerHTML = $U.core.util.Formatter.formatDate(currentDate);
			this._container.appendChild(dayBarSection);
			createDayBarClickListener(currentDate, dayBarSection);
		}
	};

	/**
	 * @private
	 * Creates a click handler on each daybar section
	 * @param {Date} currentDate
	 * @param {HTMLElement} dayBarSection
	 */
	function createDayBarClickListener(currentDate, dayBarSection) {
		dayBarSection.addEventListener('click', function(e) {
			$U.epg.EPGScreen.changeDay(currentDate);
		});
	}

	/**
	 * Sets the highlight on the day bar element that is representative of the given date
	 * @param {Date} chosenDate
	 */
	DayBar.prototype.setHighlight = function(chosenDate) {
		var currentHighlight = document.getElementById(chosenDate.getFullYear() + "" + chosenDate.getMonth() + "" + chosenDate.getDate());
		var allBar = document.getElementsByClassName("highlight");
		$(allBar).removeClass("highlight");
		$(currentHighlight).addClass("highlight");
		
		// Scroll the highlighted element into view
		this._scroller.scrollToElement(currentHighlight);
		
	};

	DayBar.prototype.addLinked = function(linked, axis) {
		this._scroller.addLinked(linked, axis);
	};
	
	DayBar.prototype.reflow = function() {
		this._scroller.reflow();
	};


	return DayBar;

}());
