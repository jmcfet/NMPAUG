/**
 * Object that represents a search bar.
 * @class $U.core.widgets.search.SearchBar
 *
 * Object that represents a search bar which must be realised by a StandAloneSearchBar or a InlineSearchBar
 * @template
 * @constructor
 * @param {Object} owner - The class that owns the searchBar
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.search = $U.core.widgets.search || {};

$U.core.widgets.search.SearchBar = (function () {

  // delay of auto suggestion in milliseconds
	var AUTO_COMPLETE_DELAY = 300,
		RE_SEARCH_DELAY = 400,
		MAX_DROPDOWN_LENGTH = 8, //max dropdown limit
		MAX_SUGGESTIONS = 3, //max VOD search suggestions limit
		MAX_SEARCH_RETRY_COUNT = 3, //no of retries to check value of searchInProgress flag
		LIMIT_FOR_DROPDOWN = 8, // max number to be requested for dropdown
		SEARCH_ANNOTATIONS = false, //same as icons for normal search decorations but inline to searchbar
		SEARCH_ENTITY_ANNOTATIONS = false, //annotations for search suggestions
		SUGGESTED_SEARCH_STYLING = true, //add specific styling for search suggestions
		MIN_INPUT_LENGTH = 3,
		MIN_TILE_COUNT = 50,
		DEFAULT_SEARCH_FIELDS = ["title", "actors", "description", "directors"],
		logger = $U.core.Logger.getLogger("SearchBar"),
		proto,
        keyDownEventInProgress = false, // needed for hack in IE10
		SearchBar = function (owner) {
			$U.destroyList.push(this);

			var that = this;
			// The class that owns the search bar
			this._owner = owner;
			this._searchTerm = "";
			this._showInlineSearchAnnotations = SEARCH_ANNOTATIONS;
			this._showInlineEntityAnnotations = SEARCH_ENTITY_ANNOTATIONS;
			this._showSuggestedSearchStyling = SUGGESTED_SEARCH_STYLING;
			this._search = new $N.services.sdp.Search();
			this._searchAgainTimer = null;
			this._searchAgainCount = 0;
			this._suggestionLookup = {};
			this._currentStartIndex = 0;
			this._currentSearchIndex = 0;
			this._currentTotalItems = 0;
			this._lastSearchPerformed = "";
			// set up the failure callback for search
			this._search.setFailureCallback(function () {
				that._searchFailureCallback();
			});
			// Flag to monitor whether a search is currently in progress
			this._searchInProgress = false;
			// The gutter size between the edge of the screen and the ui elements
			this._gutterSize = $U.core.Device.isPhone() ? 10 : 20;
			this._setSuggestionContainer = function (container) {
				this._suggestionContainer = new $U.core.widgets.AssetList(container, this);
			};
		};

  /**
   * Creates a search bar suitable for the device it is associated with
   * if the device is desktop then the search bar is in line with other elements
   * within the header bar. If the device is phone or tablet then we have a stand alone
   * page for the search bar
   * @param {Object} owner - the caller
   */
	SearchBar.create = function (owner) {
		var result = null;
		switch ($U.core.Device.getFF()) {
		case $U.core.Device.FF.TABLET:
		case $U.core.Device.FF.PHONE:
		case $U.core.Device.FF.DESKTOP:
			result = new $U.core.widgets.search.InlineSearchBar(owner);
			break;
		}
		return result;
	};

	// short hand for prototype
	proto = SearchBar.prototype;

	/**
	 * Adds the necessary events to the search bars HTML Elements
	 */
	proto._addEvents = function () {
		// These are stored in an object so we have a reference to them in the delete method
		this.eventListeners = {};
		this.eventListeners.keydown = this._keyDownHandler.bind(this);
		this.eventListeners.click1 = this.performSearch.bind(this);
		this.eventListeners.hideSearchBar = this.hideAndResetHeaderBar.bind(this);

		// Capture that the user has keyed down
		this._inputEl.addEventListener("keydown", this.eventListeners.keydown);
		// Capture that the user has clicked
		this._buttonEl.addEventListener("click", this.eventListeners.click1);

		this._closeButtonEl.addEventListener("click", this.eventListeners.hideSearchBar);
	};

  /**
   * Adds the jQuery auto complete to the text input
   */
	proto._addAutoComplete = function () {
		var that = this,
			setDropDown = function () {
				var val = that._inputEl.value;
				if (that._searchInProgress && that._searchAgainCount < MAX_SEARCH_RETRY_COUNT) {
					if (that._searchAgainTimer) {
						clearTimeout(that._searchAgainTimer);
						that._searchAgainTimer = null;
					}
					that._searchAgainTimer = setTimeout(function () {
						that._searchAgainCount++;
						setDropDown();
					}, RE_SEARCH_DELAY);
				} else {
					that._searchAgainCount = 0;
					if (val.length >= MIN_INPUT_LENGTH) {
						that._performSuggestion(val);
					} else {
						that._clear();
					}
				}
			};

		$(this._inputEl).autocomplete({
			delay : AUTO_COMPLETE_DELAY,
			source : function () {
				setDropDown();
			}
		});
	};

    /**
     * Function for IE10 hack
     */
    proto.isKeyDowneventInProgress = function() {
        return keyDownEventInProgress;
    };

    /**
     * The handler for the search inputs key down event
     */
    proto._keyDownHandler = function (evt) {
        // HACK ONLY FOR IE9 & IE10!!!
        if ($U.core.Device.isIE9() || $U.core.Device.isIE10()) {
            keyDownEventInProgress = true;
            window.setTimeout(function() {
                keyDownEventInProgress = false;
            }, 100);
        }

        var input = this._inputEl,
            key = evt.keyCode;

        // Only collect the users input and perform search if the user has entered
        //allow any number of chars (MSUI-889)
        if (key === 13) {
            this.performSearch();
        }
        // Only clear the search suggestions if the user is using the delete or backspace
        // key and the length of the input is 3
        if ((key === 46 || key === 8) && input.value.length <= 3) {
            this._clear();
        }
    };

  /**
   * Clears the auto suggestion container by populating with an empty array
   */
	proto._clear = function () {
		// clear the search suggestions by populating with empty array
		this._suggestionContainer.populate([]);
	};

	proto._displayResultsCallback = function (searchArray) {
		// disable the input so the user cannot type while a search is in progress
		var that = this;
		this._inputEl.disabled = false;
		// Set a timeout to set searchInProgress back to false to handle the auto complete delay.
		// This is necessary so we do not show the auto complete suggestions after a using his hit search manually
		$U.core.View.populateSearchScreen(searchArray, this._currentSearchTerm, this._currentStartIndex, this._currentEndIndex, this._currentTotalItems, this._searchMoreCallback.bind(this));
		$U.core.widgets.PageLoading.hide("searching");
		that._searchInProgress = false;
	};

	/**
	 * Determines if suggestions should be disabled.
	 */
	proto._shouldShowSuggestions = function () {
		return $U.core.parentalcontrols.ParentalControls.getCurrentRating() >= $U.core.Configuration.SUGGESTIONS_MINIMUM_RATING;
	};

	proto._getSuggestions = function (callback) {
		if (this._loadingAnimation) {
			$U.core.util.HtmlHelper.setDisplayNone(this._loadingAnimation);
		}
		if (this._shouldShowSuggestions()) {
			$N.services.sdp.MetadataService.fetchSuggestions(this, callback, function () {
				console.warn("FAIL");
			}, "\"" + this._searchTerm + "\"");
		} else {
			callback([]);
		}
	};

	proto._populateDropDown = function (searchSuggestions, searchResults) {
		var i, j,
			noOfSuggestions = searchSuggestions.length,
			noOfResults = searchResults.length,
			searchList = [];

		if (noOfSuggestions > MAX_SUGGESTIONS) {
			noOfSuggestions = MAX_SUGGESTIONS;
		}
		if (noOfResults > MAX_DROPDOWN_LENGTH - noOfSuggestions) {
			noOfResults = MAX_DROPDOWN_LENGTH - noOfSuggestions;
		}

		for (i = 0; i < noOfSuggestions; i++) {
			searchList.push(searchSuggestions[i]);
		}

		for (i = 0; i < noOfResults; i++) {
			searchList.push(searchResults[i]);
		}

		if (searchList && this._searchTerm === this._inputEl.value) {
			this._suggestionContainer.populate(searchList);
			this.renderTopBorderRadius();
		}
	};

	proto._isSuggestion = function (suggestString) {
		if (this._suggestionLookup[suggestString]) {
			return true;
		}
		return false;
	};

	proto._populateDropDownCallback = function (searchArray) {
		var that = this,
			searchList = searchArray,
			callback = function (results) {
				var searchResults = [],
					searchSuggestions = [],
					suggestedResults,
					suggestion,
					numberOfResultsToDisplay,
					i,
					suggestedString;

				if (results && results.response && results.response.docs && results.response.docs.length > 0) {
					suggestedResults = results.response.docs;
					if (suggestedResults.length > MAX_SUGGESTIONS) {
						numberOfResultsToDisplay = MAX_SUGGESTIONS;
					} else {
						numberOfResultsToDisplay = suggestedResults.length;
					}
					i = 0;
					that._suggestionLookup = {};
					// code to remove duplicate suggestions
					while (i < numberOfResultsToDisplay && i < suggestedResults.length) {
						suggestedString = suggestedResults[i].suggestion.trim();
						if (!that._isSuggestion.call(that, suggestedString)) {
							that._suggestionLookup[suggestedString] = suggestedResults[i];
							suggestion = new $U.core.mediaitem.SuggestedItem(suggestedResults[i]);
							searchSuggestions.push(suggestion);
						}
						i++;
					}
				}
				that._populateDropDown(searchSuggestions, searchArray);
				that._searchInProgress = false;
			};

		this._getSuggestions.call(that, callback);
	};

	proto._doSearch = function (input, isDropDown) {
		var filter = [],
			filterQuery,
			startRow = null,
			endRow = null,
			inputArray = input.split(" "),
			searchString = "",
			i, j,
			retrieveSearchMeta = true, //enable highlighting response
			that = this,
			currentDateInSS = Math.round(new Date().getTime() / 1000),
			qf,
			callback = function (results) {
				if (isDropDown) {
					that._searchSuccess(results, that._populateDropDownCallback);
				} else {
					that._searchSuccess(results, that._displayResultsCallback);
					that._suggestionContainer.clearDOM();
				}
			};

		if ($U.core.Configuration.SEARCH_FIELDS) {
			qf = $U.core.Configuration.SEARCH_FIELDS;
		} else {
			qf = DEFAULT_SEARCH_FIELDS;
		}

		if (inputArray.length > 1) {
			for (j = 0; j < qf.length; j++) {
				searchString += qf[j] + ":";
				searchString += "(";
				for (i = 0; i < inputArray.length; i++) {
					searchString += inputArray[i].trim();
					if (i < inputArray.length - 1) {
						if (inputArray[i + 1].trim() > "") {
							searchString += " AND ";
						}
					}
				}
				searchString += ") ";
			}
		} else {
			searchString = input.trim();
		}

		if (isDropDown) {
			startRow = 0;
			endRow = LIMIT_FOR_DROPDOWN;
		} else {
			startRow = this._currentStartIndex;
			endRow = this._currentEndIndex;
			/* Check whether suggestion row */
			if (this._isSuggestion(input)) {
				searchString = "\"" + input + "\"";
			}
		}
		this._suggestionLookup = {};
		this._searchTerm = input;
		filterQuery = "";

		if ($U.core.Configuration.PAGE_SEARCH_RESULTS) {
			var rating = $U.core.parentalcontrols.ParentalControls.getCurrentRating();
			if ((rating || rating === 0) && typeof rating === "number") {
				filterQuery += "rating.precedence:[* TO " + (rating > 0 ? rating -1 : 0) + "] AND ";
			}
		}

		filterQuery += "(scope:vod OR (scope:btv AND (eventEnd:[" + currentDateInSS + " TO *] OR ";
		filterQuery += "(eventEnd:[0 TO " + currentDateInSS + "] AND ";
		filterQuery += "(catchupStart:[0 TO " + currentDateInSS + "] AND catchupEnd:[" + currentDateInSS + " TO *])))))";
		filter.push(filterQuery);
		this._search.setSuccessCallback(callback);
		this._search.search(searchString, startRow, endRow, filter, qf, retrieveSearchMeta);
	};

  /**
   * Handles the search when a user clicks the search button or hits enter
   */
	proto.performSearch = function (startIndex) {
		var input = this._inputEl.value.trim();
		var that = this;
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function (status) {
			if (status) {
				// on iOS devices the input keeps its focus when hitting the return key
				if ($U.core.Device.isIOS()) {
					that._inputEl.blur();
				}
				that._clear();
				if (input.length) {
					that._lastSearchPerformed = input;
					that._searchInProgress = true;
					$U.core.widgets.PageLoading.show("searching");
					that._currentSearchTerm = input;
					if(startIndex === undefined || typeof startIndex !== "number") {
						startIndex = 0;
					}
					if ($U.core.Configuration.PAGE_SEARCH_RESULTS) {
						that._currentStartIndex = startIndex;
						that._currentEndIndex = startIndex + ($U.core.Configuration.ASSET_PAGE_SIZE > MIN_TILE_COUNT ? $U.core.Configuration.ASSET_PAGE_SIZE : MIN_TILE_COUNT);
					}
					that._doSearch(input, false);
				}
			}
		});
	};

  /**
	* Callback to search for more paged assets.
	* @param {number} startIndex - the first item requested index.
	*/
	proto._searchMoreCallback = function(startIndex) {
		this._inputEl.value = this._lastSearchPerformed;
		this.performSearch(startIndex);
	};

  /**
   * Performs the auto suggestion
   * @param {String} searchTerm - The term entered by the user
   */
	proto._performSuggestion = function (searchTerm) {
		if (searchTerm.length) {
			if (this._loadingAnimation) {
				$U.core.util.HtmlHelper.setDisplayBlock(this._loadingAnimation);
			}
			this._searchInProgress = true;
			this._doSearch(searchTerm, true);
		}
	};

	/**
	* @template
	* handles the success return of results from a search
	* @param {Array} results - the search results
	*/
	proto._searchSuccess = function (results, callback) {
		var i,
			that = this,
			asset,
			channel,
			channelsByLongNameLookup = {},
			channelsByServiceIdLookup = {},
			getVODItem = function (result) {
				return $U.core.mediaitem.VODItem.create(results.records[i]);
			},
			getCatchupItem = function (record) {
				channel = channelsByLongNameLookup[record.ServiceLongName];
				return $U.core.mediaitem.CatchUpMediaItem.create(record, channel);
			},
			getBTVItem = function (record) {
				return new $U.core.mediaitem.BTVEventItem(record, channelsByServiceIdLookup[record.serviceId]);
			},
			processResults = function () {
				var asset,
					searchArray = [],
					records = results.records,
					highlighting = results.highlighting;

				for (i = 0; i < records.length; i++) {
					if (records[i].serviceId) { // BTV
						asset = getBTVItem(records[i]);
					} else if (records[i].ProgramId) { // CATCHUP
						asset = getCatchupItem(records[i]);
					} else { // VOD
						asset = getVODItem(records[i]);
					}
					if (highlighting) {
						asset.searchMatches = that._search.getMatchesById(asset.id, highlighting);
					}
					if ($U.core.Configuration.PAGE_SEARCH_RESULTS === true || $U.core.parentalcontrols.ParentalControls.isRatingPermitted(asset.rating)) {
						searchArray.push(asset);
					}
				}
				return searchArray;
			},
			fetchAllChannelsByServiceId = function (allChannelsByServiceId) {
				var searchResults;
				channelsByServiceIdLookup = allChannelsByServiceId;
				searchResults = processResults();
				that._currentTotalItems = results.totalRecords;
				callback.call(that, searchResults);
			},
			fetchAllChannelsByLongName = function (allChannelsByLongName) {
				channelsByLongNameLookup = allChannelsByLongName;
				$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByServiceId(fetchAllChannelsByServiceId);
			};

		$U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByLongName(fetchAllChannelsByLongName);
	};

	/**
	* Failure callback for when a search fails
	*/
	proto._searchFailureCallback = function () {
		if (logger) {
			logger.log("_searchFailureCallback", "search failure");
		}
		this._searchInProgress = false;
	};

	/**
	* Initialise the search bar
	* @param {HTMLElement} docRef - the HTMLELement that will contain the search bar
	*/
	proto.init = function (docRef) {
		this._docRef = docRef;
		// create the HTML
		this._build(this._docRef);
		// Set up the listeners
		this._addEvents();
		// Add the jQuery auto complete widget
		this._addAutoComplete();
	};

	/**
	* Destroys references that cause memory leak.
	* This SearchBar must unregister event listeners.
	*/
	proto.destroy = function () {
		delete this._owner;
		this._inputEl.removeEventListener("keydown", this.eventListeners.keydown);
		this._buttonEl.removeEventListener("click", this.eventListeners.click1);
		document.removeEventListener("click", this.eventListeners.click2);
	};
	/**
	* Does check to see if the input box and last search term match
	* @return true if they do, or if no search has taken place
	*/
	proto.isInSync = function (checkLength) {
		var input = this._inputEl.value.trim(),
			currentSearchTerm = this._currentSearchTerm.trim();
		if (checkLength === undefined) {
			checkLength = MIN_INPUT_LENGTH;
		}
		if (input.length >= checkLength &&  currentSearchTerm !== input) {
			return false;
		}
		return true;
	};

	/**
	* Enable the SearchBar. Does nothing in this implementation. Override if required.
	*/
	proto.enable = function () {

	};

	/**
	* Disable the SearchBar. Does nothing in this implementation. Override if required.
	*/
	proto.disable = function () {

	};

	proto.renderTopBorderRadius = function () {
		$U.core.util.HtmlHelper.setBorderRadiusTop(this._searchContainer);
	};

	proto.renderFullBorderRadius = function () {
		$U.core.util.HtmlHelper.setBorderRadiusFull(this._searchContainer);
	};

	proto.addZindex = function () {
		this._suggestionsEl.style.zIndex = "1";
	};

	proto.removeZindex = function () {
		this._suggestionsEl.style.zIndex = "0";
	};

	return SearchBar;
}());
