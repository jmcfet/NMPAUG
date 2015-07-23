/**
 * Singleton class that retrieves catalogue data from MDS on behalf of MenuData
 *
 * @class $U.core.menudata.MDSAdapter
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.MDSAdapter = ( function() {

	var logger = $U.core.Logger.getLogger("MDSAdapter");

	var MAXINT = Math.pow(2, 31) - 1;

	var callCounter = 0;
		
	var catalogueData;

	function getRootCatalogues(catalogueSuccessCallback, detailSuccessCallback, failureCallback) {
		fetchData(catalogueSuccessCallback, detailSuccessCallback, failureCallback);
	}

	function fetchData(catalogueSuccessCallback, detailSuccessCallback, failureCallback) {
		var metaDataService = $N.services.sdp.MetadataService;
		var requestType = metaDataService.RequestType.Catalogues;
		var filter = {};
		var sortOrder = null;
		var fieldList = ["id", "Rating", "parent", "Title"];
		var count = MAXINT;
		var offset = 0;
		var successCallback = function(items, totalCount) {
			catalogueData = items.nodes;
			doGetRootCatalogues(catalogueSuccessCallback, detailSuccessCallback, failureCallback);
		};
		metaDataService.getVODData(this, successCallback, failureCallback, requestType, filter, sortOrder, fieldList, count, offset);
		//$N.services.sdp.VOD.getDetailedCatalogues(null, successCallback, failureCallback, null);
	}

	function doGetRootCatalogues(catalogueSuccessCallback, detailSuccessCallback, failureCallback) {
		var result = getChildren(null);
		if (catalogueSuccessCallback) {
			// Timeout required here so that async code in MenuData works
			window.setTimeout(function() {
				catalogueSuccessCallback(result);
			}, 1);
		}
		if (detailSuccessCallback) {
			// Timeout required here so that async code in MenuData works
			window.setTimeout(function() {
				detailSuccessCallback(result);
			}, 1);
		}
	}

	function getDetailedCatalogues(catalogueSuccessCallback, detailSuccessCallback, failureCallback, catalogueUID) {
		var result = getChildren(catalogueUID);
		if (catalogueSuccessCallback) {
			window.setTimeout(function() {
				catalogueSuccessCallback(result);
			}, 1);
		}
		if (detailSuccessCallback) {
			window.setTimeout(function() {
				detailSuccessCallback(result);
			}, 1);
		}
	}

	function getChildren(parent) {
		var result = [];
		var catalogue;
		var i;
		for ( i = 0; i < catalogueData.length; i++) {
			if (catalogueData[i].parent === parent) {
				result.push(catalogueData[i]);
			}
		}
		callCounter++;
		return result;
	}

	function getAssets(catalogueConfiguration, returnCallback) {
		if ( typeof catalogueConfiguration === "string") {
			$N.services.sdp.VOD.getAssets(catalogueConfiguration, returnCallback);
		} else {
			// Get the assets that are not part of a series
			getAssetsFromMultipleCatalogues(catalogueConfiguration, function(items, totalCount) {
				// If this is page 1 then prepend assets to represent any series
				if (catalogueConfiguration.offset === 0) {
					addSeries(items, totalCount, catalogueConfiguration, returnCallback);
				} else {
					returnCallback(items, totalCount);
				}
			});
		}
	}

	// Prepend assets to represent any series
	function addSeries(items, totalCount, catalogueConfiguration, returnCallback) {
		getSeriesFromMultipleCatalogues(catalogueConfiguration, function(series) {
			returnCallback(series.concat(items), totalCount);
		});
	}

	// Get assets to represent any series
	function getSeriesFromMultipleCatalogues(catalogueConfiguration, returnCallback) {
		var filter = {
			"editorial.seriesRef" : { "$gt" : "" }
		};
		var fieldList = ["editorial.seriesRef"];
		function callback(results) {
			getSeriesData(results, returnCallback);
		}
		getAssetsFromMultipleCatalogues(catalogueConfiguration, callback, filter, fieldList);
	}

	function getSeriesData(results, returnCallback) {
		var metaDataService = $N.services.sdp.MetadataService;
		var requestType = metaDataService.RequestType.Series;
		var sortOrder = [["title", 1]];
		var count = MAXINT;
		var offset = 0;
		var fieldList = null;
		var filter = {};
		var seriesRefs = new $U.core.util.SimpleSet();

		var successCallback = function(results) {
			var series = results.series;
			// The result is a list of series objects
			// We need to mark them so the caller can differentiate between series and assets
			series.forEach(function(result) {
				result.isSeriesContainer = true;
			});
			returnCallback(series, series.length);
		};

		var failureCallback = function(result) {
			if (logger) {
				logger.log("getSeriesData", "failure callback " + JSON.stringify(result));
			}
			returnCallback([], 0);
		};

		// Find the set of series ids
		results.forEach(function(result) {
			seriesRefs.add(result.seriesRef);
		});

		seriesRefs = seriesRefs.toArray();
		filter.id = {"$in" : seriesRefs};

		if (logger) {
			logger.log("getSeriesFromMultipleCatalogues", seriesRefs);
		}

		metaDataService.getVODData(this, successCallback, failureCallback, requestType, filter, sortOrder, fieldList, count, offset);
	}

	function getAssetsFromMultipleCatalogues(catalogueConfiguration, returnCallback, filter, fieldList) {

		var metaDataService = $N.services.sdp.MetadataService;
		var requestType = metaDataService.RequestType.Assets;
		var sortOrder = [["editorial.title", 1]];
		var count = catalogueConfiguration.count;
		var offset = catalogueConfiguration.offset;
		var filterValue;
		var deviceTypeFilterValue;
		var parentalRatingFilterValue;

		var successCallback = function(result) {
			returnCallback(result.editorials, getTotalRecords(result));
		};

		var failureCallback = function(result) {
			if (logger) {
				logger.log("getAssetsFromMultipleCatalogues", "failure callback " + JSON.stringify(result));
			}
			returnCallback([], 0, 0, 0);
		};

		filter = filter || {};

		if (catalogueConfiguration.ids.length === 1) {
			filterValue = catalogueConfiguration.ids[0];
		} else {
			filterValue = {
				"$in" : catalogueConfiguration.ids
			};
		}

		filter["voditem.nodeRefs"] = filterValue;
		filter.isVisible = true;
		if ($U.core.Gateway.isGatewayAvailable()) {
			filter.isPurchasable = true;
		}

		// We need to specify our device type when retrieving catalogue data currently we are getting this
		// from our feature name list however this is a band aid until we can get this information from the
		// SDP call getCurrentContext (which we use in our SignOn class getContextAndLaunch method)
		if ($U.core.Device.getDeviceNameList()) {
			deviceTypeFilterValue = {
				"$in" : $U.core.Device.getDeviceNameList()
			};

			filter["technical.deviceType"] = deviceTypeFilterValue;
		}

		// If no editorial.seriesRef filter exists then we don't want any assets that are members of a series
		filter["editorial.seriesRef"] = filter["editorial.seriesRef"] || { "$in" : [null, ""] };

		// Add a filter for parental rating if one is set
		if ($U.core.parentalcontrols.ParentalControls.isLocked()) {
			filter["editorial.Rating.precedence"] = { "$lte" : $U.core.parentalcontrols.ParentalControls.getCurrentRating() };
		}

		// This is for the multi-pricing feature. We want retrieve only editorial data where products Profile Name match the
		// locality (price category) OR where the product type is subscription
		if ($U.core.Configuration.MULTI_PRICING_ENABLED) {
			if ($U.core.signon.priceCategory) {
				filter["$or"] = [{
					"product.ProfileName" : $U.core.signon.priceCategory
				},{
					"product.type" : "subscription"
				}];
			}
		}

		// Not going through NINJA because we want to get for multiple categories in one go. This functionality could be pushed up
		// into NINJA
		metaDataService.getVODData(this, successCallback, failureCallback, requestType, filter, sortOrder, fieldList, count, offset);
	}

	function getCallCounter() {
		return callCounter;
	}

	function getTotalRecords(result) {
		/* jshint camelcase: false */
		return result.total_records;
	}

	function getSeriesTitleForAsset(asset, callback) {
		function successCallback(series) {
			var result = series && series.series && series.series[0] && series.series[0].Title || "";
			callback(result);
		}
		function failureCallback() {
			callback("");
		}
		$N.services.sdp.VOD.getSeriesForAsset(asset, successCallback, failureCallback);
	}

	function getAssetsInSeriesForAsset(asset, seriesTitle, callback) {
		var rating;

		function successCallback(series) {
			var assets = [];
			var editorials = series.editorials;
			var l = editorials.length;
			var i;
			var header = $U.core.View.getHeader();
			var seriesItem;

			// Create VODItems for the returned editorials
			for ( i = 0; i < l; i++) {
				seriesItem = new $U.core.mediaitem.VODSeriesItem(editorials[i], seriesTitle);
				assets.push(seriesItem);
			}

			// Sort according to episode number
			// Note that this does assume that the episodeNumbers are in fact numeric
			assets.sort(function(a, b) {
				return a.episodeNumber - b.episodeNumber;
			});

			callback(assets);
		}

		function failureCallback() {
			callback([]);
		}

		if ($U.core.parentalcontrols.ParentalControls.isLocked()) {
			rating = $U.core.parentalcontrols.ParentalControls.getCurrentRating();
		}

		$N.services.sdp.VOD.getAssetsInSeriesForAsset(asset, successCallback, failureCallback, {"rating": rating});
	}

	/**
	 * Gets a catchup VOD asset corresponding to the provided btvEvent
	 * @param {Object} btvEvent event to get catchup asset for
	 * @param {Function} callback function to execute once complete
	 */
	function getCatchupAssetForBtvEvent(btvEvent, callback) {
		var filter = {
			'editorial.ProgramId': btvEvent.id
		};
		var success = function (data) {
			var i;
			var len;
			var editorials = data.editorials;
			var asset;
			for (i = 0, len = editorials.length; i < len; i++) {
				asset = new $U.core.mediaitem.CatchUpMediaItem(editorials[i], btvEvent.channel, btvEvent);
				break;
			}
			callback(asset);
		};
		var failure = function (data) {
			callback();
		};
		$N.services.sdp.VOD.getVODData(success, failure, $N.services.sdp.MetadataService.RequestType.Assets, filter);
	}

	/**
	 * Returns static recommendations for a Media item the returned item is determined by the combined flag.
	 * If combined is not set, an Object with rank ordered arrays for editorials and programmes is returned
	 * If combined is set, a rank ordered array of mixed BTV and VOD assets is returned.
	 * @method getStaticRecommendationsForAsset
	 * @param {Object} asset - the Media asset
	 * @param {Object} successCallback
	 * @param {Boolean}	combined - optional parameter to specify whether to return BTV and VOD events sorted by rank in a flat array
	 * @private
	 */
	function getStaticRecommendationsForAsset(asset, callback, combined) {
		var filter = {}, fieldList = {}, vodAssets, btvAssets,
		failureCallback = function (result) {
			if (logger) {
				logger.log("getStaticRecommendationsForAsset", "failure callback " + JSON.stringify(result));
			}
			return callback();
		},
		successCallback = function (data) {
			var wlaMediaItems,allAssets,i,items=[],length,
			getVODItems = function (vodMediaItems) {
				wlaMediaItems.editorials = vodMediaItems;
				return callback(wlaMediaItems);
			},
			getBTVItems = function(btvMediaItems) {
				wlaMediaItems.programmes = btvMediaItems;
				if (data.editorials) {
					$U.core.mediaitem.MediaItemHelper.fetchMediaItems(data.editorials, getVODItems);
				} else {
					return callback(wlaMediaItems);
				}
			};

			if (!data) { return callback();	}

			if (combined) {
				if (data.programmes && data.editorials) {
					allAssets = data.programmes.concat(data.editorials);
					allAssets.sort(	function(a,b) {	return (a.rank > b.rank) ? -1 : (a.rank < b.rank) ? 1 : 0; });
				} else {
					allAssets = (data.programmes) ? data.programmes : data.editorials;
				}
				if (!allAssets) { return callback(); }

				length = allAssets.length;
				for (i = 0; i < length; i++) {
					items.push(allAssets[i].dataObject);
				}
				$U.core.mediaitem.MediaItemHelper.fetchMediaItems(items,function(wlaMediaItems){
					return callback(wlaMediaItems);
				});
			} else {

				wlaMediaItems = {};

				if (data.programmes) {
					$U.core.mediaitem.MediaItemHelper.fetchMediaItems(data.programmes,getBTVItems);
				} else {
					if (data.editorials) {
						$U.core.mediaitem.MediaItemHelper.fetchMediaItems(data.editorials,getVODItems);
					}
				}
			}
		};

		if ($U.core.parentalcontrols.ParentalControls.isLocked()) {
			filter["editorial.Rating.precedence"] =  { "$lte" : $U.core.parentalcontrols.ParentalControls.getCurrentRating() };
		}

		//asset._data and asset.type sent through to de-WLA-ify the data
		$N.services.sdp.StaticRecommendations.getStaticRecommendations(asset._data, asset.type, filter, fieldList, successCallback, failureCallback);
	}

	return {
		getRootCatalogues : getRootCatalogues,
		getDetailedCatalogues : getDetailedCatalogues,
		getAssets : getAssets,
		getCallCounter : getCallCounter,
		getSeriesTitleForAsset : getSeriesTitleForAsset,
		getAssetsInSeriesForAsset : getAssetsInSeriesForAsset,
		getCatchupAssetForBtvEvent: getCatchupAssetForBtvEvent,
		getStaticRecommendationsForAsset : getStaticRecommendationsForAsset
	};

}());

