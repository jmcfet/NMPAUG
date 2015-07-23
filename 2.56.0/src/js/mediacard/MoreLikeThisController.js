/**
 * MoreLikeThisController is responsible for the creation of MoreLikeThis widgets. It also handles displaying
 * and hiding the widgets depending on application context. Handles messaging between other screen elements and
 * the MoreLikeThis widgets.
 * @class $U.mediaCard.MoreLikeThisController
 * @singleton
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MoreLikeThisController = ( function() {
	var categoryMlt,
		btvMlt,
		activeMlt,
		MLS_WIDGETS = {
			CATEGORY: "CAT_MLS",
			BTV: "BTV_MLS"
		};

	/**
	 * Initialises the controller by creating the different MoreLikeThis widgets that the
	 * application will use.
	 * @param {HTMLElement} catMls Category more Like this container element.
	 * @param {HTMLElement} btvMls BTV more Like this container element.
	 */
	function initialise (catMlsEl, btvMlsEl) {
		categoryMlt = $U.mediaCard.MoreLikeThis.create(MLS_WIDGETS.CATEGORY, catMlsEl);
		btvMlt = $U.mediaCard.MoreLikeThis.create(MLS_WIDGETS.BTV, btvMlsEl);
	}

	/**
	 * Resizes the currently active MoreLikeThis widget
	 */
	function resizeMlt() {
		if (activeMlt) {
			activeMlt.resizeHandler();
		}
	}

	/**
	 * Sets the height of the currently active MoreLikeThis widget
	 * @param {Number} height to set the widget to
	 */
	function setHeight(height) {
		if (activeMlt) {
			activeMlt.setHeight(height);
		}
	}
	/**
	 * Gets the next item in the currently active MoreLikeThis widget
	 * @param {Object} currently selected item in mlt
	 */
	function getNextItemInMlt(item) {
		if (activeMlt) {
			return activeMlt.getNextItem(item);
		}
	}

	/**
	 * Shows the requested MoreLikeThis widget and populates it with the provided
	 * assets
	 * @param {Array} assets Assets to populate in the widget
	 * @param {String} type the type of the MoreLikeThis widget to display
	 */
	function showMoreLikeThis(assets, type) {
		switch (type) {
		case MLS_WIDGETS.CATEGORY:
			activeMlt = categoryMlt;
			break;
		case MLS_WIDGETS.BTV:
			activeMlt = btvMlt;
			break;
		}

		if (activeMlt) {
			activeMlt.populateAssets(assets);
			activeMlt.show();
		}
	}

	/**
	 * Updates the current MoreLikeThis widget based on the provided MediaCardAsset
	 * @param {Object} mediaCardAsset the current mediaCardAsset
	 */
	function updateMlt(mediaCardAsset) {
		if (activeMlt) {
			activeMlt.update(mediaCardAsset);
		}
	}

	/**
	 * Hides the currently active MoreLikeThis widget
	 */
	function hideMoreLikeThis() {
		if (activeMlt) {
			activeMlt.hide();
			activeMlt = null;
		}
	}

	return {
		initialise: initialise,
		resizeMlt: resizeMlt,
		setHeight: setHeight,
		updateMlt: updateMlt,
		getNextItemInMlt: getNextItemInMlt,
		showMoreLikeThis: showMoreLikeThis,
		hideMoreLikeThis: hideMoreLikeThis,
		MLS_WIDGETS: MLS_WIDGETS
	};
}());
