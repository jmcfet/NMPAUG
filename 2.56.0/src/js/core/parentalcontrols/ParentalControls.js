/**
 * @class $U.core.parentalcontrols.ParentalControls
 * helper class to handle the parental control functions
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.parentalcontrols = $U.core.parentalcontrols || {};

$U.core.parentalcontrols.ParentalControls = ( function() {

	var logger = $U.core.Logger.getLogger("ParentalControls");

	// Time in ms to wait before refreshing after changing parental controls
	var REFRESH_TIMEOUT = 2000;

	var initialisationCallback = null;

	var STATE_PASSWORD_OK = {};
	var STATE_PASSWORD_NG = {};

	var passwordState = null;
	var proposedRating;
	var currentRating;

	var parentalControl = null;

	var parentalKeys;
	var arryOfKeys = [];

	//this needs to be uppercase!
	var SERVER_KEY = "PARENTAL_RATING";

	/**
	 * Gets / sets the parental control service
	 * @return {Object} parental control service
	 * @private
	 */
	function getParentalControl() {
		if (!parentalControl) {
			parentalControl = $N.platform.ca.ParentalControl;
		}
		return parentalControl;
	}

	/**
	 * Initialises the parental control functionality
	 * Gets current rating from server and populates the rating choices into JSFW
	 * @param {Function} callback the function o be run after getting the rating from storage and setting it in the application
	 */
	var initialise = function(callback) {

		var prop;
		// get the parental rating keys
		parentalKeys = $U.core.Configuration.getParentalRatings();
		// Loop through the rating keys and push their property onto an array
		for (prop in parentalKeys) {
			if (parentalKeys.hasOwnProperty(prop)) {
				arryOfKeys.push(parseInt(prop, 0));
			}
		}
		// Because for in loops are not always in order sort the array
		arryOfKeys.sort(function(a, b) {
			return a - b;
		});

		initialisationCallback = callback;
		getParentalControl().initialise(parentalKeys);

		$U.core.Preferences.get(SERVER_KEY, function(w) {
			setParentalRating(w);
		}, function() {
			setParentalRating("");
		}, true);
	};

	/**
	 * convenience function to start the flow, gets the currentRating and uses this to populate/show the parental control dialog
	 */
	var showMenu = function() {
		$U.core.parentalcontrols.ParentalControlsDialog.showRatingsDialog(this, getCurrentRating());
	};

	/**
	 * gets the current rating from JSFW and returns it
	 * @return {string} the current user rating
	 */
	function getCurrentRating() {
		return getParentalControl().getUserRatingValue();
	}

	/**
	 * Sets the proposed rating, a temporary rating until the user correctly enters their password
	 * @param {string} proRate the proposed rating
	 */
	var setProposedRating = function(proRate) {
		proposedRating = parseInt(proRate, 10);
	};

	/**
	 * Gets the proposed rating, a temporary rating until the user correctly enters their password
	 * @return {string} proposedRating
	 */
	var getProposedRating = function() {
		return proposedRating;
	};

	/**
	 * set the rating value in the application <br>
	 * @param {string} rating the value from the secure storage
	 */
	var setParentalRating = function(rating) {
		if (logger) {
			logger.log("setParentalRating", "rating from server is: " + rating);
		}

		if (!rating || rating === '') {
			rating = $U.core.Configuration.MAX_PARENTAL_RATING;
		}

		//rating is being returned as a string by localstorage, need to convert to number first
		rating = parseInt(rating, 10);
		getParentalControl().setUserRatingValue(rating);
		if (logger) {
			logger.log("setParentalRating", "Rating set to " + rating + " (" + getParentalControl().getRatingCodeForValue(rating) + " " + getParentalControl().getRatingDescriptionForValue(rating) + ")");
		}

		if (rating !== $U.core.Configuration.MAX_PARENTAL_RATING) {
			getParentalControl().enableAuthentication();
		} else {
			getParentalControl().disableAuthentication();
		}

		initialisationCallback();
	};

	/**
	 * Wrapper function for the JSFW call.<br>
	 * Will return true if the rating is not set, otherwise uses JSFW to check.
	 * @param {string} rating the value from the Asset wanting to see if it can show
	 * @return {boolean} true if the authentication is disabled or rating is higher than the rating chosen by the user
	 */
	var isRatingPermitted = function(rating) {
		return rating === undefined || rating === null || getParentalControl().isRatingPermitted(rating);
	};

	/**
	 * Check to see if the user has set a rating or not
	 * @return {boolean} true if the authentication is enabled
	 */
	var isLocked = function() {
		return getParentalControl().isAuthenticationEnabled();
	};

	/**
	 * Check to see if the user is about to unlock the ratings <br>
	 * i.e. choosing the max value from the list
	 * @return {boolean} true if the authentication is enabled
	 */
	var isUnlocking = function() {
		return getProposedRating() === $U.core.Configuration.MAX_PARENTAL_RATING;
	};

	/**
	 * Get the rating that is suitable for displaying to the user
	 * @return
	 */
	function getRatingForDisplay() {
		return getParentalControl().getRatingCodeForValue(getCurrentRating());
	}

	/**
	 * Take a rating and returns the correct rating object from configuration
	 */
	function _getRatingObjectForDisplayByRatingCode(ratingValue) {
		var i;
		for ( i = 0; i < arryOfKeys.length; i++) {
			if (ratingValue <= arryOfKeys[i]) {
				return parentalKeys[arryOfKeys[i]];
			}
		}
		//if no match - assume it's a top rated
		return parentalKeys[arryOfKeys[arryOfKeys.length - 1]];
	}

	/**
	 * Get the proposed rating that is suitable for displaying to the user
	 * @return
	 */
	function getProposedRatingForDisplay() {
		return getParentalControl().getRatingCodeForValue(getProposedRating());
	}

	/**
	 * Validates the password from the password dialog
	 * @param {Object} password the password entered into the password dialog
	 */
	var validateInput = function(password) {
		var result = false;
		passwordState = STATE_PASSWORD_NG;

		$U.core.store.Store.getItem("password", function(pwd) {
			if (password === pwd) {
				passwordState = STATE_PASSWORD_OK;
			} else {
				passwordState = STATE_PASSWORD_NG;
			}
			passwordPopupCloseCallback();
		});
	};

	/**
	 * Callback on closing the password popup, after checking the password
	 * puts the rating into storage if password OK otherwise shows the password dialog again with an error message
	 * @private
	 */
	function passwordPopupCloseCallback() {
		if (passwordState === STATE_PASSWORD_OK) {
			if (!$U.core.Device.isPhone()) {
				$U.core.View.hideDialog();
			}
			currentRating = getCurrentRating();
			$U.core.parentalcontrols.ParentalControlsDialog.setParentalRating();
		} else if (passwordState === STATE_PASSWORD_NG) {
			$U.core.View.getDialog().clearPasswordFields();
			$U.core.View.getDialog().showSecondaryMessage();
		}
	}

	/**
	 * callback used when the rating has been successfully sent to the server
	 */
	function ratingSuccessfullySet() {
		if (logger) {
			logger.log("ratingSuccessfullySet", "Rating sent to server " + proposedRating);
			logger.timeStampLog("CHANGED THE PARENTAL RATING TO :" + proposedRating);
		}
		$U.core.RefreshApplication.refresh();
	}

	/**
	 * Callback used when the rating has failed to be set on the server
	 */
	function ratingNotSet() {
		if (logger) {
			logger.log("ratingNotSet", "Rating failed to send to server " + proposedRating);
		}
		
		var header = $U.core.View.getHeader();
		header.removeAllButtonsFromTop();
		$U.core.ConnectionChecker.warnIfNoNetworkConnection(function(status) {
			header.restoreAllButtonsToTop();
			// Set rating back to current one if anything has gone wrong.
			$U.core.parentalcontrols.ParentalControls.getParentalControl().setUserRatingValue(currentRating);
			$U.core.widgets.PageLoading.hide("$U.core.parentalcontrols.ParentalControlsDialog");
			if (status) { // status true = Network present, something else has gone wrong when setting value - trigger warning.
				$U.core.parentalcontrols.ParentalControlsDialog.showFailureDialog();
			} else {
				$U.core.parentalcontrols.ParentalControlsDialog.deactivate(); // Cleans up header bar active state if Network Failure Dialog called.
			}	
		});
	}

	function getRatingImgCSSClass(rating) {
		return _getRatingObjectForDisplayByRatingCode(rating).imgCSSClass;
	}

	return {
		initialise : initialise,
		showMenu : showMenu,
		getCurrentRating : getCurrentRating,
		setProposedRating : setProposedRating,
		isUnlocking : isUnlocking,
		isRatingPermitted : isRatingPermitted,
		isLocked : isLocked,
		validateInput : validateInput,
		getRatingForDisplay : getRatingForDisplay,
		getProposedRatingForDisplay : getProposedRatingForDisplay,
		getProposedRating : getProposedRating,
		ratingSuccessfullySet : ratingSuccessfullySet,
		ratingNotSet : ratingNotSet,
		getParentalControl : getParentalControl,
		getRatingImgCSSClass : getRatingImgCSSClass
	};

}());
