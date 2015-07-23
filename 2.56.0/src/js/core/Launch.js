/**
 * @class $U.core.Launch
 * Used to initialise the application
 */
/*global AcquiredContentListService:false, BillingService:false, BlockingService:false, BookmarkService:false, FavouriteService:false, OttSessionService:false */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.Launch = ( function() {

	var logger = $U.core.Logger.getLogger("Launch");

	var MASTER_CONTAINER = "masterContainer";

	var CONFIG_REF = $U.core.Configuration;

	var onlineCountdown = 5;

	var pluginInstalled;
	/**
	 * Entry point for the application.
	 * This is called from nmp.html when either the plugin is available or the JavaScript bridge between the NMP player
	 * and the application is available
	 */
	var initialise = function() {
		// Do not proceed with application initialisation at this time
		// Affording test framework an opportunity to edit configuration at runtime
		if($U.core.Configuration.DELAY_INITIALISATION) {
			return;
		}

		if(logger){
			logger.timeStampLog("LAUNCH");
		}
		$U.destroyList = [];
		$U.refresh = false;

		// Enable JSFW DRM functionality
		$N.Config.DRM = true;

		/* Derive the locale and load the language bundle before continuing */
		$U.core.Locale.initialise(function() {
			$U.core.signon.PluginChecker.checkPluginInstalled(pluginStatusCallback);
		});
	};

	/**
	 * Callback executed after successful sign on. Controls the plugin checking work flow based on the configured settings
	 * @param  {Object} upgradeData present if a plugin upgrade is recommended.
	 */
	var signonSuccessCallback = function (upgradeData) {
		var download = $U.core.Configuration.PLUGIN_DOWNLOAD_OPTIONS;
		var upgradeRecommended = upgradeData && upgradeData.upgradeRecommended;
		var isDesktop = $U.core.Device.isDesktop();

		if (pluginInstalled) {
			if (upgradeRecommended) {
				$U.core.signon.PluginChecker.showUpgradeRecommendedDialog(upgradeData, $U.core.signon.SignOn.continueLaunch);
			} else {
				$U.core.signon.SignOn.continueLaunch();
			}
		} else {
			if (download.DOWNLOAD_MISSING_PLUGIN && isDesktop && !$U.core.Device.isMacPlayer() && !$U.core.Device.isPCPlayer()) {
				$U.core.signon.PluginChecker.downloadPlugin();
			} else {
				$U.core.View.hideDialog();
				$U.core.signon.PluginChecker.showNoPluginDialog();
			}
		}
	};

	/**
	 * Callback executed once the player has been instantiated. Determines the work flow based on the presence of the plugin.
	 * Does not immediately sign on when running in a gateway environment as the gateway must be discovered prior to sign on.
	 * @param  {Boolean} installed if the plugin is installed
	 */
	var pluginStatusCallback = function (installed) {
		if (installed) {
			pluginInstalled = true;
			postPlayerInitialise();
			if ($U.core.Gateway.isGatewayAllowed()) {
				if ($U.core.Device.isHandHeld()) {
					$N.services.gateway.dlna.MediaDevice.initialise(isMediaDeviceOnline);
				} else {
					$N.services.gateway.dlna.MediaDevice.initialise(isMediaDeviceOnline, true);
				}
			} else {
				$U.core.signon.SignOn.initialise(signonSuccessCallback, $U.core.signon.SignOn.SIGNON_METHODS.DEVICE);
			}
		} else {
			pluginInstalled = false;
			postPlayerInitialise();
			$U.core.signon.SignOn.initialise(signonSuccessCallback, $U.core.signon.SignOn.SIGNON_METHODS.USER);
		}
	};

	var isMediaDeviceOnline = function() {
		$N.services.gateway.dlna.MediaDevice.isOnline(function(boo) {
			var config;
			var refreshDelay = $U.core.Device.isAndroid() ? 500 : 0;
			if (boo) {
				if (logger) {
					logger.timeStampLog("GATEWAY FOUND");
				}
				$U.core.Gateway.gatewayInit();
				$U.core.signon.SignOn.initialise(signonSuccessCallback, $U.core.signon.SignOn.SIGNON_METHODS.DEVICE);
			} else {
				if (!$U.core.Device.isAndroid() || ($U.core.Device.isAndroid() && onlineCountdown < 0)) {
					onlineCountdown = 5;
					$U.core.widgets.PageLoading.hide($U.core.signon.SignOn);
					config = $U.core.widgets.dialog.Dialog.getToastMessageDialog($U.core.util.StringHelper.getString("txtGatewayNotFound"), true, 2000);
					$U.core.View.showDialog(config, function() {
						$U.core.View.hideDialog();
						$U.core.widgets.PageLoading.show($U.core.signon.SignOn);
					});
				} else {
					onlineCountdown--;
				}
				window.setTimeout(function() {
					refreshDeviceList();
				}, refreshDelay);
			}
		});
	};

	var refreshDeviceList = function() {
		$N.services.gateway.dlna.MediaDevice.refreshDeviceList(isMediaDeviceOnline);
	};

	var postPlayerInitialise = function() {
		if(logger){
			logger.timeStampLog("PLAYER INITIALISED");
		}
		$U.core.View.setViewContainer(MASTER_CONTAINER);
		$N.services.sdp.BaseService.initialise(CONFIG_REF.SDP_CONFIG.URL, null, null, null, CONFIG_REF.SDP_CONFIG.PATH, false);
		if (CONFIG_REF.MDS_CONFIG) {
			$N.services.sdp.MetadataService.initialise(CONFIG_REF.MDS_CONFIG.MDS_URL, CONFIG_REF.MDS_CONFIG.MDS_PORT, CONFIG_REF.MDS_CONFIG.MDS_PATH, CONFIG_REF.MDS_CONFIG.SERVICE_PROVIDER, CONFIG_REF.MDS_CONFIG.MDS_TIMEOUT, $U.core.Locale.getMDSLocale());
		}
		//added this to stop multiple requests when it fails first time (MSUI-935)
		$N.services.sdp.Signon.init(60000, 0);
	};

	/** Entry pount for a UI refresh, post sign on but still needs to rebuild the app/data/UI */
	var refreshUIEntryPoint = function() {

		if (logger) {
			logger.log("refreshUIEntryPoint");
		}

		$U.core.ConnectionChecker.refreshIfNoNetworkConnection(function() {
			$U.core.widgets.PageLoading.hideAll();

			if ($U.core.Device.isDesktop()) {
				$U.destroyList = [];
			} else {
				while ($U.destroyList.length > 0) {
					$U.destroyList.pop().destroy();
				}
			}

			$U.refresh = true;

			if (CONFIG_REF.MDS_CONFIG) {
				$N.services.sdp.MetadataService.initialise(CONFIG_REF.MDS_CONFIG.MDS_URL, CONFIG_REF.MDS_CONFIG.MDS_PORT, CONFIG_REF.MDS_CONFIG.MDS_PATH, CONFIG_REF.MDS_CONFIG.SERVICE_PROVIDER, CONFIG_REF.MDS_CONFIG.MDS_TIMEOUT, $U.core.Locale.getMDSLocale());
			}
			postSignOnInitialise();
		});
	};

	/**
	 * Setups the sdp and parental controls features
	 */
	var postSignOnInitialise = function() {
		var loadApp = function() {
			$U.core.widgets.PageLoading.show($U.core.signon.SignOn);
			$N.services.sdp.Bookmark.init($U.core.signon.user.accountUid);
			$U.core.Preferences.initialise();
			$U.core.parentalcontrols.ParentalControls.initialise($U.core.Launch.postParentalRatingInitialise);
		};

		$N.platform.system.Network.registerListener($U.core.NetworkHandler.networkChanged);

		if (!$U.core.Configuration.MOBILE_NETWORK.allowVideoPlayback) {
			$U.core.store.LocalStore.setItem("mobilevideo", JSON.stringify({
				value : "no"
			}));
		}
		$U.core.widgets.PageLoading.hide($U.core.signon.SignOn);
		if ($U.core.Configuration.MOBILE_NETWORK.showDialogAtSignon) {
			$U.core.NetworkHandler.appLoadNetworkCheck(loadApp);
		} else {
			loadApp();
		}
	};

	/**
	 * Setups the main application features, called after the parental control rating has been set
	 * initliaseVod, EPGScreen etc
	 */
	var postParentalRatingInitialise = function () {
		if (logger) {
			logger.timeStampLog("PARENTAL RATINGS SET");
		}
		var continueLoad = function() {
			$U.core.ApplicationState.attach();
			$U.core.category.favourites.Favourites.initialise();
			$U.core.category.recentlyviewed.RecentlyViewed.initialise();
			initialiseVod();
			initialiseAcl(function () {
				$U.epg.EPGScreen.initialise();
				initialiseApplicationLifecycle();
				initialiseView();
			});
		};


		if ($U.core.Configuration.NPVR_ENABLED) {
			$U.core.NPVRManager.initialise(continueLoad);
		} else {
			continueLoad();
		}
	};

	/**
	 * Initialises the Acl and calls the provided callback once complete.
	 */
	function initialiseAcl(aclInitComplete) {
		var aclInitialiseCallback = function () {
			$N.services.sdp.AcquiredContent.removeAclChangeCallback();
			aclInitComplete();
		};
		$N.services.sdp.AcquiredContent.registerAclChangeCallBack(aclInitialiseCallback);
		$N.services.sdp.AcquiredContent.initialise($U.core.signon.user.accountUid, $U.core.Locale.getLocale());
	}

	/**
	 * Initialises VOD and acquired content list
	 * @private
	 */
	function initialiseVod() {
		var initialiseVODList;
		initialiseVODList = $U.core.Configuration.FEATURE_NAME_LIST || $U.core.Device.getDeviceNameList();
		$N.services.sdp.Ratings.cacheRatingTable($U.core.Locale.getLocale(), function () {});
		$N.services.sdp.VOD.initialise($U.core.signon.user.accountUid, $U.core.signon.user.userUid, null, true, $U.core.Locale.getLocale(), initialiseVODList);
	}

	/**
	 * Setup the application life cycle and register a listener to check for application update
	 * @private
	 */
	function initialiseApplicationLifecycle() {
		$U.core.LifecycleHandler.initialise(CONFIG_REF.LIFECYCLE_TIMINGS.CHECK);
		$U.core.LifecycleHandler.registerListener($U.core.UpdateCheck.checkForUpdate, CONFIG_REF.LIFECYCLE_TIMINGS.UPDATE, $U.core.LifecycleHandler.APPEVENT_TYPES.SPAN);
		$U.core.LifecycleHandler.registerListener($U.core.RefreshApplication.refreshDialog, CONFIG_REF.LIFECYCLE_TIMINGS.SLEEP_REFRESH, $U.core.LifecycleHandler.APPEVENT_TYPES.SLEEP);
	}

	/**
	 * Creates the view and makes the masterContainer visible.
	 * @private
	 */
	function initialiseView() {
		var masterContainer;
		$U.core.View.create();
		masterContainer = $U.core.View.getViewContainer();

		if ($U.core.View.getDialog()) {
			$U.core.View.hideDialog();
		}
		if(logger){
			logger.timeStampLog("VIEW CREATED");
		}
		// $U.core.util.ScrollableHelper.disableScrollForContainer(masterContainer);
		$U.core.widgets.PageLoading.show($U.core.signon.SignOn);
		$U.core.View.setCanClick(true);
	}

	function removeFromDestroyList(item) {
		var i = $U.destroyList.indexOf(item);
		if (i === -1) {
			return false;
		}
		$U.destroyList.splice(i, 1);
		return true;
	}

	return {
		initialise : initialise,
		postPlayerInitialise : postPlayerInitialise,
		postSignOnInitialise : postSignOnInitialise,
		postParentalRatingInitialise : postParentalRatingInitialise,
		refreshUIEntryPoint : refreshUIEntryPoint,
		removeFromDestroyList : removeFromDestroyList
	};

}());
