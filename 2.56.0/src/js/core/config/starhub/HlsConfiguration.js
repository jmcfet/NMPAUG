var $U = $U || {};
$U.core = $U.core || {};

/*
 * This configuration can be used to define the segment / chuck duration & playlist delay for specific devices using the OTV 5 STB GW HLS Server
 * @param {Array} deviceConfiguration
 * @param {String} model The model name of the device
 * @param {String} type The type or model number of the device
 * @param {String} systemVersion The systemVersion of the device eg. '4.2.2' or '7.0.1'
 * @param {Number} chunkduration The duration of the segement or chunk in 'seconds'
 * @param {Number} playlistdelay The delay of the playlist after number of chunks ready 'numberofchunks'
 */

/*
 * Add more devices to this list in the following format
 * {
 model : 'samsung',
 type : 'GT-P5113',
 systemVersion : '4.2.2',
 chunkduration : 2,
 playlistdelay : 4
 }
 *
 */
var deviceConfiguration = [{
	model : 'google',
	type : 'Nexus 4',
	systemVersion : '4.4.4',
	chunkduration : 2,
	playlistdelay : 2
}, {
	model : 'google',
	type : 'Nexus 4',
	systemVersion : '4.4.3',
	chunkduration : 2,
	playlistdelay : 2
}, {
	model : 'google',
	type : 'Nexus 7',
	systemVersion : '4.4.4',
	chunkduration : 2,
	playlistdelay : 2
}, {
	model : 'google',
	type : 'Nexus 7',
	systemVersion : '4.4.3',
	chunkduration : 2,
	playlistdelay : 2
}, {
	model : 'google',
	type : 'Nexus 5',
	systemVersion : '4.4.4',
	chunkduration : 2,
	playlistdelay : 2
}, {
	model : 'google',
	type : 'Nexus 5',
	systemVersion : '4.4.3',
	chunkduration : 2,
	playlistdelay : 2
}];

/*
 * Private function do not edit
 */
$U.core.HlsConfiguration = function(type, systemVersion, platform, contentType) {
	var chunkduration, playlistdelay, params = "";

	//Set up Platform defaults
	switch (platform) {
	case 'Android' :
		chunkduration = 2;
		playlistdelay = 0;
		break;
	case 'iOS' :
		chunkduration = 2;
		playlistdelay = null;
		break;
	default :
		chunkduration = null;
		playlistdelay = null;
		break;
	}
	// Get device specific values from the below list
	deviceConfiguration.forEach(function(element, index) {
		if (element.type === type && element.systemVersion === systemVersion) {
			chunkduration = element.chunkduration;
			playlistdelay = element.playlistdelay;
		}
	});

	if (chunkduration && chunkduration > 0) {
		params = '&chunkduration=' + chunkduration;
	}

	if (contentType === "VOD"){
		//SHB22-1366 - for VOD playlistdelay should always be 1
		params += '&playlistdelay=1';
	} else if (playlistdelay && playlistdelay > -1) {
		params += '&playlistdelay=' + playlistdelay;
	}

	return params;
};

