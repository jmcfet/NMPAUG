/**
 * Implementation of locale setting/getting.  Implements several ways of deriving the required locale,
 * matched against the SUPPORTED_LOCALES configuration option, and sets that in the JSFW Languages API.
 *
 * @class $U.core.Locale
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.Locale = ( function() {

	var logger = $U.core.Logger.getLogger("Locale");
	var LOCALE_STORAGE_KEY = "appLocale";

	/**
	 * Retrieves the configuration DEFAULT_LOCALE (if set).  Mainly used to allow config-level override of locale setting.
	 * @private
	 * @return {String} the locale string, or undefined if not set
	 */
	var _getConfigLocale = function() {
		if ($U.core.Configuration.DEFAULT_LOCALE && $U.core.Configuration.DEFAULT_LOCALE.length > 0) {
			return $U.core.Configuration.DEFAULT_LOCALE;
		} else {
			return undefined;
		}
	};

	/**
	 * Get the locale, if any, stored in LocalStorage
	 * @private
	 * @return {String} Returns the locale string, or undefined if not set
	 */
	var _getStoredLocale = function() {
		var storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
		if (storedLocale !== undefined) {
			return storedLocale;
		} else {
			return undefined;
		}
	};

	/**
	 * Gets the default (first) locale in the Configuration variable SUPPORTED_LOCALES
	 * @private
	 */
	var _getDefaultLocale = function() {
		return getSupportedLocales()[0];
	};

	/**
	 * Set the derived locale in LocalStorage
	 * @private
	 * @param {String} locale Locale to be stored
	 */
	var _setStoredLocale = function(locale) {
		window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	};

	/**
	 * Removes the stored Locale item in localstorage.
	 * @private
	 */
	var _removeStoredLocale = function() {
		window.localStorage.removeItem(LOCALE_STORAGE_KEY);
	};

	/**
	 * Add the locale as a class to the HTML body element
	 */
	var _setLocaleClassNameOnBody = function(locale) {
		var supportedLocales = $U.core.Configuration.SUPPORTED_LOCALES;

		//Remove any locale from the body class before applying a new one
		for (var i = 0; i < supportedLocales.length; i++) {
			$U.core.util.HtmlHelper.removeClass(document.body, supportedLocales[i].localeString);
		}

		$U.core.util.HtmlHelper.setClass(document.body, locale);
	};

	/**
	 * Checks to see if the given locale is in the SUPPORTED_LOCALES
	 * @param {String} locale Locale to be checked against the SUPPORTED_LOCALES
	 * @return {boolean}
	 * TODO - support partials (match "ru" to first "ru" language e.g. "ru" locale from browser would match "ru_ru" or "ru_md" depending on order of supported locales
	 * in the configuration)
	 */
	var _localeIsAvailable = function(locale) {
		var supportedLocales = $U.core.Configuration.SUPPORTED_LOCALES;

		// Iterate over the locales looking for a match
		for (var i = 0; i < supportedLocales.length; i++) {
			if (locale === supportedLocales[i].localeString) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Load the locale bundle file required
	 * Exposed as refreshLanguageBundle(callback) in the API
	 * @private
	 * @param {Function} callback Callback to call when loaded
	 */
	var _loadLocaleFile = function(callback) {
		$N.apps.core.Language.loadLanguageBundle(callback, $U.core.Configuration.LANGPATH);
	};

	/**
	 * Sets the locale to the given value
	 * @param {String} locale locale to be set
	 */
	var _setLocale = function(locale, storeLocal) {
		if (storeLocal) {
			_setStoredLocale(locale);
		}
		_setLocaleClassNameOnBody(locale);
		$N.apps.core.Language.setLocale(locale);
	};

	/**
	 * Uses local methods to derive the user's required locale.  Unitised so order can be mixed as required.
	 * @param {Function} callback Callback to make when the locale file has loaded.
	 */
	var initialise = function(callback) {
		var chosenLocale;
		var storeLocal;

		// First check and see if we have an override locale in the configuration
		chosenLocale = _getConfigLocale();
		if (_localeIsAvailable(chosenLocale)) {
			storeLocal = false;
			_setLocale(chosenLocale, storeLocal);
			_removeStoredLocale();
			if (logger) {
				logger.log("initialise", "Using configuration locale:" + chosenLocale);
			}
			_loadLocaleFile(callback);
			return;
		}

		// Then try looking for a stored locale
		chosenLocale = _getStoredLocale();
		if (_localeIsAvailable(chosenLocale)) {
			storeLocal = false;
			_setLocale(chosenLocale, storeLocal);
			if (logger) {
				logger.log("initialise", "Using stored locale:" + chosenLocale);
			}
			_loadLocaleFile(callback);
			return;
		}

		// Finally, use default locale (first one in SUPPORTED_LOCALES)
		chosenLocale = _getDefaultLocale();

		storeLocal = true;
		_setLocale(chosenLocale.localeString, storeLocal);
		if (logger) {
			logger.log("initialise", "Using default locale:" + chosenLocale.localeString);
		}
		_loadLocaleFile(callback);
		return;
	};

	/**
	 * Resets the language to the given locale ready for a refresh
	 * @param {String} locale String representing the locale to switch to.
	 */
	var resetLocale = function(locale){
		var storeLocale = true;
		_setLocale(locale, storeLocale);
		_loadLocaleFile($U.core.util.StringHelper.resetStrings);
	};

	/**
	 * Gets the locale to the given value
	 * @return {String} current locale that is set
	 */
	var getLocale = function() {
		return $N.apps.core.Language.getLocale();
	};

	/**
	 * Returns the Locale ready for concatenation to asset ID for locate search matches
	 * @return {String} current locale that is set in format |xx_XX
	 */
	var getIndexLocale = function() {
		var locale = $N.apps.core.Language.getLocale(),
			localeFix;

		localeFix = locale.split('_');
		locale = '|'+localeFix[0]+'_'+localeFix[1].toUpperCase();	
		
		return locale;				
	};

	/**
	 * Returns the Locale ready for concatenation to asset ID for locate search matches
	 * @return {String} current locale that is set in format |xx_XX
	 */
	var getMDSLocale = function() {
		var locale = $N.apps.core.Language.getLocale(),
			localeFix;

		localeFix = locale.split('_');
		locale = localeFix[0]+'_'+localeFix[1].toUpperCase();	
		
		return locale;				
	};
	
	/**
	 * Retrieves an array of supported locales (wrapper around config supported locales) that contains objects with "displayname" and "localeString" attributes
	 * @return {Array} The locales supported in the configuration
	 */
	var getSupportedLocales = function() {
		return $U.core.Configuration.SUPPORTED_LOCALES;
	};

	return {
		initialise : initialise,
		resetLocale : resetLocale,
		getLocale : getLocale,
		getIndexLocale : getIndexLocale,
		getSupportedLocales : getSupportedLocales,
		getMDSLocale : getMDSLocale
	};

}());
