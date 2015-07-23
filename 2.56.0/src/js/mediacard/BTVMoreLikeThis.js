/**
 * Responsible for creating a BTV MoreLikeThis widget for the current device type
 * @class $U.mediaCard.BtvMoreLikeThis
 *
 * @template
 * @constructor
 * @param {HTMLElement} container containing element
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.BTVMoreLikeThis = ( function() {

	function BtvMoreLikeThis(container) {
		superClass.call(this, container);
	}

	BtvMoreLikeThis.create = function(container) {
		var result = null;
		switch ($U.core.Device.getFF()) {

		case $U.core.Device.FF.PHONE:
			result = new $U.mediaCard.BTVMoreLikeThisGrid(container);
			break;
		case $U.core.Device.FF.TABLET:
		case $U.core.Device.FF.DESKTOP:
			result = new $U.mediaCard.BTVMoreLikeThisScroller(container);
			break;
		}
		return result;
	};

	var superClass = $U.mediaCard.MoreLikeThis;
	$N.apps.util.Util.extend(BtvMoreLikeThis, superClass);

	/**
	 * Click handler for asset tiles in component
	 */
	BtvMoreLikeThis.prototype._assetTileClickHandler = function(tile) {
		var asset = tile._wrappedAsset,
			isBlocked = $U.core.parentalcontrols.ParentalControls.isRatingPermitted(asset.rating) ? false : true;

		if (!isBlocked) {
			if (asset.isCatchUp && asset.isPast && $U.core.Configuration.FETCH_CATCHUP_VOD_ASSETS) {
				$U.core.menudata.MDSAdapter.getCatchupAssetForBtvEvent(asset, function(catchupItem) {
					$U.core.View.showMediaCardScreen((catchupItem || asset), tile._owner.getItems(), null, null, $U.mediaCard.MoreLikeThisController.MLS_WIDGETS.BTV);
				});
			} else {
				$U.core.View.showMediaCardScreen((asset), tile._owner.getItems(), null, null, $U.mediaCard.MoreLikeThisController.MLS_WIDGETS.BTV);
			}
		}
	};

	return BtvMoreLikeThis;

}());
