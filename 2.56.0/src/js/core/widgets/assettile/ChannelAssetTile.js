var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.ChannelAssetTile = ( function() {

	var logger = $U.core.Logger.getLogger("ChannelAssetTile");
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";

	/**
	 *
	 * @class $U.core.widgets.assettile.ChannelAssetTile
	 * @extends $U.core.widgets.assettile.AssetTile
	 * Object that represents a Channel Asset tile in the Browse system
	 * @constructor
	 * @param name
	 * @param container
	 * @param owner
	 * @param wrappedAsset
	 * @param tileWidth
	 * @param tileHeight
	 * @param aspectRatio
	 * @param type
	 */
	function ChannelAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(ChannelAssetTile, superClass);

	var proto = ChannelAssetTile.prototype;

	/**
	 * Load handler - Fetches the channel
	 */
	proto.load = function() {
		if (logger) {
			logger.log("load", this);
		}
		var textAndLogoContainer = document.createElement("div");
		var textStrap = document.createElement("div");
		var channelLogo = document.createElement("div");
		var channelLogoImg = document.createElement("img");
		var h1 = document.createElement("h1");
		var p;

		channelLogoImg.className = "centred-in-container-abs";
		$U.core.ImageLoader.loadImageAndFitToSize(channelLogoImg, [this._wrappedAsset.promoImageURL, DEFAULT_SQUARE_IMAGE], $U.core.ImageLoader.CENTRE, 50, 50);

		h1.appendChild(document.createTextNode(this._wrappedAsset.title));

		channelLogo.appendChild(channelLogoImg);
		textStrap.appendChild(h1);
		//add the LogicalChannelNumber if in gateway environment
		if ($U.core.Gateway.isGatewayAvailable()) {
			p = document.createElement("p");
			p.appendChild(document.createTextNode(this._wrappedAsset.logicalChannelNumber));
			textStrap.appendChild(p);
		}

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

		this._imageSrc = this._wrappedAsset.promoImageURL;
		superClass.prototype.load.call(this);
	};

	/**
	 * Handles the click handler for clicking on a channel Asset
	 * @private
	 * @param {Event} evt
	 */
	proto._clickHandler = function(evt) {
		var moreLikeThisItems = this._owner.getItems();
		// Create a BTVEventItem for the channel and show the media card screen
		$U.core.mediaitem.BTVEventItem.createForChannel(this._wrappedAsset, function(btvEventItem) {
			$U.core.View.showMediaCardScreen(btvEventItem, moreLikeThisItems);	
		});		
	};
	
	return ChannelAssetTile;

}());

