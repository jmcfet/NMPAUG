/**
 * @class $U.epg.EPGScreen
 * @singleton
 * Builds and wires up the EPG Screen, and handles functions like timings and offsets for event windows.
 */
var $U = $U || {};
$U.epg = $U.epg || {};

$U.epg.EPGScreen = ( function() {

	var logger = $U.core.Logger.getLogger("EPGScreen");

	var displayGridStart;
	var isDesktop = $U.core.Device.isDesktop();
	var channels = [];
	var channelBar;
	var timeBar;
	var nowBar;
	var dayBar;
	var TimeHelper;
	var MiniMediaCard;
	var EPGWindowStart;
	var EPGWindowEnd;
	var channelIndex = 0;
	var channelsPerScreen = isDesktop ? 30 : 15;
	var totalChannels = 0;
	var currentGrid;
	var nowClock;
	var edgeDisplay = false;
	var epgReady = false;
	var activated = false;
	var EPGConfig = $U.core.Configuration.EPG_CONFIG;
	var gridBuilt = false;
	var atLeftDay = false, atRightDay = false, atLeft = true, atRight = false;
	var isNowClockActive = false;
	var previousChanActive = false;
	var nextChanActive = false;
	var mediacardPadding;
	var mediacardDisplayed = false;
	var layout;

	var _epgElem;
	var _scrollerContainerGrid;
	var _miniMediaCardElem;
	var _horizontalScrollManager;
	var _previousArrow;
	var _nextArrow;

	var _pixelsPerMinute = null;
	var _pixelsPerChannel = null;

	var _currentScrollerState = {
		left : null,
		top : null
	};

	var NOW_NEXT_LAYOUT = {
		name : "nownext",
		scrollX : false,
		scrollY : true,
		dayBar : false,
		nowBar : false,
		canResize : true
	};
	var DEFAULT_LAYOUT = {
		name : "default",
		scrollX : true,
		scrollY : true,
		dayBar : true,
		nowBar : true,
		canResize : false
	};

	var dataProvider = null;

	function getDataProvider() {
		if (dataProvider === null) {
			dataProvider = $U.epg.dataprovider.BTVDataProvider.getInstance();
		}
		return dataProvider;
	}

	return {
		/**
		 * Initialises the EPG.  Builds the scrollers, gathers metrics data and builds the required objects
		 * @param {Object} result
		 */
		initialise : function(result) {
			var locale;
			epgReady = false;
			activated = false;
			gridBuilt = false;
			atLeftDay = false;
			atRightDay = false;
			atLeft = true;
			atRight = false;
			isNowClockActive = false;
			previousChanActive = false;
			nextChanActive = false;
			mediacardDisplayed = false;

			/* Create the HTML for the EPG */
			$U.epg.EPGElements.buildElements("masterContainer");

			//TODO: this choice needs to be a bit cleverer:
			if (EPGConfig.layout === "nownext") {
				layout = NOW_NEXT_LAYOUT;
			} else {
				layout = DEFAULT_LAYOUT;
			}
			
			if(EPGConfig.eventWindowSpan !== 86400000) {
				//If span is not 24 hours...
				EPGConfig.eventWindowStart = 0;
			}

			/* Choose a starter date to render the EPG Grid for */
			TimeHelper = new $U.epg.util.TimeHelper(EPGConfig);
			this.setEPGWindow(TimeHelper.getToday());

			/* Build the timebar and size it */
			if (layout === NOW_NEXT_LAYOUT) {
				timeBar = new $U.epg.widgets.NowNextTimeBar($U.epg.EPGElements.ELEMENT.TIME_BAR, this.getEPGState());
			} else {
				timeBar = new $U.epg.widgets.TimeBar($U.epg.EPGElements.ELEMENT.TIME_BAR, this.getEPGState());
			}
			timeBar.populate();

			/* Build the Channel bar */
			channelBar = new $U.epg.widgets.ChannelBar($U.epg.EPGElements.ELEMENT.CHANNEL_BAR);
			if (layout.dayBar) {
				dayBar = new $U.epg.widgets.DayBar($U.epg.EPGElements.ELEMENT.DAY_BAR);
				dayBar.populate(EPGConfig);
				dayBar.reflow();
			} else {
				$U.core.util.HtmlHelper.setDisplayNone($U.epg.EPGElements.ELEMENT.DAY_BAR);
			}

			// Creat the Grid
			if (layout === NOW_NEXT_LAYOUT) {
				currentGrid = new $U.epg.widgets.NowNextGrid($U.epg.EPGElements.ELEMENT.EPG_GRID, layout.scrollX, layout.scrollY, !isDesktop, this.edgeListener);
				$("#scrollerContainerEPG").addClass(layout.name);
				$("#scrollerContainerChannelbar").addClass(layout.name);
				$U.core.util.HtmlHelper.setDisplayNone(document.getElementById("previousArrow"));
				$U.core.util.HtmlHelper.setDisplayNone(document.getElementById("nextArrow"));
			} else {
				currentGrid = new $U.epg.widgets.EPGGrid($U.epg.EPGElements.ELEMENT.EPG_GRID, layout.scrollX, layout.scrollY, !isDesktop, this.edgeListener);
			}

			// Link the grid with the time bar
			if (layout.scrollX) {
				currentGrid.addLinked(timeBar);
				timeBar.addLinked(currentGrid, $U.core.widgets.scroller.NagraScroller.X_AXIS);
			}
			// Link the grid with the channel bar
			if (layout.scrollY) {
				currentGrid.addLinked(channelBar);
				channelBar.addLinked(currentGrid, $U.core.widgets.scroller.NagraScroller.Y_AXIS);
			}

			locale = $U.core.Locale.getLocale();

			// Clear the slate
			getDataProvider().reset();
			channels = [];

			if (logger) {
				logger.log("initialise", "locale", locale);
			}
			$N.services.sdp.IPDataLoader.loadIPData();

			_epgElem = document.getElementById("epg");
			_scrollerContainerGrid = document.getElementById("scrollerContainerEPG");
			_miniMediaCardElem = document.getElementById("MiniMediaCard");
			_previousArrow = document.getElementById("previousArrow");
			_nextArrow = document.getElementById("nextArrow");

			var leftScrollArrow = document.getElementById("leftScrollArrow");
			var rightScrollArrow = document.getElementById("rightScrollArrow");

			if ($U.core.Device.isPhone()) {
				$U.core.util.HtmlHelper.setDisplayNone(leftScrollArrow);
				$U.core.util.HtmlHelper.setDisplayNone(rightScrollArrow);
			} else if ($U.core.Device.isDesktop()) {
				_horizontalScrollManager = new $U.epg.EPGHorizontalScrollManager(_epgElem, _scrollerContainerGrid, _miniMediaCardElem, currentGrid._scroller, leftScrollArrow, rightScrollArrow);
			}

			if (logger) {
				logger.log("initialise", "EPG Init completed");
			}
		},

		/**
		 * refreshes and updates the EPG
		 */
		refresh : function() {
			if (epgReady) {
				if (layout === NOW_NEXT_LAYOUT) {
					/*refresh the now/next*/
					this.updateNowNext();
				} else {
					/* Show today's EPG */
					currentGrid.reflow();
					this.updateNow();
				}
			}
		},

		/**
		 * Default activation call when context is switched to EPG in state management
		 * */
		activate : function() {
			if (logger) {
				logger.log("activate", "enter");
			}
			// Show PageLoading if the grid is not built
			if (!gridBuilt) {
				$U.core.widgets.PageLoading.show(this);
				this.displayGrid();
			}

			channelBar.reflow();
			currentGrid.reflow();
			timeBar.reflow();
			if (layout.dayBar) {
				dayBar.reflow();
			}
			if (!activated && epgReady) {
				currentGrid.scrollTo((((TimeHelper.getNow() - EPGWindowStart.getTime()) / 1000) / 60) * $U.epg.EPGScreen.getPixelsPerMinute(), null);
				activated = true;
			}
			//TODO: work out if this is needed??
			if (layout === NOW_NEXT_LAYOUT) {
				if (currentGrid) {
					this.updateNowNext();
				}
			}
			if (mediacardDisplayed) {
				MiniMediaCard.reload();
			}

			// Restore the scroller positions for when we come from deactivate (may be lost if user rotates device/resizes)
			if (_currentScrollerState.left !== null && (_currentScrollerState.left !== currentGrid.scrollLeft || _currentScrollerState.top !== currentGrid.scrollTop)) {
				currentGrid.scrollTo(_currentScrollerState.left, _currentScrollerState.top);
				if (logger) {
					logger.log("activate", "restore", currentGrid.scrollLeft, currentGrid.scrollTop);
				}
			}
		},

		/**
		 * Default deactivation call when context is switched from EPG in state management
		 * */
		deactivate : function() {
			if (logger) {
				logger.log("deactivate", "enter");
			}

			// Store the scroller positions for when we come back (may be lost if user rotates device/resizes)
			_currentScrollerState.left = currentGrid.scrollLeft;
			_currentScrollerState.top = currentGrid.scrollTop;

			if (MiniMediaCard) {
				MiniMediaCard.deactivate();
			}

			$U.core.widgets.PageLoading.hide(this);
			if (layout === NOW_NEXT_LAYOUT) {
				this.stopUpdateTimer();
			}
		},
		/**
		 * Default resize call when screen is resized or rotated
		 */
		resizeHandler : function() {
			if (layout.canResize) {
				currentGrid.setWidth(this.getTotalScrollerWidth());
				currentGrid.display(layout.nowBar);
			}

			// Code to keep the daybar highlight in view on a resize
			var scrollToDay = function() {
				if (layout.dayBar) {
					dayBar.setHighlight($U.epg.EPGScreen.getEPGState().windowStart);
				}
			};
			window.setTimeout(scrollToDay, 100);

			if (mediacardDisplayed) {
				MiniMediaCard.sizeMediaCard();
			}
		},

		/**
		 * Sets the start and end date/times for the given day (based on config settings)
		 * Optionally gives the caller feedback so it knows that the date has changed
		 * @param {Date} chosenDate
		 * @return {boolean} true if the date has changed
		 */
		setEPGWindow : function(chosenDate) {
			var newDate = TimeHelper.getSpan(chosenDate);
			var dateChanged = false;
			if (!EPGWindowStart || EPGWindowStart.getTime() !== newDate.getTime()) {
				EPGWindowStart = newDate;
				EPGWindowEnd = new Date(EPGWindowStart.getTime() + EPGConfig.eventWindowSpan);
				this._repopulateTimeBar();
				dateChanged = true;
			}
			return dateChanged;
		},
		
		_repopulateTimeBar : function() {
			if(timeBar) {
				timeBar.setEPGState(this.getEPGState());
				timeBar.populate();
			}
		},

		/**
		 * Clock callback that updates the position of the nowbar and the highlighting for currently on events
		 */
		updateNow : function() {
			var minutesSince;
			var that = this;
			var now = TimeHelper.getNow();

			if (now.getTime() >= EPGWindowStart.getTime() && now.getTime() <= EPGWindowEnd.getTime()) {
				nowBar.attach();
				if (nowClock === undefined) {
					nowClock = new $N.apps.util.Clock(10, function() {
						that.updateNow();
					});
				}

				minutesSince = (((now - EPGWindowStart.getTime()) / 1000) / 60) * $U.epg.EPGScreen.getPixelsPerMinute();
				nowBar.update(minutesSince);
				timeBar.highlightCurrentHour(now);
				if (!isNowClockActive) {
					isNowClockActive = true;
					nowClock.activate();
				}
			} else {
				that.stopUpdateTimer();
				nowBar.hide();
				timeBar.hideCurrentHour();
			}
			currentGrid.updateState(now);
		},

		/**
		 * @method updateNowNext
		 * Sets up a timer to update which items to show on the screen
		 * Used for the now/next layout
		 */
		updateNowNext : function() {
			if (nowClock === undefined) {
				nowClock = new $N.apps.util.Clock(60, this.updateNowNext);
			}
			if (!isNowClockActive) {
				isNowClockActive = true;
				nowClock.activate();
			}
			currentGrid.updateState(TimeHelper.getNow());
		},
		/**
		 * @method stopUpdateTimer
		 * Stops the update timer
		 */
		stopUpdateTimer : function() {
			if (nowClock !== undefined && isNowClockActive) {
				nowClock.deactivate();
				isNowClockActive = false;
			}
		},

		/**
		 * Adds navigation click handlers
		 * @private
		 */
		_addNavigationHandlers : function() {
			/* Set next/previous channel handlers */
			document.getElementById("previousChannelArrow").addEventListener("click", $U.epg.EPGScreen.navigationClicked, false);
			document.getElementById("nextChannelArrow").addEventListener("click", $U.epg.EPGScreen.navigationClicked, false);

			/* Set now/previous eventhandlers */
			document.getElementById("previousArrow").addEventListener("click", $U.epg.EPGScreen.navigationClicked, false);
			document.getElementById("nextArrow").addEventListener("click", $U.epg.EPGScreen.navigationClicked, false);
		},

		/**
		 * Removes navigation click handlers
		 * @private
		 */
		_removeNavigationHandlers : function() {
			/* Remove next/previous channel handlers */
			document.getElementById("previousChannelArrow").removeEventListener("click", $U.epg.EPGScreen.navigationClicked, false);
			document.getElementById("nextChannelArrow").removeEventListener("click", $U.epg.EPGScreen.navigationClicked, false);

			/* Remove now/previous eventhandlers */
			document.getElementById("previousArrow").removeEventListener("click", $U.epg.EPGScreen.navigationClicked, false);
			document.getElementById("nextArrow").removeEventListener("click", $U.epg.EPGScreen.navigationClicked, false);
		},

		/**
		 * Callback for when a previous/next day/channel arrow is selected
		 * @param {Event} e Event details of the element that was selected
		 */
		navigationClicked : function(e) {
			var theActionClicked = e.currentTarget.getAttribute("id");
			var now = new Date();
			e.stopPropagation();

			if (theActionClicked === "previousArrow") {
				var previous = TimeHelper.getPreviousSpan(EPGWindowStart);
				var epgStart = new Date(new Date(now.getFullYear(), now.getMonth(), now.getDate(), EPGConfig.eventWindowStart).getTime() - EPGConfig.previousSpan);
				if (previous >= epgStart) {
					$U.epg.EPGScreen.changeSpan(previous, parseInt($U.epg.EPGScreen.getTotalScrollerWidth(), 10));
				}
			} else if (theActionClicked === "nextArrow") {
				var next = TimeHelper.getNextSpan(EPGWindowStart);
				if (next <= new Date(now.getTime() + EPGConfig.span)) {
					$U.epg.EPGScreen.changeSpan(next, 0);
				}
			}

			if (theActionClicked === "previousChannelArrow") {
				$U.epg.EPGScreen.changeChannels("decrementChannels");
			} else if (theActionClicked === "nextChannelArrow") {
				$U.epg.EPGScreen.changeChannels("incrementChannels");
			}
		},

		/**
		 * Callback that listens for NagraScroller edge events
		 * @param {string} edge String representation of which edge or not is has been encountered while scrolling
		 */
		edgeListener : function(edge) {
			if (gridBuilt) {
				if (edge === "left" && !atLeftDay) {
					$("#leftScrollArrow").removeClass("display");
					$("#previousArrow").addClass("display");
					atLeft = true;
				} else if (edge === "notleft" || atLeftDay) {
					$("#previousArrow").removeClass("display");
					atLeft = false;
				}

				if (edge === "right" && !atRightDay) {
					$("#rightScrollArrow").removeClass("display");
					$("#nextArrow").addClass("display");
					atRight = true;
				} else if (edge === "notright" || atRightDay) {
					$("#nextArrow").removeClass("display");
					atRight = false;
				}

				$U.epg.EPGScreen.areChanbarsInView();

				if (edge === "top" && previousChanActive) {
					$("#previousChannelArrow").addClass("display");
				} else if (edge === "nottop" || !previousChanActive) {
					$("#previousChannelArrow").removeClass("display");
				}

				if (edge === "bottom" && nextChanActive) {
					$("#nextChannelArrow").addClass("display");
				} else if (edge === "notbottom" || !nextChanActive) {
					$("#nextChannelArrow").removeClass("display");
				}
			}
		},

		/**
		 * Checks to see if the given date is the first/last one in the epg, and show/hides next/previous navigation accordingly
		 * @param {Date} chosenDate the date to be checked
		 */
		checkIfAtEdge : function(chosenDate) {
			var checkDate, startDate;
			var numberOfSpans;

			startDate = new Date(new Date().getTime() - EPGConfig.previousSpan);
			startDate.setHours(EPGConfig.eventWindowStart, 0, 0, 0);
			numberOfSpans = EPGConfig.span / EPGConfig.eventWindowSpan;
			atLeftDay = false;
			atRightDay = false;

			if (atLeft) {
				$("#previousArrow").addClass("display");
			}
			if (atRight) {
				$("#nextArrow").addClass("display");
			}

			checkDate = new Date(startDate.getTime() + ((EPGConfig.eventWindowSpan) * 0));
			if (checkDate.getDate() === chosenDate.getDate()) {
				atLeftDay = true;
				if (atLeft) {
					$("#previousArrow").removeClass("display");
				}
			}

			checkDate = new Date(startDate.getTime() + ((EPGConfig.eventWindowSpan) * (numberOfSpans - 1)));
			if (checkDate.getDate() === chosenDate.getDate()) {
				atRightDay = true;
				if (atRight) {
					$("#nextArrow").removeClass("display");
				}
			}
		},

		/**
		 * Changes the EPG Day state and redisplays the grid for this new state
		 * @param {Date} chosenDay The day to be switched to in the EPG
		 */
		changeDay : function(chosenDay, scrollX) {
			chosenDay.setHours(EPGWindowStart.getHours(), 0, 0, 0);
			this.changeSpan(chosenDay);
		},
		
		/**
		 * Changes the EPG Span state and redisplays the grid for this new state
		 * @param {Date} chosenSpan The span to be switched to in the EPG
		 */
		changeSpan : function(chosenSpan, scrollX) {
			var that = this;
			$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
				if (status) {
					$U.epg.EPGScreen._removeNavigationHandlers();
					if (that.setEPGWindow(chosenSpan)) {
						/* Please wait... */
						if (gridBuilt) {//don't want the clicking of the daybar working when loading
							$U.core.widgets.PageLoading.show($U.epg.EPGScreen, function() {
								$U.epg.EPGScreen._changeSpanContinue(chosenSpan, scrollX);
							});
						}
					}
				}
			});
		},
		
		/**
		 * Callback for changeDay so that the loading display works correctly
		 * @private
		 */
		_changeSpanContinue : function(chosenSpan, scrollX) {
			if (scrollX !== undefined) {
				currentGrid.scrollTo(scrollX, null);
			}

			if (layout.dayBar) {
				this.updateDayIndicators(EPGWindowStart);
			}

			this.displayGrid(EPGWindowStart);
		},

		/**
		 * Changes the EPG Channel state and redisplays the grid for this new state
		 * @param {String} type String defining which action to take, decrement or increment the channel window (down or up)
		 */
		changeChannels : function(type) {
			$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
				if (status) {
					$U.epg.EPGScreen._removeNavigationHandlers();
					/* Please wait... */
					$U.core.widgets.PageLoading.show($U.epg.EPGScreen, function() {
						$U.epg.EPGScreen._changeChannelsContinue(type);
					});
				}
			});
		},

		/**
		 * Callback for changeChannels so that the loading display works correctly
		 * @private
		 */
		_changeChannelsContinue : function(type) {
			if (type === "incrementChannels") {
				channelIndex = channelIndex + channelsPerScreen;
				$U.epg.EPGScreen.displayGrid();
				$("#nextChannelArrow").removeClass("display");
				currentGrid.scrollTo(null, 0);
			} else if (type === "decrementChannels") {
				channelIndex = channelIndex - channelsPerScreen;
				$U.epg.EPGScreen.displayGrid();
				$("#previousChannelArrow").removeClass("display");
				currentGrid.scrollTo(null, currentGrid.height);
			}
		},

		/**
		 * Encapsulate the state of the EPG in one, easy-to-use object state
		 * @return {Object} State object containing windosStart, windowEnd, channelIndex, channelsPerScreen and totalChannels
		 */
		getEPGState : function() {
			return {
				windowStart : EPGWindowStart, // Start of EPG
				windowEnd : EPGWindowEnd, // End of EPG
				channelIndex : channelIndex, // Start index of channels to display
				channelsPerScreen : channelsPerScreen, // Number of channels to display
				totalChannels : totalChannels	// Total number of channels
			};
		},

		/**
		 * Resets the EPGState to it's original values, used primary for when the app is reloaded (after changing language or Parental Rating)
		 * The channelsPerScreen is hardcoded at the start
		 * The totalChannels is calculated after retrieving the channels from MDS
		 */
		resetEPGState : function() {
			this.setEPGWindow(TimeHelper.getToday());
			channelIndex = 0;
			// Start index of channels to display
			channelBar.reset();
		},
		
		/**
		 * Sets the daybar highlights for the day chosen, and updates the previous and next day arrow dates
		 * @param {Date} chosenDay The day chosen
		 */
		updateDayIndicators : function(chosenDate) {
			var previousDate;
			var nextDate;

			if (chosenDate === undefined) {
				chosenDate = TimeHelper.getNow();
			}

			dayBar.setHighlight(chosenDate);

			this.checkIfAtEdge(chosenDate);

			previousDate = $U.core.util.Formatter.formatDate(TimeHelper.getPreviousSpan(EPGWindowStart));
			nextDate = $U.core.util.Formatter.formatDate(TimeHelper.getNextSpan(EPGWindowStart));
			if (EPGConfig.eventWindowSpan !== 86400000) { //24 hours
				previousDate += "\n" + $U.core.util.Formatter.formatTime(TimeHelper.getPreviousSpan(EPGWindowStart));
				nextDate += "\n" + $U.core.util.Formatter.formatTime(TimeHelper.getNextSpan(EPGWindowStart));
			}

			document.getElementById("nextDate").innerText = nextDate;
			document.getElementById("prevDate").innerText = previousDate;
		},

		/**
		 * Defines whether the next/previous channel bar arrows are active or not, based on EPGState
		 */
		areChanbarsInView : function() {
			var epgState = this.getEPGState();
			if (epgState.channelIndex > 0) {
				previousChanActive = true;
			} else {
				previousChanActive = false;
			}

			if ((epgState.channelIndex + epgState.channelsPerScreen) < epgState.totalChannels) {
				nextChanActive = true;
			} else {
				nextChanActive = false;
			}

			if (!previousChanActive) {
				$("#previousChannelArrow").removeClass("display");
			}

			if (!nextChanActive) {
				$("#nextChannelArrow").removeClass("display");
			}
		},

		/**
		 * @method setLayout
		 * sets the layout to use for displaying the epg
		 * @param {Object} newLayout the layout that will be used to display the epg screen
		 */
		setLayout : function(newLayout) {
			layout = newLayout;
		},

		/**
		 * Builds and renders a given span of events for a given array of channels, is also the callback registered to loadIPData
		 */
		displayGrid : function() {

			displayGridStart = window.performance && window.performance.now && window.performance.now();

			// Hide the grid's DOM
			if (currentGrid) {
				currentGrid.purge();
			}

			//only needed to be set on first run
			//gridBuilt = false;
			if (layout.dayBar) {
				this.updateDayIndicators(EPGWindowStart);
			}

			getDataProvider().fetchChannels(function(channels) {
				$U.epg.EPGScreen.displayGridFetchChannelsCallback(channels);
			});

		},

		displayGridFetchChannelsCallback : function(channels) {
			var channelsInView;
			var startTime = new Date();
			var currentEPGState;
			var thePixelsPerChannel;

			totalChannels = channels.length;
			if (logger) {
				logger.log("displayGrid", "totalChannels", totalChannels);
			}

			currentEPGState = this.getEPGState();

			/* At this point we need to restrict display to a fixed number of channels, calculated beforehand based on the performance metrics of the device we are on (eventually). */
			channelsInView = channels.slice(channelIndex, (channelIndex + channelsPerScreen));

			/* Update the channelbar to display the correct channels (optional) only if index is not the same as before */
			channelBar.refresh(channelsInView, currentEPGState);

			/* Display a grid for the given span and channels */
			currentGrid.build(channelsInView, EPGWindowStart, EPGWindowEnd, layout.nowBar, channelIndex > 0, function() {
				$U.epg.EPGScreen.displayGridContinue(currentEPGState, channelsInView);
			});
		},

		displayGridContinue : function(currentEPGState, channelsInView) {

			var previousChannelBar = false;
			var nextChannelBar = false;
			var nextChannelPadding = 0;

			/* Pixels are calc'd off of the channelbar, so render it first then get the pixels */
			var thePixelsPerChannel = this.getPixelsPerChannel();

			if (layout === NOW_NEXT_LAYOUT) {
				this.updateNowNext();
			} else {
				/* Build the NowBar ready for the  the EPG */
				nowBar = currentGrid.getNowBar();
				this.updateNow();
			}

			this.areChanbarsInView();

			// Add/remove padding as required for next/previous bars
			if (currentEPGState.channelIndex > 0) {
				nextChannelPadding = thePixelsPerChannel;
				previousChannelBar = true;
			}
			if ((currentEPGState.channelIndex + currentEPGState.channelsPerScreen) < currentEPGState.totalChannels) {
				nextChannelPadding += thePixelsPerChannel;
				nextChannelBar = true;
			}

			/*  Set the heights and widths of the grid so it renders the scroll area correctly. */
			currentGrid.setWidth(this.getTotalScrollerWidth());
			currentGrid.setHeight(thePixelsPerChannel * channelsInView.length + nextChannelPadding);

			channelBar.setHeight(thePixelsPerChannel * channelsInView.length + nextChannelPadding);

			if (layout === DEFAULT_LAYOUT) {
				nowBar.setHeight(thePixelsPerChannel * channelsInView.length + ( previousChannelBar ? thePixelsPerChannel : 0));
			}

			if (mediacardDisplayed) {
				currentGrid.addHeight(mediacardPadding);
				channelBar.addHeight(mediacardPadding);
			}

			currentGrid.reflow();
			channelBar.reflow();
			if (layout.dayBar) {
				dayBar.reflow();
			}
			/* All done */
			gridBuilt = true;

			$U.epg.EPGScreen._addNavigationHandlers();

			if (!epgReady) {
				if (layout.scrollX) {
					currentGrid.scrollTo((((TimeHelper.getNow() - EPGWindowStart.getTime()) / 1000) / 60) * $U.epg.EPGScreen.getPixelsPerMinute(), null);
				}
				epgReady = true;
			}

			$U.core.widgets.PageLoading.hide(this);

			if (logger && displayGridStart) {
				logger.log("displayGrid", "elapsed", window.performance.now() - displayGridStart);
			}

		},

		/**
		 * Fills and displays the mini mediacard
		 * @param {Object} EPGEvent
		 */
		displayMiniMediaCard : function(object) {
			if (MiniMediaCard) {
				MiniMediaCard.deactivate();
			}
			switch (object.type.name) {
			case "BTVEVENT":
				MiniMediaCard = new $U.epg.widgets.MiniMediaCard(_miniMediaCardElem, this);
				break;
			case "CATCHUP":
				MiniMediaCard = new $U.epg.widgets.CatchupMiniMediaCard(_miniMediaCardElem, this);
				break;
			default:
				MiniMediaCard = new $U.epg.widgets.MiniMediaCard(_miniMediaCardElem, this);
			}

			MiniMediaCard.populate(object);
			MiniMediaCard.show();

			mediacardPadding = document.getElementById("MiniMediaCard").offsetHeight;

			if (!mediacardDisplayed) {
				currentGrid.addHeight(mediacardPadding);
				channelBar.addHeight(mediacardPadding);

				$("#nextChannelArrow").addClass('epg-chan-arrows-next-mmc-displayed').removeClass('epg-chan-arrows-next');

				currentGrid.reflow();
				channelBar.reflow();

				mediacardDisplayed = true;
			}
		},

		/**
		 * Hides the mini mediacard
		 */
		hideMiniMediaCard : function() {

			if (mediacardDisplayed) {
				currentGrid.addHeight(-mediacardPadding);
				channelBar.addHeight(-mediacardPadding);

				$("#nextChannelArrow").addClass('epg-chan-arrows-next').removeClass('epg-chan-arrows-next-mmc-displayed');

				currentGrid.reflow();
				channelBar.reflow();

				currentGrid.removeEventHighlight();

				mediacardDisplayed = false;
			}
		},

		/**
		 * Updates a specified event in the current Grid
		 */
		updateEPGEvent : function(eventId) {
			currentGrid.updateEPGEvent(eventId, TimeHelper.getNow());
		},

		/**
		 * Retrieves the number of pixels in one of EPG time
		 * @return {Number} A number of pixels per minute
		 */
		getPixelsPerMinute : function() {
			return _pixelsPerMinute || (_pixelsPerMinute || parseInt($(".epg-time-span").css("width"), 10) / 60);
		},

		/**
		 * Retrieves the number of pixels per channel height - derived from the height of a channel-item in the channel bar
		 * @return {Number} A number of pixels
		 */
		getPixelsPerChannel : function() {
			return _pixelsPerChannel || ( _pixelsPerChannel = parseInt($(".epg-channel-item").css("height"), 10) + parseInt($(".epg-channel-item").css("margin-bottom"), 10));
		},

		/**
		 * Calculates and returns the total width in pixels of the TimeBar and Grid elements, including next/previous day arrows
		 * @return {Number} Number of pixels for the whole width required
		 */
		getTotalScrollerWidth : function() {
			var hoursPerWindow = EPGWindowStart - EPGWindowEnd;
			var widthOfNextPreviousDays = parseInt($(".epg-arrows").css("width"), 10);
			var totalScrollerWidth;
			if (layout === DEFAULT_LAYOUT) {
				totalScrollerWidth = ((this.getPixelsPerMinute() * 60) * (Math.ceil(Math.abs(((hoursPerWindow / 1000) / 60 / 60))))) + (widthOfNextPreviousDays * 2);
			} else {
				totalScrollerWidth = parseInt($("#scrollerContainerEPG").css("width"), 10) - parseInt($("#epgGrid").css("margin-left"), 10);
			}
			return totalScrollerWidth;
		}
	};

}());
