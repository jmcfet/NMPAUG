var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.PvrScheduledAssetTile = ( function() {

	// Maximum difference in aspect ratios before image is clipped
	var CLOSE_ENOUGH = 0.01;

	var DEFAULT_PORTRAIT_IMAGE = "images/missing_portrait.png";
	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape_pvr.png";
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";
	var DEFAULT_SERIES_IMAGE = "images/series_recording.png";
	var DEFAULT_RECORDING_IMAGE = "images/current_recording.png";
	var DEFAULT_TIME_RECORDING_IMAGE = "images/timebased_recording.png";
	var DEFAULT_MISSED_RECORDING_IMAGE = "images/missed_recording.png";

	/**
	 * @class $U.core.widgets.assettile.PvrScheduledAssetTile
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
	function PvrScheduledAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(PvrScheduledAssetTile, superClass);

	var proto = PvrScheduledAssetTile.prototype;

	/**
	 * Handles the click handler for clicking on a PVR Asset
	 * @private
	 * @param {Event} evt
	 */
	proto._clickHandler = function(evt) {
		var catProvider;
		var that = this;

		if (that._wrappedAsset.taskCount > 1) {
			catProvider = new $U.core.category.pvr.PVRScheduledCategoryProvider();
			catProvider.fetchTasks(that._wrappedAsset.jobId, function(tasks) {
				$U.core.View.showCategoryWithAssets(tasks, that._wrappedAsset.title, $U.core.category.pvr.PVRScheduledCategoryProvider.ID, that._wrappedAsset.jobId, true);
			}, true);
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
		var tileImg = document.createElement("div");
		var tileImgLogo = document.createElement("img");
		tileImgLogo.className = "centred-in-container-abs";

		var currentDate = new Date(this._wrappedAsset.startTime);
		var title = this._wrappedAsset.title;
		var startDate;
		var startTime;

		tileImg.appendChild(tileImgLogo);
		tileImg.className = "channel-logo";

		if (!this._wrappedAsset.startTime || isNaN(this._wrappedAsset.startTime)) {
			startDate = "";
			startTime = this._wrappedAsset.startTime ? this._wrappedAsset.startTime : "";
		} else {
			startDate = $U.core.util.Formatter.formatDate(currentDate);
			startTime = $U.core.util.Formatter.formatTime(currentDate);
		}

		if (this._wrappedAsset.taskCount > 1) {
			title += " [" + this._wrappedAsset.taskCount + "]";
		}
		$U.core.util.DomEl.createElWithText("h1", title).attachTo(textStrap);
		if (this._wrappedAsset._data.channelName) {
			$U.core.util.DomEl.createElWithText("p", this._wrappedAsset._data.channelName).attachTo(textStrap);
		}
		if (startDate + startTime !== "") {
			$U.core.util.DomEl.createElWithText("p", $U.core.util.StringHelper.getString("txtScheduled") + ": " + startDate + " " + startTime).attachTo(textStrap);
		} else if (this._wrappedAsset.recordingType === 1) {
			$U.core.util.DomEl.createElWithText("p", $U.core.util.StringHelper.getString("txtSeriesRecording")).attachTo(textStrap);
		}
		if (this._wrappedAsset._data._data && this._wrappedAsset._data._data.taskState && this._wrappedAsset._data._data.taskState.phase === "ACTIVE") {
			$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_RECORDING_IMAGE], $U.core.ImageLoader.CENTRE, 55, 31);
			footContainer.appendChild(tileImg);
		} else if (this._wrappedAsset.recordingType === 1) {
			$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_SERIES_IMAGE], $U.core.ImageLoader.CENTRE, 55, 31);
			footContainer.appendChild(tileImg);
		} else if (this._wrappedAsset._data._data['class'] === "OBJECT.RECORDSCHEDULE.DIRECT.CDSNONEPG") {
			$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_TIME_RECORDING_IMAGE], $U.core.ImageLoader.CENTRE, 55, 31);
			footContainer.appendChild(tileImg);
		} else if (this._wrappedAsset._data._data.taskState && this._wrappedAsset._data._data.taskState.text === "DONE.EMPTY") {
			$U.core.ImageLoader.loadImageAndFitToSize(tileImgLogo, [DEFAULT_MISSED_RECORDING_IMAGE], $U.core.ImageLoader.CENTRE, 55, 31);
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

	return PvrScheduledAssetTile;

}());

