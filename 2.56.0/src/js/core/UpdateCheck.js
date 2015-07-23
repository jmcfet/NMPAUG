var $U = $U || {};

$U.core = $U.core || {};

$U.core.UpdateCheck = ( function() {

	/**
	 * Implementation of application freshness checking, using a remote file containing the version string
	 * @class $U.core.UpdateCheck
	 * @singleton
	 */
	var logger = $U.core.Logger.getLogger("UpdateCheck");
	
	var appCheckFile = "appInstalled";
	var isDisplayed = false;

	/**
	 * Check for and retrieves the remote version number for checking.
	 */
	var checkForUpdate = function() {

		var appUpdateDialogConf = null;
		var appUpdateDialogCallback = null;

		if (logger) {
			logger.log("checkForUpdate", "Checking for newer version of JUI");
		}
		$.get((appCheckFile + "?" + new Date().getTime()) + "-" + Math.floor((Math.random() * 1000) + 1), function(data) {
			if (data !== $U.core.version.Version.UI_VERSION) {
				if (logger) {
					logger.log("checkForUpdate", "Newer version of JUI found");
				}

				appUpdateDialogConf = {
					title : $U.core.util.StringHelper.getString("txtAppUpdateTitle"),
					message : $U.core.util.StringHelper.getString("txtAppUpdateMessage"),
					buttons : [{
						name : "update-app",
						text : $U.core.util.StringHelper.getString("txtOK"),
						icon : {
							iconClass : "icon-ok-sign",
							iconPos : "left"
						}
					}, {
						name : "cancel",
						text : $U.core.util.StringHelper.getString("txtCancel"),
						icon : {
							iconClass : "icon-remove-sign",
							iconPos : "left"
						}
					}]
				};

				appUpdateDialogCallback = function(interactiveElements) {
					var buttonClicked = interactiveElements[0].buttonClicked;
					switch (buttonClicked) {
					case "update-app" :
						$U.core.RefreshApplication.reload();
						break;
					case "cancel":
						$U.core.View.hideDialog();
						$U.core.LifecycleHandler.registerListener($U.core.UpdateCheck.checkForUpdate, $U.core.Configuration.LIFECYCLE_TIMINGS.UPDATE);
						break;
					}
				};

				if (!$U.core.View.getDialog() && $U.core.View.getCurrentScreenId() !== $U.core.View.SCREENID.MEDIACARD) {
					$U.core.View.showDialog(appUpdateDialogConf, appUpdateDialogCallback, $U.core.UpdateCheck);
					isDisplayed = true;
				} else {
					isDisplayed = false;
				}

				/* Currently just pops up an alert - future variant will create a dialog with OK/Cancel for reloading the app with a
				 * document.location.href call so we load the newer JUI from the server.
				 */
			} else {
				isDisplayed = false;
			}
			if (!isDisplayed) {
				$U.core.LifecycleHandler.registerListener($U.core.UpdateCheck.checkForUpdate, $U.core.Configuration.LIFECYCLE_TIMINGS.UPDATE);
			}
		});
	};

	return {
		checkForUpdate : checkForUpdate
	};

}());
