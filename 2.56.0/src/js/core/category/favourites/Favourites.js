/**
 * Gives the ability to add/remove and look after favourite asset items
 * Wraps the JSFW favourites functionality
 * @class $U.core.category.favourites.Favourites
 *
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.favourites = $U.core.category.favourites || {};

$U.core.category.favourites.Favourites = ( function() {

	var logger = $U.core.Logger.getLogger("Favourites");

	// Time in ms to wait before giving up on getting response from JSFW
	var FAIL_TIMEOUT = 2000;

	// Whether Favourites has been initialised
	var initialised = false;
	// Functions to call when initialised
	var initialiseListeners = [];

	//array of favourite assetIds
	var favs = null;
	var favService = null;
	//true if the favourites have only been changed locally
	var changedLocally = true;

	/**
	 * Get sets the favourite service
	 * @return {Object} favourite service
	 * @private
	 */
	function getFavService() {
		if (!favService) {

			favService = $N.services.sdp.Favourites;
		}
		return favService;
	}

	/**
	 * Adds the assetId to the array of favourites, should only be called from the toggleFav function
	 * @param {string} assetId the id to add
	 * @param {Number} type (BTV, VOD or PVR)
	 * @param {Function} compelteCallback the callback to call once complete
	 * @param {Function} toggleButtonCallback the callback used to toggle the state of the favourites button
	 * @private
	 */
	var _addToFavs = function(assetId, type, completeCallback, toggleButtonCallback) {
		if (logger) {
			logger.log("addToFavs", "adding: " + assetId + " type:" + type);
		}
		var callback = function(bool, error) {
			if ( typeof completeCallback === "function") {
				completeCallback(bool, assetId, error);
			}
		};

		// Wrap the callback function up to make sure it's called asynchronously
		var asyncCallback = function(result, error) {
			window.setTimeout(function() {
				callback(result, error);
			}, 0);
		};
		getFavService().addToFavourites(assetId, type, asyncCallback);
		_addToLocalFavs(assetId, type, toggleButtonCallback);
	};

	/**
	 * Adds the assetId to the local array of favourites and the fires a callback that toggles the state of the favourites button
	 * Introduced to make the toggling of the button faster as the normal remove requires a response from the server before firing the callback
	 * @param {string} assetId the id to add
	 * @param {Number} type (BTV, VOD or PVR)
	 * @param {Function} successCallback the callback to use if successful
	 * @private
	 */
	var _addToLocalFavs = function(assetId, type, successCallback) {
		favs.push({
			cId : assetId,
			cT : type
		});
		if (logger) {
			logger.log("_addToLocalFavs", "favs: " + JSON.stringify(favs));
		}
		changedLocally = true;
		successCallback();
	};

	/**
	 * Returns true if assetId is in local list of Favourites
	 * @param {$U.core.mediaitem.MediaItemType} item the item to check
	 * @param {$U.core.mediaitem.MediaItemType} mediaType use in the mediaScreen
	 * @return {Object} gives information on whether the item is in the favourites or not and whether it's only the local favourites that have changed
	 */
	var isFavourite = function(item) {
		var type = _mapMediaTypes(item.type);
		var assetId = _getAssetID(item);

		return _isInFavs(assetId, type);
	};

	/*
	 * For a give item it returns the id used in the favourites
	 * For gateway channels it need to convert the id to the correct channel id
	 * @param item where the id is to come from
	 * @return the id used in the favourites
	 */
	var _getAssetID = function(item) {
		var assetId;

		if (item.type === $U.core.mediaitem.MediaItemType.BTVEVENT || item.type === $U.core.mediaitem.MediaItemType.NPVR) {
			if ($U.core.Gateway.isGatewayAvailable() && item.channel && item.channel.dvbTriplet) {
				assetId = item.channel.dvbTriplet.split(",").pop();
			} else {
				assetId = item.serviceId;
			}
		} else {
			assetId = item.id;
		}

		return assetId;
	};

	/**
	 * Returns an Object which tells if the asset is in the favourites (favourite parameter of object) <br>
	 * and if it's only just had it's state changed locally (local parameter in the object)
	 * @param {string} assetId the id to add
	 * @param {Number} type (BTV, VOD or PVR)
	 * @return {Object} gives information on whether the item is in the favourites or not and whether it's only the local favourites that have changed
	 * @private
	 */
	var _isInFavs = function(assetId, type) {
		var i;
		var len = favs.length;
		var isInObject = {
			local : changedLocally,
			favourite : false
		};
		for ( i = 0; i < len; i++) {
			if (favs[i].cId === assetId && favs[i].cT === type) {
				isInObject.favourite = true;
				i = len;
			}
		}
		return isInObject;
	};

	/**
	 * Removes the assetId from the array of favourites, should only be called from the toggleFav function
	 * @param {string} assetId the id to add
	 * @param {Number} type (BTV, VOD or PVR)
	 * @param {Function} compelteCallback the callback to call once complete
	 * @param {Function} toggleButtonCallback the callback used to toggle the state of the favourites button
	 * @private
	 */
	var _removeFromFavs = function(assetId, type, completeCallback, toggleButtonCallback) {
		if (logger) {
			logger.log("removeFromFavs", "removing: " + assetId + " type:" + type);
		}
		var callback = function(bool, errorObj) {
			if ( typeof completeCallback === "function") {
				completeCallback(bool, assetId, errorObj);
			}
		};

		// Wrap the callback function up to make sure it's called asynchronously
		var asyncCallback = function(result, errorObj) {
			window.setTimeout(function() {
				callback(result, errorObj);
			}, 0);
		};
		getFavService().removeFromFavourites(assetId, type, asyncCallback);
		_removeFromLocalFavs(assetId, type, toggleButtonCallback);
	};

	/**
	 * Removes the favourite from the local array of favourites then fires a callback to change the state of the button
	 * Introduced to make the toggling of the button faster as the normal remove requires a response from the server before firing the callback
	 * @param {string} assetId the id to add
	 * @param {Number} type (BTV, VOD or PVR)
	 * @param {Function} successCallback the callback to use if successful
	 * @private
	 */
	var _removeFromLocalFavs = function(assetId, type, successCallback) {
		var i;
		var len = favs.length;
		for ( i = 0; i < len; i++) {
			if (favs[i].cId === assetId && favs[i].cT === type) {
				favs.splice(i, 1);
				i = len;
			}
		}
		if (logger) {
			logger.log("_removeFromLocalFavs", "favs: " + JSON.stringify(favs));
		}
		changedLocally = true;
		successCallback();
	};

	/**
	 * Returns the error string corresponding the error code contained within the provided error object.
	 * @param {Object} errorObj the error object to get the error message for
	 * @return {String} errorMessage The error String
	 * @private
	 */
	var _getErrorMessage = function(errorObj) {
		var errors = getFavService().ERROR_CODES, errorMessage;
		switch (errorObj.code) {
		case errors.SERVER_ERROR_CREATE:
			errorMessage = $U.core.util.StringHelper.getString("favouritesServerCreateErr");
			break;
		case errors.SERVER_ERROR_DELETE:
			errorMessage = $U.core.util.StringHelper.getString("favouritesServerDeleteErr");
			break;
		case errors.MAX_FAVOURITES_REACHED:
			errorMessage = $U.core.util.StringHelper.getString("favouritesMaxReachedErr");
			break;
		case errors.STALE_UPDATE:
			errorMessage = $U.core.util.StringHelper.getString("favouritesStaleUpdate");
			break;
		default:
			errorMessage = $U.core.util.StringHelper.getString("favouritesDefault");
		}
		return errorMessage;
	};

	/**
	 * Creates and displays a favourites error dialog
	 * @param {Object} error Error object to display dialog for
	 * @param {Function} callback callback to execute once complete
	 * @private
	 */
	var _displayFavouritesError = function(error, callback) {
		var configObject = {}, eventListener = function(interactiveElements, owner) {
			switch (interactiveElements[0].buttonClicked) {
			case "Ok" :
				$U.core.View.hideDialog();
				break;
			}
		};
		configObject._postCloseCallback = function() {
			getFavsFromServer(callback);
		};
		configObject.title = $U.core.util.StringHelper.getString("favouritesError");
		configObject.type = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : null;
		configObject.htmlmessage = _getErrorMessage(error);
		configObject.modal = true;
		configObject.buttons = [];
		configObject.buttons[0] = {};
		configObject.buttons[0].text = $U.core.util.StringHelper.getString("txtOK");
		configObject.buttons[0].name = "Ok";
		configObject.buttons[0].icon = {
			iconClass : "icon-ok-sign",
			iconPos : "left"
		};
		$U.core.View.showDialog(configObject, eventListener);
	};

	/**
	 * If the assetId is in the favourites it removes it otherwise it adds it.<br>
	 * This is called by the 'favourites button'
	 * @param {$U.core.mediaitem.MediaItem} item the item to toggle
	 * @param {Function} successCallback the callback to use if successful
	 */
	var toggleFav = function(item, toggleButtonCallback) {
		var type = _mapMediaTypes(item.type);
		var assetId = _getAssetID(item);
		var favObj;
		var callback = function(success, assetId, errorObj) {
			var errors = getFavService().ERROR_CODES;
			if (!success && errorObj) {
				switch (errorObj.code) {
				case errors.MAX_FAVOURITES_REACHED:
					_displayFavouritesError(errorObj, toggleButtonCallback);
					break;
				case errors.SERVER_ERROR_CREATE:
					_displayFavouritesError(errorObj, toggleButtonCallback);
					break;
				case errors.SERVER_ERROR_DELETE:
					_displayFavouritesError(errorObj, toggleButtonCallback);
					break;
				case errors.STALE_UPDATE:
					_displayFavouritesError(errorObj, toggleButtonCallback);
					break;
				default:
					getFavsFromServer(toggleButtonCallback);
				}
			} else {
				getFavsFromServer(toggleButtonCallback);
			}
		};

		favObj = _isInFavs(assetId, type);

		if (!favObj.local) {
			if (favObj.favourite) {
				_removeFromFavs(assetId, type, callback, toggleButtonCallback);
			} else {
				_addToFavs(assetId, type, callback, toggleButtonCallback);
			}
		}
	};

	/**
	 * Maps the mediaType from the mediaScreen to that used in the JSFW favourites service
	 * @param {$U.core.mediaitem.MediaItemType} mediaType use in the mediaScreen
	 * @return {number} the type used by JSFW
	 * @private
	 */
	var _mapMediaTypes = function(mediaType) {
		var type;
		switch(mediaType) {
		// BTVEVENT and BTVCHANNEL both map to BTV
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
		case $U.core.mediaitem.MediaItemType.BTVCHANNEL:
		case $U.core.mediaitem.MediaItemType.NPVR:
			type = getFavService().CONTENT_TYPE.BTV;
			break;
		default:
			type = getFavService().CONTENT_TYPE.VOD;
		}
		return type;
	};

	/**
	 * Maps the contentType from the JSFW favourites service to that used by the customCategories
	 * @param {number} type used by JSFW
	 * @return {number} the contentType used in customCategories
	 * @private
	 */
	var _mapCustomCategoryTypes = function(type) {
		var contentType;
		var types = getFavService().CONTENT_TYPE;

		switch(type) {
		case types.BTV:
			contentType = $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL;
			break;
		default:
			contentType = $U.core.CategoryConfiguration.CONTENT_TYPE.VOD;
		}
		return contentType;
	};

	/**
	 * Returns the Array of favourites in a form that can displayed in an asset container
	 * @return the manipulated items
	 */
	var getCustomCategoryItems = function() {
		var i;
		var len;
		var items = [];

		if (favs === null) {
			if (logger) {
				logger.log("getCustomCategoryItems", "favs is null");
			}
		} else {
			len = favs.length;
			for ( i = 0; i < len; i++) {
				items.push({
					type : _mapCustomCategoryTypes(favs[i].cT),
					data : [favs[i].cId]
				});
			}
		}

		return items;
	};

	/**
	 * Retrieves the favourites from the server,
	 * should be called on every remove and add to keep the consistency across the devices for the account
	 * @param {Function} successCallback the callback to use if successful
	 */
	var getFavsFromServer = function(successCallback) {
		var timerId;
		var alreadyCalled = false;
		var callback = function(favsFromServer) {
			if (logger) {
				logger.log("_settingLocalFavs", "favs: " + JSON.stringify(favsFromServer), alreadyCalled ? " <-- ignoring callback, already called!" : "");
			}
			window.clearTimeout(timerId);
			if (!alreadyCalled) {
				changedLocally = false;
				favs = favsFromServer;
				if ( typeof successCallback === "function") {
					successCallback();
				}
				alreadyCalled = true;
			}
		};

		if (logger) {
			logger.log("getFavsFromServer");
		}

		// Wrap the callback function up to make sure it's called asynchronously
		var asyncCallback = function(result) {
			window.setTimeout(function() {
				callback(result);
			}, 0);
		};
		getFavService().getFavourites(asyncCallback);

		// This is an (unsatisfactory) workaround for MSUI-1072
		// In case similar data corruption that is seen for recently viewed could also affect favourites.
		timerId = window.setTimeout(function() {
			if (logger) {
				logger.log("getFavsFromServer", "Timeout: no response received from getFavsFromServer within " + FAIL_TIMEOUT + "ms");
			}
			callback([]);
		}, FAIL_TIMEOUT);
	};

	/**
	 * Ensures that favs is up to date, either from local copy of the server
	 * @param {Function} callback function
	 */
	var getFavs = function(callback) {
		if (!initialised) {
			if (logger) {
				logger.log("getFavs", "waitForInitialise...");
			}
			// Favourites has not yet initialised
			waitForInitialise(callback);
		} else if (changedLocally) {
			if (logger) {
				logger.log("getFavs", "changed locally");
			}
			// Favourites has only changed locally
			callback();
		} else {
			if (logger) {
				logger.log("getFavs", "getFavsFromServer...");
			}
			// Favourites needs to come from the server
			getFavsFromServer(callback);
		}
	};

	/**
	 * Initialises the service, gets the current favourites from the server
	 */
	var initialise = function() {

		var maxItems = $U.core.Configuration.FAVOURITES.MAXITEMS;
		var useLocalStorage = $U.core.Configuration.FAVOURITES.USELOCAL;

		// Reset since we might be called as part of a UI refresh
		initialised = false;
		initialiseListeners = [];

		getFavService().init(maxItems, useLocalStorage);

		getFavsFromServer(initialiseCallback);

	};

	/**
	 * Callback when initialise finishes.
	 * @private
	 */
	function initialiseCallback() {
		var i;
		var l = initialiseListeners.length;

		if (logger) {
			logger.log("initialiseCallback");
		}

		initialised = true;

		// Call any initialiseListeners
		for ( i = 0; i < l; i++) {
			initialiseListeners[i]();
		}
		$U.core.View.setCanRemoveFavourite(true);
	}

	/**
	 * Wait for initialise then call a function
	 * @param {Function} callback the function to call
	 */
	function waitForInitialise(callback) {
		initialiseListeners.push(callback);
	}

	/**
	 * returns a boolean flag to say whether the favs have initialised
	 * @return {Boolean}
	 */
	function isFavouritesInitialised() {
		return initialised;
	}

	return {
		initialise : initialise,
		isFavourite : isFavourite,
		toggleFav : toggleFav,
		getCustomCategoryItems : getCustomCategoryItems,
		getFavsFromServer : getFavsFromServer,
		getFavs : getFavs,
		isFavouritesInitialised : isFavouritesInitialised
	};

}());
