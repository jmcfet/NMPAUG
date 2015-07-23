var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.VodSeriesAssetTile = ( function() {

	var TEXT_STRAP_CLASSNAME = "text-strap";

	var TEXT_LOGO_CONTAINER_CLASSNAME = "text-and-logo-container";

	var logger = $U.core.Logger.getLogger("VodSeriesAssetTile");
	/**
	 * @class $U.core.widgets.assettile.VodSeriesAssetTile
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
	function VodSeriesAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(VodSeriesAssetTile, superClass);

	var proto = VodSeriesAssetTile.prototype;

	/**
	 * Load handler - Fetches the Channel and Event
	 */
	proto.load = function() {

		var textAndLogoContainer = document.createElement("div");
		var textStrap = document.createElement("div");
		var h1 = document.createElement("h1");
		var p = document.createElement("p");
		var title = this._wrappedAsset.seriesTitle===undefined ?  this._wrappedAsset.title : this._wrappedAsset.seriesTitle;
			
		h1.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtEpisode") + " " + this._wrappedAsset.episodeNumber));
		p.appendChild(document.createTextNode(title));

		textStrap.appendChild(h1);
		textStrap.appendChild(p);
		textStrap.className = TEXT_STRAP_CLASSNAME;

		textAndLogoContainer.appendChild(textStrap);
		textAndLogoContainer.className = TEXT_LOGO_CONTAINER_CLASSNAME;

		this._container.appendChild(textAndLogoContainer);

		superClass.prototype.load.call(this);
	};

	return VodSeriesAssetTile;

}());

