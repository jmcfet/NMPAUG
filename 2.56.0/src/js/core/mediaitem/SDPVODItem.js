/**
 * A specialisation of VODItem that represents an SDP VOD asset
 *
 * @class $U.core.mediaitem.SDPVODItem
 * @extends $U.core.mediaitem.VODItem
 *
 * @constructor
 * Create a new SDPVODItem
 * @param {Object} dataObject the underlying data object from SDP
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.SDPVODItem = ( function() {

	var logger = $U.core.Logger.getLogger("SDPVODItem");

	var SECONDS_PER_MINUTE = 60;

	var superClass = $U.core.mediaitem.VODItem;

	function SDPVODItem(dataObject) {
		superClass.call(this, dataObject);
		this._editorialAsset = dataObject.editorialAsset;
	}


	$N.apps.util.Util.extend(SDPVODItem, superClass);
	var proto = SDPVODItem.prototype;

	proto._getId = function() {
		return this._editorialAsset.uid;
	};

	proto._getTitle = function() {
		return this._editorialAsset.name;
	};

	proto._getDescription = function() {
		return this._editorialAsset.description;
	};

	proto._getSynopsis = function() {
		return this._editorialAsset.longDescription;
	};

	proto._getDurationInSeconds = function() {
		return this._editorialAsset.duration * SECONDS_PER_MINUTE;
	};

	proto._hasPromoImageURL = function() {
		return Boolean(this._editorialAsset.promoUrl);
	};

	proto._getPromoImageURL = function() {
		return this._hasPromoImageURL() ? $U.core.util.ImageURLHelper.getInstance().vodPromoImageURL(this) : $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
	};

	proto._hasCoverImageURL = function() {
		return this._hasPromoImageURL();
	};

	proto._getCoverImageURL = function() {
		return this._hasCoverImageURL() ? $U.core.util.ImageURLHelper.getInstance().vodCoverImageURL(this) : $U.core.mediaitem.VODItem.FALLBACK_IMAGE_SRC;
	};

	proto._getPolicyGroupId = function() {
		return this._data.scheduledTechnicalItems[0].offers[0].policyGroupUid;
	};

	proto._getContentToPlay = function() {
		var r;

		if (this.isAssetPurchased || this._isAssetSubscribed) {
			r = this._buildPlayableOptions(this._data.scheduledTechnicalItems);
		}
		return r;
	};

	proto._buildPlayableOptions = function(scheduledTechnicalItems) {
		var i;
		var l = scheduledTechnicalItems.length;
		var r = [];

		for ( i = 0; i < l; i++) {
			if (logger) {
				logger.log("_buildPlayableOptions", i, scheduledTechnicalItems[i].technicalAsset.uid, "purchased:", $N.services.sdp.AcquiredContent.isAssetPurchased(scheduledTechnicalItems[i].technicalAsset.uid), "subscribed:", $N.services.sdp.AcquiredContent.isAssetSubscribed(scheduledTechnicalItems[i].technicalAsset.uid));
			}
			if ($N.services.sdp.AcquiredContent.isAssetPurchased(scheduledTechnicalItems[i].technicalAsset.uid) || $N.services.sdp.AcquiredContent.isAssetSubscribed(scheduledTechnicalItems[i].technicalAsset.uid)) {
				r.push(scheduledTechnicalItems[i].technicalAsset);
			}
		}
		return r;
	};

	proto._getRating = function() {
		return this._editorialAsset.parentalRating;
	};

	proto._getRatingObject = function() {
		return null;
	};

	proto._isAssetPurchased = function() {
		return $N.services.sdp.AcquiredContent.doesContainPurchasedAsset(this.id);
	};

	proto._isAssetSubscribed = function() {
		return $N.services.sdp.AcquiredContent.doesContainSubscribedAsset(this.id);
	};

	proto._isAssetPlayable = function() {
		return (this.isAssetPurchased || this.isAssetSubscribed || this.isAnyProductFree);
	};

	proto._getExpiryDate = function() {
		var biggestExpDate = null;
		var contentToPlay = this.contentToPlay;
		var i;
		var len = contentToPlay.length;
		var expDate;
		for ( i = 0; i < len; i++) {
			expDate = $N.services.sdp.AcquiredContent.getAssetExpiryDate(contentToPlay[i].uid);

			if (!biggestExpDate || biggestExpDate < expDate) {
				biggestExpDate = expDate;
			}
		}

		return biggestExpDate;
	};

	proto._buildPurchaseOptions = function() {
		var technicalItems = this._data.scheduledTechnicalItems;
		var l = technicalItems.length;
		var offers, offer;
		var i, j, m;
		var purchaseOption;

		this._purchaseOptions = [];

		for ( i = 0; i < l; i++) {
			offers = technicalItems[i].offers;
			m = offers.length;
			for ( j = 0; j < m; j++) {
				purchaseOption = new $U.core.mediaitem.SDPPurchaseOption(offers[j], technicalItems[i].technicalAsset);
				this._purchaseOptions.push(purchaseOption);
			}
		}
	};
	
	proto._getSeriesRef = function() {
		return null;
	};
	
	proto._getEpisodeNumber = function() {
		return null;
	};


	return SDPVODItem;
}());
