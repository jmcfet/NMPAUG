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
			HEAD_END : "SRMADRIDLAB",
			URL : "srmadridlab.nagra.com/shmadmdg",
			PATH : "/hue-gateway/gateway/http/js",
			MAC_ADDRESS : "00-05-9E-00-00-18",
			CDG_PATH: "contentdiscovery/v1",
			//set this to true to turn on the Home Domain Manager signing on:
			HDM : false
		},

		MDS_CONFIG : {
			MDS_URL : "srmadridlab.nagra.com/shmadmdg",
			MDS_PATH : "/metadata/delivery",
			MDS_PORT : "",
			MDS_TIMEOUT: 9000,
			SERVICE_PROVIDER : "SCV"
		},

		getFeatured : function() {
			FEATURED = {
				id : "$FEATURED",
				name : $U.core.util.StringHelper.getString("txtFeatured"),
				aliasedId : "1797"
			};
			return FEATURED;
		},

		MAX_MENU_DEPTH : 3,

		DEFAULT_CATALOGUE_UID : "$FEATURED",

		CUSTOM_CATEGORIES : true,

		GATEWAY_CATEGORIES : true,

		// Adaptive Streaming Server
		VIDEO_PATH : "http://ssoloab1.nagra.com/videopath/",

		// Start over / catch up path if URL is not fully qualified
		SOCU_VIDEO_PATH : "",

		TRAILER_VIDEO_PATH : "http://ssolab1.nagra.com/videopath/",

		//Production mode switch - true is production mode, false is dev mode (string before build, boolean after build)
		PRODUCTION_MODE : "%PRODUCTION_MODE%",

		//List the supported features to filter the assets available within SDP VOD catalogues
		DEVICE_NAME_LIST : {
			tablet : null,
			phone : null,
			pc : null
		},

		DEVICE_NAME_LIST_BTV : {
			tablet : null,
			phone : null,
			pc : null
		},

		// If the plugin should be downloaded automatically
		PLUGIN_DOWNLOAD_OPTIONS : {
			DOWNLOAD_MISSING_PLUGIN: false,
			DOWNLOAD_REQUIRED_UPDATES: false,
			SHOW_DOWNLOAD_BUTTONS: false
		},

		// if app data is null, the SDP token will be used.
		UPGRADE_MANAGER_CONFIG : {
			URL : "nmpbp.nagra.com/Upgrade",
			APP_DATA : "1365178457P17-prm.Win32.671da6ce8485cc24a581be91d35bbf5b8ca703dbca0973f4b4b3f4a4baa4e96d"
		},

		PAGE_SEARCH_RESULTS: false,

		// Locales supported by the app, default first
		SUPPORTED_LOCALES : [{
			displayName : "English (UK)",
			localeString : "en_gb"
		}, {
			displayName : "中文",
			localeString : "zh_cn"
		}, {
			displayName : "Singapore",
			localeString : "zh_sg"
		}],

		LANGPATH : "bundles/",

		DEFAULT_TIME_TYPE : 12,

		EPG_CONFIG : {
			// All spans are in milliseconds

			// Total span of EPG Data required (currently 8 days)
			span : 691200000,
			//span : 259200000,

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

		MAX_PARENTAL_RATING : 100,

		// Minimum parental rating for search suggestions to be shown
		SUGGESTIONS_MINIMUM_RATING : 0,

		getParentalRatings : function() {
			PARENTAL_RATINGS = {
				5 : {
					ratingCode : "G",
					description : $U.core.util.StringHelper.getString("txtRating2"),
					imgCSSClass : "mc-parental-rating-U"
				},
				6 : {
					ratingCode : "PG",
					description : $U.core.util.StringHelper.getString("txtRating3"),
					imgCSSClass : "mc-parental-rating-PG"
				},
				36 : {
					ratingCode : "PG13",
					description : $U.core.util.StringHelper.getString("txtRating4"),
					imgCSSClass : "mc-parental-rating-12"
				},
				63 : {
					ratingCode : "NC16",
					description : $U.core.util.StringHelper.getString("txtRating5"),
					imgCSSClass : "mc-parental-rating-15"
				},
				81 : {
					ratingCode : "M18",
					description : $U.core.util.StringHelper.getString("txtRating6"),
					imgCSSClass : "mc-parental-rating-18"
				},
				100 : {
					ratingCode : "",
					description : $U.core.util.StringHelper.getString("txtRating1"),
					imgCSSClass : "mc-parental-rating-18"
				}
			};

			return PARENTAL_RATINGS;
		},

		// Flag to switch on/off string replacement testing - true makes all text replace with X
		STRINGTEST : false,

		// Optional cap on the number of asset tiles displayed in an AssetContainer
		// MAX_ASSET_TILES : 100,

		// Timings (in milliseconds) for lifecycle events.  Events are checked every CHECKC milliseconds to see if they need to be triggered.
		LIFECYCLE_TIMINGS : {
			CHECK : 5000,
			UPDATE : 3600000,
			WHATSON : 20000,
			SLEEP_REFRESH : 28800000,
			FETCH_CONTENT : 2000,
			REFRESH_MINI_MEDIA_CARD : 10000,
			GATEWAY_ONLINE : 15000
		},
		//flag to enable/disable network prv
		NPVR_ENABLED : false,

		//Length of the NPVR recording buffer in hours
		RECORDING_BUFFER_DURATION : 0,

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

		NICE264_PLUGIN_ENABLED : false,

		NICE264_PLUGIN_CONFIG : {
			PLUGIN_NAME : "pluginName",
			SERVICE : "http://nqs.nice264.com",
			SYSTEM : "npawplug",
			USERNAME : "user1",
			TRANSACTION : "123456"
		},

		/**
		 * Support Subtitles Object
		 */
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

		// Multi-pricing feature on/off
		MULTI_PRICING_ENABLED : false,

		// A list of ids of vod catalogue nodes that will be ignored
		IGNORE_NODES : ["LYS0000139", "413"],

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
		//CDG_USER_ACTIVITIES : {
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
		//},

		//Switch User Activity Vault UAV logging off altogether by returning false here
		recordUserActivity : function(activity) {
			if ($U.core.Configuration.CDG_USER_ACTIVITIES && $U.core.Configuration.CDG_USER_ACTIVITIES[activity]) {
				return true;
			}
			return false;
		},

		// Function to transform the MDS menu structure
		MENU_TRANSFORM_FUNCTION : function() {
			return $U.core.StarHubGWMenuTransformer.transform;
		}

	};

	return Configuration;

}());
