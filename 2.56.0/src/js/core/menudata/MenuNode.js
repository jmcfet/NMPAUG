/**
 * Represents a node in a menu structure.
 *
 * @class $U.core.menudata.MenuNode
 *
 * @constructor
 * Create a new MenuNode
 * @param {string} id the MenuNode's id
 * @param {string} name the MenuNode's name
 * @param {$U.core.menudata.MenuNode} parent this MenuNode's parent, null if this is a root
 * @param {number} depth the MenuNode's depth
 * @param {number} [rating] the MenuNode's rating value
 * @param {boolean} [isCustom] whether this MenuNode represents a custom node
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.MenuNode = ( function() {

	var nextNodeId = 0;

	function MenuNode(id, name, parent, depth, rating, isCustom) {
		this._nodeId = nextNodeId++;
		this._id = id;
		this._name = name;
		this._parentId = parent ? parent.id : null;
		this._depth = depth;
		this._rating = rating;
		this._children = [];
		this._isCustom = isCustom;
	}

	var proto = MenuNode.prototype;

	Object.defineProperties(proto, {

		/**
		 * @property {number} nodeId the globally unique nodeId.<br>
		 * Useful for debugging.
		 * @readonly
		 */
		"nodeId" : {
			get : function() {
				return this._nodeId;
			}
		},

		/**
		 * @property {string} id the id of this node.<br>
		 * Should be unique among nodes that are descendents of the same {@link $U.core.menudata.RootNode}
		 * @readonly
		 */
		"id" : {
			get : function() {
				return this._id;
			}
		},

		/**
		 * @property {string} name the name of this node.
		 * @readonly
		 */
		"name" : {
			get : function() {
				return this._name;
			}
		},

		/**
		 * @property {String} fullPath the name of the category and all parent categories
		 */
		"fullPath" : {
			get : function() {
				var path = this._name;
				var parentNode = null;
				var parentID = this.parentId;
				while (parentID) {
					parentNode = $U.core.menudata.MenuData.getMenuDataNode(parentID);
					if (parentNode) {
						path = parentNode.name + " > " + path;
						parentID = parentNode.parentId;
					} else {
						parentID = null;
					}
				}
				return path;
			}
		},

		/**
		 * @property {string} parentId the id of the parent of this node.
		 * @readonly
		 */
		"parentId" : {
			get : function() {
				return this._parentId;
			}
		},

		/**
		 * @property {number} depth the depth of this node
		 * @readonly
		 */
		"depth" : {
			get : function() {
				return this._depth;
			}
		},

		/**
		 * @property {number} rating the rating of this node, undefined if there is no rating
		 * @readonly
		 */
		"rating" : {
			get : function() {
				return this._rating;
			}
		},

		/**
		 * @property {$U.core.menudata.MenuNode[]} children the children of this node
		 * @readonly
		 */
		"children" : {
			get : function() {
				return this._children;
			}
		},

		/**
		 * @property {boolean} isCustom whether this node represents a custom category
		 * @readonly
		 */
		"isCustom" : {
			get : function() {
				return this._isCustom || false;
			}
		},
		/**
		 * @property {boolean} isFeatured whether this node represents a featured category
		 * @readonly
		 */
		"isFeatured" : {
			get : function() {
				return this._id === "$FEATURED" ? true : false;
			}
		}
	});

	/**
	 * Clones a node. This is a deep clone.
	 * @param {$U.core.menudata.MenuNode} parentId the id of this node's parents
	 * @param {Function} [checkFunction] the function to call to check whether a node should be cloned
	 * @param {$U.core.menudata.MenuNode} checkFunction.node the node to check
	 * @param {boolean} checkFunction.return whether to clone the node
	 * @return {$U.core.menudata.MenuNode} the clone
	 */
	proto.clone = function(parent, checkFunction) {
		// parent should be null rather than undefined
		parent = parent || null;
		var result = new MenuNode(this._id, this._name, parent, this._depth, this._rating);
		var l = this._children.length;
		var c;
		var child;
		for ( c = 0; c < l; c++) {
			child = this._children[c];
			if (!checkFunction || checkFunction(child)) {
				result._children.push(child.clone(result, checkFunction));
			}
		}
		return result;
	};

	/**
	 * Add a child node at the end of the list of children
	 * @param {$U.core.menudata.MenuNode} child
	 */
	proto.addChild = function(child) {
		this._children.push(child);
		child._parentId = this._id;
	};

	/**
	 * Insert a child node into the list of children
	 * @param {$U.core.menudata.MenuNode} child
	 * @param {number} index where in the list of children to insert
	 */
	proto.insertChild = function(child, index) {
		this._children.splice(index, 0, child);
		child._parentId = this._id;
	};
	
	/**
	 * Removes a child node
	 * @param {$U.core.menudata.MenuNode} child
	 * @return {boolean} whether the child was removed
	 */
	proto.removeChild = function(child) {
		var index = this._children.indexOf(child);
		var result = false;
		if (index > -1) {
			this._children.splice(index, 1);
			child._parentId = null;			
			result = true;
		}
		return result;	
	};


	/**
	 * Finds a Node that is either this Node or a descendent of this Node
	 * @param {Object} id the id of the Node to find
	 * @return {$U.core.menudata.MenuNode} the Node or null if not found
	 */
	proto.getNode = function(id) {
		var c;
		var l;
		var n;
		var result = null;
		if (this._id === id) {
			result = this;
		} else {
			l = this._children.length;
			for ( c = 0; c < l; c++) {
				n = this._children[c].getNode(id);
				if (n !== null) {
					result = n;
					break;
				}
			}
		}
		return result;
	};

	/**
	 * Gets a list of the ids of this MenuNode's children
	 * @return {number[]} the ids
	 */
	proto.getChildIds = function() {
		var ids = [];
		var l = this._children.length;
		var c;
		for ( c = 0; c < l; c++) {
			ids.push(this._children[c]._id);
		}
		return ids;
	};

	/**
	 * Gets a list of the ids of this MenuNode's descendents
	 * @param [ids] the ids found so far
	 * @return {number[]} the ids
	 */
	proto.getDescendentIds = function(ids) {
		ids = ids || [];
		var l = this._children.length;
		var c;
		for ( c = 0; c < l; c++) {
			ids.push(this._children[c]._id);
			this._children[c].getDescendentIds(ids);
		}
		return ids;
	};

	/**
	 * Get a string representation of this MenuNode
	 * @return {string} a string representation of this Node
	 */
	proto.toString = function() {
		return "D:" + this._depth + " R:" + this._rating + " id:" + this._id + " " + this._name;
	};

	/**
	 * Get a complete debug string representation of this MenuNode and its descendents
	 * @param {string} [indent] the string to use to indent the result for this Node
	 * @return {string} a debug string representation of this Node and its descendents
	 */
	proto.toDebugString = function(indent) {
		indent = indent || "";
		var result = indent + this.toString();
		var i = indent + "  ";
		var l = this._children.length;
		var c;
		for ( c = 0; c < l; c++) {
			result += "\n" + this._children[c].toDebugString(i);
		}
		return result;
	};

	return MenuNode;
}());
