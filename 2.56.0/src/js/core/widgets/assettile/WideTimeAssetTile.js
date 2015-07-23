var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.WideTimeAssetTile2 = ( function() {
	var instanceId = 0;
	var instances = [];
	var STATUS_TYPE = {
		LOADING : { name : "LOADING"},
		SUCCESS : { name : "SUCCESS"},
		FAILURE : { name :"FAILURE"}
	};
	var ID_ATTRIBUTE = "data-id-AssetTile";
	var logger = $U.core.Logger.getLogger("ImageAssetTile");

	/**
	 * Object representing a wide time stamped EventAssetTile. This tile also shows the event time in the top section.
	 * @class $U.core.widgets.assettile.WideTimeAssetTile
	 * @constructor
	 * Build an Asset tile
	 * @param name
	 * @param container
	 * @param owner
	 * @param wrappedAsset
	 * @param tileWidth
	 * @param tileHeight
	 * @param aspectRatio
	 * @param type
	 * @param imageSrc
	 * @param clickHandler function that is executed when a tile is clicked.
	 * @param isBlocked flag indicating if the tile is blocked due to parental ratings
	 */
	function WideTimeAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc, clickHandler, isBlocked) {
		this.clickHandler = clickHandler;
		this._blocked = isBlocked;

		this._name = name;
		this._container = container;
		this._owner = owner;
		this._wrappedAsset = wrappedAsset;
		this._tileWidth = tileWidth;
		this._tileHeight = tileHeight;
		this._aspectRatio = aspectRatio;
		this._type = type;
		this._searchDecorationsAdded = false;

		$U.destroyList.push(this);

		this._placeholder = document.createElement("div");
		this._leftDiv = document.createElement("div");
		this._rightDiv = document.createElement("div");
		this._placeholder.className = "asset-item-placeholder-load";

		this._leftDiv.appendChild(this._placeholder);

		this._leftDiv.className = "wide-tile-left";
		this._rightDiv.className = "wide-tile-right";

		this._container.appendChild(this._leftDiv);
		this._container.appendChild(this._rightDiv);

		this._status = STATUS_TYPE.LOADING;

		this._instanceId = instanceId;
		this._container.setAttribute(ID_ATTRIBUTE, instanceId);
		this._container.addEventListener("click", WideTimeAssetTile._clickHandler);

		instances[instanceId++] = this;

		this._imageSrc = imageSrc;
		this._image = document.createElement("img");
		this._placeholder.appendChild(this._image);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(WideTimeAssetTile, superClass);

	/**
	 * Master click handler
	 */
	WideTimeAssetTile._clickHandler = function(evt) {
		var instanceId = evt.currentTarget.getAttribute(ID_ATTRIBUTE);
		var assetTile = instances[instanceId];
		assetTile._clickHandler(evt);
	};

	/**
	 * Click handler for individual asset tiles
	 * @private
	 */
	WideTimeAssetTile.prototype._clickHandler = function(evt) {
		evt.stopPropagation();
		this.clickHandler(this);
	};

	/**
	 * Destroys references that cause memory leak.
	 * This AssetTile must be removed from the instances array.
	 */
	WideTimeAssetTile.prototype.destroy = function() {
		delete instances[this._instanceId];
	};

	/**
	 * Override the superclass load method.
	 */
	WideTimeAssetTile.prototype.load = function() {
		var self = this;
		var IMAGES = {
			STANDARD: {
				PROMO: self._wrappedAsset.promoImageURL,
				CHN: self._wrappedAsset.channelLogo
			},
			BLOCKED: {
				EMPTY: "",
				BLK1: "images/blocked_landscape_2.png"
			}
		};

		var standardImageSources = [IMAGES.STANDARD.PROMO, IMAGES.STANDARD.CHN];
		var blockedImageSources = [IMAGES.BLOCKED.BLK1];
		var textContainer = document.createElement("div");
		var titleString = this._blocked ? $U.core.util.StringHelper.getString("txtTitleBlocked") : this._wrappedAsset.title;
		var textHeading = document.createElement("h1");
		var textTime = document.createElement("p");

		textHeading.appendChild(document.createTextNode(titleString));
		textContainer.appendChild(textHeading);

		textTime.appendChild(document.createTextNode(this.getTimeString(this._wrappedAsset.startTime, this._wrappedAsset.endTime)));
		textContainer.appendChild(textTime);
		this._textTime = textTime;

		if (this._blocked) {
			textContainer.className = "wide-tile-text mc-blocked-tile";
		} else {
			if (this._wrappedAsset.subscribed) {
				textContainer.className = "wide-tile-text";
			} else {
				textContainer.className = "wide-tile-text unsubscribed-event";
			}
		}

		this._rightDiv.appendChild(textContainer);
		this._wrappedAsset.enrich(function() {
			var IMAGES = {
				STANDARD: {
					PROMO: self._wrappedAsset.promoImageURL,
					CHN: self._wrappedAsset.channelLogo
				},
				BLOCKED: {
					EMPTY: "",
					BLK1: "images/blocked_landscape_2.png"
				}
			};
			var standardImageSources = [IMAGES.STANDARD.PROMO, IMAGES.STANDARD.CHN];
			var blockedImageSources = [IMAGES.BLOCKED.BLK1];
			self._imageSrc = self._blocked ? blockedImageSources : standardImageSources;
			superClass.prototype.load.call(self);
		});
	};

	/**
	 * Formats two dates into a start time - end time string
	 */
	WideTimeAssetTile.prototype.getTimeString = function(startTime, endTime) {
		var timeText = "";
		if (startTime && endTime) {
			timeText = ($U.core.util.Formatter.formatTime(new Date(startTime)));
		}
		return timeText;
	};

	/**
	 * Sets the provided heading on the current tile, along with the event start time
	 */
	WideTimeAssetTile.prototype.setHeading = function(heading) {
		while (this._textTime.firstChild) {
			this._textTime.removeChild(this._textTime.firstChild);
		}
		var headingString = heading ? heading + " " : "";
		this._textTime.appendChild(document.createTextNode(headingString + this.getTimeString(this._wrappedAsset.startTime, this._wrappedAsset.endTime)));
	}; 

	return WideTimeAssetTile;
}());


