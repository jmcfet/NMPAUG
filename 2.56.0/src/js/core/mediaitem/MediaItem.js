/**
 * Represents a media item.
 *
 * @class $U.core.mediaitem.MediaItem
 *
 * @constructor
 * Create a new MediaItem
 * @param {Object} dataObject the underlying data object from SDP / MDS
 * @param {$U.core.mediaitem.MediaItemType} type the type of this MediaItem
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.MediaItem = ( function() {

	var nextItemId = 0;

	function MediaItem(dataObject) {
		this._itemId = nextItemId++;
		this._data = dataObject;
	}

	var proto = MediaItem.prototype;
	
	proto.isTileLarge = function() {
		return false;
	};
	
	proto._getSearchMatches = function () {
		return this._data.searchMatches;	
	};
	
	proto._setSearchMatches = function (matches) {
		this._data.searchMatches = matches;	
	};

	Object.defineProperties(proto, {

		/**
		 * @property {$U.core.mediaitem.MediaItemType} type this MediaItem's type
		 * @readonly
		 */
		"type" : {
			get : function() {
				return this._getType();
			}
		},
		/**
		 * @property {$U.core.CategoryConfiguration.CONTENT_TYPE} customType this MediaItem's customType, used to lay it out
		 * @readonly
		 */
		"customType" : {
			get : function() {
				return this._getCustomType();
			}
		},
		/**
		 * @property {Object} dataObject this MediaItem's underlying data object
		 * @readonly
		 */
		"dataObject" : {
			get : function() {
				return this._data;
			}
		},

		/**
		 * @property {number} itemId the globally unique itemId
		 * Useful for debugging.
		 * @readonly
		 */
		"itemId" : {
			get : function() {
				return this._itemId;
			}
		},

		/**
		 * @property {string} id the id of this MediaItem
		 * @readonly
		 */
		"id" : {
			get : function() {
				return this._getId();
			}
		},

		/**
		 * @property {string} title the title of this MediaItem
		 * @readonly
		 */
		"title" : {
			get : function() {
				return this._getTitle();
			}
		},

		/**
		 * @property {string} description this MediaItem's description
		 * @readonly
		 */
		"description" : {
			get : function() {
				return this._getDescription();
			}
		},

		/**
		 * @property {string} synopsis this MediaItem's synopsis
		 * @readonly
		 */
		"synopsis" : {
			get : function() {
				return this._getSynopsis();
			}
		},

		/**
		 * @property {number} duration this MediaItem's duration in seconds
		 * @readonly
		 */
		"durationInSeconds" : {
			get : function() {
				return this._getDurationInSeconds();
			}
		},

		/**
		 * @property {boolean} hasPromoImageURL whether this MediaItem has a promoImageURL
		 * @readonly
		 */
		"hasPromoImageURL" : {
			get : function() {
				return this._hasPromoImageURL();
			}
		},

		/**
		 * @property {string} promoImageURL the URL of this MediaItem's promo image
		 * @readonly
		 */
		"promoImageURL" : {
			get : function() {
				return this._getPromoImageURL();
			}
		},

		/**
		 * @property {boolean} hasPurchaseImageURL whether this MediaItem has a coverImageURL
		 * @readonly
		 */
		"hasCoverImageURL" : {
			get : function() {
				return this._hasCoverImageURL();
			}
		},

		/**
		 * @property {string} coverImageURL the URL of this MediaItem's purchase image
		 * @readonly
		 */
		"coverImageURL" : {
			get : function() {
				return this._getCoverImageURL();
			}
		},

		/**
		 * @property {number} rating the numeric parental control rating for this MediaItem
		 * @readonly
		 */
		"rating" : {
			get : function() {
				return this._getRating();
			}
		},

		/**
		 * @property {Object} ratingObject the parental control rating object for this MediaItem.<br>
		 * May be null if there is no rating object
		 * @readonly
		 */
		"ratingObject" : {
			get : function() {
				return this._getRatingObject();
			}
		},

		"actors" : {
			get : function() {
				return this._getActors();
			}
		},

		"directors" : {
			get : function() {
				return this._getDirectors();
			}
		},

		"episodeNumber" : {
			get : function() {
				return this._getEpisodeNumber();
			}
		},

		"year" : {
			get : function() {
				return this._getYear();
			}
		},

		"lowestPriceObject" : {
			get : function() {
				return this._getLowestPricedObject();
			}
		},

		/**
		 * @property {Object} contentToPlay an object that represents this MediaItem's playable content to send to JSFW's playContent
		 * @readonly
		 */
		"contentToPlay" : {
			get : function() {
				return this._getContentToPlay();
			}
		},

		"bookmarkPosition" : {
			get : function() {
				return this.contentPosition;
			},
			set : function(position) {
				this.contentPosition = position;
			}
		},

		"bookmarkId" : {
			get : function() {
				return this._bookmarkId;
			},
			set : function(id) {
				this._bookmarkId = id;
			}
		},
		
		/**
		 * @property {Boolean} hasSearchMatches indicates whether this mediaitem handles asset tile search markup
		 */
		
		"hasSearchMatch" : {
			get : function() {
				return this._hasSearchMatch ? this._hasSearchMatch() : false;
			}
		},
		
		/**
		 * @property {Object} sets or returns an object containing the search matches associated with the search term 
		 */
		
		"searchMatches" : {
			get : function() {
				return this.hasSearchMatch ? this._getSearchMatches() : false;
			},
			set : function(matches) {
				return this.hasSearchMatch ? this._setSearchMatches(matches) : false;
			}
		}

	});

	return MediaItem;
}());
