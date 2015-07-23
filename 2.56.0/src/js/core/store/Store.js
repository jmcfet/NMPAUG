var $U = $U || {};
$U.core = $U.core || {};
$U.core.store = $U.core.store || {};
$U.core.store.Store = ( function() {

	/**
	 * @class $U.core.store.Store
	 * @singleton
	 * Core class that interfaces with local storage
	 */

	var logger = $U.core.Logger.getLogger("Store");

	var store;

	function getStore() {
		if (!store) {
			if (window.pluginSecureStorageAgent) {
				if (logger) {
					logger.log("getStore", "using $U.core.store.PluginSecureStore");
				}
				store = $U.core.store.PluginSecureStore;
			} else if (window.secureStorageAgent) {
				if (logger) {
					logger.log("getStore", "using $U.core.store.SecureStore");
				}
				store = $U.core.store.SecureStore;
			} else {
				if (logger) {
					logger.log("getStore", "using $U.core.store.LocalStore");
				}
				store = $U.core.store.LocalStore;
			}
		}
		return store;
	}

	function getItem(key, callback) {
		getStore().getItem(key, callback);
	}

	function setItem(key, value) {
		getStore().setItem(key, value);
	}

	function removeItem(key) {
		getStore().removeItem(key);
	}
	
	function isSecure() {
		return getStore().isSecure();
	}

	return {
		getItem : getItem,
		setItem : setItem,
		removeItem : removeItem,
		isSecure : isSecure
	};
}());
