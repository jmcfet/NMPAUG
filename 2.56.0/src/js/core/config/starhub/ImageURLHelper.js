var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

/**
 * Manages URLS for the asset images
 * @class $U.core.util.ImageURLHelper
 */
$U.core.util.ImageURLHelper = ( function() {

	var superClass = $U.core.util.BaseImageURLHelper;

		//URL of Cover images for VOD
	var VOD_IMAGE_PREFIX = "http://172.28.136.13/data/posters/";
	

	//URL of channel logos

	var BTV_IMAGE_PREFIX = "http://172.28.136.13/data/logos/";
	//var BTV_IMAGE_PREFIX = "http://172.28.136.13/data/logos/";
	// there isn't a redirect for the channel logo images on this lab
	//var BTV_IMAGE_PREFIX = "http://srmadridlab.nagra.com/shmadmdg/data/logos/";

	// Appended to the VOD cover filename
	var COVER_IMAGE_SUFFIX = "";

	var instance = null;

	/**
	 * Constructor, this SHOULDN'T be used, use the getInstance() function
	 */
	function ImageURLHelper() {
		superClass.call(this, VOD_IMAGE_PREFIX, COVER_IMAGE_SUFFIX);
	}


	$N.apps.util.Util.extend(ImageURLHelper, superClass);

	/**
	 * This is used to create the instance of the helper
	 */
	ImageURLHelper.getInstance = function() {
		if (instance === null) {
			instance = new ImageURLHelper();
		}
		return instance;
	};

	/**
	 * Gets the URL for the channel logo for a BTVChannelItem
	 * @param {$U.core.mediaitem.BTVChannelItem} channelItem which needs the url for the logo
	 */
	ImageURLHelper.prototype.btvChannelLogoURL = function(channelItem) {
		return BTV_IMAGE_PREFIX + "" + channelItem.logicalChannelNumber + ".png";
	};

	/**
	 * Gets the URL for the channel logo for a BTVChannelItem
	 * @param {$U.core.mediaitem.PVRRecordedItem} recordingItem which needs the url for the logo
	 */
	ImageURLHelper.prototype.pvrChannelLogoURL = function(recordedItem) {
		var url = null;
		if (recordedItem.channel) {
			url = this.btvChannelLogoURL(recordedItem.channel);
		}
		return url;
	};

	return ImageURLHelper;

}());
