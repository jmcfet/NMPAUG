/**
 * A specialisation of MediaItem that represents a PVR_SCHEDULED asset
 *
 * @class $U.core.mediaitem.PVRScheduledItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new PVRScheduledItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.PVRScheduledItem = ( function() {

	var superClass = $U.core.mediaitem.PVRRecordedItem;

	var defaultType;

	function PVRScheduledItem(dataObject) {
		superClass.call(this, dataObject);
	}


	$N.apps.util.Util.extend(PVRScheduledItem, superClass);

	PVRScheduledItem.FALLBACK_IMAGE_SRC = "images/video_poster.png";

	PVRScheduledItem.create = function(dataObject) {
		return new $U.core.mediaitem.PVRScheduledItem(dataObject);
	};

	var proto = PVRScheduledItem.prototype;

	proto.isTileLarge = function() {
		return true;
	};

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.PVR_SCHEDULED;
	};

	//The schedule tasks don't have any rating associated with them atm:
	proto._getRating = function() {
		var rating = 0;
		if (this.eventData) {
			rating = this.eventData.parentalRating;
		}
		return rating;
	};

	proto._getUniqueId = function() {
		var id;
		if (this._data._data.scheduledCDSObjectID) {
			id = this._data._data.scheduledCDSObjectID.replace("epg.", "");
		}
		return id;
	};

	proto._getDVBTriplet = function() {
		var triplet;
		if (this._data._data.scheduledChannelID) {
			triplet = this._data._data.scheduledChannelID.text;
		}

		if (!triplet && this._data._data.taskChannelID) {
			triplet = this._data._data.taskChannelID.text;
		}
		
		if (!triplet && this._data._data.matchingID) {
			triplet = this._data._data.matchingID.text.substr(0, this._data._data.matchingID.text.lastIndexOf(","));
		}
		return triplet;
	};

	Object.defineProperties(proto, {

		/**
		 * @property {number} bookmark
		 * @readonly
		 */
		"taskCount" : {
			get : function() {
				var count = this._data._data.currentRecordTaskCount ? this._data._data.currentRecordTaskCount : 0;
				return parseInt(count, 10);
			}
		},
		"isSchedule" : {
			get : function() {
				return this._data.taskId ? false : true;
			}
		},
		"scheduledCDSObjectID" : {
			get : function() {
				return this._data._data.scheduledCDSObjectID;
			}
		}
	});

	return PVRScheduledItem;
}());
