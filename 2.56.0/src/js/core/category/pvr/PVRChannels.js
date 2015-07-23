/**
 * Retrieves PVR Channel asset items
 * Wraps the JSFW PVR Channel functionality
 * @class $U.core.category.pvr.PVRChannels
 *
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRChannels = ( function() {

	var logger = $U.core.Logger.getLogger("PVRChannels");

	//array of PVR channel assetIds
	var channels = null;
	var dataProvider = null;

	/**
	 * Returns the Array of PVR Recorded items in a form that can displayed in an asset container
	 * @return {Array} The manipulated items
	 */
	var getCustomCategoryItems = function() {
		var i;
		var len = channels.length;
		var items = [];

		for ( i = 0; i < len; i++) {
			items.push({
				type : $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL,
				data : [channels[i]]
			});
		}

		return items;
	};
	
	function getDataProvider() {
		if (dataProvider === null) {
			dataProvider = $U.epg.dataprovider.BTVDataProvider.getInstance();
		}
		return dataProvider;
	}

	/**
	 * Retrieves the recorded assets from the PVR Device,
	 * Should be called on every remove and add to keep the consistency across the devices for the account
	 * @param {Function} successCallback the callback to use if successful
	 */
	var getChannelsFromServer = function(successCallback) {

		var callback = function(assetsFromServer) {
			// if (logger) {
			// logger.log("_settingPVRRecorded", "PVRChannels: " + JSON.stringify(assetsFromServer));
			// }
			channels = assetsFromServer;

			if ( typeof successCallback === "function") {
				successCallback();
			}
		};

		if ($U.core.Gateway.isGatewayFound()) {
			if (channels === null || channels.length === 0) {
				//$N.services.gateway.dlna.MediaDevice.fetchChannels(callback);
				getDataProvider().fetchChannels(callback);
			} else {
				callback(channels);
			}
		} else {
			window.setTimeout(function() {
				callback([]);
			}, 1);
		}

	};

	/**
	 * Initialises the service
	 */
	var initialise = function() {
		//Stub, no functionality currently
	};

	return {
		initialise : initialise,
		getCustomCategoryItems : getCustomCategoryItems,
		getChannelsFromServer : getChannelsFromServer
	};

}());
