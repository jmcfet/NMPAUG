/**
 * Contains logic for mapping a Gateway object to a playable object for playout manager
  *
 * @class $U.core.TrailerContentMapper
 * @constructor
 *
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.TrailerContentMapper = function() {

	var contentObj,
		contentType;

	var proto = $U.core.TrailerContentMapper.prototype;

    /**
     * Returns true if the given content can be played using this content mapper
     * @method isPlayableType
     * @param {Object} content
     * @return {Boolean}
     */
    proto.isPlayableType = function(content) {
        if (content.type && content.type === $U.core.mediaitem.MediaItemType.TRAILER) {
            contentObj = content;
            contentType =  "VOD";
            return true;
        }
        return false;
    };

    /**
     * Returns true if the content supports ad insertions
     * @method doesSupportAds
     * @param {Object} content
     * @return {Boolean}
     */
    proto.doesSupportAds = function(content) {
        return false;
    };
    /**
     * Returns the drm id for the content set with isPlayableType for encrypted playback
     * @method getDRMId
     * @return {String} the drm id
     */
    proto.getDRMId = function() {
        return null;
    };
    /**
     * Returns the uri for playback
     * @method getUri
     * @return {String} the uri
     */
    proto.getUri = function() {
        return $U.core.Configuration.TRAILER_VIDEO_PATH + contentObj._data.technicals[0].media.AV_ClearTS.fileName;
    };
    /**
     * Returns the unique identify for the content
     * @method getContentId
     * @return {String} unique identifier for content
     */
    proto.getContentId = function() {
        return contentObj.id;
    };
    /**
     * Returns the content object that was passed into the isPlayableType method
     * @method getContent
     * @return {Object} the content object
     */
    proto.getContent = function() {
        return contentObj;
    };
    /**
     * Returns the type of license retrieval method
     * @method getLicenseMethod
     * @return {String} the license retrieval method type
     */
    proto.getLicenseMethod = function() {
        return "NONE";
    };
    /**
     * Returns the type of content either "BTV" or "RECORDING"
     * @method getContentType
     * @return {String}
     */
    proto.getContentType = function() {
        return contentType;
    };

	proto.type = function() {
		return "TRAILER";
	};

};