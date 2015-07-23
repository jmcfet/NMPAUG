var $U = $U || {};
$U.core = $U.core || {};
$U.core.store = $U.core.store || {};
$U.core.store.LocalStore = ( function() {

	/**
	 * @class $U.core.store.LocalStore
	 * @singleton
	 * Core class that interfaces with local storage
	 */

	var logger = $U.core.Logger.getLogger("LocalStore");

	function getItem(key, callback) {
		var value = window.localStorage.getItem(key);
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
			window.localStorage.setItem(key, value);
		}
	}

	function removeItem(key) {
		if (logger) {
			logger.log("removeItem", "removing", key);
		}
		window.localStorage.removeItem(key);
	}
	
	function isSecure() {
		return false;
	}

	return {
		getItem : getItem,
		setItem : setItem,
		removeItem : removeItem,
		isSecure : isSecure
	};
}());
