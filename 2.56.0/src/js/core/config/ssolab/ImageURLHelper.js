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
	// var VOD_IMAGE_PREFIX = "http://10.11.66.99/CDN/SR1/images/";
	var VOD_IMAGE_PREFIX = "http://abra3anatel.abertistelecom.com/NAGRATEST/SR1/images/";

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

	return ImageURLHelper;

}());
