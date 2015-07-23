/**
 * Represents a media item loader.<br>
 * The loader gets the media item from the server using the items id and tells it's owner that it's got it
 *
 * @class $U.core.mediaitem.mediaitemloader.BTVChannelItemLoader
 *
 * @constructor
 * Create a new BTVChannelItemLoader
 * @param {String} id the id of MediaItem that the loader will load
 * @param {$U.core.category.CategoryProvider} provider the category provider that is trying to load the item
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};
$U.core.mediaitem.mediaitemloader = $U.core.mediaitem.mediaitemloader || {};

$U.core.mediaitem.mediaitemloader.BTVChannelItemLoader = ( function() {

	var logger = $U.core.Logger.getLogger("BTVChannelItemLoader");

	var superClass = $U.core.mediaitem.mediaitemloader.MediaItemLoader;

	var dataProvider = null;

	function getDataProvider() {
		if (dataProvider === null) {
			dataProvider = $U.epg.dataprovider.BTVDataProvider.getInstance();
		}
		return dataProvider;
	}

	function BTVChannelItemLoader(id, provider) {
		superClass.call(this, id, provider);
	}


	$N.apps.util.Util.extend(BTVChannelItemLoader, superClass);

	var proto = BTVChannelItemLoader.prototype;

	/*
	 * Loads the channel from the channel data provider
	 */
	proto.load = function() {
		var that = this;
		getDataProvider().fetchChannel(this._id, function(btvChannelItem) {
			that._loadCallback(btvChannelItem);
		});
	};

	/*
	 * Once the channel data is loaded the contentProvider it told about it.
	 * @param {$U.core.mediaitem.BTVChannelItem} btvChannelItem
	 * @private
	 */
	proto._loadCallback = function(btvChannelItem) {
		if (!btvChannelItem) {
			if (logger) {
				logger.log("loadCallback", "nothing returned for: " + this._id);
			}
			this._item = null;
		} else {
			this._item = btvChannelItem;
		}
		this._provider.loaded();
	};

	return BTVChannelItemLoader;
}());
