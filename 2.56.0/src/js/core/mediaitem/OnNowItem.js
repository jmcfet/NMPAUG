/**
 * A specialisation of MediaItem that represents a BTV event
 *
 * @class $U.core.mediaitem.OnNowItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new OnNowItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.OnNowItem = ( function() {

	var superClass = $U.core.mediaitem.BTVEventItem;

	function OnNowItem() {
		superClass(this);
	}
	
	OnNowItem.createForServiceId = function(channel, callback) { 
		superClass.createForServiceId(channel, callback);
	};

	$N.apps.util.Util.extend(OnNowItem, superClass);

	var proto = OnNowItem.prototype;

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.ONNOW;
	};
	
	proto.isTileLarge = function() {
		return true;
	};

	return OnNowItem;
}());
