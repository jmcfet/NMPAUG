var $U = $U || {};
$U.core = $U.core || {};
$U.core.NetworkHandler = ( function() {
	var MOBILE_VIDEO_OPTIONS = {
			WARN: "warn",
			YES: "yes",
			NO: "no"
		},
		CONTEXT = {
			APPLOAD: "appload",
			PLAYBACK: "playback"
		},
		MobileNetworks = {
			MOB2G:"2g",
			MOB3G:"3g",
			MOB4G:"4g"
		},
		MOBILE_PLAYBACK_PEF = "mobilevideo",
		SHOW_LOAD_WARN_PREF = "appLoadWarning";

	function _isMobileNetwork (connectionType) {
		switch (connectionType) {
		case MobileNetworks.MOB2G:
		case MobileNetworks.MOB3G:
		case MobileNetworks.MOB4G:
			return true;
		}
		return false;
	}

	function playbackNetworkCheck(callback) {
		_checkConnection(callback, CONTEXT.PLAYBACK);
	}

	function appLoadNetworkCheck(callback) {
		_checkConnection(callback, CONTEXT.APPLOAD);
	}

	function _checkConnection (callback, context) {
		var liveNetwork = $N.platform.system.Network.getConnectionType();
		if (!_isMobileNetwork(liveNetwork)){
			callback();
		} else {
			$U.core.store.LocalStore.getItem(MOBILE_PLAYBACK_PEF, function (item) {
				var mobileVideo = JSON.parse(item),
					mobileVideoAllowed = mobileVideo ? mobileVideo.value : MOBILE_VIDEO_OPTIONS.WARN;

				if (mobileVideoAllowed === MOBILE_VIDEO_OPTIONS.YES && context !== CONTEXT.APPLOAD) {
					callback();
				} else {
					_showDialog(callback, context, mobileVideoAllowed);
				}
			});
		}
	}

	function _networkChangeDialog(connectionType) {
		var configurationObject = {};

		configurationObject.type = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.TOAST;
		configurationObject.title = $U.core.util.StringHelper.getString("txtNetworkChanged");
		configurationObject.message = $U.core.util.StringHelper.getString("txtNetworkChangedInformation") +': '+connectionType;
		configurationObject.timeout = 2000;
		$U.core.View.hideDialog();
		$U.mediaCard.MediaCardController.deactivatePlayer();
		$U.core.View.showDialog(configurationObject, function () {
			$U.core.View.hideDialog();
			$U.mediaCard.MediaCardController.reactivatePlayer();
		});
	}

	function networkChanged (connectionType) {
		if ($U.core.Player.getIsPlaying() && _isMobileNetwork (connectionType) ) { /* || _isOffline(connectionType))) { */
			$U.core.store.LocalStore.getItem(MOBILE_PLAYBACK_PEF, function (item) {
				var mobileVideo = JSON.parse(item),
					mobileVideoAllowed = mobileVideo ? mobileVideo.value : MOBILE_VIDEO_OPTIONS.WARN;

				if (mobileVideoAllowed !== MOBILE_VIDEO_OPTIONS.YES) {
					_networkChangeDialog(connectionType);
				}
			});
		}
	}

	function _showDialog(callback, context, mobileVideoSetting) {
		switch (context) {
		case CONTEXT.PLAYBACK:
			$U.core.dialogs.PlaybackWarningDialog.showDialog(callback, mobileVideoSetting);
			break;
		case CONTEXT.APPLOAD:
			$U.core.dialogs.AppLoadWarningDialog.showDialog(callback);
			break;
		}
	}

	return {
		playbackNetworkCheck: playbackNetworkCheck,
		appLoadNetworkCheck: appLoadNetworkCheck,
		networkChanged: networkChanged
	};
}());