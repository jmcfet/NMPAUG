/**
 * @class $U.epg.widgets.EPGGrid
 * Class that represents the EPG grid in the EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Array} channels Array of channel objects
 * @param {Object} EPGState Representation of the state of the EPG currently
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.EPGGrid = ( function() {

	var DATA_ATTRIBUTE = "data-event-id";

	var SCROLLER_NAME = "EPGGridScroller";

	var logger = $U.core.Logger.getLogger("EPGGrid");

	var noProgrammesIndex = 0;

	var highlightedElement = null;

	var dataProvider = null;

	/* Holds a reference to the current first channel as displayed, used a as a comparison for a refresh */
	var currentChannelsStartId = null;

	var superClass = $U.epg.widgets.EPGScrollerWidget;

	function EPGGrid(container, scrollX, scrollY, measureContent, notifyEdge) {
		superClass.call(this, container, SCROLLER_NAME, scrollX, scrollY, measureContent, notifyEdge);
		highlightedElement = null;
	}


	$N.apps.util.Util.extend(EPGGrid, superClass);

	var proto = EPGGrid.prototype;

	proto.getDataProvider = function() {
		if (dataProvider === null) {
			dataProvider = $U.epg.dataprovider.BTVDataProvider.getInstance();
		}
		return dataProvider;
	};

	function padEventsList(channel, startTime, endTime, eventsForService) {

		var eventArray = [];
		var eventsForServiceLength = eventsForService ? eventsForService.length : 0;
		var i;

		//Builds a dummy event for empty slots in the EPG
		function createDummyEvent(channel, startTime, endTime) {
			return new $U.core.mediaitem.BTVEventItem({
				serviceID : channel.serviceId,
				startTime : startTime,
				endTime : endTime,
				title : $U.core.util.StringHelper.getString("txtNoProgrammes"),
				eventId : "U" + (noProgrammesIndex++)
			}, channel);
		}

		if (eventsForServiceLength > 0) {
			for ( i = 0; i < eventsForServiceLength; i++) {
				//if first event in list check if we need dummy first
				if (i === 0 && eventsForService[i].startTime > startTime) {
					eventArray.push(createDummyEvent(channel, startTime, eventsForService[i].startTime));
				} else if (i !== 0 && eventsForService[i].startTime !== eventsForService[i - 1].endTime) {
					eventArray.push(createDummyEvent(channel, eventsForService[i - 1].endTime, eventsForService[i].startTime));
				}
				eventArray.push(eventsForService[i]);
			}
			// Does last event reach endTime?  If not, pad end with dummy
			if (eventsForService[i - 1].endTime < endTime) {
				eventArray.push(createDummyEvent(channel, eventsForService[i - 1].endTime, endTime));
			}
		} else {
			eventArray.push(createDummyEvent(channel, startTime, endTime));
		}
		return eventArray;
	}


	proto.getNowBar = function() {
		return this._nowBar;
	};

	/**
	 * Builds an array of EPGEvent objects for the given EPG Window and channels passed in during construction
	 */
	proto.build = function(channels, windowStart, windowEnd, showNowBar, hasPreviousBar, callback) {

		var that = this;
		var buildContinue = function() {
			that.getDataProvider().fetchEvents(channels, windowStart, windowEnd, function(events) {
				that.buildCallback(events, channels, windowStart, windowEnd, showNowBar, hasPreviousBar);
				callback();
			});
		};

		if ($U.core.Configuration.NPVR_ENABLED) {
			$U.core.NPVRManager.getInstance().forceCacheRefresh(buildContinue);
		} else {
			buildContinue();
		}
	};

	proto.buildCallback = function(events, channels, windowStart, windowEnd, showNowBar, hasPreviousBar) {

		var epgState = {
			windowStart : windowStart,
			windowEnd : windowEnd
		};

		var i;
		var j;
		var l;

		var channel;
		var eventsForChannel;

		var eventElements = [];

		var that = this;

		channels.forEach(function(channel, channelIndex) {
			eventsForChannel = padEventsList(channel, windowStart, windowEnd, events[channel.serviceId]);
			events[channel.serviceId] = eventsForChannel;
			events[channel.serviceId].forEach(function(event) {
				eventElements.push(new $U.epg.widgets.EPGEvent(event, channelIndex, epgState, channel, that));
			});
		});

		this._events = eventElements;
		this.display(epgState, channels, showNowBar, hasPreviousBar);
	};

	/**
	 * Takes generated epgEvents and creates and renders their DOM elements to the container passed in during construction
	 */
	proto.display = function(epgState, channels, showNowBar, hasPreviousBar) {

		var tempFragment = document.createDocumentFragment();
		var nowBarEl = document.createElement("div");

		/* Iterate over the channels, building EPGChannelSchedules full of EPGEvents */
		this._events.forEach(function(eventElement) {
			eventElement.display(tempFragment, hasPreviousBar);
		});

		if (showNowBar) {
			nowBarEl.id = "nowBar";
			nowBarEl.className = "now-bar";
			tempFragment.appendChild(nowBarEl);
		}
		this._container.appendChild(tempFragment);

		this._nowBar = new $U.epg.widgets.NowBar(nowBarEl);
	};

	/**
	 * Iterates over the epgevents calling thier update method to update their 'Now' State
	 *
	 * @param {Date} timeNow
	 */
	proto.updateState = function(timeNow) {
		if (this._events) {
			this._events.forEach(function(eventElement) {
				eventElement.updateState(timeNow);
			});
		}
	};

	/**
	 * Updates a specific event in the grid
	 *
	 * @param {Date} timeNow
	 */
	proto.updateEPGEvent = function(eventId, timeNow) {
		this._events.some(function(eventElement) {
			if (eventElement._eventData.id === eventId) {
				eventElement.updateState(timeNow);
				return true;
			}
		});
	};

	/**
	 * Clears out the elements of the EPGGrid ready for a re-render of the epgevents
	 */
	proto.purge = function() {
		$U.core.util.HtmlHelper.emptyEl(this._container);
	};

	/**
	 * Handler for a selection event of an EPGEvent DOM element.
	 * @param {Event} evt The event that was raised from the selection of an EPG Event DOM Element
	 */
	proto.eventClickHandler = function(evt) {

		var target = evt.currentTarget;
		var eventId = target.getAttribute(DATA_ATTRIBUTE);
		var btvEventItem = null;
		var display = function(item) {
			if ($U.core.Device.isPhone()) {
				// Phone devices click straight through to the mediacard
				// Timeout -> timeout is necessary to actually see the result of
				// highlighting the event before switching screens
				window.setTimeout(function() {
					window.setTimeout(function() {
						$U.core.View.showMediaCardScreen(item);
					}, 0);
				}, 0);
			} else {
				// Other devices have a mini media card
				$U.epg.EPGScreen.displayMiniMediaCard(item);
			}
		};

		// Iterate through the elements until we find the target, setting the btvEventItem
		this._events.some(function(eventElement) {
			if (eventElement.getElement() === target) {
				btvEventItem = eventElement.getEventData();
				return true;
			}
		});

		// Highlight the event
		if (highlightedElement !== null) {
			$U.core.util.HtmlHelper.removeClass(document.getElementById("evt" + highlightedElement), "epg-active-element");
			$U.core.util.HtmlHelper.removeClass(document.getElementById("evt" + highlightedElement), "epg-active-npvr-element");
		}

		highlightedElement = eventId;
		if (target.className.indexOf("scheduled-event") > 0 || target.className.indexOf("recording-event") > 0) {
			$U.core.util.HtmlHelper.setClass(document.getElementById("evt" + highlightedElement), "epg-active-npvr-element");
		} else {
			$U.core.util.HtmlHelper.setClass(document.getElementById("evt" + highlightedElement), "epg-active-element");
		}

		if (btvEventItem.isCatchUp && btvEventItem.isPast && $U.core.Configuration.FETCH_CATCHUP_VOD_ASSETS) {
			$U.core.menudata.MDSAdapter.getCatchupAssetForBtvEvent(btvEventItem, function(catchupItem) {
				display(catchupItem || btvEventItem);
			});
		} else {
			display(btvEventItem);
		}
	};

	/**
	 * Removes the highlight from the currently highlighted epg event
	 */
	proto.removeEventHighlight = function() {
		if (highlightedElement !== null) {
			$U.core.util.HtmlHelper.removeClass(document.getElementById("evt" + highlightedElement), "epg-active-element");
			$U.core.util.HtmlHelper.removeClass(document.getElementById("evt" + highlightedElement), "epg-active-npvr-element");
		}
	};

	return EPGGrid;
}());
