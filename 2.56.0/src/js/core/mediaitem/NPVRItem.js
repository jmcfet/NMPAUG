/**
 * A specialisation of MediaItem that represents a NPVR item
 *
 * @class $U.core.mediaitem.NPVRItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new NPVRItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.NPVRItem = ( function() {

	var superClass = $U.core.mediaitem.BTVEventItem;

	function NPVRItem(dataObject, channel) {
		superClass.call(this, dataObject, channel);
	}


	$N.apps.util.Util.extend(NPVRItem, superClass);

	var proto = NPVRItem.prototype;

	NPVRItem.create = function(dataObject, callback) {
		$U.epg.dataprovider.BTVDataProvider.getInstance().fetchChannel(dataObject.serviceId, function(channel) {
			var item = new NPVRItem(dataObject, channel);
			callback(item);
		});
	};

	proto.isTileLarge = function() {
		return true;
	};

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.NPVR;
	};

	//time is epoch seconds from JSFW
	proto._getStartTime = function() {
		return this._data.startTime;
	};

	//time is epoch seconds from JSFW
	proto._getEndTime = function() {
		return this._data.endTime;
	};

	proto._getSynopsis = function() {
		return this._data.longDesc;
	};

	proto._getKeep = function() {
		return this._data.keep;
	};

	proto._isCompleted = function() {
		return this._data.status === $U.core.NPVRManager.getInstance().completed();
	};

	proto._getContentToPlay = function() {
		return this._data;
	};

	proto._getEpisodeNumber = function () {
		return this._getFromProgrammeMetaData("Episode");
	};

	proto._getActors = function () {
		return this._getFromProgrammeMetaData("Actors");
	};

	proto._getDirectors = function () {
		return this._getFromProgrammeMetaData("Directors");
	};

	proto._getYear = function () {
		return this._getFromProgrammeMetaData("Year");
	};

	proto._getFromProgrammeMetaData = function (property) {
		var programmeMetaData;
		if (this._data._data) {
			programmeMetaData = this._data._data.programmeMetaData;
		}
		if (programmeMetaData && programmeMetaData._data) {
			return programmeMetaData._data[property];
		}
	};

	proto._getAspect = function () {
		return this._getFromProgrammeMetaData("Aspect");
	};

	proto._getDefinition = function () {
		return this._getFromProgrammeMetaData("Definition");
	};

	// Note: will be undefined prior to enrichment
	proto._hasPromoImageURL = function() {
		return Boolean(this._data.image);
	};

	// Note: will be undefined prior to enrichment
	proto._getPromoImageURL = function() {
		return this._enriched ? $U.core.util.ImageURLHelper.getInstance().npvrPromoImageURL(this) : undefined;
	};

	Object.defineProperties(proto, {

		/**
		 * @property {String} taskId the id of the recording task
		 * @readonly
		 */
		"taskId" : {
			get : function() {
				return this._data.taskId;
			}
		},

		/**
		 * @property {String} status the status of the recording ("NEW", "RECORDING", "RECORDED")
		 * @readonly
		 */
		"status" : {
			get : function() {
				return this._data.status;
			}
		},
		/**
		 * @property {String} completed true if the status of the recording is "RECORDED"
		 * @readonly
		 */
		"completed" : {
			get : function() {
				return this._isCompleted();
			}
		},
		/**
		 * @property {String} scheduled true if the status of the recording is "NEW"
		 * @readonly
		 */
		"scheduled" : {
			get : function() {
				return this._data.status === $U.core.NPVRManager.getInstance().scheduled();
			}
		},
		/**
		 * @property {String} active true if the status of the recording is "RECORDING"
		 * @readonly
		 */
		"active" : {
			get : function() {
				return this._data.status === $U.core.NPVRManager.getInstance().active();
			}
		},
		/**
		 * @property {String} deleted true if the status of the recording is "DELETED"
		 * @readonly
		 */
		"deleted" : {
			get : function() {
				return this._data.status === $U.core.NPVRManager.getInstance().deleted();
			}
		},
		/**
		 * @property {number} recordingType type of recording 1=series 0=individual
		 * @readonly
		 */
		"recordingType" : {
			get : function() {
				return this._data.recordingType;
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
		}
	});

	return NPVRItem;
}());
