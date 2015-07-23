/**
 * TestCategoryProvider
 *
 * @class $U.core.category.test.TestCategoryProvider
 * @extends $U.core.category.CategoryProvider
 *
 * @constructor
 * @private
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.test = $U.core.category.test || {};
$U.core.category.test.TestCategoryProvider = ( function() {

	var superClass = $U.core.category.CategoryProvider;

	var ID = "$TEST_CATEGORY_PROVIDER";

	var TITLE = "Test Category";

	var DISPLAY_ORDER = 0;

	function TestCategoryProvider() {
		superClass.call(this, ID, TITLE, DISPLAY_ORDER);
	}


	$N.apps.util.Util.extend(TestCategoryProvider, superClass);

	var proto = TestCategoryProvider.prototype;

	proto._isShowInMenu = function() {
		return true;
	};

	/**
	 * Fetches the items for the Test category
	 */
	proto._fetchItems = function() {
		var customCategory = $U.core.category.CategoryProvider._getCustomCategory(ID);
		var result = $U.core.category.CategoryProvider._getAssetsFromCustomCategory(customCategory);

		this.loadMediaItems(result);
	};

	return TestCategoryProvider;
}());
