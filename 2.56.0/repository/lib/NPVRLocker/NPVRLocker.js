var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors());
//app.use(express.json());
app.use(require('body-parser').json());

var server = app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});

var serviceProvider = 'CMS4X'
var recordingRequestsUrl = '/api/recordingrequests/' + serviceProvider;
var quotaUsageRequestsUrl = '/api/quotaUsage/' + serviceProvider;
var recordingLookup = {};
var recordingRequestsArray = [
	{"id":"5319b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"SUI-OQFACB","eventId":"48455","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"NEW","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5119e9c7e4b0870bedc0d81f", "protected": false, "accountNumber":"SUI-F82TMY","eventId":"48457","created":1394207175571,"modified":1394207175571,"serviceProviderName":"KBRO","status":"DELETED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5219f510e4b0870bedc0d820", "protected": false, "accountNumber":"SUI-6ZAT8P","eventId":"48463","created":1394210064793,"modified":1394210064793,"serviceProviderName":"KBRO","status":"NEW","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5319f70fe4b0870bedc0d822", "protected": false, "accountNumber":"SUI-6Z2T8P","eventId":"48484","created":1394210575450,"modified":1394210575450,"serviceProviderName":"KBRO","status":"RECORDED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5419f737e4b0870bedc0d823", "protected": false, "accountNumber":"SUI-6ZAT1P","eventId":"48498","created":1394210615854,"modified":1394210615854,"serviceProviderName":"KBRO","status":"RECORDED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"553199e5de4b0870bed0d81c", "protected": false, "accountNumber":"S3I-OQFACB","eventId":"42658","created":1394187869951,"modified":1394187869951,"serviceProviderName":"KBRO","status":"NEW","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5619f59be4b0870bedc0d821", "protected": false, "accountNumber":"SUI-645T8P","eventId":"42687","created":1394210203290,"modified":1394210203290,"serviceProviderName":"KBRO","status":"NEW","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5719f7d3e4b0870bedc0d824", "protected": false, "accountNumber":"S2I-6ZA68P","eventId":"42703","created":1394210771699,"modified":1394210771699,"serviceProviderName":"KBRO","status":"NEW","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5819f7dae4b0870bedc0d825", "protected": false, "accountNumber":"SU1-6ZAT8P","eventId":"50735","created":1394210778143,"modified":1394210778143,"serviceProviderName":"KBRO","status":"NEW","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5919f8e0e4b0870bedc0d826", "protected": false, "accountNumber":"SUI-6ZAE8P","eventId":"50741","created":1394211040698,"modified":1394211040698,"serviceProviderName":"KBRO","status":"NEW","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319f8e0e4b0870bedc0d826"},
	{"id":"5019f8e9e4b0870bedc0d827", "protected": false, "accountNumber":"S2I-6ZA65P","eventId":"50752","created":1394211049088,"modified":1394211049088,"serviceProviderName":"KBRO","status":"DELETED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"5319fb2ce4b0afd17f7c1256", "protected": false, "accountNumber":"SU3-6ZAW8P","eventId":"50757","created":1394211628705,"modified":1394211628705,"serviceProviderName":"KBRO","status":"RECORDED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"611a044ae4b085870e6b6b26", "protected": false, "accountNumber":"S2I-FBGT07","eventId":"50770","created":1394213961890,"modified":1394213961890,"serviceProviderName":"KBRO","status":"RECORDED","uri":"/video/video23.mpg"},
	{"id":"6219b38ce4b0870bed20d81e", "protected": false, "accountNumber":"SUI-OQFACB","eventId":"50781","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"RECORDED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"6319b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"SUI-2QFRCB","eventId":"50789","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"RECORDED","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319b38ce4b0870bedc0d81e"},
	{"id":"6419b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"3UI-OQFACB","eventId":"57123","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"DELETED","uri":"http://ott.nagra.com/stable/videopath/big-buck-bunny-sample_B1_100ASSETS_CONT_3_20131024_144716/index.m3u8"},
	{"id":"6519b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"SU4-OQF3CB","eventId":"57136","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"RECORDING","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319b38ce4b0870bedc0d81e"},
	{"id":"6619b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"SUI-PQ6CBE","eventId":"57152","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"RECORDING","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319b38ce4b0870bedc0d81e"},
	{"id":"6719b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"S5I-EQFACB","eventId":"57159","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"RECORDING","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319b38ce4b0870bedc0d81e"},
	{"id":"6819b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"S5I-EQFACB","eventId":"57165","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"RECORDING","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319b38ce4b0870bedc0d81e"},
	{"id":"6919b38ce4b0870bedc0d81e", "protected": false, "accountNumber":"S6I-EQFATB","eventId":"57171","created":1394193292257,"modified":1394193292257,"serviceProviderName":"KBRO","status":"NEW","uri":"http://cwm-sdp-vdev23:5555/api/npvrlocker/v1/recordingrequests/KBRO/5319b38ce4b0870bedc0d81e"},
	{"id":"585366294abc", "protected": false, "accountNumber":"SUI-OQFACB", "eventId": "0001122", "created": "2014-04-24T08:22:53.024Z", "modified": "2014-04-24T08:22:53.024Z", "status":"RECORDED", "uri": "TEST URL", "description": "fake program description", "shortTitle": "fake program", "title": "Fake Program 0001122", "serviceRef": "FAKE_12_M", "provider": "B1", "synopsis": "fake program synopsis", "mdsEventId": "LYS000000001122"},
	{"id":"167188867abc", "protected": true, "accountNumber":"SUI-OQFACB", "eventId": "7264", "created": "2014-04-24T08:22:45.954Z", "modified": "2014-04-24T08:22:45.954Z", "status":"RECORDED", "uri": "TEST URL", "description": "Reportage", "shortTitle": "Apple Stories", "title": "Apple Stories", "serviceRef": "WEB_CH09M", "provider": "B1", "synopsis": "Apple Stories program synopsis", "mdsEventId": "LYS000175372"}
]

for (var i = 0; i < recordingRequestsArray.length; i ++) {
	recordingLookup[recordingRequestsArray[i].id] = recordingRequestsArray[i];
}

// ********* HELPER FUNCTIONS *********)
function createRecordingRequest(eventId, accountNumber, serviceProvider, status) {
	var randomId = Math.floor(100000000 + Math.random() * 900000000);
	return  {
		"id": randomId + "abc",
		"protected": false,
		"accountNumber": accountNumber,
		"eventId": eventId,
		"created": new Date(),
		"modified": new Date(),
		"serviceProviderName": serviceProvider,
		"status":status,
		"uri":"TEST URL"
	};
}

function convertToArray(object) {
	var returnArray = [];
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			returnArray.push(object[key]);
		}
	}
	return returnArray;
}

// ********* REQUESTS *********
// Get single
app.get(recordingRequestsUrl + "/:recordingId", function(req, res, next) {
	var recordingId = req.params.recordingId,
	recording = recordingLookup[recordingId];

	if (recording) {
		res.set({
			'Content-Type': 'application/json',
		});
		res.send(recording);
	}
});

// Get all
app.get(recordingRequestsUrl, function(req, res, next) {
	res.set({
		'Content-Type': 'application/json',
	});
	res.send({
		results: {
			recordingrequests: convertToArray(recordingLookup)
		}
	});
});

// Create single
app.post(recordingRequestsUrl, function(req, res, next) {
	var newRecording = createRecordingRequest(req.body.eventId, req.body.accountNumber, req.body.serviceProvider, req.body.status),
		code = 500;

	if (newRecording) {
		console.log("Creating new object");
		code = 204;
		recordingLookup[newRecording.id] = newRecording;
	}
	res.statusCode = code;
	res.send();
});

// Delete single
// app.delete(recordingRequestsUrl + "/:recordingId", function(req, res) {
	// var recordingId = req.params.recordingId,s
	// code = 500;
	// if (recordingLookup[recordingId]) {
		// console.log("Deleting object " + recordingId);
		// delete recordingLookup[recordingId];
		// code = 204;
	// }
	// res.statusCode = code;
	// res.send();
// });

// Update single
app.put(recordingRequestsUrl + "/:recordingId", function(req, res) {
	var recordingId = req.params.recordingId,
		code = 500;
	if (recordingLookup[recordingId]) {
		console.log("Updating object " + recordingId);
		recordingLookup[recordingId] = req.body;
		code = 204;
	}
	res.statusCode = code;
	res.send();
});

// ********* QUOTA USAGE - HARD CODED - TO SORT *********
app.get(quotaUsageRequestsUrl, function(req, res, next) {
	res.set({
		'Content-Type': 'application/json',
	});
	if (req.query.accountNumber === "1") {
		res.send({
			quotausage: {"accountNumber": "1","currentUsage": 2,"quotaTotal": 5,"currentUsageUnit": "HH","quotaTotalUnit": "HH"}
		});
	} else if (req.query.accountNumber === "2") {
		res.send({
			quotausage: {"accountNumber": "2","currentUsage": 4,"quotaTotal": 7,"currentUsageUnit": "HH","quotaTotalUnit": "HH"}
		});
	} else if (req.query.accountNumber === "171") {
		res.send({
			quotausage: {"accountNumber": "171","currentUsage": 2,"quotaTotal": 24,"currentUsageUnit": "HH","quotaTotalUnit": "HH"}
		});
	}
});