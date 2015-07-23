/**
 * Manages string substitutions for the App.
 * Strings are loaded via bundle in /bundles directory.
 * @class $U.core.util.StringHelper
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

$U.core.util.StringHelper = ( function() {

	var logger = $U.core.Logger.getLogger("StringHelper");
	var helperObject;
	var STRINGTEST = false;

	/**
	 * Returns the correct string value for a give key.
	 * If the key cannot be found in the local file it will try to find it in the defaultStrings.js file
	 * If the key cannot be found in the defaultStrings.js file either then it will return the key
	 * @param {String} key Unique key of the given string.
	 * @param {String} varObject None, one or more values to insert into the string where %Placeholders% are.  Placeholders are case-sensitive.
	 * @return {string} String with replacements.
	 */
	var getString = function(key, varObject) {

		var preProcessString;
		var postProcessedString = "";
		var variableObject = varObject || {};

		/* HelperObject is the object that is wrapped with the getString function */
		if (!helperObject) {
			helperObject = {};
			$N.apps.core.Language.adornWithGetString(helperObject, $U.core.Configuration.LANGPATH);
		}

		preProcessString = helperObject.getString(key);

		if (preProcessString !== undefined) {
			postProcessedString = preProcessString.replace(/%\w+%/g, function(all) {
				return variableObject[all.replace(/%/g, "")] || "";
			});
			return postProcessedString;
		} else {
			if (logger) {
				logger.log("getString", "Cannot find string for key '" + key + "', locale " + $U.core.Locale.getLocale());
			}
			return key;
		}
	};

	/**
	 * Callback that is triggered when the strings need flushing out for a new locale.
	 */
	var resetStrings = function() {
		helperObject = null;
	};

	return {
		getString : getString,
		resetStrings : resetStrings
	};

}());
