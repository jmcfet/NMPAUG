/**
 * A specialisation of CatalogueNode that contains the CatalogueNodes representing the top level catalogue records
 *
 * @class $U.core.menudata.RootNode
 * @extends $U.core.menudata.CatalogueNode
 *
 * @constructor
 * Creates a new RootNode instance
 * @param {Function} loadCompleteCallback the function to call when the RootNode is loaded
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.RootNode = ( function() {

	var superClass = $U.core.menudata.CatalogueNode;

	var ROOT_ID = "-1";

	var ROOT_NAME = "ROOT";

	function RootNode(loadCompleteCallback) {
		$U.core.menudata.MenuNode.call(this, ROOT_ID, ROOT_NAME, null, 0);
		this.loadCompleteCallback = loadCompleteCallback;
	}

	$N.apps.util.Util.extend(RootNode, superClass);

	return RootNode;
}());
