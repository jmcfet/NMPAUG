var $U = $U || {};
$U.browse = $U.browse || {};

/**
 * $U.browse.MultiBrowseScreen
 */
$U.browse.MultiBrowseScreen = ( function() {

	var logger = $U.core.Logger.getLogger("MultiBrowseScreen");

	//This is a static class so no use of $N.apps.util.Util.extend

	var _assetScrollers = [];
	var _desktopBrowseScrollerContainer;
	var _browseDiv;
	var _seeAll;
	var _firstAssetPopulation = true;
	var _isCatalogueMenuVisible = false;
	var _allCategoriesButton;

	/**
	 * Initialises the Browse Screen
	 */
	function initialise() {
		$U.browse.MultiBrowseScreen._seeAllListeners = new $U.core.util.SimpleSet();
		writeHTML();
		_browseDiv = document.getElementById("browse");
		_desktopBrowseScrollerContainer = document.getElementById("desktopBrowseScrollerContainer");
		_desktopBrowseScrollerContainer.addEventListener("click", function(e) {
			$U.core.View.hideCatalogueMenu();
			_isCatalogueMenuVisible = false;
			if (_allCategoriesButton) {
				_allCategoriesButton.innerHTML = $U.core.util.StringHelper.getString("txtAllCategories") + " \u25B6";
			}
		});
	}

	/**
	 * Activates the Browse Screen
	 */
	function activate(skipReload) {
		if (!skipReload) {
			refreshCategory($U.core.category.recentlyviewed.RecentlyViewedCategoryProvider.ID);
			refreshCategory($U.core.category.favourites.FavouritesCategoryProvider.ID);
			refreshCategory($U.core.category.npvr.NPVRCompletedCategoryProvider.ID);
			refreshCategory($U.core.category.npvr.NPVRScheduledCategoryProvider.ID);
			refreshCategory($U.core.category.pvr.PVRScheduledCategoryProvider.ID);
			refreshCategory($U.core.category.pvr.PVRRecordedCategoryProvider.ID);
			refreshCategory($U.core.category.pvr.PVRNowPlayingCategoryProvider.ID);
			//refreshCategory($U.core.category.pvr.PVRChannelsCategoryProvider.ID);
		}
		resizeHandler(true);
	}

	/**
	 * Deactivates the Browse Screen
	 */
	function deactivate() {

	}

	/**
	 * Creates and populates an AssetScroller with items
	 *
	 * @param {Object} items Items to add to the scroller
	 * @param {String} title the category title
	 * @param {Boolean} shouldHideIfEmpty
	 */
	function populateAssets(items, title, uid, showSeeAll, index, shouldHideIfEmpty, pageSize, pageOffset, totalAssetCount, scrollToEnd) {

		var assetScrollerObj = getAssetScroller(uid);
		var assetScroller;

		if (assetScrollerObj) {
			assetScroller = assetScrollerObj.scroller;
		} else {
			assetScroller = new $U.core.widgets.DesktopAssetScroller(title, _desktopBrowseScrollerContainer, shouldHideIfEmpty, title + "[" + uid + "]");
		}

		if (showSeeAll) {

			_seeAll = document.createElement("h2");
			_seeAll.className = "browse-button seeall-button-position";

			//add the see all text
			_seeAll.innerHTML = $U.core.util.StringHelper.getString("txtSeeAll") + " \u25B6";

			//click event on seeAll
			_seeAll.addEventListener('click', function(e) {
				var listeners = $U.browse.MultiBrowseScreen._seeAllListeners.toArray();
				for (var i = 0; i < listeners.length; i++) {
					listeners[i](uid);
				}

				e.preventDefault();
			});
			assetScroller._domElement.appendChild(_seeAll);
		}

		assetScroller.populate(items, true, uid, pageSize, pageOffset, totalAssetCount, scrollToEnd);

		if (!assetScrollerObj) {
			assetScrollerObj = {
				name : title,
				scroller : assetScroller,
				id : uid
			};
			_assetScrollers.push(assetScrollerObj);
		}

		if (_firstAssetPopulation) {
			_firstAssetPopulation = false;
			createAllCategoriesButton(_desktopBrowseScrollerContainer);
		}
	}

	/**
	 * Clears all items
	 *
	 */
	function deepClearAssets() {
		for (var i = 0; i < _assetScrollers.length; i++) {
			var scroller = _assetScrollers[i];
			scroller.scroller.removeScrollerListener();
			scroller.scroller.clearDOM();
		}

		while (_desktopBrowseScrollerContainer.firstChild) {
			_desktopBrowseScrollerContainer.removeChild(_desktopBrowseScrollerContainer.firstChild);
		}

		_assetScrollers = [];
		_firstAssetPopulation = true;
		_browseDiv.scrollTop = 0;
	}

	/**
	 * handles the resize
	 */
	function resizeHandler() {
		var l = _assetScrollers.length;
		var i;
		for ( i = 0; i < l; i++) {
			_assetScrollers[i].scroller.resizeHandler();
		}
	}

	/**
	 * Add a seeAll listener
	 * @param {Object} listener
	 */
	function addSeeAllListener(listener) {
		$U.browse.MultiBrowseScreen._seeAllListeners.add(listener);
	}

	/**
	 * Remove a seeAll listener
	 * @param {Object} listener
	 */
	function removeSeeAllListener(listener) {
		$U.browse.MultiBrowseScreen._seeAllListeners.remove(listener);
	}

	/**
	 * Adds a list of categories to the screen
	 * @param {Array} categories the categories to add
	 */
	function populateCategories(categories) {
		if (logger) {
			logger.log("populateCategories", categories);
		}
		deepClearAssets();
		populateNextCategory(categories, 0, populateCategoriesComplete);
	}

	function populateCategoriesComplete() {

		// Make sure the menu is out of view. i.e. it's translate Y property is set
		$U.core.View.hideCatalogueMenu();

		//click event on seeAll
		_allCategoriesButton.addEventListener("click", function(e) {
			toggleCatalogueMenu();
			e.preventDefault();
			e.stopPropagation();
		});
		// Remove the class which applies an opacity to make the button appear to be disabled
		$U.core.util.HtmlHelper.removeClass(_allCategoriesButton, "allcategories-button-disabled");

	}

	function pageReady() {
		$U.core.widgets.PageLoading.hide($U.browse.MultiBrowseScreen);
	}

	/**
	 * Adds a single category to the screen
	 * @param {Array} categories the list of categories
	 * @param {number} index the index of the category to add
	 * @param {Function} populateCategoriesComplete callback when finished
	 */
	function populateNextCategory(categories, index, populateCategoriesComplete) {
		var category;
		var showSeeAll = index > 0;
		var lastFetcher;
		var shouldHideIfEmpty;
		var count;
		if (index < categories.length) {
			category = categories[index];
			if(logger){
				logger.timeStampLog("GET THE CATEGORY :" + category.id);
			}
			if (category.id !== $U.core.category.pvr.PVRRecordedCategoryProvider.ID && category.id !== $U.core.category.pvr.PVRScheduledCategoryProvider.ID) {
				count = $U.core.Configuration.ASSET_PAGE_SIZE;
			}
			lastFetcher = $U.core.menudata.MenuData.fetchAssets(category.id, function(items, fetcher, count, offset, totalAssetCount) {
				if (logger) {
					logger.log("populateNextCategory", "fetcher <<< " + fetcher.id);
				}
				if(logger){
					logger.timeStampLog("GOT THE CATEGORY :" + fetcher.id);
				}
				// Don't hide custom categories or the featued category even if its empty
				if (category.isCustom || category.isFeatured) {
					shouldHideIfEmpty = false;
				} else {
					shouldHideIfEmpty = true;
				}
				if (category.id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || category.id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
					populateAssets(items, $U.core.NPVRManager.getInstance().getBrowseHeading(category.id), category.id, showSeeAll, index);
				} else {
					populateAssets(items, category.name, category.id, showSeeAll, index, shouldHideIfEmpty, count, offset, totalAssetCount);
				}
				populateNextCategory(categories, index + 1, populateCategoriesComplete);
			}, count, 0, true);
			if (logger) {
				logger.log("populateNextCategory", "fetcher >>> " + lastFetcher.id);
			}
		} else {
			if (populateCategoriesComplete) {
				populateCategoriesComplete();
			}
		}
		if (index === 0) {
			window.setTimeout(pageReady, 1);
		}
	}

	function pageCategory(categoryId, pageSize, pageOffset, scrollToEnd) {
		if (logger) {
			logger.log("pageCategory", "categoryId:", categoryId, "pageSize:", pageSize, "pageOffset", pageOffset);
		}
		var fetcher = $U.core.menudata.MenuData.fetchAssets(categoryId, function(items, fetcher, pageSize, pageOffset, totalAssetCount) {
			populateAssets(items, undefined, categoryId, undefined, undefined, undefined, pageSize, pageOffset, totalAssetCount, scrollToEnd);
		}, pageSize, pageOffset);
	}

	// TODO: Write HTML nicely
	function writeHTML() {
		var className = "screen browse-screen hide";

		// Fix IE9 scrollbar position bug
		if ($U.core.Device.isIE9()) {
			className += " content-box-sizing";
		}

		var browseDiv = $U.core.util.DomEl.createDiv().setId("browse").setClassName(className).asElement();
		$U.core.util.DomEl.createDiv().setId("desktopBrowseScrollerContainer").setClassName("desktop-browse-scroller").attachTo(browseDiv);
		browseDiv.appendChild($U.core.View.getCatalogueMenu().getContainer());
		document.getElementById("masterContainer").appendChild(browseDiv);
	}

	/**
	 * Toggles the CatalogueMenu visibility
	 */
	function toggleCatalogueMenu() {
		if (_isCatalogueMenuVisible) {
			$U.core.View.hideCatalogueMenu();
			_isCatalogueMenuVisible = false;
			_allCategoriesButton.innerHTML = $U.core.util.StringHelper.getString("txtAllCategories") + " \u25B6";
		} else {
			$U.core.View.showCatalogueMenu();
			_isCatalogueMenuVisible = true;
			_allCategoriesButton.innerHTML = $U.core.util.StringHelper.getString("txtAllCategories") + " \u25BC";
		}
	}

	function createAllCategoriesButton(container) {
		_allCategoriesButton = document.createElement("h2");
		_allCategoriesButton.id = 'allCategoriesButton';
		_allCategoriesButton.className = "browse-button allcategories-button-disabled";

		//add the see all text
		_allCategoriesButton.innerHTML = $U.core.util.StringHelper.getString("txtAllCategories") + " \u25B6";

		container.appendChild(_allCategoriesButton);
	}

	/**
	 * Re-grabs the content from the server for a specific category
	 * @param {Object} id the id of the category to get
	 */
	function refreshCategory(id) {
		var assetScroller = getAssetScroller(id);
		var count;
		if (assetScroller) {
			if (id !== $U.core.category.pvr.PVRRecordedCategoryProvider.ID && id !== $U.core.category.pvr.PVRScheduledCategoryProvider.ID) {
				count = $U.core.Configuration.ASSET_PAGE_SIZE;
			}
			$U.core.menudata.MenuData.fetchAssets(id, function(items, fetcher) {
				if (logger) {
					logger.log("refreshCategory", "fetcher <<< " + fetcher.id);
				}
				refreshScroller(items, id);
			}, count, 0, true);
		} else {
			if (logger) {
				logger.log("refreshCategory", "haven't got " + id + " scroller");
			}
		}
	}

	/**
	 * Puts the freshly grabbed items into the correct scroller
	 * @param {Object} items the items from the server
	 * @param {Object} uid the id of the scroller which will contain the items
	 */
	function refreshScroller(items, uid) {
		var assetScroller = getAssetScroller(uid);
		if (assetScroller) {
			assetScroller.scroller.populate(items);
			if (uid === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || uid === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
				assetScroller.scroller.updateTitle($U.core.NPVRManager.getInstance().getBrowseHeading(uid));
			}
		}
	}

	function refreshCategoryTitle(uid) {
		var assetScroller = getAssetScroller(uid);
		if (assetScroller) {
			if (uid === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || uid === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
				assetScroller.scroller.updateTitle($U.core.NPVRManager.getInstance().getBrowseHeading(uid));
			}
		}

	}

	function getAssetScroller(categoryId) {
		var result;
		var l = _assetScrollers.length;
		var i;
		for ( i = 0; i < l; i++) {
			if (_assetScrollers[i].id === categoryId) {
				result = _assetScrollers[i];
				break;
			}
		}
		return result;
	}

	function getScreenData() {
		return null;
	}

	return {
		initialise : initialise,
		activate : activate,
		deactivate : deactivate,
		resizeHandler : resizeHandler,
		addSeeAllListener : addSeeAllListener,
		removeSeeAllListener : removeSeeAllListener,
		populateCategories : populateCategories,
		refreshCategory : refreshCategory,
		refreshCategoryTitle : refreshCategoryTitle,
		pageCategory : pageCategory,
		getScreenData : getScreenData
	};
}()
);
