var $U = $U || {};
$U.core = $U.core || {};
$U.core.store = $U.core.store || {};
$U.core.store.PluginSecureStore = ( function() {

	/**
	 * @class $U.core.PluginSecureStore
	 * @singleton
	 * Core class that interfaces with the NMP plugin secure storage agent
	 */

	var logger = $U.core.Logger.getLogger("PluginSecureStore");

	function getItem(key, callback) {
		var value = window.pluginSecureStorageAgent.getItem(key);
		if (logger) {
			logger.log("getItem", "returning", key, " = ", value);
		}
		callback(value);
	}

	function setItem(key, value) {
		if (logger) {
			logger.log("setItem", "setting", key, " = ", value);
		}
		if (value === undefined) {
			removeItem(key);
		} else {
			window.pluginSecureStorageAgent.setItem(key, value);
		}
	}

	function removeItem(key) {
		if (logger) {
			logger.log("removeItem", "removing", key);
		}
		window.pluginSecureStorageAgent.removeItem(key);
	}
	
	function isSecure() {
		return true;
	}	

	return {
		getItem : getItem,
		setItem : setItem,
		removeItem : removeItem,
		isSecure : isSecure
	};
}());
