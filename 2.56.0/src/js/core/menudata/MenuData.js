/**
 * Singleton class that retrieves catalogue data from SDP / MDS and transforms it into menu configuration data for the UI.
 *
 * @class $U.core.menudata.MenuData
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.MenuData = ( function() {

	var MAXINT = Math.pow(2, 31) - 1;

	// May be overridden by $U.core.Configuration.MAX_MENU_DEPTH
	var DEFAULT_MAX_MENU_DEPTH = 2;

	var logger = $U.core.Logger.getLogger("MenuData");

	// The root of the raw catalogue structure from SDP / MDS
	var root;

	// The root of the transformed structure
	var transformedRoot;

	// The menu structure
	var menuData = [];

	// The catalogues whose assets we need to fetch
	var cataloguesToFetch = null;

	// Callback when asset fetch is complete
	var assetsFetchedSuccessCallback = null;

	// List of assets fetched
	var assetsFetched = null;

	// Callback when load is complete
	var loadCompleteCallback;

	// maxDepth, set from configuration but can be overridden by load method
	var maxDepth;

	// maxChildAssets, set to 2 but can be overridden by load method
	var maxChildAssets = 2;

	var dataSource = null;

	var addCustom = null;

	var addGateway = null;
	
	var customTransformFunction = null;

	function NullFetcher(successCallback) {
		var that = this;
		this.id = "$null";
		window.setTimeout(function() {
			successCallback([], that);
		}, 1);
	}

	function isAddCustom() {
		if (!addCustom) {
			addCustom = $U.core.Configuration.CUSTOM_CATEGORIES;
		}
		return addCustom;
	}

	// Whether this is an MDS environment
	function isMDS() {
		return Boolean($U.core.Configuration.MDS_CONFIG);
	}

	function getDataSource() {
		if (!dataSource) {
			dataSource = isMDS() ? $U.core.menudata.MDSAdapter : $N.services.sdp.VOD;
		}
		return dataSource;
	}

	/**
	 * Loads the catalogue data from SDP / MDS
	 * @param {Function} callback function to call when load is complete
	 * @param {number} [depth] the maximum depth of the menu tree.<br> Useful for testing.
	 * @param {Object} [ds] injected datasource.<br> Useful for testing.*
	 */
	function load(callback, depth, ds) {
		maxDepth = depth || $U.core.Configuration.MAX_MENU_DEPTH || DEFAULT_MAX_MENU_DEPTH;
		if (ds) {
			dataSource = ds;
		}
		loadCompleteCallback = function() {
			callback();
		};
		if(logger){
			logger.timeStampLog("GET THE CATEGORY NODES");
		}
		
		customTransformFunction = $U.core.Configuration.MENU_TRANSFORM_FUNCTION && $U.core.Configuration.MENU_TRANSFORM_FUNCTION(); 
		
		getDataSource().getRootCatalogues(null, rootCatalogueSuccess, rootCatalogueFailure);
	}

	/**
	 * Returns an array of MenuDataNodes for rendering
	 * @return {$U.core.menudata.MenuDataNode[]} then menu data for rendering
	 */
	function getMenuData() {

		menuData = [];
		populateMenuDataMaxDepth(transformedRoot, menuData, maxDepth);
		return menuData;
	}

	/**
	 * Gets the display heading for a node
	 * @param id {string} the id of the node
	 * @return {string} the heading
	 */
	function getHeading(id) {
		var heading = transformedRoot.getNode(id).name;
		if (id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
			heading = $U.core.NPVRManager.getInstance().getBrowseHeading(id);
		}
		return heading;
	}

	/**
	 * Fetch the assets for a node.
	 * @param {string} id the id of the node
	 * @param {Function} successCallback the function to call once the assets are fetched
	 * @param {Number} count the number of assets to fetch
	 * @param {Number} offset the offest of the first asset to fetch
	 * @param {Object[]} successCallback.assets the list of assets fetched
	 * @param {Object} successCallback.fetcher the fetcher used to fectch the assets
	 * @param {Number} successCallback.count the number of assets requested
	 * @param {Number} successCallback.offset the offset of the first asset requested
	 * @param {Boolean} fullLoad if a full async fetch should be executed
	 */
	function fetchAssets(id, successCallback, count, offset, fullLoad) {

		var i;
		var children;
		var child;
		var ids;
		var result = null;
		var node = transformedRoot.getNode(id);
		var fetchHandler;

		// Count is MAXINT unless it's truthy or 0
		count = (count !== 0 && !count) ? MAXINT : count;
		
		// Offset is 0 unless it's truthy
		offset = !offset ? 0 : offset;

		if (logger) {
			logger.log("fetchAssets", "category id requested: " + id);
		}

		if (node === null || node.depth > maxDepth) {
			fetchHandler = function(assets, fetcher) {
				successCallback(assets, fetcher);
			};
			result = new NullFetcher(fetchHandler);

		} else if ( node instanceof $U.core.menudata.AliasNode) {
			result = fetchAssets(node.aliasedId, successCallback, count, offset);

		} else if ( node instanceof $U.core.menudata.CustomNode) {
			fetchHandler = function(assets, fetcher, parentalBlocked) {
				successCallback(assets, fetcher, count, offset, fetcher.totalAssetCount, parentalBlocked);
			};
			node.categoryProvider.fetchItems(fetchHandler, count, offset, fullLoad);
			result = node.categoryProvider;
		} else {
			fetchHandler = function(assets, fetcher) {
				successCallback(assets, fetcher, count, offset, fetcher.totalAssetCount);
			};
			result = new $U.core.menudata.CatalogueAssetFetcher(getDataSource(), isMDS(), node, maxDepth, count, offset, fetchHandler);
		}
		return result;
	}

	function logCataloguesToFetch() {
		var l = cataloguesToFetch.length;
		var i;
		var c;
		for ( i = 0; i < l; i++) {
			c = cataloguesToFetch[i];
			if (logger) {
				logger.log("logCataloguesToFetch", "ids: " + c.ids);
				logger.log("logCataloguesToFetch", "count: " + (c.count || "ALL"));
			}
		}
	}

	function getMenuDataNode(id) {
		var result = null;
		var l = menuData.length;
		var i;
		for ( i = 0; i < l; i++) {
			result = menuData[i].getNode(id);
			if (result) {
				break;
			}
		}
		return result;
	}

	/**
	 * @private
	 */
	function getNode(id) {
		return transformedRoot.getNode(id);
	}

	/**
	 * @private
	 */
	function getAssetId(asset) {
		return isMDS() ? asset.id : asset.editorialAsset.uid;
	}

	/**
	 * @private
	 */
	function populateMenuDataVanilla(catalogueNode, menuData) {
		var l = catalogueNode.children.length;
		var i;
		var n;
		var d;
		for ( i = 0; i < l; i++) {
			n = catalogueNode.children[i];
			d = createMenuDataNode(n, catalogueNode);
			menuData.push(d);
			if (n.children.length > 0) {
				populateMenuDataVanilla(n, d.children);
			}
		}
	}

	/**
	 * @private
	 */
	function populateMenuDataCollapsed(catalogueNode, menuData) {
		var i;
		var l;
		var n;
		var d;
		var vanillaData = [];
		populateMenuDataVanilla(catalogueNode, vanillaData);
		l = vanillaData.length;
		for ( i = 0; i < l; i++) {
			n = vanillaData[i];
			d = createMenuDataNode(n, catalogueNode);
			menuData.push(d);
		}
	}

	/**
	 * @private
	 */
	function populateMenuDataMaxDepth(catalogueNode, menuData, maxDepth, depth) {
		depth = depth || 0;
		var l = catalogueNode.children.length;
		var i;
		var n;
		var d;

		if (maxDepth - depth === 1) {
			populateMenuDataCollapsed(catalogueNode, menuData);
		} else {
			for ( i = 0; i < l; i++) {
				n = catalogueNode.children[i];
				d = createMenuDataNode(n, catalogueNode);
				menuData.push(d);
				if (n.children.length > 0) {
					populateMenuDataMaxDepth(n, d.children, maxDepth, depth + 1);
				}
			}
		}
	}

	/**
	 * @private
	 */
	function createMenuDataNode(node, parent) {
		var isCustom = ( node instanceof $U.core.menudata.CustomNode);
		return new $U.core.menudata.MenuNode(node.id, node.name, parent, node.depth, node.rating, isCustom);
	}

	/**
	 * @private
	 */
	function rootCatalogueSuccess(rootCatalogues) {
		var c;
		var l = rootCatalogues.length;
		root = new $U.core.menudata.RootNode(rootLoadCompleteCallback);
		for ( c = 0; c < l; c++) {
			root.addChild(new $U.core.menudata.CatalogueNode(rootCatalogues[c], root, 1));
		}
	}

	/**
	 * @private
	 * Shows an application error if the catalogues fail to load
	 */
	function rootCatalogueFailure(err) {
		if (logger) {
			logger.log("rootCatalogueFailure", "Error loading the root nodes: " + err);
		}
		$U.core.ConnectionChecker.refreshAfterError();
	}

	/**
	 * @private
	 */
	function rootLoadCompleteCallback() {

		var featured = $U.core.Configuration.getFeatured();
		var featuredNode;
		var featuredName;
		var customNode;
		var categoryProvider;

		transformedRoot = root.clone(null, checkRating);

		// JKOPT : Remove any nodes that should not be shown
		if ($U.core.Configuration.IGNORE_NODES) {
			$U.core.Configuration.IGNORE_NODES.forEach(function(nodeId) {
				var node = transformedRoot.getNode(nodeId);
				if (logger) {
					logger.log("rootLoadCompleteCallback", "removing node:", node);
				}
				transformedRoot.removeChild(node);				
			});
		}

		if (isAddCustom()) {
			//these are added in reverse order, i.e. the first shall be last and the last shall be first
			//categoryProvider = new $U.core.category.test.TestCategoryProvider();
			//customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
			//transformedRoot.insertChild(customNode, 0);

			categoryProvider = new $U.core.category.favourites.FavouritesCategoryProvider();
			customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
			transformedRoot.insertChild(customNode, 0);

			categoryProvider = new $U.core.category.recentlyviewed.RecentlyViewedCategoryProvider();
			customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
			transformedRoot.insertChild(customNode, 0);

			// Only show these menu items if we have a PVR present and configuration calls for it
			if ($U.core.Gateway.isGatewayAllowed()) {

				categoryProvider = new $U.core.category.pvr.PVRRecordedCategoryProvider();
				customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
				transformedRoot.insertChild(customNode, 0);

				categoryProvider = new $U.core.category.pvr.PVRScheduledCategoryProvider();
				customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
				transformedRoot.insertChild(customNode, 0);
				
				if ($U.core.Gateway.isGatewayAvailable()) {
					//this category takes a long time to load (it gets the currently playing event for each channel)
					categoryProvider = new $U.core.category.pvr.PVRChannelsCategoryProvider();
					customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
					transformedRoot.insertChild(customNode, 0);
				
					categoryProvider = new $U.core.category.pvr.PVRNowPlayingCategoryProvider();
					customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
					transformedRoot.insertChild(customNode, 0);					
				}
				
			}
			// Only show these menu items if NPVR is enabled
			if ($U.core.Configuration.NPVR_ENABLED && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
				categoryProvider = new $U.core.category.npvr.NPVRScheduledCategoryProvider();
				customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
				transformedRoot.insertChild(customNode, 0);

				categoryProvider = new $U.core.category.npvr.NPVRCompletedCategoryProvider();
				customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
				transformedRoot.insertChild(customNode, 0);
			}

		}

		if (featured) {
			featuredNode = new $U.core.menudata.AliasNode(featured.id, featured.name, transformedRoot, 1, featured.aliasedId);
			transformedRoot.insertChild(featuredNode, 0);
		}
		
		if ($U.core.Configuration.RECOMMENDATIONS && $U.core.Configuration.RECOMMENDATIONS.FOR_ME) {
			categoryProvider = new $U.core.category.recommendations.RecommendationsCategoryProvider();
			customNode = new $U.core.menudata.CustomNode(transformedRoot, 1, categoryProvider);
			transformedRoot.insertChild(customNode, 0);
		}

		if (logger) {
			//logger.log("rootLoadCompleteCallback", "ROOT\n" + root.toDebugString());
			logger.log("rootLoadCompleteCallback", "TRANS\n" + transformedRoot.toDebugString(), logger.ERROR);
		}

		if (customTransformFunction) {
			customTransformFunction(transformedRoot, loadCompleteCallback);
		} else {
			loadCompleteCallback();
		}		
	}

	/**
	 * Check whether a node's rating is permitted
	 * @param {Object} node
	 * @return {boolean} whether the node passes rating check
	 * @private
	 */
	function checkRating(node) {
		// Drop categories with disallowed rating
		var permitted = $U.core.parentalcontrols.ParentalControls.isRatingPermitted(node.rating);

		// if (logger) {
		// logger.log("dropHighRating", ( permitted ? "PASS " : "DROP: ") + node);
		// }

		return permitted;
	}

	return {
		load : load,
		getMenuData : getMenuData,
		fetchAssets : fetchAssets,
		getHeading : getHeading,
		getDataSource : getDataSource,
		getMenuDataNode : getMenuDataNode
	};

}());
