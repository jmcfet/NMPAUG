/**
 * Grid used to display the events that are related to main asset shown on the media card
 * @class $U.mediaCard.BTVMoreLikeThisGrid
 *
 * @constructor
 * @param {HTMLElement} container containing element
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.BTVMoreLikeThisGrid = ( function() {

	function BTVMoreLikeThisGrid(container) {
		superClass.call(this, container);

		var grid = document.createElement("div");
		grid.className = "mc-mlt-grid";

		container.appendChild(grid);
		this._grid = new $U.core.widgets.ShiftingAssetGrid(grid, this._assetTileClickHandler, true);
	}

	var superClass = $U.mediaCard.BTVMoreLikeThis;
	$N.apps.util.Util.extend(BTVMoreLikeThisGrid, superClass);
	var proto = BTVMoreLikeThisGrid.prototype;

	/**
	 * Populates the asset grid
	 */
	proto.populateAssets = function(items) {
		this._grid.populate(items, $U.core.Configuration.MORE_LIKE_THIS.BTV_EVENTS_TO_RENDER);
	};

	/**
	 * Sets the height of the asset grid
	 */
	proto.setHeight = function(height) {
		// Do nothing
	};

	/**
	 * Resizes the asset grid
	 */
	proto.resizeHandler = function() {
		return this._grid.resizeHandler();
	};

	/**
	 * Updates the BTVMoreLikeThis grid based on the provided asset.
	 * Shifts the next tile into view if the current program has changed
	 * @param {Object} mediaCardAsset the current mediaCardAsset
	 */
	proto.update = function(mediaCardAsset) {
		var headAsset = this._grid.getHeadAsset();
		if (headAsset && headAsset.startTime && mediaCardAsset.startTime > headAsset.startTime) {
			while (this._grid.getHeadAsset() && this._grid.getHeadAsset().startTime !== mediaCardAsset.startTime) {
				this._grid.shiftNextIntoView();
				this._grid.setOnNowOnNext(this._grid.getHeadAsset());
			}
		}
	};

	return BTVMoreLikeThisGrid;

}());
