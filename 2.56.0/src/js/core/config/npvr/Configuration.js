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
			URL : "ott.nagra.com/latest",
			MAC_ADDRESS : "00-05-9E-00-00-18",
			PATH : "/qsp/gateway/http/js",
			CDG_PATH: "contentdiscovery/v1"
		},

		MDS_CONFIG : {
			MDS_URL : "ott.nagra.com/latest",
			MDS_PATH : "/metadata/delivery",
			MDS_PORT : "",
			SERVICE_PROVIDER : "CMS4X"
		},

		getFeatured : function() {
			return null;
		},

		DEFAULT_CATALOGUE_UID : "$RECOMMENDATIONS_CATEGORY_PROVIDER",

		CUSTOM_CATEGORIES : true,

		GATEWAY_CATEGORIES : false,

		// Adaptive Streaming Server
		VIDEO_PATH : "http://ott.nagra.com/latest/videopath/",

		// Start over / catch up path if URL is not fully qualified
		SOCU_VIDEO_PATH : "",

		// Whether to clear any stored credentials
		CLEAR_CREDENTIALS : false,

		// Whether to clear the favourites on start up
		CLEAR_FAVOURITES : false,

		// Whether to clear the recently viewed on start up
		CLEAR_RECENTLY_VIEWED : false,

		// Set an item to recently viewed status after this milliseconds
		RECENTLY_VIEWED_AFTER : 30000,

		//Production mode switch - true is production mode, false is dev mode (string before build, boolean after build)
		PRODUCTION_MODE : "%PRODUCTION_MODE%",

		//List the supported features to filter the assets available within SDP VOD catalogues
		DEVICE_NAME_LIST : {
			tablet : null,
			phone : null,
			pc : null
		},

		DEVICE_NAME_LIST_NPVR : {
			tablet : null,
			phone : null,
			pc : null
		},

		// If the plugin should be downloaded automatically
		PLUGIN_DOWNLOAD_OPTIONS : {
			DOWNLOAD_MISSING_PLUGIN: false,
			DOWNLOAD_REQUIRED_UPDATES: false,
			SHOW_DOWNLOAD_BUTTONS: true
		},

		// if app data is null, the SDP token will be used.
		UPGRADE_MANAGER_CONFIG : {
			URL : "10.0.225.227/Upgrade",
			APP_DATA : null
		},

		// Locales supported by the app, default first
		SUPPORTED_LOCALES : [{
			displayName : "English (UK)",
			localeString : "en_gb"
		}, {
			displayName : "Español",
			localeString : "es_es"
		}, {
			displayName : "中文",
			localeString : "zh_cn"
		}],

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
			REFRESH_MINI_MEDIA_CARD : 10000,
			UPDATEPROGRESS : 1000
		},

		//flag to enable/disable network prv
		NPVR_ENABLED : true,

		//Length of the NPVR recording buffer in hours
		RECORDING_BUFFER_DURATION : 0,

		LOCKER_CONFIG : {
			URL : "ott.nagra.com/latest",
			PORT : "",
			SERVICE_PATH : "api/npvrlocker/v1",
			SECURITY : false,
			PROVIDER : "CMS4X",
			HARMONIC_PATH : "http://ott.nagra.com"
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

		RECOMMENDATIONS : {
			DYNAMIC : true,
			STATIC : true,
			FOR_ME : true
		},

		// Direct mode signon on/off
		DIRECT_MODE_SIGNON : false,

		DIRECT_MODE_URL : "http://ott.nagra.com/latest",

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
			WATCH : "watch", //supported
			PLAY : "play", //supported
			BOOKMARK : "bookmark", //supported
			BROWSE : "browse", //supported
			RECORD : "record", //supported
			PURCHASE : "purchase", //supported
			CLICKSEARCHRESULT : "clicksearchresult", //supported
			REMOTERECORD : "remoterecord" //supported
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
