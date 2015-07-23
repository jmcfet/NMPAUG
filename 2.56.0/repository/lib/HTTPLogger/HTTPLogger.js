var port = 7878;

var server = require('http').createServer(function(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/plain',
		"Access-Control-Allow-Origin" : "*"
	});
	if (req.method == 'POST') {
		var body = '';
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			console.log(body);
		});
	}
	res.end('Received');
}).listen(port);

console.log(getTimestamp() + " HTTP logger listening on port " + port);

function getTimestamp() {
	var d = new Date();
	var h = d.getHours();
	var m = String(d.getMinutes());
	var s = String(d.getSeconds());
	var ms = String(d.getMilliseconds());
	return [h < 10 ? "0" + h : h, ":", m < 10 ? "0" + m : m, ":", s < 10 ? "0" + s : s, ".", ms < 100 ? "0" : "", ms < 10 ? "0" + ms : ms].join("");
}

