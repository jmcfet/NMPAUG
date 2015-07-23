/**
 * Object that represents a dialog to handle the application settings menu
 * @class $U.settings.AppSettings
 *
 * Object that represents a dialog to handle the application settings menu. This allows a user to interact with the application
 * settings through a dialog menu system
 * @singleton
 */

var $U = $U || {};
$U.settings = $U.settings || {};
$U.settings.AppSettings = ( function() {

	/**
	 * convenience function to start the flow, gets the currentRating and uses this to populate/show the parental control dialog
	 */
	var showMenu = function() {
		$U.settings.AppSettingsDialog.showDialog(this);
	};

	/**
	 * Used if the process is cancelled before completion, returns the UI back to the original state
	 * Sets the state of the header icon, removes the highlight
	 */
	var deactivate = function() {
		var header = $U.core.View.getHeader();
		if (header.removeHighlightSettingsButton) {
			header.removeHighlightSettingsButton();
		}
		$U.core.View.hideDialog();
	};

	return {
		showMenu : showMenu,
		deactivate : deactivate
	};

}());
