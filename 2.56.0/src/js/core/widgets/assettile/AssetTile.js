var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.assettile = $U.core.widgets.assettile || {};

$U.core.widgets.assettile.AssetTile = ( function() {

	var logger = $U.core.Logger.getLogger("AssetTile");

	//@formatter:off
	var TILE_TYPE = {
		LARGE : {},
		SMALL : {},
		POSTER : {},
		WIDE: {}
	};
	
	var STATUS_TYPE = {
		LOADING : { name : "LOADING"},
		SUCCESS : { name : "SUCCESS"},
		FAILURE : { name :"FAILURE"}
	};
	//@formatter:on

	var ID_ATTRIBUTE = "data-id-AssetTile";

	var instanceId = 0;
	var instances = [];

	var proto;

	/**
	 *
	 * @class $U.core.widgets.assettile.AssetTile
	 * Object that represents an asset tile in the Browse system
	 * @constructor
	 * Build an Asset tile
	 * @param name
	 * @param container
	 * @param owner
	 * @param wrappedAsset
	 * @param tileWidth
	 * @param tileHeight
	 * @param aspectRatio
	 * @param type
	 */
	function AssetTile(name, container, owner, wrappedAsset, tileWidth, tileHeight, aspectRatio, type) {
		this._name = name;
		this._container = container;
		this._owner = owner;
		this._wrappedAsset = wrappedAsset;
		this._tileWidth = tileWidth;
		this._tileHeight = tileHeight;
		this._aspectRatio = aspectRatio;
		this._type = type;
		this._searchDecorationsAdded = false;
		this._searchMatches = [];
		
		$U.destroyList.push(this);

		this._placeholder = document.createElement("div");
		this._placeholder.className = "asset-item-placeholder-load";
		this._container.appendChild(this._placeholder);

		this._status = STATUS_TYPE.LOADING;

		this._instanceId = instanceId;
		this._container.setAttribute(ID_ATTRIBUTE, instanceId);
		this._container.addEventListener("click", AssetTile._clickHandler);

		instances[instanceId++] = this;
		// REMOVED BECAUSE OF PEFORMANCE PROBLEMS
		// Apply events to asset tiles to show highlight when user touches the asset for mobile device
		//if(!$U.core.Device.isDesktop()){
		// $U.core.util.Highlighter.applyTouchHighlight(this._container, "asset-item-touch-highlight");
		//}
	}

	proto = AssetTile.prototype;

	/**
	 * Handles clicks on assets
	 * @private
	 * @param {Event} evt Event triggered by the click handler
	 */
	AssetTile._clickHandler = function(evt) {
		var instanceId = evt.currentTarget.getAttribute(ID_ATTRIBUTE);
		var assetTile = instances[instanceId];
		assetTile._clickHandler(evt);
	};

	proto._clickHandler = function(evt) {
		evt.stopPropagation();
		$U.core.View.showMediaCardScreen(this._wrappedAsset, this._owner.getItems());
	};

	/**
	 * Sets up the variables for the sizing of the image
	 * @param {number} width
	 * @param {number} height
	 */
	proto.setSize = function(width, height) {
		$U.core.util.HtmlHelper.setWidth(this._container, width);
		$U.core.util.HtmlHelper.setHeight(this._container, height);

		//if the resize has a useful width and the width is different to what we have. [New dimensions]
		//Or if the width is useful and 'the same' we should add search decorations if they aren't already added. [New search, same dimensions]
		if ((width > 0 && width !== this._tileWidth) || !this._searchDecorationsAdded) {
			this._tileWidth = width;
			this._tileHeight = height;
			this._searchDecorationsAdded = this._getMatchedCriteria();
		}
	};

	proto._getMatchedCriteria = function (howmany) {
		var PRECEDENCE = {"title":0, "actors":1, "description":2, "directors":3, "synopsis":4, "unknown":99}, //higher = less important
			matches = [], localeMatches = [],
			items, i, matchedItem, newItem, resourceString,
			searchObject = this._wrappedAsset.searchMatches;

		if (!searchObject) {
			return false;
		}

		howmany = howmany || 1;

		matches = Object.keys(searchObject);
		items = matches.length;

		if  (items === 0) {
			return false;
		}

		if (items > 1) {
			matches.sort(function (a,b) {
					a = (PRECEDENCE[a] !== undefined) ? a : "unknown";
					b = (PRECEDENCE[b] !== undefined) ? b : "unknown";
					return PRECEDENCE[a] - PRECEDENCE[b];
				});
		}

		if (howmany < items) {
			matches = matches.slice(0,howmany);
			items = matches.length;
		}

		for (i = 0; i < items; i++) {
			newItem = [];
			matchedItem = matches[i];
			resourceString = matchedItem.substr(0,1).toUpperCase()+matchedItem.substr(1);
			newItem.push(matchedItem);
			newItem.push('txtSearchMatch'+resourceString);
			localeMatches.push(newItem);
		}
		
		this._removeSearchDecoration();
		
		return this._addSearchDecoration(localeMatches);
	};

	proto._removeDOMElement = function (elem) {
		var old;
		
		if (elem.length === 0) {
			return;
		}
		
		old = elem[0];
		while (old.firstChild) {
			old.removeChild(old.firstChild);
		}
		this._container.removeChild(elem[0]);
	};
	
	proto._removeSearchDecoration = function () {
		var previousDecoration;
		previousDecoration = this._container.getElementsByClassName("search-match-data");
		return this._removeDOMElement(previousDecoration);
	};

	proto._addSearchDecoration = function (matches) {
		var searchMatchData,
			headerContainer,
			items,i,searchHeaderIcon,searchHeaderText,matchedItem,tempContainer,tempIcon,tempText,key,
			decorationWidth = 0;
			
		items = matches.length;
		
		searchMatchData = document.createElement("div");
		headerContainer = document.createElement("div");
		headerContainer.className = "search-match-item search-header";
		this._container.appendChild(searchMatchData);
		
		switch (this._type){
		case $U.core.widgets.assettile.AssetTile.TILE_TYPE.POSTER:
			searchMatchData.className = "search-match-data search-match-poster";
			if (this._wrappedAsset.seriesRef) { searchMatchData.className += " search-match-poster-vod"; }
			break;
		default:
			searchMatchData.className = "search-match-data search-match-large";
		}
		
		searchHeaderIcon = document.createElement("i");
		searchHeaderIcon.className= "icon-search ";
		searchHeaderText = document.createElement("span");
		searchHeaderText.setAttribute("style","margin-left:5px");
		searchHeaderText.appendChild(document.createTextNode($U.core.util.StringHelper.getString("txtSearchMatches")));
		headerContainer.appendChild(searchHeaderIcon);
		headerContainer.appendChild(searchHeaderText);
		searchMatchData.appendChild(headerContainer);
		searchMatchData.setAttribute("style","padding:5px;font-size:11px");
		
		decorationWidth += headerContainer.offsetWidth ;
		
		for (i = 0; i < items; i++) {
			matchedItem = matches[i];
			tempContainer = document.createElement("div");
			tempContainer.className = "search-match-item";
			tempIcon = document.createElement("span");
			tempIcon.className = "search-decoration-tile search-decoration-"+matchedItem[0];
			tempContainer.appendChild(tempIcon);
			tempText = document.createElement("span");
			tempText.appendChild(document.createTextNode($U.core.util.StringHelper.getString(matchedItem[1])));
			tempText.className = "search-decoration-tile-text";
			tempContainer.appendChild(tempText);
			matchedItem.container = tempContainer;
			searchMatchData.appendChild(tempContainer);
			decorationWidth += tempContainer.offsetWidth ;
		}

		if (decorationWidth > (this._tileWidth-20)) { //Try and drop the 'Matches' text to see if that will make the decoration fit
			decorationWidth -= searchHeaderText.offsetWidth;
			headerContainer.removeChild(searchHeaderText);
		}
		
		if (decorationWidth > (this._tileWidth-20)) { //If the decoration is still too big - drop all the text and just leave icons
			for (i = 0; i < items; i++) {
				matchedItem = matches[i];
				matchedItem.container.removeChild(matchedItem.container.children[1]); //remove the span text
			}
		}
		
		return true;
	};

	/**
	 * Callback that handles a successful imaqe load from the server
	 * @param {Object} assetTile
	 */
	AssetTile.loadSuccessCallback = function(assetTile) {
		if (logger) {
			logger.log("loadSuccessCallback", assetTile);
		}
		assetTile._status = STATUS_TYPE.SUCCESS;
		assetTile._loadSuccess();
		assetTile._placeholder.className = "asset-item-placeholder-complete";
		assetTile._owner.assetTileLoadSuccess(assetTile);
	};

	/**
	 * Callback that handles a failed imaqe load from the server
	 * @param {Object} assetTile
	 */
	AssetTile.loadFailureCallback = function(assetTile) {
		if (logger) {
			logger.log("loadFailureCallback", assetTile);
		}
		assetTile._status = STATUS_TYPE.FAILURE;
		assetTile._loadFailure();
		assetTile._owner.assetTileLoadFailure(assetTile);
	};

	/**
	 * Gets the type of the AssetTile
	 * @return {Object} type
	 */
	proto.getType = function() {
		return this._type;
	};

	/**
	 * Gets the width of the AssetTile
	 * @return {Number} tileWidth
	 */
	proto.getTileWidth = function() {
		return this._tileWidth;
	};

	/**
	 * @template
	 * @param {Object} successCallback
	 * @param {Object} failureCallback
	 */
	proto.load = function(successCallback, failureCallback) {
	};

	AssetTile.prototype.toString = function() {
		return this._name;
	};

	AssetTile.STATUS_TYPE = STATUS_TYPE;
	AssetTile.TILE_TYPE = TILE_TYPE;

	///Methods needed to represent a VirtualizingNagraScroller item.

	proto.getContainer = function() {
		return this._container;
	};

	proto.hide = function() {
		if (this._isShown || (this._isShown === undefined)) {
			$(this._container).addClass("hide");
			this._isShown = false;
		}
	};

	proto.show = function() {
		if (!this._isShown || (this._isShown === undefined)) {
			$(this._container).removeClass("hide");
			this._isShown = true;
			this.load();
		}
	};

	proto.isShown = function() {
		return this._isShown;
	};

	proto.getWidth = function() {
		return this._itemWidth;
	};

	proto.getItemHeight = function() {
		return this._itemHeight;
	};

	proto.getLeft = function() {
		return this._itemLeft;
	};

	proto.getTop = function() {
		return this._itemTop;
	};

	proto.setLeft = function(left) {
		this._itemLeft = left;
	};

	proto.setTop = function(top) {
		this._itemTop = top;
	};

	proto.calculateSizes = function() {
		this._itemWidth = this._container.offsetWidth;
		this._itemHeight = this._container.offsetHeight;
	};

	/**
	 * Destroys references that cause memory leak.
	 * This AssetTile must be removed from the instances array.
	 */
	proto.destroy = function() {
		delete instances[this._instanceId];
	};

	/**
	 * Removes the tile from it's parent container
	 */
	proto.removeFromDOM = function() {
		this._owner._container.removeChild(this._container);
	};

	return AssetTile;

}());

