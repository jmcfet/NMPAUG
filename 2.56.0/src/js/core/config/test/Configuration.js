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
		DELAY_INITIALISATION : true,

		FORCE_HTML : (location.search === "?noplayer") ? true : false,

		SDP_CONFIG : {
			HEAD_END : "OTT",
			URL : "ott.nagra.com/stable",
			MAC_ADDRESS : "00-05-9E-00-00-18",
			PATH : "/qsp/gateway/http/js",
			CDG_PATH: "contentdiscovery/v1"
		},

		MDS_CONFIG : {
			MDS_URL : "ott.nagra.com/stable",
			MDS_PATH : "/metadata/delivery",
			MDS_PORT : "",
			SERVICE_PROVIDER : "B1"
		},

		getFeatured : function() {
			FEATURED = {
				id : "$FEATURED",
				name : $U.core.util.StringHelper.getString("txtFeatured"),
				aliasedId : "B1_HOTPICKS"
			};
			return FEATURED;
		},

		DEFAULT_CATALOGUE_UID : "$FEATURED",

		CUSTOM_CATEGORIES : true,

		GATEWAY_CATEGORIES : false,

		// Adaptive Streaming Server
		VIDEO_PATH : "http://ott.nagra.com/stable/videopath/",
		TRAILER_VIDEO_PATH : "http://ott.nagra.com/stable/videopath/",

		// Start over / catch up path if URL is not fully qualified
		SOCU_VIDEO_PATH : "",

		//Production mode switch - true is production mode, false is dev mode (string before build, boolean after build)
		PRODUCTION_MODE : "%PRODUCTION_MODE%",

		//List the supported features to filter the assets available within SDP VOD catalogues
		DEVICE_NAME_LIST : {
			tablet : ["TABLET"],
			phone : ["PHONE"],
			pc : ["PC"]
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
			SHOW_DOWNLOAD_BUTTONS: true
		},

		// if app data is null, the SDP token will be used.
		UPGRADE_MANAGER_CONFIG : {
			URL : "nmpbp.nagra.com/Upgrade",
			APP_DATA : "1365178457P17-prm.Win32.671da6ce8485cc24a581be91d35bbf5b8ca703dbca0973f4b4b3f4a4baa4e96d"
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

			// Total span of EPG Data required (15 days)
			span : 15 * 24 * 60 * 60 * 1000,

			// Timespan backwards from NOW to start EPG Span (7 days)
			previousSpan : 7 * 24 * 60 * 60 * 1000,

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
					description : $U.core.util.StringHelper.getString("txtRating1"),
					imgCSSClass : "mc-parental-rating-U"
				},
				6 : {
					ratingCode : "PG",
					description : $U.core.util.StringHelper.getString("txtRating2"),
					imgCSSClass : "mc-parental-rating-PG"
				},
				13 : {
					ratingCode : "12",
					description : $U.core.util.StringHelper.getString("txtRating3"),
					imgCSSClass : "mc-parental-rating-12"
				},
				16 : {
					ratingCode : "15",
					description : $U.core.util.StringHelper.getString("txtRating4"),
					imgCSSClass : "mc-parental-rating-15"
				},
				76 : {
					ratingCode : "",
					description : $U.core.util.StringHelper.getString("txtRating5"),
					imgCSSClass : "mc-parental-rating-18"
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
		NPVR_ENABLED : false,

		//Length of the NPVR recording buffer in hours
		RECORDING_BUFFER_DURATION : 0,

		LOCKER_CONFIG : {
			URL : "10.8.1.5",
			PORT : 3000,
			SERVICE_PATH : "api",
			SECURITY : false,
			PROVIDER : "CMS4X"
		},

		//flag to enable/disable catchup/startover
		CATCHUP_ENABLED : true,

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

		/*
		name : "Swedish",
		code : "swe"
		}, {
		name : "Norwegian",
		code : "nor"
		}, {
		name : "Danish",
		code : "dan"
		}, {
		name : "Finnish",
		code : "fin"
		*/

		// SOLR Fields to search
		SEARCH_FIELDS : [
			"title", "actors", "description", "directors", "synopsis"  // can include "title", "actors", "description", "synopsis", "directors"
		],

		PAGE_SEARCH_RESULTS: true,

		// Mobile network settings
		MOBILE_NETWORK : {
			allowVideoPlayback: true,
			showDialogAtSignon: true
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

		// Direct mode signon on/off
		DIRECT_MODE_SIGNON : false,

		DIRECT_MODE_URL : "http://ott.nagra.com/stable",


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
