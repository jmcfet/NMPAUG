var $U = $U || {};
$U.core = $U.core || {};
$U.core.ConnectionChecker = ( function() {

	var APPLICATION_ERROR_TITLE_KEY = "txtApplicationErrorTitle";
	var APPLICATION_ERROR_MESSAGE_KEY = "txtApplicationErrorMessage";
	var APPLICATION_ERROR_BUTTON_KEY = "txtApplicationErrorButton";
	
	var CONNECTION_ERROR_TITLE_KEY = "txtConnectionErrorTitle";
	var CONNECTION_ERROR_MESSAGE_KEY = "txtConnectionErrorMessage";
	var CONNECTION_ERROR_BUTTON_KEY = "txtConnectionErrorButton";	

	var CONNECTION_WARNING_TITLE_KEY = "txtConnectionWarningTitle";
	var CONNECTION_WARNING_MESSAGE_KEY = "txtConnectionWarningMessage";
	var CONNECTION_WARNING_BUTTON_KEY = "txtConnectionWarningButton";	

	var ICON_POS = "left";
	var ICON_CONTINUE = "icon-ok-sign";
	var ICON_REFRESH = "icon-refresh";

	/**
	 * Refresh the application after an error
	 *
	 * @param {String} title
	 * @param {String} message
	 * @param {Boolean} checkNetwork whether to check the network connection first
	 */
	var refreshAfterError = function(title, message, checkNetwork) {
		
		title = title || $U.core.util.StringHelper.getString(APPLICATION_ERROR_TITLE_KEY);
		message = message || $U.core.util.StringHelper.getString(APPLICATION_ERROR_MESSAGE_KEY);
		var button = $U.core.util.StringHelper.getString(APPLICATION_ERROR_BUTTON_KEY);
		var icon = ICON_REFRESH;
		
		if (checkNetwork !== false) {
			checkNetwork = true;
		}
		if (checkNetwork) {
			refreshIfNoNetworkConnection(function() {
				showDialog(title, message, button, icon, function() {
					$U.core.RefreshApplication.refresh();
				});
			});
		}
	};

	/**
	 * Refresh the application if there is no network connection
	 *
	 * @param {Function} callback function to be called if the network connection is ok
	 *
	 * Note: that callback is not called if there is no network connection!
	 */
	var refreshIfNoNetworkConnection = function(callback) {
		
		var title = $U.core.util.StringHelper.getString(CONNECTION_ERROR_TITLE_KEY);
		var message = $U.core.util.StringHelper.getString(CONNECTION_ERROR_MESSAGE_KEY);
		var button = $U.core.util.StringHelper.getString(CONNECTION_ERROR_BUTTON_KEY);
		var icon = ICON_REFRESH;
		
		checkNetworkConnection(function(status) {
			if (status) {
				callback();
			} else {
				showDialog(title, message, button, icon, function() {
					$U.core.RefreshApplication.refresh();
				});
			}
		});
	};
	
	/**
	 * Warn the user if there is no network connection
	 * 
	 * @param {Function} callback 
	 * @param {Boolean} callback.status whether or not there was a network connection
	 */

	var warnIfNoNetworkConnection = function(callback) {
		
		var title;
		var message;
		var button;
		var icon;
		
		checkNetworkConnection(function(status) {
			if (status) {
				callback(true);
			} else {
				title = $U.core.util.StringHelper.getString(CONNECTION_WARNING_TITLE_KEY);
				message = $U.core.util.StringHelper.getString(CONNECTION_WARNING_MESSAGE_KEY);
				button = $U.core.util.StringHelper.getString(CONNECTION_WARNING_BUTTON_KEY);
				icon = ICON_CONTINUE;
				showDialog(title, message, button, icon, function() {
					callback(false);
				});
				
			}
		});
	};	

	/**
	 * Check for a network connection.
	 * @param {Function} callback
	 * @param {Boolean} callback.networkConnection whether or not a network connection was found
	 */
	function checkNetworkConnection(callback) {

		$.get(("appInstalled" + "?" + new Date().getTime()) + "-" + Math.floor((Math.random() * 1000) + 1)).fail(function() {
			callback(false);
		}).success(function() {
			callback(true);
		});
	}
	
	function showDialog(title, message, button, icon, callback) {
		
		var dialogConf = {
			title : title,
			modal : true, 
			type : $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC,
			htmlmessage : message
		};

		dialogConf.buttons = [{
			text : button,
			icon : {
				iconClass : icon,
				iconPos : ICON_POS
			}
		}];
		
		$U.core.widgets.PageLoading.hideAll(); 
		$U.core.View.showDialog(dialogConf, function(interactiveElements, owner) {
			$U.core.View.hideDialog();
			callback();				
		});		
	}

	return {
		refreshAfterError : refreshAfterError,
		refreshIfNoNetworkConnection : refreshIfNoNetworkConnection,
		warnIfNoNetworkConnection : warnIfNoNetworkConnection
	};

}());