/**
 * Grid object that contains the assets related to the current asset shown on the media card
 * @class $U.mediaCard.MoreLikeThisGrid
 *
 * @constructor
 * @param {HTMLElement} container containing element
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MoreLikeThisGrid = ( function() {

	function MoreLikeThisGrid(container) {
		superClass.call(this, container);

		var grid = document.createElement("div");
		grid.className = "mc-mlt-grid";

		container.appendChild(grid);
		this._grid = new $U.core.widgets.AssetGrid(grid);
	}

	var superClass = $U.mediaCard.CategoryMoreLikeThis;
	$N.apps.util.Util.extend(MoreLikeThisGrid, superClass);

	var proto = MoreLikeThisGrid.prototype;

	/**
	 * Puts the assets into the grid
	 * @param {Array} items items to put into the grid
	 */
	proto.populateAssets = function(items) {
		this._grid.populate(items);
		this._items = items;
	};

	/**
	 * Ignores the height being sent (the grids height is dependent on the amount of assets within it)
	 * @param {number} height
	 */
	proto.setHeight = function(height) {
		// Do nothing!
	};

	/**
	 * Handles the resize of the grid
	 * @return {Object} the dimensions of the grid after the resize
	 */
	proto.resizeHandler = function() {
		return this._grid.resizeHandler();
	};
	
	proto.destroy = function() {
		this._grid.clearDOM();
	};

	return MoreLikeThisGrid;

}());
