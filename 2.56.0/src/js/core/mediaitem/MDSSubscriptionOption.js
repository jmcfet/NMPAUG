/**
 * MDSSubscriptionOption
 *
 * @class $U.core.mediaitem.MDSSubscriptionOption
 * @extends $U.core.mediaitem.MDSPurchaseOption
 *
 * @constructor
 * Create a new MDSSubscriptionOption
 * @param {Object} product the product
 * @param {Object} technical the technical
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.MDSSubscriptionOption = ( function() {

	var SECONDS_PER_MINUTE = 60;

	var superClass = $U.core.mediaitem.MDSPurchaseOption;

	function MDSSubscriptionOption(product, technical) {
		superClass.call(this, product, technical);
	}


	$N.apps.util.Util.extend(MDSSubscriptionOption, superClass);

	return MDSSubscriptionOption;
}());
