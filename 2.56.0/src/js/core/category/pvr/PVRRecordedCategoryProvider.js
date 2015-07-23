/**
 * PVRRecordedCategoryProvider delivers PVRRecorded items for a non-catalogue category
 *
 * @class $U.core.category.pvr.PVRRecordedCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRRecordedCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var logger = $U.core.Logger.getLogger("PVRRecordedCategoryProvider");

	var ID = "$RECORDED_CATEGORY_PROVIDER";
	var TITLE = "menuRecorded";
	var DISPLAY_ORDER = 1;
	var FOLDER_STRUCTURE = {};

	function PVRRecordedCategoryProvider() {
		superClass.call(this, ID, $U.core.util.StringHelper.getString(TITLE), DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(PVRRecordedCategoryProvider, superClass);

	var proto = PVRRecordedCategoryProvider.prototype;

	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Creates a customCategory from the Array of recorded
	 * @return {Object} A customCategory containing the recorded items
	 */
	proto._createCustomCategory = function(items) {
		var custCat = {
			id : this.id,
			name : this.title,
			active : false,
			content : items
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
	 * Retrieves a folder structure
	 * @private
	 */
	proto._getFolderStructure = function() {
		$N.services.gateway.dlna.MediaDevice.getValueByString('shb,getAllTags',function(data){
			if (data.tagList && data.tagList.tag_asArray) {
				var foldersArray = data.tagList.tag_asArray;
				FOLDER_STRUCTURE = {};
				for (var i = 0; i < foldersArray.length; i++) {
					var folderIdSplit = foldersArray[i].name.split('.');
					foldersArray[i].isRoot = (folderIdSplit[2]==='0') ? true : false;
					FOLDER_STRUCTURE[foldersArray[i].name] = foldersArray[i];
				}
			}	
		});
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
	 * @param {Array} recItems the recording items to sort
	 * @param {Number} count number of items to fetch
	 * @param {Number} offset value to offset the results by
	 * @private
	 */
	proto._sortItems = function(recItems, count, offset) {
		var i;
		var recItem;
		var seriesIdentifier;
		var customFolderID;
		var items = [];
		var itemsLookUp = {};
		var isTimeBasedRec = false;
		var isExternalHDRec = false;
		var sortDescByStartTime = function(a, b) {
			return b.startTime - a.startTime;
		};

		for ( i = 0; i < recItems.length; i++) {
			recItem = recItems[i];
			customFolderID = recItem._data._data.userAnnotation ? recItem._data._data.userAnnotation.text : null;
			seriesIdentifier = recItem.seriesId ? recItem.seriesId : parseInt(recItem.jobId,10);
			isTimeBasedRec = (recItem.eventId === "0,0,0,(null)") ? true : false;
			if (customFolderID) {
				isExternalHDRec = (customFolderID.split('.')[0] === "USB") ? true : false;
			}
			
			if(customFolderID && FOLDER_STRUCTURE[customFolderID] && !FOLDER_STRUCTURE[customFolderID].isRoot) {
				if (itemsLookUp[FOLDER_STRUCTURE[customFolderID]] || itemsLookUp[FOLDER_STRUCTURE[customFolderID]] === 0){
					if (!itemsLookUp[FOLDER_STRUCTURE[customFolderID]].startTime || recItem.startTime > items[itemsLookUp[FOLDER_STRUCTURE[customFolderID]]].startTime) {
						items[itemsLookUp[FOLDER_STRUCTURE[customFolderID]]].startTime = recItem.startTime;
					}
					items[itemsLookUp[FOLDER_STRUCTURE[customFolderID]]].push(recItem);
				} else {
					items.push([recItem]);
					itemsLookUp[FOLDER_STRUCTURE[customFolderID]] = items.length - 1;
					var folder = {};
					folder._data = {};
					folder.title = FOLDER_STRUCTURE[customFolderID].text;
					folder.type = recItem.type;
					folder.startTime = recItem.startTime;
					folder.rating = "0";
					folder.customFolder = true;
					folder.promoImageURL = "images/custom_folder.png";
					folder.recordingType = 0;
					this._createFolder(items[itemsLookUp[FOLDER_STRUCTURE[customFolderID]]],folder);
				}
			} else if(seriesIdentifier && !customFolderID || isTimeBasedRec){
				if 	(itemsLookUp[seriesIdentifier] || itemsLookUp[seriesIdentifier] === 0){
					if (!items[itemsLookUp[seriesIdentifier]].startTime || recItem.startTime > items[itemsLookUp[seriesIdentifier]].startTime) {
						items[itemsLookUp[seriesIdentifier]].startTime = recItem.startTime;
					}
					items[itemsLookUp[seriesIdentifier]].taskCount = items[itemsLookUp[seriesIdentifier]].taskCount + 1;
					items[itemsLookUp[seriesIdentifier]].push(recItem);
				} else {
					items.push([recItem]);
					itemsLookUp[seriesIdentifier] = items.length - 1;
						var seriesFolder = {};
						seriesFolder._data = {};
						seriesFolder.title = recItem.title;
						seriesFolder.channel = recItem.channel;
						seriesFolder.type = recItem.type;
						seriesFolder.startTime = recItem.startTime;
						seriesFolder.rating = recItem.rating;
						seriesFolder.customFolder = false;
						seriesFolder.promoImageURL = recItem.promoImageURL;
						seriesFolder.recordingType = isNaN(seriesIdentifier) ? 1 : 2;
						seriesFolder.taskCount = 1;
						this._createFolder(items[itemsLookUp[seriesIdentifier]],seriesFolder);
				}
			} else if (!(isExternalHDRec && !FOLDER_STRUCTURE[customFolderID])) {
				items.push([recItem]);
			}
		}

		for ( i = items.length - 1; i >= 0; i--) {
			if (items[i].length === 1 && !items[i].customFolder && items[i].recordingType !== 1 && items[i].recordingType !== 2) {
				items.push(items[i][0]);
				items.splice(i, 1);
			} else {
				//sort the items by startTime
				items[i].sort(sortDescByStartTime);
			}
		}
		items.sort($U.core.util.SortHelper.sortMultipleFields({
			field : "startTime",
			desc : true
		}, "title"));
		this._createCustomCategory(items);
		this._loadItems(items, count, offset);
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
	 * Reloads the recorded items from the server and transforms them into the custom category structure to populate the assetscroller
	 * @private
	 */
	proto._fetchItems = function(count, offset, jobId, fullLoad) {
		var that = this;

		var callback = function(gatewayItems) {
			var recItems = [];
			var ids = [];
			var idSearch = new $N.services.sdp.Search();
			var btvData = $U.epg.dataprovider.BTVDataProvider.getInstance();
			var recItem;
			var i, j;

			that.savedItems = gatewayItems;
			if (gatewayItems && gatewayItems.length > 0) {
				for ( i = 0; i < gatewayItems.length; i++) {
					recItem = new $U.core.mediaitem.PVRRecordedItem(gatewayItems[i]);
					if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(recItem.rating)) {
						if (recItem.uniqueId) {
							ids.push(recItem.uniqueId);
						}
						recItems.push(recItem);
					}
				}

				idSearch.fetchEventsByIds(ids, "", function(response) {
					if (logger) {
						logger.log("GotEvents - Success:", JSON.stringify(response));
					}
					if (response.length > 0) {
						for ( i = 0; i < response.length; i++) {
							for ( j = 0; j < recItems.length; j++) {
								if (response[i].eventId === recItems[j].uniqueId) {
									recItems[j].eventData = response[i];
									recItems[j].channel = btvData.getChannelByServiceId(response[i].serviceId);
									j = recItems.length;
								}
							}
						}
					}

					recItems.forEach(function(item, ind, arr) {
						if (!item.channel && item.channelDVBTriplet) {
							item.channel = btvData.getChannelByServiceId(item.channelDVBTriplet.split(",")[2]);
						}
					});

					that._sortItems(recItems, count, offset);
				}, function(response) {
					if (logger) {
						logger.log("GotEvents - Failed:", JSON.stringify(response));
					}
					that._sortItems(recItems, count, offset);
				});

			} else {
				that._loadItems(recItems, count, offset);
			}
		};

		if ($U.core.Gateway.isGatewayFound()) {
			if (fullLoad) {
				that._getFolderStructure();
				$N.services.gateway.dlna.MediaDevice.fetchRecordings(callback);
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

	PVRRecordedCategoryProvider.ID = ID;

	return PVRRecordedCategoryProvider;
}());
