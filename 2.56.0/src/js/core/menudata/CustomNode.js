/**
 * A specialisation of MenuNode that represents a custom category
 *
 * @class $U.core.menudata.CustomNode
 * @extends $U.core.menudata.MenuNode
 *
 * @constructor
 * Create a new CustomNode
 * @param {string} id the CustomNode's id
 * @param {string} name the CustomNode's name
 * @param {number} parentId the id of this CustomNode's parent
 * @param {number} depth the CustomNode's depth
 * @param {Object} categoryProvider the CustomNode's categor provider
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.CustomNode = ( function() {

	var superClass = $U.core.menudata.MenuNode;

	function CustomNode(parentId, depth, categoryProvider) {
		superClass.call(this, categoryProvider.id, categoryProvider.title, parentId, depth);
		this._categoryProvider = categoryProvider;
	}


	$N.apps.util.Util.extend(CustomNode, superClass);
	
	var proto = CustomNode.prototype;

	Object.defineProperties(proto, {

		/**
		 * @property {string} nodeId the globally unique nodeId.<br>
		 * Useful for debugging.
		 * @readonly
		 */
		"categoryProvider" : {
			get : function() {
				return this._categoryProvider;
			}
		}
	});

	/**
	 * @inheritdoc $U.core.menudata.MenuNode#toString
	 */
	proto.toString = function() {
		return superClass.prototype.toString.call(this) + " { categoryProvider: " + this._categoryProvider.id + "}";
	};

	return CustomNode;
}());
