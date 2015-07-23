/**
 * Retrieves Recently Viewed asset items
 * Wraps the JSFW recently watched functionality
 * @class $U.core.category.recentlyviewed.RecentlyViewed
 *
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.recentlyviewed = $U.core.category.recentlyviewed || {};

$U.core.category.recentlyviewed.RecentlyViewed = ( function() {

	var logger = $U.core.Logger.getLogger("RecentlyViewed");

	// Time in ms to wait before giving up on getting response from JSFW
	var FAIL_TIMEOUT = 2000;

	//array of RecentlyViewed assetIds
	var recentlyViewed = null;
	var recentlyWatchedService = null;
	/**
	 * Get sets the recently viewed service
	 * @return {Object} recently viewed service
	 * @private
	 */
	function getRecentlyWatchedService() {
		if (!recentlyWatchedService) {

			recentlyWatchedService = $N.services.sdp.ViewingStats;
		}
		return recentlyWatchedService;
	}

	/**
	 * Maps the mediaType from the mediaScreen to that used in the JSFW recently watched service
	 * @param {$U.core.mediaitem.MediaItemType} mediaType use in the mediaScreen
	 * @return {number} the type used by JSFW
	 * @private
	 */
	var _mapMediaTypes = function(mediaType) {
		var type;
		switch(mediaType) {
		// BTVEVENT and BTVCHANNEL both map to BTV
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
		case $U.core.mediaitem.MediaItemType.BTVCHANNEL:
			type = getRecentlyWatchedService().CONTENT_TYPE.BTV;
			break;
		default:
			type = getRecentlyWatchedService().CONTENT_TYPE.VOD;
		}
		return type;
	};

	/**
	 * Registers a watched item
	 * This is called by the 'play button' in the mediacard
	 * @param {$U.core.mediaitem.MediaItem} item the item to toggle
	 */
	var registerWatch = function(item) {
		var type = _mapMediaTypes(item.type);
		var assetId;

		if (item.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			assetId = item.channel.serviceId;
		} else {
			assetId = item.id;
		}

		if (logger) {
			logger.log("registerWatch", "Registered as watched: " + assetId + "|" + type);
		}

		$N.services.sdp.ViewingStats.registerWatch(assetId, type);
	};

	/**
	 * Maps the contentType from the JSFW recently watched service to that used by the customCategories
	 * @param {number} type used by JSFW
	 * @return {number} the contentType used in customCategories
	 * @private
	 */
	var _mapCustomCategoryTypes = function(type) {
		var contentType;
		var types = getRecentlyWatchedService().CONTENT_TYPE;

		switch(type) {
		case types.BTV:
			contentType = $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL;
			break;
		default:
			contentType = $U.core.CategoryConfiguration.CONTENT_TYPE.VOD;
		}
		return contentType;
	};

	/**
	 * Returns the Array of recently viewed items in a form that can displayed in an asset container
	 * @return the manipulated items
	 */
	var getCustomCategoryItems = function() {
		var i;
		var len = recentlyViewed.length;
		var items = [];

		for ( i = 0; i < len; i++) {
			items.push({
				type : _mapCustomCategoryTypes(recentlyViewed[i].cT),
				data : [recentlyViewed[i].cId]
			});
		}

		return items;
	};

	/**
	 * Retrieves the recently watched assets from the server,
	 * should be called on every remove and add to keep the consistency across the devices for the account
	 * @param {Function} successCallback the callback to use if successful
	 */

	var getRecentlyWatchedFromServer = function(successCallback) {
		var asyncCallback;
		var timerId;
		var alreadyCalled = false;
		var callback = function(assetsFromServer) {
			if (logger) {
				logger.log("_settingLocalRecentlyWatched", "recentlywatched: " + JSON.stringify(assetsFromServer), alreadyCalled ? " <-- ignoring callback, already called!" : "");
			}
			window.clearTimeout(timerId);
			if (!alreadyCalled) {
				recentlyViewed = assetsFromServer;
				if ( typeof successCallback === "function") {
					successCallback();
				}
				alreadyCalled = true;
			}
		};

		if (logger) {
			logger.log("getRecentlyWatchedFromServer");
		}

		// Wrap the callback function up to make sure it's called asynchronously
		asyncCallback = function(result) {
			window.setTimeout(function() {
				callback(result);
			}, 0);
		};
		getRecentlyWatchedService().getRecentlyWatched(asyncCallback);

		// This is an (unsatisfactory) workaround for MSUI-1072
		timerId = window.setTimeout(function() {
			if (logger) {
				logger.log("getRecentlyWatchedFromServer", "Timeout: no response received from getRecentlyWatched within " + FAIL_TIMEOUT + "ms");
			}
			callback([]);
		}, FAIL_TIMEOUT);
	};

	/**
	 * Initialises the service, gets the current recently viewed items from the server
	 */
	var initialise = function() {

		var config = {
			maxWatchedItems : $U.core.Configuration.RECENTLY_VIEWED.MAXITEMS,
			itemsExpiry : $U.core.Configuration.RECENTLY_VIEWED.EXPIRY,
			useLocalStorage : $U.core.Configuration.RECENTLY_VIEWED.USELOCAL
		};

		getRecentlyWatchedService().initialise(config);
	};

	return {
		initialise : initialise,
		getCustomCategoryItems : getCustomCategoryItems,
		getRecentlyWatchedFromServer : getRecentlyWatchedFromServer,
		registerWatch : registerWatch
	};

}());
