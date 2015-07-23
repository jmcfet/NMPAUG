/**
 * @class $U.core.version.VersionDialog
 * Simple class that hold the config for a version Dialog
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.version = $U.core.version || {};

$U.core.version.VersionDialog = ( function() {

	// String bundle keys
	var INFORMATION_KEY = "txtInformation";
	var USERNAME_KEY = "txtAboutUserName";
	var UIVERSION_KEY = "txtAboutUIVersion";
	var JSFWVERSION_KEY = "txtAboutJSFWVersion";	
	var NMPVERSION_KEY = "txtAboutNMPVersion";	
	var SDPVERSION_KEY = "txtAboutSDPVersion";
	var LOCATION_KEY = "txtAboutLocation";
	var USERAGENT_KEY = "txtAboutUserAgent";
	var NETWORK_KEY = "txtAboutNetwork";

	// The JSFW version set at UI build time
	var buildJSFW = $U.core.version.Version.JSFW_VERSION;

	// The JSFW version reported at run time
	var reportedJSFW = $N.apps.core.Version.ninja;

	// Include the build version if different from reported
	var includeBuildJSFW = buildJSFW !== reportedJSFW;

	// The JSFW version string to display, including the UI build version if different
	// to the reported version
	var jsfwVersion = reportedJSFW + ( includeBuildJSFW ? "<br>[ui build " + buildJSFW + "]" : "");

	// Configuration for the Version dialog
	var versionDialogConfiguration = null;

	/**
	 * Show Version dialog
	 */
	function show() {
		
		var message;
		var i, l;
		var info = [];
		info.push([$U.core.util.StringHelper.getString(USERNAME_KEY), $U.core.signon.SignOn.getUserCredentials().username]);
		info.push([$U.core.util.StringHelper.getString(UIVERSION_KEY), $U.core.version.Version.UI_VERSION]);
		info.push([$U.core.util.StringHelper.getString(JSFWVERSION_KEY), jsfwVersion]);
		info.push([$U.core.util.StringHelper.getString(NMPVERSION_KEY), $N.apps.core.Version.nmp]);
		info.push([$U.core.util.StringHelper.getString(SDPVERSION_KEY), $N.apps.core.Version.sdp]);
		// RegExp inserts zero-width space characters to allow the browser to word wrap on / slashes /
		info.push([$U.core.util.StringHelper.getString(LOCATION_KEY), window.location.href.replace(/\//g,"\/&#8203;")]);
		info.push([$U.core.util.StringHelper.getString(USERAGENT_KEY), window.navigator.userAgent]);
		if (window.navigator.connection !== undefined) {
			info.push([$U.core.util.StringHelper.getString(NETWORK_KEY), window.navigator.connection.type]);
		}
		
		message = "";
		l = info.length;
		for (i = 0; i < l; i++) {
			message += ("<p class=\"dialog-version-info\">" + info[i][0] + ":<br>" + info[i][1] + "</p>"); 
		}
		
		$U.core.View.showDialog($U.core.widgets.dialog.Dialog.getGenericMessageDialog($U.core.util.StringHelper.getString(INFORMATION_KEY), message, true), $U.core.View.hideDialog);
	}

	return {
		show : show
	};
}());
