var $U = $U || {};
$U.core = $U.core || {};
$U.core.parentalcontrols = $U.core.parentalcontrols || {};

$U.core.parentalcontrols.ParentalControlsDialog = ( function() {
	/**
	 * @class $U.core.parentalcontrols.ParentalControlsDialog
	 * Simple class that hold the config for the parental controls Dialogs
	 * 1) list of available ratings
	 * 2) password input/verification
	 */
	var logger = $U.core.Logger.getLogger("ParentalControlsDialog");
	
	// String bundle keys
	var PASSWORD_INPUT_PLACEHOLDER_KEY = "txtPassword";
	var PARENTAL_CONTROL_HEADING_KEY = "txtParentalControlsHeading";
	var PARENTAL_CONTROL_TURN_OFF_KEY = "txtParentalTurnOffPrompt";
	var PARENTAL_CONTROL_CHANGE_KEY = "txtParentalChangePrompt";
	var PARENTAL_CONTROL_PASSWORD_PROMPT = "txtParentalPasswordPrompt";
	var PARENTAL_CONTROL_PASSWORD_REQ_KEY = "txtPasswordRequired";
	var PARENTAL_CONTROL_SUBMIT_KEY = "txtSubmit";
	var PARENTAL_CONTROL_CANCEL_KEY = "txtCancel";
	var PARENTAL_CONTROL_COMPLETE_KEY = "txtParentalComplete";
	var PARENTAL_CONTROL_OK_KEY = "txtOK";
	var PARENTAL_CONTROL_FAILURE_KEY = "txtParentalFailure";
	var PARENTAL_CONTROL_FAILURE_TITLE_KEY = "txtParentalFailureTitle";
	var REFRESH_APPLICATION_TITLE_KEY = "txtRefreshApplicationTitle";
	

	//this needs to be uppercase!
	var SERVER_KEY = "PARENTAL_RATING";

	// Configuration values for Dialog
	var DIALOG_POSITION = "defaultToolbar";
	var DIALOG_TYPE = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.SETTINGS;
	var DIALOG_TYPE_FAILURE = $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN;
	var DIALOG_MODAL = true;

	var currentRating;
	/**
	 * Configuration for the rating dialog, gets available ratings and ticks the one that is currently selected
	 * @private
	 * @return {Object} the rating dialog configuration
	 */
	var _getRatingDialogConfiguration = function() {
		var ratings = $N.platform.ca.ParentalControl.getRatingLookUp();
		var mappedRatings = [];
		for (var prop in ratings) {
			if (ratings.hasOwnProperty(prop) && (!$U.core.Configuration.HIDE_PARENTAL_RATINGS || $U.core.Configuration.HIDE_PARENTAL_RATINGS.indexOf(prop) === -1)) {
				mappedRatings.push({
					text : ratings[prop].ratingCode !== "" ? "(" + ratings[prop].ratingCode + ") " + ratings[prop].description : ratings[prop].description,
					name : prop,
					icon : currentRating === parseInt(prop, 10) ? "icon-check" : "icon-check-empty"
				});
			}

		}
		return {
			title : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_HEADING_KEY),
			type : DIALOG_TYPE,
			position : DIALOG_POSITION,
			modal : DIALOG_MODAL,
			listItems : mappedRatings
		};
	};

	/**
	 * Rating dialog handler function
	 * If a change is made sets the proposed rating and shows the password dialog
	 * otherwise just closes
	 * @private
	 * @param {Object} interactiveElements all the clickable list items
	 * @param {Object} owner
	 */
	var ratingDialogCallback = function(interactiveElements, owner) {
		if (!$U.core.Device.isPhone()) {
			$U.core.View.hideDialog();
		}
		if (interactiveElements[0].buttonClicked && parseInt(interactiveElements[0].buttonClicked, 10) !== currentRating) {
			owner.setProposedRating(interactiveElements[0].buttonClicked);
			showPasswordDialog(owner, $U.core.util.StringHelper.getString("txtPasswordErrorMessage"));
		} else {
			if ($U.core.Device.isPhone()) {
				$U.core.Options.goBack();
			} else {
				deactivate();
			}
		}
	};

	/**
	 * Configuration for the password dialog, the main message is calculated based on what is the user is trying to do
	 * @private
	 * @param {string} [errorText] the prompt to the user
	 * @return {Object} the password dialog configuration
	 */
	var _getPasswordDialogConfiguration = function(errorText) {
		var message;
		if ($U.core.parentalcontrols.ParentalControls.isUnlocking()) {
			message = $U.core.util.StringHelper.getString(PARENTAL_CONTROL_TURN_OFF_KEY);
		} else {
			message = $U.core.util.StringHelper.getString(PARENTAL_CONTROL_CHANGE_KEY) + $U.core.parentalcontrols.ParentalControls.getProposedRatingForDisplay();
		}
		message += $U.core.util.StringHelper.getString(PARENTAL_CONTROL_PASSWORD_PROMPT);
		return {
			title : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_PASSWORD_REQ_KEY),
			message : message,
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE : null,
			position : DIALOG_POSITION,
			form : {
				fields : [{
					name : "password",
					type : "password",
					placeholder : $U.core.util.StringHelper.getString(PASSWORD_INPUT_PLACEHOLDER_KEY),
					required : true
				}]
			},
			buttons : [{
				text : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_SUBMIT_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			},
			//no cancel buttons for the full screen dialogs
			$U.core.Device.isPhone() ? null : {
				text : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_CANCEL_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}],
			secondaryMessage : errorText
		};
	};

	/**
	 * Password dialog handler function, does the validation for the password
	 * @private
	 * @param {Object} interactiveElements the elements on the dialog
	 * @param {Object} owner the object that called the dialog
	 */
	var passwordDialogCallback = function(interactiveElements, owner) {
		var inputPassword = "";
		switch (interactiveElements[0].buttonClicked) {
		case "cancel" :
			if ($U.core.Device.isPhone()) {
				$U.core.Options.goBack();
			} else {
				deactivate();
				$U.core.View.hideDialog();
			}
			break;
		default :
			for (var i = 0; i < interactiveElements.length; i++) {
				if (interactiveElements[i].type === "INPUT" || interactiveElements[i].type === "PASSWORD") {
					if (interactiveElements[i].value) {
						inputPassword = interactiveElements[i].value;
					}
				}
			}
			if (inputPassword) {
				owner.validateInput(inputPassword);
			}
			break;
		}
	};

	/**
	 * Configuration for the complete dialog
	 * @private
	 * @return {Object} the complete dialog configuration
	 */
	var _getCompleteDialogConfiguration = function() {
		return {
			title : $U.core.util.StringHelper.getString(REFRESH_APPLICATION_TITLE_KEY),
			message : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_COMPLETE_KEY),
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE : null,
			position : DIALOG_POSITION,
			buttons : [{
				text : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_OK_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString("txtCancel"),
				name : "close",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};
	
	/**
	 * Configuration for the failure dialog
	 * @private
	 * @return {Object} the failure dialog configuration
	 */
	var _getFailureDialogConfiguration = function() {
		return {
			title : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_FAILURE_TITLE_KEY),
			message : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_FAILURE_KEY),
			modal : DIALOG_MODAL,
			type : $U.core.Device.isPhone() ? DIALOG_TYPE_FAILURE : null,
			position : null,
			buttons : [{
				text : $U.core.util.StringHelper.getString(PARENTAL_CONTROL_OK_KEY),
				name : "submit",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * Sets the parental rating locally and on the server
	 */
	var setParentalRating = function(interactiveElements, owner) {
		if (logger) {
			logger.timeStampLog("CHANGING THE PARENTAL RATING");
		}
		if ($U.core.Device.isPhone()) {
			$U.core.View.goBack();
			$U.core.View.goBack();
			$U.core.View.goBack();
		}
		$U.core.widgets.PageLoading.show("$U.core.parentalcontrols.ParentalControlsDialog");
		$U.core.Preferences.set(SERVER_KEY, $U.core.parentalcontrols.ParentalControls.getProposedRating(), "Long", $U.core.parentalcontrols.ParentalControls.ratingSuccessfullySet, $U.core.parentalcontrols.ParentalControls.ratingNotSet, true);
	};
	
	var failDialogCallback = function(interactiveElements, owner) {
		$U.core.View.hideDialog();
		$U.core.parentalcontrols.ParentalControlsDialog.deactivate();
	};

	/**
	 * Show rating dialog
	 * @param {string} owner which class has called the dialog
	 * @param {string} currRating the currently selected rating
	 */
	var showRatingsDialog = function(owner, currRating) {
		currentRating = currRating;
		$U.core.View.showDialog(_getRatingDialogConfiguration(), ratingDialogCallback, owner);
	};

	/**
	 * Show password dialog
	 * @param {HTMLElement} owner which class has called the dialog
	 * @param {string} [errorText] the error message to display if the initial input was incorrect
	 */
	var showPasswordDialog = function(owner, errorText) {
		$U.core.View.showDialog(_getPasswordDialogConfiguration(errorText), passwordDialogCallback, owner);
		if ($U.core.Device.isPhone()) {
			//need to register that we're loading the password dialog
			$U.core.Options.showMenu($U.core.Options.MENUID.PARENTAL_PASSWORD);
		}
	};

	/** Displays the failure dialog after closing he parental controls dialogs
	 * 
	 */
	var showFailureDialog =  function() {		
		$U.core.View.showDialog(_getFailureDialogConfiguration(), failDialogCallback);
	};

	/**
	 * Used if the process is cancelled before completion, returns the UI back to the original state
	 * Sets the state of the header icon, removes the highlight and sets the icon to (un)locked
	 */
	var deactivate = function() {
		var header = $U.core.View.getHeader();
		if (header.removeHighlightParentalButton) {
			header.removeHighlightParentalButton();
		}
	};

	return {
		showRatingsDialog : showRatingsDialog,
		showPasswordDialog : showPasswordDialog,
		showFailureDialog : showFailureDialog,
		deactivate : deactivate,
		setParentalRating: setParentalRating
	};

}());
