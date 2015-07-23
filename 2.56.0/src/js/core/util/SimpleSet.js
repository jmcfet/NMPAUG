var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

$U.core.util.SimpleSet = ( function() {

	/**@class $U.core.util.SimpleSet
	 * A SimpleSet, capable of holding items of any type. In this implementation equality testing is strict.
	 * @constructor
	 * Builds a SimpleSet
	 */
	var SimpleSet = function() {
		this.items = [];
		this.size = 0;
	};

	/**
	 * Returns the size of the set
	 * @return {Number} Size of set.
	 */
	SimpleSet.prototype.getSize = function() {
		return this.size;
	};

	/**
	 * Returns whether the set is Empty
	 * @return {Boolean}
	 */
	SimpleSet.prototype.isEmpty = function() {
		return this.size === 0;
	};

	/**
	 * Returns whether a given item is already in the set
	 * @param {Object} item
	 * @return {Boolean}
	 */
	SimpleSet.prototype.contains = function(item) {
		return (this.items.indexOf(item) !== -1);
	};

	/**
	 * Returns whether a given item is already in the set
	 * @param {Object} item
	 * @param {Function} match the matching function
	 * @return {Boolean}
	 */
	SimpleSet.prototype.containsMatch = function(item, match) {
		var result = false;
		var i;
		var l = this.items.length;
		for (i = 0; i < l; i++) {
			if (match(item, this.items[i])) {
				result = true;
				break;
			}
		}
		return result;
	};

	/**
	 * Adds an item to the set if it is not already in the set
	 * @param {Object} item
	 * @return {Boolean} True if added, false if already in the set
	 */
	SimpleSet.prototype.add = function(item) {
		if (this.contains(item)) {
			return false;
		}
		this.items.push(item);
		this.size++;
		return true;
	};

	/**
	 * Removes an item from the set if it is in the set
	 * @param {Object} item
	 * @return {Boolean} True if removed, false if not in the set
	 */
	SimpleSet.prototype.remove = function(item) {
		var i = this.items.indexOf(item);
		if (i === -1) {
			return false;
		}
		this.items.splice(i, 1);
		this.size--;
		return true;
	};

	/**
	 * Converts the set to an array
	 * @return {Array} Array of set items
	 */
	SimpleSet.prototype.toArray = function() {
		return this.items.slice(0);
	};

	return SimpleSet;

}());
