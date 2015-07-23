/**
 * Represents a media item loader.<br>
 * The loader gets the media item from the server using the items id and tells it's owner that it's got it
 *
 * @class $U.core.mediaitem.mediaitemloader.MediaItemLoader
 *
 * @constructor
 * Create a new MediaItemLoader
 * @param {String} id the id of the MediaItem to load
 * @param {$U.core.category.CategoryProvider} provider the category provider that is requesting the items
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};
$U.core.mediaitem.mediaitemloader = $U.core.mediaitem.mediaitemloader || {};

$U.core.mediaitem.mediaitemloader.MediaItemLoader = ( function() {

	var nextItemId = 0;

	function MediaItemLoader(id, provider) {
		this._id = id;
		this._provider = provider;
	}

	var proto = MediaItemLoader.prototype;

	/**
	 * Tells if there is an item or not
	 * @return {Boolean} true if there is an item
	 */
	proto._hasItem = function() {
		if (this._item) {
			return true;
		}
		return false;
	};

	Object.defineProperties(proto, {
		/**
		 * @property {$U.core.mediaitem.mediaitem.MediaItem} item the item retrieved by the loader
		 * @readonly
		 */
		"item" : {
			get : function() {
				return this._item;
			}
		},
		/**
		 * @property {Boolean} hasItem says whether there is an item or not, if 'item' is a combination of items can be used to check that all are fine
		 * @readonly
		 */
		"hasItem" : {
			get : function() {
				return this._hasItem();
			}
		}

	});

	return MediaItemLoader;
}());
