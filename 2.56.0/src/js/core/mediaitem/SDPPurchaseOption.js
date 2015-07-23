/**
 * SDPPurchaseOption
 *
 * @class $U.core.mediaitem.SDPPurchaseOption
 * @extends $U.core.mediaitem.PurchaseOption
 *
 * @constructor
 * Create a new SDPPurchaseOption
 * @param {Object} offer the offer
 * @param {Object} technicalAsset the technical asset
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.SDPPurchaseOption = ( function() {

	var MINUTES_PER_DAY = 24 * 60;

	var superClass = $U.core.mediaitem.PurchaseOption;

	function SDPPurchaseOption(offer, technicalAsset) {
		superClass.call(this);
		this._id = offer.policyGroupUid;
		this._title = technicalAsset.name;
		// No purchase option descriptions from SDP?
		this._description = null;
		this._definition = technicalAsset.definition;
		// Durations are in days so convert to minutes
		this._duration = offer.expiryDurationValue * MINUTES_PER_DAY;
		this._currency = offer.currency;
		this._price = offer.value;
	}

	$N.apps.util.Util.extend(SDPPurchaseOption, superClass);

	return SDPPurchaseOption;
}());
