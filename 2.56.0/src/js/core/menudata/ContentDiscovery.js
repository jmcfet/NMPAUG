/**
 * Singleton class that retrieves catalogue data from MDS on behalf of MenuData
 *
 * @class $U.core.menudata.ContentDiscovery
 * @singleton
 */
/*global $N */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.ContentDiscovery = ( function() {

	var logger = $U.core.Logger.getLogger("ContentDiscovery"),
		CONFIG_REF = $U.core.Configuration,
		SDP_CONFIG = CONFIG_REF.SDP_CONFIG,
		MDS_CONFIG = CONFIG_REF.MDS_CONFIG,
		DYNAMIC_CONFIG = CONFIG_REF.DYNAMIC_RECOMMENDATIONS,
		ContentDiscoveryGatewayService = null,
		Ratings = null,
		UserActivity = null,
		DynamicRecommendations = null;

	function _ratingsInterface(callback) {
		if (!Ratings) {
			if (!ContentDiscoveryGatewayService) {
				ContentDiscoveryGatewayService = new $N.services.contentdiscovery.ContentDiscoveryGatewayService(SDP_CONFIG.URL,null,SDP_CONFIG.CDG_PATH,false);
			}
			Ratings = new $N.services.contentdiscovery.Ratings(ContentDiscoveryGatewayService);
		}
		return callback();
	}

	function _fetchUserActivityInterface(callback) {
		if (!UserActivity) {
			if (!ContentDiscoveryGatewayService) {
				ContentDiscoveryGatewayService = new $N.services.contentdiscovery.ContentDiscoveryGatewayService(SDP_CONFIG.URL,null,SDP_CONFIG.CDG_PATH,false);
			}
			UserActivity = new $N.services.contentdiscovery.UserActivity(ContentDiscoveryGatewayService);
		}
		return callback();
	}
	
	function _fetchDynamicRecommendationsInterface(callback) {
		if (!DynamicRecommendations) {
			if (!ContentDiscoveryGatewayService) {
				ContentDiscoveryGatewayService = new $N.services.contentdiscovery.ContentDiscoveryGatewayService(SDP_CONFIG.URL,null,SDP_CONFIG.CDG_PATH,false);
			}
			DynamicRecommendations = new $N.services.contentdiscovery.DynamicRecommendations(ContentDiscoveryGatewayService);
		}
		return callback();
	}

	var _addOptionalParameters = function (CDGRequest, filter) {
		var aclItems,packages,length,i;
		if (DYNAMIC_CONFIG.allowMarketing) {
			CDGRequest.allowMarketing = true;
		}
		if (DYNAMIC_CONFIG.allowPreviousRecommendations) {
			CDGRequest.allowPreviousRecommendations = true;
		}
		if (DYNAMIC_CONFIG.allowOnlySubscribedRecommendations) {
			packages = [];
			aclItems = $N.services.sdp.AcquiredContent.getAclItemsByPurchasedItemType("PKG");
			if (aclItems) {
				length = aclItems.length;
				for (i = 0; i < length; i++) {
					packages.push(aclItems[i].purchasedItemOriginKey);
				}
				filter.productId = packages;
			}
		}
		if ($U.core.parentalcontrols.ParentalControls.isLocked()) {
			filter["editorial.Rating.precedence"] =  { "$lte" : $U.core.parentalcontrols.ParentalControls.getCurrentRating() };
		}
	};

	/**
	 * Returns dynamic recommendations for a Media item. 
	 * @method getDynamicRecommendationsForAsset
	 * @param {Object} asset - the Media asset
	 * @param {Object} successCallback
	 */
	var getDynamicRecommendationsForAsset = function(asset, callback) { //, requestFilter, requestFieldList, count, offset) {
		var CDGRequest, filter =  {}, fieldList ={}, length, i, packages,count,offset, userAccount, userCredentials,
			recommendationCallback = function (data) {
				var assets;
				if (!data) { return callback(); }
				assets = (data.programmes) ? data.programmes : data.editorials;
				$U.core.mediaitem.MediaItemHelper.fetchMediaItems(assets,function(wlaMediaItems){
					return callback(wlaMediaItems);
				});
			};
			
		$N.services.sdp.Account.fetchAccountDetails(function (accountDetails) {
			CDGRequest = {};
			CDGRequest.dataType = (asset.type === $U.core.mediaitem.MediaItemType.BTVEVENT) ?  'btv' : 'vod';
			CDGRequest.contentId = asset.id;
			CDGRequest.deviceType = 'MediaPlayer';
			CDGRequest.recommendationType = 'context';
		
			filter.locale = $U.core.Locale.getMDSLocale(); 
			
			userCredentials = $U.core.signon.SignOn.getUserCredentials();
			userAccount = accountDetails;

			_addOptionalParameters(CDGRequest,filter);
			
			_fetchDynamicRecommendationsInterface(function() {
				DynamicRecommendations.fetchRecommendationsByAccountAndUser(recommendationCallback,userAccount.accountNumber,userCredentials.username,CDGRequest,filter,fieldList,count,offset);	
			});											
		});
	};

	/**
	 * Returns dynamic recommendations for Account User. 
	 * @method getDynamicRecommendationsForMe
	 * @param {Object} asset - the Media asset
	 * @param {Object} successCallback
	 * @param {Object} requestFilter - filter options to pass to CDG
	 * @param {Object} requestFieldList - limit fields returned from CDG
	 * @param {Number} count - optional parameter to specify how many results to return
	 * @param {Number} offset - optional parameter to assist pagination
	 */
	
	var getDynamicRecommendationsForMe = function(callback, requestFilter, requestFieldList, count, offset) {
		var i, CDGRequest = {}, totalLen, filter = requestFilter || {}, fieldList = requestFieldList || {}, asset, items=[],
			dynamicVODRecommendations = [], dynamicBTVRecommendations = [], userAccount, userCredentials,
			sortResults = function (data) {
				var BTVlen, VODlen;
				dynamicVODRecommendations = data;
				BTVlen = dynamicBTVRecommendations.length;
				VODlen = dynamicVODRecommendations.length;
				totalLen =  BTVlen + VODlen;
				for (i = 0; i < totalLen; i++) {
					if ((i % 2 === 0 && BTVlen > 0) || VODlen === 0) {
						asset = dynamicBTVRecommendations.shift();
						BTVlen -=1;
					} else {
						asset = dynamicVODRecommendations.shift();
						VODlen -=1;
					}
					items.push(asset);
				}
				return callback(items);
			},
			VODCallback = function (data) {
				if (data && data.editorials) {
					$U.core.mediaitem.MediaItemHelper.fetchMediaItems(data.editorials,sortResults);
				} else {
					return callback(dynamicBTVRecommendations);
				}
			},
			BTVCallback = function (data) {
				CDGRequest.dataType = 'vod';
				if (data && data.programmes) {
					$U.core.mediaitem.MediaItemHelper.fetchMediaItems(data.programmes,
						function(data){
							dynamicBTVRecommendations = data;
							DynamicRecommendations.fetchRecommendationsByAccountAndUser(VODCallback,userAccount.accountNumber,userCredentials.username,CDGRequest,filter,fieldList,count,offset);
						}
					);
				} else {	
					DynamicRecommendations.fetchRecommendationsByAccountAndUser(VODCallback,userAccount.accountNumber,userCredentials.username,CDGRequest,filter,fieldList,count,offset);	
				}
			}; 
		
		$N.services.sdp.Account.fetchAccountDetails(function (accountDetails) {
			CDGRequest = {};
			CDGRequest.dataType = 'btv';
			CDGRequest.deviceType = 'MediaPlayer';
			CDGRequest.recommendationType = 'preference';
		
			filter.locale = $U.core.Locale.getMDSLocale();
			
			_addOptionalParameters(CDGRequest,filter);
			
			userCredentials = $U.core.signon.SignOn.getUserCredentials();
			userAccount = accountDetails;

			_fetchDynamicRecommendationsInterface(function() {
				DynamicRecommendations.fetchRecommendationsByAccountAndUser(BTVCallback,userAccount.accountNumber,userCredentials.username,CDGRequest,filter,fieldList,count,offset);
			});											
		});
	};

	/**
	 * Sets rating by account
	 * @method setRatingByAccount
	 * @param {Object} mediaItem - the Media item
	 * @param {Number} rating
	 */
	var setRatingByAccount = function (mediaItem, rating) {
		var ratingRequest = {
				"deviceType":"mediaplayer"
			}, userAccount, userCredentials,
			ratingCallback = function (response) {
				if (response) {
					if (logger) {
						logger.log("setRatingForAccount", "success");
					}
				} else {
					if (logger) {
						logger.log("setRatingForAccount", "success");
					}
				}
			};

		if (mediaItem.type === $U.core.mediaitem.MediaItemType.VOD) {
			ratingRequest.dataType = "vod";
		} else {
			ratingRequest.dataType = "btv";
		}
		ratingRequest.contentId = mediaItem.id;
		ratingRequest.rating = rating;
		$N.services.sdp.Account.fetchAccountDetails(function (accountDetails) {
			userCredentials = $U.core.signon.SignOn.getUserCredentials();
			userAccount = accountDetails;
			_ratingsInterface(function() {
				Ratings.setRatingByAccountAndUser(ratingCallback,userAccount.accountNumber,userCredentials.username,ratingRequest);
			});
		});
	};

	/**
	 * Gets rating by account
	 * @method getRatingByAccount
	 * @param {Object} mediaItem - the Media item
	 * @param {Function} callback
	 */
	var getRatingByAccount = function (callback, mediaItem) {
		var ratingCallback = function (response) {
			if (response && response.rating) {
				callback(response.rating);
			} else {
				callback(null);
			}
		}, userAccount, userCredentials;

		$N.services.sdp.Account.fetchAccountDetails(function (accountDetails) {
			userCredentials = $U.core.signon.SignOn.getUserCredentials();
			userAccount = accountDetails;
			_ratingsInterface(function() {
				Ratings.fetchContentRatingByAccountAndUser(ratingCallback,userAccount.accountNumber,userCredentials.username,mediaItem.id);
			});
		});
	};
	
	/**
	 * Records user actions as they move through the interface to enhance recommended content returned. 
	 * @method recordUserActivity
	 * @param {Object} callback - Mandatory
	 * @param {String} activityName - Mandatory, One of UAVactions declared above. 
	 * @param {Object} asset - Mandatory, content id (asset or event). 
	 * @param {Object} metadata - Mandatory, can be used to store additional details in a JSON structure, e.g. Product and promotion details in the case of a purchase.
	 * @param {Number} timestamp- Optional, when the activity occurred - not currently supported in JSFW
	 */
	var recordUserActivity = function(callback, activityName, asset, metadata, timestamp) { 
		var CDGRequest, userAccount, userCredentials;
		$N.services.sdp.Account.fetchAccountDetails(function (accountDetails) {
			CDGRequest = {} || metadata;
			CDGRequest.dataType = (asset.type === $U.core.mediaitem.MediaItemType.BTVEVENT) ?  'btv' : 'vod';
			CDGRequest.contentId = asset.id;
			CDGRequest.deviceType = 'MediaPlayer';
			
			userCredentials = $U.core.signon.SignOn.getUserCredentials();
			userAccount = accountDetails;

			_fetchUserActivityInterface(function() {
				UserActivity.setUserActivityByAccountAndUser(callback,userAccount.accountNumber,userCredentials.username, activityName,CDGRequest);	
			});											
		});
	};	

	return {
		getDynamicRecommendationsForAsset : getDynamicRecommendationsForAsset,
		getDynamicRecommendationsForMe : getDynamicRecommendationsForMe,
		setRatingByAccount : setRatingByAccount,
		getRatingByAccount : getRatingByAccount,
		recordUserActivity : recordUserActivity
	};

}());

