var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};

$U.core.widgets.PageLoading = ( function() {

	/**
	 * Class that manages the page loading display
	 * @class $U.core.widgets.PageLoading
	 */
	var callers = new $U.core.util.SimpleSet();

	var overriden = false;

	/**
	 * Shows the pageloading animation
	 * @param {Function} callback optional callback function used to wait until UI has updated
	 * @private
	 */
	function doShow(callback) {
		$U.core.util.HtmlHelper.setDisplayBlock(document.getElementById("loadingAnimation"));
				
		// Set a callback to a callback!
		// This allows the UI to update to show the page loading message.
		if (callback) {
			window.setTimeout(function() {
				doCallback(callback);
			}, 0);
		}
	}

	/**
	 * Execute the callback (after an initial callback has beed handled in doShow)
	 * @private
	 */
	function doCallback(callback) {
		window.setTimeout(callback, 0);
	}

	/**
	 * Hides the pageloading animation
	 * @private
	 */
	function doHide() {
		$U.core.util.HtmlHelper.setDisplayNone(document.getElementById("loadingAnimation"));
	}

	return {

		/**
		 * Vote to show the PageLoading.
		 * The PageLoading will be show unless it's state is currently overridden.
		 * @param {Object} caller
		 * @param {Function} callback optional callback function used to wait until UI has updated
		 */
		show : function(caller, callback) {
			if (caller === undefined) {
				return;
			}
			callers.add(caller);
			if (!overriden) {
				doShow(callback);
			}
		},

		/**
		 * Vote to hide the PageLoading.
		 * The PageLoading may or may not be hidden immediately depending on whether
		 * there are other callers still voting to hide it.
		 * @param {Object} caller
		 */
		hide : function(caller) {
			if (caller === undefined) {
				return;
			}
			callers.remove(caller);
			if (callers.isEmpty()) {
				doHide();
			}
		},

		/**
		 *
		 * @param {boolean} hide whether or not to force the hide
		 */
		override : function(hide) {
			overriden = hide;
			if (overriden) {
				doHide();
			} else {
				if (!callers.isEmpty()) {
					doShow();
				}
			}
		},
		
		/**
		 * Hide all PageLoading.
		 */
		hideAll : function() {
			callers = new $U.core.util.SimpleSet();
			doHide();
		}		
	};

}());
