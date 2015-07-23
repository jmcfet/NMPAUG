/**
 * Wrapper for handling the removal of an asset from the favourites category
 * @class $U.core.category.favourites.FavouritesRemoveDialog
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};

$U.core.category.favourites.FavouritesRemove = ( function() {

	// String bundle keys
	var OK_BTN_KEY = "txtOK";
	var CANCEL_BTN_KEY = "txtCancel";
	var REMOVE_TITLE_KEY = "txtRemove";
	var REMOVE_MESSAGE_KEY = "txtRemoveMessage";

	var deleteAsset;

	/**
	 * Shows the confirmation dialog for a removal
	 * @param {Object} evt - the event that gets fired
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item to remove
	 * @private
	 */
	var showRemoveDialog = function(evt, mediaItem) {
		// prevent the event from propagation
		evt.stopPropagation();
		if (!$U.core.View.getCanRemoveFavourite()) {
			return;
		}
		// update the deleteAsset var so that the dialogHandler can use it
		deleteAsset = mediaItem;
		// show the dialog with the correct configuration
		$U.core.View.showDialog(getRemoveFavouriteDialog(mediaItem), dialogHandler);
	};

	/**
	 * Performs the actual removal of the mediaItem from the favourites category
	 * @param {$U.core.mediaitem.MediaItem} mediaItem - the item to remove
	 * @private
	 */
	var handleRemove = function(mediaItem) {
		// Remove the mediaItem from the favourites
		$U.core.category.favourites.Favourites.toggleFav(mediaItem, removeFromFavCallback);
		// Remove the asset from the scroller
		$U.core.View.removeItemFromBrowseScreen(mediaItem);
		// show the loading animation during the removal of the mediaItem
		$U.core.View.setCanRemoveFavourite(false);
		$U.core.widgets.PageLoading.show("ImageAssetTile");
	};

	/**
	 * Hides the loading animation after successfully removing the media item from favourtie's
	 * @private
	 */
	var removeFromFavCallback = function() {
		$U.core.View.setCanRemoveFavourite(true);
		$U.core.widgets.PageLoading.hide("ImageAssetTile");
		$U.mediaCard.MediaCardController.updateCtab();
	};

	/**
	 * Configuration object for the dialog
	 * @param {$U.core.mediaitem.MediaItem} mediaItem
	 * @return {Object}
	 */
	var getRemoveFavouriteDialog = function(mediaItem) {
		return {
			title : $U.core.util.StringHelper.getString(REMOVE_TITLE_KEY),
			message : $U.core.util.StringHelper.getString(REMOVE_MESSAGE_KEY, {
				TITLE : mediaItem.title
			}),
			modal : true,
			buttons : [{
				text : $U.core.util.StringHelper.getString(OK_BTN_KEY),
				name : "ok",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString(CANCEL_BTN_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};

	/**
	 * The handler function for the dialog
	 * @param {Object} interactiveElements - the elements on the dialog that can be interacted with
	 */
	var dialogHandler = function(interactiveElements) {
		var inputObj = {};
		switch (interactiveElements[0].buttonClicked) {
		case "cancel" :
			// no thanks just hide the dialog
			$U.core.View.hideDialog();
			break;
		case "ok" :
			// user has confirmed that they would like to remove the assert
			handleRemove(deleteAsset);
			// Hide the dialog
			$U.core.View.hideDialog();
			break;
		}
	};

	return {
		showRemoveDialog : showRemoveDialog
	};

}());
