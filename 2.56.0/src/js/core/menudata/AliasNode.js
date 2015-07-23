/**
 * A specialisation of MenuNode that represents an alias to a different MenuNode
 *
 * @class $U.core.menudata.AliasNode
 * @extends $U.core.menudata.MenuNode
 *
 * @constructor
 * Create a new AliasNode
 * @param {string} id the AliasNode's id
 * @param {string} name the AliasNode's name
 * @param {number} parentId the id of this AliasNode's parent
 * @param {number} depth the AliasNode's depth
 * @param {string} aliasedId the id of the aliased MenuNode
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.AliasNode = ( function() {

	var superClass = $U.core.menudata.MenuNode;

	function AliasNode(id, name, parentId, depth, aliasedId) {
		superClass.call(this, id, name, parentId, depth);
		this._aliasedId = aliasedId;
	}


	$N.apps.util.Util.extend(AliasNode, superClass);
	var proto = AliasNode.prototype;

	Object.defineProperties(proto, {

		/**
		 * @property {string} nodeId the globally unique nodeId.<br>
		 * Useful for debugging.
		 * @readonly
		 */
		"aliasedId" : {
			get : function() {
				return this._aliasedId;
			}
		}
	});

	/**
	 * @inheritdoc $U.core.menudata.MenuNode#toString
	 */
	proto.toString = function() {
		return superClass.prototype.toString.call(this) + " { alias: " + this._aliasedId + "}";
	};

	return AliasNode;
}());
