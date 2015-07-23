var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.EventAssetTile = ( function() {

	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";

	var logger = $U.core.Logger.getLogger("EventAssetTile");
	/**
	 * @class $U.core.widgets.assettile.EventAssetTile
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
	function EventAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(EventAssetTile, superClass);

	var proto = EventAssetTile.prototype;

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
		$U.core.ImageLoader.loadImageAndFitToSize(channelLogoImg, [this._wrappedAsset.channelLogo, DEFAULT_SQUARE_IMAGE], $U.core.ImageLoader.CENTRE, 50, 50);

		if (this._wrappedAsset.title) {
			h1.appendChild(document.createTextNode(this._wrappedAsset.title));
			p.appendChild(document.createTextNode(this._getTimeText()));
		} else {
			if (this._wrappedAsset.channel) {
				h1.appendChild(document.createTextNode(this._wrappedAsset.channel.title));
			}
			p.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtNoProgrammes")));
		}

		channelLogo.appendChild(channelLogoImg);
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

		this._wrappedAsset.enrich(function() {
			self._imageSrc = [];
			self._imageSrc.push(self._wrappedAsset.promoImageURL);
			self._imageSrc.push(self._wrappedAsset.channelLogo);
			superClass.prototype.load.call(self);
		});
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

	return EventAssetTile;

}());

