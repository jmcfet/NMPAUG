/**
 * @class $U.core.signon.PluginChecker
 * @singleton
 * Checks various things for the plugin
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.signon = $U.core.signon || {};
$U.core.signon.PluginChecker = (function () {

	var MASTER_CONTAINER = "masterContainer";
	var logger = $U.core.Logger.getLogger("PluginChecker");
	var upgradeManager;
	var DATA_STATUSES = {
		INSTALL: "PLAYER_INSTALLING",
		UPGRADE: "PLAYER_UPGRADING"
	};

	function upgradeError() {
		if (logger) {
			logger.log("Error checking for plugin upgrade");
		}
	}

	/**
	 * Attempts to create an instance of the player, also checking if the player is installed.
	 * @param  {Function} pluginStatusCallback Function called with true / false depending on if the plugin is installed
	 */
	function checkPluginInstalled(pluginStatusCallback) {
		$U.core.Player.createPlayer(pluginStatusCallback);
	}

	/**
	 * Starts the download of the plugin.
	 * @param  {Object} data Plugin data including download URL
	 */
	function doDownload(data) {
		upgradeManager.downloadPlugin(data);
	}

	/**
	 * Gets the plugin data, including plugin URL in order to download the plugin
	 */
	function getDownloadUrl() {
		var upgradeManagerService = $U.core.signon.SignOn.getUpgradeManagerService();
		var token = $N.services.sdp.Signon.getAuthorisationToken();
		var configAppData = $U.core.Configuration.UPGRADE_MANAGER_CONFIG.APP_DATA;
		var appData = configAppData !== null ? configAppData : token;

		upgradeManager = new $N.services.multidrm.UpgradeManager(upgradeManagerService);
		upgradeManager.checkForUpgrade(doDownload, upgradeError, appData);
	}

	/**
	 * Downloads and installs the latest NMP plugin. Should be called when no plugin is installed
	 */
	function downloadPlugin() {
		getDownloadUrl();
		_showDownloadingDialog(DATA_STATUSES.INSTALL);
	}

	/**
	 * Downloads and installs the latest NMP plugin. Should be called when a plugin is currently installed.
	 * @return {[type]} [description]
	 */
	function upgradePlugin() {
		getDownloadUrl();
		_showDownloadingDialog(DATA_STATUSES.UPGRADE);
	}

	/**
	 * Dialog to show when installing the plugin
	 */
	function _showDownloadingDialog(pluginStatus) {
		var message = (pluginStatus === DATA_STATUSES.INSTALL) ? $U.core.util.StringHelper.getString("txtPluginInstallMessage") : $U.core.util.StringHelper.getString("txtPluginUpgradeMessage");
		var config = {
			title: $U.core.util.StringHelper.getString("txtPluginDownloading"),
			message: message,
			modal: true,
			buttons: []
		};

		$U.core.widgets.PageLoading.hideAll();
		$U.core.View.hideDialog();
		$U.core.View.setViewContainer(MASTER_CONTAINER);
		$U.core.util.HtmlHelper.setVisibilityVisible($U.core.View.getViewContainer());
		$U.core.View.showDialog(config, completeCallback);
	}

	/**
	 * Displays a dialog showing a no plugin installed message
	 */
	function showNoPluginDialog() {
		var message = $U.core.util.StringHelper.getString("txtNoPluginMsg");
		var config = {
			title: $U.core.util.StringHelper.getString("txtNoPluginTitle"),
			message: message,
			modal: true,
			buttons: []
		};

		$U.core.View.setViewContainer(MASTER_CONTAINER);
		$U.core.util.HtmlHelper.setVisibilityVisible($U.core.View.getViewContainer());
		$U.core.View.showDialog(config, completeCallback);
	}

	/**
	 * Displays a download recommended dialog.
	 * @param  {Object} param             Upgrade data
	 * @param  {Function} continueLaunch  Function executed if the user hits continue
	 */
	function showUpgradeRecommendedDialog(param, continueLaunch) {
		var upgradeConfig;
		var upgradeMessage;
		var upgradeData;

		function _upgradeRecommendedCallback(interactiveElements, owner) {
			switch (interactiveElements[0].buttonClicked) {
			case "submit":
				if ($U.core.Device.isIOS() || $U.core.Device.isAndroid()) {
					window.userAgent.openUrl(upgradeData.downloadURL || upgradeData.downloadUrl);
				} else {
					window.open(upgradeData.downloadURL || upgradeData.downloadUrl);
				}
				break;
			case "cancel":
				$U.core.View.hideDialog();
				continueLaunch();
				break;
			}
		}

		$U.core.widgets.PageLoading.hideAll();
		$U.core.View.hideDialog();
		upgradeData = param.upgradeData;
		upgradeMessage = $U.core.Configuration.PLUGIN_DOWNLOAD_OPTIONS.DOWNLOAD_BUTTONS ? "txtUpgradeRecommendedMessagePC" : "txtUpgradeRecommendedMessagePCNoDownload";

		upgradeConfig = {
			title: $U.core.util.StringHelper.getString("txtUpgradeRecommended"),
			htmlmessage: $U.core.util.StringHelper.getString(upgradeMessage),
			modal: true,
			type: $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : null,
			buttons: []
		};

		if ($U.core.Configuration.PLUGIN_DOWNLOAD_OPTIONS.SHOW_DOWNLOAD_BUTTONS) {
			upgradeConfig.buttons.push({
				text: $U.core.util.StringHelper.getString("txtUpgrade"),
				name: "submit",
				icon: {
					iconClass: "icon-arrow-up",
					iconPos: "left"
				}
			});
		}

		upgradeConfig.buttons.push({
			text: $U.core.util.StringHelper.getString("txtContinue"),
			name: "cancel",
			icon: {
				iconClass: "icon-arrow-right",
				iconPos: "left"
			}
		});

		$U.core.View.showDialog(upgradeConfig, _upgradeRecommendedCallback);
	}

	/**
	 * Callback used for the complete dialog
	 * @param {Object} interactiveElements the elements on the dialog
	 * @param {Object} owner the HTMLElement that owns the dialog
	 */
	function completeCallback(interactiveElements, owner) {
		location.reload(true);
	}

	return {
		checkPluginInstalled: checkPluginInstalled,
		upgradePlugin: upgradePlugin,
		downloadPlugin: downloadPlugin,
		showUpgradeRecommendedDialog: showUpgradeRecommendedDialog,
		showNoPluginDialog: showNoPluginDialog
	};
}());