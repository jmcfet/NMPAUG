/**
 * A specialisation of MediaItem that represents a PVRRecording asset
 *
 * @class $U.core.mediaitem.PVRRecordedItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new PVRRecordedItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.PVRRecordedItem = ( function() {

	var superClass = $U.core.mediaitem.MediaItem;

	var defaultType;

	function PVRRecordedItem(dataObject) {
		superClass.call(this, dataObject);
	}

	$N.apps.util.Util.extend(PVRRecordedItem, superClass);

	PVRRecordedItem.FALLBACK_IMAGE_SRC = "images/video_poster.png";

	PVRRecordedItem.create = function(dataObject) {
		return new $U.core.mediaitem.PVRRecordedItem(dataObject);
	};

	var proto = PVRRecordedItem.prototype;

	proto.isTileLarge = function() {
		return true;
	};

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.PVR_RECORDING;
	};

	proto._getCustomType = function() {
		return $U.core.CategoryConfiguration.CONTENT_TYPE.EVENT;
	};

	proto._getId = function() {
		var id = this._data.taskId ? this._data.taskId : this._data.jobId;
		if(this._data._data.parentID === "pvr"){
			if (this._data._data.refID) {
				id = this._data._data.refID;
			} else {
				id = this._data._data.id;
			}
		}
		return id;
	};

	proto._getTitle = function() {
		return this._data.title;
	};

	proto._getDescription = function() {
		return this._data.contentDesc;
	};

	proto._getSynopsis = function() {
		return this._data.longDesc;
	};

	proto._getDurationInSeconds = function() {
		return Math.floor((this._data.duration) / 1000);
	};

	// Note: will be undefined prior to enrichment
	proto._hasPromoImageURL = function() {
		return this._data.image ? Boolean(this._data.image) : undefined;
	};

	// Note: will be undefined prior to enrichment
	proto._getPromoImageURL = function() {
		return $U.core.util.ImageURLHelper.getInstance().pvrChannelLogoURL(this);
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

	proto._getUniqueId = function() {
		var id;
		if (this._data._data.programCode) {
			id = this._data._data.programCode.text;
		}
		return id;
	};

	proto._getDVBTriplet = function() {
		return this._data._data.channelID.text;
	};

	/* Define additional properties for this object here */
	Object.defineProperties(proto, {

		/**
		 * @property {number} bookmark
		 * @readonly
		 */
		"bookmark" : {
			get : function() {
				return this.__data.bookmark;
			}
		},

		/**
		 * @property {number} startTime
		 * @readonly
		 */
		"startTime" : {
			get : function() {
				if(this._data.startTime !== null && this._data.startTime instanceof Date){
					var firstDate = new Date(0);
					if(this._data.startTime.getTime() === firstDate.getTime()){
						return "Now";
					}
				}
				if(this._data._startTime){
					return this._data._startTime;
				}
				return this._data.startTime;
			}
		},

		/**
		 * @property {number} endTime
		 * @readonly
		 */
		"endTime" : {
			get : function() {
				return this._data.endTime;
			}
		},

		/**
		 * @property {number} episodeId
		 * @readonly
		 */
		"episodeId" : {
			get : function() {
				return this._data.episodeId;
			}
		},
		/**
		 * @property {number} eventId
		 * @readonly
		 */
		"eventId" : {
			get : function() {
				return this._data.eventId;
			}
		},
		/**
		 * @property {string} image
		 * @readonly
		 */
		"image" : {
			get : function() {
				return this._data.image;
			}
		},
		/**
		 * @property {boolean} keep
		 * @readonly
		 */
		"keep" : {
			get : function() {
				return this._data.keep;
			}
		},
		/**
		 * @property {string} longDesc
		 * @readonly
		 */
		"longDesc" : {
			get : function() {
				return this._data.longDesc;
			}
		},
		/**
		 * @property {number} recordingType
		 * @readonly
		 */
		"recordingType" : {
			get : function() {
				return this._data.recordingType;
			}
		},
		/**
		 * @property {number} seasonId
		 * @readonly
		 */
		"seasonId" : {
			get : function() {
				return this._data.seasonId;
			}
		},
		/**
		 * @property {number} seriesId
		 * @readonly
		 */
		"seriesId" : {
			get : function() {
				return this._data.seriesId;
			}
		},
		/**
		 * @property {number} seriesName
		 * @readonly
		 */
		"seriesName" : {
			get : function() {
				return this._data.seriesName;
			}
		},
		/**
		 * @property {number} serviceId
		 * @readonly
		 */
		"serviceId" : {
			get : function() {
				return this._data.serviceId;
			}
		},
		/**
		 * @property {number} shortDesc
		 * @readonly
		 */
		"shortDesc" : {
			get : function() {
				return this._data.shortDesc;
			}
		},
		/**
		 * @property {number} softPostpaddingDuration
		 * @readonly
		 */
		"softPostpaddingDuration" : {
			get : function() {
				return this._data.softPostpaddingDuration;
			}
		},
		/**
		 * @property {number} softPrepaddingDuration
		 * @readonly
		 */
		"softPrepaddingDuration" : {
			get : function() {
				return this._data.softPrepaddingDuration;
			}
		},
		/**
		 * @property {number} taskId
		 * @readonly
		 */
		"taskId" : {
			get : function() {
				return this._data.taskId;
			}
		},
		"jobId" : {
			get : function() {
				return this._data.jobId;
			}
		},
		"throwId" : {
			get : function() {
				var throwID = this._data._data.id;
				if (this._data._data.refID) {
					throwID = this._data._data.refID;
				}
				return throwID;
			}
		},
		"fetchText" : {
			get : function() {
				return $U.core.util.StringHelper.getString("txtFetching", {});
			}
		},
		"channelLogo" : {
			get : function() {
				return this._getPromoImageURL();
			}
		},
		"fetchPosition" : {
			get : function() {
				return this._data._data.defaultPlaybackInfo.position;
			}
		},
		"playbackPosition" : {
			get : function() {
				return this._playbackPosition;
			},
			set : function(pos) {
				this._playbackPosition = pos;
			}
		},
		"cdsObjectID" : {
			get : function() {
				var schedID = this._data._data.scheduledCDSObjectID;
				if (!schedID) {
					schedID = this._data._data.taskCDSObjectID;
				}
				if (!schedID) {
					if (this._data._data.refID) {
						schedID = this._data._data.refID;
					} else {
						schedID = this._data._data.id;
					}
				}
				return schedID;
			}
		},
		"channel" : {
			get : function() {
				return this._channel;
			},
			set : function(chnl) {
				this._channel = chnl;
			}
		},
		"uniqueId" : {
			get : function() {
				return this._getUniqueId();
			}
		},
		"eventData" : {
			get : function() {
				return this._eventData;
			},
			set : function(data) {
				this._eventData = data;
			}
		},
		"channelDVBTriplet" : {
			get : function() {
				return this._getDVBTriplet();
			}
		}

	});

	return PVRRecordedItem;
}());
