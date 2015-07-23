/**
 * The InfoCard is responsible for showing meta information of a $U.core.mediaItem.MediaItem
 *
 * @class $U.mediacard.InfoCard
 * @template
 * @constructor
 * Create a new InfoCard
 * @param {HTMLElement} parent - the html element which contains the info card
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.InfoCard = ( function() {

	var FALLBACK_IMAGE_PATH = "images/nagra_logo_large.jpg";

	var DEFAULT_PORTRAIT_IMAGE = "images/missing_portrait.png";
	var DEFAULT_LANDSCAPE_IMAGE = "images/missing_landscape.png";
	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";
	var DEFAULT_LANDSCAPE_IMAGE_PVR = "images/missing_landscape_pvr.png";
	var DEFAULT_SERIES_IMAGE = "images/series_recording.png";
	var DEFAULT_RECORDING_IMAGE = "images/current_recording.png";
	var DEFAULT_TIME_RECORDING_IMAGE = "images/timebased_recording.png";
	var DEFAULT_MISSED_RECORDING_IMAGE = "images/missed_recording.png";

	var proto;

	var logger = $U.core.Logger.getLogger();

	function InfoCard(parent) {
		var that = this;
		// the DOM element that contains the info card
		this._parentEl = parent;
		// Container for blured image effect which is used for an un-purchased asset whose poster is centred
		this._blurImageContainer = this._createDiv("mc-blur-image-container", this._parentEl, "blurImageContainer");
		//container for the media image
		this._imgContainer = this._createDiv("media-image-container", this._parentEl, "mediaImageContainer");
		// the media image_logoImgb
		this._mediaImg = this._createEl("img", "mc-media-image", this._imgContainer, "mediaImage");
		// Scroller container for meta information
		this._metaInfoScrollContainer = this._createDiv("meta-info-scroll-container", this._parentEl, "metaInfoScrollContainer");
		//container for title, logo, duration etc.
		this._metaInfoContainer = this._createDiv("meta-info-container", this._metaInfoScrollContainer, "metaInfoContainer");
		// DOM element for a channel logo and name
		this._channelContainerEl = this._createEl("div", "mc-channel-container", this._metaInfoContainer);
		// DOM element for the img
		this._channelLogoImg = this._createEl("img", "mc-channel-logo", this._channelContainerEl);
		//The channel name
		this._channelNameEl = this._createEl("div", "mc-channel-name", this._channelContainerEl);
		// DOM element to contain the title
		this._titleContainerEl = this._createEl("h1", "mc-title", this._metaInfoContainer);

		this._titleEl = this._createEl("span", "", this._titleContainerEl, "metaInfoTitle");

		this._parentalRatingEl = this._createEl("span", "", this._titleContainerEl, "metaInfoParentalRating");

		// DOM element that contains the gateway schedule recording status images
		this._recordingLogoImg = this._createEl("img", "", this._titleContainerEl);

		// DOM element that contains the timing, duration and clock icon
		this._timingContainer = this._createDiv("timing-container", this._metaInfoContainer);
		// DOM element that contains the clock icon
		this._clockIcon = this._createEl("span", "icon-time", this._timingContainer);
		// DOM elements for the date and time of BTV Events
		this._dateTimeEl = this._createEl("span", "dateTime", this._timingContainer);
		// the DOM element to contain the duration of the mediaItem
		this._durationEl = this._createEl("span", "duration", this._timingContainer);
		// DOM element that contains the expiry time
		this._expiryContainer = this._createDiv("expiry-container hide", this._metaInfoContainer);
		//The expiry time
		this._expireDurationEl = this._createEl("span", "expiry-time", this._expiryContainer);
		//The star rating container
		this._starContainer = this._createDiv("star-rating-container hide", this._metaInfoContainer);
		//The episode number
		this._episodeEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoEpisodeNumber");
		// DOM element to contain the description
		this._descriptionEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoDescription");
		// DOM element to contain the synopsis
		this._synopsisEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoSynopsis");
		// DOM element to contain the language
		this._languageEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoLanguage");
		// DOM element to contain the cast list
		this._actorsEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoActors");
		// DOM element to contain the director list
		this._directorsEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoDirectors");
		// DOM element to contain the category list
		this._categoriesEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoCategories");
		// DOM element to contain the year
		this._yearEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoYear");
		// DOM element to contain the lowest price
		this._lowestPriceEl = this._createEl("p", "", this._metaInfoContainer, "metaInfoLowestPrice");
		// Default image for blocked items
		this._blockedPlaceHolder = "images/blocked_landscape.jpg";

		this._currentImageSource = null;
		// Text strap at the bottom of the promo image
		this._textStrapEl = $U.core.util.DomEl.createDiv().setId("textStrapContainer").setClassName("mc-text-strap hide").attachTo(this._imgContainer).asElement();

		//controller container for the video controls
		this._videoControlsEl = this._createDiv("mc-video-controls", this._parentEl, "videoControls");

	}

	/**
	 * Factory method to create the type of Info card dependant on device.
	 * @param {string} containerEl - the element which will hold everything related to the info card
	 */
	InfoCard.create = function(containerEl) {
		var r;
		switch ($U.core.Device.getFF()) {
		case $U.core.Device.FF.PHONE:
			r = new $U.mediaCard.PhoneInfoCard(containerEl);
			break;
		case $U.core.Device.FF.TABLET:
			r = new $U.mediaCard.TabletInfoCard(containerEl);
			break;
		case $U.core.Device.FF.DESKTOP:
			r = new $U.mediaCard.DesktopInfoCard(containerEl);
			break;
		}
		return r;
	};

	InfoCard.PORTRAIT = 2 / 3;
	InfoCard.LANDSCAPE = 16 / 9;

	/* short hand for prototype */
	proto = InfoCard.prototype;

	/**
	 * short hand to helper method which calls $U.core.util.DomEl.createDiv
	 * @param {string} className - the className of the HTML element to be created
	 * @param {HTMLElement} attachTo - the HTML element to attach itself to
	 * @param {string} id - the HTMLElements ID.
	 * @return {HTMLElement}
	 */
	proto._createDiv = function(className, attachTo, id) {
		var elementID = id || "";
		return $U.core.util.DomEl.createDiv().setClassName(className).attachTo(attachTo).setId(elementID).asElement();
	};
	/**
	 * short hand to helper method which calls $U.core.util.DomEl.createEl
	 * @param {string} el - The element type to be created
	 * @param {string} className - the className of the HTML element to be created
	 * @param {HTMLElement} attachTo - the HTML element to attach itself to
	 * @return {HTMLElement}
	 */
	proto._createEl = function(el, className, attachTo, id) {
		var elementID = id || "";
		return $U.core.util.DomEl.createEl(el).setClassName(className).attachTo(attachTo).setId(elementID).asElement();
	};

	/**
	 * short hand helper method which calls $U.core.util.HtmlHelper.setHeight
	 * @param {HTMLElement} el - the HTML element to apply the height
	 * @param {number} h - the height
	 * @private
	 */
	proto._setHeight = function(el, h) {
		$U.core.util.HtmlHelper.setHeight(el, h);
	};

	/**
	 * short hand helper method which calls $U.core.util.HtmlHelper.setWidth
	 * @param {HTMLElement} el - the HTML element to apply the width
	 * @param {number} w - the width
	 * @private
	 */
	proto._setWidth = function(el, w) {
		$U.core.util.HtmlHelper.setWidth(el, w);
	};

	/**
	 * Sets the event to be blocked (it has exceeded the parental rating set in the application)
	 */
	proto.setBlocked = function() {
		var showImg = false;
		this.deactivate();
		this._setTitle($U.core.util.StringHelper.getString("txtTitleBlocked"));
		this._setDescription($U.core.util.StringHelper.getString("txtDescBlocked"));
		this._setSynopsis();
		this._setImage(this._blockedPlaceHolder);
	};

	/**
	 * Sets the synopsis to text explaining the event is not subscribed to.
	 */
	proto.setUnsubscribed = function(type) {

		switch (type) {
		case $U.core.mediaitem.MediaItemType.CATCHUP:
			break;
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
		case $U.core.mediaitem.MediaItemType.NPVR:
			this._showTextStrap($U.core.util.StringHelper.getString("txtUnsubscribedStrap"));
			this._setSynopsis($U.core.util.StringHelper.getString("txtUnsubscribed"));
			break;
		case $U.core.mediaitem.MediaItemType.VOD:
			this._showTextStrap($U.core.util.StringHelper.getString("txtUnsubscribedStrapVOD"));
			this._setSynopsis($U.core.util.StringHelper.getString("txtUnsubscribedVOD"));
			break;
		}

	};

	/** Populates the info card with all it's meta information (images, description, title etc.)
	 *@private
	 */
	proto._populate = function() {
		var that = this,
			mi = this._mediaItem,
			imgArray = [],
			retrieveStarRating = function(rating) {
				that._setStarRating(rating);
			};

		/* Parental rating - if allowed create buttons */
		if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(mi.rating)) {
			this._setTitle(mi.title);
			this._setDuration(mi.durationInSeconds);
			this._setDescription(mi.description);

			if ($U.core.Configuration.RECOMMENDATIONS.STARS) {
				// set the star rating
				$U.core.menudata.ContentDiscovery.getRatingByAccount(retrieveStarRating, this._mediaItem);
				$U.mediaCard.StarRatingDialog.registerRatingChangeListener(this, this._setStarRating);
			}

			// Don't show the same thing twice!
			if (mi.synopsis === mi.description) {
				this._setSynopsis("");
			} else {
				this._setSynopsis(mi.synopsis);
			}
		}

		switch (mi.type) {

		case $U.core.mediaitem.MediaItemType.VOD:

			if (mi.isAssetPlayable) {
				imgArray.push(mi.promoImageURL);
				imgArray.push(DEFAULT_LANDSCAPE_IMAGE);
			} else {
				imgArray.push(mi.coverImageURL);
				imgArray.push(DEFAULT_PORTRAIT_IMAGE);
			}

			if (!mi.purchaseOptions.length && mi.subscriptionOptions.length && !mi.isAssetPlayable) {
				this.setUnsubscribed($U.core.mediaitem.MediaItemType.VOD);
			}

			// Set the parental rating class so that the correct rating image is shown
			this._setRatingCssClass(mi);

			this._setImage(imgArray);
			if (!this._mediaItem.isAnyProductFree) {
				this._setExpiryDuration(this.getExpiryDate(mi.expiryDate));
			}
			this._setEpisode(mi.episodeNumber);
			this._setLanguage(mi._data.Language);
			this._setActors(mi.actors);
			this._setDirectors(mi.directors);
			this._setCategories(mi._data.Categories);
			this._setYear(mi.year);
			this._setLowestPrice(mi.lowestPriceObject, mi.purchaseOptions.length);
			//don't want a channel logo here
			$U.core.util.HtmlHelper.setDisplayNone(this._channelContainerEl);
			break;

		case $U.core.mediaitem.MediaItemType.BTVEVENT:
		case $U.core.mediaitem.MediaItemType.NPVR:
			that = this;
			mi.enrich(function() {
				that._setImage([mi.promoImageURL, mi.channelLogo, DEFAULT_LANDSCAPE_IMAGE]);
			});
			if (mi._channel) {
				this._setChannel(mi.channelLogo, mi._channel.title);
			}
			// Set the timings
			this._setTiming(mi.startTime, mi.endTime);
			this._setEpisode(mi.episodeNumber);
			this._setActors(mi.actors);
			this._setDirectors(mi.directors);
			this._setYear(mi.year);

			$U.core.util.HtmlHelper.setDisplayInlineBlock(this._dateTimeEl);

			// Set the parental rating class so that the correct rating image is shown
			this._setRatingCssClass(mi);

			if (!mi.subscribed) {
				this.setUnsubscribed($U.core.mediaitem.MediaItemType.BTVEVENT);
			}

			break;

		case $U.core.mediaitem.MediaItemType.CATCHUP:

			if (mi.isAssetPlayable) {
				imgArray.push(mi.promoImageURL);
				imgArray.push(mi.channelLogo);
				imgArray.push(DEFAULT_LANDSCAPE_IMAGE);
			} else {
				imgArray.push(mi.coverImageURL);
				imgArray.push(mi.channelLogo);
				imgArray.push(DEFAULT_PORTRAIT_IMAGE);
			}

			this._setImage(imgArray);

			this._setChannel(mi.channelLogo, mi.channel ? mi.channel.title : null);
			// Set the timings
			this._setTiming(mi.startTime, mi.endTime);
			$U.core.util.HtmlHelper.setDisplayInlineBlock(this._dateTimeEl);

			// Set the parental rating class so that the correct rating image is shown
			this._setRatingCssClass(mi);

			if (!mi.isAssetPlayable) {
				this.setUnsubscribed($U.core.mediaitem.MediaItemType.CATCHUP);
			}

			break;

		case $U.core.mediaitem.MediaItemType.PVR_SCHEDULED:
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING:

			this._setImage([mi.promoImageURL, DEFAULT_LANDSCAPE_IMAGE_PVR]);
			if (mi.endTime) {
				this._setTiming(mi.startTime, mi.endTime);
			} else {
				this._setTiming(mi.startTime);
			}
			$U.core.util.HtmlHelper.setDisplayInlineBlock(this._dateTimeEl);
			if (mi.channel) {
				this._setChannel(mi.channelLogo, mi.channel.title);
			} else {
				this._setChannel(mi.channelLogo, "");
			}
			this._setEpisode(mi.episodeId);
			// Set the parental rating class so that the correct rating image is shown
			this._setRatingCssClass(mi);

			if (mi._data._data.taskState && mi._data._data.taskState.phase === "ACTIVE") {
				this._setRecordingImge([DEFAULT_RECORDING_IMAGE]);
			} else if (mi.recordingType === 1) {
				this._setRecordingImge([DEFAULT_SERIES_IMAGE]);
			} else if (mi._data._data['class'] === "OBJECT.RECORDSCHEDULE.DIRECT.CDSNONEPG") {
				this._setRecordingImge([DEFAULT_TIME_RECORDING_IMAGE]);
			} else if (mi._data._data.taskState && mi._data._data.taskState.text === "DONE.EMPTY") {
				this._setRecordingImge([DEFAULT_MISSED_RECORDING_IMAGE]);
			}
			break;
		}

		if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(mi)) {
			this._showTextStrap($U.core.util.StringHelper.getString("txtNowPlayingOn", {
				DEVICENAME : $U.core.Gateway.getDeviceName()
			}));
		} else {
			this._hideTextStrap();
		}

	};
	/**
	 * calls set layout method
	 */
	proto.resizeHandler = function() {
		this._setLayout();
	};
	/**
	 * Entry method to the info card which is responsible for populating
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item used to activate the info card
	 */
	proto.activate = function(mediaItem) {
		this._mediaItem = mediaItem;
		this._populate();
		this._metaInfoScrollContainer.scrollTop = 0;
	};

	proto.deactivate = function() {
		this._setTitle();
		this._setDuration();
		this._setDescription();
		this._setSynopsis();
		this._hideImage();
		this._setExpiryDuration();
		this._setChannel();
		this._setLanguage();
		this._setEpisode();
		this._setActors();
		this._setDirectors();
		this._setCategories();
		this._setYear();
		this._setLowestPrice();
		this._setTiming();
		this._setStarRating();
		this._hideTextStrap();
		this._setRatingCssClass();
		this._setRecordingImge();
	};

	/**
	 * Sets the title of the asset
	 * @param {string} title - the title of the asset
	 * @private
	 */
	proto._setTitle = function(title) {
		var text = title || "";
		this._titleEl.textContent = text;
	};
	/**
	 * Sets the description of the asset
	 * @param {string} description - the text description
	 * @private
	 */
	proto._setDescription = function(description) {
		var text = description || "";
		this._descriptionEl.textContent = text;
	};
	/**
	 * Sets the longer description of the asset
	 * @param {string} - the synopsis of the vod asset
	 * @private
	 */
	proto._setSynopsis = function(synopsis) {
		var text = synopsis || "";
		this._synopsisEl.textContent = text;
	};
	/**
	 * Sets the image source
	 * @param {Array} srcArray - the images url source array (fallbacks included)
	 * @private
	 */
	proto._setImage = function(src) {
		var flushStyle;
		var that = this;
		var showImage = function() {
			// As the image is hidden with display:none set it to display:block
			$U.core.util.HtmlHelper.setDisplayBlock(this.image);
			// make sure display block applied before changing opacity
			flushStyle = window.getComputedStyle(this.image).display;
			// Set the image opacity to 1
			that.setImageOpacity(1);
			
			if($U.core.Device.isCSSFilterProperty() && src.length) {
				that._blurImageContainer.style.backgroundImage = "url(" + src[0]  +")";
			}
		};
		
		this._blurImageContainer.style.backgroundColor = 'black';
		this._blurImageContainer.style.backgroundImage = "none";
		$U.core.ImageLoader.loadImageAndCallback(this._mediaImg, src, showImage, null, null);
	};
	
	proto._setRecordingImge = function(src) {
		if(src){
			$U.core.ImageLoader.loadImageAndFitToSize(this._recordingLogoImg, src, $U.core.ImageLoader.VERTICAL_MIDDLE, 55, 31);
			$U.core.util.HtmlHelper.setDisplayInlineBlock(this._recordingLogoImg);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._recordingLogoImg);
		}
	};

	/**
	 * Hide the image
	 */
	proto._hideImage = function() {
		this._mediaImg.setAttribute("src", "");
		// set the opacity to 0 which should fade out due to transition
		this.setImageOpacity(0);
		// set the display to none for the media image as we are switching between media assets
		$U.core.util.HtmlHelper.setDisplayNone(this._mediaImg);
	};

	/**
	 * Puts the correct number of filled stars into the star rating container
	 * @param {number} stars number of stars to add (can be a decimal)
	 */
	proto._setStarRating = function(stars) {
		if (logger) {
			logger.log("setStarRating", stars);
		}
		while (this._starContainer.firstChild) {
			this._starContainer.removeChild(this._starContainer.firstChild);
		}
		$U.core.util.HtmlHelper.setDisplayNone(this._starContainer);

		if (stars && stars >= 0.25) {
			var totalStars = 5,
				dblStars = stars * 2,
				fullStars = Math.floor(Math.round(dblStars) / 2),
				halfStar = Math.round(dblStars) % 2,
				i,
				starIcon;

			for (i = 0; i < totalStars; i++) {
				if(i < fullStars){
					starIcon = this._createEl("span", "icon-star", this._starContainer);
				} else if(i === fullStars && halfStar){
					starIcon = this._createEl("span", "icon-star-half-empty", this._starContainer);
				} else {
					starIcon = this._createEl("span", "icon-star-empty", this._starContainer);
				}
			}
			starIcon = this._createEl("span", "duration", this._starContainer);
			starIcon.textContent = "(" + stars.toFixed(2) + ")";
			$U.core.util.HtmlHelper.setDisplayBlock(this._starContainer);
			this._mediaItem.starRating = stars;
		}
	};

	/**
	 * Sets the duration of the asset
	 * @param {string} - the duration
	 * @private
	 */
	proto._setDuration = function(duration) {
		if (duration && duration > 0) {
			this._durationEl.textContent = $U.core.util.Formatter.formatSecondsToHours(duration);
			$U.core.util.HtmlHelper.setDisplayBlock(this._timingContainer);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._timingContainer);
		}
	};

	/**
	 * Sets the timing information of the asset (date/time of a BTV Event)
	 * @param {number} startTime Start time in milliseconds
	 * @param {number} endTime End time in milliseconds
	 * @private
	 */
	proto._setTiming = function(startTime, endTime) {

		if (startTime !== undefined && startTime !== Number.NEGATIVE_INFINITY) {
			if (endTime !== undefined && endTime !== Number.POSITIVE_INFINITY) {
				this._dateTimeEl.textContent = $U.core.util.Formatter.formatDate(new Date(startTime)) + " " + $U.core.util.Formatter.formatTime(new Date(startTime)) + "-" + $U.core.util.Formatter.formatTime(new Date(endTime)) + ", ";
			} else {
				this._dateTimeEl.textContent = $U.core.util.Formatter.formatDate(new Date(startTime)) + " " + $U.core.util.Formatter.formatTime(new Date(startTime)) + ", ";
			}
		} else {
			this._dateTimeEl.textContent = null;
		}
	};

	/**
	 * Sets the logo and the name of the channel
	 * @param {string} logoURL - the associated channel logo
	 * @param {string} name - name of the channel
	 * @private
	 */
	proto._setChannel = function(logoURL, name) {
		var logoSrc = logoURL || "";
		var text = name || "";

		$U.core.ImageLoader.loadImageAndFitToSize(this._channelLogoImg, [logoSrc, DEFAULT_SQUARE_IMAGE], $U.core.ImageLoader.VERTICAL_MIDDLE, 94, 42);
		this._channelNameEl.textContent = text;
		$U.core.util.HtmlHelper.setDisplayBlock(this._channelContainerEl);
	};

	proto._displayArrayElements = function(element, prefix, array) {
		var i,
			text = "",
			itemArray = array || [];

		if (itemArray.length > 0) {
			text = prefix + ": ";
			for ( i = 0; i < itemArray.length; i++) {
				text += itemArray[i];
				if (i < itemArray.length - 1) {
					text += ", ";
				}
			}
		}
		element.textContent = text;
		$U.core.util.HtmlHelper.setDisplayBlock(element);
	};

	/**
	 * Sets the actors for the event / asset
	 * @param {array} actors
	 * @private
	 */
	proto._setActors = function(actors) {
		this._displayArrayElements(this._actorsEl, $U.core.util.StringHelper.getString("txtActors"), actors);
	};

	/**
	 * Sets the directors for the event / asset
	 * @param {array} directors
	 * @private
	 */
	proto._setDirectors = function(directors) {
		var prefix;
		if (directors && directors.length && directors.length > 1) {
			prefix = $U.core.util.StringHelper.getString("txtDirectors");
		} else {
			prefix = $U.core.util.StringHelper.getString("txtDirector");
		}
		this._displayArrayElements(this._directorsEl, prefix, directors);
	};

	/**
	 * Sets the categories for the asset
	 * @param {array} categories
	 * @private
	 */
	proto._setCategories = function(categories) {
		var prefix;
		if (categories && categories.length && categories.length > 1) {
			prefix = $U.core.util.StringHelper.getString("txtGenres");
		} else {
			prefix = $U.core.util.StringHelper.getString("txtGenre");
		}
		this._displayArrayElements(this._categoriesEl, prefix, categories);
	};

	/**
	 * Sets the year of the asset
	 * @param {String} year
	 * @private
	 */
	proto._setYear = function(year) {
		var text = year || "";
		if (text > "") {
			this._yearEl.textContent = $U.core.util.StringHelper.getString("txtYear") + ": " + text;
			$U.core.util.HtmlHelper.setDisplayBlock(this._yearEl);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._yearEl);
		}
	};

	/**
	 * Sets the lowest price of the asset
	 * @param {Object} lowest price object
	 * @private
	 */
	proto._setLowestPrice = function(lowestPriceObject, purchaseOptionCount) {
		var getFormattedPrice = function(lowestPriceObject) {
			var price = lowestPriceObject.value,
				returnValue,
				formattedPrice,
				decimalSeparator = ".",
				arParts = String(price).split(decimalSeparator),
				intPart = arParts[0],
				decPart = (arParts.length > 1 ? arParts[1] : ''),
				priceLabel = purchaseOptionCount > 1 ? $U.core.util.StringHelper.getString("txtFrom") : $U.core.util.StringHelper.getString("txtPrice");

			decPart = (decPart + '00').substr(0, 2);
			formattedPrice = intPart + decimalSeparator + decPart;
			if (formattedPrice === "0.00") {
				returnValue = $U.core.util.StringHelper.getString("txtFree");
			} else {
				returnValue = priceLabel + ": " + $U.core.util.StringHelper.getString(lowestPriceObject.currency) + " " + formattedPrice;
			}
			return returnValue;
		};

		if (lowestPriceObject) {
			this._lowestPriceEl.textContent = getFormattedPrice(lowestPriceObject);
			$U.core.util.HtmlHelper.setDisplayBlock(this._lowestPriceEl);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._lowestPriceEl);
		}
	};

	/**
	 * Sets the episode of the event
	 * @param {String} episode
	 * @private
	 */
	proto._setEpisode = function(episode) {
		var text = episode || "";
		if (episode > "") {
			this._episodeEl.textContent = $U.core.util.StringHelper.getString("txtEpisode") + ": " + text;
			$U.core.util.HtmlHelper.setDisplayBlock(this._episodeEl);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._episodeEl);
		}
	};

	/**
	 * Sets the language of the asset
	 * @param {String} language
	 * @private
	 */
	proto._setLanguage = function(language) {
		var text = language || "";
		if (language > "") {
			this._languageEl.textContent = $U.core.util.StringHelper.getString("txtLanguage") + ": " + text;
			$U.core.util.HtmlHelper.setDisplayBlock(this._languageEl);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._languageEl);
		}
	};

	/**
	 * Puts the expiry duration into the expiry duration html element
	 * @param {string} expires - the time left before the TVOD asset expires
	 */
	proto._setExpiryDuration = function(expires) {
		var text = expires || "";
		if (text !== "") {
			this._expireDurationEl.textContent = $U.core.util.StringHelper.getString("txtExpires") + ": " + text;
			$U.core.util.HtmlHelper.setDisplayBlock(this._expiryContainer);
		} else {
			$U.core.util.HtmlHelper.setDisplayNone(this._expiryContainer);
		}
	};

	/**
	 * Displays a text strap along the bottom of the mediaImageContainer
	 * @param {String} strapText Text to display inside the textStrap
	 * @private
	 */
	proto._showTextStrap = function(strapText) {
		this._textStrapEl.textContent = strapText;
		$U.core.util.HtmlHelper.setDisplayBlock(this._textStrapEl);
	};

	/**
	 * Hides the text strap
	 * @private
	 */
	proto._hideTextStrap = function() {
		$U.core.util.HtmlHelper.setDisplayNone(this._textStrapEl);
	};

	/** Returns a HTML element that will be used to contain the assets image.
	 * @return {HTMLElement} HTML element that will contain the image but not the img element itself
	 */
	proto.getImageContainerEl = function() {
		return this._imgContainer;
	};

	/**
	 * Returns a HTML element that will used to contain all meta information for an asset.
	 * @return {HTMLElement} HTML element that will hold all the meta information of an asset
	 */
	proto.getMetaInfoContainerEl = function() {
		return this._metaInfoScrollContainer;
	};

	/**
	 * Sets the img aspect ration to either landscape or portrait
	 * @param {$U.mediaCard.InfoCard.ASPECT_R}
	 */
	proto.setImgAspectRatio = function(aspectR) {
		this._imgAspectRatio = aspectR;
	};

	/**
	 * @return {HTMLElement} an image HTML element that holds the related assets image
	 */
	proto.getCardImgEl = function() {
		return this._mediaImg;
	};

	/**
	 * returns the expiry time as a string
	 * @return {string} the period of time left before the TVOD asset expires.
	 */
	proto.getExpiryDate = function(expires) {
		return $U.core.util.Formatter.formatDuration(new Date(), expires);
	};

	/**
	 * set the expiration time of the TVOD asset after the purchase has taken place
	 */
	proto.setAvailableLayout = function() {
		if (!this._mediaItem.isAnyProductFree) {
			this._setExpiryDuration(this.getExpiryDate(this._mediaItem.expiryDate));
			// The call to action bar has different actions for pre/post purchase so update it
			$U.mediaCard.MediaCardController.updateCtab(this._mediaItem);
		}
	};

	/**
	 * If an asset becomes unavailable while we are on the media card screen we must set
	 * the layout to an unpurchased layout
	 */
	proto.setUnavailableLayout = function(fromAclRefresh) {
		// For unavailable assets we show the info card with it's movie poster
		this.setImgAspectRatio($U.mediaCard.InfoCard.PORTRAIT);
		// No expiry duration as item is unavailable for play back
		this._setExpiryDuration("");
		// The call to action bar has different actions for pre/post purchase so update it
		$U.mediaCard.MediaCardController.updateCtab(this._mediaItem);
		if (fromAclRefresh) {
			// Put the correct buttons back on the asset
			$U.mediaCard.MediaCardController.activateButtonOverlay(this._mediaItem);
		}
	};

	/**
	 * @return {HTMLElement} an HTML element that holds the video controls (this is only set in the desktop version)
	 */
	proto.getVideoControlsEl = function() {
		return this._videoControlsEl;
	};

	/**
	 * Sets the image opacity to a specific value
	 */
	proto.setImageOpacity = function(opacityVal) {
		var val;
		val = opacityVal.toString();
		this._mediaImg.style.opacity = val;
	};

	proto._setRatingCssClass = function(mediaItem) {
		if (mediaItem) {
			this._parentalRatingEl.className = $U.core.parentalcontrols.ParentalControls.getRatingImgCSSClass(mediaItem.rating);
		} else {
			this._parentalRatingEl.className = "";
		}
	};

	return InfoCard;

}());
