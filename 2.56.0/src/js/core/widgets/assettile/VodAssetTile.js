var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.VodAssetTile = ( function() {

	// Maximum difference in aspect ratios before image is clipped
	var CLOSE_ENOUGH = 0.01;
	var TEXT_STRAP_CLASSNAME = "text-strap-no-logo";
	var TEXT_LOGO_CONTAINER_CLASSNAME = "text-and-logo-container";
	var TEXT_CONTAINER_POSTER_CLASSNAME = "text-container-poster";

	/**
	 * @class $U.core.widgets.assettile.VodAssetTile
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
	function VodAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);

		// Uncomment to see ratings overlaid for debugging
		// var textAndLogoContainer = document.createElement("div");
		// var textStrap = document.createElement("div");
		//
		// textAndLogoContainer.className = "text-and-logo-container";
		// textStrap.className = "text-strap";
		//
		// textStrap.appendChild(document.createTextNode(this._wrappedAsset.rating));
		// textAndLogoContainer.appendChild(textStrap);
		// this._container.appendChild(textAndLogoContainer);

		//Add a star for the free content
		if (wrappedAsset.isAnyProductFree) {
			var starContainer = document.createElement("div");
			var starIcon = document.createElement("i");
			var freeText = document.createElement("div");

			starContainer.className = "star-container";
			if ($U.core.Device.isWebkit()) {
				starIcon.className = "webkit-star-icon icon-certificate icon-3x";
			} else {
				starIcon.className = "star-icon icon-certificate icon-3x";
			}
			freeText.className = "star-text";

			freeText.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtFree")));
			starContainer.appendChild(starIcon);
			starContainer.appendChild(freeText);
			this._container.appendChild(starContainer);
		}

		if (wrappedAsset.seriesRef) {
			var textContainer = document.createElement("div");
			var textStrap = document.createElement("div");
			var h1 = document.createElement("h1");
			var span = document.createElement("span");
			
			textStrap.className = TEXT_STRAP_CLASSNAME;
			textStrap.appendChild(span);
			
			span.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtEpisode") + " " + this._wrappedAsset.episodeNumber));

			textContainer.appendChild(textStrap);
			textContainer.className = TEXT_CONTAINER_POSTER_CLASSNAME;

			this._container.appendChild(textContainer);
		}
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(VodAssetTile, superClass);

	var proto = VodAssetTile.prototype;
	
	/**
	 * Default image load callback
	 * Puts the title in a strap if the default image is being used
	 * @private
	 */
	proto._loadDefault = function() {
		var textContainer = document.createElement("div");
		var textStrap = document.createElement("div");
		var h1 = document.createElement("h1");
		var span = document.createElement("span");

		textStrap.className = TEXT_STRAP_CLASSNAME;
		textStrap.appendChild(span);
		
		span.appendChild(document.createTextNode(this._wrappedAsset.title));

		textContainer.appendChild(textStrap);
		textContainer.className = TEXT_LOGO_CONTAINER_CLASSNAME;

		this._container.appendChild(textContainer);
	};

	return VodAssetTile;

}());

