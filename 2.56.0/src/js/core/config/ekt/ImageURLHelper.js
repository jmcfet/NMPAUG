var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

$U.core.util.ImageURLHelper = ( function() {

	var superClass = $U.core.util.BaseImageURLHelper;

	//URL of Cover images for VOD	
	var VOD_IMAGE_PREFIX = "http://abraeuskaltel-covers.abertistelecom.com/images/";

	// Appended to the VOD cover filename
	var COVER_IMAGE_SUFFIX = "";

	var instance = null;

	function ImageURLHelper() {
		superClass.call(this, VOD_IMAGE_PREFIX, COVER_IMAGE_SUFFIX);
	}

	$N.apps.util.Util.extend(ImageURLHelper, superClass);

	ImageURLHelper.getInstance = function() {
		if (instance === null) {
			instance = new ImageURLHelper();
		}
		return instance;
	};

	return ImageURLHelper;

}());
