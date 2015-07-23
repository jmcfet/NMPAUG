/**
 * Represents a media item loader.<br>
 * The loader gets the media item from the server using the items id and tells it's owner that it's got it
 *
 * @class $U.core.mediaitem.mediaitemloader.VODItemLoader
 *
 * @constructor
 * Create a new VODItemLoader
 * @param {String} id the id of MediaItem that the loader will load
 * @param {$U.core.category.CategoryProvider} provider the category provider that is trying to load the item
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};
$U.core.mediaitem.mediaitemloader = $U.core.mediaitem.mediaitemloader || {};

$U.core.mediaitem.mediaitemloader.VODItemLoader = ( function() {

	var logger = $U.core.Logger.getLogger("VODItemLoader");

	var superClass = $U.core.mediaitem.mediaitemloader.MediaItemLoader;

	var defaultType;

	function VODItemLoader(id, provider) {
		superClass.call(this, id, provider);
	}


	$N.apps.util.Util.extend(VODItemLoader, superClass);

	var proto = VODItemLoader.prototype;

	/**
	 * Loads the content from the server using an SDP call.
	 */
	proto.load = function() {
		var that = this;
		$N.services.sdp.VOD.getAssetSchedulesByUid(this._id, function(asset) {
			that._loadCallback(asset);
		}, function() {
			that._loadCallback(null);
		});
	};

	/*
	 * Converts the item loaded from the SDP call into a more usable VODItem.<br>
	 * Once converted the contentProvider it told about it.
	 * @param {Object} item the returned item from SDP
	 * @private
	 */
	proto._loadCallback = function(item) {
		var that = this;
		var channel;
		$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByLongName(function(allChannelsByLongName) {
			if (!item || !item[0]) {
				if (logger) {
					logger.log("loadCallback", "nothing returned for: " + that._id);
				}
				that._item = null;
			} else {
				if (item[0].ProgramId) {
					channel = allChannelsByLongName[item[0].ServiceLongName];
					that._item = $U.core.mediaitem.CatchUpMediaItem.create(item[0], channel);
				} else {
					that._item = $U.core.mediaitem.VODItem.create(item[0]);
				}
			}
			that._provider.loaded();

		});
	};

	return VODItemLoader;
}());
