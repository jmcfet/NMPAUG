/**
 * Contains logic for mapping a Gateway object to a playable object for playout manager
  *
 * @class $U.core.StarHubGWContentMapper
 * @constructor
 *
 * @author Scott Dermott
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.StarHubGWContentMapper = function() {

	var contentObj,
		contentType;

	var proto = $U.core.StarHubGWContentMapper.prototype;

	/**
	 * Returns true if the given content can be played using this content mapper
	 * @method isPlayableType
	 * @param {Object} content
	 * @return {Boolean}
	 */
	proto.isPlayableType = function (content) {
		if (content._data && content._data.defaultPlaybackInfo) {
			contentObj = content;
			if(content.taskId || content.serviceId){
				contentType = content.taskId ? "RECORDING" : "BTV";	
			} else if(content._data.defaultPlaybackInfo.type === 'vod'){
				contentType = 'VOD';
			}
			return true;
		}
		return false;
	};

	/**
	 * Fires a callback with true if the content can be played otherwise an error code is returned
	 * @method prePlaybackCheck
	 * @async
	 * @param {Function} callback
	 * @param {Boolean} sessionsEnabled - States if session functionality is to be used
	 */
	// proto.prePlaybackCheck = function (callback, sessionsEnabled) {
		// var httpRequest = new $N.apps.core.AjaxHandler(),
			// handle = {};
		// httpRequest.responseCallback = function (xmlhttp) {
			// if (xmlhttp) {
				// switch (xmlhttp.status) {
				// case 200 :
					// callback(true);
					// break;
				// case 503 :
					// callback(1001);
					// break;
				// default :
					// callback(1000);
				// }
			// } else {
				// callback(1000);
			// }
		// };
		// httpRequest.requestData(this.getUri(), 8000, false);
	// };

	/**
	 * Returns true if the content supports ad insertions
	 * @method doesSupportAds
	 * @param {Object} content
	 * @return {Boolean}
	 */
	proto.doesSupportAds = function (content) {
		return false;
	};

	/**
	 * Returns the drm id for the content set with isPlayableType for encrypted playback
	 * @method getDRMId
	 * @return {String} the drm id
	 */
	proto.getDRMId = function () {
		return $N.services.gateway.dlna.MediaDevice.getLCM();
	};

	/**
	 * Returns the uri for playback
	 * @method getUri
	 * @return {String} the uri
	 */
	proto.getUri = function () {
		var urlHLSParams = '',
			uri = contentObj._data.defaultPlaybackInfo.url ? contentObj._data.defaultPlaybackInfo.url : $U.core.Gateway.createContentURI(contentObj);

		if ($U.core.HlsConfiguration && $N.env.deviceInfo) {
			urlHLSParams = $U.core.HlsConfiguration($N.env.deviceInfo.type, $N.env.deviceInfo.systemVersion, $N.env.playerType);
		} else if(contentType === 'VOD') {
			//this is a desktop/MAC, still need the '&playlistdelay=1' parameter
			urlHLSParams = '&playlistdelay=1';
		}
		return uri + urlHLSParams;
	};

	/**
	 * Returns the unique identify for the content
	 * @method getContentId
	 * @return {String} unique identifier for content
	 */
	proto.getContentId = function () {
		if(contentType === 'VOD') {
			return contentObj.id;
		} else {
			return contentObj.taskId || contentObj.serviceId;
		}
	};

	/**
	 * Returns the content object that was passed into the isPlayableType method
	 * @method getContent
	 * @return {Object} the content object
	 */
	proto.getContent = function () {
		return contentObj;
	};

	/**
	 * Returns the type of license retrieval method
	 * @method getLicenseMethod
	 * @return {String} the license retrieval method type
	 */
	proto.getLicenseMethod = function () {
		return "TRANSFORM";
	};

	/**
	 * Returns the type of content either "BTV" or "RECORDING"
	 * @method getContentType
	 * @return {String}
	 */
	proto.getContentType = function () {
		return contentType;
	};

};
