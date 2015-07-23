/**
 * Simple class that implements versioning of the application
 * 
 * @class $U.core.version.Version
 * @singleton
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.version = $U.core.version || {};
$U.core.version.Version = ( function() {

	/**
	 * @property {string} UI_VERSION the version of the UI code that was set at build time
	 * @readonly 
	 */
	var UI_VERSION = "%UI_VERSION%";

	/**
	 * @property {string} JSFW_VERSION the version of the JSFW code that was set at build time<br>
	 * This allows us to specify any "version" of JSFW to build against and may not be the same version that JSFW reports at run time 
	 * @readonly 
	 */
	var JSFW_VERSION = "%JSFW_VERSION%";

	return {
		UI_VERSION: UI_VERSION,
		JSFW_VERSION: JSFW_VERSION
	};
}());
