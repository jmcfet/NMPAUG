var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.ImageAssetTile = (function() {

	var logger = $U.core.Logger.getLogger("ImageAssetTile");

	var IMAGE_SIZE_TYPE = {
		FIT: {},
		FILL: {}
	};

	// Maximum difference in aspect ratios before image is clipped
	var CLOSE_ENOUGH = 0.01;

	var DEFAULT_PORTRAIT_IMAGE = "images/missing_portrait.png";
	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape.png";
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";

	/**
	 * @class $U.core.widgets.assettile.ImageAssetTile
	 * @extends $U.core.widgets.assettile.AssetTile
	 * Object that represents an Image Asset tile in the Browse system
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
	function ImageAssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type, imageSrc) {
		superClass.call(this, name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type);
		this._imageSrc = imageSrc;
		this._image = document.createElement("img");
		this._placeholder.appendChild(this._image);
	}

	var superClass = $U.core.widgets.assettile.AssetTile;
	$N.apps.util.Util.extend(ImageAssetTile, superClass);

	var proto = ImageAssetTile.prototype;

	/**
	 * Load handler - Fetches the image
	 */
	proto.load = function() {
		if (logger) {
			logger.log("load", this);
		}

		if (!(this._imageSrc instanceof Array)) {
			this._imageSrc = [this._imageSrc];
		}

		this._imageSrc.push(this.imageTypeForMissingImage());

		// Load the image
		$U.core.ImageLoader.loadImageAndCallback(this._image, this._imageSrc, superClass.loadSuccessCallback, superClass.loadFailureCallback, this);
	};

	/**
	 * Derives and returns the required image type to the caller
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

	/**
	 * Adds the remove button
	 * @param {Function} clickEvent what happens when the remove button is clicked
	 */
	proto.addRemoveButton = function(clickEvent) {
		this._container.appendChild(buttonToRemove(this._wrappedAsset, clickEvent));
	};

	/**
	 * Creates the HTML and event listener for a button which will be used to remove the asset from scroller
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item to remove
	 * @param {Function} clickEvent - what happens when the remove button is clicked
	 * @return HTMLElement removeButton
	 */
	var buttonToRemove = function(mediaItem, clickEvent) {
		var removeButton;
		var removeIcon;

		removeButton = document.createElement("button");
		removeIcon = document.createElement("i");

		removeButton.className = "asset-item-remove-button";
		removeIcon.className = "icon-remove icon-2x";

		removeButton.addEventListener("click", function(evt) {
			clickEvent(evt, mediaItem);
		});

		removeButton.appendChild(removeIcon);

		return removeButton;
	};

	/**
	 * Sets up the variables for the sizing of the image
	 * @param {number} width
	 * @param {number} height
	 */
	proto.setSize = function(width, height) {
		superClass.prototype.setSize.call(this, width, height);
		this._sizeImage();
	};

	/**
	 * Successful image load callback. Calculates the natural aspect ration of image and sets its size
	 * @private
	 */
	proto._loadSuccess = function() {
		// if (logger) {
		// logger.log("_loadSuccess", this);
		// }
		this._naturalAspectRatio = this._image.naturalWidth / this._image.naturalHeight;
		this._sizeImage();
		if (this._isDefaultImage()) {
			this._loadDefault();
		}
	};

	/**
	 * Failure image load callback
	 * @private
	 */
	proto._loadFailure = function() {
		// if (logger) {
		// logger.log("_loadFailure", this);
		// }
	};

	/**
	 * Default image load callback
	 * @private
	 */
	proto._loadDefault = function() {
		// if (logger) {
		// logger.log("_loadFailure", this);
		// }
	};

	proto._isDefaultImage = function(){
		return this._image.src.indexOf(DEFAULT_LANDSCAPE_IMAGE) > -1 || this._image.src.indexOf(DEFAULT_PORTRAIT_IMAGE) > -1 || this._image.src.indexOf(DEFAULT_SQUARE_IMAGE) > -1;
	};

	/**
	 * Set the size of the image
	 * @private
	 */
	proto._sizeImage = function() {
		if (this._imageSizeType === IMAGE_SIZE_TYPE.FIT) {
			this._sizeImageToFit();
		} else {
			this._sizeImageToFill();
		}
	};

	/**
	 * Set the size of the image so that it fits the container
	 * @private
	 */
	proto._sizeImageToFit = function() {};

	/**
	 * Set the size of the image so that it fills the container
	 * @private
	 */
	proto._sizeImageToFill = function() {

		if (this._status !== superClass.STATUS_TYPE.SUCCESS) {
			if (logger) {
				logger.log("_sizeImage", this + " skipped, _status is " + this._status.name);
			}
			return;
		}

		var imageW, imageH;
		var heightClip, topClip, bottomClip, widthClip, leftClip, rightClip;
		var aspectWidth = Math.round(this._tileHeight * this._aspectRatio);
		var marginL, marginT;
		var image = this._image;

		image.style.clip = "";
		image.style.position = "";
		image.style.margin = "";

		if (Math.abs(this._aspectRatio - this._naturalAspectRatio) < CLOSE_ENOUGH) {
			imageW = aspectWidth;
			imageH = this._tileHeight;

		} else {
			if (this._aspectRatio < this._naturalAspectRatio) {
				// Image is too wide (or landscape)
				imageW = aspectWidth;
				imageH = Math.round(imageW / this._naturalAspectRatio);
			} else {
				// Image is too tall
				imageH = this._tileHeight;
				imageW = Math.round(imageH * this._naturalAspectRatio);
			}
		}

		image.width = imageW;
		image.height = imageH;

		heightClip = imageH - this._tileHeight;
		topClip = Math.round(heightClip / 2);
		bottomClip = imageH - (heightClip - topClip);
		widthClip = imageW - aspectWidth;
		leftClip = Math.round(widthClip / 2);
		rightClip = imageW - (widthClip - leftClip);

		if (this._type === $U.core.widgets.assettile.AssetTile.TILE_TYPE.WIDE) {
			marginL = ((this._tileWidth / 2) - aspectWidth) / 2 - leftClip;
		} else {
			marginL = (this._tileWidth - aspectWidth) / 2 - leftClip;
		}
		marginT = (0 - topClip);

		image.style.position = "absolute";
		image.style.clip = "rect(" + topClip + "px," + rightClip + "px," + bottomClip + "px," + leftClip + "px)";

		// for it to hold a white background. This is used for a hover effect on desktop
		$U.core.util.HtmlHelper.setWidth(this._placeholder, imageW);
		$U.core.util.HtmlHelper.setHeight(this._placeholder, imageH);
		$U.core.util.HtmlHelper.setLeft(this._placeholder, marginL);
		$U.core.util.HtmlHelper.setTop(this._placeholder, marginT);

	};

	ImageAssetTile.IMAGE_SIZE_TYPE = IMAGE_SIZE_TYPE;
	return ImageAssetTile;

}());