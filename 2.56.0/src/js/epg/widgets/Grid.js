/**
 * @class $U.epg.widgets.Grid
 * Class that represents the EPG grid in the EPG
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

$U.epg.widgets.Grid = ( function() {

	var DATA_ATTRIBUTE = "data-event-id";

	var noProgrammesIndex = 0;
	var channelHeightIndex = 0;
	var highlightedElement = null;

	var Grid = function(container, channels, EPGState) {
		this._container = container;
		this._EPGEvents = [];
		this._EPGState = EPGState;
		this._channels = channels;
		noProgrammesIndex = 0;
		channelHeightIndex = 0;
	};

	/**
	 * Applies a style to the given element, removing it from any previous element
	 * @param {string} eventId The unique data-attribute of the element to be highlighted
	 * @private
	 */
	var _highlightEvent = function(eventId) {

		if (highlightedElement !== null) {
			$U.core.util.HtmlHelper.removeClass(document.getElementById("evt" + highlightedElement),"epg-active-element");
		}

		highlightedElement = eventId;
		$U.core.util.HtmlHelper.setClass(document.getElementById("evt" + highlightedElement),"epg-active-element");
	};

	function getEventsForChannelWithDummyEvents(serviceId, startTime, endTime, getDummyEvent) {
		var data = $N.platform.btv.EPG.getEventsForChannelWithDummyEvents(serviceId, startTime, endTime, getDummyEvent);
		var l = data.length;
		var result = [];
		var i;
		for (i = 0; i < l; i++) {
			result.push($U.core.mediaitem.BTVEventItem.create(data[i]));
		}
		return result;
	}

	/**
	 * Builds an array of EPGEvent objects for the given EPG Window and channels passed in during construction
	 */
	Grid.prototype.build = function() {
		var i, j, k, sdpEPGevents;

		/* Iterate over the channels, building EPGEvents */
		for ( i = 0; i < this._channels.length; i = i + 1) {
			sdpEPGevents = getEventsForChannelWithDummyEvents(this._channels[i].serviceId, this._EPGState.windowStart, this._EPGState.windowEnd, this._dummyEventMaker);
			for ( j = 0; j < sdpEPGevents.length; j = j + 1) {
				this._EPGEvents.push(new $U.epg.widgets.EPGEvent(sdpEPGevents[j], i, this._EPGState, this._channels[i], this));
			}
		}
	};

	/**
	 * Takes generated epgEvents and creates and renders their DOM elements to the container passed in during construction
	 */
	Grid.prototype.display = function(showNowBar) {

		var i;
		var nowBar = document.createElement("div");
		var topIndex;
		var hasPreviousBar = false;
		var tempFragment = document.createDocumentFragment();

		/* Work out the page x of y numbers */
		var totalPages = this._EPGState.totalChannels / this._EPGState.channelsPerScreen;
		var currentPage = Math.ceil(this._EPGState.channelIndex / this._EPGState.channelsPerScreen) + 1;

		this.purge();

		/* Decide, based on number of channels available and current channels displayed whether there needs to be a next/previous bar attached to the top/bottom of the grid */
		if (this._EPGState.channelIndex > 0) {
			hasPreviousBar = true;
		}

		var scrollContainer;
		var currentChannel;

		/* Iterate over the channels, building EPGChannelSchedules full of EPGEvents */
		for ( i = 0; i < this._EPGEvents.length; i = i + 1) {
			topIndex = this._EPGEvents[i].display(tempFragment, hasPreviousBar);
		}

		if (showNowBar) {
			nowBar.id = "nowBar";
			nowBar.className = "now-bar";
			tempFragment.appendChild(nowBar);
		}
		this._container.appendChild(tempFragment);
	};

	/**
	 * Creates a scroll container, used for virtualizing purposes
	 *
	 * @param {Number} channelIndex
	 */
	function createScrollContainer(channelIndex) {
		var element = document.createElement('div');

		element.className = 'epg-event-row';
		element.style.height = $U.epg.EPGScreen.getPixelsPerChannel() + "px";
		element.style.top = ($U.epg.EPGScreen.getPixelsPerChannel() * (channelIndex + 1)) + 'px';

		return element;
	}

	/**
	 * Iterates over the epgevents calling thier update method to update their 'Now' State
	 *
	 * @param {Date} timeNow
	 */
	Grid.prototype.updateState = function(timeNow) {
		var i;
		for ( i = 0; i < this._EPGEvents.length; i = i + 1) {
			this._EPGEvents[i].updateState(timeNow);
		}
	};

	/**
	 * Clears out the elements of the EPGGrid ready for a re-render of the epgevents
	 */
	Grid.prototype.purge = function() {
		$U.core.util.HtmlHelper.emptyEl(this._container);
	};

	/**
	 * Builds a dummy event for empty slots in the EPG
	 * @param serviceID {number} serviceId to be used
	 * @param {number} startTime Start time in milliseconds
	 * @param {number} endTime End time in milliseconds
	 * @return {Object} Dummy event data
	 * @private
	 */
	Grid.prototype._dummyEventMaker = function(serviceId, startTime, endTime) {
		return {
			serviceID : serviceId,
			startTime : startTime,
			endTime : endTime,
			title : $U.core.util.StringHelper.getString("txtNoProgrammes"),
			eventId : "U" + (noProgrammesIndex++)
		};
	};

	/**
	 * Handler for a selection event of an EPGEvent DOM element.
	 * @param {Event} evt The event that was raised from the selection of an EPG Event DOM Element
	 */
	Grid.prototype.eventClickHandler = function(evt) {
		var eventId = evt.currentTarget.getAttribute(DATA_ATTRIBUTE);

		// Highlight the event
		_highlightEvent(eventId);

		var btvEventItem = $U.core.mediaitem.BTVEventItem.create(eventId);

		if ($U.core.Device.isPhone()) {
			// Phone devices click straight through to the mediacard
			// Timeout -> timeout is necessary to actually see the result of
			// highlighting the event before switching screens
			window.setTimeout(function() {
				window.setTimeout(function() {
					$U.core.View.showMediaCardScreen(btvEventItem);
				}, 0);
			}, 0);
		} else {
			// Other devices have a mini media card
			$U.epg.EPGScreen.displayMiniMediaCard(btvEventItem);
		}
	};
	
	/**
	 * Removes the highlight from the currently highlighted epg event 
	 */
	Grid.prototype.removeEventHighlight =  function() {
		if (highlightedElement !== null) {
			$U.core.util.HtmlHelper.removeClass(document.getElementById("evt" + highlightedElement),"epg-active-element");
		}
	};

	return Grid;
}());
