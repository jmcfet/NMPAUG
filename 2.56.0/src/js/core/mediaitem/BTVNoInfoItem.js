/**
 * A specialisation of BTVEventItem that represents a BTV "no programme information" event
 *
 * @class $U.core.mediaitem.BTVNoInfoItem
 * @extends $U.core.mediaitem.BTVEventItem
 *
 * @constructor
 * Create a new BTVNoInfoItem
 * @param {Object} channel the underlying channel data object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.BTVNoInfoItem = ( function() {

	var NO_INFO = "NO_INFO_";

	var superClass = $U.core.mediaitem.BTVEventItem;

	function BTVNoInfoItem(channel) {
		// Create a data object that looks like a channel
		var data = {
			serviceId : channel.serviceId,
			title : channel._data.name,
			shortDesc : $U.core.util.StringHelper.getString("txtNoProgrammes"),
			longDesc : null,
			startTime : Number.NEGATIVE_INFINITY,
			endTime : Number.POSITIVE_INFINITY,
			parentalRating : null,
			promoImageURL : channel.logo
		};
		superClass.call(this, data, channel);
	}


	$N.apps.util.Util.extend(BTVNoInfoItem, superClass);

	var proto = BTVNoInfoItem.prototype;

	proto.enrich = function(callback) {
		callback();
	};
	
	proto._getId = function() {
		// For the same channel, always return the same id
		return NO_INFO + this._data.serviceId;
	};

	proto._getTitle = function() {
		// The channel title
		return this._data.title;
	};

	proto._hasPromoImageURL = function() {
		return Boolean(this._data.promoImageURL);
	};

	proto._getPromoImageURL = function() {
		return $U.core.util.ImageURLHelper.getInstance().btvEventPromoImageURL(this) || null;
	};

	proto._getDurationInSeconds = function() {
		return null;
	};

	return BTVNoInfoItem;

}());
