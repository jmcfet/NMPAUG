var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};
$U.mediaCard.StarRatingDialog = ( function() {
	/**
	 * @class $U.mediaCard.StarRatingDialog
	 * the dialog used to set a Star Rating for a piece of content
	 */
	var dialogConfiguration = {},
		STATE_STAR_RATING_ERROR = {},
		DIALOG_TYPE = $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC,
		logger = $U.core.Logger.getLogger("StarRatingDialog"),
		throwStatus = {
			state : {},
			error : ""
		},
		rating,
		mediaItem,
		callingContext,
		changeRatingListener = function () {},
		DATA_ATTRIBUTE = "data-star-number";

	/**
	 * This sends the rating up to the rating service
	 * @param  {$U.core.mediaitem.MediaItem} mediaItem the piece of content to be rated
	 */
	var _sendRating = function(mediaItem) {
		if (rating === null) {
			$U.core.View.hideDialog();
		} else {
			//do the special stuff here
			$U.core.menudata.ContentDiscovery.setRatingByAccount(mediaItem, rating);
			$U.core.View.hideDialog();
			changeRatingListener.call(callingContext, rating);
		}
	};

	/**
	 * The function run when a button is pressed
	 * if it's in the list the asset will be thrown, otherwise the dialog just closes
	 * @param {Object} interactiveElements the things on the dialog
	 * @param {Object} mediaItem the item to throw to the device
	 */
	var dialogCallback = function(interactiveElements, mediaItem) {
		var clicked = interactiveElements[0].buttonClicked;
		if (clicked === "sendRating") {
			_sendRating(mediaItem);
		} else {
			$U.core.View.hideDialog();
		}
	};

	/**
	 * Sets the rating to be sent.
	 */
	var _setRating = function(newRating) {
		var star,
			i;
		for ( i = 0; i < 5; i++) {
			star = document.querySelectorAll("[" + DATA_ATTRIBUTE + "='" + i + "']");
			if (i <= newRating) {
				star[0].className = "icon-star icon-2x dialog-star";
			} else {
				star[0].className = "icon-star-empty icon-2x dialog-star";
			}
		}
		rating = newRating + 1;
	};

	var _retrieveAndSetRating = function(evt) {
		var newRating = parseInt(evt.currentTarget.getAttribute(DATA_ATTRIBUTE), 10);
		_setRating(newRating);
	};

	var _getStarDomEl = function(mediaItem) {
		var starContainer = $U.core.util.DomEl.createDiv().setClassName("dialog-star-rating"),
			stars = 5,
			starEl,
			i;
		for (i = 0; i < stars; i++) {
			if (i <= mediaItem.starRating - 1 || 0) {
				starEl = $U.core.util.DomEl.createDiv().setClassName("icon-star icon-2x dialog-star").asElement();
			} else {
				starEl = $U.core.util.DomEl.createDiv().setClassName("icon-star-empty icon-2x dialog-star").asElement();
			}
			starEl.setAttribute(DATA_ATTRIBUTE, i);
			starEl.addEventListener('click', _retrieveAndSetRating, false);
			starContainer.appendChild(starEl);
		}
		return starContainer;
	};

	/**
	 * sets the configuration for the dialog
	 * adds the devices in to the list, gives a back button and title
	 * @private
	 */
	var _setDialogConfiguration = function(mediaItem) {
		dialogConfiguration = {
			title : $U.core.util.StringHelper.getString("txtRateThis"),
			message : $U.core.util.StringHelper.getString("txtRateContent", {CONTENT_NAME:mediaItem.title}),
			type : DIALOG_TYPE,
			modal : true,
			domElement : _getStarDomEl(mediaItem),
			buttons : [{
				text : $U.core.util.StringHelper.getString("txtRate"),
				name : "sendRating",
				icon : {
					iconClass : "icon-ok-sign",
					iconPos : "left"
				}
			}, {
				text : $U.core.util.StringHelper.getString("txtNoThanks"),
				name : "close",
				icon : {
					iconClass : "icon-remove-sign",
					iconPos : "left"
				}
			}]
		};
	};

	var registerRatingChangeListener = function(context, changeRatingFunction) {
		callingContext = context;
		changeRatingListener = changeRatingFunction;
	};

	/**
	 * populates and shows the throw dialog
	 * @param {Object} callingObject the object calling the dialog
	 */
	var show = function(mediaItem) {
		rating = null;
		_setDialogConfiguration(mediaItem);
		$U.core.View.showDialog(dialogConfiguration, dialogCallback, mediaItem);
	};

	return {
		registerRatingChangeListener : registerRatingChangeListener,
		show : show
	};

}());
