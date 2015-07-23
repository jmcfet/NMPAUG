/*jshint newcap: false*/

var FormatterTest = TestCase("FormatterTest");

/*
 * duration comes back with hour(s) and min(s)
 * should test:
 *  only returning hour text (and plural)
 *  only returning minute text (and plural)
 *  mixtures of both
 *  differences in times
 *  using the minutes/seconds to hours functions
 */
FormatterTest.prototype.setUp = function() {

	/*  Stubs out the NINJA API for language bundles.
	 *  If testing any functionality that is "locale'd" with strings, add the keys here for them to be found by the tests */
	$U = $U || {};
	$U.core = $U.core || {};
	$U.core.Configuration = $U.core.Configuration || {};
	$U.core.Configuration.LANGPATH = "/bundles";

	/*global $N:true*/
	/* Building a fake NINJA API to handle calling strings */
	$N = $N || {};
	$N.apps = $N.apps || {};
	$N.apps.core = $N.apps.core || {};
	$N.apps.core.Language = $N.apps.core.Language || {};
	$N.apps.core.Language.adornWithGetString = function(varObject) {
		varObject.getString = function(key) {
			var keyLookup = {
				txtHour : "hour",
				txtHours : "hours",
				txtMin : "min",
				txtMins : "mins",
				timeFormat : "H:MM AM",
				dateFormat : "DY DD MON",
				months : "January,February,March,April,May,June,July,August,September,October,November,December",
				monthsShort : "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
				days : "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
				daysShort : "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
				meridianFormat : "am,pm",
				txtLessThanMin : "less than a minute"
			};
			return keyLookup[key];
		};
		return varObject;
	};

	$U.core.Locale = $U.core.Locale || {};
	$U.core.Locale.getLocale = function() {
		return "en_gb";
	};

	$U.core.util.StringHelper.resetStrings();

};

/*
 * Tear down following test
 */
FormatterTest.prototype.tearDown = function() {

};

FormatterTest.prototype.testShortDurations = function() {
	assertEquals("1 min", $U.core.util.Formatter.formatSecondsToHours(59));
	assertEquals("1 min", $U.core.util.Formatter.formatSecondsToHours(30));
	assertEquals("less than a minute", $U.core.util.Formatter.formatSecondsToHours(29));
	assertEquals("less than a minute", $U.core.util.Formatter.formatSecondsToHours(1));
	assertEquals("0 hours", $U.core.util.Formatter.formatSecondsToHours(0));
};

FormatterTest.prototype.testOneHourUsingSeconds = function() {
	assertEquals("1 hour", $U.core.util.Formatter.formatSecondsToHours(3600));
};

FormatterTest.prototype.testOneHourUsingMinutes = function() {
	assertEquals("1 hour", $U.core.util.Formatter.formatMinutesToHours(60));
};

FormatterTest.prototype.testOneHourUsingMillisecondDifference = function() {
	assertEquals("1 hour", $U.core.util.Formatter.formatDuration(12345678, 15945678));
};

FormatterTest.prototype.testMultipleHoursUsingSeconds = function() {
	assertEquals("2 hours", $U.core.util.Formatter.formatSecondsToHours(7200));
	assertEquals("3 hours", $U.core.util.Formatter.formatSecondsToHours(10800));
	assertEquals("5 hours", $U.core.util.Formatter.formatSecondsToHours(18000));
	assertEquals("10 hours", $U.core.util.Formatter.formatSecondsToHours(36000));
	assertEquals("24 hours", $U.core.util.Formatter.formatSecondsToHours(86400));
};

FormatterTest.prototype.testMultipleHoursUsingMinutes = function() {
	assertEquals("2 hours", $U.core.util.Formatter.formatMinutesToHours(120));
	assertEquals("3 hours", $U.core.util.Formatter.formatMinutesToHours(180));
	assertEquals("5 hours", $U.core.util.Formatter.formatMinutesToHours(300));
	assertEquals("10 hours", $U.core.util.Formatter.formatMinutesToHours(600));
	assertEquals("24 hours", $U.core.util.Formatter.formatMinutesToHours(1440));
};

FormatterTest.prototype.testMultipleHoursUsingMillisecondDifference = function() {
	assertEquals("2 hours", $U.core.util.Formatter.formatDuration(12345678, 19545678));
	assertEquals("3 hours", $U.core.util.Formatter.formatDuration(12345678, 23145678));
	assertEquals("5 hours", $U.core.util.Formatter.formatDuration(12345678, 30345678));
	assertEquals("10 hours", $U.core.util.Formatter.formatDuration(12345678, 48345678));
	assertEquals("24 hours", $U.core.util.Formatter.formatDuration(12345678, 98745678));
};

FormatterTest.prototype.testOneMinuteUsingSeconds = function() {
	assertEquals("1 min", $U.core.util.Formatter.formatSecondsToHours(60));
};

FormatterTest.prototype.testOneMinuteUsingMinutes = function() {
	assertEquals("1 min", $U.core.util.Formatter.formatMinutesToHours(1));
};

FormatterTest.prototype.testOneMinuteUsingMillisecondDifference = function() {
	assertEquals("1 min", $U.core.util.Formatter.formatDuration(12345678, 12405678));
};

FormatterTest.prototype.testMultipleMinutesUsingSeconds = function() {
	assertEquals("2 mins", $U.core.util.Formatter.formatSecondsToHours(120));
	assertEquals("3 mins", $U.core.util.Formatter.formatSecondsToHours(180));
	assertEquals("5 mins", $U.core.util.Formatter.formatSecondsToHours(300));
	assertEquals("10 mins", $U.core.util.Formatter.formatSecondsToHours(600));
	assertEquals("24 mins", $U.core.util.Formatter.formatSecondsToHours(1440));
};

FormatterTest.prototype.testMultipleMinutesUsingMinutes = function() {
	assertEquals("2 mins", $U.core.util.Formatter.formatMinutesToHours(2));
	assertEquals("3 mins", $U.core.util.Formatter.formatMinutesToHours(3));
	assertEquals("5 mins", $U.core.util.Formatter.formatMinutesToHours(5));
	assertEquals("10 mins", $U.core.util.Formatter.formatMinutesToHours(10));
	assertEquals("24 mins", $U.core.util.Formatter.formatMinutesToHours(24));
};

FormatterTest.prototype.testMultipleMinutesUsingMillisecondDifference = function() {
	assertEquals("2 mins", $U.core.util.Formatter.formatDuration(12345678, 12465678));
	assertEquals("3 mins", $U.core.util.Formatter.formatDuration(12345678, 12525678));
	assertEquals("5 mins", $U.core.util.Formatter.formatDuration(12345678, 12645678));
	assertEquals("10 mins", $U.core.util.Formatter.formatDuration(12345678, 12945678));
	assertEquals("24 mins", $U.core.util.Formatter.formatDuration(12345678, 13785678));
};

FormatterTest.prototype.testMixtureUsingSeconds = function() {
	assertEquals("1 hour 1 min", $U.core.util.Formatter.formatSecondsToHours(3660));
	assertEquals("1 hour 3 mins", $U.core.util.Formatter.formatSecondsToHours(3780));
	assertEquals("2 hours 1 min", $U.core.util.Formatter.formatSecondsToHours(7260));
	assertEquals("2 hours 3 mins", $U.core.util.Formatter.formatSecondsToHours(7380));
	assertEquals("5 hours 23 mins", $U.core.util.Formatter.formatSecondsToHours(19380));
};

FormatterTest.prototype.testMixtureUsingMinutes = function() {
	assertEquals("1 hour 1 min", $U.core.util.Formatter.formatMinutesToHours(61));
	assertEquals("1 hour 3 mins", $U.core.util.Formatter.formatMinutesToHours(63));
	assertEquals("2 hours 1 min", $U.core.util.Formatter.formatMinutesToHours(121));
	assertEquals("2 hours 3 mins", $U.core.util.Formatter.formatMinutesToHours(123));
	assertEquals("5 hours 23 mins", $U.core.util.Formatter.formatMinutesToHours(323));
};

FormatterTest.prototype.testMixtureUsingMillisecondDifference = function() {
	assertEquals("1 hour 1 min", $U.core.util.Formatter.formatDuration(12345678, 16005678));
	assertEquals("1 hour 3 mins", $U.core.util.Formatter.formatDuration(12345678, 16125678));
	assertEquals("2 hours 1 min", $U.core.util.Formatter.formatDuration(12345678, 19605678));
	assertEquals("2 hours 3 mins", $U.core.util.Formatter.formatDuration(12345678, 19725678));
	assertEquals("5 hours 23 mins", $U.core.util.Formatter.formatDuration(12345678, 31725678));
};

FormatterTest.prototype.testDateFormatting = function() {
	assertEquals("Fri 25 Jan", $U.core.util.Formatter.formatDate(new Date(128333700000)));
	assertEquals("Thu 01 Jan", $U.core.util.Formatter.formatDate(new Date(0)));
	assertEquals("Wed 31 Dec", $U.core.util.Formatter.formatDate(new Date(-123)));
	assertEquals("Tue 31 Dec", $U.core.util.Formatter.formatDate(new Date(1388448000000)));
};

FormatterTest.prototype.testTimeFormatting = function() {
	assertEquals("8:15 am", $U.core.util.Formatter.formatTime(new Date(128333700000)));
	assertEquals("11:59 pm", $U.core.util.Formatter.formatTime(new Date(1388534399000)));
	assertEquals("12:00 am", $U.core.util.Formatter.formatTime(new Date(1388448000000)));
	assertEquals("1:01 am", $U.core.util.Formatter.formatTime(new Date(1382400061000)));
};

FormatterTest.prototype.testTimeFormatting24 = function() {
	$N.apps.core.Language.adornWithGetString = function(varObject) {
		varObject.getString = function(key) {
			var keyLookup = {
				timeFormat : "HH:MM"
			};
			return keyLookup[key];
		};
		return varObject;
	};
	assertEquals("08:15", $U.core.util.Formatter.formatTime(new Date(128333700000)));
	assertEquals("23:59", $U.core.util.Formatter.formatTime(new Date(1388534399000)));
	assertEquals("00:00", $U.core.util.Formatter.formatTime(new Date(1388448000000)));
	assertEquals("01:01", $U.core.util.Formatter.formatTime(new Date(1382400061000)));
};
