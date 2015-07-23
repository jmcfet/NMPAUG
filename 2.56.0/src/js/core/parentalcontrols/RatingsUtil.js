var $U = $U || {};
$U.core = $U.core || {};
$U.core.parentalcontrols = $U.core.parentalcontrols || {};

$U.core.parentalcontrols.RatingsUtil = (function() {
	var logger = $U.core.Logger.getLogger("ParentalControls");
	var ratingMappingTable = {
		"0": {
			"ratingCode": 0
		},
		"1": {
			"ratingCode": 0
		},
		"5": {
			"ratingCode": 5
		},
		"6": {
			"ratingCode": 6
		},
		"7": {
			"ratingCode": 7
		},
		"8": {
			"ratingCode": 8
		},
		"9": {
			"ratingCode": 9
		},
		"13": {
			"ratingCode": 13
		},
		"15": {
			"ratingCode": 16
		},
		"16": {
			"ratingCode": 16
		},
		"17": {
			"ratingCode": 17
		},
		"18": {
			"ratingCode": 18
		},
		"21": {
			"ratingCode": 21
		},
		"31": {
			"ratingCode": 13
		},
		"32": {
			"ratingCode": 13
		},
		"33": {
			"ratingCode": 13
		},
		"34": {
			"ratingCode": 13
		},
		"35": {
			"ratingCode": 13
		},
		"36": {
			"ratingCode": 13
		},
		"51": {
			"ratingCode": 16
		},
		"52": {
			"ratingCode": 16
		},
		"53": {
			"ratingCode": 16
		},
		"54": {
			"ratingCode": 16
		},
		"55": {
			"ratingCode": 16
		},
		"56": {
			"ratingCode": 16
		},
		"57": {
			"ratingCode": 16
		},
		"58": {
			"ratingCode": 16
		},
		"59": {
			"ratingCode": 16
		},
		"60": {
			"ratingCode": 16
		},
		"61": {
			"ratingCode": 16
		},
		"62": {
			"ratingCode": 16
		},
		"63": {
			"ratingCode": 16
		},
		"71": {
			"ratingCode": 18
		},
		"72": {
			"ratingCode": 18
		},
		"73": {
			"ratingCode": 18
		},
		"74": {
			"ratingCode": 18
		},
		"75": {
			"ratingCode": 18
		},
		"76": {
			"ratingCode": 18
		},
		"77": {
			"ratingCode": 18
		},
		"78": {
			"ratingCode": 18
		},
		"79": {
			"ratingCode": 18
		},
		"80": {
			"ratingCode": 18
		},
		"81": {
			"ratingCode": 18
		},
		"91": {
			"ratingCode": 21
		},
		"92": {
			"ratingCode": 21
		},
		"93": {
			"ratingCode": 21
		},
		"94": {
			"ratingCode": 21
		},
		"95": {
			"ratingCode": 21
		},
		"96": {
			"ratingCode": 21
		},
		"97": {
			"ratingCode": 21
		},
		"98": {
			"ratingCode": 21
		},
		"99": {
			"ratingCode": 21
		},
		"100": {
			"ratingCode": 21
		},
		"101": {
			"ratingCode": 21
		}
	};
	return {
		getRatingCode: function(data) {
			if (ratingMappingTable[data] !== null && ratingMappingTable[data] !== undefined) {
				return ratingMappingTable[data].ratingCode;
			}
			return 0;
		}
	};
}());