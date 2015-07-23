/**
 * Gives a sort function to allow multiple field sorting
 * @class $U.core.util.StringHelper
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

$U.core.util.SortHelper = ( function() {

	var logger = $U.core.Logger.getLogger("SortHelper");

	/**
	 * Sorts an array of objects based on the specified property
	 * Items with null as their value will be put at the end of the array
	 * @param {String} property the property of the objects to search by
	 * @return the search value
	 * @private
	 */
	function sortSingleField(property) {
		return function(obj1, obj2) {
			var a = obj1[property];
			var b = obj2[property];
			if (a === null && b === null) {
				return 0;
			}
			if (a === null) {
				return 1;
			}
			if (b === null) {
				return -1;
			}

			return a > b ? 1 : a < b ? -1 : 0;
		};
	}

	/**
	 * This function takes a list of fields for objects and sorts an array based on the first to last properties of the objects.
	 * It is to be used in the Array.sort() function
	 * e.g. myArray.sort(sortMultipleFields("surname", "firstname"));
	 * will sort by the surname then the firstname
	 * To sort by descending order for a given field an object with a field parameter and desc : true parameter need to be used
	 * e.g. myArray.sort(sortMultipleFields({field : "surname", desc : true}, "firstname"));
	 * will sort descendingly by surname and then ascendingly by firstname
	 * @param a list of fields (Strings) to sort by
	 */
	var sortMultipleFields = function() {
		/*
		 * save the arguments object as it will be overwritten
		 * note that arguments object is an array-like object
		 * consisting of the names of the properties to sort by
		 */
		var props = arguments;
		return function(obj1, obj2) {
			var i = 0;
			var result = 0;
			var numberOfProperties = props.length;
			var field;
			/* try getting a different result from 0 (equal)
			 * as long as we have extra properties to compare
			 */
			while (result === 0 && i < numberOfProperties) {
				field = props[i].field ? props[i].field : props[i];
				if (props[i].desc) {
					result = sortSingleField(field)(obj2, obj1);
				} else {
					result = sortSingleField(field)(obj1, obj2);
				}
				i++;
			}
			return result;
		};
	};

	return {
		sortMultipleFields : sortMultipleFields
	};

}());
