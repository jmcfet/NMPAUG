var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.OnNowAssetTile = ( function() {

	var DEFAULT_PORTRAIT_IMAGE = "images/missing_portrait.png";
	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape.png";
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";

	var logger = $U.core.Logger.getLogger("OnNowAssetTile");
	/**
	 * @class $U.core.widgets.assettile.OnNowAssetTile
	 * @extends $U.core.widgets.assettile.ImageAssetTile
	 * Object that represents an Asset tile that displays what's on now for a channel in the Browse system
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
	function OnNowAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(OnNowAssetTile, superClass);

	var proto = OnNowAssetTile.prototype;

	/**
	 * Load handler - Fetches the Channel and Event
	 */
	proto.load = function() {
		if (logger) {
			logger.log("load", this);
		}
		var self = this;
		var textAndLogoContainer = document.createElement("div");
		var textStrap = document.createElement("div");
		var channelLogo = document.createElement("div");
		var channelLogoImg = document.createElement("img");
		var h1 = document.createElement("h1");
		var p = document.createElement("p");

		channelLogoImg.className = "centred-in-container-abs";
		if (this._wrappedAsset.btvChannel !== null) {
			$U.core.ImageLoader.loadImageAndFitToSize(channelLogoImg, [this._wrappedAsset.btvChannel.promoImageURL, DEFAULT_SQUARE_IMAGE], $U.core.ImageLoader.CENTRE, 50, 50);
			channelLogo.appendChild(channelLogoImg);
		}

		if (this._wrappedAsset.btvEvent !== null) {
			h1.appendChild(document.createTextNode(this._wrappedAsset.btvEvent.title));
			p.appendChild(document.createTextNode(this._wrappedAsset.btvEvent.description));
		}

		textStrap.appendChild(h1);
		textStrap.appendChild(p);
		textAndLogoContainer.appendChild(textStrap);
		textAndLogoContainer.appendChild(channelLogo);

		textStrap.className = "text-strap";
		if (this._wrappedAsset.subscribed) {
			textAndLogoContainer.className = "text-and-logo-container";
		} else {
			textAndLogoContainer.className = "text-and-logo-container unsubscribed-event";
		}
		channelLogo.className = "channel-logo";

		this._container.appendChild(textAndLogoContainer);

		if (this._wrappedAsset.btvEvent !== null) {
			this._wrappedAsset.btvEvent.enrich(function() {
				self._imageSrc = []; 
				self._imageSrc.push(self._wrappedAsset.btvEvent.promoImageURL);
				if (self._wrappedAsset.btvChannel !== null) {
					self._imageSrc.push(self._wrappedAsset.btvChannel.promoImageURL);
				}
				superClass.prototype.load.call(self);
			});
		} else {
			superClass.prototype.load.call(this);
		}
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

	return OnNowAssetTile;

}());

