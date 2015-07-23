/**
 * A specialisation of MediaItem that represents a BTV channel
 *
 * @class $U.core.mediaitem.BTVChannelItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new BTVChannelItem
 * @param {Object} dataObject the underlying channel object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.BTVChannelItem = ( function() {

	var superClass = $U.core.mediaitem.MediaItem;

	function BTVChannelItem(dataObject) {
		superClass.call(this, dataObject);
	}


	$N.apps.util.Util.extend(BTVChannelItem, superClass);

	var proto = BTVChannelItem.prototype;

	Object.defineProperties(proto, {

		/**
		 * @property {Object} channelData this is used to populate a BTVEvent on clicking on an assetTile
		 * @readonly
		 */
		"channelData" : {
			get : function() {
				return this._data;
			}
		},

		/**
		 * @property {Object} deliveryMethod this BTVEventItem's channel's deliveryMethod
		 * @readonly
		 */
		"deliveryMethod" : {
			get : function() {
				if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject) {
					return this._data.secondaryObject.deliveryMethod;
				}
				return this._data.deliveryMethod;
			}
		},
		
		/**
		 * @property {Number} logicalChannelNumber The logical channel number for the channel
		 * @readonly
		 */
		"logicalChannelNumber" : {
			get : function() {
				return this._getLogicalChannelNumber();
			}
		},

		/**
		 * @property {String} serviceId The serviceId for the channel
		 * @readonly
		 */
		"serviceId" : {
			get : function() {
				return this._getId();
			}
		},

		/**
		 * @property {boolean} subscribed
		 * @readonly
		 */
		"subscribed" : {
			get : function() {
				return this._isSubscribed();
			}
		},
		
		/**
		 * @property {String} throwId the id used when throwing to the Gateway
		 */
		"throwId" : {
			get : function() {
				if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject) {
					return this._data.secondaryObject.serviceId;
				}
				return this._getId();
			}
		},
		"catchUpUri" : {
			get : function() {
				var cUri;
				if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject && this._data.secondaryObject.defaultPlaybackInfo) {
					cUri = this._data.secondaryObject.defaultPlaybackInfo.catchUpUri;
				}
				return cUri;
			}
		},
		"isStartOver" : {
			get : function() {
				var startOver;
				if (this._data.secondaryObject && this._data.secondaryObject.defaultPlaybackInfo) {
					startOver = this._data.secondaryObject.defaultPlaybackInfo.startOverFlag;
				}
				return startOver;
			}
		},
		"dvbTriplet" : {
			get : function() {
				var triplet;
				if (this._data.secondaryObject) {
					triplet = this._data.secondaryObject.dvbTriplet;
				}
				return triplet;
			}
		}
	});

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.BTVCHANNEL;
	};

	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL;
	};

	proto._getLogicalChannelNumber = function() {
		if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject){
			if(this._data.secondaryObject.hdChannel){
				return this._data.secondaryObject.hdChannel.logicalChannelNum;
			}			
			return this._data.secondaryObject.logicalChannelNum;
		}
		return this._data.logicalChannelNum;
	};

	proto._getId = function() {
		return this._data.serviceId;
	};

	proto._getTitle = function() {
		if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject){
			return this._data.secondaryObject.serviceName;
		}
		return this._data.serviceName;
	};

	proto._getDescription = function() {
		return null;
	};

	proto._getSynopsis = function() {
		return null;
	};

	proto._getDurationInSeconds = function() {
		return null;
	};

	proto._hasPromoImageURL = function() {
		return Boolean(this._data.logo);
	};

	proto._getPromoImageURL = function() {
		return $U.core.util.ImageURLHelper.getInstance().btvChannelLogoURL(this);
	};

	proto._hasCoverImageURL = function() {
		return false;
	};

	proto._coverImageURL = function() {
		return null;
	};

	proto._getRating = function() {
		return this._data.parentalRating;
	};

	proto._getContentToPlay = function() {
		if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject){
			return this._data.secondaryObject;
		}
		return this._data;
	};

	proto._isSubscribed = function() {
		if ($U.core.Gateway.isGatewayAvailable() && this._data.secondaryObject || this._data.deliveryMethod === $N.data.EPGService.DELIVERY_TYPE.GATEWAY) {
			return true;
		}
		return this._data.isSubscribed;
	};

	proto._hasSearchMatch = function () {
		return true;
	};

	return BTVChannelItem;
}());
