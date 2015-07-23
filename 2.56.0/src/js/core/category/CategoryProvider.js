/**
 * CategoryProvider delivers MediaItems for a non-catalogue category
 *
 * @class $U.core.category.CategoryProvider
 *
 * @constructor
 * Create a new CategoryProvider
 * @param {string} id
 * @param {string} title
 * @param {number} displayOrder
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};

$U.core.category.CategoryProvider = ( function() {

	var logger = $U.core.Logger.getLogger("CategoryProvider");

	function CategoryProvider(id, title, displayOrder) {
		this._id = id;
		this._title = title;
		this._displayOrder = displayOrder;
	}

	var proto = CategoryProvider.prototype;

	Object.defineProperties(proto, {

		/**
		 * @property {string} id
		 * @readonly
		 */
		"id" : {
			get : function() {
				return this._id;
			}
		},

		/**
		 * @property {string} title
		 * @readonly
		 */
		"title" : {
			get : function() {
				return this._title;
			}
		},

		/**
		 * @property {number} displayOrder
		 * @readonly
		 */
		"displayOrder" : {
			get : function() {
				return this._displayOrder;
			}
		},

		/**
		 * @property {boolean} isShowInMenu
		 * @readonly
		 */
		"isShowInMenu" : {
			get : function() {
				return this._isShowInMenu();
			}
		}

	});

	/**
	 * Access function to start the fetching of items
	 * @param {Function} callback the function to call when the items are fetched
	 * @param {$U.core.mediaitem.MediaItem[]} callback.items the items fetched
	 * @param {Number} count number of items to fetch
	 * @param {Number} offset value to offset the results by
	 * @param {Boolean} fullLoad if a full async fetch should be executed
	 */
	proto.fetchItems = function(callback, count, offset, fullLoad) {
		//use this fetch to get the id/type of the assets tiles send a callback that will handle the results in this class
		// the callback should go and get the tiles for the screen to pass back to assetContainer
		this._browseCallback = callback;
		this._fetchItems(count, offset, null, fullLoad);
	};

	/**
	 * Creates itemLoaders for the ids of the mediaItems, then asks them to load the items
	 * @param {Object} results the id and types used to get the items
	 */
	proto.loadMediaItems = function(results) {
		if (logger) {
			logger.log("loadMediaItems", JSON.stringify(results));
		}
		var i;
		var len = results.length;

		this._loaders = [];

		for ( i = 0; i < len; i++) {
			switch(results[i].customType) {
			case $U.core.CategoryConfiguration.CONTENT_TYPE.VOD:
				this._loaders.push(new $U.core.mediaitem.mediaitemloader.VODItemLoader(results[i].data, this));
				break;
			case $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL:
				this._loaders.push(new $U.core.mediaitem.mediaitemloader.BTVChannelItemLoader(results[i].data, this));
				break;
			case $U.core.CategoryConfiguration.CONTENT_TYPE.EVENT:
				this._loaders.push(new $U.core.mediaitem.mediaitemloader.OnNowItemLoader(results[i].data, this));
				break;
			}
		}

		this._loadedCount = this._loaders.length;

		if (this._loadedCount === 0) {
			//we don't have any results so send empty array back to asset container
			this._browseCallback(this._loaders, this);
		} else {
			for ( i = 0; i < len; i++) {
				this._loaders[i].load();
			}
		}

	};

	/*
	 * Callback for the itemLoaders to call when they have finished loading their mediaItem
	 */
	proto.loaded = function() {
		this._loadedCount--;
		if (this._loadedCount === 0) {
			this._checkItems();
		}
	};
	/*
	 * Checks the items that have been loaded, removes them if they are null (not loaded) or if they have too high a parental rating.<br>
	 * Once checked they are pumped into the assetContainer
	 */
	proto._checkItems = function() {
		var i;
		var len = this._loaders.length;
		this._fetchedItems = [];
		for ( i = 0; i < len; i++) {
			if (this._loaders[i].hasItem) {
				if ($U.core.parentalcontrols.ParentalControls.isRatingPermitted(this._loaders[i].item.rating)) {
					this._fetchedItems.push(this._loaders[i].item);
				}
			}
		}
		this._browseCallback(this._fetchedItems, this);
	};
	/**
	 * Gets the custom category that have been hardcoded using it's id
	 * @param {Object} id the id of the custom category
	 */
	CategoryProvider._getCustomCategory = function(id) {
		var categories = $U.core.CategoryConfiguration.getCustomCategories();
		var result = null;
		var i, l;

		l = categories.length;
		for ( i = 0; i < l; i++) {
			if (categories[i].id === id) {
				result = categories[i];
				break;
			}
		}
		return result;
	};

	/**
	 * Gets the assets for a custom category. The assets are actually the ids used to look up the item from the server
	 * @param {Object} customCategory
	 */
	CategoryProvider._getAssetsFromCustomCategory = function(customCategory) {
		var result = [];
		var i;
		var l = customCategory.content.length;
		for ( i = 0; i < l; i++) {
			result = result.concat(getAssetsFromCustomContent(customCategory.content[i]));
		}
		return result;
	};

	/**
	 * Puts the content into a uniform format for ease of use.
	 * @param {Object} customContent the content to format better
	 */
	function getAssetsFromCustomContent(customContent) {

		var result = [];
		var i, j;
		var l = customContent.data.length;

		switch(customContent.type) {

		case $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL:
			for ( i = 0; i < l; i++) {
				result.push({
					customType : $U.core.CategoryConfiguration.CONTENT_TYPE.CHANNEL,
					data : customContent.data[i]
				});
			}
			break;

		case $U.core.CategoryConfiguration.CONTENT_TYPE.EVENT:
			for ( i = 0; i < l; i++) {
				result.push({
					customType : $U.core.CategoryConfiguration.CONTENT_TYPE.EVENT,
					data : customContent.data[i]
				});
			}
			break;

		case $U.core.CategoryConfiguration.CONTENT_TYPE.VOD:
			for ( i = 0; i < l; i++) {
				result.push({
					customType : $U.core.CategoryConfiguration.CONTENT_TYPE.VOD,
					data : customContent.data[i]
				});
			}
			break;

		case $U.core.CategoryConfiguration.CONTENT_TYPE.RECORDED:
			for ( i = 0; i < l; i++) {
				result.push({
					customType : $U.core.CategoryConfiguration.CONTENT_TYPE.RECORDED,
					data : customContent.data[i]
				});
			}
			break;

		case $U.core.CategoryConfiguration.CONTENT_TYPE.SCHEDULED:
			for ( i = 0; i < l; i++) {
				result.push({
					customType : $U.core.CategoryConfiguration.CONTENT_TYPE.SCHEDULED,
					data : customContent.data[i]
				});
			}
			break;

		case $U.core.CategoryConfiguration.CONTENT_TYPE.NOWPLAYING:
			for ( i = 0; i < l; i++) {
				result.push({
					customType : $U.core.CategoryConfiguration.CONTENT_TYPE.NOWPLAYING,
					data : customContent.data[i]
				});
			}
			break;
		}

		return result;
	}

	return CategoryProvider;
}());
