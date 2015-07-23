/*jshint newcap: false*/

var LoggerTest = TestCase("LoggerTest");

LoggerTest.prototype.testLogerIsAssigned = function() {	
	var logger = $U.core.Logger.getLogger("context");		
	assertNotNull("Loger should be assigned", logger);
};

// LoggerTest.prototype.testLogerIsNotAssigned = function() {	
	// $U.logEnabled = false;
	// var logger = $U.core.Logger.getLogger("context");		
	// assertNull("Loger should not be assigned", logger);
	// $U.logEnabled = true;
// };

LoggerTest.prototype.testSameContexts = function() {
	var logger1 = $U.core.Logger.getLogger("context1");	
	var logger2 = $U.core.Logger.getLogger("context1");	
	assertSame("Same contexts should get same loggers", logger1, logger2);
};

LoggerTest.prototype.testDifferentContexts = function() {
	var logger1 = $U.core.Logger.getLogger("context1");	
	var logger2 = $U.core.Logger.getLogger("context2");	
	assertNotSame("Different contexts should get different loggers", logger1, logger2);
};

