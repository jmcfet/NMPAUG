/*jshint newcap: false*/

var TimeHelperTest = TestCase("TimeHelperTest");

/*
 * should test:
 * getting now gets correct time
 * getting EPGStart gets correct time
 * getting EPGEnd gets correct time
 * getting today gets the right day
 * getting tomorrow gets the right day
 * getting yesterday gets the right day
 * formatter YMD formats correctly
 * getting the window gets the correct window
 * getting the span gets the correct number of days
 */

TimeHelperTest.prototype.setUp = function(){
	TimeHelperTest.EPG_CONFIG = {
		// All spans are in milliseconds

		// Total span of EPG Data required (currently 8 days)
		span : 691200000,

		// Timespan backwards from NOW to start EPG Span (currently 1 day)
		previousSpan : 86400000,

		// 12/24 hour clock in TimeBar
		timeType : 12,

		// When the epg window starts per day (currently 6 am)
		eventWindowStart : 6,

		// Span from eventWindowStart to display a ‘day’ of data (currently 24 hours, so 6am to 6am)
		eventWindowSpan : 86400000

		// uncomment this to see the now/next layout
		// layout : "nownext"
	}; 

};

TimeHelperTest.prototype.testNow = function() {	
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var now = timeHelper.getNow();
	assert(new Date().getTime() - now < 100);
};

TimeHelperTest.prototype.testEPGStart = function() {	
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var EPGStart = timeHelper.getEPGStart();
	var now = new Date();
	now.setDate(now.getDate() - 1);
	assert(now.getTime() - EPGStart < 100);
};

TimeHelperTest.prototype.testEPGEnd = function() {	
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var EPGEnd = timeHelper.getEPGEnd();
	var now = new Date();
	now.setDate(now.getDate() + 7);
	assert(now.getTime() - EPGEnd < 100);
};

TimeHelperTest.prototype.testToday = function() {
	// based on the time, if the time is before the eventEindowStart it should return yesterday, otherwise today
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	
	var now = new Date();
	now.setHours(8,0,0,0);
	
	var today = timeHelper.getToday(now);
	now = new Date();
	assert(new Date().getTime() - today < 100);
	
	now.setHours(5,59,0,0);
	today = timeHelper.getToday(now);
	assert(new Date(now.getTime() - (TimeHelperTest.EPG_CONFIG.eventWindowSpan/2)).getTime() - today < 100);
};

TimeHelperTest.prototype.testTomorrow = function() {
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var now = new Date();
	now.setHours(8,0,0,0);
	
	var tomorrow = timeHelper.getTomorrow(now);
	assert(new Date(now.getTime() + (TimeHelperTest.EPG_CONFIG.eventWindowSpan/2)).getTime() - tomorrow < 100);
};

TimeHelperTest.prototype.testYesterday = function() {
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var now = new Date();
	now.setHours(8,0,0,0);
	
	var yesterday = timeHelper.getYesterday(now);
	assert(new Date(now.getTime() - (TimeHelperTest.EPG_CONFIG.eventWindowSpan/2)).getTime() - yesterday < 100);
};

TimeHelperTest.prototype.testYMD = function() {
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var testDate = new Date();
	testDate.setFullYear(1973, 10, 20);
	var formatted = timeHelper.getYMD(testDate);
	assertEquals("1973_11_20", formatted);
	
	testDate.setFullYear(2013, 6, 29);
	formatted = timeHelper.getYMD(testDate);
	assertEquals("2013_7_29", formatted);
	
	testDate.setFullYear(2013, 6, 2);
	formatted = timeHelper.getYMD(testDate);
	assertEquals("2013_7_2", formatted);
};

TimeHelperTest.prototype.testEPGWindow = function() {
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var now = new Date();
	
	var win = timeHelper.getEPGWindow(now);
	now.setHours(6,0,0,0);
	assertEquals(now,  win.EPGWindowStart);
	now.setDate(now.getDate()+1);
	assertEquals(now, win.EPGWindowEnd);
};

TimeHelperTest.prototype.testEPGSpan = function() {
	var timeHelper = new $U.epg.util.TimeHelper(TimeHelperTest.EPG_CONFIG);
	var span = timeHelper.getEPGSpanInDays();
	assertEquals(8, span);
};
