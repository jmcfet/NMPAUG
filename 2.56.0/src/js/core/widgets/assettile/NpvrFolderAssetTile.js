var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.NpvrFolderAssetTile = ( function() {

	// Maximum difference in aspect ratios before image is clipped
	var CLOSE_ENOUGH = 0.01;

	var DEFAULT_PORTRAIT_IMAGE = "images/missing_portrait.png";
	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape_npvr.png";
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";
	var DEFAULT_SERIES_IMAGE = "images/series_recording.png";

	/**
	 * @class $U.core.widgets.assettile.NpvrFolderAssetTile
	 * @extends $U.core.widgets.assettile.ImageAssetTile
	 * Object that represents an Video on Demand Asset tile in the Browse system
	 * @constructor
	 * @param name
	 * @param container
	 * @param owner
	 * @param wrappedAsset
	 * @param tileWidth
	 * @param tileHeight
	 * @param aspectRatio
	 * @param type
	 * @param imageSrc
	 */
	function NpvrFolderAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(NpvrFolderAssetTile, superClass);

	var proto = NpvrFolderAssetTile.prototype;

	/**
	 * Handles the click handler for clicking on an NPVR Folder Asset
	 * @private
	 * @param {Event} evt
	 */
	proto._clickHandler = function(evt) {
		var catId = this._wrappedAsset.completed ? $U.core.category.npvr.NPVRCompletedCategoryProvider.ID : $U.core.category.npvr.NPVRScheduledCategoryProvider.ID;
		$U.core.View.showCategoryWithAssets(this._wrappedAsset, this._wrappedAsset.title, catId, this._wrappedAsset.seriesId, true);
	};
	/**
	 * Builds and renders the HTML DOM element representing a PVR Asset
	 * @private
	 */
	proto._renderTile = function() {

		var footContainer = $U.core.util.DomEl.createDiv().setClassName("text-and-logo-container").asElement();
		var textStrap = $U.core.util.DomEl.createDiv().setClassName("text-strap").asElement();
		var currentDate = new Date(this._wrappedAsset.startTime);
		var tileImg = document.createElement("div");
		var tileImgLogo = document.createElement("img");
		tileImgLogo.className = "centred-in-container-abs";
		var startDate;
		var startTime;
		var title = this._wrappedAsset.title;
		tileImg.appendChild(tileImgLogo);
		tileImg.className = "channel-logo";

		startDate = $U.core.util.Formatter.formatDate(currentDate);
		startTime = $U.core.util.Formatter.formatTime(currentDate);

		$U.core.util.DomEl.createElWithText("h1", title).attachTo(textStrap);

		if (this._wrappedAsset._data.channelName) {
			$U.core.util.DomEl.createElWithText("p", this._wrappedAsset._data.channelName).attachTo(textStrap);
		}

		if (this._wrappedAsset.taskCount > 1) {
			$U.core.util.DomEl.createElWithText("p", $U.core.util.StringHelper.getString("txtEpisodes") + ": " + this._wrappedAsset.taskCount).attachTo(textStrap);
		} else if (this._wrappedAsset.startTime) {
			$U.core.util.DomEl.createElWithText("p", this._getTimeText()).attachTo(textStrap);
		}
		
		if (this._wrappedAsset.subscribed) {
			footContainer.className = "text-and-logo-container";
		} else {
			footContainer.className = "text-and-logo-container unsubscribed-event";
		}
		
		$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_SERIES_IMAGE], $U.core.ImageLoader.CENTRE, 50, 50);
		footContainer.appendChild(tileImg);
		
		footContainer.appendChild(textStrap);
		this._container.appendChild(footContainer);
		superClass.prototype.load.call(this);
	};

	/**
	 * Derives and returns the required image type to the caller.  Overrides parent to allow different default images
	 * @return {String} the type of image to use
	 */
	proto.imageTypeForMissingImage = function() {
		if (this._aspectRatio > 1) {
			return DEFAULT_LANDSCAPE_IMAGE;
		} else if (this._aspectRatio < 1) {
			return DEFAULT_PORTRAIT_IMAGE;
		} else {
			return DEFAULT_SQUARE_IMAGE;
		}
	};

	proto.load = function() {
		this._renderTile();
	};

	/**
	 * Sets the timing information of the asset (date/time of the NPVR item)
	 * @private
	 */
	proto._getTimeText = function() {
		var timeText = "";
		if (this._wrappedAsset.startTime !== undefined) {
			timeText = $U.core.util.Formatter.formatDate(new Date(this._wrappedAsset.startTime)) + " " + $U.core.util.Formatter.formatTime(new Date(this._wrappedAsset.startTime)) + "-" + $U.core.util.Formatter.formatTime(new Date(this._wrappedAsset.endTime));
		}
		return timeText;
	};

	return NpvrFolderAssetTile;

}());
