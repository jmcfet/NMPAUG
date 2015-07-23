var $U = $U || {};
$U.browse = $U.browse || {};

/**
 * $U.browse.MultiBrowseScreen
 */
$U.browse.MultiCategoryScreen = ( function() {

	var logger = $U.core.Logger.getLogger("MultiCategoryScreen");

	//This is a static class so no use of $N.apps.util.Util.extend

	var _assetScrollers = [];
	var _desktopBrowseScrollerContainer;
	var _browseDiv;
	var _seeAll;
	var _currentCategory = null;
	var lastFetcher;

	/**
	 * Initialises the Browse Screen
	 */
	function initialise() {
		$U.browse.MultiCategoryScreen._seeAllListeners = new $U.core.util.SimpleSet();
		writeHTML();
		_browseDiv = document.getElementById("multiCategory");
		_desktopBrowseScrollerContainer = document.getElementById("multiCategoryBrowseScrollerContainer");
	}

	/**
	 * Activates the Browse Screen
	 */
	function activate() {
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
	 */
	function populateAssets(items, title, uid, showSeeAll, index) {
		var assetScroller = new $U.core.widgets.DesktopAssetScroller(title, _desktopBrowseScrollerContainer, false, "title: " + title + " uid: " + uid);

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

		assetScroller.populate(items);

		var assetScrollerObj = {
			name : title,
			scroller : assetScroller
		};
		_assetScrollers.push(assetScrollerObj);
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
		_currentCategory = null;
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
		$U.browse.MultiCategoryScreen._seeAllListeners.add(listener);
	}

	/**
	 * Remove a seeAll listener
	 * @param {Object} listener
	 */
	function removeSeeAllListener(listener) {
		$U.browse.MultiCategoryScreen._seeAllListeners.remove(listener);
	}

	/**
	 * Sets the current category. It's supposed to have subcategories
	 */
	function setCurrentCategory(category) {
		if (category && category.children.length > 0) {
			deepClearAssets();
			_currentCategory = category;
			$(_browseDiv).addClass("subcategory");
			createCurrentCategoryHeader();
			populateNextCategory(category.children, 0, setCurrentCategoryComplete);
		}
	}

	/**
	 * Adds a single category to the screen
	 * @param {Array} categories the list of categories
	 * @param {number} index the index of the category to add
	 * @param {Function} populateCategoriesComplete callback when finished
	 */
	function populateNextCategory(categories, index, populateCategoriesComplete) {
		var category;
		var showSeeAll = true;

		if (index < categories.length) {
			category = categories[index];
			lastFetcher = $U.core.menudata.MenuData.fetchAssets(category.id, function(items, fetcher) {
				var shouldPopulate = (fetcher === lastFetcher);
				if (logger) {
					logger.log("populateNextCategory.successCallback", "fetcher: " + fetcher.id + " waiting for fetcherId: " + lastFetcher.id);
					logger.log("populateNextCategory.successCallback", "shouldPopulate: ", shouldPopulate);
				}
				if (shouldPopulate) {
					if(items.length > 0){
						if (category.id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || category.id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
							populateAssets(items, $U.core.NPVRManager.getInstance().getBrowseHeading(category.id), category.id, showSeeAll, index);
						} else {
							populateAssets(items, category.name, category.id, showSeeAll, index);
						}
					}
					populateNextCategory(categories, index + 1, populateCategoriesComplete);
				}
			});
			if (logger) {
				logger.log("populateNextCategory", "fetcher >>> " + lastFetcher.id);
			}
		} else {
			if (populateCategoriesComplete) {
				populateCategoriesComplete();
			}
		}
	}

	// TODO: Write HTML nicely
	function writeHTML() {
		var browseDiv = $U.core.util.DomEl.createDiv().setId("multiCategory").setClassName("screen browse-screen hide").asElement();
		$U.core.util.DomEl.createDiv().setId("multiCategoryBrowseScrollerContainer").setClassName("desktop-browse-scroller").attachTo(browseDiv);
		document.getElementById("masterContainer").appendChild(browseDiv);
	}

	function setCurrentCategoryComplete() {
		if(_assetScrollers.length === 0){
			setNoItemsMessage("txtNoResultsInCategory");
		}
		$U.core.widgets.PageLoading.hide($U.browse.MultiCategoryScreen);
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
		document.getElementById("multiCategoryBrowseScrollerContainer").appendChild(noResultsMsg);
		//categoryGridContainerEl.insertBefore(noResultsMsg, categoryGridEl);
	}

	function createCurrentCategoryHeader() {
		var currentCategoryHeaderContainer = document.createElement("div");
		var currentCategoryHeaderLine = document.createElement("div");
		var categoryTitleDiv = document.createElement("div");
		var categoryTitle = document.createElement("h1");

		currentCategoryHeaderContainer.className = 'browse-subcategory-header-container';
		currentCategoryHeaderLine.className = 'browse-subcategory-header-line';
		categoryTitle.className = "browse-subcategory-header-title browse-subcategory-header-title-position";

		categoryTitle.innerHTML = _currentCategory.name;

		categoryTitleDiv.appendChild(categoryTitle);
		currentCategoryHeaderContainer.appendChild(categoryTitleDiv);
		currentCategoryHeaderContainer.appendChild(currentCategoryHeaderLine);

		_desktopBrowseScrollerContainer.appendChild(currentCategoryHeaderContainer);
	}

	function getScreenData() {
		return _currentCategory;
	}

	return {
		initialise : initialise,
		activate : activate,
		deactivate : deactivate,
		resizeHandler : resizeHandler,
		addSeeAllListener : addSeeAllListener,
		removeSeeAllListener : removeSeeAllListener,
		setCurrentCategory : setCurrentCategory,
		getScreenData : getScreenData
	};
}()
);
