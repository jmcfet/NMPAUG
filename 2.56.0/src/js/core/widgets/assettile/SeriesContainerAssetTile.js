var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.SeriesContainerAssetTile = (function() {

	var TEXT_STRAP_CLASSNAME = "text-strap";

	var TEXT_LOGO_CONTAINER_CLASSNAME = "text-and-logo-container";

	var logger = $U.core.Logger.getLogger("SeriesContainerAssetTile");
	/**
	 * @class $U.core.widgets.assettile.SeriesContainerAssetTile
	 * @extends $U.core.widgets.assettile.ImageAssetTile
	 * Object that represents an Asset tile that displays a VOD item that is a member of a series
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
	function SeriesContainerAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(SeriesContainerAssetTile, superClass);

	var proto = SeriesContainerAssetTile.prototype;

	/**
	 * Load handler - Fetches the Channel and Event
	 */
	proto.load = function() {

		var textAndLogoContainer = document.createElement("div");
		var textStrap = document.createElement("div");
		var h1 = document.createElement("h1");
		//var p = document.createElement("p");

		h1.appendChild(document.createTextNode(this._wrappedAsset.title));
		//p.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtEpisode") + " " + this._wrappedAsset.episodeNumber));

		textStrap.appendChild(h1);
		//textStrap.appendChild(p);
		textStrap.className = TEXT_STRAP_CLASSNAME;

		textAndLogoContainer.appendChild(textStrap);
		textAndLogoContainer.className = TEXT_LOGO_CONTAINER_CLASSNAME;

		this._container.appendChild(textAndLogoContainer);

		superClass.prototype.load.call(this);

	};

	/**
	 * Handles the click handler for clicking on a Series Container Asset
	 * @private
	 * @param {Event} evt
	 */
	proto._clickHandler = function(evt) {
		var that = this;
		$U.core.widgets.PageLoading.show($U.core.widgets.assettile.SeriesContainerAssetTile);
		$U.core.menudata.MDSAdapter.getAssetsInSeriesForAsset(this._wrappedAsset, this._wrappedAsset.title, function(assets) {
			$U.core.widgets.PageLoading.hide($U.core.widgets.assettile.SeriesContainerAssetTile);
			$U.core.View.showMediaCardScreen(assets[0], that._owner.getItems());
		});
	};

	/**
	 * Default image load callback
	 * Tries getting the first image it finds in the episodes of the series
	 * @private
	 */
	proto._loadDefault = function() {
		var that = this;
		if (logger) {
			logger.log("_loadDefault", "There is no series image!!");
		}
		//get the image from the first asset that has a promoImage instead
		if (this._assetInd === undefined) {
			this._assetInd = 0;
		} else {
			this._assetInd++;
		}

		$U.core.menudata.MDSAdapter.getAssetsInSeriesForAsset(this._wrappedAsset, this._wrappedAsset.title, function(assets) {
			if (that._assetInd < assets.length) {
				that._imageSrc = assets[that._assetInd]._data.PromoImages;
				superClass.prototype.load.call(that);
			}
		});
	};

	return SeriesContainerAssetTile;

}());