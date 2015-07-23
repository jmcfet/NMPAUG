var $U = $U || {};
$U.core = $U.core || {};
$U.core.store = $U.core.store || {};
$U.core.store.SecureStore = ( function() {

	/**
	 * @class $U.core.SecureStore
	 * @singleton
	 * Core class that interfaces with the NMP secure storage agent
	 */

	var logger = $U.core.Logger.getLogger("SecureStore");

	var callbackCount = 0;

	function getItem(key, callback) {
		createCallbackObject(key, callback, callbackCount);
		secureStorageAgent.getItem(key, "$U.core.store.SecureStore.callback" + callbackCount);
		callbackCount++;
	}
	
	function setItem(key, value) {
		if (logger) {
			logger.log("setItem", "setting", key, " = ", value);
		}		
		secureStorageAgent.setItem(key, value);
	}

	function removeItem(key) {
		if (logger) {
			logger.log("removeItem", "removing", key);
		}
		secureStorageAgent.removeItem(key);
	}	
	
	function isSecure() {
		return true;
	}	

	function createCallbackObject(requestedKey, callback, callbackCount) {
		$U.core.store.SecureStore["callback" + callbackCount] = {
			item : function(key, value) {
				if (logger) {
					logger.log("getItem", "callback", callbackCount, "requestedKey:", requestedKey, "returned key:", key, "value:", value);					
				}
				delete $U.core.store.SecureStore["callback" + callbackCount];
				if (key !== requestedKey) {
					value = undefined;
				}
				callback(value);
			}
		};
	}

	return {
		getItem : getItem,
		setItem : setItem,
		removeItem : removeItem,
		isSecure : isSecure
	};
}());
