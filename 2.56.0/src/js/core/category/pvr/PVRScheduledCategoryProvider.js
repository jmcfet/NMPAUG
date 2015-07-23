/**
 * PVRScheduledCategoryProvider delivers PVRScheduled items for a non-catalogue category
 *
 * @class $U.core.category.pvr.PVRScheduledCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRScheduledCategoryProvider = (function() {

	var superClass = $U.core.category.CategoryProvider;

	var logger = $U.core.Logger.getLogger("PVRScheduledCategoryProvider");

	var ID = "$SCHEDULED_CATEGORY_PROVIDER";
	var TITLE = "menuScheduled";
	var DISPLAY_ORDER = 1;

	function PVRScheduledCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(PVRScheduledCategoryProvider, superClass);

	var proto = PVRScheduledCategoryProvider.prototype;

	/**
	 * @return {boolean}
	 */
	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of recorded
	 * @return {Object} A customCategory containing the recorded items
	 */
	proto._createCustomCategory = function(items) {
		var custCat = {
			id: this.id,
			name: this.title,
			active: false,
			content: items
		};

		return custCat;
	};

	/**
	 * Custom loadMediaItems call that doesn't use IDs to populate the system, as recorded/scheduled items are data complete from the DLNA server.
	 * @param {Array} results
	 */
	proto.loadMediaItems = function(results) {
		this._browseCallback(results, this);
	};

	/**
	 * creates a folder structure
	 * @private
	 */
	proto._createFolder = function(obj,item) {
		for (var attrname in item) { 
			obj[attrname] = item[attrname]; 
		}
		return obj;
	};

	/**
	 * Sorts the items into the correct order and into Series
	 * @param {Array} schedItems the recording items to sort
	 * @param {Number} count number of items to fetch
	 * @param {Number} offset value to offset the results by
	 * @private
	 */
	proto._sortItems = function(schedItems, count, offset) {
		schedItems.sort($U.core.util.SortHelper.sortMultipleFields("startTime","title"));
		this._createCustomCategory(schedItems);
		this._loadItems(schedItems, count, offset);
	};

	/**
	 * Reloads the recording items from the server and transforms them into the custom category structure to populate the assetscroller
	 * @private
	 * @param jobId is the id used if want to get the tasks and not the schedules
	 */
	proto._fetchItems = function(count, offset, jobId, fullLoad) {
		var that = this;

		var callback = function(gatewayItems) {
			var items = [];
			var returnItems = [];
			var ids = [];
			var idSearch = new $N.services.sdp.Search();
			var btvData = $U.epg.dataprovider.BTVDataProvider.getInstance();
			var item;
			var i, j;

			if (gatewayItems && gatewayItems.length > 0) {
				that.savedItems = gatewayItems;
				//need to get the epg data for the individual items
				for (i = 0; i < gatewayItems.length; i++) {
					item = new $U.core.mediaitem.PVRScheduledItem(gatewayItems[i]);
					if (item.uniqueId) {
						ids.push(item.uniqueId);
					}
					items.push(item);
				}

				idSearch.fetchEventsByIds(ids, "", function(response) {
					if (logger) {
						logger.log("GotEvents - Success:", JSON.stringify(response));
					}
					if (response.length > 0) {
						for (i = 0; i < response.length; i++) {
							for (j = 0; j < items.length; j++) {
								if (response[i].eventId === items[j].uniqueId) {
									items[j].eventData = response[i];
									items[j].channel = btvData.getChannelByServiceId(response[i].serviceId);
									j = items.length;
								}
							}
						}
					}

					items.forEach(function(item, ind, arr) {
						if (!item.channel && item.channelDVBTriplet) {
							item.channel = btvData.getChannelByServiceId(item.channelDVBTriplet.split(",")[2]);
						}
						if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(item.rating)) {
							//if want to hide the missed Tasks (SHB22-1339) then uncomment this below:
							//if (!item._data._data.taskState || (item._data._data.taskState && item._data._data.taskState.text !== "DONE.EMPTY")) {
							returnItems.push(item);
							//}
						}
					});
					that._sortItems(returnItems, count, offset);
				}, function(response) {
					if (logger) {
						logger.log("GotEvents - Failed:", JSON.stringify(response));
					}
					that._sortItems(returnItems, count, offset);
				});

			} else {
				that._loadItems(items, count, offset);
			}
		};
		function _getMergedSchedules(callback) {
			var sortDescByStartTime = function(a, b) {
				return b.startTime - a.startTime;
			};
			$N.services.gateway.dlna.MediaDevice.fetchScheduledRecordings(function(jobs){
				if(jobs.length > 0) {
					var mergedSchedules = [];
					$N.services.gateway.dlna.MediaDevice.fetchScheduledTasks('', function(tasks){
						tasks.sort(sortDescByStartTime);
						jobs.forEach(function(schItem,index) {
							if(schItem._data.currentRecordTaskCount){
								var mergedSchItem = null;
								tasks.forEach(function(schTask,index){
									if (schTask.jobId === schItem.jobId) {
										if(schItem._data.currentRecordTaskCount === "1") {
											mergedSchItem = schTask;
											mergedSchItem._data["class"] = schItem._data["class"]
										} else if (schItem._data.currentRecordTaskCount !== "1") {
											mergedSchItem = schItem;
											mergedSchItem._startTime = schTask.startTime;
										}
										
									}	
								});
								if (mergedSchItem) {
									mergedSchedules.push(mergedSchItem);
								}
 							} else {
								mergedSchedules.push(schItem);
							}
						});
						callback(mergedSchedules);
					});
				} else {
					callback(jobs);
				}
			});
		}

		if ($U.core.Gateway.isGatewayFound()) {
			if (fullLoad) {
				if(jobId) {
					$N.services.gateway.dlna.MediaDevice.fetchScheduledTasks(jobId, callback);
				} else {
					_getMergedSchedules(callback)
				}
			} else {
				window.setTimeout(function() {
					callback(that.savedItems);
				}, 200);
			}
		} else {
			window.setTimeout(function() {
				callback([]);
			}, 1);
		}

	};

	/**
	 * Loads items once processed. Trims the results based on the supplied count and offset.
	 * @private
	 */
	proto._loadItems = function(items, count, offset) {
		var slice;
		if (count) {
			this.totalAssetCount = items.length;
			slice = items.slice(offset, offset + count);
		}
		this.allProcessedItems = items;
		this._createCustomCategory(slice || items);
		this.loadMediaItems(slice || items);
	};
	/**
	 * Reloads the recording tasks from the server and transforms them into the custom category structure to populate the assetscroller
	 * @param jobId id of the schedule
	 */
	proto.fetchTasks = function(jobId, callback) {
		this._browseCallback = callback;
		this._fetchItems(null, null, jobId, true);
	};

	PVRScheduledCategoryProvider.ID = ID;

	return PVRScheduledCategoryProvider;
}());