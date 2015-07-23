/**
 * VideoControls is responsible for controlling the video playback on the html page
 * @class $U.mediaCard.VideoControls
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.VideoControls = ( function() {

	var logger = $U.core.Logger.getLogger("VideoControls");
	var proto;
	var DATA_ATTRIBUTE = "data-video-controls-button";
	var POSITION_ATTRIBUTE = "right-aligned";
	var TIMEFIELD = "time-field";
	var REMAINING_TIMEFIELD = "remaining-time-field";

	// ENUM of available buttons
	var BUTTON = {
		PLAY : {
			name : "play",
			className : "icon-play"
		},
		PAUSE : {
			name : "pause",
			className : "icon-pause"
		},
		STOP : {
			name : "stop",
			className : "icon-stop"
		},
		FFWD : {
			name : "fastforward",
			className : "icon-forward"
		},
		RWND : {
			name : "rewind",
			className : "icon-backward"
		},
		SKIPFWD : {
			name : "skipForward",
			className : "icon-step-forward"
		},
		SKIPBACK : {
			name : "skipBackward",
			className : "icon-step-backward"
		},
		FULLSCREEN : {
			name : "fullScreen",
			className : "icon-resize-full",
			align : "right"
		},
		EXITFULLSCREEN : {
			name : "ExitFullScreen",
			className : "icon-resize-small",
			align : "right"
		},
		PBAR : {
			name : "progressbar"
		}
	};

	function VideoControls(container) {
		this._container = container;
	}

	proto = VideoControls.prototype;

	/**
	 * Populates the controller
	 * @param {$U.core.mediaitem.MediaItemType} type this is used to select the correct adaptor
	 */
	proto.populate = function(type, nowPlaying) {
		var i, len;

		// switch(type) {
		// case $U.core.mediaitem.MediaItemType.VOD:
		// case $U.core.mediaitem.MediaItemType.CATCHUP:
		// case $U.core.mediaitem.MediaItemType.PVR_RECORDING:
		// case $U.core.mediaitem.MediaItemType.NPVR:
		// this._adaptor = $U.mediaCard.VODControlAdaptor;
		// break;
		// case $U.core.mediaitem.MediaItemType.BTVEVENT:
		// this._adaptor = $U.mediaCard.BTVControlAdaptor;
		// break;
		// }
		this._adaptor = $U.mediaCard.MediaCardController.getPlayer().getControlAdaptor();

		//need to use the gateway one if on the NowPlaying screen:
		if ($U.core.Gateway.isGatewayAvailable() && nowPlaying) {
			this._adaptor = $U.mediaCard.GatewayControlAdaptor;
			this._adaptor.resetSpeed();
		}

		this._buttons = this._adaptor.getButtons(BUTTON);
		this._container.innerHTML = "";
		if (this._buttons) {
			len = this._buttons.length;
			for ( i = 0; i < len; i++) {
				this._container.appendChild(this._buildButton(this._buttons[i]));
			}
		}
		if (this._adaptor.SHOW_TIME) {
			this._timeField = this._createTimeField(TIMEFIELD);
			this._container.appendChild(this._timeField);
			this.updateTimeField($U.core.util.Formatter.formatSecondsToDigitalClock(0));
		}
		if (this._adaptor.SHOW_REMAINING) {
			this._remainingTimeField = this._createTimeField(REMAINING_TIMEFIELD);
			this._container.appendChild(this._remainingTimeField);
			this.updateRemainingTimeField($U.core.util.Formatter.formatSecondsToDigitalClock(0));
		}
		if (this._adaptor.SHOW_BRING_TO_LIVE) {
			this._liveButton = $U.core.util.DomEl
								.createElWithText("div", "LIVE")
								.setId("mcBringToLive")
								.setClassName("mc-bring-to-live inactive mc-video-controls-button-right")
								.setAttribute(POSITION_ATTRIBUTE, "true")
								.attachTo(this._container)
								.asElement();

			this._liveButton.addEventListener("click", function(evt) {
				if(evt.currentTarget.className.indexOf('inactive') > -1){
					return;
				} else {
					$U.core.Player.player.currentTime = $U.core.Player.player.seekable.end(0);
					$U.core.util.HtmlHelper.removeClass(evt.currentTarget, "active");
					$U.core.util.HtmlHelper.setClass(evt.currentTarget, "inactive");
				}
			});
		}
		if (this._adaptor.SHOW_PROGRESS) {
			this._pbar = this._createPbar();
			this._container.appendChild(this._pbar);
			this.updateProgressBar(0);
		} else {
			this.resize();
		}
		if ($U.core.Gateway.isGatewayAvailable() && nowPlaying) {
			this.show();
		} else {
			this.hide();
		}
	};

	/**
	 * Creates a DOM element representing a button on the controller
	 * @param {Object} button the information for the button
	 * @return the button
	 */
	proto._buildButton = function(button) {
		// Build the DOM elements required for the action button

		var actionButtonContainer = document.createElement("div");
		var iconHolder = document.createElement("i");

		this._container.appendChild(actionButtonContainer);

		actionButtonContainer.className = "mc-video-controls-button";
		if (button.align) {
			actionButtonContainer.className += " mc-video-controls-button-" + button.align;
			actionButtonContainer.setAttribute(POSITION_ATTRIBUTE, "true");
		}

		actionButtonContainer.setAttribute(DATA_ATTRIBUTE, button.name);
		actionButtonContainer.appendChild(iconHolder);

		iconHolder.className = button.className;

		actionButtonContainer.addEventListener('click', this.videoControlsCallback.bind(this), false);

		return actionButtonContainer;
	};

	/**
	 * Creates a DOM element representing the progressbar on the controller
	 * @return the progressbar
	 */
	proto._createPbar = function() {
		var pbar = document.createElement("div");
		this._progbar = document.createElement("div");
		pbar.className = "mc-video-controls-pbar-bg";
		this._progbar.className = "mc-video-controls-pbar";

		pbar.setAttribute(DATA_ATTRIBUTE, BUTTON.PBAR.name);
		pbar.appendChild(this._progbar);
		pbar.addEventListener('click', this.videoControlsCallback.bind(this), false);
		return pbar;
	};

	/**
	 * Creates a DOM element representing a time field on the controller
	 * @return the time field
	 */
	proto._createTimeField = function(type) {
		var timeField = document.createElement("div");
		timeField.className = "mc-video-controls-time";
		if (type === REMAINING_TIMEFIELD) {
			timeField.className += " mc-video-controls-button-right";
			timeField.setAttribute(POSITION_ATTRIBUTE, "true");
		}
		timeField.setAttribute(DATA_ATTRIBUTE, type);
		return timeField;
	};

	/**
	 * Changes the width of the progressbar
	 * (any percentage calculations should be done in the adaptor)
	 * @param {Number} percent the new width
	 */
	proto.updateProgressBar = function(percent) {
		// If the percentage somehow gets greater than 100% make sure we set it to only be 100
		var pc = (percent > 100) ? 100 : percent;
		this.resize();
		$U.core.util.HtmlHelper.setWidth(this._progbar, pc, $U.core.util.HtmlHelper.UNIT_TYPE.PC);
	};

	/**
	 * Writes some text into the time field
	 * @param {String} someText the text that is to be written into the field
	 */
	proto.updateTimeField = function(someText) {
		this._timeField.textContent = someText;
	};

	/**
	 * Writes some text into the time field
	 * @param {String} someText the text that is to be written into the field
	 */
	proto.updateRemainingTimeField = function(someText) {
		this._remainingTimeField.textContent = someText;
	};

	proto.activateBringToLiveButton = function() {
		$(this._liveButton).removeClass("inactive").addClass("active");
	};

	/**
	 * Callback that handles clicks on the controller
	 * @param {Object} evt the click event
	 */
	proto.videoControlsCallback = function(evt) {
		var theActionClicked = evt.currentTarget.getAttribute(DATA_ATTRIBUTE);
		var adaptor = $U.mediaCard.MediaCardController.getPlayer().getControlAdaptor();
		var pbarClickPos;

		switch(theActionClicked) {
		case BUTTON.PLAY.name:
			adaptor.play();
			this.setPaused(false);
			break;
		case BUTTON.PAUSE.name:
			adaptor.pause();
			this.setPaused(true);
			break;
		case BUTTON.STOP.name:
			adaptor.stop();
			break;
		case BUTTON.FFWD.name:
			adaptor.fastForward();
			this.setPaused(true);
			break;
		case BUTTON.RWND.name:
			adaptor.rewind();
			this.setPaused(true);
			break;
		case BUTTON.SKIPFWD.name:
			adaptor.skipForward();
			break;
		case BUTTON.SKIPBACK.name:
			adaptor.skipBackward();
			break;
		case BUTTON.FULLSCREEN.name:
			adaptor.fullscreen();
			break;
		case BUTTON.EXITFULLSCREEN.name:
			adaptor.exitFullscreen();
			break;
		case BUTTON.PBAR.name:
			pbarClickPos = evt.clientX - evt.currentTarget.getBoundingClientRect().left;
			adaptor.progressBarClickedAt(pbarClickPos / evt.currentTarget.clientWidth * 100);
			break;
		// Add more handlers as required here
		default:
		/* No default, silently ignore invalid actions */
		}
	};

	/**
	 * Switches a button from the currButt to the newButt, if currBut doesn't exist then it does nothing
	 * @param {Object} newButt
	 * @param {Object} currButt
	 * @private
	 */
	function _switchToFrom(newButt, currButt) {
		var btn = document.querySelectorAll("[" + DATA_ATTRIBUTE + "='" + currButt.name + "']");
		var len = btn.length;
		var i;
		for ( i = 0; i < len; i++) {
			btn[i].setAttribute(DATA_ATTRIBUTE, newButt.name);
			btn[i].children[0].className = newButt.className;
		}
	}

	/**
	 * called from the adaptor, this tells the controls to display the fullscreen or exitfullscreen button
	 * @param {boolean} isFull
	 */
	proto.setFullScreen = function(isFull) {
		if (isFull) {
			_switchToFrom(BUTTON.EXITFULLSCREEN, BUTTON.FULLSCREEN);
		} else {
			_switchToFrom(BUTTON.FULLSCREEN, BUTTON.EXITFULLSCREEN);
		}
	};

	/**
	 * called from the adaptor, this tells the controls to display the paused or play button
	 * @param {boolean} isPaused
	 */
	proto.setPaused = function(isPaused) {
		logger.log("setPause", isPaused);
		if (isPaused) {
			_switchToFrom(BUTTON.PLAY, BUTTON.PAUSE);
		} else {
			_switchToFrom(BUTTON.PAUSE, BUTTON.PLAY);
		}
	};

	/**
	 * shows the videoControls
	 */
	proto.show = function() {
		this._container.style.visibility = "visible";
		this._container.style.opacity = "1";
	};

	/**
	 * hides the videoControls
	 */
	proto.hide = function() {
		this._container.style.opacity = "0";
		this._container.style.visibility = "hidden";
	};

	proto.showProgressBar = function() {
		$U.core.util.HtmlHelper.setDisplayInlineBlock(this._pbar);
	};

	proto.showTimeField = function() {
		$U.core.util.HtmlHelper.setDisplayInlineBlock(this._timeField);
	};

	proto.showRemainingTimeField = function() {
		$U.core.util.HtmlHelper.setDisplayInlineBlock(this._remainingTimeField);
	};

	proto.hideProgressBar = function() {
		$U.core.util.HtmlHelper.setDisplayNone(this._pbar);
	};

	proto.hideTimeField = function() {
		$U.core.util.HtmlHelper.setDisplayNone(this._timeField);
	};

	proto.hideRemainingTimeField = function() {
		$U.core.util.HtmlHelper.setDisplayNone(this._remainingTimeField);
	};

	/**
	 * Resizes the controls to the desired width
	 * @param {Number} videoWidth
	 */
	proto.resize = function(top, width) {
		var nodes, node, pbarLeft, pbarRight;
		if (width) {
			this._currentWidth = width;
			$U.core.util.HtmlHelper.setWidth(this._container, width);
			if ($U.core.Device.isPhone()) {
				$U.core.util.HtmlHelper.setTop(this._container, top);
				$U.core.util.HtmlHelper.setLeft(this._container, (this._container.parentNode.offsetWidth - width) / 2);
			}
		}
		if (this._remainingTimeField) {
			//remaining time goes to left of resize button
			nodes = document.querySelectorAll("[" + POSITION_ATTRIBUTE + "='true']");
			if (nodes.length > 1) {
				//otherwise the remaining time field is the only thing on the right
				node = nodes[0];
				$U.core.util.HtmlHelper.setRight(this._remainingTimeField, node.offsetWidth);
			}
		}

		if(this._liveButton) {
			//remaining time goes to left of resize button
			nodes = document.querySelectorAll("[" + POSITION_ATTRIBUTE + "='true']");
			if (nodes.length > 1) {
				//otherwise the remaining time field is the only thing on the right
				node = nodes[0];
				$U.core.util.HtmlHelper.setRight(this._liveButton, node.offsetWidth);
			}
		}

		if (this._pbar) {
			//the progressbar goes between the timefield and the left-most item on the right
			node = this._timeField;
			if (node) {
				pbarLeft = node.offsetLeft + node.offsetWidth;
				$U.core.util.HtmlHelper.setLeft(this._pbar, pbarLeft);
			}
			//get leftist right item
			nodes = document.querySelectorAll("[" + POSITION_ATTRIBUTE + "='true']");
			node = nodes[nodes.length - 1];
			if (node) {
				pbarRight = this._currentWidth - node.offsetLeft;
			} else {
				pbarRight = 0;
			}
			$U.core.util.HtmlHelper.setRight(this._pbar, pbarRight);
		}
	};

	return VideoControls;
}());
