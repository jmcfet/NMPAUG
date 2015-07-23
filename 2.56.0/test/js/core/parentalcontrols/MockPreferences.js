/*global $M:true */

var $M = $M || {};

$M.MockPreferences = ( function() {

	function get(name, success, failure) {
		failure();
	}
	
	function getPreferenceObject(){
		return null;
	}

	return {
		get : get,
		getPreferenceObject : getPreferenceObject
	};

}());

