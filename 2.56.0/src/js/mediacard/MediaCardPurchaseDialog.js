$U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardPurchaseDialog = ( function() {

	/**
	 * @class $U.mediaCard.MediaCardPurchaseDialog
	 * Contains configuration object for purchase workflow dialogs and their associated handlers
	 */

	var SUBMIT_BTN_KEY = "txtSubmit";
	var CANCEL_BTN_KEY = "txtCancel";
	var RETRY_BTN_KEY = "txtRetry";

	var OPTION_LABEL_KEY = "txtPurchaseOptionLabel";
	var OPTION_MESSAGE_KEY = "txtPurchaseOptionsMessage";

	var PASSWORD_INPUT_PLACEHOLDER_KEY = "txtPassword";
	var PASSWORD_MESSAGE_KEY = "txtPurchasePasswordMessage";

	var PASSWORD_ERROR_TXT_KEY = "txtPasswordIncorrect";
	var PASSWORD_ERROR_MSG_KEY = "txtPasswordErrorMessage";

	var SERVER_ERROR_TXT_KEY = "txtServerError";
	var SERVER_ERROR_MSG_KEY = "txtServerErrorMessage";

	var ALREADY_PURCHASED_TITLE_KEY = "txtAlreadyPurchasedTitle";
	var ALREADY_PURCHASED_KEY = "txtAlreadyPurchased";

	var DIALOG_TYPE = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC;

	var DIALOG_CLASS = $U.core.Device.isPhone() ? "dialog-fullscreen purchase-dialog" : "dialog";

	var media;
	var prdtID;

	/**
	 * Helper function to get strings from language bundle
	 *
	 * @param {String} key
	 */
	function getString(key, varObject) {
		return $U.core.util.StringHelper.getString(key, varObject || {});
	}

	/**
	 * Configuration for the password dialog
	 * @param {String} errorText optional error message to show if the password was incorrect initially
	 * @return {Object} dialogConfig
	 */
	var getPasswordDialog = function(errorText) {
		var product = media.getPurchaseOption(prdtID);
		var message = getPasswordMessage(product);
		var fields = [];

		fields.push({
			name : "password",
			type : "password",
			placeholder : getString(PASSWORD_INPUT_PLACEHOLDER_KEY),
			required : true
		});

		return {
			title : media.title,
			message : message,
			secondaryMessage : errorText,
			type : DIALOG_TYPE,
			dialogClass : DIALOG_CLASS,
			modal : true,
			form : {
				fields : fields
			},
			buttons : [{
				text : getString(SUBMIT_BTN_KEY),
				name : "purchase-asset",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : getString(CANCEL_BTN_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * Builds the message for the password dialog
	 * @private
	 * @param {Object} product Item that is being used for message details
	 * @return {String} The customised message string
	 */
	var getPasswordMessage = function(product) {
		var p = product;

		var varObject;

		if (!p.description) {
			varObject = {
				TITLE : p.title,
				DEFINITION : p.definition,
				CURRENCY : getString(p.currency),
				PRICE : p.price,
				DURATION : $U.core.util.Formatter.formatMinutesToHours(p.duration)
			};
		}

		return getString(PASSWORD_MESSAGE_KEY, varObject);
	};

	/**
	 * Builds the purchase options dialog
	 * @private
	 */
	var getPurchaseOptionsDialog = function() {
		var products = media.purchaseOptions;
		var fields = [];
		var inputObj;
		var l = products.length;
		var i;

		function createLabel(product) {
			var varObject = {};

			varObject.DEFINITION = product.definition ? product.definition : "";
			varObject.DURATION = product.duration ? $U.core.util.Formatter.formatMinutesToHours(product.duration) : "";
			varObject.CURRENCY = getString(product.currency);
			varObject.PRICE = product.price ? product.price : "";

			return getString(OPTION_LABEL_KEY, varObject);
		}

		for ( i = 0; i < l; i++) {
			inputObj = {};
			inputObj.name = "option";
			inputObj.type = "radio";
			inputObj.label = createLabel(products[i]);
			inputObj.value = products[i].id;
			inputObj.id = i;
			inputObj.checked = (i === 0) ? true : false;
			fields.push(inputObj);
		}
		return {
			title : media.title,
			message : getString(OPTION_MESSAGE_KEY),
			modal : true,
			type : DIALOG_TYPE,
			dialogClass : DIALOG_CLASS,
			form : {
				fields : fields
			},
			buttons : [{
				text : getString(SUBMIT_BTN_KEY),
				name : "submit-product",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : getString(CANCEL_BTN_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * Password dialog handler function
	 * @param {Object} interactiveElements elements that are on the dialog
	 * @param {Object} owner Owner object (most likely its caller)
	 */
	var passwordDialogHandler = function(interactiveElements, owner) {
		var inputObj = {};
		switch (interactiveElements[0].buttonClicked) {
		case "cancel" :
			owner.purchaseWorkflowState = null;
			$U.core.View.hideDialog();
			break;
		default :
			for (var i = 0; i < interactiveElements.length; i++) {
				if (interactiveElements[i].type === "INPUT" || interactiveElements[i].type === "PASSWORD") {
					if (interactiveElements[i].value) {
						inputObj[interactiveElements[i].name] = interactiveElements[i].value;
					}
				}
			}
			if (interactiveElements[i].value) {
				owner.validateInput(inputObj);
			}
			break;
		}
	};

	/**
	 * Configuration for the error dialog
	 * @param {String} title shown at the top of dialog
	 * @param {String} message shown in the main part of the dialog
	 * @return {Object} dialogConfig used to layout the dialog
	 */
	var getPurchaseErrorDialog = function() {
		return {
			title : getString(SERVER_ERROR_TXT_KEY),
			message : getString(SERVER_ERROR_MSG_KEY),
			modal : true,
			buttons : [{
				text : getString(RETRY_BTN_KEY),
				name : "retry-purchase",
				icon : {
					iconClass : "icon-shopping-cart",
					iconPos : "left"
				}
			}, {
				text : getString(CANCEL_BTN_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-check",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * Show password dialog
	 * @param {String} title shown at the top of dialog
	 * @param {String} message shown in the main part of the dialog
	 * @param {Object} owner Owner object (most likely its caller)
	 */
	var showPasswordDialog = function(callback, mediaItem, productId) {
		prdtID = productId;
		$U.core.View.showDialog(getPasswordDialog(getString(PASSWORD_ERROR_MSG_KEY)), callback);
	};

	/**
	 * Show Error dialog
	 * @param {String} title shown at the top of dialog
	 * @param {String} message shown in the main part of the dialog
	 * @param {Object} owner Owner object (most likely its caller)
	 */
	var showPurchaseErrorDialog = function(callback) {
		$U.core.View.showDialog(getPurchaseErrorDialog(), callback);
	};

	var showPurchaseOptions = function(callback, mediaItem) {
		media = mediaItem;
		$U.core.View.showDialog(getPurchaseOptionsDialog(), callback);
	};

	var showAssetAlreadyPurchasedDialog = function(callback) {
		// Grab the strings for the dialog
		var alreadyPurchasedTitle = $U.core.util.StringHelper.getString(ALREADY_PURCHASED_TITLE_KEY);
		var alreadyPurchasedMsg = $U.core.util.StringHelper.getString(ALREADY_PURCHASED_KEY);
		// Show a generic dialog telling the user that the asset has already been purchased
		$U.core.View.showDialog($U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(alreadyPurchasedTitle), alreadyPurchasedMsg), $U.core.View.hideDialog);
	};

	return {
		showPasswordDialog : showPasswordDialog,
		showPurchaseOptions : showPurchaseOptions,
		showPurchaseErrorDialog : showPurchaseErrorDialog,
		showAssetAlreadyPurchasedDialog : showAssetAlreadyPurchasedDialog
	};

}());
