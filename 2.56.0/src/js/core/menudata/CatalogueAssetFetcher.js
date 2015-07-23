/**
 * Fetches catalogue asset data from SDP / MDS
 * @class $U.core.menudata.CatalogueAssetFetcher
 * @constructor
 * @param {$U.core.menudata.CatalogueNode} node the node
 * @param {Function} successCallback the function to call once the assets are fetched
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.CatalogueAssetFetcher = ( function() {

	var logger = $U.core.Logger.getLogger("CatalogueAssetFetcher");

	var ID = 0;

	var proto;

	function CatalogueAssetFetcher(dataSource, isMDS, node, maxDepth, count, offset, successCallback) {

		var i;
		var children;
		var child;
		var ids;

		var that = this;

		this._id = ID++;

		this._dataSource = dataSource;

		// remember the client callback
		this._successCallback = successCallback;

		// should we cancel?
		this._cancel = false;

		// Build a list of catalogues to fetch
		this._assetsFetched = [];
		
		this._totalAssetCount = 0;				

		if (isMDS) {
			// For MDS the list contains objects describing the node ids and the max count
			// Do a single MDS request for all catalogue ids
			ids = [node.id];
			node.getDescendentIds(ids);
			this._cataloguesToFetch = [{
				ids : ids,
				count : count,
				offset : offset
			}];

			// As we have catch up catalogues whose assets need to be decorated with a channel we get all channels here
			$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByLongName(function(allChannelsByLongName) {
				// set all channels
				that._allChannelsByLongName = allChannelsByLongName;
				// Go and get the assets
				that._fetchNextAssets();
			});

		} else {
			// For SDP the list contains catalogue ids
			this._cataloguesToFetch = node.getDescendentIds().slice(0);
			this._cataloguesToFetch.unshift(node.id);
			this._fetchNextAssets();
		}


		if (logger) {
			this._logCataloguesToFetch();
		}

	}

	proto = CatalogueAssetFetcher.prototype;

	Object.defineProperties(proto, {
		/**
		 * @property {Number} id this CatalogueAssetFetcher's id
		 * @readonly
		 */
		"id" : {
			get : function() {
				return this._id;
			}
		},
		
		/**
		 * @property {Number} totalAssetCount the total number of assets that could be fetched
		 * @readonly
		 */		
		"totalAssetCount" : {
			get : function() {
				return this._totalAssetCount;
			}
		}
	});

	proto.cancel = function() {
		this._cancel = true;
	};

	proto._logCataloguesToFetch = function() {
		var l = this._cataloguesToFetch.length;
		var i;
		var c;
		for ( i = 0; i < l; i++) {
			c = this._cataloguesToFetch[i];
			if (logger) {
				logger.log("logCataloguesToFetch", "fetcherId: " + this.id + " catalogue ids: " + (c.ids || c) + " count: " + (c.count || "ALL"));
			}
		}
	};

	/**
	 * @private
	 */
	proto._fetchNextAssets = function() {
		var self = this;
		var id = this._cataloguesToFetch[0];
		this._dataSource.getAssets(id, function(items, totalCount) {
			self._fetchNextAssetsSuccess(items, totalCount);
		});
	};

	/**
	 * @private
	 */
	proto._fetchNextAssetsSuccess = function(items, totalCount) {
		var assetIdsFetched;
		var i;
		var addAsset;
		var channel;

		if (this._cancel) {
			if (logger) {
				logger.log("_fetchNextAssetsSuccess", "fetcherId: " + this.id + " CANCEL");
			}
		} else {

			// Create VODItems for the returned objects
			for ( i = 0; i < items.length; i++) {

				if (items[i].isSeriesContainer) {
					// Create a series container asset tile
					this._assetsFetched.push($U.core.mediaitem.SeriesContainerItem.create(items[i]));
				} else if (items[i].ProgramId) {
					// We use ProgramId to identify if the asset is catchup
					// Get the channel from allChannelsByLongName using the ServiceLongName
					channel = this._allChannelsByLongName[items[i].ServiceLongName];
					// Add them to the array passing the channel to the create method along with asset
					this._assetsFetched.push($U.core.mediaitem.CatchUpMediaItem.create(items[i], channel));
				} else {
					this._assetsFetched.push($U.core.mediaitem.VODItem.create(items[i]));
				}

			}

			this._totalAssetCount += totalCount;
			
			if (logger) {
				logger.log("_fetchNextAssetsSuccess", "fetcherId: " + this.id + " catalogue id: " + (this._cataloguesToFetch[0].ids || this._cataloguesToFetch[0]) + " fetched asset count: " + items.length);
			}

			this._cataloguesToFetch.shift();
			if (this._cataloguesToFetch.length > 0) {
				this._fetchNextAssets();

			} else {
				this._fetchNextAssetsSuccessComplete();
			}
		}
	};

	/**
	 * @private
	 */
	proto._fetchNextAssetsSuccessComplete = function() {
		var assetIdsFetched;
		var i;

		// Drop assets that are duplicates
		this._dropDuplicateAssets();

		// Drop assets that are not permitted
		this._dropUnpermittedAssets();

		if (logger) {
			assetIdsFetched = [];
			for ( i = 0; i < this._assetsFetched.length; i++) {
				assetIdsFetched.push(this._assetsFetched[i].id);
			}
			logger.log("fetchNextAssetsSuccess", "fetcherId: " + this.id + " returning asset ids: " + assetIdsFetched + " count: " + assetIdsFetched.length);
		}

		this._successCallback(this._assetsFetched, this);
	};

	/**
	 * @private
	 */
	proto._dropDuplicateAssets = function() {
		var uniqueAssets = [];
		var uniqueAssetIds = new $U.core.util.SimpleSet();
		var droppedDuplicateIds = [];
		var l = this._assetsFetched.length;
		var i;
		var asset;
		var id;

		for ( i = 0; i < l; i++) {
			asset = this._assetsFetched[i];
			if (uniqueAssetIds.add(asset.id)) {
				uniqueAssets.push(asset);
			} else {
				droppedDuplicateIds.push(asset.id);
			}
		}
		if (logger) {
			logger.log("dropDuplicateAssets", "fetcherId: " + this.id + " dropped duplicates: " + droppedDuplicateIds);
		}
		this._assetsFetched = uniqueAssets;
	};

	/**
	 * @private
	 */
	proto._dropUnpermittedAssets = function() {
		var permittedAssets = [];
		var droppedUnpermittedIds = [];
		var l = this._assetsFetched.length;
		var i;
		var asset;
		var permitted;

		for ( i = 0; i < l; i++) {
			asset = this._assetsFetched[i];
			permitted = $U.core.parentalcontrols.ParentalControls.isRatingPermitted(asset.rating);
			if (permitted) {
				permittedAssets.push(asset);
			} else {
				droppedUnpermittedIds.push(asset.id);
			}
		}
		if (logger) {
			logger.log("dropUnpermittedAssets", "fetcherId: " + this.id + " dropped unpermitted: " + droppedUnpermittedIds);
		}
		this._assetsFetched = permittedAssets;
	};

	return CatalogueAssetFetcher;

}());
