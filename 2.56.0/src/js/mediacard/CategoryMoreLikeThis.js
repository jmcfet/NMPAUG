/**
 * Responsible for creating a category MoreLikeThis widget for the current device type
 * @class $U.mediaCard.CategoryMoreLikeThis
 *
 * @template
 * @constructor
 * @param {HTMLElement} container containing element
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.CategoryMoreLikeThis = ( function() {

	function CategoryMoreLikeThis(container) {
		superClass.call(this, container);
	}

	/**
	 * Creates a concrete CategoryMoreLikeThis object. The type created depends on the form factor.
	 * @param {HTMLElement} container containing element
	 * @return {$U.mediaCard.CategoryMoreLikeThis} the chosen More Like This element
	 */
	CategoryMoreLikeThis.create = function(container) {
		var result = null;
		switch ($U.core.Device.getFF()) {

		case $U.core.Device.FF.PHONE:
			result = new $U.mediaCard.MoreLikeThisGrid(container);
			break;

		case $U.core.Device.FF.TABLET:
		case $U.core.Device.FF.DESKTOP:
			result = new $U.mediaCard.MoreLikeThisScroller(container);
			break;
		}
		return result;
	};

	var superClass = $U.mediaCard.MoreLikeThis;
	$N.apps.util.Util.extend(CategoryMoreLikeThis, superClass);

	return CategoryMoreLikeThis;

}());
