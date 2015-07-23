/**
 * A specialisation of VODItem that represents an MDS VOD asset
 *
 * @class $U.core.mediaitem.MDSVODItem
 * @extends $U.core.mediaitem.VODItem
 *
 * @constructor
 * Create a new MDSVODItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.MDSVODItem = ( function() {

	var logger = $U.core.Logger.getLogger("MDSVODItem");

	// RegExp to match a valid image URL
	// Pretty basic, just to work around problem where some VOD items have invalid but non-empty promo image urls
	var VALID_IMAGE_RE = /\.jpg$|\.jpeg$|\.png$/i;

	var superClass = $U.core.mediaitem.VODItem;

	function MDSVODItem(dataObject) {
		superClass.call(this, dataObject);
	}


	$N.apps.util.Util.extend(MDSVODItem, superClass);
	var proto = MDSVODItem.prototype;

	proto._getId = function() {
		return this._data.id;
	};

	proto._getTitle = function() {
		return this._data.Title;
	};

	proto._getDescription = function() {
		return this._data.Description;
	};

	proto._getSynopsis = function() {
		return this._data.Synopsis;
	};

	proto._getDuration = function() {
		return this.mds ? this._data.duration : null;
	};

	proto._getDurationInSeconds = function() {
		return this._data.duration;
	};

	proto._getActors = function() {
		return this._data.Actors;
	};

	proto._getDirectors = function() {
		return this._data.Directors;
	};

	proto._getEpisodeNumber = function() {
		return this._data.episodeNumber;
	};

	proto._getYear = function() {
		return this._data.Year;
	};

	proto._getLowestPricedObject = function() {
		var augmentedAsset,
			assetArray = $N.services.sdp.VOD.augmentAssetsWithPricing ? $N.services.sdp.VOD.augmentAssetsWithPricing([this._data]) : [];
		if (assetArray.length > 0) {
			augmentedAsset = assetArray[0];
			this._data = augmentedAsset;
		}
		return augmentedAsset ? augmentedAsset.lowestPrice : null;
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

	proto._hasCoverImageURL = function() {
		return this._hasPromoImageURL();
	};

	proto._getCoverImageURL = function() {
		var result;
		if (this._hasCoverImageURL()) {
			result = $U.core.util.ImageURLHelper.getInstance().vodCoverImageURL(this);
			if (!result.match(VALID_IMAGE_RE)) {
				result = $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
			}
		} else {
			result = $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
		}
		return result;
	};

	proto._isAssetPurchased = function() {
		return $N.services.sdp.AcquiredContent.doesContainPurchasedAsset(this.id);
	};

	proto._isAssetSubscribed = function() {
		return $N.services.sdp.AcquiredContent.doesContainSubscribedAsset(this.id);
	};

	proto._isAssetPlayable = function() {
		return (this.isAssetPurchased || this.isAssetSubscribed || this.isAnyProductFree || this.fetchedInfo);
	};

	proto._getContentToPlay = function() {
		var r;

		if (this.isAssetPurchased || this._isAssetSubscribed) {
			r = this._buildPlayableOptions(this._data.technicals);
		}
		return r;
	};

	proto._buildPlayableOptions = function(technicalAssets) {
		var i;
		var l = technicalAssets.length;
		var r = [];

		for ( i = 0; i < l; i++) {
			if (logger) {
				logger.log("_buildPlayableOptions", i, technicalAssets[i].id, "purchased:", $N.services.sdp.AcquiredContent.isAssetPurchased(technicalAssets[i].id), "subscribed:", $N.services.sdp.AcquiredContent.isAssetSubscribed(technicalAssets[i].id));
			}
			if ($N.services.sdp.AcquiredContent.isAssetPurchased(technicalAssets[i].id) || $N.services.sdp.AcquiredContent.isAssetSubscribed(technicalAssets[i].id)) {
				r.push(technicalAssets[i]);
			}
		}
		return r;
	};

	proto._getRating = function() {
		return typeof this._data.Rating === "object" ? this._data.Rating.precedence : this._data.Rating;
	};

	proto._getRatingObject = function() {
		return typeof this._data.Rating === "object" ? this._data.Rating : null;
	};

	proto._getExpiryDate = function() {
		var biggestExpDate = null;
		var contentToPlay = this.contentToPlay;
		var i;
		var len = contentToPlay.length;
		var expDate;
		for ( i = 0; i < len; i++) {
			expDate = $N.services.sdp.AcquiredContent.getAssetExpiryDate(contentToPlay[i].id);

			if (!biggestExpDate || biggestExpDate < expDate) {
				biggestExpDate = expDate;
			}
		}

		return biggestExpDate;
	};

	proto._buildPurchaseOptions = function() {

		var technicals = this._data.technicals;
		var l = technicals.length;
		var products;
		var i, j, m;
		var purchaseOption;
		var subscriptionOption;

		this._purchaseOptions = [];
		this._subscriptionOptions = [];

		for ( i = 0; i < l; i++) {
			products = technicals[i].products;
			m = products.length;
			for ( j = 0; j < m; j++) {
				if (products[j].type === "subscription") {
					subscriptionOption = new $U.core.mediaitem.MDSSubscriptionOption(products[j], technicals[i]);
					this._subscriptionOptions.push(subscriptionOption);
				} else {
					purchaseOption = new $U.core.mediaitem.MDSPurchaseOption(products[j], technicals[i]);
					this._purchaseOptions.push(purchaseOption);
				}
			}
		}
	};

	proto._getSeriesRef = function() {
		return this._data.seriesRef;
	};

	proto._getEpisodeNumber = function() {
		return this._data.episodeNumber;
	};

	proto._getThrowId = function() {
		var technicals = this._getContentToPlay();
		if(technicals && technicals.length){
			return technicals[0].id;	
		}
		return this._data.id.replace("MAIN_","");
	};

	return MDSVODItem;
}());
