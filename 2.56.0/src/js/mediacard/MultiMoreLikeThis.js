/**
 * MultiMoreLikeThis widget.
 * @class $U.mediaCard.MultiMoreLikeThis
 *
 * @template
 * @constructor
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MultiMoreLikeThis = ( function() {

	var MMLT_TYPES = {
		STATIC_RECO : {
			id : 'staticRecoMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtMoreLikeThis');
			},
			scrollerType : function() {
				return $U.mediaCard.CategoryMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.core.menudata.MDSAdapter.getStaticRecommendationsForAsset;
			}
		},
		DYNAMIC_RECO : {
			id : 'dynamicRecoMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtMoreRecommendations');
			},
			scrollerType : function() {
				return $U.mediaCard.CategoryMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.core.menudata.ContentDiscovery.getDynamicRecommendationsForAsset;
			}
		},
		BTV : {
			id : 'btvMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtBtvMoreLikeThis');
			},
			scrollerType : function() {
				return $U.mediaCard.BTVMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.epg.dataprovider.BTVDataProvider.getInstance().fetchEvents;
			}
		},
		CATEGORY : {
			id : 'catMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtMoreInThisCategory');
			},
			scrollerType : function() {
				return $U.mediaCard.CategoryMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.mediaCard.MediaCardController.getMoreLikeThisItems;
			}
		},
		SERIES : {
			id : 'seriesMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtMoreInThisSeries');
			},
			scrollerType : function() {
				return $U.mediaCard.CategoryMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.core.menudata.MDSAdapter.getSeriesTitleForAsset;
			}
		},
		SEARCH : {
			id : 'searchMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtMoreSearchResults');
			},
			scrollerType : function() {
				return $U.mediaCard.CategoryMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.mediaCard.MediaCardController.getMoreLikeThisItems;
			}
		},
		PVR_SERIES : {
			id : 'pvrSeriesMMLT',
			txtString : function() {
				return $U.core.util.StringHelper.getString('txtMoreInThisSeries');
			},
			scrollerType : function() {
				return $U.mediaCard.CategoryMoreLikeThis;
			},
			fetchMethod : function() {
				return $U.mediaCard.MediaCardController.getMoreLikeThisItems;
			}
		}
	};

	var DATA_TARGET_TAB = 'data-target-tabs';

	var proto;

	function MultiMoreLikeThis(owner, container) {
		this._container = container;
		this._owner = owner;
		this._types = null;
		this._mediaitem = null;
		this._activeMLTS = [];
		this._activeTabs = [];
		this._builtTabs = [];
		this._previousActiveIndexs = [];
		this._previousMediaItemType = null;
		this._noResultsMessage = null;
		this._buildTabContainer(container);
	}

	/**
	 * Create a new instance of a MultiMoreLikeThis.
	 * @param {Object} the owner of the component i.e Media Card Screen.
	 * @param {HTMLElement} container for the component to reside in.
	 */
	MultiMoreLikeThis.create = function(owner, container) {
		return new MultiMoreLikeThis(owner, container);
	};

	/**
	 * Removes any reference to the created scrollers. This is necessary
	 * for when we do a refresh of the application
	 */
	MultiMoreLikeThis.removeScrollerReferences = function() {
		var object = $U.mediaCard.MultiMoreLikeThis.MMLT_TYPES;
		var prop;

		for (prop in $U.mediaCard.MultiMoreLikeThis.MMLT_TYPES) {
			if (object.hasOwnProperty(prop)) {
				delete $U.mediaCard.MultiMoreLikeThis.MMLT_TYPES[prop].scroller;
			}
		}
	};

	proto = MultiMoreLikeThis.prototype;

	/**
	 * Builds the container elements for the tabs and the tab content area
	 * @param {HTMLElement} container - for the tabs to reside in
	 */
	proto._buildTabContainer = function(container) {

		var navElClassName = 'nav nav-tabs mmlt-tabs';
		var contentElClassName = 'tab-content';

		this._naivgationElementContainer = $U.core.util.DomEl.createEl('ul').setClassName(navElClassName).attachTo(container).asElement();
		this._contentContainer = $U.core.util.DomEl.createDiv().setClassName(contentElClassName).asElement();

		if (!$U.core.Device.isPhone()) {
			container.appendChild(this._contentContainer);
		}
	};

	/**
	 * Builds the container elements for the tabs and the tab content area
	 * Tabs are created in-line with the bootstrap tabs http://getbootstrap.com/javascript/#tabs documentation
	 * @param {HTMLElement} - container for the tabs to reside in
	 * @param {Array} types - An array of the type content we would like to host. i.e. [$U.mediaCard.MultiMoreLikeThis.MMLT_TYPES.STATIC, $U.mediaCard.MultiMoreLikeThis.MMLT_TYPES.DYNAMIC]
	 */
	proto._buildTabs = function(container, types) {
		var i;
		var len;
		var contentElement;
		var listElement;
		var anchorElement;

		len = types.length;

		// For each type that we have in our array build the content and navigation to switch between the content
		for ( i = 0; i < len; i++) {

			if (this._builtTabs.indexOf(types[i]) < 0) {

				// Build Links for changing content
				anchorElement = $U.core.util.DomEl.createElWithText('a', types[i].txtString()).setAttribute(DATA_TARGET_TAB, types[i].id).attachTo(this._naivgationElementContainer).asElement();

				// Build content Container
				contentElement = $U.core.util.DomEl.createDiv().setClassName('tab-pane').setId(types[i].id);

				// Attach to DOM
				if ($U.core.Device.isPhone()) {
					$U.core.util.DomEl.createEl('i').setClassName('icon-chevron-sign-right flipped-right').attachTo(anchorElement);
					contentElement.attachTo(this._naivgationElementContainer);
				} else {
					contentElement.attachTo(this._contentContainer);
				}

				// Attach click event to the anchor element
				this._bindEvent(anchorElement, types[i], i);
				// Finally add the type we just built to an array so we don't build it again
				this._builtTabs.push(types[i]);
			}
		}
	};

	/**
	 * Helper method that will rearrange the tabs according to the order the the types passed in
	 */
	proto._adjustTabsPositionInDom = function() {
		var positionOfTabInDom;
		var idealPositionOfTabInDom;
		var tabs;
		var tab;
		var types;
		var len;
		var i;

		var tabContents;
		var tabContent;
		var positionOfContentInDom;
		var idealPositionOfContentInDom;

		types = this._types;
		len = types.length;

		for ( i = 0; i < len; i++) {

			tabs = document.querySelectorAll('[' + DATA_TARGET_TAB + ']');
			tabs = Array.prototype.slice.call(tabs);

			tab = document.querySelector('[' + DATA_TARGET_TAB + '=' + types[i].id + ']');

			tabContents = document.querySelectorAll('.tab-pane');
			tabContents = Array.prototype.slice.call(tabContents);

			tabContent = document.getElementById(types[i].id);

			positionOfTabInDom = tabs.indexOf(tab);
			idealPositionOfTabInDom = types.indexOf(types[i]);

			positionOfContentInDom = tabContents.indexOf(tabContent);
			idealPositionOfContentInDom = types.indexOf(types[i]);

			if (positionOfTabInDom !== idealPositionOfTabInDom) {
				tabs[positionOfTabInDom].parentNode.insertBefore(tabs[positionOfTabInDom], tabs[idealPositionOfTabInDom]);
			}

			if ($U.core.Device.isPhone()) {
				if (positionOfContentInDom !== idealPositionOfTabInDom) {
					tabs[positionOfTabInDom].parentNode.insertBefore(tabContents[positionOfTabInDom], tabs[idealPositionOfTabInDom]);
				}
			}
		}
	};

	/**
	 * Helper method to hide any tabs that have been generated but are not in our current list of types
	 */
	proto._showTabs = function() {
		var len;
		var i;
		var displayType;
		var builtTabInTypeList;

		len = this._builtTabs.length;
		displayType = $U.core.Device.isPhone() ? 'block' : 'inline-block';

		for ( i = 0; i < len; i++) {
			// discover whether the built tab is in the type list provided
			builtTabInTypeList = this._types.indexOf(this._builtTabs[i]) > -1;
			if (builtTabInTypeList) {
				// built tab is in the list of types provided so show it
				document.querySelector('[' + DATA_TARGET_TAB + '=' + this._builtTabs[i].id + ']').style.display = displayType;
			}
		}
	};

	/**
	 *
	 * @param {HTMLElement} domEl - Element that the event will be bound to
	 * @param {Object} type - The type of content that will be presented when clicked
	 * @param {Number} i -
	 */
	proto._bindEvent = function(domEl, type, i) {
		var that = this;
		domEl.addEventListener('click', function(evt) {
			that._fetchAndPopulate(type, evt);
		});
	};

	/**
	 * populates the asset scrollers
	 * @param {Object} scroller
	 * @param {Object} result
	 */
	proto._populate = function(scroller, result) {
		var assets = [];

		if (result) {
			if (Array.isArray(result)) {
				assets = result;
			} else if ( typeof result === 'object' && result[this._mediaitem.serviceId]) {
				assets = result[this._mediaitem.serviceId];
			}
		}

		if (assets.length) {
			if ($U.core.Device.isDesktop()) {
				this._clearNoResultsMsg(scroller);
			}
			scroller.populateAssets(assets);
		} else {
			this._setNoResultsMsg(scroller);
		}

		this._owner.resizeHandler();
		this.reflow();

	};

	proto._clearNoResultsMsg = function(scroller) {
		$('.nav-tabs-no-results').remove();
	};

	proto._setNoResultsMsg = function(scroller) {
		var elementToCheck = $U.core.Device.isPhone() ? scroller._grid._container : scroller._scrollerContainer;
		if (!document.getElementById(scroller._container.id + "noResult")) {
			$U.core.util.DomEl.createElWithText('span', $U.core.util.StringHelper.getString("txtNoMoreLikeThisResults")).setId(scroller._container.id + "noResult").setClassName('nav-tabs-no-results').attachTo(elementToCheck).asElement();
		}
	};

	/**
	 * Feth and populate method. Delegates to more specific fetch and populate methods
	 * @param {Object} type
	 * @param {EventObject}} evt
	 */
	proto._fetchAndPopulate = function(type, evt) {
		var scrollerType = type.scrollerType();
		var fetchFunc = type.fetchMethod();
		var that = this;
		var tabContentEl = document.getElementById(type.id);
		var index = that._activeTabs.indexOf(tabContentEl);

		if (index !== -1 && $U.core.Device.isPhone()) {

			that._hideTab(tabContentEl, evt);

		} else if (index === -1) {

			this._switchTab(tabContentEl, evt);

			if (!type.scroller) {
				// If we do not have a scroller for this type then create it
				type.scroller = scrollerType.create(tabContentEl);
			}

			// Then and add it to the type object for reference
			this._activeMLTS.push(type.scroller);

			switch(type) {
			case MMLT_TYPES.BTV :
				this._fetchAndPopulateBTV(type);
				break;
			case MMLT_TYPES.SERIES :
				this._fetchAndPopulateSeries(type);
				break;
			case MMLT_TYPES.CATEGORY :
				this._fetchAndPopulateCategory(type);
				break;
			default :
				this._fetchAndPopulateGeneric(type);
			}
		}
	};

	/**
	 * fetches and populates for type BTV
	 * @param {Object} type
	 */
	proto._fetchAndPopulateBTV = function(type) {
		var mediaStartDate;
		var futureDate;
		var fetchFunc;
		var that = this;

		fetchFunc = type.fetchMethod();

		if (!this._moreLikeThisItems || (this._moreLikeThisItems && !this._mltContext)) {
			mediaStartDate = new Date(that._mediaitem.startTime);
			futureDate = new Date(mediaStartDate.getTime());

			if (!$U.core.Gateway.isGatewayAvailable() || that._mediaitem._channel) {
				futureDate.setHours(futureDate.getHours() + $U.core.Configuration.MORE_LIKE_THIS.EVENT_HOURS_TO_FETCH);
				fetchFunc([that._mediaitem._channel], mediaStartDate, futureDate, that._populate.bind(that, that._activeMLTS[that._activeMLTS.indexOf(type.scroller)]));
			}
		} else {
			this._populate(this._activeMLTS[that._activeMLTS.indexOf(type.scroller)], this._moreLikeThisItems);
		}
	};

	/**
	 * fetches and populates for a series
	 * @param {Object} type
	 */
	proto._fetchAndPopulateSeries = function(type) {
		var fetchFunc = type.fetchMethod();
		var that = this;
		fetchFunc(that._mediaitem, function(seriesTitle) {
			$U.core.menudata.MDSAdapter.getAssetsInSeriesForAsset(that._mediaitem, seriesTitle, that._populate.bind(that, that._activeMLTS[that._activeMLTS.indexOf(type.scroller)]));
		});
	};

	/**
	 * fetches and populates for a category
	 * @param {Object} type
	 */
	proto._fetchAndPopulateCategory = function(type) {
		var fetchFunc = type.fetchMethod();
		var that = this;

		if (!this._moreLikeThisItems) {
			fetchFunc(that._mediaitem, that._populate.bind(that, that._activeMLTS[that._activeMLTS.indexOf(type.scroller)]), true);
		} else {
			this._populate(this._activeMLTS[that._activeMLTS.indexOf(type.scroller)], this._moreLikeThisItems);
		}
	};

	/**
	 * fetchs and populates generic types
	 * @param {Object} type
	 */
	proto._fetchAndPopulateGeneric = function(type) {
		var fetchFunc = type.fetchMethod();
		var that = this;
		fetchFunc(that._mediaitem, that._populate.bind(that, that._activeMLTS[that._activeMLTS.indexOf(type.scroller)]), true);
	};

	/**
	 * Hides the tabs
	 * @param {Object} tab
	 * @param {EventObject} evt
	 */
	proto._hideTab = function(tab, evt) {
		var reflow;
		var len;
		var i;

		reflow = false;

		for ( i = 0; i < this._activeMLTS.length; i++) {
			if (this._activeMLTS[i]._container === tab) {
				this._activeMLTS[i].populateAssets([]);
				this._activeMLTS.splice(i, 1);
				this._activeTabs[this._activeTabs.indexOf(tab)].style.height = 'auto';
				this._activeTabs.splice(this._activeTabs.indexOf(tab), 1);
				$U.core.util.HtmlHelper.removeClass(evt.currentTarget.parentNode, 'active');
				if ($U.core.Device.isPhone()) {
					$U.core.util.HtmlHelper.removeClass(evt.currentTarget, 'active');
					evt.currentTarget.childNodes[1].className = 'icon-chevron-sign-right flipped-right';
				}

				reflow = true;
			}
		}

		if (reflow) {
			this._owner.resizeHandler();
			this.reflow();
		}
	};

	/** Switches tabs or for mobile opens another tab
	 * @param {Object} tabContent
	 * @param {EventObject} evt
	 */
	proto._switchTab = function(tabContent, evt) {
		var tabToDeactivate;
		var tabToActivate = document.querySelector('[' + DATA_TARGET_TAB + '=' + tabContent.id + ']');

		if (this._activeTabs.length && !$U.core.Device.isPhone()) {
			// Only ever one tab active on non mobile devices to as long as we have length we can always use first item in array
			this._activeMLTS[0].populateAssets([]);
			this._activeMLTS.splice(0, 1);

			tabToDeactivate = document.querySelector('a[' + DATA_TARGET_TAB + '=' + this._activeTabs[0].id + ']');

			$U.core.util.HtmlHelper.removeClass(this._activeTabs[0], 'active');
			$U.core.util.HtmlHelper.removeClass(tabToDeactivate, 'active');
			this._activeTabs.splice(0, 1);
		} else {
			$U.core.util.HtmlHelper.removeClass(tabToActivate.childNodes[1], 'icon-chevron-sign-right');
			$U.core.util.HtmlHelper.setClass(tabToActivate.childNodes[1], 'icon-chevron-sign-down');
		}

		$U.core.util.HtmlHelper.setClass(tabToActivate, 'active');
		$U.core.util.HtmlHelper.setClass(tabContent, 'active');

		this._activeTabs.push(tabContent);
	};

	/**
	 *
	 * @param {Object} types
	 * @param {Object} mediaitem
	 */
	proto.activate = function(types, mediaitem, moreLikeThisItems, mltContext) {

		var activated = false;
		var index = 0;
		var len = this._previousActiveIndexs.length;
		var i;

		this._types = types;
		this._mediaitem = mediaitem;
		this._buildTabs(this._container, this._types);
		// Also we may need to reposition the links depending on the content type
		this._adjustTabsPositionInDom();
		this._showTabs();
		this._moreLikeThisItems = moreLikeThisItems;
		this._mltContext = mltContext;
		// Manually call the fetch and populate with the first item type

		if (len && this._previousMediaItemType === this._mediaitem.type) {
			for (i = 0; i < len; i++) {
				index = this._types.indexOf(this._types[this._previousActiveIndexs[i]]);
				if(index > 0) {
					this._fetchAndPopulate(this._types[index]);
					activated = true;
				}
			}
			this._previousActiveIndexs = [];
		}

		if(!activated){
			this._fetchAndPopulate(this._types[0]);
			activated = true;
		}
	};

	/**
	 * Deactivates the Multi More Like This component
	 * @param {Boolean} mediaCard2mediaCard
	 */
	proto.deactivate = function(mediaCard2mediaCard) {
		if ($U.core.Device.isPhone()) {
			this._phoneDeactivate(mediaCard2mediaCard);
		} else {
			this._genericDeactivate(mediaCard2mediaCard);
		}

		$('a[' + DATA_TARGET_TAB + ']').removeClass('active');
		// hide all the tabs
		$('a[' + DATA_TARGET_TAB + ']').hide();

		this._activeMLTS = [];
		this._activeTabs = [];

		this._clearNoResultsMsg();

	};

	/**
	 * generic deactivate i.e. non mobile
	 * @param {Boolean} mediaCard2mediaCard
	 */
	proto._genericDeactivate = function(mediaCard2mediaCard) {
		var len = this._activeMLTS.length;
		var typesLen = this._types.length;
		var types = this._types;
		var i;
		// Only one activeMLT for non phone devices so always use first and only item in array
		var activeMLT;

		if (len) {

			if (mediaCard2mediaCard) {
				for ( i = 0; i < typesLen; i++) {
					if (this._activeMLTS[0]._container.id === this._types[i].id) {
						this._previousActiveIndexs.push(i);
						this._previousMediaItemType = this._mediaitem.type;
					}
				}
			} else {
				this._previousActiveIndex = [];
				this._previousMediaItemType = null;
			}

			activeMLT = this._activeMLTS[0];
			// clear assets
			activeMLT.populateAssets([]);
			// remove the active class on the activeMLT container
			$U.core.util.HtmlHelper.removeClass(activeMLT._container, 'active');
		}
	};

	/**
	 * phone specific deactivate i.e. non mobile
	 * @param {Boolean} mediaCard2mediaCard
	 */
	proto._phoneDeactivate = function(mediaCard2mediaCard) {
		var activeMLT;
		var len = this._activeMLTS.length;
		var typesLen = this._types.length;
		var types = this._types;
		var i;
		var x;

		if (len) {
			for ( i = 0; i < len; i++) {
				activeMLT = this._activeMLTS[i];
				if (mediaCard2mediaCard) {
					for ( x = 0; x < typesLen; x++) {
						if (activeMLT._container.id === this._types[x].id) {
							this._previousActiveIndexs.push(x);
							this._previousMediaItemType = this._mediaitem.type;
						}
					}
				} else {
					this._previousActiveIndex = [];
					this._previousMediaItemType = null;
				}
				activeMLT.populateAssets([]);
				activeMLT._container.style.height = 'auto';
				$('a[' + DATA_TARGET_TAB + '] i').attr('class', 'icon-chevron-sign-right flipped-right');
			}
		}
	};

	/**
	 * Sets height of the More like this component
	 * @param {Object} height
	 */
	proto.setHeight = function(height) {
		var len = this._activeMLTS.length;
		var i;

		for ( i = 0; i < len; i++) {
			this._activeMLTS[i].setHeight(height);
		}

		if (len) {
			this.reflow();
		}
	};

	/**
	 * Reflow the active more like this scrollers
	 */
	proto.reflow = function() {
		var len;
		var i;

		len = this._activeMLTS.length;

		for ( i = 0; i < len; i++) {
			this._activeMLTS[i]._container.style.height = this._activeMLTS[i]._container.scrollHeight + 'px';
			this._activeMLTS[i].resizeHandler();
		}
	};

	/**
	 * Gets the next item in the MLT based on the item provided
	 * @param  {Object} item The current item
	 * @return {Object}      The next item in the MLT
	 */
	proto.getNextItemInMlt = function(item) {
		var items = this._activeMLTS[0]._items;
		var result;

		items.forEach(function(element, index) {
			if (item.id === element.id) {
				result = items[index + 1];
			}
		});
		return result;
	};

	proto.updateScroller = function(mediaCardAsset) {
		var scrollers = this._activeMLTS;
		if (scrollers && scrollers.length) {
			for (i = 0; i < scrollers.length; i++) {
				if (scrollers[i].update) {
					scrollers[i].update(mediaCardAsset);
				}
			}
		}
	};

	MultiMoreLikeThis.MMLT_TYPES = MMLT_TYPES;
	return MultiMoreLikeThis;

}());
