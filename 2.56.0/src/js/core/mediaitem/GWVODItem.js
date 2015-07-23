/**
 * A specialisation of VODItem that represents aa Gateway VOD asset
 * This is used to show a dummy tile in NowPlaying when there is no matching item on the server
 *
 * @class $U.core.mediaitem.GWVODItem
 * @extends $U.core.mediaitem.VODItem
 *
 * @constructor
 * Create a new GWVODItem
 * @param {Object} dataObject the underlying data object from GW
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.GWVODItem = ( function() {

	var logger = $U.core.Logger.getLogger("GWVODItem");

	// RegExp to match a valid image URL
	// Pretty basic, just to work around problem where some VOD items have invalid but non-empty promo image urls
	var VALID_IMAGE_RE = /\.jpg$|\.jpeg$|\.png$/i;

	var superClass = $U.core.mediaitem.VODItem;

	function GWVODItem(dataObject) {
		superClass.call(this, dataObject);
		this.fetchedInfo = dataObject;
	}


	$N.apps.util.Util.extend(GWVODItem, superClass);
	var proto = GWVODItem.prototype;

	proto._getId = function() {
		return this.fetchedInfo.id;
	};

	proto._getTitle = function() {
		return this.fetchedInfo.title;
	};

	proto._getDescription = function() {
		return null;
	};

	proto._getSynopsis = function() {
		return null;
	};

	proto._getDuration = function() {
		return null;
	};

	proto._getDurationInSeconds = function() {
		return null;
	};

	proto._getActors = function() {
		return [];
	};

	proto._getDirectors = function() {
		return [];
	};

	proto._getEpisodeNumber = function() {
		return null;
	};

	proto._getYear = function() {
		return null;
	};

	proto._getLowestPricedObject = function() {
		return null;
	};

	proto._hasPromoImageURL = function() {
		return false;
	};

	proto._getPromoImageURL = function() {
		return $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
	};

	proto._hasCoverImageURL = function() {
		return false;
	};

	proto._getCoverImageURL = function() {
		return $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
	};

	proto._isAssetPurchased = function() {
		return true;
	};

	proto._isAssetSubscribed = function() {
		return true;
	};

	proto._isAssetPlayable = function() {
		return (this.isAssetPurchased || this.isAssetSubscribed || this.isAnyProductFree || this.fetchedInfo);
	};

	proto._getContentToPlay = function() {
		return [];
	};

	proto._getRating = function() {
		return 0;
	};

	proto._getRatingObject = function() {
		return null;
	};

	proto._getExpiryDate = function() {
		return null;
	};

	proto._buildPurchaseOptions = function() {
		this._purchaseOptions = [];
		this._subscriptionOptions = [];
	};

	proto._getSeriesRef = function() {
		return null;
	};

	proto._getEpisodeNumber = function() {
		return null;
	};

	proto._getThrowId = function() {
		return this._data.id.replace("MAIN_","");
	};

	return GWVODItem;
}());
