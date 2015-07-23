/**
 * @class $U.epg.widgets.NowNextGrid
 * @extends $U.epg.widgets.Grid
 * Class that represents the EPG grid in the EPG, used in the now/next layout
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Array} channels Array of channel objects
 * @param {Object} EPGState Representation of the state of the EPG currently
 * @param {Object} owner Owner object (most likely its caller)
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.NowNextGrid = ( function() {

	var DATA_ATTRIBUTE = "data-event-id";
	var SCROLLER_NAME = "EPGGridScroller";

	var noProgrammesIndex = 0;

	var superClass = $U.epg.widgets.EPGGrid;

	var NowNextGrid = function(container, scrollX, scrollY, measureContent, notifyEdge) {
		superClass.call(this, container, scrollX, scrollY, measureContent, notifyEdge);
	};

	//Extends class Grid
	$N.apps.util.Util.extend(NowNextGrid, superClass);

	var proto = NowNextGrid.prototype;

	/**
	 * @method build
	 * Builds an array of EPGEvent objects for the given EPG Window and channels passed in during construction
	 * Gets the now and next programmes, if they aren't available then it adds dummy events
	 */
	proto.build = function(channels, windowStart, windowEnd, showNowBar, hasPreviousBar, callback) {

		var that = this;
		var i;
		var eventCount = 0;

		this.epgState = {
			channels : channels,
			windowStart : windowStart,
			windowEnd : windowEnd,
			showNowBar : showNowBar,
			hasPreviousBar : hasPreviousBar
		};
		var events = {};

		function createDummyEvent(channel, startTime, endTime) {
			return new $U.core.mediaitem.BTVEventItem({
				serviceID : channel.serviceId,
				startTime : startTime,
				endTime : endTime,
				title : $U.core.util.StringHelper.getString("txtNoProgrammes"),
				eventId : "U" + (noProgrammesIndex++)
			}, channel);
		}

		function incrementEventCount() {
			eventCount++;
			//want to have 2 events per channel, so finished if this is true:
			if (eventCount === channels.length * 2) {
				that.buildCallback(events, channels, windowStart, windowEnd, showNowBar, hasPreviousBar);
				if ( typeof callback === "function") {
					callback();
				}
			}
		}

		channels.forEach(function(channel, channelIndex) {
			events[channel.serviceId] = [];
			that.getDataProvider().fetchCurrentEventForChannel(channel, function(event) {
				if (event.startTime === Number.NEGATIVE_INFINITY) {
					event = createDummyEvent(channel, event.startTime, event.endTime);
				}
				events[channel.serviceId].push(new $U.epg.widgets.NowNextEPGEvent(event, channelIndex, that.epgState, channel, that, $U.epg.widgets.NowNextEPGEvent.NOW));
				incrementEventCount();
			});
			that.getDataProvider().fetchNextEventForChannel(channel, function(event) {
				if (event.startTime === Number.NEGATIVE_INFINITY) {
					event = createDummyEvent(channel, event.startTime, event.endTime);
				}
				events[channel.serviceId].push(new $U.epg.widgets.NowNextEPGEvent(event, channelIndex, that.epgState, channel, that, $U.epg.widgets.NowNextEPGEvent.NEXT));
				incrementEventCount();
			});
		});
	};

	/**
	 * @method buildCallback 
	 * Once all the data has been collated this is run to put the data in the correct format
	 */
	proto.buildCallback = function(events, channels, windowStart, windowEnd, showNowBar, hasPreviousBar) {

		var epgState = {
			windowStart : windowStart,
			windowEnd : windowEnd
		};

		var channel;

		var eventElements = [];

		var that = this;

		channels.forEach(function(channel, channelIndex) {
			events[channel.serviceId].forEach(function(event) {
				eventElements.push(event);
			});
		});

		this._events = eventElements;
		this.display(epgState, channels, showNowBar, hasPreviousBar);
	};

	/**
	 * @method updateState
	 * Iterates over the epgevents check to see if it needs to do a full refresh,
	 * if not then it just updates the text for the time left on the now buttons
	 *
	 * @param {Date} timeNow
	 */
	proto.updateState = function(timeNow) {
		if (this._events) {
			var i;
			var fullUpdate = false;
			var evLength = this._events.length;
			//check to see if need to refresh whole screen
			for ( i = 0; i < evLength; i = i + 1) {
				fullUpdate = this._events[i].isNextNow(timeNow);
				if (fullUpdate) {
					i = evLength;
				}
			}

			if (fullUpdate) {
				this._events = [];
				this.build(this.epgState.channels, this.epgState.windowStart, this.epgState.windowEnd, this.epgState.showNowBar, this.epgState.hasPreviousBar);
			} else {
				for ( i = 0; i < evLength; i = i + 1) {
					this._events[i].updateState(timeNow);
				}
			}
		}
	};

	return NowNextGrid;
}());
