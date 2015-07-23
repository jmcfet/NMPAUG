/**
 * Class that represents interactions with a gateway device for cross-device cases.
 * Models interactions to determine availability of the gateway device
 * TODO - future extensions could include gateway device capability discovery
 *
 * @class $U.core.Gateway
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.Gateway = (function() {

	var logger = $U.core.Logger.getLogger("Gateway");

	var SET_RECORDING_HEADING_KEY = "txtSetRecordingTitle";
	var SET_RECORDING_MESSAGE_KEY = "txtSetRecordingMessage";
	var SET_RECORDING_SERIES_KEY = "txtSetRecordingSeriesMessage";
	var SET_RECORDING_CONFLICT_KEY = "txtSetRecordingConflictMessage";
	var SET_RECORDING_GATEWAY_NOT_FOUND_KEY = "txtSetRecordingGatewayNotFound";
	var SET_RECORDING_SUCCESS = "txtSetRecordingSuccess";
	var SET_RECORDING_CONFIRM_KEY = "txtConfirm";
	var SET_RECORDING_CANCEL_KEY = "txtCancel";
	var RECORDING_UNAVAILABLE_KEY = "txtRecordingUnavailable";
	var ERROR_KEY = "txtMissingError";
	var GATEWAY_LOST_KEY = "txtGatewayLost";
	var GATEWAY_LOST_MESSAGE_KEY = "txtGatewayLostMessage";

	var currentMediaItem;
	var currentDeviceName;
	var nowPlayingItems = [];
	var refreshingDeviceList;
	var thrownItem;
	//assume is true at start, first isFound check will be when logged onto gateway
	var _gatewayFound = true;

	var DIALOG_TYPE = function() {
		return $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN;
	};
	var DIALOG_MODAL = true;

	var getDeviceName = function() {
		var name = "";
		this._devices = getDevices();
		if (this._devices.length > 0) {
			name = this._devices[0].name;
		}
		currentDeviceName = name;
		return name;
	};

	var getDeviceID = function() {
		var id = "";
		this._devices = getDevices();
		if (this._devices.length > 0) {
			id = this._devices[0].id;
		}
		return id;
	};

	var getDevices = function() {
		return $N.services.gateway.dlna.MediaDevice.getDevices();
	};

	/**
	 * Confirms whether a gateway device is active and available.  Can be used to determine if gateway UI elements need to be rendered.
	 * @return {boolean} true if gateway is available, false if not.
	 */
	var isGatewayAvailable = function(callback) {
		return isGatewayAllowed() && isGatewayFound();
	};

	/**
	 * Determines if the gateway is available but disallowed by a policy.
	 * TODO wire this up to an actual head-end value, not a configuration file one.
	 * @return {boolean} true if is allowed, false if not allowed
	 */
	var isGatewayAllowed = function() {
		return $U.core.Configuration.GATEWAY_CATEGORIES || false;
	};

	/**
	 * Determines if a gateway device has been found on the network via discovery.
	 * @return {boolean} true if a gateway device has been found, false if it has not.
	 */
	var isGatewayFound = function() {
		return _gatewayFound;
	};

	var checkIsOnline = function() {
		$N.services.gateway.dlna.MediaDevice.isOnline(function(boo) {
			_gatewayFound = boo;
			if (logger) {
				logger.log("checkIsOnline", "Gateway Found : " + _gatewayFound);
			}
			if (!_gatewayFound) {
				refreshingDeviceList = true;
				var lostConfig = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(GATEWAY_LOST_KEY), $U.core.util.StringHelper.getString(GATEWAY_LOST_MESSAGE_KEY));
				$U.core.View.showDialog(lostConfig, function() {
					$U.core.View.hideDialog();
					$U.core.LifecycleHandler.registerListener($U.core.Gateway.checkIsOnline, $U.core.Configuration.LIFECYCLE_TIMINGS.GATEWAY_ONLINE);
					$U.core.View.refreshCategory($U.core.category.pvr.PVRScheduledCategoryProvider.ID);
					$U.core.View.refreshCategory($U.core.category.pvr.PVRRecordedCategoryProvider.ID);
					$U.core.View.refreshCategory($U.core.category.pvr.PVRNowPlayingCategoryProvider.ID);
					//$U.core.View.refreshCategory($U.core.category.pvr.PVRChannelsCategoryProvider.ID);
				});

			} else {
				if (refreshingDeviceList) {
					$N.services.gateway.dlna.MediaDevice.refreshDeviceList(function() {
						var config;
						if ($N.services.gateway.dlna.MediaDevice.getDevices()[0].id !== null) {
							//reset the epg data
							$U.epg.dataprovider.BTVDataProvider.getInstance().reset();
							config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString("txtGatewayFound"), true, 2000);
							$U.core.View.showDialog(config, function() {
								$U.core.View.hideDialog();
								$U.core.LifecycleHandler.registerListener($U.core.Gateway.checkIsOnline, $U.core.Configuration.LIFECYCLE_TIMINGS.GATEWAY_ONLINE);
								$U.core.View.refreshCategory($U.core.category.pvr.PVRScheduledCategoryProvider.ID);
								$U.core.View.refreshCategory($U.core.category.pvr.PVRRecordedCategoryProvider.ID);
								$U.core.View.refreshCategory($U.core.category.pvr.PVRNowPlayingCategoryProvider.ID);
								//$U.core.View.refreshCategory($U.core.category.pvr.PVRChannelsCategoryProvider.ID);
							});
						} else {
							config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString("txtGatewayNotFound"), true, 2000);
							$U.core.View.showDialog(config, function() {
								$U.core.View.hideDialog();
								$U.core.LifecycleHandler.registerListener($U.core.Gateway.checkIsOnline, $U.core.Configuration.LIFECYCLE_TIMINGS.GATEWAY_ONLINE);
							});
						}
						refreshingDeviceList = false;

						if (logger) {
							logger.log("refreshDeviceList", "Finished list refresh");
						}
					});
				} else {
					$U.core.LifecycleHandler.registerListener($U.core.Gateway.checkIsOnline, $U.core.Configuration.LIFECYCLE_TIMINGS.GATEWAY_ONLINE);
				}
			}
		});
	};

	/**
	 * callback used in the MediaDevice.initialise call
	 */
	var gatewayInit = function() {
		$U.core.LifecycleHandler.registerListener($U.core.Gateway.checkIsOnline, $U.core.Configuration.LIFECYCLE_TIMINGS.GATEWAY_ONLINE);
		this._devices = getDevices();
	};

	var _recordResponseCallBack = function(response) {
		var config;
		var stringReplacementObject;
		if (logger) {
			logger.log("recordListener", response);
		}
		$U.core.widgets.PageLoading.hide("$U.core.Gateway._recordCallback");

		switch (response.handle.code) {
			case 200:
				// success
				stringReplacementObject = {
					"PROGRAMME_TITLE": "<span class='dialog-bold'>" + currentMediaItem.title + "</span>",
					"DEVICE_NAME": "<span class='dialog-bold'>" + getDeviceName() + "</span>"
				};
				config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString(SET_RECORDING_SUCCESS, stringReplacementObject), true, 2000);
				break;
			case 400:
				if (currentMediaItem.isOnNow) {
					$N.services.gateway.dlna.MediaDevice.scheduleRecordingByWindow(currentMediaItem.title, currentMediaItem.throwId, "NOW", currentMediaItem.endTime, _recordResponseCallBack);
				} else {
					$N.services.gateway.dlna.MediaDevice.scheduleRecordingByWindow(currentMediaItem.title, currentMediaItem.throwId, currentMediaItem.startTime, currentMediaItem.endTime, _recordResponseCallBack);
				}
				break;
			case 730:
				// Conflict
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(SET_RECORDING_HEADING_KEY), response.scheduleState + "\n" + $U.core.util.StringHelper.getString(SET_RECORDING_CONFLICT_KEY));
				break;
			case 0:
				// can't find gateway
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(SET_RECORDING_HEADING_KEY), response.scheduleState + "\n" + $U.core.util.StringHelper.getString(SET_RECORDING_GATEWAY_NOT_FOUND_KEY));
				break;
			default:
				//something else is wrong
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(SET_RECORDING_HEADING_KEY), response.scheduleState + "\n" + response.handle.code + ":" + response.handle.description);
				break;
		}

		if (config) {
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
		}
	};

	/**
	 * Sends a schedule record request to the gateway
	 * @param {$U.core.mediaitem.BTVEventItem} mediaItem item to record
	 */
	var _recordCallback = function(interactiveElements, owner) {
		var shouldSeriesLink = false;

		$U.core.View.hideDialog();

		switch (interactiveElements[0].buttonClicked) {
			case "submit":

				$U.core.widgets.PageLoading.show("$U.core.Gateway._recordCallback");

				for (var i = 0; i < interactiveElements.length; i++) {
					if (interactiveElements[i].name === "seriesLink" && interactiveElements[i].checked === true) {
						shouldSeriesLink = true;
					}
				}

				// need to send the full data now
				$N.services.gateway.dlna.MediaDevice.scheduleMDSEventRecording(currentMediaItem.channel.dvbTriplet, currentMediaItem.dataObject, shouldSeriesLink, _recordResponseCallBack);
				break;
		}
	};

	var _recordingDialogConfiguration = function() {
		var stringReplacementObject = {
			"PROGRAMME_TITLE": "<span class='dialog-bold'>" + currentMediaItem.title + "</span>",
			"DEVICE_NAME": "<span class='dialog-bold'>" + getDeviceName() + "</span>"
		};

		var configurationObject = {};

		if (logger) {
			logger.log("_recordingDialogConfiguration", currentMediaItem);
		}

		configurationObject.title = $U.core.util.StringHelper.getString(SET_RECORDING_HEADING_KEY);
		configurationObject.htmlmessage = $U.core.util.StringHelper.getString(SET_RECORDING_MESSAGE_KEY, stringReplacementObject);
		configurationObject.modal = DIALOG_MODAL;
		configurationObject.type = $U.core.Device.isPhone() ? DIALOG_TYPE() : null;

		// Only display the series record checkbox if the mediatem has a series identifier
		if (currentMediaItem.seriesId) {
			configurationObject.form = {};
			configurationObject.form.fields = [];
			configurationObject.form.fields[0] = {};
			configurationObject.form.fields[0].name = "seriesLink";
			configurationObject.form.fields[0].type = "checkbox";
			configurationObject.form.fields[0].label = $U.core.util.StringHelper.getString(SET_RECORDING_SERIES_KEY);
			configurationObject.form.fields[0].id = "seriesLink";
			configurationObject.form.fields[0].checked = false;
		}

		// Confirm button
		configurationObject.buttons = [];
		configurationObject.buttons[0] = {};
		configurationObject.buttons[0].text = $U.core.util.StringHelper.getString(SET_RECORDING_CONFIRM_KEY);
		configurationObject.buttons[0].name = "submit";
		configurationObject.buttons[0].icon = {
			iconClass: "icon-ok-sign",
			iconPos: "left"
		};

		// Cancel button
		configurationObject.buttons[1] = {};
		configurationObject.buttons[1].text = $U.core.util.StringHelper.getString(SET_RECORDING_CANCEL_KEY);
		configurationObject.buttons[1].name = "cancel";
		configurationObject.buttons[1].icon = {
			iconClass: "icon-remove-sign",
			iconPos: "left"
		};

		return configurationObject;

	};

	var recordingDialog = function(mediaItem, owner) {
		currentMediaItem = mediaItem;
		$U.core.View.showDialog(_recordingDialogConfiguration(), _recordCallback, owner);
	};

	var fetchNowPlaying = function(nowPlayingCallback) {
		var gwFetchCallback = function(response) {
			var gatewayItems = [];
			var mediaItems = [];
			var mediaItem;
			var gatewayItem;
			var id;
			var itemsToAdd;
			var i;
			var npId = -1;

			var addItem = function(item) {
				itemsToAdd--;
				if (item) {
					mediaItems.push(item);
				}
				if (itemsToAdd === 0) {
					nowPlayingItems = mediaItems;
					if (thrownItem && !nowPlayingWasThrown()) {
						thrownItem = null;
					}
					nowPlayingCallback(mediaItems);
				}
			};

			var handleBTV = function(btvEventItem) {
				if (btvEventItem) {
					btvEventItem.updateOnClick = true;
				}
				addItem(btvEventItem);
			};

			var handleChannel = function(allChannelsByServiceId) {
				var item;
				if (allChannelsByServiceId) {
					var id = gatewayItem.dvbTriplet.split(",").pop();
					if (parseInt(id, 10) === 0) {
						item = new $U.core.mediaitem.GWChannelItem(gatewayItem);
					} else {
						item = allChannelsByServiceId[id];
					}
					//shb22-304 - if we do need to show the static channels then should use this:
					if (!item) {
						item = new $U.core.mediaitem.GWChannelItem(gatewayItem);
				}
				}
				$U.core.mediaitem.BTVEventItem.createForChannel(item, handleBTV);
			};

			var handleVOD = function(asset) {
				var item;
				if (asset && asset.editorials.length) {
					item = $U.core.mediaitem.VODItem.create(asset.editorials[0]);
					item.fetchedInfo = gatewayItem;
				} else {
					item = $U.core.mediaitem.VODItem.create(gatewayItem, $U.core.mediaitem.VODItem.TYPE.GW);
				}
				addItem(item);
			};

			var handlePVR = function(asset) {
				var item;
				var j;
				var idSearch = new $N.services.sdp.Search();
				var btvData = $U.epg.dataprovider.BTVDataProvider.getInstance();
				//there is an OpenTV issue where after throwing we don't get the correct data back:
				//(we don't want to do the RecordingFactory in the else part)
				if (!gatewayItem.TrackMetaData || gatewayItem.TrackMetaData === "none") {
					item = new $U.core.mediaitem.PVRRecordedItem(asset);
				} else {
					item = new $U.core.mediaitem.PVRRecordedItem($N.services.gateway.dlna.RecordingFactory.mapObject(asset.TrackMetaData));
				}

				idSearch.fetchEventsByIds([item.uniqueId], "", function(response) {
					if (logger) {
						logger.log("GotEvents - Success:", JSON.stringify(response));
					}
					if (response.length > 0) {
						for (j = 0; j < response.length; j++) {
							if (response[j].eventId === item.uniqueId) {
								item.eventData = response[j];
								item.channel = btvData.getChannelByServiceId(response[j].serviceId);
							}
						}
					}
					if (!item.channel && item.channelDVBTriplet) {
						item.channel = btvData.getChannelByServiceId(item.channelDVBTriplet.split(",")[2]);
					}

					addItem(item);
				}, function(response) {
					if (logger) {
						logger.log("GotEvents - Failed:", JSON.stringify(response));
					}
					addItem(item);
				});
			};

			if (logger) {
				logger.log("getNowPlayingFromServer - callback", response);
			}
			if ((response.handle && response.handle.code !== 200)) {
				//gateway returns nothing
				nowPlayingCallback(mediaItems);
			} else {
				if (response instanceof Array) {
					gatewayItems = response;
				} else {
					gatewayItems.push(response);
				}
				itemsToAdd = gatewayItems.length;
				for (i = 0; i < gatewayItems.length; i++) {
					gatewayItem = gatewayItems[i];
					if (gatewayItem._data) {
						if (gatewayItem._data.id) {
							npId = parseInt(gatewayItem._data.id.substring(gatewayItem._data.id.indexOf(".") + 1), 10);
						}
						if (npId > 0) {
							if (logger) {
								logger.log("getNowPlayingFromServer", "ignoring nowPlaying." + npId);
							}
							addItem();
						} else {
							if (gatewayItem._data.defaultPlaybackInfo.type === "live") {
								$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByServiceId(handleChannel);
							} else if (gatewayItem._data.defaultPlaybackInfo.type === "pvr") {
								handlePVR(gatewayItem);
							} else if (gatewayItem._data.defaultPlaybackInfo.type === "vod") {
								$N.services.sdp.VOD.getVODData(handleVOD, handleVOD, $N.services.sdp.MetadataService.RequestType.Assets, {
									"technical.id": gatewayItem.id
								});
							}
						}
					} else {
						addItem();
					}
				}
			}
		};

		if (isGatewayFound()) {
			$N.services.gateway.dlna.MediaDevice.fetchContent(gwFetchCallback);
		} else {
			window.setTimeout(function() {
				nowPlayingCallback([]);
			}, 1);
		}

	};

	function nowPlayingOnGateway(mediaItem) {
		var nowPlaying = false;
		var nowPlayingItem;
		var i;
		if (nowPlayingItems.length > 0 && isGatewayAvailable()) {
			for (i = 0; i < nowPlayingItems.length; i++) {
				nowPlayingItem = nowPlayingItems[i];
				if (mediaItem.id === nowPlayingItem.id) {
					nowPlaying = true;
					i = nowPlayingItems.length;
				}
			}
		}
		return nowPlaying;
	}

	function isNowPlayingVOD() {
		var isVOD = false;
		var nowPlayingItem;
		var i;
		if (nowPlayingItems.length > 0 && isGatewayAvailable()) {
			for (i = 0; i < nowPlayingItems.length; i++) {

				if (nowPlayingItems[i].type === $U.core.mediaitem.MediaItemType.VOD) {
					isVOD = true;
					i = nowPlayingItems.length;
				}
			}
		}
		return isVOD;
	}

	function getDurationSeconds(duration) {
		var timeArray;
		if (typeof duration === "string") {
			timeArray = duration.split(":");
		} else {
			return 0;
		}
		if (timeArray.length > 3) {
			return 0;
		}
		var hoursAsMilliseconds = parseInt(timeArray[0].substring(1) * 3600, 10);
		var minutesAsMillisecond = parseInt(timeArray[1] * 60, 10);
		var secondsAsMillisecond = parseInt(timeArray[2], 10);
		return (hoursAsMilliseconds + minutesAsMillisecond + secondsAsMillisecond);
	}

	function msToTime(duration) {
		var seconds = parseInt((duration / 1000) % 60, 10),
			minutes = parseInt((duration / (1000 * 60)) % 60, 10),
			hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;
		return "P" + hours + ":" + minutes + ":" + seconds;
	}

	function fetchNowPlayingPosition(callback) {
		$N.platform.media.DLNA.fetchContent(getDeviceID(), function(data) {
			if (data.AbsTime) { // && !isNaN(data.AbsTime)) {
				callback(getDurationSeconds(data.AbsTime));
			} else {
				callback(0);
			}
		});
	}

	function getBookmarkForId(contentId, callback) {
		var fetchMetaCallback = function(response) {
			var bookmark = 0;
			if (response.lastPlaybackPosition && response.lastPlaybackPosition.text) {
				bookmark = getDurationSeconds(response.lastPlaybackPosition.text);
			}

			callback(bookmark, contentId);
		};

		//if (!$N.services.gateway.dlna.MediaDevice.fetchBookmarks(fetchCallback)) {
		if (!$N.services.gateway.dlna.MediaDevice.fetchMetadata(contentId, fetchMetaCallback)) {
			callback(0, contentId);
		}
	}

	function setBookmark(contentId, time, callback) {
		$N.services.gateway.dlna.MediaDevice.saveBookmark(contentId, time, callback);
	}

	function deleteBookmark(contentId, callback) {
		setBookmark(contentId, 0, callback);
	}

	/*
	 * Function that checks to see if the PVRItem is still on the Gateway
	 * @param {$U.core.mediaitem.PVRRecordedItem} pvrItem the item to check for
	 * @param {Function} callback the parameter passed into the function is boolean, true if the item is found
	 */
	function isPVRItemValid(pvrItem, callback) {
		var fetchCallback = function(result) {
			var config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(ERROR_KEY), $U.core.util.StringHelper.getString(RECORDING_UNAVAILABLE_KEY));
			if (!result || (result.handle && result.handle.code === "701")) {
				$U.core.View.showDialog(config, function() {
					$U.core.View.hideDialog();
					callback(false);
				});
			} else {
				callback(true);
			}
		};
		//TODO: check that the id is the correct one to use for recordings
		if (!$N.services.gateway.dlna.MediaDevice.fetchMetadata(pvrItem.cdsObjectID, fetchCallback)) {
			callback(false);
		}
	}

	function clearNowPlayingItems() {
		nowPlayingItems = [];
	}

	function setThrownItem(item) {
		thrownItem = item;
	}

	function getThrownItem() {
		return thrownItem;
	}

	function nowPlayingWasThrown() {
		var wasThrown = false;
		if (thrownItem) {
			wasThrown = nowPlayingOnGateway(thrownItem);
		}
		return wasThrown;
	}

	function swipeToFetchGesture() {
		var config, showFetchToast = function() {
			$U.core.View.showMediaCardScreen(nowPlayingItems[0], [], true);
			config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString("txtFetching") + " - " + nowPlayingItems[0].title, true, 2000);
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
		};
		if (nowPlayingItems.length > 0) {
			showFetchToast();
		} else {
			fetchNowPlaying(function() {
				if (nowPlayingItems.length > 0) {
					showFetchToast();
				}
			});
		}
	}

	function swipeToThrowGesture() {
		// Throw content & stop playback on device
		$U.mediaCard.MediaCardController.getPlayer().throwListener();
	}

	function startTranscoding(url) {
		//need to add the HLSparams to the url
		var urlHLSParams = "";
		if ($U.core.HlsConfiguration && $N.env.deviceInfo) {
			urlHLSParams = $U.core.HlsConfiguration($N.env.deviceInfo.type, $N.env.deviceInfo.systemVersion, $N.env.playerType);
		}
		url += urlHLSParams;

		if (logger) {
			logger.log("START on GW", url);
		}

		this._transcodingUrl = url;

		return $N.services.gateway.dlna.MediaDevice.startTranscoding(url, function(data) {
			if (logger) {
				logger.log("STARTED HLS : " + JSON.stringify(data));
			}
		});
	}

	function stopTranscoding(url) {
		var rtnVal = false;
		var that = this;
		if(!url){
			url = this._transcodingUrl;
		}

		if (logger) {
			logger.log("STOP on GW", url);
		}
		if(url){
			rtnVal = $N.services.gateway.dlna.MediaDevice.stopTranscoding(url, function(data) {
			if (logger) {
				logger.log("STOPPED HLS : " + JSON.stringify(data));
			}
			that._transcodingUrl = undefined;
		});
		}
		return rtnVal;
	}
	/**
	 * This returns a valid uri for a GW item (not VOD).
	 * This is used from the contentMapper or from the mediaCardPlayer when doing the transcoding request
	 * @param  {Object} content which is the contentToPlay from a BTVChannel
	 * @return {String} the uri
	 */
	function createContentURI(content){
		var dmsObj = $N.services.gateway.dlna.MediaDevice.getDMSDetails(),
			lcmID = $N.services.gateway.dlna.MediaDevice.getLCMId(),
			resCode = $N.services.gateway.dlna.MediaDevice.DEFAULT_RESOLUTION.code,
			type = content.jobId ? "pvr" : "live",
			gwHLSUrl,
			id,
			url;
		gwHLSUrl = dmsObj.url.split(":")[1];
		id = content.jobId ? content._data.id.replace("pvr.", "") : content.serviceId.replace("live", "channel");
		url = "http:" + gwHLSUrl + ":8081/MF/" + type + "/" + id + "/" + resCode + "/master.m3u8?license=" + lcmID;
		if (logger) {
			logger.log("Play URL : ", url);
		}
		return url;
	}

	return {
		isGatewayAvailable: isGatewayAvailable,
		isGatewayAllowed: isGatewayAllowed,
		isGatewayFound: isGatewayFound,
		checkIsOnline: checkIsOnline,
		gatewayInit: gatewayInit,
		getDeviceName: getDeviceName,
		getDeviceID: getDeviceID,
		getDevices: getDevices,
		recordingDialog: recordingDialog,
		fetchNowPlaying: fetchNowPlaying,
		nowPlayingOnGateway: nowPlayingOnGateway,
		isNowPlayingVOD: isNowPlayingVOD,
		fetchNowPlayingPosition: fetchNowPlayingPosition,
		getDurationSeconds: getDurationSeconds,
		msToTime: msToTime,
		getBookmarkForId: getBookmarkForId,
		setBookmark: setBookmark,
		deleteBookmark: deleteBookmark,
		isPVRItemValid: isPVRItemValid,
		clearNowPlayingItems: clearNowPlayingItems,
		setThrownItem: setThrownItem,
		getThrownItem: getThrownItem,
		nowPlayingWasThrown: nowPlayingWasThrown,
		swipeToFetchGesture: swipeToFetchGesture,
		swipeToThrowGesture: swipeToThrowGesture,
		startTranscoding: startTranscoding,
		stopTranscoding: stopTranscoding,
		createContentURI : createContentURI
	};

}());
