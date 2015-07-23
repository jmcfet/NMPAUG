/*global $M:true */

var $M = $M || {};

$M.MockParentalControls = ( function() {

	var parentalRating = Number.MAX_VALUE;

	function setParentalRating(rating) {
		parentalRating = rating;
	}

	function isRatingPermitted(rating) {
		return parentalRating >= rating;
	}

	return {
		setParentalRating : setParentalRating,
		isRatingPermitted : isRatingPermitted
	};

}());

