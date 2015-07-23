var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.TimeAssetTile = ( function() {
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";
	/**
	 * Object representing a time stamped EventAssetTile. This tile also shows the event time in the top section.
	 * @class $U.core.widgets.assettile.TimeAssetTile
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
	function TimeAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc, clickHandler, isBlocked) {
		this.clickHandler = clickHandler;
		this._blocked = isBlocked;
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc);
	}

	var superClass = $U.core.widgets.assettile.ImageAssetTile;
	$N.apps.util.Util.extend(TimeAssetTile, superClass);

	/**
	 * Override the superclass _clickHandler method. Executes the click handler provided in the constructor
	 * @private
	 */
	TimeAssetTile.prototype._clickHandler = function(evt) {
		evt.stopPropagation();
		this.clickHandler(this);
	};

	/**
	 * Override the superclass load method.
	 */
	TimeAssetTile.prototype.load = function() {
		var self = this;
		var timeContainer = document.createElement("div");
		var timeH1 = document.createElement("h1");
		var textContainer = document.createElement("div");
		var title = document.createElement("h1");
		var titleString = this._blocked ? $U.core.util.StringHelper.getString("txtTitleBlocked") : this._wrappedAsset.title;

		timeH1.appendChild(document.createTextNode(this.getTimeString(this._wrappedAsset.startTime, this._wrappedAsset.endTime)));
		this._timeHeading = timeH1;
		timeContainer.appendChild(timeH1);
		title.appendChild(document.createTextNode(titleString));
		textContainer.appendChild(title);

		if (this._blocked) {
			timeContainer.className = "time-container mc-blocked-tile";
			textContainer.className = "text-container mc-blocked-tile";
		} else {
			timeContainer.className = "time-container";
			if (this._wrappedAsset.subscribed) {
				textContainer.className = "text-container";
			} else {
				textContainer.className = "text-container unsubscribed-event";
			}
		}
		this._container.appendChild(timeContainer);
		this._container.appendChild(textContainer);

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
	TimeAssetTile.prototype.getTimeString = function(startTime, endTime) {
		var timeText = "";
		if (startTime && endTime) {
			timeText += ($U.core.util.Formatter.formatTime(new Date(startTime)));
		}
		return timeText;
	};

	/**
	 * Sets the provided heading on the current tile, along with the event start time
	 */
	TimeAssetTile.prototype.setHeading = function(heading) {
		while (this._timeHeading.firstChild) {
			this._timeHeading.removeChild(this._timeHeading.firstChild);
		}
		var headingString = heading ? heading + " " : "";
		this._timeHeading.appendChild(document.createTextNode(headingString + this.getTimeString(this._wrappedAsset.startTime, this._wrappedAsset.endTime)));
	};
	return TimeAssetTile;
}());

