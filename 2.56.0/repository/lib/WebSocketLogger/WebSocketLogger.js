var port = 6767;
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: port});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
		console.log(message);
    });
});
console.log(getTimestamp() + " WebSocket logger listening on port " + port);

function getTimestamp() {
	var d = new Date();
	var h = d.getHours();
	var m = String(d.getMinutes());
	var s = String(d.getSeconds());
	var ms = String(d.getMilliseconds());
	return [h < 10 ? "0" + h : h, ":", m < 10 ? "0" + m : m, ":", s < 10 ? "0" + s : s, ".", ms < 100 ? "0" : "", ms < 10 ? "0" + ms : ms].join("");
}