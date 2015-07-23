/**
 * Class that handles the interaction between the UI and the JSFW NPVRLocker functionality
 * @class $U.core.NPVRManager
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.NPVRManager = ( function() {

	var lockerService;
	var npvrManager;
	var instance = null;
	var totalStorage;
	var availableStorage;
	var enabled = false;

	var SET_RECORDING_HEADING_KEY = "txtSetNetworkRecordingTitle";
	var SET_RECORDING_MESSAGE_KEY = "txtSetNetworkRecordingMessage";
	var SET_RECORDING_SERIES_KEY = "txtSetNetworkRecordingSeriesMessage";
	var SET_RECORDING_SUCCESS = "txtSetNetworkRecordingSuccess";
	var DELETE_HEADING_KEY = "txtDeleteNetworkRecording";
	var DELETE_SCH_HEADING_KEY = "txtDeleteNetworkScheduled";
	var DELETE_MESSAGE_KEY = "txtDeleteNetworkRecordingMessage";
	var DELETE_SCH_MESSAGE_KEY = "txtDeleteNetworkScheduledMessage";
	var DELETE_SERIES_MESSAGE_KEY = "txtDeleteNetworkSeriesRecordingMessage";
	var DELETE_SERIES_SCH_MESSAGE_KEY = "txtDeleteNetworkSeriesScheduledMessage";
	var DELETE_SERIES_KEY = "txtDeleteNetworkRecordingSeriesMessage";
	var DELETE_ALL_SERIES_KEY = "txtDeleteNetworkRecordingSeriesAllMessage";
	var DELETE_SUCCESS = "txtDeleteNetworkRecordingSuccess";
	var PROTECT_RECORDING_HEADING_KEY = "txtProtectNetworkRecordingTitle";
	var PROTECT_RECORDING_SUCCESS = "txtProtectNetworkRecordingSuccess";
	var UNPROTECT_RECORDING_HEADING_KEY = "txtUnprotectNetworkRecordingTitle";
	var UNPROTECT_RECORDING_MESSAGE_KEY = "txtUnprotectNetworkRecordingMessage";
	var UNPROTECT_RECORDING_SUCCESS = "txtUnprotectNetworkRecordingSuccess";
	var PROTECTED_RECORDING_HEADING_KEY = "txtProtectedTitle";
	var PROTECTED_MESSAGE_KEY = "txtDeleteTileProtectedMessage";
	var PROTECTED_SERIES_MESSAGE_KEY = "txtDeleteTileSeriesProtectedMessage";


	var CONFIRM_KEY = "txtConfirm";
	var CANCEL_KEY = "txtCancel";
	var OK_KEY = "txtOK";
	var PASSWORD_KEY = "txtPassword";
	var PASSWORD_FAIL_KEY = "txtPasswordErrorMessage";
	var DEVICE = "txtNetworkDevice";
	var SCHHEADERUNLIMITED = "menuNPVRScheduled";
	var RECHEADERUNLIMITED = "menuNPVRCompleted";
	var SCHHEADER = "txtNPVRScheduledHeader";
	var RECHEADER = "txtNPVRCompletedHeader";

	var currentEvent;
	var currentCallback;

	var DIALOG_TYPE = function() {
		return $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN;
	};
	var DIALOG_MODAL = true;

	var logger = $U.core.Logger.getLogger("NPVRManager");

	/**
	 * Constructor, this SHOULDN'T be used, use the getInstance() function
	 */
	function NPVRManager(callback) {
		var lConf = $U.core.Configuration.LOCKER_CONFIG,
			filter = null,
			features,
			accountNumber = $U.core.signon.user.accountNumber,
			accountUid = $U.core.signon.user.accountUid,
			accountSpid = $U.core.signon.user.accountSpid,
			errors = $N.services.sdp.NPVRManager.ERROR,
			appContinue = function () {
				if (typeof callback === "function") {
					callback();
				}
			},
			initCompleteCallback = function (response) {
				if (response && response.error) {
					switch (response.error) {
					case errors.ACCOUNT_NOT_ENABLED:
						if (logger) {
							logger.log("NPVRManager", "Account not enabled for NPVR. Account status: " + response.status);
						}
						break;
					default:
						if (logger) {
							logger.log("NPVRManager", "Unable to initialise NPVRManager. " + response.error);
						}
					}
					appContinue();
				} else {
					if (logger) {
						logger.log("NPVRManager", "NPVR Initialised and account enabled");
					}
					enabled = true;
					appContinue();
				}
			};

		if (lConf) {
			features = $U.core.Device.getDeviceNameListNPVR();
			if (features) {
				filter = {
					accountNumber: $U.core.signon.user.accountNumber,
					deviceType: {
						"$in": features
					}
				};
			}
			lockerService = new $N.services.sdp.LockerService(lConf.URL, lConf.PORT, lConf.SERVICE_PATH, lConf.SECURITY, lConf.PROVIDER);
			npvrManager = new $N.services.sdp.NPVRManager(lockerService, null, null, initCompleteCallback, filter, accountNumber, accountUid, accountSpid);
			npvrManager.addEventListener("cacheRefresh", cacheRefreshCallback);
		} else {
			if (logger) {
				logger.log("Setup", "No locker config");
			}
			appContinue();
		}
	}

	/**
	 * Initialises the NPVRManager
	 * @param  {Function} callback function to call once everything has been initialised
	 */
	NPVRManager.initialise = function(callback) {
		instance = new NPVRManager(callback);
	};

	/**
	 * This is used to create the instance of the helper
	 * @param  {Function} callback function used when doing an initialisation
	 * @return {$U.core.NPVRManager} instance of the NPVRManager
	 */
	NPVRManager.getInstance = function(callback) {	
		return instance;
	};

	function cacheRefreshCallback() {
		//TODO: something exciting here
		if (logger) {
			logger.log("cacheRefreshCallback");
		}

		npvrManager.fetchAvailableStorage(function(result) {
			availableStorage = result.data;

			if (logger) {
				logger.log("cacheRefreshCallback", "availableStorage :" + JSON.stringify(result));
			}
			//update the headers for the category scrollers
			$U.core.View.refreshCategoryTitle($U.core.category.npvr.NPVRScheduledCategoryProvider.ID);
			$U.core.View.refreshCategoryTitle($U.core.category.npvr.NPVRCompletedCategoryProvider.ID);
		});

		npvrManager.fetchTotalStorage(function(result) {
			totalStorage = result.data;
			if (logger) {
				logger.log("cacheRefreshCallback", "totalStorage :" + JSON.stringify(result));
			}
		});
	}

	var proto = NPVRManager.prototype;

	/**
	 * Method that adds an event to the NPVRLocker.
	 * @param {$U.core.mediaitem.BTVEventItem} event to add to locker
	 */
	proto.recordEvent = function(event, callback) {
		currentEvent = event;
		currentCallback = callback;
		$U.core.View.showDialog(_recordingDialogConfiguration(currentEvent), _recordCallback);
	};

	/**
	 * The method that actually sets the recording
	 * @param {boolean} isSeries true if is going to record the whole series
	 */
	var _doRecord = function(isSeries) {
		var recordCallback = function(data) {
			var config;
			var stringReplacementObject = {
				"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + currentEvent.title + "</span>",
				"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
			};
			if (data.error) {
				//Failure
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(SET_RECORDING_HEADING_KEY), data.error);
			} else {
				//success!
				config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString(SET_RECORDING_SUCCESS, stringReplacementObject), true, 2000);
			}
			if ( typeof currentCallback === "function") {
				currentCallback(currentEvent);
			}
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
			$U.core.widgets.PageLoading.hide("$U.core.NPVRManager._recordCallback");
		};

		if (isSeries) {
			npvrManager.requestSeriesRecording(currentEvent.dataObject, recordCallback);
		} else {
			npvrManager.requestEventRecording(currentEvent.dataObject, recordCallback);
		}
	};

	/**
	 * Recording dialog callback
	 */
	var _recordCallback = function(interactiveElements, owner) {
		var i,
			shouldSeriesLink = false;

		$U.core.View.hideDialog();

		switch (interactiveElements[0].buttonClicked) {
		case "submit" :

			$U.core.widgets.PageLoading.show("$U.core.NPVRManager._recordCallback");

			for (i = 0; i < interactiveElements.length; i++) {
				if (interactiveElements[i].name === "seriesLink" && interactiveElements[i].checked === true) {
					shouldSeriesLink = true;
				}
			}

			//TODO: use the seriesLink stuff
			_doRecord(shouldSeriesLink);

			break;
		}
	};

	/**
	 * Gives the configuration for the recording dialog
	 */
	var _recordingDialogConfiguration = function(event) {
		if (logger) {
			logger.log("_recordingDialogConfiguration", event);
		}

		var stringReplacementObject = {
			"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + event.title + "</span>",
			"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
		};

		var fields = [];

		// Only display the series record checkbox if the mediatem has a series identifier
		if (event.seriesId) {
			fields.push({
				name : "seriesLink",
				type : "checkbox",
				label : $U.core.util.StringHelper.getString(SET_RECORDING_SERIES_KEY),
				id : "seriesLink",
				checked : false
			});
		}

		return {
			title : $U.core.util.StringHelper.getString(SET_RECORDING_HEADING_KEY),
			htmlmessage : $U.core.util.StringHelper.getString(SET_RECORDING_MESSAGE_KEY, stringReplacementObject),
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE() : null,
			form : {
				fields : fields
			},
			buttons : [{
				text : $U.core.util.StringHelper.getString(CONFIRM_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString(CANCEL_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};

	};

	/**
	 * Method that removes an event from the NPVRLocker.
	 * @param {$U.core.mediaitem.BTVEventItem} event to remove from locker
	 */
	proto.deleteEvent = function(event, callback) {
		currentEvent = event;
		currentCallback = callback;
		$U.core.View.showDialog(_deleteDialogConfiguration(currentEvent), _deleteCallback);
	};

	/**
	 * Method used when using the x on an asset tile
	 * @param  {Event} evt the clickEvent
	 * @param  {MediaItem} mediaItem the item to delete
	 */
	proto.deleteFromTile = function(evt, mediaItem) {
		evt.stopPropagation();
		var keepDialogConfig;
		currentEvent = mediaItem;
		currentCallback = function(mediaItem, isError) {
			if (!isError) {
				$U.core.View.removeItemFromBrowseScreen(mediaItem);
			}
		};
		if (mediaItem.recordingType === $N.data.Recording.RECORDING_TYPE.SERIES) {
			if (mediaItem.keep) {
				keepDialogConfig = {
					title: $U.core.util.StringHelper.getString(PROTECTED_RECORDING_HEADING_KEY),
					message: $U.core.util.StringHelper.getString(PROTECTED_SERIES_MESSAGE_KEY, {
						TITLE: mediaItem.title
					}),
					modal: true,
					buttons: [{
						text: $U.core.util.StringHelper.getString(OK_KEY),
						name: "ok",
						icon: {
							iconClass: "icon-ok-sign",
							iconPos: "left"
						}
					}, {
						text: $U.core.util.StringHelper.getString(CANCEL_KEY),
						name: "cancel",
						icon: {
							iconClass: "icon-remove-sign",
							iconPos: "left"
						}
					}]
				};
				$U.core.View.showDialog(keepDialogConfig, _protectedSeriesCallback);
			} else {
				$U.core.View.showDialog(_deleteSeriesDialogConfiguration(currentEvent), _deleteSeriesCallback);
			}
		} else {
			if (mediaItem.keep) {
				keepDialogConfig = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(PROTECTED_RECORDING_HEADING_KEY), $U.core.util.StringHelper.getString(PROTECTED_MESSAGE_KEY, {
					TITLE: mediaItem.title
				}));
				$U.core.View.showDialog(keepDialogConfig, function() {
					$U.core.View.hideDialog();
				});
			} else {
				$U.core.View.showDialog(_deleteDialogConfiguration(currentEvent), _deleteCallback);
			}
		}

	};

	var _protectedSeriesCallback = function(interactiveElements) {
		var inputObj = {};
		$U.core.View.hideDialog();
		switch (interactiveElements[0].buttonClicked) {
			case "ok":
				$U.core.View.showDialog(_deleteSeriesDialogConfiguration(currentEvent), _deleteSeriesCallback);
				break;
		}
	};
	/**
	 * Method that actually does the deleting
	 * @param  {String} seriesMethod method used to delete a series
	 */
	var _doDelete = function(seriesMethod) {
		var recording;
		var deleteCallback = function(data) {
			var config;
			var stringReplacementObject = {
				"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + currentEvent.title + "</span>",
				"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
			};
			var heading = currentEvent.isPast ? $U.core.util.StringHelper.getString(DELETE_HEADING_KEY) : $U.core.util.StringHelper.getString(DELETE_SCH_HEADING_KEY);
			var isError = false;

			if (data.error) {
				//failure
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog(heading, data.error);
				isError = true;
			} else {
				//success!
				config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString(DELETE_SUCCESS, stringReplacementObject), true, 2000);
			}
			if ( typeof currentCallback === "function") {
				currentCallback(currentEvent, isError);
			}
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
			$U.core.widgets.PageLoading.hide("$U.core.NPVRManager._deleteCallback");
		};

		if (seriesMethod) {
			npvrManager.removeSeries(deleteCallback, currentEvent.seriesId, seriesMethod);
		} else if (currentEvent.type === $U.core.mediaitem.MediaItemType.NPVR) {
			if (currentEvent.completed) {
				npvrManager.deleteRecording(currentEvent.dataObject, deleteCallback);
			} else {
				npvrManager.cancelScheduledRecording(currentEvent.dataObject, deleteCallback);
			}
		} else {
			recording = npvrManager.getRecordingByEvent(currentEvent.dataObject);
			if (recording.status === npvrManager.STATUS.RECORDED) {
				npvrManager.deleteRecording(recording, deleteCallback);
			} else {
				npvrManager.cancelEventRecording(currentEvent.dataObject, deleteCallback);
			}
		}
	};

	/**
	 * Callback used for the delete dialog
	 */
	var _deleteCallback = function(interactiveElements, owner) {
		$U.core.View.hideDialog();

		switch (interactiveElements[0].buttonClicked) {
		case "submit" :
			$U.core.widgets.PageLoading.show("$U.core.NPVRManager._deleteCallback");
			_doDelete();
			break;
		}
	};

	/**
	 * Callback used for the delete dialog
	 */
	var _deleteSeriesCallback = function(interactiveElements, owner) {
		var i,
			seriesMethod = currentEvent.completed ? $N.services.sdp.NPVRManager.SERIES_REMOVE_METHODS.DELETE : $N.services.sdp.NPVRManager.SERIES_REMOVE_METHODS.CANCEL;

		$U.core.View.hideDialog();

		switch (interactiveElements[0].buttonClicked) {
			case "submit":

				$U.core.widgets.PageLoading.show("$U.core.NPVRManager._deleteCallback");

				for (i = 0; i < interactiveElements.length; i++) {
					if (interactiveElements[i].checked === true && interactiveElements[i].value === "all") {
						seriesMethod = $N.services.sdp.NPVRManager.SERIES_REMOVE_METHODS.REMOVE_ALL;
					}
				}
				_doDelete(seriesMethod);

				break;
		}
	};
	/**
	 * Gives the configuration for the delete dialog
	 */
	var _deleteDialogConfiguration = function(event) {
		var stringReplacementObject = {
			"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + event.title + "</span>",
			"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
		};

		var fields = [];

		if (logger) {
			logger.log("_deleteDialogConfiguration", event);
		}

		return {
			title : event.isPast ? $U.core.util.StringHelper.getString(DELETE_HEADING_KEY) : $U.core.util.StringHelper.getString(DELETE_SCH_HEADING_KEY),
			htmlmessage : event.isPast ? $U.core.util.StringHelper.getString(DELETE_MESSAGE_KEY, stringReplacementObject) : $U.core.util.StringHelper.getString(DELETE_SCH_MESSAGE_KEY, stringReplacementObject),
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE() : null,
			form : {
				fields : fields
			},
			buttons : [{
				text : $U.core.util.StringHelper.getString(CONFIRM_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString(CANCEL_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};

	};

	/**
	 * Gives the configuration for the delete dialog when deleting a series
	 */
	var _deleteSeriesDialogConfiguration = function(event) {
		var stringReplacementObject = {
			"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + event.title + "</span>",
			"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
		};

		var fields = [];

		if (logger) {
			logger.log("_deleteSeriesDialogConfiguration", event);
		}
		// Only display the series record checkbox if the event has a series identifier
		if (event.completed) {
			fields.push({
				name : "seriesLink",
				type : "checkbox",
				label : $U.core.util.StringHelper.getString(DELETE_ALL_SERIES_KEY),
				value : "all",
				id : "all",
				checked : false
			});
		}

		return {
			title : event.completed ? $U.core.util.StringHelper.getString(DELETE_HEADING_KEY) : $U.core.util.StringHelper.getString(DELETE_SCH_HEADING_KEY),
			htmlmessage : event.completed ? $U.core.util.StringHelper.getString(DELETE_SERIES_MESSAGE_KEY, stringReplacementObject) : $U.core.util.StringHelper.getString(DELETE_SERIES_SCH_MESSAGE_KEY, stringReplacementObject),
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE() : null,
			form : {
				fields : fields
			},
			buttons : [{
				text : $U.core.util.StringHelper.getString(CONFIRM_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString(CANCEL_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};

	};

	/**
	 * Protect a recording (set the keep flag to true)
	 */
	proto.protectRecording = function(event, callback) {
		currentEvent = event;
		currentCallback = callback;
		$U.core.widgets.PageLoading.hide("$U.core.NPVRManager._protectCallback");
		_doProtect();
	};

	/**
	 * The method that actually protects the recording
	 */
	var _doProtect = function() {
		var recording;
		var protectCallback = function(data) {
			var config;
			var stringReplacementObject = {
				"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + currentEvent.title + "</span>",
				"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
			};
			if (data.error) {
				//Failure
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(PROTECT_RECORDING_HEADING_KEY), data.error);
			} else {
				//success!
				config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString(PROTECT_RECORDING_SUCCESS, stringReplacementObject), true, 2000);
			}
			if ( typeof currentCallback === "function") {
				if (currentEvent.type === $U.core.mediaitem.MediaItemType.NPVR) {
					$U.core.mediaitem.NPVRItem.create(npvrManager.getRecordingById(currentEvent.taskId), function(npvrItem) {
						currentCallback(npvrItem);
					});
				} else {
					currentCallback(currentEvent);
				}
			}
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
			$U.core.widgets.PageLoading.hide("$U.core.NPVRManager._protectCallback");
		};

		if (currentEvent.type === $U.core.mediaitem.MediaItemType.NPVR) {
			recording = currentEvent;
		} else {
			recording = npvrManager.getRecordingByEvent(currentEvent.dataObject);
		}
		npvrManager.protectRecording(recording, protectCallback);
	};

	/**
	 * Protect a recording (set the keep flag to true)
	 */
	proto.unprotectRecording = function(event, callback) {
		currentEvent = event;
		currentCallback = callback;
		$U.core.View.showDialog(_unprotectDialogConfiguration(currentEvent), _unprotectCallback);
		//_doUnprotect();
	};

	/**
	 * The method that actually unprotects the recording
	 */
	var _doUnprotect = function() {
		var recording;
		var unprotectCallback = function(data) {
			var config;
			var stringReplacementObject = {
				"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + currentEvent.title + "</span>",
				"DEVICE_NAME" : "<span class='dialog-bold'>" + $U.core.util.StringHelper.getString(DEVICE) + "</span>"
			};
			if (data.error) {
				//Failure
				config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(UNPROTECT_RECORDING_HEADING_KEY), data.error);
			} else {
				//success!
				config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString(UNPROTECT_RECORDING_SUCCESS, stringReplacementObject), true, 2000);
			}
			if ( typeof currentCallback === "function") {
				if (currentEvent.type === $U.core.mediaitem.MediaItemType.NPVR) {
					$U.core.mediaitem.NPVRItem.create(npvrManager.getRecordingById(currentEvent.taskId), function(npvrItem) {
						currentCallback(npvrItem);
					});
				} else {
					currentCallback(currentEvent);
				}
			}
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
			$U.core.widgets.PageLoading.hide("$U.core.NPVRManager._unprotectCallback");
		};

		if (currentEvent.type === $U.core.mediaitem.MediaItemType.NPVR) {
			recording = currentEvent;
		} else {
			recording = npvrManager.getRecordingByEvent(currentEvent.dataObject);
		}
		npvrManager.unprotectRecording(recording, unprotectCallback);
	};

	/**
	 * Password dialog handler function
	 * @param {Object} elements elements that are on the dialog
	 * @param {Object} owner Owner object (most likely its caller)
	 */
	var _unprotectCallback = function(elements, owner) {
		var input = {};
		var l = elements.length;
		var i;

		switch (elements[0].buttonClicked) {
		case "cancel" :
			$U.core.View.hideDialog();
			break;
		default :
			for ( i = 0; i < l; i++) {
				if (elements[i].type === "INPUT" || elements[i].type === "PASSWORD") {
					if (elements[i].value) {
						input[elements[i].name] = elements[i].value;
					}
				}
			}
			if (input.password) {
				$U.core.store.Store.getItem("password", function(pwd) {
					if (input.password === pwd) {
						$U.core.widgets.PageLoading.show("$U.core.NPVRManager._unprotectCallback");
						$U.core.View.hideDialog();
						_doUnprotect();
					} else {
						$U.core.View.getDialog().showSecondaryMessage();
					}
				});
			}
			break;
		}
	};

	/**
	 * Configuration for the password dialog
	 * @param {String} errorText optional error message to show if the password was incorrect initially
	 * @return {Object} dialogConfig
	 */
	var _unprotectDialogConfiguration = function(event) {
		var stringReplacementObject = {
			"PROGRAMME_TITLE" : "<span class='dialog-bold'>" + event.title + "</span>"
		};

		if (logger) {
			logger.log("_unprotectDialogConfiguration", event);
		}

		return {
			title : $U.core.util.StringHelper.getString(UNPROTECT_RECORDING_HEADING_KEY),
			htmlmessage : $U.core.util.StringHelper.getString(UNPROTECT_RECORDING_MESSAGE_KEY, stringReplacementObject),
			secondaryMessage : $U.core.util.StringHelper.getString(PASSWORD_FAIL_KEY),
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE() : null,
			form : {
				fields : [{
					name : "password",
					type : "password",
					placeholder : $U.core.util.StringHelper.getString(PASSWORD_KEY)
				}]
			},
			buttons : [{
				text : $U.core.util.StringHelper.getString(CONFIRM_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString(CANCEL_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * From an Array returned by the JSFW service, this makes them into NPVRItems and returns them in the callback provided.
	 * @param {Array} recs Array of items to be converted
	 * @param {Function} callback
	 */
	function _createNPVRArray(recs, callback) {
		var nPVRArray = [];
		var ind = 0;
		var len = recs.length;

		var nextNPVR = function() {
			ind++;
			createNPVRs();
		};

		var createNPVRs = function() {
			if (ind >= len) {
				if ( typeof callback === "function") {
					callback(nPVRArray);
				}
			} else {
				if (recs[ind].serviceId) {
					$U.core.mediaitem.NPVRItem.create(recs[ind], function(npvrItem) {
						nPVRArray.push(npvrItem);
						nextNPVR();
					});
				} else {
					nextNPVR();
				}
			}
		};

		createNPVRs();
	}

	/**
	 * Private helper function that sorts recordings into sortField order, and puts into arrays for each series. NOTE: sortField must be on root level of the object.
	 */
	function getSortedSeriesRecordings(recordingsArray, sortField, sortOrder) {
		var i;
		var recItem;
		var seriesIdentifier;
		var items = [];
		var itemsLookUp = {};
		var createFolder = function(obj,item) {
			for (var attrname in item) {
				obj[attrname] = item[attrname];
			}
			return obj;
		};
		var compare = function(a, b) {
			var result;
			if (a[sortField] < b[sortField]) {
				result = isDescending ? 1 : -1;
			} else if (a[sortField] > b[sortField]) {
				result = isDescending ? -1 : 1;
			} else {
				result = 0;
			}
			return result;
		};
		var isDescending = (sortOrder === npvrManager.SORT_ORDER.DESC) ? true : false;

		if (!recordingsArray || recordingsArray.length === 0) {
			return [];
		}

		for (i = 0; i < recordingsArray.length; i++) {
			recItem = recordingsArray[i];
			seriesIdentifier = recItem.seriesId;

			if (seriesIdentifier) {
				if (itemsLookUp[seriesIdentifier] || itemsLookUp[seriesIdentifier] === 0) {
					if (!items[itemsLookUp[seriesIdentifier]].startTime || (recItem.startTime > items[itemsLookUp[seriesIdentifier]].startTime && isDescending) || (recItem.startTime < items[itemsLookUp[seriesIdentifier]].startTime && !isDescending)) {
						items[itemsLookUp[seriesIdentifier]].startTime = recItem.startTime;
					}
					if (recItem.keep && !items[itemsLookUp[seriesIdentifier]].keep) {
						items[itemsLookUp[seriesIdentifier]].keep = true;
					}
					if (!recItem.subscribed && items[itemsLookUp[seriesIdentifier]].subscribed) {
						items[itemsLookUp[seriesIdentifier]].subscribed = false;
					}
					items[itemsLookUp[seriesIdentifier]].taskCount = items[itemsLookUp[seriesIdentifier]].taskCount + 1;
					items[itemsLookUp[seriesIdentifier]].push(recItem);
				} else {
					items.push([recItem]);
					itemsLookUp[seriesIdentifier] = items.length - 1;
					var seriesFolder = {};
					seriesFolder._data = {};
					seriesFolder.title = recItem.title;
					seriesFolder.startTime = recItem.startTime;
					seriesFolder.endTime = recItem.endTime;
					seriesFolder.rating = recItem.rating;
					seriesFolder.promoImageURL = $U.core.util.ImageURLHelper.getInstance().npvrPromoImageURL(recItem);
					seriesFolder.recordingType = $N.data.Recording.RECORDING_TYPE.SERIES;
					seriesFolder.seriesId = recItem.seriesId;
					seriesFolder.taskId = recItem.taskId;
					seriesFolder.taskCount = 1;
					seriesFolder.subscribed = true;
					seriesFolder.completed = recItem.completed;
					seriesFolder.type = $U.core.mediaitem.MediaItemType.NPVR;
					createFolder(items[itemsLookUp[seriesIdentifier]], seriesFolder);
				}
			} else {
				items.push([recItem]);
			}
		}

		for (i = items.length - 1; i >= 0; i--) {
			if (items[i].length === 1 && items[i].recordingType !== $N.data.Recording.RECORDING_TYPE.SERIES) {
				items.push(items[i][0]);
				items.splice(i, 1);
			} else {
				items[i].sort(compare);
			}
		}
		return items.sort(compare);
	}

	/**
	 * Re-sorts the history object (some may have been removed at some point)
	 * @param  {Object} assets from the history object
	 * @return {Object} sorted items
	 */
	proto.resortHistory = function(assets, id) {
		var npvrRecs = [];
		var ilen = assets.length;
		var jlen;
		var i;
		var j;
		for (i = 0; i < ilen; i++) {
			if (assets[i].recordingType === $N.data.Recording.RECORDING_TYPE.SERIES) {
				jlen = assets[i].length;
				for (j = 0; j < jlen; j++) {
					npvrRecs.push(assets[i][j]);
				}
			} else {
				npvrRecs.push(assets[i]);
			}
		}
		if (id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID) {
			return getSortedSeriesRecordings(npvrRecs, "startTime", npvrManager.SORT_ORDER.ASC);
		} else {
			return getSortedSeriesRecordings(npvrRecs, "startTime", npvrManager.SORT_ORDER.DESC);
		}
	};

	proto.forceCacheRefresh = function(callback) {
		if($U.core.Configuration.NPVR_ENABLED && this.isAccountEnabled()){
			npvrManager.forceCacheRefresh(callback);
		} else {
			callback();
		}
	};

	proto.fetchCompletedRecordings = function(callback) {
		this.forceCacheRefresh(function() {
			var recs = npvrManager.getCompletedRecordings("startTime", npvrManager.SORT_ORDER.DESC);
			_createNPVRArray(recs, function(npvrRecs) {
				callback(getSortedSeriesRecordings(npvrRecs, "startTime", npvrManager.SORT_ORDER.DESC));
			});
		});
	};

	proto.fetchScheduledRecordings = function(callback) {
		this.forceCacheRefresh(function() {
			var activ = npvrManager.getActiveRecordings("startTime", npvrManager.SORT_ORDER.ASC);
			var sched = npvrManager.getScheduledRecordings("startTime", npvrManager.SORT_ORDER.ASC);
			var recs = activ.concat(sched);
			_createNPVRArray(recs, function(npvrRecs) {
				callback(getSortedSeriesRecordings(npvrRecs, "startTime", npvrManager.SORT_ORDER.ASC));
			});
		});
	};

	/**
	 * Method used to check to see if an event is currently in the NPVRLocker.
	 * @param {$U.core.mediaitem.BTVEventItem} event to see if is in locker
	 */
	proto.isEventInLocker = function(event) {
		var rec = this.getRecordingByEvent(event);
		if (rec) {
			return true;
		}
		return false;
	};

	/**
	 * Method used to check to see if an event is currently protected.
	 * @param {$U.core.mediaitem.BTVEventItem} event to see if is protected
	 */
	proto.isEventProtected = function(event) {
		var rec = this.getRecordingByEvent(event);
		if (rec && rec.keep) {
			return true;
		}
		return false;
	};

	/**
	 * Method used to check to see if an event is currently in the NPVRLocker.
	 * @param {$U.core.mediaitem.BTVEventItem} event to see if is in locker
	 */
	proto.getEventStatus = function(event) {
		var rec = this.getRecordingByEvent(event);
		if (rec) {
			return rec.status;
		}
		return null;
	};

	proto.getRecordingByEvent = function(event) {
		return npvrManager.getRecordingByEvent(event.dataObject);
	};

	proto.isAccountEnabled = function() {
		return enabled;
	};

	/**
	 * Method used to get the total available space left in the locker (in seconds)
	 */
	proto.getLockerSpaceTotalSeconds = function() {
		return totalStorage;
	};

	/**
	 * Method used to get the total available space left in the locker (in seconds)
	 */
	proto.getLockerSpaceUsedSeconds = function() {
		return totalStorage - availableStorage;
	};

	/**
	 * Method used to get the total available space left in the locker (in seconds)
	 */
	proto.getLockerSpaceFreeSeconds = function() {
		return availableStorage > 0 ? availableStorage : 0;
	};

	/**
	 * Method used to get the total available space left in the locker (in seconds)
	 */
	proto.getLockerSpaceUsedPercent = function() {
		return Math.round(((totalStorage - availableStorage) / totalStorage) * 100);
	};


	/**
	 * Method used to get the total available space left in the locker (in seconds)
	 */
	proto.getLockerSpaceFreePercent = function() {
		return Math.ceil((availableStorage / totalStorage) * 100);
	};

	/**
	 * Method used to get the heading to show in the browse screen
	 * @param id the category id used to distinguish whether getting the scheduled or recording header
	 */
	proto.getBrowseHeading = function(id) {
		var heading;
		var stringReplacementObject = {
			"PERCENT" : this.getLockerSpaceUsedPercent() + "%",
			"HOURS" : $U.core.util.Formatter.formatSecondsToHours(this.getLockerSpaceFreeSeconds())
		};
		if (id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID) {
			if (totalStorage === npvrManager.UNLIMITED_QUOTA || stringReplacementObject.PERCENT === "NaN%") {
				heading = $U.core.util.StringHelper.getString(SCHHEADERUNLIMITED);
			} else {
				heading = $U.core.util.StringHelper.getString(SCHHEADER, stringReplacementObject);
			}
		} else {
			if (totalStorage === npvrManager.UNLIMITED_QUOTA || stringReplacementObject.PERCENT === "NaN%") {
				heading = $U.core.util.StringHelper.getString(RECHEADERUNLIMITED);
			} else {
				heading = $U.core.util.StringHelper.getString(RECHEADER, stringReplacementObject);
			}
		}
		return heading;
	};

	proto.completed = function() {
		return npvrManager.STATUS.RECORDED;
	};

	proto.active = function() {
		return npvrManager.STATUS.RECORDING;
	};

	proto.scheduled = function() {
		return npvrManager.STATUS.NEW;
	};

	proto.deleted = function() {
		return npvrManager.STATUS.DELETED;
	};

	return NPVRManager;

}());
