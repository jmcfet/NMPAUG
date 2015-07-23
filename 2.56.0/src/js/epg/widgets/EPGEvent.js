/**
 * Class that contains the data and methods of an epg event for display in the epg grid
 * @class $U.epg.widgets.EPGEvent
 * @constructor
 * @param {Object} eventData EPGEvent object
 * @param {Number} channelIndex Index of the channel that this EPGEvent is being built for
 * @param {Object} EPGState Representation of the EPG State
 * @param {Object} channel Channel Object
 * @param {Object} owner Owner object (most likely its caller)
 * */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.EPGEvent = ( function() {

	var DATA_ATTRIBUTE = "data-event-id";

	var PIXELS_PER_MINUTE = null;

	var PIXELS_PER_CHANNEL = null;

	var EVENT_TYPES = {
		DEFAULT : {
			name : "DEFAULT",
			icon : "icon-info-sign"
		},
		ON_NOW : {
			name : "ON_NOW",
			icon : ""
		},
		PAST : {
			name : "PAST",
			icon : ""
		},
		REMINDER : {
			name : "REMINDER",
			icon : ""
		},
		PVR_RECORDING : {
			name : "PVR_RECORDING",
			icon : "icon-circle"
		},
		PVR_SCHEDULED : {
			name : "PVR_SCHEDULED",
			icon : "icon-circle"
		},
		NPVR_RECORDING : {
			name : "NPVR_RECORDING",
			icon : "icon-play"
		},
		NPVR_SCHEDULED : {
			name : "NPVR_SCHEDULED",
			icon : "icon-circle"
		},
		CATCHUP : {
			name : "CATCHUP",
			icon : "icon-backward"
		},
		UNSUBSCRIBED : {
			name : "UNSUBSCRIBED",
			icon : ""
		},
		BLOCKED : {
			name : "BLOCKED",
			icon : "icon-lock"
		}
	};

	var EVENT_SIZES = {
		NORMAL : {
			name : "normal",
			width : 1000
		},
		SMALL : {
			name : "small",
			width : 50
		},
		TINY : {
			name : "tiny",
			width : 15
		}
	};

	var EPGEvent = function(eventData, channelIndex, EPGState, channel, owner) {

		PIXELS_PER_MINUTE = PIXELS_PER_MINUTE || $U.epg.EPGScreen.getPixelsPerMinute();
		PIXELS_PER_CHANNEL = PIXELS_PER_CHANNEL || $U.epg.EPGScreen.getPixelsPerChannel();

		this._owner = owner;
		this._eventType = EVENT_TYPES.DEFAULT;
		this._EPGState = EPGState;
		this._nowEvent = false;
		this._pastEvent = false;
		this._eventData = eventData;
		this._channelIndex = channelIndex;
		this._isBlocked = false;
		this._isSubscribed = channel.subscribed;
		this._eventSize = EVENT_SIZES.NORMAL;

		this._eventElement = document.createElement("div");
		this._eventElement.id = "evt" + eventData.id;

		$U.core.util.HtmlHelper.setClass(this._eventElement, "epg-event");
		if (!this._isSubscribed) {
			$U.core.util.HtmlHelper.setClass(this._eventElement, "unsubscribed-event");
		}

		if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(eventData.rating)) {
			this._addEventText();

			/* only attach a hander for real events, not dummy 'no programme' ones (eventIds starting with 'U') */
			if (eventData.id.charAt(0) !== "U") {
				this._eventElement.setAttribute(DATA_ATTRIBUTE, eventData.id);
				this._eventElement.addEventListener('click', function(evt) {
					owner.eventClickHandler(evt);
				}, true);
			}

		} else {
			this._isBlocked = true;
			this._addEventTextBlocked();
		}
	};

	/**
	 * Adds the text to be displayed on the event
	 *
	 * @private
	 */
	EPGEvent.prototype._addEventText = function() {

		this._eventElement.innerHTML = "";
		this._eventElement.appendChild(document.createTextNode(this._eventData.title));
		this._eventElement.appendChild(document.createElement("br"));

		this._eventElement.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(new Date(this._eventData.startTime))));
	};

	/**
	 * What to display when the event is above the parental rating
	 * @private
	 */
	EPGEvent.prototype._addEventTextBlocked = function() {

		this._eventElement.innerHTML = "";
		this._eventElement.appendChild(document.createTextNode(" " + $U.core.util.StringHelper.getString("txtTitleBlocked")));
		this._eventElement.appendChild(document.createElement("br"));
		this._eventElement.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(new Date(this._eventData.startTime))));

		$U.core.util.HtmlHelper.setClass(this._eventElement, "blockedEvent");
	};

	/**
	 * Size and then attach the  element to the given container
	 *
	 * @param {HTMLElement} Element to attach this EPGEvent element to
	 * @param {Boolean} hasPreviousBar Flag to define whether the 'previous' channels bar element needs to be accounted for
	 * @return {Number} Number of pixels down from top of the container this EPGEvent DOM element is
	 */
	EPGEvent.prototype.display = function(container, hasPreviousBar) {
		var chanIndex = this._channelIndex;
		if (hasPreviousBar) {
			chanIndex++;
		}
		this._sizeAndPosition(this._EPGState.windowStart, this._EPGState.windowEnd, PIXELS_PER_MINUTE, chanIndex);
		container.appendChild(this._eventElement);
		this.updateState(new Date());
		return this._eventElement.offsetTop;
	};

	/**
	 * Set the width of the Event (its run time), taking into account it may start before the epgWindowStart and end likewise at epgWindowEnd
	 * @private
	 *
	 * @param {Number} epgStart Start of EPG Window in milliseconds
	 * @param {Number} epgEnd End of EPG Window in milliseconds
	 * @param {Number} pixelsPerMinute How many pixels per minute are there for this grid (i.e. 240 pixel hour == 4 pixel minute)
	 * @param {Number} channelIndex Index of the current channel in the channelArray
	 */
	EPGEvent.prototype._sizeAndPosition = function(epgStart, epgEnd, pixelsPerMinute, channelIndex) {
		var calcStart, calcEnd, timeSpan, eventWidth;

		if (this._eventData.startTime < epgStart) {
			calcStart = epgStart;
		} else {
			calcStart = this._eventData.startTime;
		}

		if (this._eventData.endTime > epgEnd) {
			calcEnd = epgEnd;
		} else {
			calcEnd = this._eventData.endTime;
		}

		timeSpan = calcEnd - calcStart;

		/* Size the div according to how many pixels there are in one minute */
		eventWidth = (((timeSpan) / 1000) / 60) * pixelsPerMinute;

		this._eventElement.style.width = eventWidth + "px";

		/* Alter display of an event tile if it is less that 50 pixels (replace with an icon) or less than 15 (blank it altogether). 14px is the size of the info icon */
		if (eventWidth <= EVENT_SIZES.TINY.width) {
			$U.core.util.HtmlHelper.emptyEl(this._eventElement);
			$U.core.util.HtmlHelper.setClass(this._eventElement, "tinyEvent");
			this._eventSize = EVENT_SIZES.TINY;
			this._setIcon(this._eventElement, null);
		} else if (eventWidth < EVENT_SIZES.SMALL.width) {
			$U.core.util.HtmlHelper.emptyEl(this._eventElement);
			$U.core.util.HtmlHelper.setClass(this._eventElement, "smallEvent");
			this._eventSize = EVENT_SIZES.SMALL;
			if (this._isBlocked) {
				$U.core.util.HtmlHelper.setClass(this._eventElement, "blockedEvent");
				this._setIcon(this._eventElement, EVENT_TYPES.BLOCKED.icon);
			} else {
				this._setIcon(this._eventElement, EVENT_TYPES.DEFAULT.icon);
			}
		} else {
			if (this._isBlocked) {
				this._setIcon(this._eventElement, EVENT_TYPES.BLOCKED.icon, true);
				$U.core.util.HtmlHelper.setClass(this._eventElement, "blockedEvent");
			}
		}

		/* Position it */
		this._eventElement.style.left = ((((calcStart - epgStart) / 1000) / 60) * pixelsPerMinute) + "px";
		this._eventElement.style.top = (PIXELS_PER_CHANNEL * channelIndex) + "px";
	};

	/**
	 * Sets the state and highlight of an event when called
	 *
	 *@param {Date} timeNow
	 */
	EPGEvent.prototype.updateState = function(timeNow) {/* TODO - refactor */
		var newEventType = this._setEventType(timeNow);

		if (this._eventType !== newEventType) {
			//remove old classes
			switch(this._eventType) {
			case EVENT_TYPES.ON_NOW:
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "now-event");
				break;
			case EVENT_TYPES.PAST:
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "past-event");
				break;
			case EVENT_TYPES.NPVR_SCHEDULED:
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "scheduled-event");
				this._setIcon(this._eventElement, null);
				break;
			case EVENT_TYPES.NPVR_RECORDING:
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "recording-event");
				this._setIcon(this._eventElement, null);
				break;
			case EVENT_TYPES.CATCHUP:
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "catchup-event");
				this._setIcon(this._eventElement, null);
				break;
			}
			//add new classes
			switch(newEventType) {
			case EVENT_TYPES.ON_NOW:
				$U.core.util.HtmlHelper.setClass(this._eventElement, "now-event");
				break;
			case EVENT_TYPES.PAST:
				$U.core.util.HtmlHelper.setClass(this._eventElement, "past-event");
				break;
			case EVENT_TYPES.NPVR_SCHEDULED:
				$U.core.util.HtmlHelper.setClass(this._eventElement, "scheduled-event");
				if (this._eventSize === EVENT_SIZES.NORMAL) {
					this._setIcon(this._eventElement, EVENT_TYPES.NPVR_SCHEDULED.icon, true);
				}
				break;
			case EVENT_TYPES.NPVR_RECORDING:
				$U.core.util.HtmlHelper.setClass(this._eventElement, "recording-event");
				if (this._eventSize === EVENT_SIZES.NORMAL) {
					this._setIcon(this._eventElement, EVENT_TYPES.NPVR_RECORDING.icon, true);
				}
				break;
			case EVENT_TYPES.CATCHUP:
				$U.core.util.HtmlHelper.setClass(this._eventElement, "catchup-event");
				if (this._eventSize === EVENT_SIZES.NORMAL) {
					this._setIcon(this._eventElement, EVENT_TYPES.CATCHUP.icon, true);
				}
				break;
			}
			//check that the highlight is correct for nPVR etc.
			if ((this._eventElement.className.indexOf("scheduled-event") > 0 || this._eventElement.className.indexOf("recording-event") > 0) && this._eventElement.className.indexOf("epg-active-element") > 0 ) {
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "epg-active-element");
				$U.core.util.HtmlHelper.setClass(this._eventElement, "epg-active-npvr-element");
			} else if ((this._eventElement.className.indexOf("scheduled-event") < 0 && this._eventElement.className.indexOf("recording-event") < 0) && this._eventElement.className.indexOf("epg-active-npvr-element") > 0 ){
				$U.core.util.HtmlHelper.removeClass(this._eventElement, "epg-active-npvr-element");
				$U.core.util.HtmlHelper.setClass(this._eventElement, "epg-active-element");
			}

		}
		this._eventType = newEventType;
	};

	/**
	 * Build and prepend the required iconography to the element.  If icon is null, icon is removed
	 * @private
	 * @param {HTMLElement} element Element to prepend the icon to
	 * @param {String} icon icon to use
	 * @param {Boolean} padding Should icon have right padding (default false)
	 */
	EPGEvent.prototype._setIcon = function(element, icon, padding) {
		var needsPadding = padding || false;
		var eventIcon = document.createElement("i");
		var isSmallEvent;
		var idx;

		eventIcon.id = "icon" + this._eventElement.id;
		eventIcon.innerHTML = needsPadding ? "&nbsp;" : "";

		if (icon) {
			$U.core.util.HtmlHelper.setClass(eventIcon, icon);
			this._eventElement.insertBefore(eventIcon, element.firstChild);
		} else {
			idx = element.className.indexOf('smallEvent');
			if(idx !== -1) {
				isSmallEvent = true;
			}
			if (element.contains(document.getElementById(eventIcon.id)) && !isSmallEvent) {
				element.removeChild(document.getElementById(eventIcon.id));
			}
		}
	};

	/**
	 * @private
	 * Sets the 'type' of event this tile is (one or more of "catch-up/recording/reminder/recorded")
	 *  This is then used by updateState to change how the event looks in the epg */
	EPGEvent.prototype._setEventType = function(timeNow) {
		var eventType = EVENT_TYPES.DEFAULT;
		var npvrStatus;
		if (this._isSubscribed) {
			if (this._nowEvent) {
				if (this._eventData.isPast && this._nowEvent) {
					eventType = EVENT_TYPES.PAST;
					this._nowEvent = false;
					this._pastEvent = true;
				}
				eventType = EVENT_TYPES.ON_NOW;
			} else {
				this._pastEvent = false;
				if (this._eventData.isOnNow) {
					this._nowEvent = true;
					eventType = EVENT_TYPES.ON_NOW;
				} else if (this._eventData.isPast && !this._pastEvent) {
					this._pastEvent = true;
					eventType = EVENT_TYPES.PAST;
				}
			}
			if (this._eventData.inLocker && this._eventData.npvrEnabled && $U.core.NPVRManager.getInstance().isAccountEnabled()) {
				if (this._eventData.completed) {
					eventType = EVENT_TYPES.NPVR_RECORDING;
				} else {
					eventType = EVENT_TYPES.NPVR_SCHEDULED;
				}
			}
			if (this._eventData.isCatchUp && this._eventData.isPast) {
				eventType = EVENT_TYPES.CATCHUP;
			}
		} else {
			eventType = EVENT_TYPES.UNSUBSCRIBED;
		}
		return eventType;
	};

	EPGEvent.prototype.getElement = function() {
		return this._eventElement;
	};

	EPGEvent.prototype.getEventData = function() {
		return this._eventData;
	};

	return EPGEvent;

}());
