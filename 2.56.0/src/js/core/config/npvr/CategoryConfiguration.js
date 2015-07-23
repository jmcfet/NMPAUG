var $U = $U || {};
$U.core = $U.core || {};

$U.core.CategoryConfiguration = ( function() {

	/**
	 * @class $U.core.CategoryConfiguration
	 * Implements configuration of a category configuration
	 * @return {Object}
	 */
	var CONTENT_TYPE = {
		CHANNEL : {},
		EVENT : {},
		VOD : {},
		RECENT_CHANNEL : {},
		RECORDED : {},
		SCHEDULED : {}
	};

	var CUSTOM_CATEGORIES = null;

	return {

		getCustomCategories : function() {
			if (CUSTOM_CATEGORIES === null) {
				CUSTOM_CATEGORIES = [{
				}];
			}
			return CUSTOM_CATEGORIES;
		},

		CONTENT_TYPE : CONTENT_TYPE

	};

}());
