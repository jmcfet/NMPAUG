/**
 * A specialisation of MediaItem that represents a GW channel
 * Used specifically when cannot match the channel returned from a nowPlaying request to one of the mapped channels
 *
 * @class $U.core.mediaitem.GWChannelItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new GWChannelItem
 * @param {Object} dataObject the underlying channel object from the GW
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.GWChannelItem = ( function() {

	var superClass = $U.core.mediaitem.MediaItem;

	function GWChannelItem(dataObject) {
		superClass.call(this, dataObject);
	}


	$N.apps.util.Util.extend(GWChannelItem, superClass);

	var proto = GWChannelItem.prototype;

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
		 * @property {Object} deliveryMethod this channel's deliveryMethod
		 * @readonly
		 */
		"deliveryMethod" : {
			get : function() {
				return this._data.deliveryMethod;
			}
		},
		
		/**
		 * @property {Number} logicalChannelNumber The logical channel number for the channel
		 * @readonly
		 */
		"logicalChannelNumber" : {
			get : function() {
				if (this.hdChannel) {
					return this.hdChannel.logicalChannelNum;
				}
				return this._data.logicalChannelNum;
			}
		},

		/**
		 * @property {String} serviceId The serviceId for the channel
		 * @readonly
		 */
		"serviceId" : {
			get : function() {
				return this._data.serviceId;
			}
		},

		/**
		 * @property {boolean} subscribed
		 * @readonly
		 */
		"subscribed" : {
			get : function() {
				return true;
			}
		},
		
		/**
		 * @property {String} throwId the id used when throwing to the Gateway
		 */
		"throwId" : {
			get : function(){
				return this._data.serviceId;
			}
		},
		"catchUpUri" : {
			get : function() {
				var cUri;
				if (this._data.defaultPlaybackInfo) {
					cUri = this._data.defaultPlaybackInfo.catchUpUri;
				}
				return cUri;
			}
		},
		"isStartOver" : {
			get : function() {
				var startOver;
				if (this._data.defaultPlaybackInfo) {
					startOver = this._data.defaultPlaybackInfo.startOverFlag;
				}
				return startOver;
			}
		},
		"dvbTriplet" : {
			get : function() {
				return this._data.dvbTriplet;
			}
		},
		"simulcastId": {
			get: function() {
				return this._data.simulcastId;
			}
		},
		"hdChannel": {
			get: function() {
				return this._hdChannel;
			},
			set: function(hdCh) {
				this._hdChannel = hdCh;
			}
		}
	});

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.GWCHANNEL;
	};

	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL;
	};


	proto._getTitle = function() {
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
		return true;
		//return Boolean(this._data.logo);
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
		return this._data;
	};

	return GWChannelItem;
}());
