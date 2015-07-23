/**
 * Class that contains the data and methods of an epg event for display in the epg grid, this is used for the now/next layout, it shows just what's on now and next
 * @class $U.epg.widgets.NowNextEPGEvent
 * @extends $U.epg.widgets.EPGEvent
 * @constructor
 * @param {Object} eventData EPGEvent object
 * @param {Number} channelIndex Index of the channel that this EPGEvent is being built for
 * @param {Object} EPGState Representation of the EPG State
 * @param {Object} channel Channel Object
 * @param {Object} owner Owner object (most likely its caller)
 * @param {Object} nowNext whether the event is now or next
 * */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.NowNextEPGEvent = ( function() {

	var DATA_ATTRIBUTE = "data-event-id";
	var NOW = {};
	var NEXT = {};

	var NowNextEPGEvent = function(eventData, channelIndex, EPGState, channel, owner, nowNext) {
		$U.epg.widgets.EPGEvent.call(this, eventData, channelIndex, EPGState, channel, owner);
		this._nowNext = nowNext;
	};

	//Extends class EPGEvent
	$N.apps.util.Util.extend(NowNextEPGEvent, $U.epg.widgets.EPGEvent);

	/**
	 * Adds the text to be displayed on the event
	 * display how much time is left for now and the start/finish times for next
	 * @private
	 */
	NowNextEPGEvent.prototype._addEventText = function() {

		this._eventElement.innerHTML = "";
		this._eventElement.appendChild(document.createTextNode(this._eventData.title));
		this._eventElement.appendChild(document.createElement("br"));

		if(this._eventData.startTime !== Number.NEGATIVE_INFINITY){
			if (this._nowNext === NOW) {
				this._eventElement.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(new Date(this._eventData.startTime)) + " (" + $U.core.util.StringHelper.getString("txtTimeRemaining", {
					DURATIONSTRING : $U.core.util.Formatter.formatDuration(Date.now(), this._eventData.endTime)
				}) + ")"));
			} else {
				this._eventElement.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(new Date(this._eventData.startTime)) + " - " + $U.core.util.Formatter.formatTime(new Date(this._eventData.endTime))));
			}
		}
	};

	/**
	 * What to display when the event is above the parental rating
	 * @private
	 */
	NowNextEPGEvent.prototype._addEventTextBlocked = function() {

		this._eventElement.innerHTML = "";
		this._eventElement.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtTitleBlocked")));
		this._eventElement.appendChild(document.createElement("br"));

		if(this._eventData.startTime !== Number.NEGATIVE_INFINITY){
			if (this._nowNext === NOW) {
				this._eventElement.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(new Date(this._eventData.startTime)) + " (" + $U.core.util.StringHelper.getString("txtTimeRemaining", {
					DURATIONSTRING : $U.core.util.Formatter.formatDuration(Date.now(), this._eventData.endTime)
				}) + ")"));
			} else {
				this._eventElement.appendChild(document.createTextNode($U.core.util.Formatter.formatTime(new Date(this._eventData.startTime)) + " - " + $U.core.util.Formatter.formatTime(new Date(this._eventData.endTime))));
			}
		}
	};

	/**
	 * Size and then attach the  element to the given container
	 *
	 * @param {HTMLElement} container to attach this EPGEvent element to
	 * @param {Boolean} hasPreviousBar Flag to define whether the 'previous' channels bar element needs to be accounted for
	 */
	NowNextEPGEvent.prototype.display = function(container, hasPreviousBar) {
		var chanIndex = this._channelIndex;
		if (hasPreviousBar) {
			chanIndex++;
		}
		this._addEventText();
		this._sizeAndPosition(this._nowNext, chanIndex);
		container.appendChild(this._eventElement);
		return this._eventElement.offsetTop;
	};

	/**	 
	 * Set the width of the Event (its run time), taking into account it may start before the epgWindowStart and end likewise at epgWindowEnd
	 * @private
	 *
	 * @param {Object} nowNext whether the event is now or next
	 * @param {Number} channelIndex Index of the current channel in the channelArray
	 */
	NowNextEPGEvent.prototype._sizeAndPosition = function(nowNext, channelIndex) {

		/* Size it */
		this._eventElement.style.width = "49%";

		/* Position it */
		if (nowNext === NOW) {
			this._eventElement.style.left = 0 + "px";
		} else {
			this._eventElement.style.left = "50%";
		}
		this._eventElement.style.top = ($U.epg.EPGScreen.getPixelsPerChannel() * channelIndex) + 'px';
	};

	/**
	 * Checks to see if an event that claims to be next is actually on now
	 *
	 * @param {Date} timeNow the time, now
	 * @return {boolean} true if the event is telling porkies
	 */
	NowNextEPGEvent.prototype.isNextNow = function(timeNow) {
		//only want to check next items
		if (this._nowEvent || this._nowNext === NOW) {
			return false;
		}
		if (this._nowNext === NEXT && this._eventData.startTime < timeNow.getTime()) {
			return true;
		}
		return false;
	};

	/**
	 * Sets the state and highlight of an event when called, if NOW then change the text on the button
	 * @param {Date} timeNow
	 */
	NowNextEPGEvent.prototype.updateState = function(timeNow) {/* TODO - refactor */
		if (this._nowEvent) {
			this._addEventText();
		} else {
			if (this._eventData.startTime <= timeNow.getTime() && this._eventData.endTime >= timeNow.getTime()) {
				$(this._eventElement).addClass("now-event");
				$(this._eventElement).removeClass("past-event");
				this._addEventText();
				this._nowEvent = true;
			}
		}
	};

	NowNextEPGEvent.NOW = NOW;
	NowNextEPGEvent.NEXT = NEXT;
	return NowNextEPGEvent;

}());
