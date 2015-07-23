/*global $M:true */

var $M = $M || {};

$M.MockPurchaseOptions = ( function() {

	var getSdpPurchaseOptions = function(asset) {
		return buildMockSdpPurchaseOptions(asset);
	};

	var getMdsPurchaseOptions = function(asset) {
		return buildMockMdsPurchaseOptions(asset);
	};

	function buildMockSdpPurchaseOptions(schedTechAsset) {
		var orgArry = schedTechAsset[0];
		var myCopy = $.extend(true, {}, orgArry);

		if(myCopy.technicalAsset.definition === "SD"){
			myCopy.technicalAsset.definition = "HD";
			myCopy.offers[0].value = 4.99;
		} else if(myCopy.technicalAsset.definition === "HD"){
			myCopy.technicalAsset.definition = "SD";
			myCopy.offers[0].value = 3.99;
		}
		schedTechAsset.push(myCopy);
		return schedTechAsset;
	}

	function buildMockMdsPurchaseOptions(technicals) {
		var orgArry = technicals[0];
		var myCopy = $.extend(true, {}, orgArry);

		if(myCopy.Definition === "SD") {
			myCopy.Definition = "HD";
			myCopy.products.price.value = 4.99;
		} else if (myCopy.Definition === "HD"){
			myCopy.Definition = "SD";
			myCopy.products[0].price.value = 3.99;
		}
		technicals.push(myCopy);

		return technicals;
	}

	return {
		getSdpPurchaseOptions : getSdpPurchaseOptions,
		getMdsPurchaseOptions : getMdsPurchaseOptions
	};

}());

