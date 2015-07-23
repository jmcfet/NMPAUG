/*jshint newcap: false*/
/*global $N:true, $M*/

var MenuDataTest = AsyncTestCase("MenuDataTest");

MenuDataTest.mockDataSource = $M.MockMDS;

/*
 * Set up before test
 */
MenuDataTest.prototype.setUp = function() {

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
	
	$U.epg = $U.epg || {};
	$U.epg.dataprovider = $U.epg.dataprovider || {};
	$U.epg.dataprovider.BTVDataProvider = $U.epg.dataprovider.BTVDataProvider || {};
	$U.epg.dataprovider.BTVDataProvider = $M.MockBTVDataProvider;
};

/*
 * Tear down following test
 */
MenuDataTest.prototype.tearDown = function() {
	// Restore mocked
	$U.core.Configuration = this._Configuration;
	$U.core.parentalcontrols.ParentalControls = this._ParentalControls;
	//$N.services.sdp.VOD = this._VOD;
};

/*
 * Check the basic behaviour of load() and getMenuData()
 */
MenuDataTest.prototype.testBasicMenuStructure = function(queue) {

	var menuData;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to unrestricted
	$U.core.parentalcontrols.ParentalControls.setParentalRating(Number.MAX_VALUE);

	// Get the mock cataloge data with no restriction on tree depth
	queue.call(function(callbacks) {
		$U.core.menudata.MenuData.load(callbacks.noop(), Number.MAX_VALUE, MenuDataTest.mockDataSource);

	});

	// Perform checks on the menudata
	queue.call(function(callbacks) {
		menuData = $U.core.menudata.MenuData.getMenuData();

		// Check that there are the expceted number of root nodes
		assertSame(3, menuData.length);

		// ..and that they have the expected number of descendents
		assertSame(5, menuData[0].getDescendentIds().length);
		assertSame(6, menuData[1].getDescendentIds().length);
		assertSame(1, menuData[2].getDescendentIds().length);

		// Check that "Catalogue 1.2" has expected descendents
		assertSame("Catalogue 1.2", menuData[0].children[1].name);
		assertSame("10", menuData[0].children[1].getDescendentIds()[0]);
		assertSame("11", menuData[0].children[1].getDescendentIds()[1]);

		// Check that there are two node at depth 4 with the expected ids
		assertSame("14", menuData[1].children[0].children[1].children[0].id);
		assertSame("15", menuData[1].children[0].children[1].children[1].id);
	});

};

/*
 * Check the behaviour of load() and getMenuData() when limited to a depth of 2
 */
MenuDataTest.prototype.testDepth2MenuStructure = function(queue) {

	var menuData;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to unrestricted
	$U.core.parentalcontrols.ParentalControls.setParentalRating(Number.MAX_VALUE);

	// Get the mock cataloge data with depth restricted to 2
	queue.call(function(callbacks) {
		$U.core.menudata.MenuData.load(callbacks.noop(), 2, MenuDataTest.mockDataSource);
	});

	// Perform checks on the menudata
	queue.call(function(callbacks) {
		var i, j;

		menuData = $U.core.menudata.MenuData.getMenuData();

		// Check that there are the expceted number of root nodes
		assertSame(3, menuData.length);

		// ..and that they have the expected number of descendents
		assertSame(3, menuData[0].getDescendentIds().length);
		assertSame(2, menuData[1].getDescendentIds().length);
		assertSame(1, menuData[2].getDescendentIds().length);

		// Check that there are no nodes beyond depth 2
		for ( i = 0; i < 2; i++) {
			for ( j = 0; j < menuData[i].children.length; j++) {
				assertSame(0, menuData[i].children[j].getDescendentIds().length);
			}
		}
	});

};

/*
 * Check the behaviour of load() and getMenuData() when limited to a parental rating of 9
 */
MenuDataTest.prototype.testCatalogueParentalControl = function(queue) {

	var menuData;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to 9
	$U.core.parentalcontrols.ParentalControls.setParentalRating(9);

	// Get the mock cataloge data with no restriction on tree depth
	queue.call(function(callbacks) {
		$U.core.menudata.MenuData.load(callbacks.noop(), Number.MAX_VALUE, MenuDataTest.mockDataSource);
	});

	// Perform checks on the menudata
	queue.call(function(callbacks) {
		menuData = $U.core.menudata.MenuData.getMenuData();

		// Check that there are the expceted number of root nodes
		// Root node 3 is dropped since it has a rating of 10
		assertSame(2, menuData.length);

		// Check that Catalogue 2.1.2 has one child and that its id is 15
		// The other child with an id of 14 is dropped since it has a rating of 20
		assertSame(1, menuData[1].children[0].children[1].children.length);
		assertSame("15", menuData[1].children[0].children[1].children[0].id);
	});

};

/*
 * Test the basic behaviour of the fetchAsset function.
 * Catalogue 1 has 4 assets
 * Catalogue 2 has 10 assets
 * Catalogue 3 has 0 assets
 */
MenuDataTest.prototype.testBasicAssets = function(queue) {

	var assets;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to unrestricted
	$U.core.parentalcontrols.ParentalControls.setParentalRating(Number.MAX_VALUE);

	// Get the mock cataloge data with no restriction on tree depth
	queue.call(function(callbacks) {
		$U.core.menudata.MenuData.load(callbacks.noop(), 1, MenuDataTest.mockDataSource);
	});

	// Get the assets for Catalogue 1 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("1", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(4, assets.length);
	});

	// Get the assets for Catalogue 2 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("2", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(10, assets.length);
	});

	// Get the assets for Catalogue 3 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("3", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(0, assets.length);
	});

};

/*
 * Test the basic behaviour of the fetchAsset function with a parental rating of 9
 * Catalogue 1 has 3 assets with rating <= 9
 * Catalogue 2 has 6 assets with rating <= 9
 * Catalogue 3 has 0 assets
 */
MenuDataTest.prototype.testAssetsParentalControl9 = function(queue) {

	var assets;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to 9
	$U.core.parentalcontrols.ParentalControls.setParentalRating(9);

	// Get the mock cataloge data with no restriction on tree depth
	queue.call(function(callbacks) {
		$U.core.menudata.MenuData.load(callbacks.noop(), 1, MenuDataTest.mockDataSource);
	});

	// Get the assets for Catalogue 1 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("1", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(3, assets.length);
	});

	// Get the assets for Catalogue 2 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("2", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(6, assets.length);
	});

	// Get the assets for Catalogue 3 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("3", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(0, assets.length);
	});

};

/*
 * Test the basic behaviour of the fetchAsset function with a parental rating of 29
 * Catalogue 1 has 3 assets with rating <= 9
 * Catalogue 2 has 8 assets with rating <= 9
 * Catalogue 3 has 0 assets
 */
MenuDataTest.prototype.testAssetsParentalControl29 = function(queue) {

	var assets;

	// Use MDS
	$U.core.Configuration.MDS_CONFIG = {};

	// Set rating to 9
	$U.core.parentalcontrols.ParentalControls.setParentalRating(29);

	// Get the mock cataloge data with no restriction on tree depth
	queue.call(function(callbacks) {
		$U.core.menudata.MenuData.load(callbacks.noop(), 1, MenuDataTest.mockDataSource);
	});

	// Get the assets for Catalogue 1 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("1", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(3, assets.length);
	});

	// Get the assets for Catalogue 2 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("2", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(8, assets.length);
	});

	// Get the assets for Catalogue 3 (and all its descendents)
	queue.call(function(callbacks) {
		var nextStep = callbacks.noop();
		function getAssetsReturn(result) {
			assets = result;
			nextStep();
		}


		$U.core.menudata.MenuData.fetchAssets("3", getAssetsReturn);
	});

	// Check that we have the expected number of assets
	queue.call(function(callbacks) {
		assertSame(0, assets.length);
	});

};
