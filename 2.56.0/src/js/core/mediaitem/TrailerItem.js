/**
 *
 * @class $U.core.mediaitem.TrailerItem
 * @extends $U.core.mediaitem.MediatItem
 *
 * @constructor
 * Create a new TrailerItem
 * @param {Object} dataObject the underlying data object from MDS
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.TrailerItem = (function () {

	var logger = $U.core.Logger.getLogger("TrailerItem");

	var superClass = $U.core.mediaitem.MediaItem;

	function TrailerItem(dataObject) {
		superClass.call(this, dataObject);
	}

	$N.apps.util.Util.extend(TrailerItem, superClass);
	var proto = TrailerItem.prototype;

	proto._getType = function () {
		return $U.core.mediaitem.MediaItemType.TRAILER;
	};

	proto._getId = function () {
		var id;
		if (this._data) {
			id = this._data.id;
		} else {
			id = this.parentItem.id;
		}
		return id;
	};

	proto._getTitle = function () {
		return this._data.title;
	};

	proto._getDescription = function () {
		return this._data.title;
	};

	proto._getSynopsis = function () {
		return null;
	};

	proto._getDuration = function () {
		return this._data.duration;
	};

	proto._getRating = function () {
		return null;
	};

	proto._getDurationInSeconds = function () {
		return this._data.duration;
	};

	proto._isAssetPlayable = function () {
		return true;
	};

	proto._getContentToPlay = function () {
		return this._data;
	};

	proto._getThrowId = function () {
		return this._data.id;
	};

	proto.parentItem = function () {
		return this.parentItem;
	};

	return TrailerItem;
}());
