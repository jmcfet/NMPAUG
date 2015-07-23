/**
 * A specialisation of MediaItem that represents a BTV event
 * Use the constructor or one of the asynchronous create methods.
 *
 * @class $U.core.mediaitem.BTVEventItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new BTVEventItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @param {$U.core.mediaitem.BTVChannelItem} channel the event's channel
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.BTVEventItem = ( function() {

	var logger = $U.core.Logger.getLogger("BTVEventItem");

	var superClass = $U.core.mediaitem.MediaItem;

	var dataProvider = null;

	// Get the BTVDataProvider instance
	function getDataProvider() {
		if (dataProvider === null) {
			dataProvider = $U.epg.dataprovider.BTVDataProvider.getInstance();
		}
		return dataProvider;
	}

	function BTVEventItem(dataObject, channel) {
		superClass.call(this, dataObject);
		this._channel = channel;
	}

	// Extend MediaItem
	$N.apps.util.Util.extend(BTVEventItem, superClass);

	var proto = BTVEventItem.prototype;

	/**
	 * Create a new $U.core.mediaitem.BTVEventItem with the current event for a channel
	 * @param {$U.core.mediaitem.BTVChannelItem} channel the channel
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	BTVEventItem.createForChannel = function(channel, callback) {
		getDataProvider().fetchCurrentEventForChannel(channel, callback);
	};

	/**
	 * Create a new $U.core.mediaitem.BTVEventItem with the current event for a channel
	 * @param {String} serviceId the serviceId of the channel
	 * @param {Function} callback the callback function
	 * @param {$U.core.mediaitem.BTVEventItem} callback.event
	 */
	BTVEventItem.createForServiceId = function(serviceId, callback) {
		getDataProvider().fetchCurrentEventForServiceId(serviceId, callback);
	};

	/**
	 * Enrich this BTVEventItem with data from the corresponding programme
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

	proto.isTileLarge = function() {
		return true;
	};

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.BTVEVENT;
	};

	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.EVENT;
	};

	proto._getId = function() {
		return this._data.eventId;
	};

	proto._getTitle = function() {
		if ($U.core.Gateway.isGatewayAvailable() && !this._data.title) {
			return this._channel.serviceName;
		}
		return this._data.title;
	};

	proto._getDescription = function() {
		return this._data.shortDesc;
	};

	proto._getSynopsis = function() {
		return this._data.longDesc;
	};

	proto._getActors = function() {
		return this._data._data ? this._data._data.Actors : undefined;
	};

	proto._getDirectors = function() {
		return this._data._data ?  this._data._data.Directors : undefined;
	};

	proto._getEpisodeNumber = function() {
		var episodeNumber;

		if ($U.core.Gateway.isGatewayAvailable()) {
			if (this._data._data) {
				if (this._data._data.editorial && this._data._data.editorial.episodeNumber) {
					episodeNumber = "Ep " + this._data._data.editorial.episodeNumber;
				}
				if (this._data._data.Episode) {
					if (episodeNumber) {
						episodeNumber += " " + this._data._data.Episode;
					} else {
						episodeNumber = this._data._data.Episode;
					}
				}
			}
		} else {
			episodeNumber = this._data._data ? this._data._data.Episode : undefined;
		}

		return episodeNumber;
	};

	proto._getYear = function() {
		return this._data.year;
	};

	proto._getDurationInSeconds = function() {
		return Math.floor((this.endTime - this.startTime) / 1000);
	};

	// Note: will be undefined prior to enrichment
	proto._hasPromoImageURL = function() {
		return this._enriched ? Boolean(this._data.promoImage) : undefined;
	};

	// Note: will be undefined prior to enrichment
	proto._getPromoImageURL = function() {
		return this._enriched ? $U.core.util.ImageURLHelper.getInstance().btvEventPromoImageURL(this) : undefined;
	};

	proto._hasCoverImageURL = function() {
		return false;
	};

	proto._coverImageURL = function() {
		return null;
	};

	proto._getRating = function() {
		var chRate = 0;
		var evRate = this._data.parentalRating;
		if (this.channel) {
			chRate = this.channel.rating;
		}
		return Math.max(chRate, evRate);
	};

	proto._getContentToPlay = function() {
		if (!this.channel) {
			return null;
		}
		return this.channel.contentToPlay;
	};

	proto._getStartTime = function() {
		return this._data.startTime;
	};

	proto._getEndTime = function() {
		return this._data.endTime;
	};

	proto._getKeep = function() {
		var isProtected = false;
		if (this.npvrEnabled && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
			isProtected = $U.core.NPVRManager.getInstance().isEventProtected(this);
		}
		return isProtected;
	};

	proto._isCompleted = function() {
		var isCompleted = false;
		var status;
		if (this.npvrEnabled && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
			status = $U.core.NPVRManager.getInstance().getEventStatus(this);
			if (status === $U.core.NPVRManager.getInstance().completed()) {
				isCompleted = true;
			}
		}
		return isCompleted;
	};

	proto._getNPVRObject = function() {
		return $U.core.NPVRManager.getInstance().getRecordingByEvent(this);
	};

	proto._hasSearchMatch = function () {
		return true;
	};

	proto._getAspect = function () {
		return this._data._data ? this._data._data.Aspect : undefined;
	};

	proto._getDefinition = function () {
		return this._data.definition;
	};

	Object.defineProperties(proto, {

		/**
		 * @property {number} startTime this BTVEventItem's start time
		 * @readonly
		 */
		"startTime" : {
			get : function() {
				return this._getStartTime();
			}
		},
		"startTimeSec" : {
			get : function() {
				return this._data.startTime / 1000;
			}
		},
		/**
		 * @property {number} endTime this BTVEventItem's end time
		 * @readonly
		 */
		"endTime" : {
			get : function() {
				return this._getEndTime();
			}
		},
		"endTimeSec" : {
			get : function() {
				return this._data.endTime / 1000;
			}
		},
		/**
		 * @property {Object} channel this BTVEventItem's channel<br>
		 * @readonly
		 */
		"channel" : {
			get : function() {
				return this._channel;
			}
		},

		/**
		 * @property {String} channelLogo this BTVEventItem's channel logo<br>
		 * @readonly
		 */
		"channelLogo" : {
			get : function() {
				if (!this.channel) {
					return null;
				}
				return this._channel.promoImageURL;
			}
		},

		/**
		 * @property {number} seriesId
		 * @readonly
		 */
		"seriesId" : {
			get : function() {
				//for StarHub use the episode
				if ($U.core.Gateway.isGatewayAvailable() && this._getEpisodeNumber() && this._getEpisodeNumber() !== "") {
					return true;
				}
				return this._data.seriesRef;
			}
		},

		/**
		 * @property {number} contentRef
		 * @readonly
		 */
		"contentRef" : {
			get : function() {
				return this._data.contentRef;
			}
		},
		/**
		 * @property {Object} serviceId this BTVEventItem's channel's serviceId
		 * @readonly
		 */
		"serviceId" : {
			get : function() {
				return this._data.serviceId;
			}
		},
		"throwId" : {
			get : function() {
				if (!this.channel) {
					return null;
				}
				return this.channel.throwId;
			}
		},

		"fetchText" : {
			get : function() {
				return $U.core.util.StringHelper.getString("txtJoinLiveTV", {});
			}
		},

		/**
		 * @property {Object} deliveryMethod this BTVEventItem's channel's deliveryMethod
		 * @readonly
		 */
		"deliveryMethod" : {
			get : function() {
				if (!this.channel) {
					return 0;
				}
				return this.channel.deliveryMethod;
			}
		},

		/**
		 * @property {boolean} subscribed
		 * @readonly
		 */
		"subscribed" : {
			get : function() {
				if (!this.channel) {
					return false;
				}
				return this._channel.subscribed;
			}
		},

		"isOnNow" : {
			get : function() {
				var now = new Date().getTime();
				return this.endTime > now && this.startTime < now;
			}
		},

		"isPast" : {
			get : function() {
				var now = new Date().getTime();
				return this.endTime < now && this.startTime < now;
			}
		},

		"isFuture" : {
			get : function() {
				var now = new Date().getTime();
				return this.startTime > now;
			}
		},

		"isCatchUp" : {
			get : function() {
				return $U.core.Configuration.CATCHUP_ENABLED ? this._data.isCatchUp : false;
			}
		},

		"isStartOver" : {
			get : function() {
				return $U.core.Configuration.CATCHUP_ENABLED ? this._data.isStartOver : false;
			}
		},

		"isPlayable" : {
			get : function() {
				return (this.subscribed && this.isOnNow && (this.type !== $U.core.mediaitem.MediaItemType.NPVR)) || (this.subscribed && this.isCatchUp && this.isPast) || (this.inLocker && this.completed);
			}
		},

		/**
		 * @property {boolean} npvrEnabled
		 * @readonly
		 */
		"npvrEnabled" : {
			get : function() {
				return $U.core.Configuration.NPVR_ENABLED && (this._data.isnPvr || this._data.isNPVRRecording);
			}
		},

		/**
		 * @property {boolean} inLocker
		 * @readonly
		 */
		"inLocker" : {
			get : function() {
				var inLocker = false;
				if (this.npvrEnabled && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
					inLocker = $U.core.NPVRManager.getInstance().isEventInLocker(this);
				}
				return inLocker;
			}
		},

		/**
		 * @property {boolean} keep
		 * @readonly
		 */
		"keep" : {
			get : function() {
				return this._getKeep();
			}
		},

		/**
		 * @property {boolean} completed
		 * @readonly
		 */
		"completed" : {
			get : function() {
				return this._isCompleted();
			}
		},

		"recordedObject" : {
			get : function() {
				return this._getNPVRObject();
			}
		},
		/**
		 * @property {Object} serviceName this BTVEventItem's channel's serviceName
		 * @readonly
		 */
		"serviceName" : {
			get : function() {
				if (!this.channel) {
					return "";
				}
				return this.channel.title;
			}
		},

		/**
		 * @property {Object} definition video definition of this BTVEventItem
		 * @readonly
		 */
		"definition": {
			get: function () {
				return this._getDefinition();
			}
		},

		/**
		 * @property {Object} aspect video aspect of this BTVEventItem
		 * @readonly
		 */
		"aspect": {
			get: function () {
				return this._getAspect();
			}
		}
	});

	return BTVEventItem;
}());
