/*jshint newcap: false*/

var AssetTileTest = AsyncTestCase("AssetTileTest");

/**
 * Test a 200 x 200 image in a 500 x 500 tile with a 2 x 3 aspect ratio.
 * Image should be sized at 500 x 500 with a visible region 333 x 500
 * and so have have a clip of (0, 417, 500, 84)
 */
AssetTileTest.prototype.test200x200ImageIn2x3AspectRatio = function (queue) {

	// Create DOM
	/*:DOC += <div id="container"></div> */

	var container = document.getElementById("container");
	var imgSrc = TEST_ENV.STATIC_SERVER + "/red_rect_200_200.png";
	var assetTile;

	queue.call("Step 1: create an AssetTile", function (callbacks) {
		var assetTileLoaded = callbacks.noop();
		var owner = AssetTileTest.createOwner(assetTileLoaded);
		assetTile = new $U.core.widgets.AssetTile (owner, AssetTileTest.asset, container, imgSrc, $U.core.widgets.AssetTile.TYPE_POSTER, 500, 500, 2 / 3);
	});

	queue.call("Step 2: Check the AssetTile image size and clip", function (callbacks) {

		assertEquals("image.width", 500, assetTile._image.width);
		assertEquals("image.height", 500, assetTile._image.height);

		// Extract the numbers from the image's clip
		var clip = assetTile._image.style.clip;
		var result = clip.match(/\d+(?:\.\d+)?/g);

		// Check that we have four numbers
		assertEquals("image.style.clip.length", 4, result.length);

		// Check that each is as we expect
		assertEquals("Clip top", 0, result[0]);
		assertEquals("Clip right", 417, result[1]);
		assertEquals("Clip bottom", 500, result[2]);
		assertEquals("Clip left", 84, result[3]);
	});

};

/**
 * Test a 200 x 200 image in a 1500 x 500 tile with a 14 x 9 aspect ratio.
 * Image should be sized at 778 x 778 with a visible region 778 x 500
 * and so have have a clip of (139, 778, 639, 0)
 */
AssetTileTest.prototype.test200x200ImageIn14x9Tile = function (queue) {

	// Create DOM
	/*:DOC += <div id="container"></div> */

	//owner, asset, container, imageSrc, type, width, height

	var container = document.getElementById("container");
	var imgSrc = TEST_ENV.STATIC_SERVER + "/red_rect_200_200.png";
	var assetTile;

	queue.call("Step 1: create an AssetTile", function (callbacks) {
		var assetTileLoaded = callbacks.noop();
		var owner = AssetTileTest.createOwner(assetTileLoaded);
		assetTile = new $U.core.widgets.AssetTile (owner, AssetTileTest.asset, container, imgSrc, $U.core.widgets.AssetTile.TYPE_POSTER, 1500, 500, 14 / 9);
	});

	queue.call("Step 2: Check the AssetTile image size and clip", function (callbacks) {

		assertEquals("image.width", 778, assetTile._image.width);
		assertEquals("image.height", 778, assetTile._image.height);

		// Extract the numbers from the image's clip
		var clip = assetTile._image.style.clip;
		var result = clip.match(/\d+(?:\.\d+)?/g);

		// Check that we have four numbers
		assertEquals("image.style.clip.length", 4, result.length);

		// Check that each is as we expect
		assertEquals("Clip top", 139, result[0]);
		assertEquals("Clip right", 778, result[1]);
		assertEquals("Clip bottom", 639, result[2]);
		assertEquals("Clip left", 0, result[3]);
	});

};

/**
 * Test a 200 x 200 image in a 100 x 150 tile with a 14 x 9 aspect ratio.
 * Image should be sized at 100 x 150 with a visible region 100 x 150
 * and so have have a clip of (0, 100, 150, 0)
 */
AssetTileTest.prototype.test300x200ImageIn3x2Tile = function (queue) {

	// Create DOM
	/*:DOC += <div id="container"></div> */

	//owner, asset, container, imageSrc, type, width, height

	var container = document.getElementById("container");
	var imgSrc = TEST_ENV.STATIC_SERVER + "/red_rect_200_300.png";
	var assetTile;

	queue.call("Step 1: create an AssetTile", function (callbacks) {
		var assetTileLoaded = callbacks.noop();
		var owner = AssetTileTest.createOwner(assetTileLoaded);
		assetTile = new $U.core.widgets.AssetTile (owner, AssetTileTest.asset, container, imgSrc, $U.core.widgets.AssetTile.TYPE_POSTER, 100, 150, 2 / 3);
	});

	queue.call("Step 2: Check the AssetTile image size and clip", function (callbacks) {

		assertEquals("image.width", 100, assetTile._image.width);
		assertEquals("image.height", 150, assetTile._image.height);

		// Extract the numbers from the image's clip
		var clip = assetTile._image.style.clip;
		var result = clip.match(/\d+(?:\.\d+)?/g);

		// Check that we have four numbers
		assertEquals("image.style.clip.length", 4, result.length);

		// Check that each is as we expect
		assertEquals("Clip top", 0, result[0]);
		assertEquals("Clip right", 100, result[1]);
		assertEquals("Clip bottom", 150, result[2]);
		assertEquals("Clip left", 0, result[3]);
	});

};

AssetTileTest.createOwner = function (assetTileLoadHandler) {
	return {
		assetTileLoadHandler : function (assetTile) {
			assetTileLoadHandler();
		}
	};
};

AssetTileTest.asset = {
	"editorialAsset" : {
		"actors" : "Edward James Olmos;Mary McDonnell;Jamie Bamber;Tricia Helfer;Grace Park",
		"aspectRatio" : "1",
		"assetList" : null,
		"assetOrder" : null,
		"assetPlayType" : "E",
		"assetType" : "VE",
		"audioMode" : "5.1",
		"audioPid" : [],
		"audioSubtracks" : null,
		"bestSalesIndex" : null,
		"casDescriptor" : null,
		"casId" : null,
		"changeLog" : null,
		"contentType" : null,
		"copyProtections" : null,
		"copyright" : null,
		"countries" : "US",
		"creationDate" : 1342181088000,
		"cuBroadcastChannelName" : null,
		"cuBroadcastEndDate" : null,
		"cuBroadcastStartDate" : null,
		"definition" : "HD",
		"description" : "After losing the war against the Cylon robots, the Battlestar Galactica crew speed toward the fabled 13th colony, Earth. Galactica Commander Adama and President Laura Roslin face waning supplies, crushed morale, ... and the credible threat Cylons aboard the ship.",
		"directors" : null,
		"dualMono" : "false",
		"duration" : 30,
		"durationMillis" : 1800000,
		"encoding" : null,
		"exportID" : null,
		"fileName" : null,
		"fileSize" : null,
		"genre" : "ScienceFiction;Action-Adventure",
		"hearingImpaired" : null,
		"language" : "eng",
		"locale" : "en_gb",
		"longDescription" : "After losing the war against the Cylon robots, the Battlestar Galactica crew speed toward the fabled 13th colony, Earth. Galactica Commander Adama and President Laura Roslin face waning supplies, crushed morale, ... and the credible threat Cylons aboard the ship.",
		"mainContentUID" : null,
		"modifiedDate" : 1355130944000,
		"modifiedDateML" : 1355130944000,
		"name" : "Battlestar Galactica",
		"originID" : 1,
		"originIdAndKey" : "1|LYS000001859",
		"originKey" : "LYS000001859",
		"ownerID" : "CMS4",
		"parentAclUID" : null,
		"parentPolicyGroupUID" : null,
		"parentalRating" : 5,
		"pmtString" : null,
		"policyGroupUID" : null,
		"producers" : "David Eick",
		"profileUID" : null,
		"programId" : null,
		"promoUrl" : "LYS0004292_battlestar-galactica-h264-2mbs-5min.jpg",
		"recordable" : "false",
		"scoring" : null,
		"seriesId" : null,
		"serviceProviderID" : 1,
		"shortTitle" : "Battlestar Galactica",
		"status" : "A",
		"studio" : null,
		"subTitles" : "false",
		"subscribableItemType" : "AST",
		"subtitleLanguages" : null,
		"totalDownloads" : null,
		"trickPlay" : null,
		"uid" : 37,
		"url" : null,
		"viewingNumber" : null,
		"year" : "2004",
		"nPVR" : "false",
		"pPVPurchase" : "false",
		"subscribed" : "false"
	},
	"scheduledTechnicalItems" : [{
		"assetGroupUid" : null,
		"catalogueUid" : 47,
		"endTime" : 1373150112000,
		"internalOrder" : 0,
		"offers" : [{
			"basePriceUid" : 151,
			"casDescriptor" : null,
			"casId" : null,
			"consumptionWindow" : null,
			"currency" : "EUR",
			"description" : null,
			"expiry" : 21,
			"expiryDurationValue" : 1,
			"expiryDurationValueType" : "DAY",
			"frequency" : "IMP",
			"name" : "Battlestar Galactica",
			"ownerID" : "1",
			"policyGroupUid" : 51,
			"productType" : "258",
			"profileName" : null,
			"recurrence" : null,
			"validFrom" : 1342152000000,
			"validTo" : 1373150112000,
			"value" : 3,
			"viewingNumber" : null
		}],
		"scheduleUid" : 31,
		"startTime" : 1342152000000,
		"status" : "A",
		"technicalAsset" : {
			"actors" : "Edward James Olmos;Mary McDonnell;Jamie Bamber;Tricia Helfer;Grace Park",
			"aspectRatio" : "1",
			"assetList" : null,
			"assetOrder" : null,
			"assetPlayType" : "E",
			"assetType" : "VT",
			"audioMode" : "5.1",
			"audioPid" : [],
			"audioSubtracks" : null,
			"bestSalesIndex" : null,
			"casDescriptor" : null,
			"casId" : null,
			"changeLog" : null,
			"contentType" : null,
			"copyProtections" : null,
			"copyright" : null,
			"countries" : "US",
			"creationDate" : 1342269388000,
			"cuBroadcastChannelName" : null,
			"cuBroadcastEndDate" : null,
			"cuBroadcastStartDate" : null,
			"definition" : "HD",
			"description" : "After losing the war against the Cylon robots, the Battlestar Galactica crew speed toward the fabled 13th colony, Earth. Galactica Commander Adama and President Laura Roslin face waning supplies, crushed morale, ... and the credible threat Cylons aboard the ship.",
			"directors" : null,
			"dualMono" : "false",
			"duration" : 30,
			"durationMillis" : 1800000,
			"encoding" : "AV_PlaylistName",
			"exportID" : null,
			"fileName" : "LYS0004292_battlestar-galactica-h264-8mbs-30min_LYS000001890_20120813_163900/index.m3u8",
			"fileSize" : null,
			"genre" : "ScienceFiction;Action-Adventure",
			"hearingImpaired" : null,
			"language" : "eng",
			"locale" : "en_gb",
			"longDescription" : "After losing the war against the Cylon robots, the Battlestar Galactica crew speed toward the fabled 13th colony, Earth. Galactica Commander Adama and President Laura Roslin face waning supplies, crushed morale, ... and the credible threat Cylons aboard the ship.",
			"mainContentUID" : 37,
			"modifiedDate" : 1355130944000,
			"modifiedDateML" : 1355130944000,
			"name" : "Battlestar Galactica",
			"originID" : 1,
			"originIdAndKey" : "1|LYS000001890",
			"originKey" : "LYS000001890",
			"ownerID" : "CMS4",
			"parentAclUID" : null,
			"parentPolicyGroupUID" : null,
			"parentalRating" : 5,
			"pmtString" : null,
			"policyGroupUID" : null,
			"producers" : "David Eick",
			"profileUID" : 11,
			"programId" : null,
			"promoUrl" : "LYS0004292_battlestar-galactica-h264-2mbs-5min.jpg",
			"recordable" : "false",
			"scoring" : null,
			"seriesId" : null,
			"serviceProviderID" : 1,
			"shortTitle" : "Battlestar Galactica",
			"status" : "A",
			"studio" : null,
			"subTitles" : "false",
			"subscribableItemType" : "AST",
			"subtitleLanguages" : null,
			"totalDownloads" : null,
			"trickPlay" : null,
			"uid" : 41,
			"url" : "LYS0004292_battlestar-galactica-h264-8mbs-30min_LYS000001890_20120813_163900/index.m3u8",
			"viewingNumber" : null,
			"year" : "2004",
			"nPVR" : "false",
			"pPVPurchase" : "false",
			"subscribed" : "false"
		},
		"subscribed" : null
	}]
}; 