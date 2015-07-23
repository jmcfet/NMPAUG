/**
 * Create Media Items from an array of raw MDS data 
 * @class $U.core.mediaitem.MediaItemHelper
 *
 * @constructor
 * Creates mediaItems from dataObjects
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @param {$U.core.mediaitem.MediaItemType} type the type of this MediaItem
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.MediaItemHelper = ( function() {
	var servicesArray = {}, channelsByServiceIdLookup = {}, channelsByLongNameLookup = {}, initialised = false;
	
	function isCatchUp (record) {
		return (record.ProgramId) ? true : false;
	}
	
	function isBTV (record) {
		return (record.eventId) ? true : false;
	}
	
	function fetchMediaItems(records, callback) {
		var sendBackItems = function() {
			var asset, items = [], length, i,
			decorateEPGObject = function (record) {
				return $N.services.sdp.EPGEventFactory.mapObject(record,servicesArray);
			},
			getVODItem = function (record) {
				return $U.core.mediaitem.VODItem.create(record);
			},
			getCatchupItem = function (record) {
				var channel = channelsByLongNameLookup[record.ServiceLongName];
					//enrichedRecord = decorateEPGObject(record);
				return $U.core.mediaitem.CatchUpMediaItem.create(record, channel);
			},
			getBTVItem = function (record) {
				var enrichedRecord = decorateEPGObject(record);
				return new $U.core.mediaitem.BTVEventItem(enrichedRecord, channelsByServiceIdLookup[enrichedRecord.serviceId]);
			};

			length = records.length;
			 
			for (i = 0; i < length; i++) {
				if (isBTV(records[i])) { // BTV
					asset = getBTVItem(records[i]);
				} else if (isCatchUp(records[i])) { // CATCHUP
					asset = getCatchupItem(records[i]);
				} else { // VOD
					asset = getVODItem(records[i]);
				}
				
				if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(asset.rating)) {
					items.push(asset);
				}
			}

			return callback(items);
		};
		
		if (!initialised) {
			initialise(sendBackItems);
		} else {
			sendBackItems();
		}
	}
	
	function initialise (callback) {
		var fetchAllChannelsForMapArray = function (services) {
				servicesArray = services;
				initialised = true;
				return (callback());
			},
			fetchAllChannelsByServiceId = function (allChannelsByServiceId) {
				channelsByServiceIdLookup = allChannelsByServiceId;
				$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsForMapArray(fetchAllChannelsForMapArray);
			},
			fetchAllChannelsByLongName = function (allChannelsByLongName) {
				channelsByLongNameLookup = allChannelsByLongName;
				$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByServiceId(fetchAllChannelsByServiceId);
			};
		$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByLongName(fetchAllChannelsByLongName);
	}
		
	return {
		fetchMediaItems: fetchMediaItems
	};

}());
