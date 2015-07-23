
/**
 * Provides Logger functionality for application.
 *
 * @class $U.core.Logger
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.Logger = ( function() {

	var MODULE = "JUI";
	var logs = {};
	var ws;

	// Whether or not to show FPS counter
	var SHOW_FPS = false;

	// Whether or not to show timer counter
	var SHOW_TIMER = false;

	// Configure the logging
	// TODO: expose this programmatically
	var config = {

		// Whether any logging is enabled
		enabled : true,

		// Whether to add a timestamp to each log entry
		timestamp : true,

		// Whether local logging (in the browser's console) is enabled
		local : true,

		// Whether enhanced local logging (objects, arrays etc) is enabled
		localEnhanced : true

		// Whether remote logging is enabled
		// remote : true,

		// Remote logging url, must start with "ws://" for websocket logging
		// server : "/metrics"
		// server : "ws://10.8.1.26:6767"
	};

	// Fix for IE9 where there is no support for enhanced local logging
	if (window.console.log.apply === undefined) {
		config.localEnhanced = false;
	}

	// Websocket remote logging?
	config.socket = config.remote && config.server && config.server.match(/ws:\/\//);

	// Disable Loggers
	//logs.AssetContainer = null;
	//logs.AssetScroller = null;
	logs.AssetTile = null;
	logs.ImageAssetTile = null;
	logs.Scroller = null;
	//logs.Menu = null;
	//logs.LifecycleHandler = null;

	//Configure the JSFW logging
	$N.apps.core.Log.Config.configure({
		defaultValues: 0,
		moduleLogging: {
			platform: 1,
			sdp: 1,
			signon: 1
		},
		classLogging: {
			SignonWithNMPManager: 1,
			SignOn: 1,
			DRM: 1,
			PlayoutManager: 1
		}
	});

	if (config.remote && config.socket) {
		try {
			ws = new $U.core.WebSocketLogger(config.server);
		} catch (e) {
			window.console.error("Could not instantiate WebSocketLogger");
			config.remote = false;
		}
	}

	// Replace the default console.log mehod
	window.console._oldLog = window.console.log;
	window.console.log = function() {
		var a, i, l;
		if (config.enabled) {
			a = [];
			l = arguments.length;

			for ( i = 0; i < l; i++) {
				a[i] = arguments[i];
			}

			if (config.timestamp) {
				a.unshift(getTimestamp());
			}

			if (config.localEnhanced) {
				window.console._oldLog.apply(window.console, a);
			} else {
				window.console._oldLog(a.join(" "));
			}

			if (config.remote) {
				if (config.socket) {
					ws.send(a.join(" "));
				} else {
					$.post(config.server, a.join(" "));
				}
			}
		}
	};

	function getLogger(classContext) {
		var result = null;
		if (config.enabled && logs[classContext] !== null) {
			return logs[classContext] || (logs[classContext] = new Logger(classContext));
		}
		return result;
	}

	function Logger(classContext) {
		this.prefix = MODULE + " [" + classContext + ".";
	}


	Logger.prototype.log = function() {
		var a = arguments;
		a[0] = this.prefix + a[0] + "]";
		window.console.log.apply(window.console, arguments);
	};

	Logger.prototype.fps = function(fps, dropped) {
		if (SHOW_FPS) {
			var n = Math.round(fps * 10);
			var el = document.getElementById("fps");
			if (el === null) {
				el = document.createElement("div");
				el.id = "fps";
				el.style.position = "absolute";
				el.style.backgroundColor = "black";
				el.style.padding = "10px";
				el.style.left = "50px";
				document.body.appendChild(el);
			}
			el.textContent = (Math.floor(n / 10) + "." + (n % 10)) + " / " + dropped;
		}
	};

	Logger.prototype.timer = function(timer, count, dropped) {
		if (SHOW_TIMER) {
			var el = document.getElementById("fps");
			if (el === null) {
				el = document.createElement("div");
				el.id = "fps";
				el.style.position = "absolute";
				el.style.backgroundColor = "black";
				el.style.padding = "10px";
				el.style.left = "50px";
				document.body.appendChild(el);
			}
			el.textContent = Math.floor(timer) + " / " + count + " / " + dropped;
		}
	};

	Logger.prototype.timeStampLog = function(){
		var a = arguments;
		a[0] = "<"+getTimestamp()+">" + a[0];
		//window.console.log.apply(window.console, arguments);
	};

	function getTimestamp() {
		var d = new Date();
		var h = d.getHours();
		var m = String(d.getMinutes());
		var s = String(d.getSeconds());
		var ms = String(d.getMilliseconds());
		return [h < 10 ? "0" + h : h, ":", m < 10 ? "0" + m : m, ":", s < 10 ? "0" + s : s, ".", ms < 100 ? "0" : "", ms < 10 ? "0" + ms : ms].join("");
	}

	// Public API
	return {
		getLogger : getLogger
	};

}());

