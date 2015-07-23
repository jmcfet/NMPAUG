/*jshint newcap: false*/

var VodAssetTileTest = AsyncTestCase("VODAssetTileTest");

VodAssetTileTest.prototype.testConstructor = function (queue) {

	// Create DOM
	/*:DOC += <div id="container"></div> */

	var container = document.getElementById("container");
	var imageSrc = TEST_ENV.STATIC_SERVER + "/red_rect_200_200.png";
	var type = $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER;
	var vodAssetTile;

	queue.call("Step 1: create a VodAssetTile", function (callbacks) {
		var loaded = callbacks.noop();
		var failed = callbacks.addErrback("");
		var owner = VodAssetTileTest.createOwner(loaded, failed);
		vodAssetTile = new $U.core.widgets.assettile.VodAssetTile ("test", container, owner, VodAssetTileTest.asset, 500, 500, 2 / 3, type, imageSrc);
		vodAssetTile.load();
	});

	queue.call("Step 2: Check the VodAssetTile", function (callbacks) {
		//assertEquals(true, vodAssetTile);
	});

};

VodAssetTileTest.createOwner = function (loaded, failed) {
	return {
		assetTileLoadSuccess : function (vodAssetTile) {
			loaded();
		},
		assetTileLoadFailure : function (vodAssetTile) {
			failed("image load failed");
		}
	};
};

VodAssetTileTest.asset = {
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
