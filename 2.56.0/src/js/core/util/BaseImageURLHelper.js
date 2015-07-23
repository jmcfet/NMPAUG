var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

/**
 * Manages URLS for the asset images
 * @class $U.core.util.BaseImageURLHelper
 *
 * @constructor
 * Create a new BaseImageURLHelper
 * @param {String} vodURL the prefix used if the head-end doesn't supply the full url
 * @param {String} coverSuffix the suffix used to change a VOD promoImage into a coverImage
 */
$U.core.util.BaseImageURLHelper = ( function() {

	var IMAGE_PREFIX = null;
	var COVER_IMAGE_SUFFIX = null;

	function BaseImageURLHelper(vodURL, coverSuffix) {
		IMAGE_PREFIX = vodURL;
		COVER_IMAGE_SUFFIX = coverSuffix;
	}

	var proto = BaseImageURLHelper.prototype;

	/**
	 * Checks to see if the url is absolute, if not then it adds the correct prefix
	 * @param {String} url
	 */
	function _makeFullURL(url) {
		if (url && url.indexOf("http") < 0) {
			url = IMAGE_PREFIX + url;
		}
		return url;
	}

	/**
	 * Gets the URL for the promoImage for a BTVEventItem
	 * @param {$U.core.mediaitem.BTVEventItem} eventItem which needs the url for the promoImage
	 */
	proto.btvEventPromoImageURL = function(eventItem) {
		return _makeFullURL(eventItem._data.promoImage);
	};

	/**
	 * Gets the URL for the channel logo for a BTVChannelItem
	 * @param {$U.core.mediaitem.BTVChannelItem} channelItem which needs the url for the logo
	 */
	proto.btvChannelLogoURL = function(channelItem) {
		return _makeFullURL(channelItem._data.logo);
	};

	/**
	 * Gets the URL for the promoImage for a VODItem
	 * @param {$U.core.mediaitem.VODItem} vodItem which needs the url for the promoImage
	 */
	proto.vodPromoImageURL = function(vodItem) {
		return _makeFullURL(vodItem._data.PromoImages[0]);
	};

	/**
	 * Gets the URL for the coverImage for a VODItem
	 * @param {$U.core.mediaitem.VODItem} vodItem which needs the url for the coverImage
	 */
	proto.vodCoverImageURL = function(vodItem) {
		var imageURL = _makeFullURL(vodItem._data.PromoImages[0]);
		return imageURL.replace(".jpg", COVER_IMAGE_SUFFIX + ".jpg");
	};

	proto.npvrPromoImageURL = function(npvrItem) {
		return _makeFullURL(npvrItem._data.image);
	};

	return BaseImageURLHelper;

}());
