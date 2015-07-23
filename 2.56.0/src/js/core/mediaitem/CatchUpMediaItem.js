var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.CatchUpMediaItem = ( function() {

	var logger = $U.core.Logger.getLogger("CatchUpMediaItem");

	var superClass = $U.core.mediaitem.MDSVODItem;

	var proto;

	function CatchUpMediaItem(dataObject, channel, btvEvent) {
		superClass.call(this, dataObject);
		this._channel = channel;
		this._btvEvent = btvEvent;
	}


	CatchUpMediaItem.create = function(dataObject, channel, btvEvent) {
		return new CatchUpMediaItem(dataObject, channel, btvEvent);
	};

	$N.apps.util.Util.extend(CatchUpMediaItem, superClass);

	proto = CatchUpMediaItem.prototype;

	proto.isTileLarge = function() {
		return true;
	};

	proto._getProgramId = function() {
		return this._data.ProgramId;
	};

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.CATCHUP;
	};

	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.EVENT;
	};
	/**
	 * Overrides MDSVodItem._isAssetPlayable because catch up items should not discover if they are free
	 */
	proto._isAssetPlayable = function() {
		return (this.isAssetPurchased || this.isAssetSubscribed || this.subscribed);
	};

	proto._hasSearchMatch = function () {
		return true;
	};

	/**
	 * Enrich this CatchupMediaItem with data from the corresponding programme
	 * Prior to enrichment certain properties will be undefined.
	 * @param {Function} callback the function to call when enrichment is complete
	 */
	proto.enrich = function(callback) {
		var that;
		var successCallback;
		var p = this._data.promoImage;

		if ( typeof p !== "function") {
			this._enriched = true;
			if (logger) {
				logger.log("enrich", "promoImage already present:", this.promoImageURL);
			}
			callback();
		} else {
			that = this;
			p(function(result) {
				that._data.promoImage = result;
				that._enriched = true;
				if (logger) {
					logger.log("enrich", "promoImage fetched:", that.promoImageURL);
				}
				callback();
			});
		}
	};

	Object.defineProperties(proto, {

		/**
		 * @property {number} startTime this BTVEventItem's start time
		 * @readonly
		 */
		"startTime" : {
			get : function() {
				return this._data.ProgrammeStartDate;
			}
		},

		/**
		 * @property {number} endTime this BTVEventItem's end time
		 * @readonly
		 */
		"endTime" : {
			get : function() {
				return this._data.ProgrammeEndDate;
			}
		},

		"serviceLongName" : {
			get : function() {
				return this._data.ServiceLongName;
			}
		},

		"channelLogo" : {
			get : function(callback) {
				return this._channel && this._channel.promoImageURL;
			}
		},

		/**
		 * @property {boolean} subscribed
		 * @readonly
		 */
		"subscribed" : {
			get : function() {
				return this._channel.subscribed;
			}
		},

		"serviceId" : {
			get : function() {
				return this._channel.serviceId;
			}
		}
	});

	return CatchUpMediaItem;

}());

