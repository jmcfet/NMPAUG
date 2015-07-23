var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.PvrRecordedAssetTile = ( function() {

	// Maximum difference in aspect ratios before image is clipped
	var CLOSE_ENOUGH = 0.01;

	var DEFAULT_PORTRAIT_IMAGE = "images/missing_portrait.png";
	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape_pvr.png";
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";
	var DEFAULT_SERIES_IMAGE = "images/series_recording.png";
	var DEFAULT_TIME_RECORDING_IMAGE = "images/timebased_recording.png";

	/**
	 * @class $U.core.widgets.assettile.PvrRecordedAssetTile
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
	function PvrRecordedAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(PvrRecordedAssetTile, superClass);

	var proto = PvrRecordedAssetTile.prototype;

	/**
	 * Handles the click handler for clicking on a PVR Asset
	 * @private
	 * @param {Event} evt
	 */
	proto._clickHandler = function(evt) {
		if (this._wrappedAsset.recordingType === 1 || this._wrappedAsset.recordingType === 2 || this._wrappedAsset.customFolder) {
			$U.core.View.showCategoryWithAssets(this._wrappedAsset, this._wrappedAsset.title, $U.core.category.pvr.PVRRecordedCategoryProvider.ID, this._wrappedAsset.seriesId, true);
		} else {
			$U.core.View.showMediaCardScreen(this._wrappedAsset, this._owner.getItems());
		}
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
			$U.core.util.DomEl.createElWithText("p", $U.core.util.StringHelper.getString("txtRecorded") + ": " + startDate + " " + startTime).attachTo(textStrap);
		}
		if (this._wrappedAsset.recordingType === 1) {
			$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_SERIES_IMAGE], $U.core.ImageLoader.CENTRE, 50, 50);
			footContainer.appendChild(tileImg);
		} else if (this._wrappedAsset.recordingType === 2) {
			$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_TIME_RECORDING_IMAGE], $U.core.ImageLoader.CENTRE, 55, 31);
			footContainer.appendChild(tileImg);
		}
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

	return PvrRecordedAssetTile;

}());
