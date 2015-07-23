var $U = $U || {};
$U.core = $U.core || {};
$U.core.Device = ( function() {

	var logger = $U.core.Logger.getLogger("Device");

	var allPropertyNames;
	var cachedPropertyNames = {};

	/**
	 * Implementation of device discovery and management
	 * @class $U.core.Device
	 * @singleton
	 */
	var IGNORE_CASE = "i";
	var MOBILE = "mobile";
	var IPAD = "iPad";
	var IPHONE = "iPhone";
	var MAC = "Macintosh";
	var WINDOWS = "Windows";
	var ANDROID = "Android";
	var PHONE = "Phone";
	var WEBKIT = "Webkit";

	//@formatter:off
	var OS = {
		MAC : {name:MAC},
		WINDOWS : {name:WINDOWS},
		ANDROID : {name:ANDROID},
		IOS : {name:"iOS"},
		UNKNOWN : {name:"unknown"}
	};

	var FF = {
		TABLET : {name:"tablet"},
		MINITAB : {name:"mini tablet"},
		PHONE : {name:PHONE},
		DESKTOP : {name:"desktop"},
		UNKNOWN : {name:"unknown"}
	};
	//@formatter:on

	var DEVICE_KEY = "devicename";

	var os = OS.UNKNOWN;
	var reportedFormFactor = FF.UNKNOWN;
	var measuredFormFactor = FF.UNKNOWN;

	var w = screen.width;
	var h = screen.height;

	var pixelWidth = Math.max(w, h);
	var pixelHeight = Math.min(w, h);
	var pixelRatio = window.devicePixelRatio;

	var dipsWidth = pixelWidth;
	var dipsHeight = pixelHeight;

	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	var ua = navigator.userAgent;

	var checkedConfigurationOS = false;
	var checkedConfigurationFF = false;

	var webkit = ua.match(new RegExp(WEBKIT, IGNORE_CASE));

	if (ua.match(new RegExp(IPAD, IGNORE_CASE))) {
		os = OS.IOS;
		reportedFormFactor = measuredFormFactor = FF.TABLET;

	} else if (ua.match(new RegExp(IPHONE, IGNORE_CASE))) {
		os = OS.IOS;
		reportedFormFactor = measuredFormFactor = FF.PHONE;

	} else if (ua.match(new RegExp(WINDOWS, IGNORE_CASE))) {
		os = OS.WINDOWS;
		reportedFormFactor = measuredFormFactor = FF.DESKTOP;

	} else if (ua.match(new RegExp(MAC, IGNORE_CASE))) {
		os = OS.MAC;
		reportedFormFactor = measuredFormFactor = FF.DESKTOP;

	} else if (ua.match(new RegExp(ANDROID, IGNORE_CASE))) {
		os = OS.ANDROID;
		if (ua.match(new RegExp(PHONE, IGNORE_CASE))) {
			reportedFormFactor = FF.PHONE;
		} else {
			reportedFormFactor = FF.TABLET;
		}
	}

	if (os === OS.IOS) {
		pixelWidth *= pixelRatio;
		pixelHeight *= pixelRatio;
	} else {
		dipsWidth /= pixelRatio;
		dipsHeight /= pixelRatio;
		if (os === OS.ANDROID) {
			// Special case for Nexus 7 where dips exclude toolbars
			if (dipsHeight === 552 && dipsWidth === 960 && ua.indexOf("Nexus 7") !== -1) {
				measuredFormFactor = FF.TABLET;
				// General case where screen height is less than 600
			} else if (dipsHeight < 600) {
				measuredFormFactor = FF.PHONE;
			} else if (dipsHeight < 768) {
				//measuredFormFactor = FF.MINITAB;
				measuredFormFactor = FF.TABLET;
			} else {
				measuredFormFactor = FF.TABLET;
			}
		}
	}

	// window.alert("outer: " + window.outerWidth + " x " + window.outerHeight + "\ninner: " + window.innerWidth + " x " + window.innerHeight + "\nscreen: " + screen.width + " x " + screen.height + "\ndips: " + dipsWidth + " x " + dipsHeight + " : " + pixelRatio);

	/**
	 * Gets the OS the app is running on
	 * @private
	 * @return {Object}
	 */
	function getOS() {
		if (!checkedConfigurationOS) {
			os = ($U.core.Configuration.DEVICE && $U.core.Configuration.DEVICE.OS) || os;
			checkedConfigurationOS = true;
		}
		return os;
	}

	/**
	 * Gets the Form factor the app is running on
	 * @private
	 * @return {Object}
	 */
	function getFF() {
		if (!checkedConfigurationFF) {
			measuredFormFactor = ($U.core.Configuration.DEVICE && $U.core.Configuration.DEVICE.FF) || measuredFormFactor;
		}
		return measuredFormFactor;
	}

	/**
	 * Fetch the nmpDeviceName from local store
	 * @param callback
	 * @return the nmpDeviceName, null if there isn't one
	 */
	function fetchNMPDeviceNameLocal(callback) {
		return $U.core.store.Store.getItem(DEVICE_KEY, callback);
	}

	/**
	 * Fetch the nmpDeviceName from the server
	 * @param callback
	 * @return the nmpDeviceName, null if there isn't one
	 */
	function fetchNMPDeviceNameServer(callback) {

		var deviceId = getDeviceId();

		if (deviceId) {
			$N.services.sdp.ServiceFactory.get("DeviceService").getMpById(this, function(device) {
				if (device && device.name) {
					if (logger) {
						logger.log("fetchNMPDeviceNameFromServer", "successfully fetched device name:", device.name);
					}
					callback(device.name);
				} else {
					if (logger) {
						logger.log("fetchNMPDeviceNameFromServer", "failed to fetch device name, server response: ", device);
					}
					callback(undefined);
				}
			}, function() {
				if (logger) {
					logger.log("fetchNMPDeviceNameFromServer", "failed to fetch device name");
				}
				callback(undefined);
			}, deviceId);
		} else {
			if (logger) {
				logger.log("fetchNMPDeviceNameFromServer", "failed to fetch device name");
			}
			callback(undefined);
		}
	}

	/**
	 * Set the nmpDeviceName locally
	 * @param {string} name the nmpDeviceName to set
	 */
	function storeNMPDeviceNameLocal(name) {

		var deviceId = getDeviceId();

		if (deviceId) {
			if (logger) {
				logger.log("storeNMPDeviceNameLocal", "successfully stored device name:", name);
			}
			$U.core.store.Store.setItem(DEVICE_KEY, name);
		} else {
			if (logger) {
				logger.log("storeNMPDeviceNameLocal", "failed to store device name:", name);
			}
		}
	}

	/**
	 * Set the nmpDeviceName on the server
	 * @param {string} name the nmpDeviceName to set
	 * @param {Function} callback function
	 */
	function storeNMPDeviceNameServer(name, callback) {

		var deviceId = getDeviceId();

		if (deviceId) {
			$N.services.sdp.Signon.setDeviceNameForNMPId(deviceId, name, function() {
				// success so callback(true)
				if (logger) {
					logger.log("storeNMPDeviceNameServer", "successfully stored device name:", name);
				}
				callback(true);
			}, function() {
				// failure so callback(false)
				if (logger) {
					logger.log("storeNMPDeviceNameServer", "failed to store device name:", name);
				}
				callback(false);
			});
		} else {
			if (logger) {
				logger.log("storeNMPDeviceNameServer", "failed to store device name:", name);
			}
			callback(false);
		}
	}

	/**
	 * @private
	 */
	function getDeviceId() {
		var result;
		if (window.drmAgent && window.drmAgent.deviceId) {
			result = window.drmAgent.deviceId;
			if (logger) {
				logger.log("getDeviceId", "window.drmAgent.deviceId", result);
			}
		} else if ($N.env && $N.env.deviceId) {
			result = $N.env.deviceId;
			if (logger) {
				logger.log("getDeviceId", "$N.env.deviceId;", result);
			}
		} else {
			if (logger) {
				logger.log("getDeviceId", "couldn't find deviceId");
			}
		}
		return result;
	}

	/**
	 * Get a CSS property name for this device.
	 * @param {string} canonical the canonical name
	 * @return {string} the css property name
	 */
	function getCSSPropertyName(canonical) {
		var n = getPropertyNames(canonical);
		return n ? n.css : null;
	}

	/**
	 * Get a JS property name for this device.
	 * @param {string} canonical the canonical name
	 * @return {string} the JS version of the css property name
	 */
	function getJSPropertyName(canonical) {
		var n = getPropertyNames(canonical);
		return n ? n.js : null;
	}

	/**
	 * Get a CSS property name for this device.
	 * @param {string} canonical the canonical name
	 * @return {Object} the property name, css and js versions
	 */
	function getPropertyNames(canonical) {

		var m;
		var result = cachedPropertyNames[canonical];

		if (!result) {

			// Create the list of style names if necessary
			allPropertyNames = allPropertyNames || " " + Array.prototype.slice.call(window.getComputedStyle(document.documentElement)).join(" ") + " ";

			// Find the canonical string  in the list of names if it's there
			// Otherwise look for a vendor-prefixed version
			m = new RegExp(" (" + canonical + ") ").exec(allPropertyNames) || new RegExp(" ((-moz-|-webkit-|-ms-)?" + canonical + ") ").exec(allPropertyNames);
			if (m) {
				result = {
					css : m[1],
					js : m[1].replace(/-(\w)/g, function _replace($1, $2) {
						return $2.toUpperCase();
					})
				};
				if (m[2] === "-ms-") {
					result.js = "m" + result.js.substr(1);
				}
				if (logger) {
					logger.log("getPropertyName", "canonical:", canonical, "result:", result);
				}
			} else {
				if (logger) {
					logger.log("getPropertyName", "canonical:", canonical, "No property name found");
				}
				result = null;
			}
			// Cache the result
			cachedPropertyNames[canonical] = result;
		}

		return result;
	}

	//TODO this needs to be amended so that we actual check if the CSS property exists without a prefix
	/**
	 * function that gets vendor prefixes and returns them in a number of ways i.e. CSS & JS prefixes
	 * http://davidwalsh.name/vendor-prefix
	 * @return {Object}
	 */
	function getVendorPrefix() {
		var styles;
		var pre;
		var dom;
		var r;

		styles = window.getComputedStyle(document.documentElement, '');

		pre = (Array.prototype.slice
		.call(styles)
		.join('')
		.match(/-(moz|webkit|ms)-/))[1];

		dom = ('Webkit|Moz|ms').match(new RegExp('(' + pre + ')', 'i'))[1];

		return {
			dom : dom,
			lowercase : pre,
			css : '-' + pre + '-',
			js : pre[0].toUpperCase() + pre.substr(1)
		};
	}

	/**
	 * Return a number that represents "now" as a number of milliseconds.
	 * The returned value may not any relationship to the time od day but can be used
	 * for comparing different "nows".
	 *
	 */
	function now() {
		return window.performance && window.performance.now() || Date.now() || +new Date();
	}

	/**
	 * Get the elapsed time in milliseconds since start.
	 * Useful for comparing two different "nows".
	 */
	function elapsed(start) {
		return now() - start;
	}

	return {
		OS : OS,
		FF : FF,

		getOS : getOS,
		getFF : getFF,

		getVendorPrefix : getVendorPrefix,

		/**
		 * Checks if running in webkit
		 * @return {boolean}
		 */
		isWebkit : function() {
			return webkit;
		},
		/**
		 * Checks if app is on mac
		 * @return {boolean}
		 */
		isMac : function() {
			return getOS() === OS.MAC;
		},
		/**
		 * Checks if app is on windows
		 * @return {boolean}
		 */
		isWindows : function() {
			return getOS() === OS.WINDOWS;
		},
		/**
		 * Checks if app is on iOS
		 * @return {boolean}
		 */
		isIOS : function() {
			return getOS() === OS.IOS;
		},
		/**
		 * Checks if app is on Android
		 * @return {boolean}
		 */
		isAndroid : function() {
			return getOS() === OS.ANDROID;
		},
		/**
		 * Checks if app is on desktop
		 * @return {boolean}
		 */
		isDesktop : function() {
			return getFF() === FF.DESKTOP;
		},
		/**
		 * Checks if app is on a phone
		 * @return {boolean}
		 */
		isPhone : function() {
			return getFF() === FF.PHONE;
		},
		/**
		 * Checks if app is on a tablet
		 * @return {boolean}
		 */
		isTablet : function() {
			return getFF() === FF.TABLET || getFF() === FF.MINITAB;
		},
		/** Check is app is running in IE9
		 * @return {boolean}
		 */
		isIE9 : function() {
			return ua.indexOf("MSIE 9.") !== -1;
		},
		/** Check is app is running in IE10
		 * @return {boolean}
		 */
		isIE10 : function() {
			return ua.indexOf("MSIE 10.") !== -1;
		},

		/** Check is app is running in IE11
		 * @return {boolean}
		 */
		isIE11 : function() {
			return (ua.indexOf("Trident") !== -1 && ua.indexOf("rv:11.") !== -1);
		},

		/** Check is app is running in Firefox
		 * @return {boolean}
		 */
		isFirefox : function() {
			return ua.indexOf("Firefox") !== -1;
		},
		/** Check is App is running Android 4.2.2 we see
		 * certain render issues with this version of Android
		 */
		isWebkitRenderFixNecessary : function() {
			return ua.indexOf("Android 4.2.2") !== -1 || ua.indexOf("Android 4.3") !== -1;
		},

		isIOS2x : function() {
			return getOS() === OS.IOS && !window.videoAgent;
		},

		isIOS3x : function() {
			return (getOS() === OS.IOS) && (window.videoAgent !== undefined);
		},

		isHandHeld : function() {
			return getOS() === OS.IOS || getOS() === OS.ANDROID;
		},

		isMacPlugin : function() {
			return getOS() === OS.MAC && !window.videoAgent;
		},

		isMacPlayer : function() {
			return getOS() === OS.MAC && (window.videoAgent !== undefined);
		},

		isPCPlugin : function() {
			return getOS() === OS.WINDOWS && !window.videoAgent;
		},

		isPCPlayer : function() {
			return getOS() === OS.WINDOWS && (window.videoAgent !== undefined);
		},

		isCSSFilterProperty : function() {
			var a = document.createElement("div");
			var _prefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-", ""];
			return a.style.cssText = _prefixes.join("filter:blur(2px); "), !!a.style.length && (document.documentMode === undefined || document.documentMode > 9);
		},

		/** Dynamically returns the width (in pixels) of the window
		 * @return {number} number of pixels width
		 */
		getDeviceWidth : function() {
			return window.innerWidth;
		},
		/** Dynamically returns the height (in pixels) of the window
		 * @return {number} number of pixesl height
		 */
		getDeviceHeight : function() {
			return window.innerHeight;
		},

		getDeviceNameList : function() {
			switch(getFF()) {
			case FF.TABLET:
			case FF.MINITAB:
				return $U.core.Configuration.DEVICE_NAME_LIST.tablet;
			case FF.PHONE:
				return $U.core.Configuration.DEVICE_NAME_LIST.phone;
			case FF.DESKTOP:
				return $U.core.Configuration.DEVICE_NAME_LIST.pc;
			}
		},

		getDeviceNameListBTV : function() {
			if ($U.core.Configuration.DEVICE_NAME_LIST_BTV) {
				switch(getFF()) {
				case FF.TABLET:
				case FF.MINITAB:
					return $U.core.Configuration.DEVICE_NAME_LIST_BTV.tablet;
				case FF.PHONE:
					return $U.core.Configuration.DEVICE_NAME_LIST_BTV.phone;
				case FF.DESKTOP:
					return $U.core.Configuration.DEVICE_NAME_LIST_BTV.pc;
				}
			} else {
				return null;
			}
		},

		getDeviceNameListNPVR: function () {
			if ($U.core.Configuration.DEVICE_NAME_LIST_NPVR) {
				switch (getFF()) {
				case FF.TABLET:
				case FF.MINITAB:
					return $U.core.Configuration.DEVICE_NAME_LIST_NPVR.tablet;
				case FF.PHONE:
					return $U.core.Configuration.DEVICE_NAME_LIST_NPVR.phone;
				case FF.DESKTOP:
					return $U.core.Configuration.DEVICE_NAME_LIST_NPVR.pc;
				}
			}
		},

		fetchNMPDeviceNameLocal : fetchNMPDeviceNameLocal,
		fetchNMPDeviceNameServer : fetchNMPDeviceNameServer,
		storeNMPDeviceNameLocal : storeNMPDeviceNameLocal,
		storeNMPDeviceNameServer : storeNMPDeviceNameServer,

		getPropertyNames : getPropertyNames,
		getCSSPropertyName : getCSSPropertyName,
		getJSPropertyName : getJSPropertyName,

		now : now,
		elapsed : elapsed
	};

}());
