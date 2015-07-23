var $U = $U || {};
$U.core = $U.core || {};
$U.core.JoinIn = ( function() {

	/**
	 * @class $U.core.JoinIn
	 * Hub class that handles context management and browse functionality
	 */
	var logger = $U.core.Logger.getLogger("JoinIn");
	//var catalogueMenu;
	var currentContext = "signon";
	var addFeatured = true;
	var backContexts = [];
	var SEARCH_ICON = "search";
	var UNLOCK_ICON = "unlock";
	var COG_ICON = "cog";

	$N.apps.util.JSON = JSON;

	//jQuery entry point on page load
	$(function(evt) {

		$N.platform.system.Preferences.initialise();

		// $U.mediaCard.MediaCardScreen.init("mediaCard");

		// Wire up the window resize handler
		$(window).on('resize', evt, function() {
			$U.core.View.resizeHandler(evt, currentContext);
		});

		$(document).ready(function() {

			// Let $Startup know that the page has loaded
			//window.onPageAvailable();

			/*  Support for iOS fast clicks - experimental */
			/* this messes up the grid on the mediacard for android phones */
			$U.core.JoinIn.fastClick = new FastClick(document.body);

			// Disable right-click in production mode
			if ($U.core.Configuration.PRODUCTION_MODE) {
				document.addEventListener("contextmenu", function(e) {
					e.preventDefault();
				}, false);
			}

			window.scrollTo(0, 1);

		});
	});

	return {};

}());

