/*jshint newcap: false*/
/*global $N:true, $M*/

var MenuDataTestCaptured070813 = AsyncTestCase("MenuDataTestCaptured070813");

// Mock data source
MenuDataTestCaptured070813.mockDataSource = $M.MockMDSCaptured070813;

/*
 * Set up before test
 */
MenuDataTestCaptured070813.prototype.setUp = function() {

	// Set up mock Configuration
	$U = $U || {};
	$U.core = $U.core || {};
	this._Configuration = $U.core.Configuration;
	$U.core.Configuration = {};
	
	// No custom categories
	$U.core.Configuration.CUSTOM_CATEGORIES = false;
	
	// No featured
	$U.core.Configuration.getFeatured = function() {
		return undefined;
	};	

	// Set up mock ParentalControls
	$U.core.parentalcontrols = $U.core.parentalcontrols || {};
	this._ParentalControls = $U.core.parentalcontrols.ParentalControls;
	$U.core.parentalcontrols.ParentalControls = $M.MockParentalControls;	
};

/*
 * Tear down following test
 */
MenuDataTestCaptured070813.prototype.tearDown = function() {
	// Restore mocked
	$U.core.Configuration = this._Configuraton;
	$U.core.parentalcontrols.ParentalControls = this._ParentalControls;
};

/*
 * Check the behaviour of load() and getMenuData() when limited to a depth of 2 
 */
MenuDataTestCaptured070813.prototype.testDepth2MenuStructure = function(queue) {

	var menuData;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};
	
	// Set rating to unrestricted
	$U.core.parentalcontrols.ParentalControls.setParentalRating(Number.MAX_VALUE);	

	// Get the mock cataloge data with depth restricted to 2
	queue.call(function(callbacks) {		
		$U.core.menudata.MenuData.load(callbacks.noop(), 2, MenuDataTestCaptured070813.mockDataSource);
	});

	// Perform checks on the menudata
	queue.call(function(callbacks) {
		var i, j;
		
		menuData = $U.core.menudata.MenuData.getMenuData();

		// Check that there are the expceted number of root nodes
		assertSame(7, menuData.length);

		// ..and that they have the expected number of descendents
		assertSame(6, menuData[0].getDescendentIds().length);
		assertSame(0, menuData[1].getDescendentIds().length);
		assertSame(5, menuData[2].getDescendentIds().length);

		// Check that there are no nodes beyond depth 2
		for ( i = 0; i < 2; i++) {
			for ( j = 0; j < menuData[i].children.length; j++) {
				assertSame(0, menuData[i].children[j].getDescendentIds().length);
			}
		}
	});

};

/*
 * Check the behaviour of load() and getMenuData() when limited to a parental rating of 0
 */
MenuDataTestCaptured070813.prototype.testCatalogueParentalControl = function(queue) {

	var menuData;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to 9
	$U.core.parentalcontrols.ParentalControls.setParentalRating(0);

	// Get the mock cataloge data with depth restricted to 2
	queue.call(function(callbacks) {		
		$U.core.menudata.MenuData.load(callbacks.noop(), 2, MenuDataTestCaptured070813.mockDataSource);
	});

	// Perform checks on the menudata
	queue.call(function(callbacks) {
		menuData = $U.core.menudata.MenuData.getMenuData();
		
		// Check that there are the expceted number of root nodes
		assertSame(3, menuData.length);

		// ..and that they have the expected number of descendents
		assertSame(1, menuData[0].getDescendentIds().length);
		assertSame(0, menuData[1].getDescendentIds().length);
		assertSame(1, menuData[2].getDescendentIds().length);		

		// Check that Catalogue 2.1.2 has one child and that its id is 15
		// The other child with an id of 14 is dropped since it has a rating of 20
//		assertSame(1, menuData[1].children[0].children[1].children.length);
//		assertSame("15", menuData[1].children[0].children[1].children[0].id);
	});

};

