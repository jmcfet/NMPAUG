/*jshint newcap: false*/
var StringHelperTest = TestCase("StringHelperTest");

/*
 * should test:
 * simple 'unchanging' text coming from the default file e.g. OK/cancel
 * test that strings not defined in the russian text file get the text from the default strings
 * that if no text is defined in the defaultStrings file the correct output is given
 * that text with replacements is correctly replaced
 */

StringHelperTest.prototype.setUp = function() {

	/*  Stubs out the NINJA API for language bundles.
	 *  If testing any functionality that is "locale'd" with strings, add the keys here for them to be found by the tests */
	$U = $U || {};
	$U.core = $U.core || {};
	$U.core.Configuration = $U.core.Configuration || {};
	$U.core.Configuration.LANGPATH = "/bundles";

	/*global $N:true*/
	/* Building a fake NINJA API to handle calling strings */
	$N = $N || {};
	$N.apps = $N.apps || {};
	$N.apps.core = $N.apps.core || {};
	$N.apps.core.Language = $N.apps.core.Language || {};
	$N.apps.core.Language.adornWithGetString = function(varObject) {
		varObject.getString = function(key) {
			var keyLookup = {
				txtOK : "OK",
				txtCancel : "Cancel",
				txtSubmit : "Submit",
				txtReplacement1 : "The replacement is %STATUS%",
				txtReplacement2 : "Page %PAGENUMBER% of %TOTALPAGES%",
				txtReplacement3 : "The replacement will %NOTFOUND% not be found"
			};
			return keyLookup[key];
		};
		return varObject;
	};

	$U.core.Locale = $U.core.Locale || {};
	$U.core.Locale.getLocale = function() {
		return "en_gb";
	};
	
	$U.core.util.StringHelper.resetStrings();
};

/*
 * Tear down following test
 */
StringHelperTest.prototype.tearDown = function() {

};

/* basic string retrieval */
StringHelperTest.prototype.testSimpleText = function() {
	assertEquals("OK", $U.core.util.StringHelper.getString("txtOK"));
	assertEquals("Cancel", $U.core.util.StringHelper.getString("txtCancel"));
	assertEquals("Submit", $U.core.util.StringHelper.getString("txtSubmit"));
};

/* Failure cases for string retrieval */
StringHelperTest.prototype.testNoDefinedText = function() {
	assertEquals("txtNOTOK", $U.core.util.StringHelper.getString("txtNOTOK"));
	assertEquals("txtThisShouldFail", $U.core.util.StringHelper.getString("txtThisShouldFail"));
	assertEquals("txtPleaseDontDefineThisText", $U.core.util.StringHelper.getString("txtPleaseDontDefineThisText"));
};

/* String retrieval with replacement parameters */
StringHelperTest.prototype.testReplacement = function() {
	assertEquals("The replacement is fine", $U.core.util.StringHelper.getString("txtReplacement1", {
		STATUS : "fine"
	}));
	assertEquals("Page 1 of 2", $U.core.util.StringHelper.getString("txtReplacement2", {
		PAGENUMBER : "1",
		TOTALPAGES : "2"
	}));
	assertEquals("The replacement will  not be found", $U.core.util.StringHelper.getString("txtReplacement3", {
		YOUWONTFINDTHIS : "baseball"
	}));
};
