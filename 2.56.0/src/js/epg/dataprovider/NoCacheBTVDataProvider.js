var $U = $U || {};

$U.epg = $U.epg || {};
$U.epg.dataprovider = $U.epg.dataprovider || {};

$U.epg.dataprovider.NoCacheBTVDataProvider = ( function() {

	/**
	 * Implementation of NoCacheBTVDataProvider
	 * @class $U.epg.dataprovider.NoCacheBTVDataProvider
	 * @singleton
	 */
	var logger = $U.core.Logger.getLogger("NoCacheBTVDataProvider");

	// The JSFW EPG class - will be set in initialise
	var EPG = null;

	// The JSFW Subscriptions class - will be set in initialise
	var SUB = null;

	// Will hold all the channels, in logical channel number order
	var allChannels = null;

	// Will hold all the channels, keyed by service id
	var allChannelsByServiceId = null;

	// Will hold all the channels, keyed by long channel name
	var allChannelsByLongName = null;

	//Will hold all channels in a format that allows creation of properly enriched EPG events
	var allChannelsForMapArray = null;
	
	// Will hold the channels filtered by parental control, in logical channel number order
	var filteredChannels = null;

	// Will hold the subscribed channels, in logical channel number order
	var subscribedChannels = null;

	// Holds the list of callbacks to fire once initialise has completed
	var initialiseCallbacks = [];

	// Flag to indicate whether initialise has started
	var initialiseStarted = false;

	// Flag to indicate whether initialise is done
	var initialiseDone = false;

	/**
	 * Fetch the current event for a channel
	 * @param {String} serviceId the service id of the channel
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	function fetchCurrentEventForServiceId(serviceId, callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {

			function success(result) {
				if (result) {
					// Create the BTVEventItem
					// Get the channel from the array (no need to fetch since we're inside the go function)
					callback(new $U.core.mediaitem.BTVEventItem(result, allChannelsByServiceId[serviceId]));
				} else {
					callback(new $U.core.mediaitem.BTVNoInfoItem(allChannelsByServiceId[serviceId]));
					//failure(-1);
				}
			}

			function failure(errorCode) {
				if (logger) {
					logger.log("doFetchCurrentEventForServiceId", "errorCode", errorCode);
				}
				callback(null);
			}

			// Fetch from JSFW
			if (serviceId && allChannelsByServiceId[serviceId]) {
				EPG.fetchCurrentEventForService(serviceId, success, failure);
			} else {
				failure(-1);
			}
		}

	}

	/**
	 * Fetch the current event for a channel
	 * @param {$U.core.mediaitem.BTVChannelItem} channel the channel
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	function fetchCurrentEventForChannel(channel, callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {

			function success(result) {
				if (result === null) {
					callback(new $U.core.mediaitem.BTVNoInfoItem(channel));
				} else {
					// Create the BTVEventItem
					callback(new $U.core.mediaitem.BTVEventItem(result, channel));
				}
			}

			function failure(errorCode) {
				if (logger) {
					logger.log("doFetchCurrentEventForServiceId", "errorCode", errorCode);
				}
				callback(null);
			}

			// Fetch from JSFW
			if (channel && channel.serviceId) {
				EPG.fetchCurrentEventForService(channel.serviceId, success, failure);
			} else {
				failure(-1);
			}
		}

	}

	/**
	 * Fetch the next event for a channel
	 * @param {String} serviceId the service id of the channel
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	function fetchNextEventForServiceId(serviceId, callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {

			function success(result) {
				if (result) {
					// Create the BTVEventItem
					// Get the channel from the array (no need to fetch since we're inside the go function)
					callback(new $U.core.mediaitem.BTVEventItem(result, allChannelsByServiceId[serviceId]));
				} else {
					failure(-1);
				}
			}

			function failure(errorCode) {
				if (logger) {
					logger.log("doFetchNextEventForServiceId", "errorCode", errorCode);
				}
				callback(null);
			}

			// Fetch from JSFW
			if (serviceId && allChannelsByServiceId[serviceId]) {
				EPG.fetchNextEventForService(serviceId, success, failure);
			} else {
				failure(-1);
			}
		}

	}

	/**
	 * Fetch the next event for a channel
	 * @param {$U.core.mediaitem.BTVChannelItem} channel the channel
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	function fetchNextEventForChannel(channel, callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {

			function success(result) {
				if (result === null) {
					callback(new $U.core.mediaitem.BTVNoInfoItem(channel));
				} else {
					// Create the BTVEventItem
					callback(new $U.core.mediaitem.BTVEventItem(result, channel));
				}
			}

			function failure(errorCode) {
				if (logger) {
					logger.log("doFetchNextEventForServiceId", "errorCode", errorCode);
				}
				callback(null);
			}

			// Fetch from JSFW
			if (channel && channel.serviceId) {
				EPG.fetchNextEventForService(channel.serviceId, success, failure);
			} else {
				failure(-1);
			}
		}

	}

	/**
	 * Fetch events
	 * @param {$U.core.mediaitem.BTVChannelItem[]} channels the channels
	 * @param {Number} startTime the timestamp of the start time
	 * @param {Number} endTime the timestamp of the end time
	 * @param {Function} callback the callback function
	 * @param {Object} callback.events the events are returned in an object with properties corresponding to the service ids of the channels<br>
	 * the value for each property is an array of $U.core.mediaitem.BTVEventItem
	 */
	function fetchEvents(channels, startTime, endTime, callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		function go() {

			// Build an array of service ids for the channels
			var serviceIds = channels.map(function(channel) {
				return channel.serviceId;
			});

			// Create the events object with properties corresponding to the service ids of the channels
			var i;
			var l = channels.length;
			var events = {};
			for ( i = 0; i < l; i++) {
				events[channels[i].serviceId] = [];
			}

			function successCallback(results) {
				var result;
				l = results.length;
				for ( i = 0; i < l; i++) {
					result = results[i];
					events[result.serviceId].push(new $U.core.mediaitem.BTVEventItem(result, allChannelsByServiceId[result.serviceId]));
				}
				callback(events);
			}

			function failureCallback(errorCode) {
				if (logger) {
					logger.log("fetchEvents", "errorCode", errorCode);
				}

				$U.core.ConnectionChecker.refreshAfterError();
			}

			// Fetch from JSFW
			EPG.fetchEventsByWindow(serviceIds, startTime, endTime, successCallback, failureCallback);
		}

	}

	/**
	 * Fetch all channels, sorted by service id
	 * @param {$U.core.mediaitem.BTVChannelItem[]} channels the channels
	 * @param {Number} startTime the timestamp of the start time
	 * @param {Number} endTime the timestamp of the end time
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	function fetchAllChannelsByServiceId(callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {
			callback(allChannelsByServiceId);
		}

	}

	function fetchAllChannelsByLongName(callback) {
		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {
			callback(allChannelsByLongName);
		}
	}
	
	function fetchAllChannelsForMapArray(callback) {
		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {
			callback(allChannelsForMapArray);
		}
	}
	
	function fetchChannels(callback) {

		// Wrap the go function up to ensure initialisation happens
		initialise(function() {
			go();
		});

		// Function that's called after initialisation
		function go() {
			callback(filteredChannels);
		}

	}

	function fetchChannel(serviceId, callback) {
		initialise(function() {
			doFetchChannel(serviceId, callback);
		});
	}

	function doFetchChannel(serviceId, callback) {
		callback(allChannelsByServiceId[serviceId]);
	}

	function getChannelByServiceId(serviceId) {
		return allChannelsByServiceId[serviceId];
	}

	function reset() {
		initialiseCallbacks = [];
		initialiseStarted = false;
		initialiseDone = false;
	}

	function fetchChannelByLogicalChannelNumber(logicalChannelNumber, callback) {
		var channel = null;
		var i = 0;
		var len = 0;

		if (filteredChannels) {
			len = filteredChannels.length;
		}

		for (i; i < len; i++) {
			if (filteredChannels[i].logicalChannelNumber === logicalChannelNumber) {
				channel = filteredChannels[i];
				i = len;
			}
		}

		callback(channel);
	}

	function initialise(callback) {

		var filter;
		var features;
		var channelLocale = $U.core.Configuration.CHANNEL_LOCALES && $U.core.Configuration.CHANNEL_LOCALES[$U.core.Locale.getLocale()];

		if (initialiseDone) {
			callback();

		} else {
			initialiseCallbacks.push(callback);

			if (!initialiseStarted) {

				initialiseStarted = true;

				EPG = $N.services.sdp.EPG;
				SUB = $N.services.sdp.Subscriptions;

				allChannels = null;
				filteredChannels = null;
				subscribedChannels = null;

				// TODO: account, locale
				EPG.initialise();

				filter = {};
				features = $U.core.Device.getDeviceNameListBTV();
				if (features) {
					filter["technical.deviceType"] = {
						"$in" : features
					};
				}
				if (channelLocale) {
					filter.locale = channelLocale;
				}

				EPG.fetchAllChannels(fetchAllChannelsSuccess, fetchAllChannelsFailure, filter);
				SUB.refreshSubscriptions(refreshSubscriptionsCallback);
			}
		}

	}

	function fetchAllChannelsSuccess(response) {
		if ($U.core.Gateway.isGatewayAvailable()) {
			this._allChannelResponse = response;
			if(logger){
				logger.timeStampLog("MDS CHANNELS RETRIEVED");
			}
			$N.services.gateway.dlna.MediaDevice.fetchChannels(gatewayChannelCallback);
		} else {
			fetchAllChannelsSuccessContinue(response);
		}
	}

	/**
	 * This function does the equivalent of the JSFW merge channels
	 * @param {Object} gatewayChannels - channels that have come back from the gateway box
	 */
	function gatewayChannelCallback(gatewayChannels) {
		var i;
		var j;
		var mdsChannels = this._allChannelResponse;
		var mergedChannel = {};
		var mergedChannels = [];
		var croppedChannels = [];
		var glen = gatewayChannels.length;
		var mlen = mdsChannels.length;
		var clen = 0;

		if(logger){
			logger.timeStampLog("GW CHANNELS RETRIEVED");
		}
		for ( j = 0; j < glen; j++) {
			if(!gatewayChannels[j].simulcastId) {
				croppedChannels.push(gatewayChannels[j]);
			}
		}
		clen = croppedChannels.length;
		for(j = 0; j < glen; j++) {
			if(gatewayChannels[j].simulcastId) {
				for(i = 0; i < clen; i++) {
					if(gatewayChannels[j].simulcastId === croppedChannels[i].logicalChannelNum) {
						croppedChannels[i].hdChannel = gatewayChannels[j];
						if(logger) {
							logger.log("simulCast", gatewayChannels[j].serviceName + " is same as " + croppedChannels[i].serviceName);
						}
					}
				}

			}
		}

		for(j = 0; j < clen; j++) {
			for ( i = 0; i < mlen; i++) {
				if(areChannelsTheSame(mdsChannels[i], croppedChannels[j])) {
					mergedChannel = $N.platform.btv.HybridServiceFactory.mergeObjects(mdsChannels[i], croppedChannels[j], {});
					mergedChannels.push(mergedChannel);
					croppedChannels[j].hasBeenMerged = true;
					mdsChannels[i].hasBeenMerged = true;
					i = mlen;
				}
			}
		}
		
		if (logger) {
			for ( i = 0; i < mlen; i++) {
				if (!mdsChannels[i].hasBeenMerged) {
					logger.log("areChannelsTheSame", "NO MDS: " + mdsChannels[i].serviceId + " - " + mdsChannels[i].serviceName);
				}
			}
	
			for(j = 0; j < clen; j++) {
				if(!croppedChannels[j].hasBeenMerged) {
					logger.log("areChannelsTheSame", "NO GW: " + croppedChannels[j].logicalChannelNum + " - " + croppedChannels[j].serviceName);
				}
			}
			logger.log("gatewayChannelCallback", "Counts - allChannels: " + mlen + " gatewayChannels:" + glen + " croppedChannels:" + clen + " merged:" + mergedChannels.length);

			logger.timeStampLog("CHANNELS MERGED");
		}

		fetchAllChannelsSuccessContinue(mergedChannels);
	}

	function areChannelsTheSame(channelA, channelB) {
		var servNumA = parseInt(channelA.serviceId, 10);
		var servNumB = parseInt(channelB.dvbTriplet.split(",").pop(), 10);
		if (servNumA === servNumB) {
			if (logger) {
				logger.log("areChannelsTheSame", "YES: " + channelB.logicalChannelNum + " - " + channelA.serviceName + " === " + channelB.serviceName);
				if(channelB.simulcastId) {
					logger.log("areChannelsTheSame", "simulcastId:" + channelB.simulcastId);
				}
			}
			return true;
		}

		return false;
	}

	function fetchAllChannelsSuccessContinue(response) {
		var i;
		var l;
		var channel;
		var key = 'serviceId';

		// Create a list of BTVChannelItems
		l = response.length;
	
		allChannels = [];
		allChannelsByServiceId = {};
		allChannelsByLongName = {};
		allChannelsForMapArray = {};
		
		for ( i = 0; i < l; i++) {
			channel = new $U.core.mediaitem.BTVChannelItem(response[i]);
			allChannels.push(channel);
			if (allChannelsByServiceId[channel.serviceId]) {
				if (logger) {
					logger.log("fetchAllChannelsSuccess", "Duplicate channel: " + channel.serviceId + " - " + channel.serviceName);
				}
			}
			allChannelsByServiceId[channel.serviceId] = channel;
			allChannelsByLongName[channel._data._data.editorial.longName] = channel;
			allChannelsForMapArray[response[i][key]] = response[i];
		}

		// Sort the channels
		allChannels.sort(channelComparitor);

		// Create the list of filtered channels
		l = allChannels.length;
		filteredChannels = [];
		for ( i = 0; i < l; i++) {
			if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(allChannels[i].rating)) {
				filteredChannels.push(allChannels[i]);
			}
		}

		if (logger) {
			logger.log("fetchAllChannelsSuccess", "\nallChannels", allChannels, "\nfilteredChannels", filteredChannels);
		}

		if (subscribedChannels) {
			initialiseCallback();
		}
		if (!$U.core.Device.isDesktop()) {
			//want the get the nowPlaying item here so have it at least once
			$U.core.Gateway.fetchNowPlaying(function(items) {
				if (logger) {
					logger.log("fetchAllChannelsSuccessContinue", "nowPlaying : " + items[0]);
				}

			});
		}
	}

	function fetchAllChannelsFailure(response) {
		allChannels = [];
		filteredChannels = [];
		if (logger) {
			logger.log("fetchAllChannelsFailure", response);
		}
		if (subscribedChannels) {
			initialiseCallback();
		}
	}

	function refreshSubscriptionsCallback() {
		var channels = SUB.getSubscribedChannels();
		var i;
		var l;

		// Create a list of BTVChannelItems
		l = channels.length;
		subscribedChannels = [];
		for ( i = 0; i < l; i++) {
			subscribedChannels.push(new $U.core.mediaitem.BTVChannelItem(channels[i]));
		}

		// Sort the channels
		subscribedChannels.sort(channelComparitor);

		if (logger) {
			logger.log("refreshSubscriptionsCallback", "\nsubscribedChannels", subscribedChannels);
		}

		if (allChannels) {
			initialiseCallback();
		}
	}

	function channelComparitor(a, b) {
		return a.logicalChannelNumber - b.logicalChannelNumber;
	}

	function initialiseCallback() {
		var callback;

		if (logger) {
			logger.log("initialiseCallback");
		}

		// Fire all waiting callbacks
		while (undefined !== ( callback = initialiseCallbacks.shift())) {
			callback();
		}

		initialiseDone = true;
	}
	
	return {
		fetchCurrentEventForChannel : fetchCurrentEventForChannel,
		fetchCurrentEventForServiceId : fetchCurrentEventForServiceId,
		fetchNextEventForChannel : fetchNextEventForChannel,
		fetchNextEventForServiceId : fetchNextEventForServiceId,
		fetchEvents : fetchEvents,
		fetchChannels : fetchChannels,
		fetchChannel : fetchChannel,
		getChannelByServiceId : getChannelByServiceId,
		fetchAllChannelsByServiceId : fetchAllChannelsByServiceId,
		fetchAllChannelsByLongName : fetchAllChannelsByLongName,
		fetchChannelByLogicalChannelNumber : fetchChannelByLogicalChannelNumber,
		fetchAllChannelsForMapArray : fetchAllChannelsForMapArray,
		reset : reset
	};

}());
