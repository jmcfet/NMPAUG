/*jshint newcap: false*/

var DeviceTest = TestCase("DeviceTest");

DeviceTest.prototype.testPropertyName = function() {
	var propertyName;
	
	// perspective is -webkit prefixed
	propertyName = $U.core.Device.getPropertyNames("perspective");
	assertEquals("-webkit-perspective", propertyName.css);
	assertEquals("WebkitPerspective", propertyName.js);
	
	// page-break-after has no prefix
	propertyName = $U.core.Device.getPropertyNames("page-break-after");
	assertEquals("page-break-after", propertyName.css);
	assertEquals("pageBreakAfter", propertyName.js);		
			
	// box-shadow comes with -webkit and without
	// we should find the unprefixed version
	propertyName = $U.core.Device.getPropertyNames("box-shadow");
	assertEquals("box-shadow", propertyName.css);
	assertEquals("boxShadow", propertyName.js);				
};

