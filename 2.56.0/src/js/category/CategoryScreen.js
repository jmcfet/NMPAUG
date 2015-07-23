var $U = $U || {};
$U.category = $U.category || {};

$U.category.CategoryScreen = ( function() {

	/**
	 * @class $U.category.CategoryScreen
	 * @singleton
	 * main entry point for the Category Screen
	 */

	// DOM Elements
	// These are initially set to null because at this point the DOM is not ready
	var categoryGridEl = null;
	var categoryGridContainerEl = null;
	var categoryHeaderEl = null;
	var categoryTitleEl = null;
	var categoryScreenEl = null;
	var NO_RESULTS_KEY = "txtNoResultsInCategory";
	var NO_FAVOURITES_KEY = "txtNoResultsInFavourites";
	var NO_RESULTS_PARENTAL_KEY = "txtNoResultsParentalInCategory";
	var NO_SEARCHRESULTS_KEY = "txtNoResultsInSearch";

	var catID;
	var currentCategory;
	var allAssets;
	var _title;
	var _jobID;

	// Components
	// These are the components that will be created  by the CategoryScreen.
	var categoryGrid = null;

	var scrollEndHandler = null;

	var _parentalBlocked;
	var _startIndex;
	var _endIndex;
	var _totalItems;
	var _searchMoreCallback;

	/**
	 * Initialise is only called once in $U.core.JoinIn on Jquery entry point.
	 * @param {HTMLElement} domEl
	 */
	function initialise() {
		writeHTML();
		// Dom Elements that are used throughout the CategoryScreen
		categoryScreenEl = document.getElementById("category");
		categoryGridEl = document.getElementById("categoryGrid");
		categoryGridContainerEl = document.getElementById("categoryGridContainer");
		categoryHeaderEl = document.getElementById("categoryHeader");
		categoryTitleEl = document.getElementById("categoryTitle");

		//Create Components
		categoryGrid = new $U.core.widgets.DesktopCategoryAssetGrid(categoryGridEl, {
			active : true
		});
	}

	/**
	 * Activates the category screen
	 */
	function activate(skipReload) {
		$U.core.util.ScrollableHelper.enableScrollForContainer(categoryGridContainerEl);
		if (!skipReload && (catID === $U.core.category.favourites.FavouritesCategoryProvider.ID || catID === $U.core.category.recentlyviewed.RecentlyViewedCategoryProvider.ID || catID === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID || catID === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || catID === $U.core.category.pvr.PVRScheduledCategoryProvider.ID || catID === $U.core.category.pvr.PVRRecordedCategoryProvider.ID || catID === $U.core.category.pvr.PVRNowPlayingCategoryProvider.ID || catID === $U.core.category.pvr.PVRChannelsCategoryProvider.ID)) {
			clearCategory();
			if (currentCategory.assets) {
				populateAssetsWithTitle(currentCategory.assets, currentCategory.title, currentCategory.id);
			} else {
				populateCategory(currentCategory);
			}
		}
		categoryGrid.resizeHandler();
	}

	/**
	 * Populates the assets of this category and writes the title
	 * @param {Object} items
	 */
	function populateCategory(category) {
		categoryGridContainerEl.removeEventListener("scroll", scrollEndHandler, false);
		scrollEndHandler = null;
		catID = category.id;
		currentCategory = category;
		if (catID === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || category.id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
			setTitle($U.core.NPVRManager.getInstance().getBrowseHeading(catID));
		} else {
			setTitle(category.fullPath);
		}

		clearNoItemsMessage();
		categoryGrid.clearDOM();

		// Fetch the assets, populate the grid
		$U.core.menudata.MenuData.fetchAssets(catID, function(items, fetcher, count, offset, totalAssetCount, parentalBlocked) {
			allAssets = items;
			populateAssets(items, catID, parentalBlocked);
		}, undefined, undefined, true);
	}

	function clearCategory() {
		categoryGridContainerEl.removeEventListener("scroll", scrollEndHandler, false);
		scrollEndHandler = null;
		categoryGrid.clearDOM();
		clearNoItemsMessage();
		allAssets = [];
		catID = null;
		_jobID = null;
		_title = null;
	}

	/**
	 * loads a set of Assets into the category screen
	 * @param assets what to load into the screen
	 * @param id the ID used to get the assets
	 */
	function populateAssets(assets, id, parentalBlocked, startIndex, endIndex, totalItems, searchMoreCallback) {

		_parentalBlocked = parentalBlocked;
		_startIndex = startIndex;
		_endIndex = endIndex;
		_totalItems = totalItems;
		_searchMoreCallback = searchMoreCallback;

		categoryGridContainerEl.removeEventListener("scroll", scrollEndHandler, false);
		scrollEndHandler = null;

		if (!id) {
			id = null;
		}

		if (catID !== id) {
			catID = id;
		}

		var repopulate = true;
		if (id === $U.core.View.SEARCH_SCREEN_ID) {
			if(startIndex > 0) {
				repopulate = false;
			}

			if (endIndex && endIndex < totalItems) {
				scrollEndHandler = function(ev) {
					if(categoryGridContainerEl.scrollTop + categoryGridContainerEl.clientHeight >= categoryGridContainerEl.scrollHeight) {
						categoryGridContainerEl.removeEventListener("scroll", scrollEndHandler, false);
						scrollEndHandler = null;
						searchMoreCallback(endIndex);
					}
				};
				categoryGridContainerEl.addEventListener("scroll", scrollEndHandler, false);
			}
		}

		if(repopulate) {
			if (assets.length > 0) {
				allAssets = assets;
			}
			// Before re-populating make sure the screens scrollTop position is set back to 0
			resetScrollPosition();
			categoryGrid.populate(allAssets);
		} else {
			if (assets.length > 0) {
				allAssets = allAssets.concat(assets);
			}
			categoryGrid.populate(allAssets, true);
		}

		if (allAssets.length === 0) {
			if (id === $U.core.category.favourites.FavouritesCategoryProvider.ID) {
				setNoItemsMessage(NO_FAVOURITES_KEY);
			} else if (id === $U.core.View.SEARCH_SCREEN_ID) {
				setNoItemsMessage(NO_SEARCHRESULTS_KEY);
			} else if (parentalBlocked) {
				setNoItemsMessage(NO_RESULTS_PARENTAL_KEY);
			} else {
				setNoItemsMessage(NO_RESULTS_KEY);
			}
		}

		if (id === $U.core.category.favourites.FavouritesCategoryProvider.ID) {
			categoryGrid.addRemoveButtons($U.core.category.favourites.FavouritesRemove.showRemoveDialog);
		}
		if (id === $U.core.category.pvr.PVRRecordedCategoryProvider.ID || id === $U.core.category.pvr.PVRScheduledCategoryProvider.ID) {
			categoryGrid.addRemoveButtons($U.core.category.pvr.PVRRemove.showRemoveDialog);
		}
		if (id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID || id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID) {
			categoryGrid.addRemoveButtons($U.core.NPVRManager.getInstance().deleteFromTile);
		}
		$U.core.widgets.PageLoading.hide("showCategoryDesktop");
	}

	/**
	 * loads a set of Assets into the category screen, with a title.
	 * Used when want to display the screen and already have the assets
	 * @param assets what to load into the screen
	 * @param title what to show in the title bar
	 * @param id the id of the category
	 */
	function populateAssetsWithTitle(assets, title, id, jobId) {

		currentCategory = {
			id : id,
			title : title,
			assets : assets
		};

		catID = id;
		_jobID = jobId;

		setTitle(title);
		clearNoItemsMessage();
		categoryGrid.clearDOM();

		allAssets = assets;

		// Before re-populating make sure the screens scrollTop position is set back to 0
		resetScrollPosition();
		categoryGrid.populate(allAssets);

		if (allAssets.length === 0) {
			setNoItemsMessage(NO_RESULTS_KEY);
		}

		if (id === $U.core.category.pvr.PVRRecordedCategoryProvider.ID || id === $U.core.category.pvr.PVRScheduledCategoryProvider.ID) {
			categoryGrid.addRemoveButtons($U.core.category.pvr.PVRRemove.showRemoveDialog);
		}

		if (id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID || id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID) {
			categoryGrid.addRemoveButtons($U.core.NPVRManager.getInstance().deleteFromTile);
		}

		$U.core.widgets.PageLoading.hide("showCategoryWithAssets");
	}

	function resetScrollPosition() {
		categoryGridContainerEl.scrollTop = 0;
	}

	function setTitle(title) {
		categoryTitleEl.innerHTML = title;
		_title = title;
	}

	/**
	 * Handles resizes
	 */
	function resizeHandler() {
		categoryGrid.populate([]);
		var assets = allAssets.slice(0);
		allAssets = [];
		populateAssets(assets, catID, _parentalBlocked, _startIndex, _endIndex, _totalItems, _searchMoreCallback);
	}

	/**
	 * Deactivates the category screen
	 */
	function deactivate() {
		categoryGridContainerEl.removeEventListener("scroll", scrollEndHandler, false);
		scrollEndHandler = null;
		_parentalBlocked = undefined;
		_startIndex = undefined;
		_endIndex = undefined;
		_totalItems = undefined;
		_searchMoreCallback = undefined;
		//		categoryGrid.clearDOM();
	}

	// TODO: Write HTML nicely
	function writeHTML() {

		var containerClassName = "category-grid-container";

		// Fix IE9 scrollbar position bug
		if ($U.core.Device.isIE9()) {
			containerClassName += " content-box-sizing";
		}

		var categoryDiv = $U.core.util.DomEl.createDiv().setId("category").setClassName("screen category-screen hide").asElement();
		//@formatter:off
		var h =
			'<div id="categoryHeader">' +
				'<h1 id="categoryTitle" class="category-title"> </h1>' +
			'</div>' +
			'<div id="categoryGridContainer" class="' + containerClassName + '">' +
				'<div id="categoryGrid" class="category-grid-scroller"></div>' +
			'</div>';
		//@formatter:on
		categoryDiv.innerHTML = h;
		document.getElementById("masterContainer").appendChild(categoryDiv);
	}

	/**
	 * Removes an asset from being displayed on the screen
	 * @param {$U.core.mediaitem.MediaItem} item the item to be removed from the screen
	 */
	function removeAsset(item) {
		var i = allAssets.indexOf(item);
		if (i > -1) {
			allAssets.splice(i, 1);
			this.populateAssets(allAssets, catID);
			$U.core.View.refreshCategory(catID);
		}
	}

	/**
	 * Sets the message that nothing is available for display on this screen
	 */
	function setNoItemsMessage(key) {
		var noResultsMsg = document.getElementById("noResultsMsg");
		var msg = $U.core.util.StringHelper.getString(key);

		if (noResultsMsg) {
			noResultsMsg.parentNode.removeChild(noResultsMsg);
		}

		noResultsMsg = $U.core.util.DomEl.createElWithText("div", msg).setId("noResultsMsg").setClassName("browse-no-results").asElement();
		categoryGridContainerEl.insertBefore(noResultsMsg, categoryGridEl);
	}

	/**
	 * Clears the message that nothing is available for display on this screen
	 */
	function clearNoItemsMessage() {
		var noResultsMsg = document.getElementById("noResultsMsg");
		if (noResultsMsg) {
			noResultsMsg.parentNode.removeChild(noResultsMsg);
		}
	}

	/**
	 * @returns the id of the category currently in the screen
	 */
	function getCatID() {
		return catID;
	}

	/**
	 * @returns the id of the category currently in the screen
	 */
	function getJobID() {
		return _jobID;
	}

	/**
	 * @return all the information needed to display into a screen
	 */
	function getScreenData() {
		var returnObj = {
			id : catID,
			title : _title,
			assets : allAssets,
			category : currentCategory,
			jobId : _jobID
		};
		return returnObj;
	}

	return {
		initialise : initialise,
		resizeHandler : resizeHandler,
		populateCategory : populateCategory,
		populateAssets : populateAssets,
		populateAssetsWithTitle : populateAssetsWithTitle,
		setTitle : setTitle,
		setNoItemsMessage : setNoItemsMessage,
		clearNoItemsMessage : clearNoItemsMessage,
		clearCategory : clearCategory,
		activate : activate,
		deactivate : deactivate,
		removeAsset : removeAsset,
		getCatID : getCatID,
		getJobID : getJobID,
		getScreenData : getScreenData
	};

}());
