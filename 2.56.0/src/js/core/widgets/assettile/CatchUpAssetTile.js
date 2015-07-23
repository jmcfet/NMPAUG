var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.CatchUpAssetTile = ( function() {

	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";

	var CHANNEL_LOGO_CLASSNAME = "channel-logo";

	var CHANNEL_LOGO_IMG_CLASSNAME = "centred-in-container-abs";

	var TEXT_STRAP_CLASSNAME = "text-strap";

	var TEXT_LOGO_CONTAINER_UNSUB_CLASSNAME = "text-and-logo-container unsubscribed-event";

	var TEXT_LOGO_CONTAINER_CLASSNAME = "text-and-logo-container";

	var logger = $U.core.Logger.getLogger("CatchUpAssetTile");
	/**
	 * @class $U.core.widgets.assettile.CatchUpAssetTile
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
	function CatchUpAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(CatchUpAssetTile, superClass);

	var proto = CatchUpAssetTile.prototype;

	/**
	 * Load handler - Fetches the Channel and Event
	 */
	proto.load = function() {

		var textAndLogoContainer = document.createElement("div");
		var textStrap = document.createElement("div");
		var channelLogo = document.createElement("div");
		var channelLogoImg = document.createElement("img");
		var h1 = document.createElement("h1");
		var p = document.createElement("p");

		$U.core.ImageLoader.loadImageAndFitToSize(channelLogoImg, [this._wrappedAsset.channelLogo, DEFAULT_SQUARE_IMAGE], $U.core.ImageLoader.CENTRE, 50, 50);
		channelLogoImg.className = CHANNEL_LOGO_IMG_CLASSNAME;

		h1.appendChild(document.createTextNode(this._wrappedAsset.title));
		p.appendChild(document.createTextNode(this._getTimeText()));

		channelLogo.appendChild(channelLogoImg);
		channelLogo.className = CHANNEL_LOGO_CLASSNAME;

		textStrap.appendChild(h1);
		textStrap.appendChild(p);
		textStrap.className = TEXT_STRAP_CLASSNAME;

		textAndLogoContainer.appendChild(textStrap);
		textAndLogoContainer.appendChild(channelLogo);

		if (this._wrappedAsset.isAssetPlayable) {
			textAndLogoContainer.className = TEXT_LOGO_CONTAINER_CLASSNAME;
		} else {
			textAndLogoContainer.className = TEXT_LOGO_CONTAINER_UNSUB_CLASSNAME;
		}

		this._container.appendChild(textAndLogoContainer);

		this._imageSrc = [this._wrappedAsset.promoImageURL, this._wrappedAsset.channelLogo];

		superClass.prototype.load.call(this);

	};

	/**
	 * Sets the timing information of the asset (date/time of a BTV Event)
	 * @private
	 */
	proto._getTimeText = function() {
		var timeText = "";
		if (this._wrappedAsset.startTime !== undefined) {
			timeText = $U.core.util.Formatter.formatDate(new Date(this._wrappedAsset.startTime)) + " " + $U.core.util.Formatter.formatTime(new Date(this._wrappedAsset.startTime)) + "-" + $U.core.util.Formatter.formatTime(new Date(this._wrappedAsset.endTime));
		}
		return timeText;
	};

	return CatchUpAssetTile;

}());

