/**
 * Represents a media item loader.<br>
 * This loader gets a channel and the event that is currently playing on the channel
 *
 *
 * @class $U.core.mediaitem.mediaitemloader.OnNowItemLoader
 *
 * @constructor
 * Create a new OnNowItemLoader
 * @param {String} id the id of MediaItem that the loader will load
 * @param {$U.core.category.CategoryProvider} provider the category provider that is trying to load the item
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};
$U.core.mediaitem.mediaitemloader = $U.core.mediaitem.mediaitemloader || {};

$U.core.mediaitem.mediaitemloader.OnNowItemLoader = ( function() {

	var logger = $U.core.Logger.getLogger("OnNowItemLoader");

	var superClass = $U.core.mediaitem.mediaitemloader.MediaItemLoader;

	function OnNowItemLoader(id, provider) {
		superClass.call(this, id, provider);
	}

	$N.apps.util.Util.extend(OnNowItemLoader, superClass);

	var proto = OnNowItemLoader.prototype;

	/*
	 * Loads the event and channel from the server using SDP calls
	 */
	proto.load = function() {
		var that = this;
		this._item = $U.core.mediaitem.OnNowItem.createForServiceId(this._id, function(event) {
			that._item = event;
			if ($U.core.Gateway.isGatewayAvailable() && that._item) {
				that._item.updateOnClick = true;
			}
			that._provider.loaded();
		});

	};

	return OnNowItemLoader;
}());
