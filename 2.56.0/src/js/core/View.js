/**
 * Implements the View, which is the fullscreen contained in the MasterContainer
 *
 * @class $U.core.View
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.View = ( function() {

	var logger = $U.core.Logger.getLogger("View");

	// A screen identifier
	var SCREENID = {
		BROWSE : {
			name : "browse"
		},
		EPG : {
			name : "epg"
		},
		MEDIACARD : {
			name : "mediaCard"
		},
		SEARCH : {
			name : "search"
		},
		DIALOG : {
			name : "dialog"
		},
		CATEGORY : {
			name : "category"
		},
		MULTICATEGORY : {
			name : "multiCategory"
		},
		HOME : {
			name : "home"
		}
	};
	var SEARCH_SCREEN_ID = "searchScreen";
	var currentScreenId = null;
	var obscuredScreenId = null;
	var historyStk = [];

	var header = null;
	var catalogueMenu = null;
	var browseScreen = null;
	var multiCategoryScreen = null;
	var categoryScreen = null;
	var epgScreen = null;
	var mediaCardScreen = null;
	var searchScreen = null;
	var dialog = [];
	var viewContainer = null;
	var resizeCount = 0;
	var resizeTime = 0;
	var desktop = $U.core.Device.isDesktop();
	var menuLoaded = false;
	var lastFetcher = null;
	var suppressResize = false;
	var initialised = false;


	var _searchMoreCallback = null;

	/**
	 * sets the viewContainer
	 * @param {HTMLElement} container
	 */
	var setViewContainer = function(container) {
		viewContainer = document.getElementById(container);
	};

	/**
	 * creates the view
	 * @param {HTMLElement} container
	 */
	var create = function(container) {

		currentScreenId = null;
		obscuredScreenId = null;
		historyStk = [];
		destroyAllDialogs();

		header = $U.header.HeaderBar.create($U.core.View);
		catalogueMenu = $U.browse.widgets.Menu.create("categoryMenu", document);
		if (desktop) {
			browseScreen = $U.browse.MultiBrowseScreen;
			browseScreen.initialise();
			multiCategoryScreen = $U.browse.MultiCategoryScreen;
			multiCategoryScreen.initialise();
			categoryScreen = $U.category.CategoryScreen;
			categoryScreen.initialise();
		} else {
			browseScreen = new $U.browse.BrowseScreen($U.core.View);
			searchScreen = new $U.search.SearchScreen.create($U.core.View, "search");
		}

		mediaCardScreen = $U.mediaCard.MediaCardScreen.create($U.core.View);

		epgScreen = $U.epg.EPGScreen;
		populateMenu();
		showBrowseScreen();

		if (history.replaceState && !initialised) {
			initialised = true;
			history.replaceState({
				stateName : "ExitState"
			}, null);
			history.pushState({
				stateName : "AppState"
			}, null);
			window.addEventListener('popstate', function(event) {
				history.pushState({
					stateName : "AppState"
				}, null);
				goBack();
			});
		}
	};

	function destroyAllDialogs() {
		while (getDialog()) {
			hideDialog();
		}
		dialog = [];
	}

	/**
	 * populates the menu with the catalogue data
	 */
	var populateMenu = function() {
		$U.core.menudata.MenuData.load(menuDataLoadCallback);
		if (desktop) {
			$U.core.widgets.PageLoading.show($U.browse.MultiBrowseScreen);
		} else {
			browseScreen.addScrollerListener(catalogueMenu);
		}
	};

	/**
	 * callback used when the data for the menu is loaded
	 */
	function menuDataLoadCallback() {
		var menuData = $U.core.menudata.MenuData.getMenuData();
		menuLoaded = true;
		catalogueMenu.populate(menuData);

		if (desktop) {
			browseScreen.addSeeAllListener(showCategoryDesktop);
			populateDesktopBrowseScreen();
		} else {
			loadCategory($U.core.Configuration.DEFAULT_CATALOGUE_UID);
		}
	}

	/**
	 * Populates the desktop browse screen
	 */
	function populateDesktopBrowseScreen() {
		var menuData;
		if (menuLoaded) {
			menuData = $U.core.menudata.MenuData.getMenuData();
			browseScreen.populateCategories(menuData);
		}
	}

	/**
	 * hides the catalogueMenu
	 */
	var hideCatalogueMenu = function() {
		if (catalogueMenu) {
			catalogueMenu.hide();
		}
	};

	/**
	 * shows the catalogueMenu
	 */
	var showCatalogueMenu = function() {
		catalogueMenu.show();
	};

	/**
	 * Removes a media item from the browse screen
	 * @param {$U.core.mediaItem.MediaItem} item
	 */
	var removeItemFromBrowseScreen = function(item) {
		var currentScreen = getScreen(currentScreenId);
		if (currentScreen.removeAsset) {
			currentScreen.removeAsset(item);
		}
	};

	/**
	 * Refreshes a individual category
	 * @param {string} id
	 */
	var refreshCategory = function(id) {
		browseScreen.refreshCategory(id);
	};

	var refreshCategoryTitle = function(id) {
		if (browseScreen) {
			browseScreen.refreshCategoryTitle(id);
		}

		if (categoryScreen && categoryScreen.getCatID() === id && !categoryScreen.getJobID()) {
			categoryScreen.setTitle($U.core.NPVRManager.getInstance().getBrowseHeading(id));
		}

	};

	/**
	 * Reloads a category based on the provided ID.
	 * @param {string} catalogueID the id of the catalogue
	 * @param {string} fullLoad should do a full async load of the category
	 * @param {Boolean} skipPush - Skip pushing the current screen to history
	 */
	var loadCategory = function(id, fullLoad, pageFrom, skipPush) {
		var offset;
		if (desktop) {
			showCategoryDesktop(id, skipPush);
		} else {
			if (pageFrom !== undefined) {
				this.offset = pageFrom;
			}
			offset = pageFrom !== undefined ? pageFrom : this.offset;
			showCategoryMobile(id, $U.core.Configuration.ASSET_PAGE_SIZE, offset, false, fullLoad);
		}
	};

	function pageMobile(categoryId, pageSize, pageOffset, scrollToEnd) {
		if(categoryId || categoryId === 0) {
			this.offset = pageOffset;
			showCategoryMobile(categoryId, pageSize, pageOffset, scrollToEnd);
		} else {
			var func = _searchMoreCallback;
			_searchMoreCallback = null;
			func(pageOffset);
		}
	}

	function showCategoryMobile(id, pageSize, pageOffset, scrollToEnd, fullLoad) {

		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				var heading = $U.core.menudata.MenuData.getHeading(id);

				$U.core.widgets.PageLoading.show("loadAssets");
				browseScreen.deepClearAssets();
				browseScreen.clearNoItemsMessage();
				browseScreen.setHeading(heading);

				if (lastFetcher && lastFetcher.cancel) {
					lastFetcher.cancel();
				}
				if(logger){
					logger.timeStampLog("GET THE CATEGORY :" + id);
				}
				lastFetcher = $U.core.menudata.MenuData.fetchAssets(id, function(items, fetcher, pageSize, pageOffset, totalAssetCount, parentalBlocked) {
					var shouldPopulate = (fetcher === lastFetcher);
					var displayItems;
					if (logger) {
						logger.log("showCategoryMobile.successCallback", "fetcher: " + fetcher.id + " waiting for fetcherId: " + lastFetcher.id);
					}
					if(logger){
						logger.timeStampLog("GOT THE CATEGORY :" + fetcher.id);
					}
					//MSUI-981 added this to close the menu only when have items for the new category
					if ($U.core.Options.inFlow()) {
						$U.core.Options.goBack(true);
					}
					if (shouldPopulate) {

						if (fetcher.allProcessedItems && (pageOffset === totalAssetCount) && (totalAssetCount !== 0)) {
							pageOffset = totalAssetCount - pageSize;
							items = fetcher.allProcessedItems.splice(pageOffset, totalAssetCount);
						}

						browseScreen.populate(items, id, pageSize, pageOffset, totalAssetCount, scrollToEnd, null, parentalBlocked);

						if (fetcher.savedItems) {
							browseScreen.setCachedItems(fetcher.savedItems);
						}

						if (fetcher.allProcessedItems) {
							browseScreen.setAllProcessedItems(fetcher.allProcessedItems);
						}

						browseScreen.setHeading(heading);
						$U.core.widgets.PageLoading.hide("loadAssets");
					}
				}, pageSize, pageOffset, fullLoad);

				if (logger) {
					logger.log("showCategoryMobile", "categoryId: " + id + " lastFetcherId: " + lastFetcher.id);
				}
			}
		});
	}

	/**
	 * displays a category to the desktop
	 * @param {string} id the id of the catalogue
	 * @param {Boolean} skipPush - Skip pushing the current screen to history
	 */

	function showCategoryDesktop(id, skipPush) {
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				var category = $U.core.menudata.MenuData.getMenuDataNode(id);
				if (!skipPush) {
					pushToHistory(currentScreenId);
				}
				if (category.children.length > 0) {
					$U.core.widgets.PageLoading.show($U.browse.MultiCategoryScreen);
					multiCategoryScreen.setCurrentCategory(category);
					switchScreen(SCREENID.MULTICATEGORY);
				} else {
					$U.core.widgets.PageLoading.show("showCategoryDesktop");
					categoryScreen.clearCategory();
					categoryScreen.populateCategory(category);
					switchScreen(SCREENID.CATEGORY, true);
				}
			}
		});
	}

	/**
	 * Used when the Assets are already available and they need to be shown without any loading of data
	 * @param {Array} assets an array of MediaItems
	 * @param {string} title the text to display in the header
	 * @param {string} id the id of the catalogue
	 */
	function showCategoryWithAssets(assets, title, id, taskId, isSubCategory) {
		if ($U.core.Device.isDesktop()) {
			$U.core.widgets.PageLoading.show("showCategoryWithAssets");
			pushToHistory(currentScreenId);
			categoryScreen.clearCategory();
			categoryScreen.populateAssetsWithTitle(assets, title, id, taskId, isSubCategory);
			switchScreen(SCREENID.CATEGORY, true);
		} else {
			$U.core.widgets.PageLoading.show("loadAssets");
			pushToHistory(currentScreenId);
			browseScreen.deepClearAssets();
			browseScreen.clearNoItemsMessage();
			browseScreen.setHeading(title);
			if ($U.core.Options.inFlow()) {
				$U.core.Options.goBack(true);
			}
			browseScreen.populate(assets, id, null, null, null, null, isSubCategory);
			showBrowseScreen(true, true);
			$U.core.widgets.PageLoading.hide("loadAssets");
		}
	}

	/**
	 * shows a dialog
	 * @param {Object} config the config Object for the dialog
	 * @param {string} callback the callback used when closing the dialog
	 * @param {HTMLElement} callerObj the Object that called the dialog (usually the screen)
	 * @return the dialog shown
	 */
	var showDialog = function(config, callback, callerObj) {
		var currentDialog = $U.core.widgets.dialog.Dialog.create(config, callback, callerObj);
		dialog.push(currentDialog);
		currentDialog.showDialog();
		if (header) {
			header.disable();
		}
		return currentDialog;
	};

	/**
	 * hides the most recent dialog
	 */
	function hideDialog() {
		if (getDialog()) {
			getDialog().deactivate(true);
			dialog.pop();
		}
		if (header) {
			header.enable();
		}
	}

	/**
	 * returns the header
	 * @return the header
	 */
	var getHeader = function() {
		return header;
	};

	/**
	 * returns the catalogueMenu
	 * @return the catalogueMenu
	 */
	var getCatalogueMenu = function() {
		return catalogueMenu;
	};

	/**
	 * returns the viewContainer
	 * @return the viewContainer
	 */
	var getViewContainer = function() {
		return viewContainer;
	};

	/**
	 * returns the dialog
	 * @return the dialog
	 */
	var getDialog = function() {
		return dialog[dialog.length - 1];
	};

	/**
	 * pops the dialog and returns it
	 * @return the dialog
	 */
	var popDialog = function() {
		return dialog.pop();
	};

	var setSuppressResize = function(suppress) {
		suppressResize = suppress;
	};

	/**
	 * View resize handler
	 * @param {Event} evt
	 * @param {string} currentContext
	 */
	var resizeHandler = function(evt, currentContext) {
		var start = new Date().getTime();
		var ww = $(window).width();
		var wh = $(window).height();
		var currentScreen = null;
		var obscuredScreen = null;
		if (logger) {
			logger.log("resizeHandler", "*** Resize to: " + ww + " x " + wh);
		}

		// Fix for Mac fullscreen
		if (suppressResize) {
			if (logger) {
				logger.log("resize suppressed");
			}
			return;
		}

		if ($U.core.View.getDialog()) {
			//resize all the dialogs
			for (var i = 0; i < dialog.length; i++) {
				dialog[i].resizeHandler();
			}

			// Screen hidden underneath the dialog needs resizing too
			obscuredScreen = getScreen(obscuredScreenId);
			if (obscuredScreen) {
				obscuredScreen.resizeHandler();
			}
		}

		currentScreen = getScreen(currentScreenId);
		if (currentScreen) {
			currentScreen.resizeHandler();
		}

		window.setTimeout(function() {
			var elapsed = new Date().getTime() - start;
			resizeCount++;
			resizeTime += elapsed;
			debugOutput("" + resizeTime + " / " + resizeCount + " = " + (resizeTime / resizeCount));
		}, 0);

	};

	/**
	 * Debug output function that outputs a message to the screen
	 * @param {string} message
	 */
	function debugOutput(message) {
		// TODO: Uncomment for debugging
		//document.getElementById("debugOutput").textContent = message;
	}

	/**
	 * gets rid of all the items in the stack
	 */
	function clearHistory() {
		if (logger) {
			logger.log("clearHistory", "History : " + JSON.stringify(historyStk));
		}
		historyStk = [];
	}

	/**
	 * Go back to the previous screen
	 * @param {Boolean} skipReload true if the scrollers shouldn't reload when the page is re-activated
	 * @param {Object} deletedItem The item that was removed.
	 */
	function goBack(skipReload, deletedItem) {
		var historyObj;
		if (logger) {
			logger.log("goBack", "inFlow : <" + $U.core.Options.inFlow() + "> Dialog Length:" + dialog.length + " History : " + JSON.stringify(historyStk));
		}
		if ($U.core.Options.inFlow()) {
			if (getDialog() instanceof $U.core.widgets.dialog.FullscreenDialog) {
				hideDialog();
			} else {
				$U.core.Options.goBack();
			}
		} else if (dialog.length > 0) {
			hideDialog();
			if (header.removeHighlightAllButtons) {
				header.removeHighlightAllButtons();
			}
		} else {
			historyObj = historyStk.pop();
			if (currentScreenId === SCREENID.DIALOG) {
				currentScreenId = historyObj.screenId;
			}
			if (historyObj) {
				if (deletedItem && historyObj.data) {
					historyObj.data.assets = _removeFromHistory(historyObj.data.assets, historyObj.data.id, deletedItem);
				}
				if(historyObj.data && !historyObj.data.jobId && historyObj.data.id && (historyObj.data.id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || historyObj.data.id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID)) {
					historyObj.data.assets = $U.core.NPVRManager.getInstance().resortHistory(historyObj.data.assets, historyObj.data.id);
				}

				if (historyObj.screenId === SCREENID.HOME) {
					pushToHistory(SCREENID.HOME);
					showExitDialog();
				} else {
					switchScreen(historyObj.screenId, skipReload, historyObj.data);
				}
			}
		}
	}

	/**
	 * Removes the given deletedItem from the provided history object.
	 * @param {Object} historyObj object to remove the deleted item
	 * @param {Object} deletedItem the item to delete from this history object.
	 * @private
	 * @method _removeFromHistory
	 */
	var _removeFromHistory = function (historyAssets, id, deletedItem) {
		var index;

		if (historyAssets) {
			if (id === $U.core.category.pvr.PVRRecordedCategoryProvider.ID) {
				historyAssets.every(function (item, pos) {
					if (item.cdsObjectID === deletedItem.cdsObjectID) {
						index = pos;
						return false;
					} else {
						return true;
					}
				});
			} else if (id === $U.core.category.npvr.NPVRScheduledCategoryProvider.ID || id === $U.core.category.npvr.NPVRCompletedCategoryProvider.ID) {
				historyAssets.every(function (item, pos) {
					if (item.id === deletedItem.id) {
						index = pos;
						return false;
					} else {
						return true;
					}
				});
			}

			if (index !== null) {
				historyAssets.splice(index, 1);
			}
		}
		return historyAssets;
	};

	/**
	 * Loads and displays the category corresponding to the provided ID.
	 * @param {String} categoryId - ID of the category to show
	 * @private
	 * @method _showCategory
	 */
	var _showCategory = function (categoryId) {
		loadCategory(categoryId, true, 0, true);
		if (!desktop) {
			showBrowseScreen();
		}
	};

	/**
	 * Reloads the category root of the current category is empty.
	 * @method reloadCategoryIfEmpty
	 */
	function reloadCategoryIfEmpty() {
		var currentScreen = getScreen(currentScreenId),
			data = currentScreen.getScreenData();

		if (data && data.assets && data.assets.length === 0) {
			historyStk.pop();
			_showCategory(data.id);
		}
	}

	function pushToHistory(screenId) {
		var historyObj = {};
		var data;
		var addToStack = true;
		var activePhoneDialog;
		historyObj.screenId = screenId;
		switch(screenId) {
		case SCREENID.BROWSE:
			if ($U.core.Gateway.isGatewayAvailable() || $U.core.Configuration.NPVR_ENABLED) {
				data = browseScreen.getScreenData();
			}
			break;
		case SCREENID.CATEGORY:
			data = categoryScreen.getScreenData();
			break;
		case SCREENID.MULTICATEGORY:
			data = multiCategoryScreen.getScreenData();
			break;
		case SCREENID.SEARCH:
			if (screenId === getTopScreenId()) {
				addToStack = false;
			}
			break;
		case SCREENID.MEDIACARD:
			activePhoneDialog = getDialog() instanceof $U.core.widgets.dialog.PhoneSettingsDialog;
			if (screenId === currentScreenId && !activePhoneDialog) {
				addToStack = false;
			}
			break;
		default :
		//don't need no data
		}
		if (data) {
			historyObj.data = data;
		}
		if (addToStack) {
			historyStk.push(historyObj);
		}
		if (logger) {
			logger.log("pushToHistory", "History : " + JSON.stringify(historyStk));
		}
	}

	function showExitDialog() {

		var configurationObject = {}, isReload;

		if (history.length === 2 && !$U.core.Device.isAndroid()) {
			configurationObject.title = $U.core.util.StringHelper.getString("txtReloadApplicationTitle");
			configurationObject.htmlmessage = $U.core.util.StringHelper.getString("txtReloadAppMessage");
			isReload = true;
		} else {
			configurationObject.title = $U.core.util.StringHelper.getString("txtExitAppTitle");
			configurationObject.htmlmessage = $U.core.util.StringHelper.getString("txtExitAppMessage");
			isReload = false;
		}

		configurationObject.modal = true;
		configurationObject.type = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : null;

		// Confirm button
		configurationObject.buttons = [];
		configurationObject.buttons[0] = {};
		configurationObject.buttons[0].text = $U.core.util.StringHelper.getString("txtConfirm");
		configurationObject.buttons[0].name = "submit";
		configurationObject.buttons[0].icon = {
			iconClass : "icon-ok-sign",
			iconPos : "left"
		};

		// Cancel button
		configurationObject.buttons[1] = {};
		configurationObject.buttons[1].text = $U.core.util.StringHelper.getString("txtCancel");
		configurationObject.buttons[1].name = "cancel";
		configurationObject.buttons[1].icon = {
			iconClass : "icon-remove-sign",
			iconPos : "left"
		};

		var _exitCallback = function(interactiveElements, owner) {
			var shouldSeriesLink = false;
			var backToExit = -2;

			switch (interactiveElements[0].buttonClicked) {
			case "submit" :
				if ($U.core.Device.isAndroid()) {
					window.userAgent.quit();
				} else {
					history.go(backToExit);
				}
				break;
			case "cancel" :
				$U.core.View.hideDialog();
				break;
			}
		};

		var _reloadCallback = function(interactiveElements, owner) {
			switch (interactiveElements[0].buttonClicked) {
			case "submit" :
				location.reload();
				break;
			case "cancel" :
				$U.core.View.hideDialog();
				break;
			}
		};

		if (isReload) {
			showDialog(configurationObject, _reloadCallback);
		} else {
			showDialog(configurationObject, _exitCallback);
		}
	}

	/**
	 * Show the browse screen
	 */
	function showBrowseScreen(skip, keepHistory, callbackError) {
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				if (logger) {
					logger.log("showBrowseScreen", "enter");
				}
				if (!keepHistory) {
					clearHistory();
					pushToHistory(SCREENID.HOME);
				}
				switchScreen(SCREENID.BROWSE, skip, undefined, keepHistory);
			} else {
				if (callbackError) {
					callbackError();
				}
			}
		});
	}

	/**
	 * Show the EPG screen
	 */
	function showEPGScreen(callbackError) {
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				if (logger) {
					logger.log("showEPGScreen", "enter");
				}
				clearHistory();
				pushToHistory(SCREENID.HOME);
				switchScreen(SCREENID.EPG);
			} else {
				if (callbackError) {
					callbackError();
				}
			}
		});
	}

	/**
	 * Show the search screen
	 */
	function showSearchScreen(callback) {
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				if (logger) {
					logger.log("showSearchScreen", "enter");
				}
				clearHistory();
				pushToHistory(SCREENID.HOME);
				switchScreen(SCREENID.SEARCH);
				if (callback) {
					callback();
				}
			}
		});
	}

	function populateSearchScreen(items, searchTerm, startIndex, endIndex, totalItems, searchMoreCallback) {
		if (desktop) {
			// For desktop, the search screen isn't really a screen but is a reuse of the category screen
			if (currentScreenId !== SCREENID.SEARCH) {
				pushToHistory(currentScreenId);
			}
			pushToHistory(currentScreenId);
			if(startIndex === 0) {
				categoryScreen.clearCategory();
			}
			switchScreen(SCREENID.SEARCH);
			categoryScreen.setTitle($U.core.util.StringHelper.getString("txtSearchResults", {
				SEARCHTERM : searchTerm
			}));
			categoryScreen.populateAssets(items, $U.core.View.SEARCH_SCREEN_ID, false, startIndex, endIndex, totalItems, searchMoreCallback);
		} else {
			_searchMoreCallback = searchMoreCallback;
			searchScreen.populate(items, searchTerm, startIndex, endIndex, totalItems);
		}
	}

	/**
	 * Show the dialog screen.<br>
	 * This method just maintains the current and previous screen ids.<br>
	 * It does not actually show a screen.
	 */
	function showDialogScreen() {
		if (logger) {
			logger.log("showDialogScreen", "enter");
		}

		if (!obscuredScreenId) {
			obscuredScreenId = currentScreenId;
			$U.core.util.HtmlHelper.setVisibilityHidden(getScreenDomElement(obscuredScreenId));
		}

		if (currentScreenId !== SCREENID.DIALOG) {
			pushToHistory(currentScreenId);
			currentScreenId = SCREENID.DIALOG;
		}

		switchScreen(SCREENID.DIALOG);
	}

	/**
	 * Show the media card screen
	 * @param {$U.core.mediaitem.MediaItem} mediaItem the mediaItem to show
	 * @param {boolean} autoplay whether the mediaItem should auto play
	 */
	function showMediaCardScreen(mediaItem, moreLikeThisItems, autoplay, startOver, mltContext) {
		var screenTitle;
		var mediaCard2MediaCard = false;
		var handleMediaBrowse = function() {
			if (logger) {
				logger.log("showMediaCardScreen", "mediaItem", mediaItem, "moreLikeThisItems", moreLikeThisItems, "autoplay", autoplay, "startover", startOver);
			}
			//we don't want to be going to the MediaCard if the rating is too high
			if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(mediaItem.rating)) {
				pushToHistory(currentScreenId);
				mediaCardScreen.populate(mediaItem, moreLikeThisItems, autoplay, startOver, mltContext);
				if (currentScreenId === SCREENID.MEDIACARD) {
					mediaCard2MediaCard = true;
					mediaCardScreen.deactivate(mediaCard2MediaCard);
					mediaCardScreen.activate();
				} else {
					switchScreen(SCREENID.MEDIACARD);
				}
			}
		};
		
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			if (status) {
				if (!mediaItem.searchMatches) {
					if ($U.core.Configuration.recordUserActivity("BROWSE")) {
						$U.core.menudata.ContentDiscovery.recordUserActivity(handleMediaBrowse, $U.core.Configuration.CDG_USER_ACTIVITIES.BROWSE, mediaItem);
					} else {
						handleMediaBrowse();
					}
				} else {
					if ($U.core.Configuration.recordUserActivity("CLICKSEARCHRESULT")) {
						$U.core.menudata.ContentDiscovery.recordUserActivity(handleMediaBrowse, $U.core.Configuration.CDG_USER_ACTIVITIES.CLICKSEARCHRESULT, mediaItem);
					} else {
						handleMediaBrowse();
					}
				}
			}
		});
	}

	/**
	 * Switch to a screen
	 * @param {Object} screenId the id of the screen to switch to
	 * @param {boolean} skipReload true if the scrollers shouldn't reload when the page is re-activated
	 * @param {Object} data data to put into the screen
	 * @private
	 */
	function switchScreen(screenId, skipReload, data, keepHistory) {
		var isActive;
		var newScreen = screenId;
		var skip = skipReload;
		var catProvider;

		if (newScreen !== SCREENID.DIALOG) {
			isActive = (getCurrentScreenId() === screenId) ? true : false;

			if (!isActive || data) {
				if (currentScreenId) {
					$U.core.util.HtmlHelper.setDisplayNone(getScreenDomElement(currentScreenId));
					getScreen(currentScreenId).deactivate();
				}
				$U.core.util.HtmlHelper.setDisplayBlock(getScreenDomElement(newScreen));
				if (data) {
					switch(newScreen) {
					case SCREENID.CATEGORY:
						//will need to reload certain categories
						if (data.id === $U.core.category.pvr.PVRScheduledCategoryProvider.ID) {
							//tasks and schedules
							catProvider = new $U.core.category.pvr.PVRScheduledCategoryProvider();
							if (data.jobId) {
								//showing the schedule tasks
								catProvider.fetchTasks(data.jobId, function(tasks) {
									categoryScreen.populateAssetsWithTitle(tasks, data.title, $U.core.category.pvr.PVRScheduledCategoryProvider.ID, data.jobId);
								});
							} else {
								//showing the schedules
								catProvider.fetchItems(function(items) {
									categoryScreen.clearCategory();
									categoryScreen.populateAssets(items, $U.core.category.pvr.PVRScheduledCategoryProvider.ID);
									categoryScreen.setTitle(data.title);
								}, null, null, true);
							}
						} else if (data.id === $U.core.category.favourites.FavouritesCategoryProvider.ID) {
							//showing the favourites
							catProvider = new $U.core.category.favourites.FavouritesCategoryProvider();
							catProvider.fetchItems(function(items) {
								categoryScreen.clearCategory();
								categoryScreen.populateAssets(items, $U.core.category.favourites.FavouritesCategoryProvider.ID);
							});
						} else {
							categoryScreen.populateAssetsWithTitle(data.assets, data.title, data.id, data.jobId);
						}
						skip = true;
						break;
					case SCREENID.MULTICATEGORY:
						multiCategoryScreen.setCurrentCategory(data);
						skip = true;
						break;
					case SCREENID.BROWSE:
						browseScreen.populate(data.assets, data.id, data.pageSize, data.pageOffset, data.assetCount);
						browseScreen.setHeading(data.title);
						break;
					default :
					//don't need no data
					}
				}
				// Activate the new screen
				getScreen(newScreen).activate(skip);
				// Update the current screen to be the new screen
				currentScreenId = newScreen;
			}
			if (obscuredScreenId) {
				$U.core.util.HtmlHelper.setVisibilityVisible(getScreenDomElement(obscuredScreenId));
				obscuredScreenId = null;
			}
		}

		// Set the header for new screen
		header.activateTab(newScreen, keepHistory);
	}

	/**
	 * Get the id of the screen that is currently top of the screen stack
	 * @return the top screen id
	 */
	function getTopScreenId() {
		var screenId = null;
		if (historyStk.length > 0) {
			screenId = historyStk[historyStk.length - 1].screenId;
		}
		return screenId;
	}

	/**
	 * Get the id of the current screen
	 * @return the current screen id
	 */
	function getCurrentScreenId() {
		return currentScreenId;
	}

	/**
	 * Get a screen
	 * @param {Object} screenId the id of the screen to get
	 * @private
	 */
	function getScreen(screenId) {
		var result = null;
		switch (screenId) {
		case SCREENID.BROWSE:
			result = browseScreen;
			break;
		case SCREENID.EPG:
			result = epgScreen;
			break;
		case SCREENID.SEARCH:
			// For desktop, the search screen isn't really a screen but is a reuse of the category screen
			result = desktop ? categoryScreen : searchScreen;
			break;
		case SCREENID.MEDIACARD:
			result = mediaCardScreen;
			break;
		case SCREENID.CATEGORY:
			result = categoryScreen;
			break;
		case SCREENID.MULTICATEGORY:
			result = multiCategoryScreen;
			break;
		}
		return result;
	}

	/**
	 * Get the DOM element associated with a screen
	 * @param {Object} screenId the id of the screen
	 */
	function getScreenDomElement(screenId) {
		if (desktop && screenId === SCREENID.SEARCH) {
			// For desktop, the sarch screen isn't really a screen but is a reuse of the category screen
			screenId = SCREENID.CATEGORY;
		}
		return document.getElementById(screenId.name);
	}

	/**
	 * Sets flag to say if it's possible to remove an item from the Favourites (used when pressing the x on the favourite AssetTile)
	 * @param {boolean} boo
	 */
	function setCanRemoveFavourite(boo) {
		this._canRemove = boo;
	}

	/**
	 * Gets flag to say if it's possible to remove an item from the Favourites (used when pressing the x on the favourite AssetTile)
	 * (false if currently removing something)
	 */
	function getCanRemoveFavourite() {
		return this._canRemove;
	}

	/**
	 * Sets the flag that allows clicking, this is used to prevent double clicking
	 * If the flag is set to false a timeout is used to reset it
	 * @param {boolean} boo
	 */
	function setCanClick(boo) {
		this._canClick = boo;
		if (!boo) {
			//there isn't a reliable handle we can use to re-enable clicking so a timeout is used.
			window.setTimeout(function() {
				$U.core.View.setCanClick(true);
			}, 750);
		}
	}

	/**
	 * returns the flag that allows clicking on something
	 */
	function getCanClick() {
		return this._canClick;
	}

	return {
		SCREENID : SCREENID,
		SEARCH_SCREEN_ID : SEARCH_SCREEN_ID,
		create : create,
		destroyAllDialogs : destroyAllDialogs,
		showDialog : showDialog,
		hideDialog : hideDialog,
		getDialog : getDialog,
		popDialog : popDialog,
		hideCatalogueMenu : hideCatalogueMenu,
		showCatalogueMenu : showCatalogueMenu,
		getHeader : getHeader,
		getCatalogueMenu : getCatalogueMenu,
		getViewContainer : getViewContainer,
		loadCategory : loadCategory,
		setViewContainer : setViewContainer,
		resizeHandler : resizeHandler,
		showBrowseScreen : showBrowseScreen,
		showEPGScreen : showEPGScreen,
		showSearchScreen : showSearchScreen,
		showMediaCardScreen : showMediaCardScreen,
		showDialogScreen : showDialogScreen,
		getTopScreenId : getTopScreenId,
		getCurrentScreenId : getCurrentScreenId,
		goBack : goBack,
		removeItemFromBrowseScreen : removeItemFromBrowseScreen,
		populateDesktopBrowseScreen : populateDesktopBrowseScreen,
		refreshCategory : refreshCategory,
		refreshCategoryTitle : refreshCategoryTitle,
		populateSearchScreen : populateSearchScreen,
		setCanRemoveFavourite : setCanRemoveFavourite,
		getCanRemoveFavourite : getCanRemoveFavourite,
		setSuppressResize : setSuppressResize,
		setCanClick : setCanClick,
		getCanClick : getCanClick,
		showCategoryWithAssets : showCategoryWithAssets,
		pageMobile : pageMobile,
		reloadCategoryIfEmpty: reloadCategoryIfEmpty
	};

}());
