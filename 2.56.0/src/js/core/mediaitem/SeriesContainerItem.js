/**
 * A specialisation of MediaItem that represents a Series Container
 *
 * @class $U.core.mediaitem.SeriesContainerItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new SeriesContainerItem
 * @param {Object} dataObject the underlying series data object from MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.SeriesContainerItem = ( function() {

	// RegExp to match a valid image URL
	// Pretty basic, just to work around problem where some VOD items have invalid but non-empty promo image urls
	var VALID_IMAGE_RE = /\.jpg$|\.jpeg$|\.png$/i;

	var superClass = $U.core.mediaitem.MediaItem;
	
	function SeriesContainerItem(dataObject) {
		superClass.call(this, dataObject);
	}

	$N.apps.util.Util.extend(SeriesContainerItem, superClass);

	// Fallback is an invalid image, so that it will fail when passed through the ImageLoader - which has the correct fallback functionality
	SeriesContainerItem.FALLBACK_IMAGE_SRC = "";

	SeriesContainerItem.create = function(dataObject) {
		return new SeriesContainerItem(dataObject); 
	};

	var proto = SeriesContainerItem.prototype;
	
	proto.isTileLarge = function() {
		return true;
	};

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.SERIES_CONTAINER;
	};

	proto._getId = function() {
		return this._data.id;
	};

	proto._getSeriesRef = function() {
		return this._data.id;
	};

	proto._getTitle = function() {
		return this._data.Title;
	};
	
	proto._getRating = function() {
		return typeof this._data.Rating === "object" ? this._data.Rating.precedence : this._data.Rating;
	};

	proto._getRatingObject = function() {
		return typeof this._data.Rating === "object" ? this._data.Rating : null;
	};
	
	proto._hasPromoImageURL = function() {
		return Boolean(this._data.PromoImages && this._data.PromoImages[0]);
	};

	proto._getPromoImageURL = function() {
		var result;
		if (this._hasPromoImageURL()) {
			result = $U.core.util.ImageURLHelper.getInstance().vodPromoImageURL(this);
			if (!result.match(VALID_IMAGE_RE)) {
				result = $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
			}
		} else {
			result = $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
		}
		return result;
	};
	
	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.VOD;
	};	
	
	Object.defineProperties(proto, {
		/**
		 * @property {string} seriesRef this SeriesContainer's seriesRef
		 * @readonly
		 */
		"seriesRef" : {
			get : function() {
				return this._getSeriesRef();
			}
		}
	});

	return SeriesContainerItem;
}());
