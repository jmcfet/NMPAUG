/**
 * @class $U.mediaCard.MediaCardPurchaseWorkflow
 * Workflow of VOD purchases
 */
var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardPurchaseWorkflow = ( function() {

	var media;

	/**
	 * Initialises the password popup
	 * @param {string} title at top of the dialog
	 * @param {string} message message to prompt the user
	 * @param {Function} purchaseWorkflowCallback callback used to continue the flow
	 * @param {Object} contentTechnicalItems the items that could be bought
	 * @param {Object} contentTechnicalAsset the details about the asset
	 */

	function showPurchaseOptions(mediaItem) {
		media = mediaItem;
		$U.mediaCard.MediaCardPurchaseDialog.showPurchaseOptions(purchaseOptionsCallBack, mediaItem);
	}

	/**
	 * Callback for the purchase options dialog
	 */
	function purchaseOptionsCallBack(elements, mediaItem) {
		var btn = elements[0].buttonClicked;
		var productId;
		var l = elements.length;
		var i;

		media = mediaItem;

		switch (btn) {
		case "submit-product" :
			for ( i = 0; i < l; i++) {
				if (elements[i].type === "INPUT" && elements[i].checked) {
					productId = elements[i].value;
				}
			}
			$U.core.View.hideDialog();
			$U.mediaCard.MediaCardPurchaseDialog.showPasswordDialog(function(interactiveEl) {
				passwordCallback(interactiveEl, productId);
			}, media, productId);
			break;
		case "cancel" :
			$U.core.View.hideDialog();
		}
	}

	function purchaseSuccessCallback() {
		var purchaseSuccess = function () {
			//Set the acl state for this item to failed
			$U.mediaCard.MediaCardController.setAssetState($U.mediaCard.MediaCardController.ASSET_STATE.AVAILABLE);
			// Refresh the ACL
			$N.services.sdp.AcquiredContent.refresh();
		};
		
		// Story B-01328: The WLA will have a configuration object that will allow an operator to specify which activities they would like to store. 
		if ($U.core.Configuration.recordUserActivity("PURCHASE")) {
			//register the purchase in the UAV		
			$U.core.menudata.ContentDiscovery.recordUserActivity(purchaseSuccess, $U.core.Configuration.CDG_USER_ACTIVITIES.PURCHASE, media);
		} else {
			purchaseSuccess();
		}
	}

	/**
	 * Subscribes the use to a particular offer of an asset
	 * @param {Function} callback used to continue the flow, when the subscription has been completed successfully
	 * @param {Object} contentTechnicalItems the items that could be bought
	 * @param {Object} contentTechnicalAsset the details about the asset
	 * @private
	 */
	function passwordSuccessCallback(id, successCallback, failureCalback) {
		$N.services.sdp.VOD.subscribeToPolicyGroup(id, this, successCallback, failureCalback);
	}

	/**
	 *
	 */
	function purchaseFailureCallback() {
		$U.core.ConnectionChecker.refreshIfNoNetworkConnection(function(){
			//Set the acl state for this item to failed
			$U.mediaCard.MediaCardController.setAssetState($U.mediaCard.MediaCardController.ASSET_STATE.FAILED);
			// Refresh the ACL
			$N.services.sdp.AcquiredContent.refresh();
		});
	}

	/**
	 * Call back for the purchase error dialog
	 */
	function purchaseErrorDialogCallback(elements) {
		var btn = elements[0].buttonClicked;
		switch (btn) {
		case "retry-purchase" :
			// Hide the dialog
			$U.core.View.hideDialog();
			// Restart the purchase workflow
			$U.mediaCard.MediaCardController.intialisePurchaseWorkFlow(media);
			break;
		case "cancel" :
			// Just hide the dialog
			$U.core.View.hideDialog();
			break;
		}
	}

	/**
	 * Callback for the password dialog
	 */
	function passwordCallback(elements, productId) {
		var btn = elements[0].buttonClicked;
		var input = {};
		var l = elements.length;
		var i;

		switch (btn) {
		case "cancel" :
			$U.core.View.hideDialog();
			break;
		default :
			for ( i = 0; i < l; i++) {
				if (elements[i].type === "INPUT" || elements[i].type === "PASSWORD") {
					if (elements[i].value) {
						input[elements[i].name] = elements[i].value;
					}
				}
			}
			if (input.password) {
				$U.core.store.Store.getItem("password", function(pwd) {
					if (input.password === pwd) {
						$U.core.widgets.PageLoading.show("purchase");
						$U.core.View.hideDialog();
						passwordSuccessCallback(productId, purchaseSuccessCallback, purchaseFailureCallback);
					} else {
						$U.core.View.getDialog().clearPasswordFields();
						$U.core.View.getDialog().showSecondaryMessage();
					}
				});
			}
			break;
		}
	}

	return {
		showPurchaseOptions : showPurchaseOptions,
		purchaseOptionsCallBack : purchaseOptionsCallBack,
		purchaseErrorDialogCallback : purchaseErrorDialogCallback
	};

}());
