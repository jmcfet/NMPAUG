/**
 * MediaCardScreen is responsible for showing a $U.core.mediaItem.MediaItem
 *
 * @class $U.mediacard.MediaCardScreen
 * @template
 * @constructor
 * Create a new MediaCardScreen
 * @param {Object} owner $U.core.View
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardScreen = ( function() {

	var logger = $U.core.Logger.getLogger("MediaCardScreen");

	// The action bar scroller's name'
	var ACTION_BAR_SCROLLER_NAME = "ActionBarScroller";

	// CONSTANTS
	var IMAGE_ASPECT_RATIO = {
		landscape : 16 / 9,
		portrait : 2 / 3
	};

	var MULTI_MORE_LIKE_THIS = function() {

		var MMLT_TYPES = $U.mediaCard.MultiMoreLikeThis.MMLT_TYPES;

		return {
			VOD : {
				SEARCH : [MMLT_TYPES.SEARCH, MMLT_TYPES.STATIC_RECO, MMLT_TYPES.DYNAMIC_RECO],
				SERIES : [MMLT_TYPES.SERIES, MMLT_TYPES.DYNAMIC_RECO],
				GENERIC : [MMLT_TYPES.STATIC_RECO, MMLT_TYPES.CATEGORY, MMLT_TYPES.DYNAMIC_RECO]
			},
			BTV : {
				SEARCH : [MMLT_TYPES.SEARCH, MMLT_TYPES.STATIC_RECO, MMLT_TYPES.DYNAMIC_RECO],
				GENERIC : [MMLT_TYPES.BTV, MMLT_TYPES.STATIC_RECO, MMLT_TYPES.DYNAMIC_RECO]
			},
			CATCHUP : {
				SEARCH : [MMLT_TYPES.SEARCH, MMLT_TYPES.STATIC_RECO],
				SERIES : [MMLT_TYPES.SERIES, MMLT_TYPES.DYNAMIC_RECO],
				GENERIC : [MMLT_TYPES.BTV, MMLT_TYPES.STATIC_RECO, MMLT_TYPES.DYNAMIC_RECO]
			},
			PVR_SERIES : {
				SEARCH : [MMLT_TYPES.PVR_SERIES],
				SERIES : [MMLT_TYPES.PVR_SERIES],
				GENERIC : [MMLT_TYPES.PVR_SERIES]
			},
			DEFAULT : {
				SEARCH : [MMLT_TYPES.CATEGORY],
				SERIES : [MMLT_TYPES.CATEGORY],
				GENERIC : [MMLT_TYPES.CATEGORY]
			}
		};
	};

	var proto;

	function MediaCardScreen(owner) {
		//container element of the whole application
		this._viewContainerEl = $U.core.View.getViewContainer();
		//container element of the media screen
		this._screenContainerEl = MediaCardScreen._createDiv("mediaCard", "screen hide", this._viewContainerEl);
		//container for the media container
		this._mediaContainerEl = MediaCardScreen._createDiv("mediaContainer", "mc-media-container", this._screenContainerEl);
		//scroller container for action bar
		this._actionBarScrollerEl = MediaCardScreen._createDiv("actionBarScroller", "mc-action-bar-scroller", this._screenContainerEl);
		//container for action bar
		this._actionBarEl = MediaCardScreen._createDiv("actionBar", "mc-action-bar", this._actionBarScrollerEl);
		//container for the video container
		this._videoContainerEl = document.getElementById("videoContainer");
		//container for all the more like this widgets
		this._moreLikeThisContainerEl = MediaCardScreen._createDiv("_moreLikeThisContainer", "", this._screenContainerEl);

		this._actionBarscroller = new $U.core.widgets.scroller.NagraScroller(this._actionBarEl, {
			scrollingX : true,
			scrollingY : false,
			measureContent : true,
			bouncing : false,
			active : true
		}, ACTION_BAR_SCROLLER_NAME);

		// Create the multi-more like this component
		this._multiMoreLikeThis = $U.mediaCard.MultiMoreLikeThis.create(this, this._moreLikeThisContainerEl);

		// intialise the mediaCardController which will pass messages between each of the components
		$U.mediaCard.MediaCardController.initialise(this);
	}

	/**
	 * Helper function to create a div, set it's id, classname and attach it to another DOM element
	 * @private
	 * @return HTMLElement
	 */
	MediaCardScreen._createDiv = function(id, className, attachTo) {
		if (id) {
			return $U.core.util.DomEl.createDiv().setId(id).setClassName(className).attachTo(attachTo).asElement();
		} else {
			return $U.core.util.DomEl.createDiv().setClassName(className).attachTo(attachTo).asElement();
		}
	};
	/**
	 * Helper function to create a HTML element, set it's id, classname and attach it to another element
	 * @private
	 * @return HTMLElement
	 */
	MediaCardScreen._createEl = function(el, id, className, attachTo) {
		return $U.core.util.DomEl.createEl(el).setId(id).setClassName(className).attachTo(attachTo).asElement();
	};

	/**
	 * Depending on which device create a suitable screen
	 *  @param {Object} owner
	 *  @param {HTMLElement} container
	 */
	MediaCardScreen.create = function(owner) {
		var r;
		switch ($U.core.Device.getFF()) {
		case $U.core.Device.FF.PHONE:
			r = new $U.mediaCard.PhoneMediaCardScreen(owner);
			break;
		case $U.core.Device.FF.TABLET:
		case $U.core.Device.FF.DESKTOP:
			r = new $U.mediaCard.TabletMediaCardScreen(owner);
			break;
		}
		return r;
	};

	proto = MediaCardScreen.prototype;

	/**
	 * Activates the mediacard screen
	 */
	proto.activate = function() {

		if (logger) {
			logger.log("activate", "enter");
		}

		var multiMoreLikeThisList = this._buildMultiMoreLikeThisList();

		$U.mediaCard.MediaCardController.populate(this._mediaItem);

		//Create a more like this component
		this._multiMoreLikeThis.activate(multiMoreLikeThisList, this._mediaItem, this._moreLikeThisItems, this._mltContext);

		this._actionBarscroller.scrollTo(0);
		this._actionBarscroller.reflow();
		this.resizeHandler();
		$U.core.View.getHeader().deactivateTabs();
	};
	/**
	 * Deactivates the mediacard screen
	 */
	proto.deactivate = function(mediaCard2mediaCard) {
		if (logger) {
			logger.log("deactivate", "enter");
		}
		this._multiMoreLikeThis.deactivate(mediaCard2mediaCard);
		$U.mediaCard.MediaCardController.deactivate();
	};

	/**
	 * Populate the MediaCardScreen with a MediaItem
	 * @param {$U.core.mediaitem.MediaItem} mediaItem
	 */
	proto.populate = function(mediaItem, moreLikeThisItems, autoplay, startOver, mltContext) {
		//if moreLikeThis === false then moreLikeThis shouldn't get refreshed. (Special Starhub throw case)
		if (moreLikeThisItems !== false) {
			this._moreLikeThisItems = moreLikeThisItems;
		}

		this._mltContext = mltContext;

		if (logger) {
			this._logMediaItem(mediaItem, "populate");
		}

		this._mediaItem = mediaItem;
		if (autoplay) {
			$U.mediaCard.MediaCardController.autoPlayNextPopulate();
		}

		if (startOver) {
			$U.mediaCard.MediaCardController.startOverPlayback();
		}
	};

	/**
	 * Log information about the mediaItem
	 * @private
	 */
	proto._logMediaItem = function(mi, caller) {

		var info;
		var NEWLINE = "\n";

		if (logger) {
			logger.log("_logMediaItem", mi);
			switch (mi.type) {
			case $U.core.mediaitem.MediaItemType.CATCHUP:
			case $U.core.mediaitem.MediaItemType.VOD:
				info = ["type", "VOD", NEWLINE, "title", mi.title, NEWLINE, "purchased", mi.isAssetPurchased, NEWLINE, "subscribed", mi.isAssetSubscribed, NEWLINE, "free", mi.isAnyProductFree, NEWLINE];
				break;
			case $U.core.mediaitem.MediaItemType.BTVEVENT:
			case $U.core.mediaitem.MediaItemType.NPVR:
				info = ["type", "BTV", NEWLINE, "title", mi.title, NEWLINE, "channel", mi.channel, NEWLINE, "subscribed", mi.subscribed, NEWLINE];
				break;
			default:
				info = ["type", "BTV", NEWLINE];
				break;
			}

			info.unshift(NEWLINE);
			info.unshift("_logMediaItem");
			info.unshift(caller);
			logger.log.apply(logger, info);
		}
	};
	/**
	 * gets the HTML element that all the more like this widgets are contained in
	 * @return {HTMLElement}
	 */
	proto.getMoreLikeThisContainerEl = function() {
		return this._moreLikeThisContainerEl;
	};
	/**
	 * gets the HTML element that the category more like this is contained in
	 * @return {HTMLElement}
	 */
	proto.getCatMoreLikeThisEl = function() {
		return this._catMoreLikeThisEl;
	};
	/**
	 * gets the HTML element that the BTV more like this element is contained in
	 * @return {HTMLElement}
	 */
	proto.getBtvMoreLikeThisEl = function() {
		return this._btvMoreLikeThisEl;
	};
	/**
	 * gets the HTML element that the media is contained in
	 * @return {HTMLElement}
	 */
	proto.getmediaContainerEl = function() {
		return this._mediaContainerEl;
	};
	/**
	 * gets the HTML element that the action bar is contained in
	 * @return {HTMLElement}
	 */
	proto.getActionBarEl = function() {
		return this._actionBarEl;
	};

	proto.getMoreLikeThisItems = function(callback) {
		var result;

		if (this._moreLikeThisItems) {
			result = this._moreLikeThisItems;
		} else {
			result = undefined;
		}

		if ( typeof callback === 'function') {
			callback(this._moreLikeThisItems);
		}
	};

	/**
	 * Removes item from array
	 */
	proto._removeFromList = function(list, type) {
		var index = list.indexOf(type);
		if (index > -1) {
			list.splice(index, 1);
		}
		return list;
	};

	/**
	 * responsible for build an array of the types of multi-more like items
	 */
	proto._buildMultiMoreLikeThisList = function() {
		var MMLT_TYPES = $U.mediaCard.MultiMoreLikeThis.MMLT_TYPES;
		var staticConfig = $U.core.Configuration.RECOMMENDATIONS.STATIC;
		var dynamicConfig = $U.core.Configuration.RECOMMENDATIONS.DYNAMIC;
		var mmltList = [];
		var result = null;

		switch (this._mediaItem.type) {
		case $U.core.mediaitem.MediaItemType.VOD :
			result = ["VOD"];
			break;
		case $U.core.mediaitem.MediaItemType.CATCHUP :
			result = ["CATCHUP"];
			break;
		case $U.core.mediaitem.MediaItemType.BTVEVENT :
			result = ["BTV"];
			break;
		case $U.core.mediaitem.MediaItemType.PVR_SCHEDULED :
			if (this._isPvrSeries()) {
				result = ["PVR_SERIES"];
			} else {
				result = ["DEFAULT"];
			}
			break;
		case $U.core.mediaitem.MediaItemType.PVR_RECORDING :
			if (this._isPvrSeries()) {
				result = ["PVR_SERIES"];
			} else {
				result = ["DEFAULT"];
			}
			break;
		case $U.core.mediaitem.MediaItemType.NPVR :
			if (this._isPvrSeries()) {
				result = ["PVR_SERIES"];
			} else {
				result = ["DEFAULT"];
			}
			break;
		default :
			result = ["DEFAULT"];
			break;
		}

		if (this._mediaItem.searchMatches && !this._mediaItem.seriesRef) {

			mmltList = MULTI_MORE_LIKE_THIS()[result].SEARCH;

		} else if (this._mediaItem.seriesRef) {

			mmltList = MULTI_MORE_LIKE_THIS()[result].SERIES;

			if (this._mediaItem.searchMatches) {
				mmltList.push(MMLT_TYPES.SEARCH);
			}
		} else {
			mmltList = MULTI_MORE_LIKE_THIS()[result].GENERIC;
		}

		if (!staticConfig) {
			mmltList = this._removeFromList(mmltList, MMLT_TYPES.STATIC_RECO);
		}
		if (!dynamicConfig) {
			mmltList = this._removeFromList(mmltList, MMLT_TYPES.DYNAMIC_RECO);
		}
		return mmltList;
	};

	proto.getNextItemInMlt = function(item) {
		return this._multiMoreLikeThis.getNextItemInMlt(item);
	};

	proto._isPvrSeries = function() {
		var seriesId = this._mediaItem.seriesId;
		var isSeries = false;
		if (seriesId) {
			isSeries = this._moreLikeThisItems.every(function(element, index, array) {
				if (element.seriesId !== seriesId) {
					return false;
				}
				return true;
			});
		}
		return isSeries;
	};

	proto.updateScroller = function(mediaCardAsset) {
		if (mediaCardAsset) {
			this._multiMoreLikeThis.updateScroller(mediaCardAsset);
		}
	};

	MediaCardScreen.IMAGE_ASPECT_RATIO = IMAGE_ASPECT_RATIO;

	return MediaCardScreen;

}());
