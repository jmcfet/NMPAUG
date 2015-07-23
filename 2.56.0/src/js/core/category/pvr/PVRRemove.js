/**
 * Wrapper for handling the removal of an asset from the favourites category
 * @class $U.core.category.favourites.PVRRemove
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRRemove = ( function() {
	var logger = $U.core.Logger.getLogger("PVRRemove");

	// String bundle keys
	var OK_BTN_KEY = "txtOK";
	var CANCEL_BTN_KEY = "txtCancel";
	var deleteAsset;
	var removeAssetCallback;

	/**
	 * Shows the confirmation dialog for a removal
	 * @param {Object} evt - the event that gets fired
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item to remove
	 * @private
	 */
	var showRemoveDialog = function(evt, mediaItem, removeCallback) {
		// update the deleteAsset var so that the dialogHandler can use it
		deleteAsset = mediaItem;

		if (logger) {
			logger.log("showRemoveDialog", deleteAsset.seriesId, deleteAsset.serviceId);
		}

		if (removeCallback) {
			removeAssetCallback = removeCallback;
		} else {
			removeAssetCallback = function(mediaItem) {
				$U.core.View.removeItemFromBrowseScreen(mediaItem);
				if (mediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING) {
					$U.core.View.reloadCategoryIfEmpty();
				}
			};
		}
		if (evt) {
			// prevent the event from propagation
			evt.stopPropagation();
		}

		// show the dialog with the correct configuration
		$U.core.View.showDialog(getRemovePVRDialog(mediaItem), dialogHandler);
	};

	/**
	 * Performs the actual removal of the mediaItem from the favourites category
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item to remove
	 * @private
	 */
	var handleRemove = function(mediaItem) {
		if (mediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING) {
			if(mediaItem.length >= 1) {
				for (var i = 0; i < mediaItem.length; i++) {
					$U.core.category.pvr.PVRRecorded.deleteRecording(mediaItem[i].cdsObjectID, removeFromPVRCallback);
				}
			} else {
				$U.core.category.pvr.PVRRecorded.deleteRecording(mediaItem.cdsObjectID, removeFromPVRCallback);
			}
		} else {
			if (mediaItem.isSchedule) {
				$U.core.category.pvr.PVRScheduled.deleteRecordingSchedule(mediaItem.id, removeFromPVRCallback);
			} else {
				$U.core.category.pvr.PVRScheduled.deleteRecordingTask(mediaItem.id, removeFromPVRCallback);
			}
		}

		// show the loading animation during the removal of the mediaItem
		$U.core.widgets.PageLoading.show("ImageAssetTile");
	};

	/**
	 * Hides the loading animation after successfully removing the media item from favourtie's
	 * @private
	 */
	var removeFromPVRCallback = function(data) {
		var config;
		var message;
		if (logger) {
			logger.log("deleteListener", data);
		}
		if (parseInt(data.code, 10) === 200 || parseInt(data.code, 10) === 701  || parseInt(data.code, 10) === 704 || parseInt(data.code, 10) === 713) {
			removeAssetCallback(deleteAsset);
		} else {
			if (parseInt(data.code, 10) === 501) {
				message = $U.core.util.StringHelper.getString("txtRemoveErrorMessage");
			} else {
				message = data.code + ":" + data.description;
			}
			config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString("txtRemoveError"), message);
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
		}
		$U.core.widgets.PageLoading.hide("ImageAssetTile");
	};

	/**
	 * Configuration object for the dialog
	 * @param {$U.core.mediaitem.MediaItem} mediaItem
	 * @return {Object}
	 */
	var getRemovePVRDialog = function(mediaItem) {
		var REMOVE_TITLE_KEY = mediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING ? "txtRemoveRecording" : "txtRemoveScheduled";
		var REMOVE_MESSAGE_KEY = mediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING ? "txtRemoveRecordingMessage" : "txtRemoveScheduledMessage";
		if (mediaItem.length > 1) {
			REMOVE_TITLE_KEY = "txtRemoveSeriesRecording";
		}

		return {
			title : $U.core.util.StringHelper.getString(REMOVE_TITLE_KEY),
			message : $U.core.util.StringHelper.getString(REMOVE_MESSAGE_KEY, {
				TITLE : mediaItem.title
			}),
			modal : true,
			buttons : [{
				text : $U.core.util.StringHelper.getString(OK_BTN_KEY),
				name : "ok",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString(CANCEL_BTN_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * The handler function for the dialog
	 * @param {Object} interactiveElements - the elements on the dialog that can be interacted with
	 */
	var dialogHandler = function(interactiveElements) {
		var inputObj = {};
		switch (interactiveElements[0].buttonClicked) {
		case "cancel" :
			// no thanks just hide the dialog
			$U.core.View.hideDialog();
			break;
		case "ok" :
			// user has confirmed that they would like to remove the assert
			handleRemove(deleteAsset);
			// Hide the dialog
			$U.core.View.hideDialog();
			break;
		}
	};

	return {
		showRemoveDialog : showRemoveDialog
	};

}());
