/*jshint newcap: false*/
/*global $N:true*/
/*global $M:true*/

var ParentalControlsTest = TestCase("ParentalControlsTest");

/*
 * check that the parental control functions return expected result
 * should test:
 * setting the rating to the max value gives unlocked === true
 * setting the rating to a value returns permitted status correctly
 * get current rating works
 */
ParentalControlsTest.prototype.setUp = function(){
	$U = $U || {};
	$U.core = $U.core || {};
	this._Configuration = $U.core.Configuration;
	$U.core.Configuration = {
		MAX_PARENTAL_RATING : 18,
		PARENTAL_RATINGS : {
			3: {
				ratingCode: "U",
				description: "Suitable for all"
			},
			8: {
				ratingCode: "PG",
				description: "Parental Guidance"
			},
			12: {
				ratingCode: "12",
				description: "Suitable for 12 years and above"
			},
			15: {
				ratingCode: "15",
				description: "Suitable for 15 years and above"
			},
			18 : {
				ratingCode: "",
				description: "Show all content"
			}
		}
	};
	// Set up mock preference object 
	$N = $N || {};
	$N.platform = $N.platform || {};
	$N.platform.system = $N.platform.system || {};
	$N.platform.system.Preferences =  $M.MockPreferences;
	
	$N.services = $N.services || {};
	$N.services.sdp = $N.services.sdp || {};
	$N.services.sdp.Preferences = $M.MockPreferences;
	
	$U.core.signon = $U.core.signon || {};
	$U.core.signon.user = $U.core.signon.user || {};
	$U.core.signon.user.deviceUid = "321";
};

/*
 * Tear down following test
 */
ParentalControlsTest.prototype.tearDown = function() {
	// Restore mocked
	$U.core.Configuration = this._Configuraton;
};

/**
 * test that the correct values are set when setting with empty string and with values
 */
ParentalControlsTest.prototype.testSettingAndGetting = function(){
	$U.core.parentalcontrols.ParentalControls.initialise(function(){console.log("meh");});
	$U.core.parentalcontrols.ParentalControls.setParentalRating("");
	assertEquals(18, $U.core.parentalcontrols.ParentalControls.getCurrentRating());
	
	$U.core.parentalcontrols.ParentalControls.setParentalRating(15);
	assertEquals(15, $U.core.parentalcontrols.ParentalControls.getCurrentRating());
	
	$U.core.parentalcontrols.ParentalControls.setParentalRating(8);
	assertEquals(8, $U.core.parentalcontrols.ParentalControls.getCurrentRating());
};

/**
 * test that the ratings are locked when they should be
 */
ParentalControlsTest.prototype.testSettingAndLock = function(){
	$U.core.parentalcontrols.ParentalControls.initialise(function(){console.log("meh");});
	$U.core.parentalcontrols.ParentalControls.setParentalRating("");
	assertFalse($U.core.parentalcontrols.ParentalControls.isLocked());
	
	$U.core.parentalcontrols.ParentalControls.setParentalRating(15);
	assertTrue($U.core.parentalcontrols.ParentalControls.isLocked());
	
	$U.core.parentalcontrols.ParentalControls.setParentalRating(18);
	assertFalse($U.core.parentalcontrols.ParentalControls.isLocked());
};

/**
 * test that the rating values are set correctly
 */
ParentalControlsTest.prototype.testIsPermitted = function(){
	$U.core.parentalcontrols.ParentalControls.initialise(function(){console.log("meh");});
	//set to max check that can play lower
	$U.core.parentalcontrols.ParentalControls.setParentalRating("");
	assertTrue($U.core.parentalcontrols.ParentalControls.isRatingPermitted(18));
	assertTrue($U.core.parentalcontrols.ParentalControls.isRatingPermitted(15));
	assertTrue($U.core.parentalcontrols.ParentalControls.isRatingPermitted(12));
	assertTrue($U.core.parentalcontrols.ParentalControls.isRatingPermitted(8));
	
	//set to mid rating and check can play those below, but not those above
	$U.core.parentalcontrols.ParentalControls.setParentalRating(12);
	assertFalse($U.core.parentalcontrols.ParentalControls.isRatingPermitted(18));
	assertFalse($U.core.parentalcontrols.ParentalControls.isRatingPermitted(15));
	assertTrue($U.core.parentalcontrols.ParentalControls.isRatingPermitted(12));
	assertTrue($U.core.parentalcontrols.ParentalControls.isRatingPermitted(8));
};


