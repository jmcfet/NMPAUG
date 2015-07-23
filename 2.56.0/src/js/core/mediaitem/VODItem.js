/**
 * A specialisation of MediaItem that represents a VOD asset
 *
 * @class $U.core.mediaitem.VODItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new VODItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.VODItem = ( function() {

	var superClass = $U.core.mediaitem.MediaItem;

	var defaultType;

	function VODItem(dataObject) {
		superClass.call(this, dataObject);
	}


	$N.apps.util.Util.extend(VODItem, superClass);

	// Fallback is an invalid image, so that it will fail when passed through the ImageLoader - which has the correct fallback functionality
	VODItem.FALLBACK_IMAGE_SRC = "";

	VODItem.TYPE = {
		MDS : {
			name : "MDS"
		},
		SDP : {
			name : "SDP"
		},
		GW : {
			name : "GW"
		}
	};

	VODItem.create = function(dataObject, type) {

		var result;

		if (!type) {
			type = defaultType;
			if (!type) {
				defaultType = $U.core.Configuration.MDS_CONFIG ? $U.core.mediaitem.VODItem.TYPE.MDS : $U.core.mediaitem.VODItem.TYPE.SDP;
				type = defaultType;
			}
		}

		switch (type) {
		case VODItem.TYPE.MDS:
			result = new $U.core.mediaitem.MDSVODItem(dataObject);
			break;
		case VODItem.TYPE.SDP:
			result = new $U.core.mediaitem.SDPVODItem(dataObject);
			break;
		case VODItem.TYPE.GW:
			result = new $U.core.mediaitem.GWVODItem(dataObject);
			break;
		}
		return result;
	};

	var proto = VODItem.prototype;

	proto._hasSearchMatch = function () {
		return true;
	};
	
	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.VOD;
	};

	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.VOD;
	};

	proto.getPurchaseOption = function(id) {
		var purchaseOptions = this.purchaseOptions;
		var l = purchaseOptions.length;
		var i;

		for ( i = 0; i < l; i++) {
			if (purchaseOptions[i].id.toString() === id) {
				return purchaseOptions[i];
			}
		}
	};
	
	proto.isTileLarge = function() {
		return (this.seriesItem || this.seriesRef);
	};

	Object.defineProperties(proto, {

		/**
		 * @property {string} policyGroupId this VODItem's policyGroupId
		 * @readonly
		 */
		"policyGroupId" : {
			get : function() {
				return this._getPolicyGroupId();
			}
		},

		/**
		 * @property {$U.core.mediaitem.PurchaseOption[]} purchaseOptions this VODItem's purchase options
		 * @readonly
		 */
		"purchaseOptions" : {
			get : function() {
				if (this._purchaseOptions === undefined) {
					this._buildPurchaseOptions();
				}
				return this._purchaseOptions;
			}
		},

		/**
		 * @property {$U.core.mediaitem.PurchaseOption[]} subscriptionOptions this VODItem's subscription options
		 * @readonly
		 */
		"subscriptionOptions" : {
			get : function() {
				if (this._subscriptionOptions === undefined) {
					this._buildPurchaseOptions();
				}
				return this._subscriptionOptions;
			}
		},

		/**
		 * @property {boolean} isAssetPurchased this VODItems purchase state
		 * @readonly
		 */
		"isAssetPurchased" : {
			get : function() {
				return this._isAssetPurchased();
			}
		},

		/**
		 * @property {boolean} isAssetSubscribed this VODItems layout state
		 * @readonly
		 */

		"isAssetSubscribed" : {
			get : function() {
				return this._isAssetSubscribed();
			}
		},

		/**
		 * @property {boolean} isAssetPlayable can this VODItem b
		 */
		"isAssetPlayable" : {
			get : function() {
				return this._isAssetPlayable();
			}
		},

		/**
		 * @property {Date} expiryDate this VODItems post purchase expires date in milliseconds
		 * @readonly
		 */
		"expiryDate" : {
			get : function() {
				return this._getExpiryDate();
			}
		},

		/**
		 *@property {Boolean} isAnyProductFree check if this VODItem has any product that is free
		 */
		"isAnyProductFree" : {
			get : function() {
				return this.freeProduct !== null;
			}
		},

		"freeProduct" : {
			get : function() {
				var i, len;
				if (this._freeProduct === undefined) {
					this._freeProduct = null;
					len = (this.purchaseOptions && this.purchaseOptions.length) ? this.purchaseOptions.length : 0;
					for (i = 0; i < len; i++) {
						if (this.purchaseOptions[i].isFree) {
							this._freeProduct = this.purchaseOptions[i];
							return this._freeProduct;
						}
					}
				}
				return this._freeProduct;
			}
		},
		
		/**
		 *@property {Object} fetchedInfo the data that has come from the gateway
		 */
		"fetchedInfo" : {
			get : function() {
				return this._fetchedInfo;
			},
			set : function(info) {
				this._fetchedInfo = info;
			}
		},

		/**
		 *@property {Object} playbackPosition the current position in the gateway info
		 */
		"playbackPosition" : {
			get : function() {
				return this._playbackPosition;
			},
			set : function(pos) {
				this._playbackPosition = pos;
			}
		},
		
		/**
		 * @property {string} seriesRef this VODItem's seriesRef
		 * @readonly
		 */
		"seriesRef" : {
			get : function() {
				return this._getSeriesRef();
			}
		},
		
		/**
		 * @property {Number} episodeNumber this VODItem's episodeNumber
		 * @readonly
		 */
		"episodeNumber" : {
			get : function() {
				return this._getEpisodeNumber();
			}
		},
		/**
		 * @property {Number} episodeNumber this VODItem's episodeNumber
		 * @readonly
		 */
		"throwId" : {
			get : function() {
				return this._getThrowId();
			}
		}
		
		
	});

	return VODItem;
}());
