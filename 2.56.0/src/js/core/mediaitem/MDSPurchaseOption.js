/**
 * MDSPurchaseOption
 *
 * @class $U.core.mediaitem.MDSPurchaseOption
 * @extends $U.core.mediaitem.PurchaseOption
 *
 * @constructor
 * Create a new MDSPurchaseOption
 * @param {Object} product the product
 * @param {Object} technical the technical
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.MDSPurchaseOption = ( function() {

	var SECONDS_PER_MINUTE = 60;

	var superClass = $U.core.mediaitem.PurchaseOption;

	function MDSPurchaseOption(product, technical) {
		superClass.call(this);
		this._id = product.id;
		this._title = product.TitleForProduct;
		this._description = product.Description;
		this._definition = technical.Definition;
		this._duration = product.rentalDuration/SECONDS_PER_MINUTE; // Field is in seconds, UI expects minutes
		this._currency = product.price.currency;
		this._price = product.price.value;
		this._type = product.type;
	}


	$N.apps.util.Util.extend(MDSPurchaseOption, superClass);

	return MDSPurchaseOption;
}());
