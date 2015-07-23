/**
 * Builds the EPG HTML into the DOM
 * TODO - make generation of this html more programmatic
 * @class $U.epg.EPGElements
 */

var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.EPGElements = ( function() {

	var gridIconSize = $U.core.Device.isPhone() ? "icon-3x" : "icon-4x";



	var content = '<div id="epg" class="screen epg-screen hide">' +

				'<div id="epgTopBar" class="epg-top-bar"></div>' +
				'<div id="scrollerContainerDaybar" class="epg-scroller-container-daybar">' +
					'<div id="dayBar" class="epg-day-bar"></div>' +
				'</div>' +

				'<div id="scrollerContainerTimebar" class="epg-scroller-container-timebar">' +
					'<div id="timeBar" class="epg-time-bar"></div>' +
				'</div>' +

				'<div id="scrollerContainerChannelbar" class="epg-scroller-container-channelbar">' +
					'<div id="channelbar" class="epg-channel-bar "></div>' +
				'</div>' +
				'<div id="scrollerContainerEPG" class="epg-scroller-container-epg">' +
					'<div id="previousArrow" class="epg-previous-arrow epg-arrows left-in-container">' +
						'<div>' +
							'<span id="prevDate"></span>' +
							'<br />' +
							'<i class="icon-chevron-left ' +  gridIconSize + '" ></i>' +
						'</div>' +
					'</div>' +
					'<div id="epgGrid" class="epg-grid"></div>' +
					'<div id="leftScrollArrow" class="epg-previous-arrow epg-scroll-arrows left-in-container">' +
						'<div>' +
							'<br />' +
							'<i class="icon-chevron-left ' +  gridIconSize + '"> </i>' +
						'</div>' +
					'</div>' +
					'<div id="previousChannelArrow" class="epg-previous-channel-arrow epg-chan-arrows-previous up-in-container">' +
						'<i class="icon-chevron-up ' + gridIconSize + '"></i>' +
					'</div>' +
					'<div id="nextArrow" class="epg-next-arrow epg-arrows right-in-container">' +
						'<div>' +
							'<span id="nextDate"></span>' +
							'<br />' +
							'<i class="icon-chevron-right ' + gridIconSize + '"></i>' +
						'</div>' +
					'</div>' +
					'<div id="rightScrollArrow" class="epg-next-arrow epg-scroll-arrows right-in-container">' +
						'<div>' +
							'<br />' +
							'<i class="icon-chevron-right ' + gridIconSize + '"> </i>' +
						'</div>' +
					'</div>' +
					'<div id="nextChannelArrow" class="epg-next-channel-arrow epg-chan-arrows-next down-in-container">' +
						'<i class="icon-chevron-down ' + gridIconSize + '"></i>' +
					'</div>' +
				'</div>' +

				// Mini Media card
				'<div id="MiniMediaCard" class="epg-mmc hide">' +
					'<div id="miniCardImageContainer" class="epg-mmc-image-container">' +
						'<img id="miniCardImage" class="centred-in-container-abs">' +
						'<div id="miniCardButtonContainer" class="mini-card-button-container">' +
						'</div>' +
					'</div>' +

					'<div id="miniMediaCardDetail" class="epg-mmc-detail">' +

						'<div id="miniMediaCardTimeDetails" class="epg-mmc-time-details">' +
							'<div id="miniCardTime" class="epg-mmc-time"></div>' +
							'<br />' +
							'<span class="font-icon icon-time"></span><span id="miniCardDuration" class="epg-mmc-duration"></span>' +
							'<br />' +
							'<div id="_miniCardCatchupIndicator"><span class="font-icon icon-calendar"></span><span id="miniCardCatchupText" class="epg-mmc-duration"></span></div>' +
						'</div>' +

						'<div id="miniMediaCardEventDetails">' +

							'<div id="closeButton" class="epg-mmc-close-button">' +
								'<i class="icon-remove icon-2x" style="color:#A8DB92"></i>' +      //JRM
							'</div>' +

							'<div id="miniCardTitle" class="epg-mmc-title"></div><div id="miniCardRating"></div>' +
							'<br />' +

							'<div id="miniCardDesc" class="epg-mmc-desc"></div>' +

						'</div>' +

						'<div id="scrollerContainerMiniActionBar" class="epg-mmc-action-bar-scroller">' +
							'<div id="miniActionBar" class="epg-mmc-action-bar"></div>' +
						'</div>' +

					'</div>' +
				'</div>' +
			'</div>';

	/**
	 * Appends EPG HTML to the DOM at the given element
	 * @param {HTMLElement} parentElement The DOM element to append the EPG HTML to
	 */
	var buildElements = function(parentElement) {
		document.getElementById(parentElement).insertAdjacentHTML("beforeend", content);
		ELEMENT.TIME_BAR = document.getElementById("timeBar");
		ELEMENT.CHANNEL_BAR = document.getElementById("channelbar");
		ELEMENT.DAY_BAR = document.getElementById("dayBar");
		ELEMENT.EPG_GRID = document.getElementById("epgGrid");
	};

	var ELEMENT = {
	};


	return {
		ELEMENT : ELEMENT,
		buildElements : buildElements
	};

}());