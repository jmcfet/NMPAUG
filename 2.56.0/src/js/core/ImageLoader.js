var $U = $U || {};
$U.core = $U.core || {};
$U.core.ImageLoader = ( function() {

	/**
	 * Implementation of Image loading functionality
	 * @class $U.core.ImageLoader
	 */

	var logger = $U.core.Logger.getLogger("ImageLoader");

	// Maximum difference in aspect ratios before image is clipped
	var CLOSE_ENOUGH = 0.01;

	var TOP_LEFT = {};
	var CENTRE = {};
	var VERTICAL_MIDDLE = {};

	var IS_IE = $U.core.Device.isIE10() || $U.core.Device.isIE11() || $U.core.Device.isIE9();
	var IE_IMAGE_TIMEOUT = 5000;

	// The attribute to use for the image id
	var ID_ATTRIBUTE = "data-id-ImageLoader";

	var resolveURLTag = null;

	// The next image id to use
	var imageCount = 0;

	var imageInstanceData = {};

	/** Filters the src Array so empty/null/undefined etc are not used
	 * @param {Array} srcArray The array of src elements to be filtered
	 * @return {Array} The filtered array
	 * */
	function _filterSrcArray(srcArray) {
		var filteredArray = [];
		for (var i = 0; i < srcArray.length; i++) {
			switch(srcArray[i]) {
			case "" :
			case null :
			case undefined :
				break;
			default:
				filteredArray.push(srcArray[i]);
				break;
			}
		}
		return filteredArray;
	}

	/** Uses a captive Anchor tag and its href attribute to convert any url to an absolute (app-relative) url.
	 * E.g. "/images/noimage.png" becomes "http://this.server.com/images/noimage.png".  Absolute URLs for other servers remain unchanged.
	 * @param {String} srcUrl Url to make absolute
	 * @return {String} Absolute url
	 */
	function _resolveImageURL(srcUrl) {
		if (resolveURLTag === null) {
			resolveURLTag = document.createElement('a');
		}
		resolveURLTag.href = srcUrl;
		return resolveURLTag.href;
	}

	/**
	 * Loads the given image and fits it to a specified target height/width
	 * @param {Object} image
	 * @param {Array} src Array of images, most important first, then fallback images as required.
	 * @param {Object} position
	 * @param {number} targetWidth
	 * @param {number} targetHeight
	 */
	function loadImageAndFitToSize(image, src, position, targetWidth, targetHeight) {
		if (!( src instanceof Array)) {
			src = [src];
		} else {
			src = _filterSrcArray(src);
		}
		var s = src.shift();
		var imageData = {
			type : "fit",
			image : image,
			position : position,
			targetWidth : targetWidth,
			targetHeight : targetHeight,
			failureCallback : createFailureFitToSize(image, src, position, targetWidth, targetHeight)
		};

		loadImage(image, s, imageData);
	}

	/**
	 * Looped callback for loadImageAndFitToSize() that is used to loop over fallback images in the src array.
	 * @param {Object} image
	 * @param {Array} src Array of images, most important first, then fallback images as required.
	 * @param {Object} position
	 * @param {number} targetWidth
	 * @param {number} targetHeight
	 */
	function createFailureFitToSize(image, src, position, targetWidth, targetHeight) {
		var result;
		var s = src.slice(0);
		if (s.length > 0) {
			result = function(callbackData) {
				loadImageAndFitToSize(image, s, position, targetWidth, targetHeight);
			};
		}
		return result;
	}

	/**
	 * Loads a given image with callback functionality
	 * @param {Object} image
	 * @param {Array} src Array of images, most important first, then fallback images as required.
	 * @param {Function} successCallback
	 * @param {Function} failureCallback
	 * @param {Object} callbackData
	 */
	function loadImageAndCallback(image, src, successCallback, failureCallback, callbackData) {
		if (!( src instanceof Array)) {
			src = [src];
		} else {
			src = _filterSrcArray(src);
		}
		var s = src.shift();
		var imageData = {
			type : "callback",
			image : image,
			successCallback : successCallback,
			failureCallback : createFailureCallback(image, src, successCallback, failureCallback, callbackData),
			callbackData : callbackData
		};

		loadImage(image, s, imageData);
	}

	/**
	 * Looped callback for loadImageAndCallback() that is used to loop over fallback images in the src array.
	 * @param {Object} image
	 * @param {Array} src Array of images, most important first, then fallback images as required.
	 * @param {Function} successCallback
	 * @param {Function} failureCallback
	 * @param {Object} callbackData
	 */
	function createFailureCallback(image, src, successCallback, failureCallback, callbackData) {
		var result;
		var s = src.slice(0);
		if (s.length > 0) {
			result = function(callbackData) {
				loadImageAndCallback(image, s, successCallback, failureCallback, callbackData);
			};
		} else {
			result = function(callbackData) {
				if (failureCallback) {
					if (callbackData) {
						failureCallback(callbackData);
					}
				} else {
					successCallback(callbackData);
				}
			};
		}
		return result;
	}

	/**
	 * Loads the given image
	 * @private
	 * @param {Object} image
	 * @param {string} src
	 * @param {Object} imageData
	 */
	function loadImage(image, src, imageData) {
		var resovledURL = _resolveImageURL(src);

		if (resovledURL !== image.src && encodeURI(resovledURL) !== image.src) {
			$U.core.util.HtmlHelper.setVisibilityHidden(image);
			image.setAttribute(ID_ATTRIBUTE, imageCount);
			imageInstanceData[imageCount++] = imageData;
			image.addEventListener("load", handleImageLoad);
			image.src = src;

			if (IS_IE) {
				imageData.timeoutRef = window.setTimeout(handleImageError.bind(image), IE_IMAGE_TIMEOUT);
			} else {
				image.addEventListener("error", handleImageError);
			}

		} else {
			$U.core.util.HtmlHelper.setVisibilityInherit(image);
		}
	}

	/**
	 * Handles image loading, deciding whether to fit to size or callback
	 * @private
	 */
	function handleImageLoad() {
		var id = this.getAttribute(ID_ATTRIBUTE);
		var imageData = imageInstanceData[id];

		if (!imageData) { return; }

		$U.core.util.HtmlHelper.setVisibilityInherit(imageData.image);

		switch (imageData.type) {
		case "fit":
			setImageSize(imageData.image, imageData.position, imageData.targetWidth, imageData.targetHeight);
			break;
		case "callback":
			imageData.successCallback(imageData.callbackData);
			break;
		}

		forgetImageInstance(id);
	}

	/**
	 * Handles image errors
	 * @private
	 */

	function handleImageError() {
		var id = this.getAttribute(ID_ATTRIBUTE);
		var imageData = imageInstanceData[id];

		if (!imageData) { return; }

		switch (imageData.type) {
		case "fit":
			if (imageData.failureCallback) {
				setTimeout(function() {
					imageData.failureCallback();
				}, 0);
			} else {
				setTimeout(function() {
					imageData.successCallback();
				}, 0);
			}
			break;
		case "callback":
			if (imageData.failureCallback) {
				setTimeout(function() {
					imageData.failureCallback(imageData.callbackData);
				},0);
			} else {
				setTimeout(function() {
					imageData.successCallback(imageData.callbackData);
				}, 0);
			}
			break;
		}
		forgetImageInstance(id);
	}

	/**
	 * Removes the image
	 * @private
	 * @param {Object} id
	 */
	function forgetImageInstance(id) {
		var image = imageInstanceData[id].image;
		if (IS_IE) {
			//Fix for bug in IE!!
			window.clearTimeout(imageInstanceData[id].timeoutRef);
		} else {
			image.removeEventListener("error", handleImageError);
		}
		image.removeEventListener("load", handleImageLoad);
		delete imageInstanceData[id];
	}

	/**
	 * Sets the image size to the target size
	 * @param {Object} image
	 * @param {Object} position
	 * @param {number} targetWidth
	 * @param {number} targetHeight
	 */
	function setImageSize(image, position, targetWidth, targetHeight) {
		var naturalAspectRatio = image.naturalWidth / image.naturalHeight;
		var targetAspectRatio = targetWidth / targetHeight;
		var imageW, imageH;

		// TODO: use a percentage
		if (Math.abs(targetAspectRatio - naturalAspectRatio) < CLOSE_ENOUGH) {
			imageW = targetWidth;
			imageH = targetHeight;

		} else {
			if (targetAspectRatio > naturalAspectRatio) {
				// Image is too tall
				imageH = targetHeight;
				imageW = Math.round(imageH * naturalAspectRatio);
			} else {
				// Image is too wide
				imageW = targetWidth;
				imageH = Math.round(imageW / naturalAspectRatio);
			}
		}

		image.width = imageW;
		image.height = imageH;

		if (position === CENTRE) {
			image.style.marginLeft = -Math.round(imageW / 2) + "px";
			image.style.marginTop = -Math.round(imageH / 2) + "px";
		} else if (position === VERTICAL_MIDDLE) {
			image.style.marginTop = Math.round((targetHeight - imageH) / 2) + "px";
		}
	}

	/**
	 * Function to retrieve the URL to a given assets promotional image from the JSFW, and return it via callback to a receiving function that will then use the image.
	 * @param {Object} asset
	 * @param {Function} callback
	 */
	function getPromoImage(asset, callback) {
		var promoImageURL = asset.promoImageURL;
		if ( typeof promoImageURL === "function") {
			promoImageURL(callback);
		} else {
			callback(promoImageURL);
		}
	}

	return {
		TOP_LEFT : TOP_LEFT,
		CENTRE : CENTRE,
		VERTICAL_MIDDLE : VERTICAL_MIDDLE,
		loadImageAndFitToSize : loadImageAndFitToSize,
		loadImageAndCallback : loadImageAndCallback,
		setImageSize : setImageSize,
		getPromoImage : getPromoImage
	};

}());

