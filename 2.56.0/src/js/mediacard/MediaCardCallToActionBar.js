/**
 * MediaCardCallToActionBar
 * Handles the construction of the call to action bar in mediacard and minimediacard.
 * @class $U.mediaCard.MediaCardCallToActionBar
 *
 * @constructor
 * @param {HTMLElement} container HTML container to put the action bar
 * @param {Function} callback Callback function to call when an action bar element is selected
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardCallToActionBar = ( function() {

	var proto;
	var DATA_ATTRIBUTE = "data-call-to-action-button";

	var logger = $U.core.Logger.getLogger("MediaCardCallToActionBar");

	//@formatter:off
	// ENUM of available buttons
	var BUTTON = {
		RECORD : {name : "record"},
		DOWNLOAD : {name : "download"},
		COLLECTION : {name : "collection"},
		REMIND : {name : "remind"},
		FAVOURITES_ADD : {name : "favourites"},
		FAVOURITES_REMOVE : {name : "favourites"},
		FAVOURITES_CHANNEL_ADD : {name : "favourites"},
		FAVOURITES_CHANNEL_REMOVE : {name : "favourites"},
		BUY : {name : "buy"},
		CHOOSE_SCREEN : {name : "screenChoice"},
		DELETE : {name : "delete"},
		MORE_INFO : {name : "moreinfo"},
		PLAY : {name: "play"},
		PLAY_TRAILER : {name: "playTrailer"},
		STOP_TRAILER : {name: "stopTrailer"},
		NPVR_RECORD : {name : "npvrRecord"},
		NPVR_CANCEL : {name : "npvrDelete"},
		NPVR_DELETE : {name : "npvrDelete"},
		NPVR_PROTECT : {name : "npvrProtect"},
		NPVR_UNPROTECT : {name : "npvrUnprotect"},
		SUBTITLE_ON : {name : "subtitle_on"},
		SUBTITLE_OFF : {name : "subtitle_off"},
		STAR_RATING : {name : "star_rating"}
	};
	//@formatter:on

	var MediaCardCallToActionBar = function(container, callback) {
		this.container = container;
		this.callToActionCallback = callback;
	};

	proto = MediaCardCallToActionBar.prototype;

	proto.populate = function(mediaItem, miniMediaCard) {
		if (!mediaItem) {
			return;
		}
		var mi, mt, txtLbl, btn;
		var r, i;
		mi = mediaItem;
		mt = mediaItem.type;
		txtLbl = $U.core.Device.isPhone() ? false : true;

		/* Parental rating - if allowed create buttons */
		if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(mediaItem.rating)) {

			switch(mt) {
			case $U.core.mediaitem.MediaItemType.VOD:
			case $U.core.mediaitem.MediaItemType.TRAILER:
				r = this.getVODButtons(mi);
				break;
			case $U.core.mediaitem.MediaItemType.CATCHUP:
				r = this.getCatchUpButtons(mi, miniMediaCard);
				break;
			case $U.core.mediaitem.MediaItemType.BTVEVENT:
				r = this.getBTVButtons(mi, miniMediaCard);
				break;
			case $U.core.mediaitem.MediaItemType.BTVCHANNEL:
				r = this.getBTVButtons(mi, miniMediaCard);
				break;
			case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
				r = this.getPVRButtons(mediaItem, $U.core.mediaitem.MediaItemType.PVR_RECORDING);
				break;
			case $U.core.mediaitem.MediaItemType.PVR_SCHEDULED:
				r = this.getPVRButtons(mediaItem, $U.core.mediaitem.MediaItemType.PVR_SCHEDULED);
				break;
			case $U.core.mediaitem.MediaItemType.NPVR:
				r = this.getNPVRButtons(mi);
				break;
			}
		}

		// add a temporary star rating button:
		if ($U.core.Configuration.RECOMMENDATIONS.STARS) {
			r.push(BUTTON.STAR_RATING);
		}

		//clear before we set any new
		this.container.innerHTML = "";
		if (r) {
			for ( i = 0; i < r.length; i++) {
				this.container.appendChild(this._buildButton(r[i], txtLbl));
			}
		}
		// Check to see if the favourites service has been initialised.
		if ($U.core.category.favourites.Favourites.isFavouritesInitialised()) {
			//deactivate the favourites button if it hasn't received a response from the server
			if ($U.core.category.favourites.Favourites.isFavourite(mediaItem).local) {
				this.deactivateButton("favourites");
			} else {
				this.activateButton("favourites");
			}
			// If it hasn't been initialised then make sure the button is disabled
		} else {
			this.deactivateButton("favourites");
		}
	};

	proto.setBlocked = function(){
		//get rid of the buttons
		this.container.innerHTML = "";
	};


	/**
	 * Returns the action bar buttons for the VOD mediacard
	 * @param {$U.core.mediaitem.VODItem} mediaItem the VODItem
	 * @return {Array} buttons that will be displayed on the Action Bar
	 */
	proto.getVODButtons = function(mediaItem) {
		var buttonArray = [],
			button = $U.mediaCard.MediaCardCallToActionBar.BUTTON,
			i,
			trailers,
			isTrailer = false;

		if (mediaItem.type === $U.core.mediaitem.MediaItemType.TRAILER) {
			isTrailer = true;
			mediaItem = mediaItem.parentItem;
		}

		buttonArray.push(this._getVODFavouriteButton(mediaItem));

		if (mediaItem.isAssetPlayable) {
			if ($U.core.Configuration.SUPPORT_SUBTITLES && $U.core.Configuration.SUPPORT_SUBTITLES.SUPPORT()) {
				this._getSubtitleButton(buttonArray);
			}
			if ($U.core.Gateway.isGatewayAvailable()) {
				buttonArray.push(button.CHOOSE_SCREEN);
			}
		} else {
			if (mediaItem.purchaseOptions && mediaItem.purchaseOptions.length) {
				buttonArray.push(button.BUY);
			}
		}

		if (isTrailer) {
			if ($U.core.Player.player.ended) {
				buttonArray.push(button.PLAY_TRAILER);
			} else {
				if ($U.core.Player.getIsPlaying() && !$U.core.Device.isHandHeld()) {
					buttonArray.push(button.STOP_TRAILER);
				} else {
					buttonArray.push(button.PLAY_TRAILER);
				}
			}
		} else {
			if (mediaItem._data && mediaItem._data.technicals) {
				for (i = 0; i < mediaItem._data.technicals.length; i++) {
					if (mediaItem._data.technicals[i].promoRefs && mediaItem._data.technicals[i].promoRefs[0]) {
						buttonArray.push(button.PLAY_TRAILER);
						break;
					}
				}
			}
		}

		return buttonArray;
	};

	proto._getSubtitleButton = function(buttonArray) {
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;
		// Get the subtitle object from local store
		$U.core.store.LocalStore.getItem("subtitles", function(itemJSON) {
			var item;
			var enabled;
			var subtitleStateOveride;

			if (itemJSON) {
				item = JSON.parse(itemJSON);
				enabled = item.on ? true : false;
			} else {
				enabled = false;
			}

			// Find out whether the user has chosen to override the subtitles in their settings for this asset
			subtitleStateOveride = $U.mediaCard.MediaCardController.getSubtitleState();

			if (subtitleStateOveride) {
				// the user has some sort of override state
				if (subtitleStateOveride === $U.mediaCard.MediaCardPlayer.SUBTITLE_STATE.ON) {
					// If the override state is to turn subtitles on then show the user the option to turn it off
					buttonArray.push(button.SUBTITLE_OFF);

				} else if (subtitleStateOveride === $U.mediaCard.MediaCardPlayer.SUBTITLE_STATE.OFF) {
					// If the override state is to turn subtitles off then show the user the option to turn it on
					buttonArray.push(button.SUBTITLE_ON);
				}
			} else if (enabled) {
				// If no override is set and the subtitles are enabled globally (set in local store) then show the user the off button
				buttonArray.push(button.SUBTITLE_OFF);
			} else {
				// If no override is set and the subtitles are disabled globally (set in local store) then show the user the on button
				buttonArray.push(button.SUBTITLE_ON);
			}
		});
	};

	/**
	 * Returns the action bar buttons for the VOD - CATCHUP mediacard
	 * @param {$U.core.mediaitem.CatchUpMediaItem} mediaItem the CATCHUPItem
	 * @return {Array} buttons that will be displayed on the Action Bar
	 */
	proto.getCatchUpButtons = function(mediaItem, miniMediaCard) {
		var buttonArray = [];
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;

		if (miniMediaCard) {
			buttonArray.push(button.MORE_INFO);
			buttonArray.push(this._getBTVFavouriteButton(mediaItem._channel));
		} else if (mediaItem._btvEvent) {
			buttonArray.push(this._getBTVFavouriteButton(mediaItem._channel));
		} else {
			buttonArray.push(this._getVODFavouriteButton(mediaItem));
		}
		if ($U.core.Configuration.SUPPORT_SUBTITLES && $U.core.Configuration.SUPPORT_SUBTITLES.SUPPORT()) {
			this._getSubtitleButton(buttonArray);
		}
		return buttonArray;
	};

	/**
	 * Returns the favourite button for the VOD - CATCHUP mediacards
	 * @param {$U.core.mediaitem.MediaItem} mediaItem the CATCHUPItem
	 * @return {$U.mediaCard.MediaCardCallToActionBar.BUTTON} button that will be displayed on the Action Bar
	 */
	proto._getVODFavouriteButton = function(mediaItem) {
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;
		var favBtn = button.FAVOURITES_ADD;
		var that = this;
		// Check to see if the favourites service has been initialised. If it has we can show add/remove button as normal
		if ($U.core.category.favourites.Favourites.isFavouritesInitialised()) {
			if ($U.core.category.favourites.Favourites.isFavourite(mediaItem).favourite) {
				favBtn = button.FAVOURITES_REMOVE;
			}
			// Other wise we show an add button which is disabled in the populate method
		} else {
			// Further more get the Favourites again and call populate so that when it has been initialised we get the
			// correct button state
			$U.core.category.favourites.Favourites.getFavs(function() {
				that.populate(mediaItem);
			});
		}
		return favBtn;
	};

	/**
	 * Returns the favourite button for the BTV / NPVR mediacards
	 * @param {$U.core.mediaitem.MediaItem} mediaItem the CATCHUPItem
	 * @return {$U.mediaCard.MediaCardCallToActionBar.BUTTON} button that will be displayed on the Action Bar
	 */
	proto._getBTVFavouriteButton = function(mediaItem) {
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;
		var favBtn = button.FAVOURITES_CHANNEL_ADD;
		if ($U.core.category.favourites.Favourites.isFavourite(mediaItem).favourite) {
			favBtn = button.FAVOURITES_CHANNEL_REMOVE;
		}
		return favBtn;
	};

	/**
	 * Returns the action bar buttons for the BTV mediacard
	 * @param {$U.core.mediaItem.MediaItem} mediaItem the item, either a BTVEventItem or a BTVChannelItem
	 * @param {boolean} [miniMediaCard] true if calling from the miniMediaCard
	 * @return {Array} buttons that will be displayed on the Action Bar
	 */
	proto.getBTVButtons = function(mediaItem, miniMediaCard) {
		var buttonArray = [];
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;
		var npvrStatus;
		var keep;
		if (mediaItem.npvrEnabled && mediaItem.inLocker && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
			npvrStatus = $U.core.NPVRManager.getInstance().getEventStatus(mediaItem);
			keep = $U.core.NPVRManager.getInstance().isEventProtected(mediaItem);
		}

		if (miniMediaCard) {
			buttonArray.push(button.MORE_INFO);
		}

		buttonArray.push(this._getBTVFavouriteButton(mediaItem));
		if ($U.core.Configuration.SUPPORT_SUBTITLES && $U.core.Configuration.SUPPORT_SUBTITLES.SUPPORT()) {
			this._getSubtitleButton(buttonArray);
		}

		if ($U.core.Gateway.isGatewayAvailable() && mediaItem.deliveryMethod === $N.data.EPGService.DELIVERY_TYPE.GATEWAY && !$U.core.Gateway.nowPlayingOnGateway(mediaItem) && !miniMediaCard && mediaItem.isPlayable) {
			buttonArray.push(button.CHOOSE_SCREEN);
		}
		if (mediaItem.type === $U.core.mediaitem.MediaItemType.BTVEVENT) {
			if (mediaItem.isPast) {
				/* jshint noempty: false */
				//Past
				//buttonArray.push(button.COLLECTION);
			} else if (mediaItem.isFuture) {
				/* jshint noempty: false */
				// Future
				if ($U.core.Gateway.isGatewayAvailable() && mediaItem.deliveryMethod === $N.data.EPGService.DELIVERY_TYPE.GATEWAY) {
					buttonArray.push(button.RECORD);
				//	buttonArray.push(button.REMIND);
				}
			} else {
				/* jshint noempty: false */
				// Present
				if ($U.core.Gateway.isGatewayAvailable() && mediaItem.deliveryMethod === $N.data.EPGService.DELIVERY_TYPE.GATEWAY) {
					buttonArray.push(button.RECORD);
				}
			}

			//NPVR
			if (mediaItem.subscribed && mediaItem.npvrEnabled && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
				if (!mediaItem.inLocker) {
					if (mediaItem.isOnNow || this.isRecordingPermitted(mediaItem)) {
						buttonArray.push(button.NPVR_RECORD);
					}
				} else {
					buttonArray = buttonArray.concat(this.addNPVRDelete(npvrStatus, keep));
				}
			}
		}

		return buttonArray;
	};

	/**
	 * Returns true of false depending on whether the recording of the event is permitted
	 * based on the recording buffer length.
	 * @param {$U.core.mediaItem.MediaItem} mediaItem item to check recording permissions for
	 * @return {Boolean} if the recording permitted
	 */
	proto.isRecordingPermitted = function (mediaItem) {
		var bufferStart = new Date();
		bufferStart.setHours(bufferStart.getHours() - $U.core.Configuration.RECORDING_BUFFER_DURATION);
		return mediaItem.startTime >= bufferStart.getTime();
	};

	/**
	 * Returns the action bar buttons for the PVR mediacard
	 * @param {$U.core.mediaItem.MediaItem} mediaItem the item
	 * @param {$U.core.mediaitem.MediItemType} pvrType Type of PVR asset we are handling
	 * @return {Array} buttons that will be displayed on the Action Bar
	 */
	proto.getPVRButtons = function(mediaItem, pvrType) {
		var buttonArray = [];
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;

		// if($U.core.Device.isPhone()){
		// buttonArray.push(button.PLAY);
		// }
		// buttonArray.push(button.FAVOURITES_ADD);
		if (pvrType === $U.core.mediaitem.MediaItemType.PVR_RECORDING && !$U.core.Gateway.nowPlayingOnGateway(mediaItem)) {
			buttonArray.push(button.CHOOSE_SCREEN);
			buttonArray.push(button.DELETE);
		}
		if (pvrType === $U.core.mediaitem.MediaItemType.PVR_SCHEDULED) {
			buttonArray.push(button.DELETE);
		}
		return buttonArray;
	};

	/**
	 * Returns the action bar buttons for the NPVR mediacard
	 * @param {$U.core.mediaItem.NPVRItem} mediaItem the NPVRItem
	 * @return {Array} buttons that will be displayed on the Action Bar
	 */
	proto.getNPVRButtons = function(mediaItem) {
		var buttonArray = [];
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;

		buttonArray.push(this._getBTVFavouriteButton(mediaItem));
		buttonArray = buttonArray.concat(this.addNPVRDelete(mediaItem.status, mediaItem.keep));

		if ($U.core.Configuration.SUPPORT_SUBTITLES && $U.core.Configuration.SUPPORT_SUBTITLES.SUPPORT()) {
			this._getSubtitleButton(buttonArray);
		}

		return buttonArray;
	};

	proto.addNPVRDelete = function(npvrStatus, keep) {
		var buttonArray = [];
		var button = $U.mediaCard.MediaCardCallToActionBar.BUTTON;

		if (npvrStatus === $U.core.NPVRManager.getInstance().scheduled() || npvrStatus === $U.core.NPVRManager.getInstance().active()) {
			buttonArray.push(button.NPVR_CANCEL);
		} else {
			if (keep) {
				buttonArray.push(button.NPVR_UNPROTECT);
			} else {
				buttonArray.push(button.NPVR_DELETE);
				buttonArray.push(button.NPVR_PROTECT);
			}
		}
		return buttonArray;
	};

	/**
	 * Builds each button as required
	 * @private
	 * @param {Object} button Button to be added
	 * @param {boolean} isTextRequired Whether to add text to the button or not
	 */
	proto._buildButton = function(button, isTextRequired) {

		// Build the DOM elements required for the action button

		var actionButtonContainer = document.createElement("div");
		var actionButtonTextSpan = document.createElement("span");
		var iconHolder = document.createElement("i");
		var varObj = {};
		var that = this;

		// Wraps up the callToActionCallback in a nextwork connection check
		function callToActionWrapper(evt) {
			var buttonName = evt.currentTarget.getAttribute($U.mediaCard.MediaCardCallToActionBar.DATA_ATTRIBUTE);
			$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
				if (status) {
					that.callToActionCallback(buttonName);
				}
			});
		}


		this.container.appendChild(actionButtonContainer);

		actionButtonContainer.className = "mc-action-button webkit-render-fix";
		actionButtonContainer.setAttribute(DATA_ATTRIBUTE, button.name);
		actionButtonContainer.appendChild(iconHolder);
		actionButtonContainer.appendChild(actionButtonTextSpan);

		switch(button) {
		case BUTTON.RECORD:
			iconHolder.className = "icon-circle";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnRecord")));
			}
			break;
		case BUTTON.DOWNLOAD:
			iconHolder.className = "icon-download-alt";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnDownload")));
			}
			break;
		case BUTTON.COLLECTION:
			iconHolder.className = "icon-plus";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnAddCollection")));
			}
			break;
		case BUTTON.REMIND:
			iconHolder.className = "icon-bell-alt";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnSetReminder")));
			}
			break;
		case BUTTON.FAVOURITES_ADD:
		    iconHolder.className = "icon-heart-empty";
		   	if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnAddFavourites")));
			}
			break;
		case BUTTON.FAVOURITES_REMOVE:
		    iconHolder.className = "icon-heart";
		    iconHolder.style.color = '#A8DB92';      //JRM
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnRemoveFavourites")));
			}
			break;
		case BUTTON.FAVOURITES_CHANNEL_ADD:
		    iconHolder.className = "icon-heart-empty";
		    iconHolder.style.color = '#A8DB92';      //JRM
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnAddChannelFavourites")));
			}
			break;
		case BUTTON.FAVOURITES_CHANNEL_REMOVE:
		    iconHolder.className = "icon-heart";
		    iconHolder.style.color = '#A8DB92';      //JRM
		    if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnRemoveChannelFavourites")));
			}
			break;
		case BUTTON.BUY:
			iconHolder.className = "icon-shopping-cart";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnBuy")));
			}
			break;
		case BUTTON.CHOOSE_SCREEN:
			iconHolder.className = "icon-desktop";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnPlaybackOnDevice", {
					DEVICENAME : $U.core.Gateway.getDeviceName()
				})));
			}
			break;
		case BUTTON.DELETE:
		    iconHolder.className = "icon-remove";
		   	if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnDeleteProgramme")));
			}
			break;
		case BUTTON.MORE_INFO:
		    iconHolder.className = "icon-chevron-right";
		    iconHolder.style.color = '#A8DB92';      //JRM
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnMoreInfo")));
			}
			break;
		case BUTTON.PLAY:
			iconHolder.className = "icon-play";

			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnPLAY")));
			}
			break;
		case BUTTON.PLAY_TRAILER:
			iconHolder.className = "icon-film";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnPLAYTRAILER")));
			}
			break;
		case BUTTON.STOP_TRAILER:
			iconHolder.className = "icon-stop";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnSTOPTRAILER")));
			}
			break;
		case BUTTON.NPVR_RECORD:
			iconHolder.className = "icon-cloud";
			if (isTextRequired) {
				varObj = {
					PERCENT : $U.core.NPVRManager.getInstance().getLockerSpaceUsedPercent().toString()
				};
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnNPVRRecord", varObj)));
			}
			break;
		case BUTTON.NPVR_DELETE:
			iconHolder.className = "icon-trash";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnNPVRDelete")));
			}
			break;
		case BUTTON.NPVR_CANCEL:
			iconHolder.className = "icon-trash";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnNPVRCancel")));
			}
			break;
		case BUTTON.NPVR_PROTECT:
			iconHolder.className = "icon-lock";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnNPVRProtect")));
			}
			break;
		case BUTTON.NPVR_UNPROTECT:
			iconHolder.className = "icon-key";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("btnNPVRUnprotect")));
			}
			break;
		case BUTTON.SUBTITLE_ON:
			iconHolder.className = "icon-comment-alt";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtSubtitlesON")));
			}
			break;
		case BUTTON.SUBTITLE_OFF:
			iconHolder.className = "icon-comment";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtSubtitlesOFF")));
			}
			break;
		case BUTTON.STAR_RATING:
			iconHolder.className = "icon-star-half-empty";
			if (isTextRequired) {
				actionButtonTextSpan.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtStarRating")));
			}
			break;
		default:
		/* No default, silently ignore invalid actions */
		}

		// Add the default event listener to this link (same for all links, the handler decides which button has been selected)
		actionButtonContainer.addEventListener('click', callToActionWrapper, false);

		return actionButtonContainer;
	};

	/**
	 * Changes the opacity of specific buttons
	 * @param {String} dataAttr name of the button in the data attribute associated with it
	 * @param {String} opacity the opacity to change the button to
	 */
	proto._changeButtonOpacity = function(dataAttr, opacity) {
		var btn = document.querySelectorAll("[" + DATA_ATTRIBUTE + "='" + dataAttr + "']");
		var len = btn.length;
		var i;
		for ( i = 0; i < len; i++) {
			btn[i].style.opacity = opacity;
		}
	};

	/**
	 * Puts the button into a deactivated state (changes the opacity), the onclick should be handled by the onclick handler for the button
	 * @param {Object} dataAttr name of the button in the data attribute associated with it
	 */
	proto.deactivateButton = function(dataAttr) {
		this._changeButtonOpacity(dataAttr, "0.6");
	};

	/**
	 * Puts the button into a activated state (changes the opacity), the onclick should be handled by the onclick handler for the button
	 * @param {Object} dataAttr name of the button in the data attribute associated with it
	 */
	proto.activateButton = function(dataAttr) {
		this._changeButtonOpacity(dataAttr, "1");
	};

	MediaCardCallToActionBar.DATA_ATTRIBUTE = DATA_ATTRIBUTE;
	MediaCardCallToActionBar.BUTTON = BUTTON;
	return MediaCardCallToActionBar;

}());
