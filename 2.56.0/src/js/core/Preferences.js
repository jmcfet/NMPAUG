/**
 * Wrapper class to expose the Preferences functionality in JSFW
 * @class $U.settings.Preferences
 *
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.Preferences = ( function() {
	var logger = $U.core.Logger.getLogger("Preferences");

	var prefService = null;
	var deviceId = null;
	var DOMAIN = "JOIN-IN";

	/**
	 * Get sets the preference service
	 * @return {Object} preference service
	 */
	function getPrefService() {
		if (!prefService) {
			prefService = $N.services.sdp.Preferences;
		}
		return prefService;
	}

	/**
	 * Retrieves the value of a given key from the server
	 * @param (string) key the key used for the value retrieval
	 * @param (Function) successCallback the callback used if the retrieval is successful, has form function(value)
	 * @param (Function) failCallback the callback used if the retrieval fails, has the form function()
	 * @param (boolean) [deviceSpecific] true if the key is for a specific device (this adds the device id to key)
	 */
	var get = function(key, successCallback, failCallback, deviceSpecific) {
		if (deviceSpecific) {
			key += deviceId;
		}
		key = key.toUpperCase();
		if (logger) {
			logger.log("get", "Trying to get: " + key);
		}
		getPrefService().get(key, successCallback, failCallback);
	};

	/**
	 * Sets the value of a given key to the server store.<br>
	 * If the key has already been set it gets replaced.<br>
	 * To delete a preference, send an empty as the value and this will remove it.
	 * @param (string) key the key used for the setting
	 * @param (string) value the value to be set
	 * @param (string) type the type that the value is (e.g. Long, String, Boolean etc)
	 * @param (Function) successCallback the callback used if the setting is successful, in the form function()
	 * @param (Function) failCallback the callback used if the setting fails, in the form function()
	 * @param (boolean) [deviceSpecific] true if the key is for a specific device (this adds the device id to key)
	 */
	var set = function(key, value, type, successCallback, failCallback, deviceSpecific) {
		if (deviceSpecific) {
			key += deviceId;
		}
		key = key.toUpperCase();
		//call delete then in the callbacks do the actual set
		getPrefService().deletePreference(key, function() {
			if (logger) {
				logger.log("deletePreference", "Successfully deleted:" + key);
			}
			if (value !== "") {
				_setValueOnServer(key, value, type, successCallback, failCallback, deviceSpecific);
			} else {
				successCallback();
			}
		}, function() {
			if (logger) {
				logger.log("deletePreference", "Failed to delete:" + key);
			}
			if (value !== "") {
				_setValueOnServer(key, value, type, successCallback, failCallback, deviceSpecific);
			} else {
				failCallback();
			}
		});
	};

	/**
	 * function that actually does the setting of the value to the server
	 * @param (string) key the key used for the setting
	 * @param (string) value the value to be set
	 * @param (string) type the type that the value is (e.g. Long, String, Boolean etc)
	 * @param (Function) successCallback the callback used if the setting is successful, in the form function()
	 * @param (Function) failCallback the callback used if the setting fails, in the form function()
	 * @private
	 */
	var _setValueOnServer = function(key, value, type, successCallback, failCallback) {
		if (logger) {
			logger.log("_setValueOnServer", "Trying to set: " + key + " to " + value);
		}
		getPrefService().set(key, value, type, DOMAIN, successCallback, failCallback);
	};
	
	/**
	 * Initialises this service, gets the deviceID to use when the deviceSpecific flag is set.
	 */
	var initialise = function() {
		getPrefService().initialise($U.core.signon.user.accountUid, $U.core.signon.user.userUid);
		deviceId = $U.core.Configuration.DEVICE_ID ? $U.core.Configuration.DEVICE_ID : $U.core.signon.user.deviceUid;
	};

	return {
		get : get,
		set : set,
		initialise : initialise
	};

}()); 