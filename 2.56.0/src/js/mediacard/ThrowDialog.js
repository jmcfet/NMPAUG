var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.ThrowDialog = ( function() {
	/**
	 * @class $U.mediaCard.ThrowDialog
	 * the dialog used when trying to throw some content
	 */
	var dialogConfiguration = {};
	var STATE_THROW_ERROR = {};

	var DIALOG_TYPE = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC;

	var logger = $U.core.Logger.getLogger("ThrowDialog");

	var throwStatus = {
		state : {},
		error : ""
	};

	var throwing = false;

	/**
	 * The function run when a button is pressed
	 * if it's in the list the asset will be thrown, otherwise the dialog just closes
	 * @param {Object} interactiveElements the things on the dialog
	 * @param {Object} mediaItem the item to throw to the device
	 */
	var dialogCallback = function(interactiveElements, mediaItem) {
		var clicked = interactiveElements[0].buttonClicked;
		$U.core.View.hideDialog();
		if (clicked !== "close") {
			throwToDevice(clicked, mediaItem, true, $U.core.Player.player.currentTime);
		}
	};

	/**
	 * The function run when a button is pressed
	 * if it's in the list the asset will be thrown, otherwise the dialog just closes
	 * @param {String} deviceID the id of the device to throw to
	 * @param {Object} mediaItem the item to throw to the device
	 * @param {boolean} showToast true if want to show feedback to the user success/fail toast messages
	 */
	var throwToDevice = function(deviceID, mediaItem, showToast, position) {
		//stop the playback on the CD:
		$U.core.widgets.PageLoading.show("throwToDevice");
		var parameters = {
			contentType : mediaItem.type === $U.core.mediaitem.MediaItemType.VOD ? "vod" : mediaItem.type === $U.core.mediaitem.MediaItemType.PVR_RECORDING ? "pvr" : "live",
			contentId : mediaItem.throwId,
			position : position,
			_data : mediaItem._data,
			assetId : mediaItem.throwId,
			entitlement : "12177c8b-5cf3-46d7-ad35-0a00ea1bc645"
		};

		var callback = function(result) {
			//$U.core.View.showMediaCardScreen(mediaItem, false);
			$U.core.widgets.PageLoading.hide("throwToDevice");
			var config;
			var nowPlayingChecker;
			var checkCount = 0;
			var MAX_CHECKS = 10;
			if (result.code === 200) {
				if (logger) {
					logger.log("throwToDevice - Success", result || '');
				}

				$U.core.Gateway.setThrownItem(mediaItem);
				if (showToast) {
					config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString("txtThrowSuccess", {
						DEVICENAME : $U.core.Gateway.getDeviceName()
					}), false, 2000);
					$U.core.View.showDialog(config);
				}

				nowPlayingChecker = function() {
					$U.core.Gateway.fetchNowPlaying(function(gatewayItems) {
						var currPlay = $U.mediaCard.MediaCardController.getCurrentlyPlaying();
						var itemsMatch = (mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT && mediaItem.serviceId === currPlay.serviceId) || (mediaItem.id === currPlay.id) ? true : false;

						checkCount++;
						if (itemsMatch && $U.core.View.getCurrentScreenId() === $U.core.View.SCREENID.MEDIACARD) {
							if (checkCount >= MAX_CHECKS || $U.core.Gateway.nowPlayingOnGateway(mediaItem)) {
								//$U.core.View.showMediaCardScreen(mediaItem, false);
								$U.mediaCard.MediaCardController.populate(mediaItem, true);
							} else {
								window.setTimeout(nowPlayingChecker, 1000);
							}
						}
					});
				};

				window.setTimeout(nowPlayingChecker, 1000);
			} else {
				if (logger) {
					logger.log("throwToDevice - Fail", result || '');
				}
				if (showToast) {
					config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog(result.code, result.description);
					$U.core.View.showDialog(config, function() {
						$U.core.View.hideDialog();
					});
				}
			}
			throwing = false;
		};

		try {
			if (!throwing) {
				mediaItem.playbackPosition = position;
				throwing = true;
				$N.services.gateway.dlna.MediaDevice.sendPlayRequest(deviceID, parameters, callback);
			}
		} catch(err) {
			$U.core.widgets.PageLoading.hide("throwToDevice");
			throwStatus.state = STATE_THROW_ERROR;
			throwStatus.error = err;
			if (throwStatus.state === STATE_THROW_ERROR && showToast) {
				var config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString("txtThrowError"), $U.core.util.StringHelper.getString("txtFailedToThrow") + "\n" + throwStatus.error.message);
				$U.core.View.showDialog(config, function() {
					$U.core.View.hideDialog();
				});
			}
			throwing = false;
		}

	};

	/**
	 * sets the configuration for the dialog
	 * adds the devices in to the list, gives a back button and title
	 * @private
	 */
	var _setDialogConfiguration = function(devices) {
		var i, len;
		var mappedDevices = [];

		len = devices.length;

		for ( i = 0; i < len; i++) {
			mappedDevices.push({
				text : devices[i].name,
				name : devices[i].id
			});
		}

		dialogConfiguration = {
			title : $U.core.util.StringHelper.getString("txtPlayback"),
			message : $U.core.util.StringHelper.getString("txtThrowTo"),
			type : DIALOG_TYPE,
			modal : true,
			listItems : mappedDevices,
			buttons : [{
				text : $U.core.util.StringHelper.getString("txtCancel"),
				name : "close",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};
	/**
	 * populates and shows the throw dialog
	 * @param {Object} callingObject the object calling the dialog
	 */
	var show = function(mediaItem) {
		var devices = $U.core.Gateway.getDevices();
		if (!devices || devices.length === 0) {
			var config = $U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString("txtThrowError"), $U.core.util.StringHelper.getString("txtFailedToFindDevices"));
			$U.core.View.showDialog(config, function() {
				$U.core.View.hideDialog();
			});
		} else if (devices.length === 1) {
			throwToDevice(devices[0].id, mediaItem, true, $U.core.Player.player.currentTime);
		} else {
			_setDialogConfiguration(devices);
			$U.core.View.showDialog(dialogConfiguration, dialogCallback, mediaItem);
		}
	};

	return {
		show : show,
		throwToDevice : throwToDevice
	};

}());
