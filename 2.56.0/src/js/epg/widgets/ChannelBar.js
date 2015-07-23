/**
 * @class $U.epg.widgets.ChannelBar
 * Class that represents the channel bar in an EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 */

var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.ChannelBar = ( function() {

	var DEFAULT_SQUARE_IMAGE = "images/missing_square.png";

	var SCROLLER_NAME = "EPGChannelScroller";

	/* Holds a reference to the current first channel as displayed, used a as a comparison for a refresh */
	var currentChannelsStartId = null;

	var superClass = $U.epg.widgets.EPGScrollerWidget;

	function ChannelBar(container) {
		superClass.call(this, container, SCROLLER_NAME, false, true);
	}

	$N.apps.util.Util.extend(ChannelBar, superClass);

	/**
	 * Fills the channel bar with HTML elements representing channels
	 * @param {Array} channels Array of channel items
	 * @param {Object} EPGState Representation of the state of the EPG currently
	 */
	ChannelBar.prototype.populate = function(channels, EPGState) {
		var i, channel, channelLogo, previousBar, nextBar;

		var tempFragment = document.createDocumentFragment();

		this.purge();

		/* Based on EPGState, decide whether we need space for previousChannels bar */
		if (EPGState.channelIndex > 0) {
			/* Previous bar needed */
			previousBar = document.createElement("div");
			previousBar.className = "epg-channel-item epg-next-prev-chan-spacer";
			tempFragment.appendChild(previousBar);
		}

		for ( i = 0; i < channels.length; i++) {
			channel = document.createElement("div");

			// Add highlight to channel bar if user touches it for mobile only
			if (!$U.core.Device.isDesktop()) {
				$U.core.util.Highlighter.applyTouchHighlight(channel, "epg-channel-item-highlight");
			}

			channel.id = "ch" + channels[i].serviceId;

			if (channels[i].subscribed) {
				channel.className = "epg-channel-item";
			} else {
				channel.className = "epg-channel-item epg-channel-item-unsubscribed";
			}
			channelLogo = document.createElement("img");
			channelLogo.className = "centred-in-container";
			$U.core.ImageLoader.loadImageAndFitToSize(channelLogo, [channels[i].promoImageURL, DEFAULT_SQUARE_IMAGE], $U.core.ImageLoader.CENTRE, 94, 42);
			this.createChannelListener(channel, channels[i]);
			channel.appendChild(channelLogo);
			tempFragment.appendChild(channel);
		}

		/* Based on EPGState, decide whether we need space for nextChannels bar */
		if ((EPGState.channelIndex + EPGState.channelsPerScreen) < EPGState.totalChannels) {
			/* Next bar needed */
			nextBar = document.createElement("div");
			nextBar.className = "epg-channel-item epg-next-prev-chan-spacer";
			tempFragment.appendChild(nextBar);
		}

		this._container.appendChild(tempFragment);
	};

	/**
	 * @private
	 * Adds a clickhandler to each channel element
	 * @param {Object} channelItem
	 * @param {Object} channel
	 */
	ChannelBar.prototype.createChannelListener = function(channelItem, channel) {
		channelItem.addEventListener('click', function() {
			ChannelBar._clickHandler(channel);
		});
	};

	/**
	 * @private
	 * Clears the channel bar elements from the DOM
	 */
	ChannelBar.prototype.purge = function() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}
	};

	/**
	 * Clears and then rebuilds the channel bar if it has changed
	 * @param {Array} channels Array of channel items
	 * @param {Object} EPGState Representation of the state of the EPG currently
	 */
	ChannelBar.prototype.refresh = function(channels, EPGState) {

		if ((channels.length) > 0 && (currentChannelsStartId !== channels[0].id)) {
			this.populate(channels, EPGState);
			currentChannelsStartId = channels[0].id;
		}
	};

	/** Used to reset the index used to work out whether to refresh the channelbar.  Used when the system is reset. */
	ChannelBar.prototype.reset = function() {
		currentChannelsStartId = null;
	};

	ChannelBar._clickHandler = function(channel) {
		// Create a BTVEventItem for the channel and show the media card screen
		$U.core.mediaitem.BTVEventItem.createForChannel(channel, function(btvEventItem) {
			$U.core.View.showMediaCardScreen(btvEventItem);
		});
	};

	return ChannelBar;
}());

