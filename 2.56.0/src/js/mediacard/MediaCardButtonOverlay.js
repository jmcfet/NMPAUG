/**
 * Set up DOM elements for Buttons and their behaviour
 * @class $U.mediaCard.MediaCardButtonOverlay
 *
 * @constructor
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardButtonOverlay = ( function() {

	var TXT_BUY_KEY = "txtBUY";
	var TXT_PLAY_KEY = "txtPLAY";
	var TXT_RESUME_KEY = "txtRESUME";
	var TXT_REPLAY_KEY = "txtREPLAY";
	var TXT_SO_KEY = "txtStartOver";
	var TXT_LOAD_KEY = "txtPleaseWait";
	var TXT_MOREINFO_KEY = "btnMoreInfo";
	var TXT_PLAYNEXT_KEY = "txtPlayNext";

	var proto;

	var logger = $U.core.Logger.getLogger();

	var BUTTONS = {
		BUY : {
			name : "buy",
			icon : "buy",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_BUY_KEY);
			}
		},
		PLAY : {
			name : "play",
			icon : "play",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_PLAY_KEY);
			}
		},
		RESUME : {
			name : "resume",
			icon : "play",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_RESUME_KEY);
			}
		},
		REPLAY : {
			name : "resume",
			icon : "replay",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_REPLAY_KEY);
			}
		},
		START_OVER : {
			name : "resume",
			icon : "replay",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_SO_KEY);
			}
		},
		LOADING : {
			name : "loading",
			icon : "spin",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_LOAD_KEY);
			}
		},
		MORE_INFO : {
			name : "moreinfo",
			icon : "more",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_MOREINFO_KEY);
			}
		},
		FETCH : {
			name : "fetch",
			icon : "play",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString("txtFETCH");
			}
		},
		PLAY_NEXT : {
			name : "playnext",
			icon : "play",
			txtLabel : function() {
				return $U.core.util.StringHelper.getString(TXT_PLAYNEXT_KEY);
			}
		}
	};

	function MediaCardButtonOverlay(containerEl, owner, isMiniMediaCard) {
		this._containerEl = containerEl;
		this._owner = owner;
		this._mediaitem = null;
		this._buttonsArray = [];
		this._isMiniMediaCard = isMiniMediaCard;
	}

	/**
	 * Factory method to create a new instance of MediaCardButtonOverlay
	 * Currently only one type for every device
	 */
	MediaCardButtonOverlay.create = function(containerEl, owner, isMiniMediaCard) {
		var r;
		switch ($U.core.Device.getFF()) {
		case $U.core.Device.FF.PHONE:
			r = new $U.mediaCard.MediaCardButtonOverlay(containerEl, owner, isMiniMediaCard);
			break;
		case $U.core.Device.FF.TABLET:
			r = new $U.mediaCard.MediaCardButtonOverlay(containerEl, owner, isMiniMediaCard);
			break;
		case $U.core.Device.FF.DESKTOP:
			r = new $U.mediaCard.MediaCardButtonOverlay(containerEl, owner, isMiniMediaCard);
			break;
		}
		return r;
	};

	proto = MediaCardButtonOverlay.prototype;

	/**
	 * Public Method to activate the buttons	 *
	 */
	proto.activate = function(mediaitem, state, autoplay) {

		this.deactivate();

		this._mediaitem = mediaitem;

		switch (this._mediaitem.type) {
		case $U.core.mediaitem.MediaItemType.NPVR:
		case $U.core.mediaitem.MediaItemType.VOD:
			// VOD and NPVR are almost identical buttons
			this._buildVODButtons(state);
			break;
		case $U.core.mediaitem.MediaItemType.BTVEVENT:
			if (this._mediaitem.inLocker) {
				// VOD and NPVR are almost identical buttons
				this._buildVODButtons(state, autoplay);
			} else {
				// Live / Catch up and other BTV types
				this._buildBTVButtons(this._mediaitem, state, autoplay);
			}
			break;
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
			this._buildPVRRecButtons(this._mediaitem, state);
			break;
		case $U.core.mediaitem.MediaItemType.PVR_SCHEDULED:
			this._buildPVRSchedButtons(this._mediaitem, state);
			break;
		case $U.core.mediaitem.MediaItemType.ONNOW:
			this._buildOnNowButtons(this._mediaitem, state);
			break;
		case $U.core.mediaitem.MediaItemType.CATCHUP:
			// These buttons are for VOD catch up
			this._buildCatchupButtons(this._mediaitem, state, autoplay);
			break;
		}
	};

	/**
	 * Helper method to create buttons on the fly
	 * @param {Object} button
	 * @param {Function} buttonAction
	 * @private
	 */
	proto._buildButton = function(button, buttonAction) {
		var eventType;
		var newButton;
		var that = this;

		eventType = "click";

		newButton = $U.core.util.DomEl.createElWithText("div", button.txtLabel()).setClassName("mc-button-container " + button.icon).attachTo(that._containerEl).asElement();
		if (buttonAction) {
			newButton.addEventListener(eventType, buttonAction);
		}

		// Push buttons that are created onto an array so we can keep track of them
		that._buttonsArray.push(newButton);

		// Take a breath and force layout to render
		setTimeout(function() {
			if (newButton) {
				newButton.style.display = "none";
				newButton.style.display = "inline-block";
			}
		}, 0);

	};

	/**
	 * Method responsible for building buttons related to a media item of type VOD
	 * @param {Object} mediaitem
	 * @private
	 */
	proto._buildVODButtons = function(state, autoplay) {
		var that = this;
		var bookmarktype;
		var nextItem;

		bookmarktype = ((this._mediaitem.type === $U.core.mediaitem.MediaItemType.NPVR) || (this._mediaitem.type === $U.core.mediaitem.MediaItemType.BTVEVENT && this._mediaitem.inLocker)) ? $U.mediaCard.MediaCardController.BOOKMARK_TYPE.NPVR.name : $U.mediaCard.MediaCardController.BOOKMARK_TYPE.ASSET.name;

		// If it is playable i.e. has been purchased/is free/has a subscription
		if (this._mediaitem.isAssetPlayable || this._mediaitem.isPlayable) {

			// If we have finished playing a media item then we did not need to check for a book mark just show a replay button
			//TODO make this state stuff better!
			if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(this._mediaitem)) {
				this._buildButton(BUTTONS.FETCH, this._fetchButtonHandler.bind(this));
			} else if (state === $U.mediaCard.MediaCardTransitions.TRANSITION_STATE.END) {
				// Find the next item to suggest to the user if in fact this is an episode in a series
				nextItem = this._mediaitem.episodeNumber ? $U.mediaCard.MediaCardController.getNextItemInMlt(this._mediaitem) : null;

				// Build replay button always as we want to offer the user the option to start from beginning
				this._buildButton(BUTTONS.REPLAY, this._playButtonHandler.bind(this));

				if (nextItem) {
					// If we have found a next item then set up the button to handler this
					this._buildButton(BUTTONS.PLAY_NEXT, function(evt) {
						that._playNextHandler(evt, nextItem);
					});
				}
			} else {
				// show loading animation so the user has some feedback that we are talking to the server for bookmark
				this.buildLoadingAnimation();
				if (!autoplay) {
					// check for book mark
					if ($U.core.Gateway.isGatewayAvailable()) {
						//TODO: bookmarks for  VOD items will need to be worked out
						if (this._mediaitem.type !== $U.core.mediaitem.MediaItemType.VOD) {
							$U.core.Gateway.getBookmarkForId(this._mediaitem.id, function(position) {
								that._getBookmarkCallback(position, that._mediaitem.id);
							});
						} else {
							$N.services.sdp.Bookmark.getBookmarkForContent(this._mediaitem.id, bookmarktype, this._getBookmarkCallback.bind(this), $U.core.Locale.getLocale());
						}
					} else {
						$N.services.sdp.Bookmark.getBookmarkForContent(this._mediaitem.id, bookmarktype, this._getBookmarkCallback.bind(this), $U.core.Locale.getLocale());
					}
				}
			}
			this._inprogress = false;
		} else {
			if (this._mediaitem.purchaseOptions && this._mediaitem.purchaseOptions.length > 0) {
				// build the buy button
				this._buildButton(BUTTONS.BUY, this._purchaseButtonHandler.bind(this));
			} else {
				if (this._isMiniMediaCard) {
					// Show the more info button only for the mini media card
					this._buildButton(BUTTONS.MORE_INFO, this._moreInfoButtonHandler.bind(this));
				}
			}
		}
	};

	/**
	 * Method responsible for building buttons related to a media item of type BTV
	 * @param {Object} mediaitem
	 * @private
	 */
	proto._buildBTVButtons = function(mediaitem, state, autoplay) {
		if (mediaitem.isPlayable) {
			if ($U.core.Gateway.isGatewayAvailable() && $U.core.Gateway.nowPlayingOnGateway(mediaitem)) {
				this._buildButton(BUTTONS.FETCH, this._fetchButtonHandler.bind(this));
			} else if (mediaitem.isStartOver && mediaitem.isOnNow) {
				// if the start over and on now then we must show two buttons
				this._buildButton(BUTTONS.START_OVER, this._playButtonHandler.bind(this, true));
				this._buildButton(BUTTONS.PLAY, this._playButtonHandler.bind(this));
			} else if (mediaitem.isCatchUp && !mediaitem.isOnNow) {
				// If it is catch up and it is in the past then show the play button
				this._buildButton(BUTTONS.PLAY, this._playButtonHandler.bind(this));
			} else if ((mediaitem.isOnNow || mediaitem.inLocker && this._mediaitem.completed) && !autoplay) {
				// If it is on now then show the play button
				this._buildButton(BUTTONS.PLAY, this._playButtonHandler.bind(this));
			}
		} else {
			if (this._isMiniMediaCard) {
				// Show the more info button only for the mini media card
				this._buildButton(BUTTONS.MORE_INFO, this._moreInfoButtonHandler.bind(this));
			}
		}
	};

	/**
	 * Method responsible for building buttons related to a media item of type CATCHUP
	 * @param {Object} mediaitem
	 * @private
	 */
	proto._buildCatchupButtons = function(mediaitem, state, autoplay) {
		var bookmarktype = (mediaitem.type === $U.core.mediaitem.MediaItemType.NPVR) ? $U.mediaCard.MediaCardController.BOOKMARK_TYPE.NPVR.name : $U.mediaCard.MediaCardController.BOOKMARK_TYPE.ASSET.name;
		// If it is playable i.e. has been purchased/has a subscription
		if (this._mediaitem.isAssetPlayable) {
			// check for book mark
			if (!autoplay) {
				$N.services.sdp.Bookmark.getBookmarkForContent(this._mediaitem.id, bookmarktype, this._getBookmarkCallback.bind(this), $U.core.Locale.getLocale());
			}
			this._inprogress = false;
		}
	};

	/**
	 * Method responsible for building buttons related to a media item of type PVR
	 * @param {Object} mediaitem
	 * @private
	 */
	proto._buildPVRRecButtons = function(mediaitem) {
		var that = this;
		if ($U.core.Gateway.nowPlayingOnGateway(mediaitem)) {
			this.clearAllButtons();
			this._buildButton(BUTTONS.FETCH, this._fetchButtonHandler.bind(this));
		} else {
			this.buildLoadingAnimation();
			$U.core.Gateway.getBookmarkForId(mediaitem.cdsObjectID, function(position) {
				//that._mediaitem.bookmarkId = id;
				that._getBookmarkCallback(position, mediaitem.id);
			});
			this._inprogress = false;
		}
	};

	/**
	 * Method responsible for building buttons related to a media item of type SCHED PVR
	 * @param {Object} mediaitem
	 * @private
	 */
	proto._buildPVRSchedButtons = function(mediaitem) {
		// No buttons currently built for scheduled PVR
	};

	/**
	 * Method responsible for building buttons related to a media item of type ONNOW
	 * @param {Object} mediaitem
	 * @private
	 */
	proto._buildOnNowButtons = function(mediaitem) {
		this._buildBTVButtons(mediaitem);
	};

	/**
	 *  Public Method responsible for building the loading animation
	 */
	proto.buildLoadingAnimation = function(text) {
		this._buildButton(BUTTONS.LOADING, null, text);
	};

	/**
	 * Handles the purchase button user action
	 */
	proto._purchaseButtonHandler = function(evt) {
		var that = this;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				// Network connection is OK so continue to purchase workflow
				$U.mediaCard.MediaCardController.intialisePurchaseWorkFlow(that._mediaitem);
			}
		});
	};

	/**
	 * Handles the play and resume button user action
	 */
	proto._playButtonHandler = function(startover, evt) {
		var that = this;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				// Network connection is OK so continue to check network type
				//TODO this needs rework
				$U.core.NetworkHandler.playbackNetworkCheck(function() {
					var so = ( typeof startover === "boolean") ? startover : undefined;
					if (that._isMiniMediaCard) {
						// Clicking play in mini media card switches to media card with autoplay enabled
						$U.core.View.showMediaCardScreen(that._mediaitem, null, true, so);
					} else {
						// Clicking play in media card plays the content without autoplay enabled
						$U.mediaCard.MediaCardController.playListener(that._mediaitem, false, so);
					}
					that.clearAllButtons();
					that.buildLoadingAnimation();
				});
			}
		});
	};

	/**
	 * Handles the resume button user action
	 */
	proto._gatewayResumeButtonHandler = function(startover, evt) {
		var that = this;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				// Network connection is OK so continue to check network type
				//TODO this needs rework
				$U.core.NetworkHandler.playbackNetworkCheck(function() {
					if (that._mediaitem.type !== $U.core.mediaitem.MediaItemType.VOD) {
						$U.core.Gateway.getBookmarkForId(that._mediaitem.cdsObjectID, function(position) {
							that._mediaitem.bookmarkPosition = position;
							$U.mediaCard.MediaCardController.playListener(that._mediaitem, false, undefined);
							that.clearAllButtons();
							that.buildLoadingAnimation();
						});
					} else {
						var so = ( typeof startover === "boolean") ? startover : undefined;
						$U.mediaCard.MediaCardController.playListener(that._mediaitem, false, so);
					}
				});
			}
		});
	};

	/**
	 * Handle the play next button user action
	 */
	proto._playNextHandler = function(evt, nextItem) {
		var autoplay = false;
		// By setting this to false we should not re-populate the more like this items
		var moreLikeThisItems = false;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				// Network check OK
				$U.core.View.showMediaCardScreen(nextItem, moreLikeThisItems, autoplay);
			}
		});
	};

	/**
	 * Handles the more info button user action
	 * @private
	 */
	proto._moreInfoButtonHandler = function() {
		var that = this;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				$U.core.View.showMediaCardScreen(that._mediaitem);
			}
		});
	};

	/**
	 * Handles the fetch button user action
	 */
	proto._fetchButtonHandler = function() {
		var that = this;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				// Network connection is OK so continue to check network type
				//TODO this needs rework
				$U.core.NetworkHandler.playbackNetworkCheck(function() {
					if (that._isMiniMediaCard) {
						// Clicking play in mini media card switches to media card with autoplay enabled
						$U.core.View.showMediaCardScreen(that._mediaitem, null, true);
					} else {
						that._mediaitem.playbackPosition = $U.mediaCard.MediaCardController.getPlayer().getControlAdaptor().getCurrentPosition();
						$U.mediaCard.MediaCardController.playListener(that._mediaitem, false);
					}
					that.clearAllButtons();
					that.buildLoadingAnimation("txtFetching");
				});
			}
		});

	};

	/**
	 * Callback method for getting a book mark
	 * @param {Number} position
	 * @param {String} id
	 * @private
	 */
	proto._getBookmarkCallback = function(position, id) {
		var that = this;
		// make sure the callback is not already in progress (multiple quick clicks from user could cause this)
		if (!this._inprogress) {
			// Set that the callback is in progress
			this._inprogress = true;
			// Clear the loading animation (there should be no other buttons in the array at this point)
			this.clearAllButtons();
			// Make sure the callback that we executed is still for the asset we are viewing (again quick clicks between assets could cause this)
			if (id === this._mediaitem.id) {
				// if we are returned a position then resume and play buttons created
				if (position > 0) {
					// store the book mark on the media item
					this._mediaitem.bookmarkPosition = position;
					// build the replay button
					this._buildButton(BUTTONS.REPLAY, function(evt) {
						$U.mediaCard.MediaCardController.deleteBookmark(that._mediaitem, that._playButtonHandler.bind(that));
					});
					// build the resume button
					if ($U.core.Gateway.isGatewayAvailable()) {
						this._buildButton(BUTTONS.RESUME, this._gatewayResumeButtonHandler.bind(this));
					} else {
						this._buildButton(BUTTONS.RESUME, this._playButtonHandler.bind(this));
					}

				} else {
					// Otherwise just play as no book mark set
					this._mediaitem.bookmarkPosition = 0;
					// build the play button
					this._buildButton(BUTTONS.PLAY, this._playButtonHandler.bind(this));
				}
			}
		}
	};

	/**
	 * Public Method that clears all the buttons within the button container without having to call
	 * the deactivate method
	 */
    proto.clearAllButtons = function() {
        var i = this._buttonsArray.length;

        // While we have buttons in the array loop and remove
        while (i--) {
            // Strip from DOM
//            this._containerEl.removeChild(this._buttonsArray[i]);

            // Find the position of the button in the array and remove
            this._buttonsArray.splice(this._buttonsArray.indexOf(this._buttonsArray[i]), 1);
        }

        // Strip DOM child elements
        while (this._containerEl.hasChildNodes()) {
            this._containerEl.removeChild(this._containerEl.firstChild);
        }
    };

	/**
	 * Public method that deactivates the button overlay
	 */
	proto.deactivate = function() {
		this.clearAllButtons();
	};

	return MediaCardButtonOverlay;

}());
