/**
 * A specialisation of MediaItem that represents a Search Suggestion item
 *
 * @class $U.core.mediaitem.SuggestedItem
 * @extends $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new SuggestedItem
 * @param {Object} dataObject the underlying data object
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.SuggestedItem = ( function() {

	var superClass = $U.core.mediaitem.MediaItem;

	function SuggestedItem(dataObject, channel) {
		superClass.call(this, dataObject, channel);
	}

	$N.apps.util.Util.extend(SuggestedItem, superClass);

	var proto = SuggestedItem.prototype;

	proto._getType = function() {
		return $U.core.mediaitem.MediaItemType.SUGGESTION;
	};

	proto._getTitle = function() {
		return this._data.suggestion;
	};
	
	proto._getId = function () {
		
	};
	
	return SuggestedItem;
}());
