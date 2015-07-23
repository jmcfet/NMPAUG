/**
 * Superclass for MoreLikeThis widgets. Contains methods common to all MoreLikeThis components
 * and handles widget creation.
 * @class $U.mediaCard.MoreLikeThis
 *
 * @template
 * @constructor
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MoreLikeThis = ( function() {

	function MoreLikeThis(container) {
		this._container = container;
	}

	/**
	 * Create a concrete MoreLikeThis for the provided widget type.
	 * @param {String} type of the widget to create.
	 * @param {HTMLElement} container containing element.
	 * @return {$U.mediaCard.MoreLikeThis} The element corresponding to the widget to create.
	 */
	MoreLikeThis.create = function(type, container) {
		var result = null,
			widgetTypes = $U.mediaCard.MoreLikeThisController.MLS_WIDGETS;
		switch (type) {

		case widgetTypes.CATEGORY:
			result = $U.mediaCard.CategoryMoreLikeThis.create(container);
			break;
		case widgetTypes.BTV:
			result = $U.mediaCard.BTVMoreLikeThis.create(container);
			break;
		}
		return result;
	};

	var proto = MoreLikeThis.prototype;

	/**
	 * Gets the next item in this widgets items array
	 * @param {Object} currently selected item in mlt
	 */
	proto.getNextItem = function(item) {
		var result;
		var i, l;

		if (this._items) {
			l = this._items.length;
			for ( i = 0; i < l; i++) {
				if (this._items[i].id === item.id) {
					result = this._items[i + 1];
					break;
				}
			}
		}

		return result;
	};

	/**
	 * Shows the widget
	 */
	proto.show = function() {
		$U.core.util.HtmlHelper.setDisplayBlock(this._container);
	};

	/**
	 * Hides the widget
	 */
	proto.hide = function() {
		$U.core.util.HtmlHelper.setDisplayNone(this._container);
	};

	/**
	 * Causes an update of the widget
	 */
	proto.update = function() {};

	return MoreLikeThis;

}());
