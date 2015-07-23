var $U = $U || {};
$U.core = $U.core || {};

$U.core.Configuration = ( function() {
	/**
	 * @class $U.core.Configuration
	 * Implements configuration of a Application constants
	 * @return {Object}
	 */

	var FEATURED = null;

	var PARENTAL_RATINGS = null;

	var VIDEO_ENCODERS = {
		HARMONIC: $N.Config.VIDEO_ENCODERS.HARMONIC,
		ENVIVIO: $N.Config.VIDEO_ENCODERS.ENVIVIO,
		RGB: $N.Config.VIDEO_ENCODERS.RGB
	};

	var Configuration = {
		/*
		 * the url of the SDP you wish to connect to
		 * {string}
		 */

		FORCE_HTML : (location.search === "?noplayer") ? true : false,

		SDP_CONFIG : {
			HEAD_END : "OTT",
			URL : "abra6.abertistelecom.com",
			MAC_ADDRESS : "00-05-9E-00-00-18",
			PATH : "/qsp/gateway/http/js",
			CDG_PATH: "contentdiscovery/v1"
		},

		MDS_CONFIG : {
			MDS_URL : "abra6.abertistelecom.com",
			MDS_PATH : "/metadata/delivery",
			MDS_PORT : "",
			SERVICE_PROVIDER : "ABR00000019"
		},

		getFeatured : function() {
			FEATURED = {
				id : "$FEATURED",
				name : $U.core.util.StringHelper.getString("txtFeatured"),
				aliasedId : "LYS038934099"
			};
			return FEATURED;
		},

		DEFAULT_CATALOGUE_UID : "$FEATURED",

		CUSTOM_CATEGORIES : true,

		GATEWAY_CATEGORIES : false,

		//URL of Cover images for VOD
		VOD_IMAGE_PREFIX : "",

		// Appended to the VOD cover filename
		COVER_IMAGE_SUFFIX : "",

		// Adaptive Streaming Server
		VIDEO_PATH : "http://abratest2.abertistelecom.com/",

		// Whether to clear any stored credentials
		CLEAR_CREDENTIALS : false,

		// Whether to clear the favourites on start up
		CLEAR_FAVOURITES : false,

		// Whether to clear the recently viewed on start up
		CLEAR_RECENTLY_VIEWED : false,

		// Set an item to recently viewed status after this milliseconds
		RECENTLY_VIEWED_AFTER : 30000,

		//List the supported features to filter the assets available within SDP VOD catalogues
		DEVICE_NAME_LIST : {
			tablet : ["NMP"],
			phone : ["NMP"],
			pc : ["NMP"]
		},

		//List the supported features to filter the BTV channels
		// DEVICE_NAME_LIST_BTV : {
			// tablet : ["NMP"],
			// phone : ["NMP"],
			// pc : ["NMP"]
		// },

		// Whether the browser plugin check is enabled
		PLUGIN_CHECKER_ENABLED : false,

		// Locales supported by the app, default first
		SUPPORTED_LOCALES : [{
			displayName : "Français",
			localeString : "fr_be"
		}, {
			displayName : "English (UK)",
			localeString : "en_gb"
		}, {
			displayName : "Español",
			localeString : "es_es"
		}
		],

		LANGPATH : "bundles/",

		DEFAULT_TIME_TYPE : 12,

		EPG_CONFIG : {
			// All spans are in milliseconds

			// Total span of EPG Data required (currently 8 days)
			span : 691200000,

			// Timespan backwards from NOW to start EPG Span (currently 1 day)
			previousSpan : 86400000,

			// When the epg window starts per day (currently 6 am)
			eventWindowStart : 6,

			// Span from eventWindowStart to display a ‘day’ of data (currently 24 hours, so 6am to 6am)
			eventWindowSpan : 86400000

			// uncomment this to see the now/next layout
			// layout : "nownext"
		},

		//Override the device properties
		// DEVICE : {
		// OS : $U.core.Device.OS.IOS,
		// FF : $U.core.Device.FF.PHONE
		// },

		MAX_PARENTAL_RATING : 76,

		// Minimum parental rating for search suggestions to be shown
		SUGGESTIONS_MINIMUM_RATING : 0,

		getParentalRatings : function() {
			PARENTAL_RATINGS = {
				0 : {
					ratingCode : "U",
					description : $U.core.util.StringHelper.getString("txtRating1")
				},
				6 : {
					ratingCode : "PG",
					description : $U.core.util.StringHelper.getString("txtRating2")
				},
				13 : {
					ratingCode : "12",
					description : $U.core.util.StringHelper.getString("txtRating3")
				},
				16 : {
					ratingCode : "15",
					description : $U.core.util.StringHelper.getString("txtRating4")
				},
				76 : {
					ratingCode : "",
					description : $U.core.util.StringHelper.getString("txtRating5")
				}
			};
			return PARENTAL_RATINGS;
		},

		// Flag to switch on/off string replacement testing - true makes all text replace with X
		STRINGTEST : false,

		// Optional cap on the number of asset tiles displayed in an AssetContainer
		MAX_ASSET_TILES : 100,

		// Timings (in milliseconds) for lifecycle events.  Events are checked every CHECKC milliseconds to see if they need to be triggered.
		LIFECYCLE_TIMINGS : {
			CHECK : 5000,
			UPDATE : 3600000,
			WHATSON : 20000,
			SLEEP_REFRESH : 28800000,
			REFRESH_MINI_MEDIA_CARD : 10000
		},

		//flag to enable/disable catchup/startover
		CATCHUP_ENABLED : false,

		// Configuration of recently viewed feature
		RECENTLY_VIEWED : {
			// Whether to store recently viewed data locally
			USELOCAL : true,
			// Maximum number of recently viewed items to store
			MAXITEMS : 20,
			// Time (milliseconds) after which recently viewed data is deleted
			EXPIRY : 172800000,
			// Time (milliseconds) after which an item is added to recently viewed data
			AFTER : 30000
		},

		// Configuration of favourites feature
		FAVOURITES : {
			// Whether to store favourites data locally
			USELOCAL : true,
			// Maximum number of favourites items to store
			MAXITEMS : 100
		},

		MAXIMUM_STREAM_RESTRICTION : false,

		ASSET_PAGE_SIZE : 50,

		//Length of the NPVR recording buffer in hours
		RECORDING_BUFFER_DURATION : 0,

		NICE264_PLUGIN_ENABLED : false,

		NICE264_PLUGIN_CONFIG : {
			PLUGIN_NAME : "pluginName",
			SERVICE : "http://nqs.nice264.com",
			SYSTEM : "npawplug",
			USERNAME : "user1",
			TRANSACTION : "123456"
		},

		// Support Subtitles Object
		SUPPORT_SUBTITLES : { SUPPORT : function() {
				return false;
				//$U.core.Device.isDesktop() ? true : false;
			}, LANGUAGES :[]
		},

		// Mobile network settings
		MOBILE_NETWORK : {
			allowVideoPlayback: true,
			showDialogAtSignon: false
		},

		//More like this settings
		MORE_LIKE_THIS: {
			EVENT_HOURS_TO_FETCH: 24,
			BTV_EVENTS_TO_RENDER: 10
		},

		// Video encoder. One of VIDEO_ENCODERS.HARMONIC, VIDEO_ENCODERS.ENVIVIO or VIDEO_ENCODERS.RGB
		VIDEO_ENCODER: VIDEO_ENCODERS.HARMONIC,

		// If VOD asset fetch be attempted for catchup events
		FETCH_CATCHUP_VOD_ASSETS: true,

		// Enable or disable recommendations feature
		RECOMMENDATIONS : {
			DYNAMIC : false,
			STATIC : false,
			FOR_ME : false,
			STARS : false
		},

		// App-wide configurable Dynamic Recommendation settings
		// allowMarketing - Allows recommendations to be manipulated by operator defined marketing bias rules
		// allowPreviousRecommendations - Allows the recommendation engine to re-recommend the same content, if false the content will not be re-recommended until a predefined period expires
		// allowOnlySubscribedRecommendations - Only return recommendations for content that subscriber can watch
		DYNAMIC_RECOMMENDATIONS : {
			allowMarketing : true,
			allowPreviousRecommendations : true,
			allowOnlySubscribedRecommendations : true
		},

		//commenting or removing these will prevent the UAV receiving POST requests
		CDG_USER_ACTIVITIES : {
		//	WATCH : "watch", //supported
		//	PLAY : "play", //supported
		//	BOOKMARK : "bookmark", //supported
		//	BROWSE : "browse", //supported
		//	RECORD : "record", //supported
		//	PURCHASE : "purchase", //supported
		//	CLICKSEARCHRESULT : "clicksearchresult", //supported
		//	REMOTERECORD : "remoterecord" //supported
		//	SETREMINDER : "setreminder", //not supported
		//	LIKE : "like",	//not supported
		//	DISLIKE : "dislike", //not supported
		//	TWEET :	"tweet", //not supported
		//	POSTONFACEBOOK : "postonfacebook", //not supported
		//	ADDTOBASKET : "addtobasket", //not supported
		//	DOWNLOAD : "download" //not supported
		},

		//Switch User Activity Vault UAV logging off altogether by returning false here
		recordUserActivity : function(activity) {
			if ($U.core.Configuration.CDG_USER_ACTIVITIES && $U.core.Configuration.CDG_USER_ACTIVITIES[activity]) {
				return true;
			}
			return false;
		}
	};

	return Configuration;

}());
