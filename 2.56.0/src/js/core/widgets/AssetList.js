/**
 * AssetList is a special type of Asset Container, it contains ListAssetTiles
 *
 * @class $U.core.widgets.assettile.ListAssetTile
 * @extends $U.core.widgets.AssetContainer
 *
 * @constructor
 * Create a new Asset List
 * @param {HTMLElement} container - container that holds the AssetList
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.AssetList = ( function() {

	var logger = $U.core.Logger.getLogger("AssetList");

	var proto;

	var superClass;

	var AssetList = function(container, owner) {
		this._container = container;
		this._assetListScreenContainer = null;
		this._owner = owner;
	};

	proto = AssetList.prototype;

	proto._clickHandler = function(asset) {
		this.clearDOM();
		if (asset.type === $U.core.mediaitem.MediaItemType.SUGGESTION) {
			this._owner._inputEl.value = asset.title;
			this._owner.performSearch();
		} else {
			$U.core.View.showMediaCardScreen(asset);
		}
	};

	proto._truncateItems = function(items, size) {
		items = items.slice(0, size);
		return items;
	};

	proto.clearDOM = function() {
		while (this._container.firstChild) {
			this._container.removeChild(this._container.firstChild);
		}
		this._owner.renderFullBorderRadius();
		this.destoryAssetListContainer();
	};

	proto._addAssetItem = function(asset) {
		var listItemEl;
		var anchorEl;
		var assetTile;
		var that = this;
		var extraText;
		var tempIcon,i,matches,items,matchedItem;

		//Create HTML Elements
		listItemEl = document.createElement("li");
		anchorEl = document.createElement("a");

		// Apply styles to HTML Elements
		listItemEl.className = "search-suggestions";
		anchorEl.className = "search-suggestions-link";
		
		if (this._owner._showSuggestedSearchStyling && this._owner._showSuggestedSearchStyling === true) {
			if (asset.type && asset.type.name) {
				listItemEl.className += " "+asset.type.name.toLowerCase()+"-search-item";
				anchorEl.className += " "+asset.type.name.toLowerCase()+"-search-item-link";		
			}
		}
		
		// Attach click event to send to media Card
		anchorEl.addEventListener("click", function(evt) {
			evt.stopPropagation();
			that._clickHandler(asset);
		});

		// Add the asset's title
		anchorEl.appendChild($U.core.util.DomEl.createElWithText("span", asset.title).setClassName("search-suggestions-link-title").asElement());

		// Build an extra text description of the asset
		if (asset.channel && asset.channel.title) {
			extraText = asset.channel.title;
		} else if (asset.serviceLongName) {
			extraText = asset.serviceLongName;
		}

		if (asset.startTime) {
			extraText = extraText || "";
			extraText += " " + $U.core.util.Formatter.formatDate(new Date(asset.startTime)) + " " + $U.core.util.Formatter.formatTime(new Date(asset.startTime));
		}
		if (extraText) {
			extraText = " (" + extraText + ")";
		}

		// Add the extra text
		if (extraText) {
			anchorEl.appendChild($U.core.util.DomEl.createElWithText("span", extraText).asElement());
		}
		
		if (this._owner._showInlineSearchAnnotations && this._owner._showInlineSearchAnnotations === true) {
			//Search Match annotations MediaItem
			if (asset.searchMatches) {
				matches = Object.keys(asset.searchMatches);
				if (matches) {
					items = matches.length;
					for (i = 0; i < items; i++) {
						matchedItem = matches[i];
						tempIcon = document.createElement("span");
						tempIcon.className = "search-decoration-inline search-decoration-"+matchedItem;
						anchorEl.appendChild(tempIcon);
					}
				}
			}
		}
		
		if (this._owner._showInlineEntityAnnotations && this._owner._showInlineEntityAnnotations === true) {
			//Suggested Search annotations SuggestionItem
			if (asset._data && asset._data.entity) {
				tempIcon = document.createElement("span");
				tempIcon.className = "search-decoration-inline search-decoration-"+asset._data.entity;
				anchorEl.appendChild(tempIcon);
			}
		}

		listItemEl.appendChild(anchorEl);
		this._container.appendChild(listItemEl);
	};

	proto.populate = function(items, size) {
		var assetList;
		var assetListItem;
		var l;
		var i;
		var viewContainer = $U.core.View.getViewContainer();

		this.clearDOM();

		if (size) {
			items = this._truncateItems(items, size);
		}

		this._items = items;
		l = this._items.length;

		for ( i = 0; i < l; i++) {
			this._addAssetItem(this._items[i]);
		}

		if (l) {
			this.createAssetListContainer();
		}
	};

	proto.createAssetListContainer = function() {
		if (!this._assetListScreenContainer) {
			this._assetListScreenContainer = $U.core.util.DomEl.createDiv().asElement();
			this._assetListScreenContainer.style.position = "relative";
			this._assetListScreenContainer.addEventListener("click", this.clearDOM.bind(this));

			$U.core.util.HtmlHelper.setWidth(this._assetListScreenContainer, window.innerWidth);
			$U.core.util.HtmlHelper.setHeight(this._assetListScreenContainer, window.innerHeight);

			document.getElementById("masterContainer").appendChild(this._assetListScreenContainer);

			this._owner.addZindex();
		}
	};

	proto.destoryAssetListContainer = function() {
		if (this._assetListScreenContainer) {
			document.getElementById("masterContainer").removeChild(this._assetListScreenContainer);
			this._assetListScreenContainer = null;
			this._owner.removeZindex();
		}
	};

	return AssetList;

}());
