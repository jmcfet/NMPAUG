/**
 * Provides WebSocket Logger functionality for application.
 *
 * @class $U.core.WebSocketLogger
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.WebSocketLogger = ( function() {

	var ws;
	
	var open = false;
	var queue = [];

	function WebSocketLogger(url) {
		var that = this;
		ws = new WebSocket(url);
		
		ws.onopen = function(event) {
			that.onopen(event);
		};
		
		ws.onclose = function(event) {
			that.onclose(event);
		};
		
		ws.onerror = function(event) {
			that.onerror(event);
		};						
	}
	
	var proto = WebSocketLogger.prototype;
	
	proto.onopen = function(event) {
		open = true;
		console.log("\n\nWebSocketLogger is open for business\n");		
		while (queue.length > 0) {
			ws.send(queue.shift());	
		}
	};

	proto.onclose = function(event) {
		console.error("WebSocketLogger: websocket close");
		open = false;
	};

	proto.onerror = function(event) {
		console.error("WebSocketLogger: websocket error");
		open = false;
	};

	proto.send = function(message) {
		if (open) {
			ws.send(message);
		} else {
			queue.push(message);
		}
	};

	return WebSocketLogger;

}());

