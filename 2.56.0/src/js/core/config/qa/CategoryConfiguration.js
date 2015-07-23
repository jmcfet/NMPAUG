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
					id : "$TEST_CATEGORY_PROVIDER",
					name : $U.core.util.StringHelper.getString("menuCustom"),
					description : "",
					active : false,
					content : [{
						type : CONTENT_TYPE.EVENT,
						data : ["FAKE_19_M"]
					}, {
						type : CONTENT_TYPE.CHANNEL,
						data : ["FAKE_19_M"]
					}, {
						type : CONTENT_TYPE.EVENT,
						data : ["FAKE_20_M"]
					}, {
						type : CONTENT_TYPE.CHANNEL,
						data : ["FAKE_20_M"]
					}, {
						type : CONTENT_TYPE.EVENT,
						data : ["FAKE_21_M"]
					}, {
						type : CONTENT_TYPE.CHANNEL,
						data : ["FAKE_21_M"]
					},{
						type : CONTENT_TYPE.EVENT,
						data : ["ENVIVIO_CH1_M"]
					},{
						type : CONTENT_TYPE.CHANNEL,
						data : ["ENVIVIO_CH1_M"]
					}],
					children : []
				}];
			}
			return CUSTOM_CATEGORIES;
		},

		CONTENT_TYPE : CONTENT_TYPE

	};

}());
