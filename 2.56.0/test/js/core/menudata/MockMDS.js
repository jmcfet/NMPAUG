/*global $M:true */

var $M = $M || {};

$M.MockMDS = ( function() {

	function getRootCatalogues(catalogueSuccessCallback, detailSuccessCallback, failureCallback) {
		var result = getChildren(null);
		if (catalogueSuccessCallback) {
			// Timeout required here so that async code in MenuData works
			window.setTimeout(function() {
				catalogueSuccessCallback(result);
			}, 1);
		}
		if (detailSuccessCallback) {
			// Timeout required here so that async code in MenuData works
			window.setTimeout(function() {
				detailSuccessCallback(result);
			}, 1);
		}
	}

	function getDetailedCatalogues(catalogueSuccessCallback, detailSuccessCallback, failureCallback, catalogueUID) {
		var result = getChildren(catalogueUID);
		if (catalogueSuccessCallback) {
			window.setTimeout(function() {
				catalogueSuccessCallback(result);
			}, 1);
		}
		if (detailSuccessCallback) {
			window.setTimeout(function() {
				detailSuccessCallback(result);
			}, 1);
		}
	}

	function getAssets(catalogueConfiguration, returnCallback) {
		var result = [];
		var assets = [];
		var i;
		for ( i = 0; i < catalogueData.length; i++) {
			if (catalogueConfiguration.ids.indexOf(catalogueData[i].id) !== -1) {
				if (catalogueData[i].assets && catalogueData[i].assets.length) {
					assets = assets.concat(catalogueData[i].assets);
				}
			}
		}
		if (assets) {
			for ( i = 0; i < assets.length; i++) {
				// Inject a dummy technicals field since it's required for MDSVODItem construction
				assets[i].technicals = [null];
				result.push(assets[i]);
			}
		}
		// Timeout required here so that async code in MenuData works
		window.setTimeout(function() {
			returnCallback(result);
		}, 1);
	}

	function getChildren(parent) {
		var result = [];
		var catalogue;
		var i;
		for ( i = 0; i < catalogueData.length; i++) {
			if (catalogueData[i].parent === parent) {
				result.push(catalogueData[i]);
			}
		}
		return result;
	}

	// Root catalogues
	var catalogueData = [{
		id : "1",
		Title : "Root Catalogue 1",
		Rating : 0,
		parent : null
	}, {
		id : "2",
		Title : "Root Catalogue 2",
		Rating : 0,
		parent : null,
		assets : [{
			id : "Asset 2.1",
			Rating : 0
		}, {
			id : "Asset 2.2",
			Rating : 10

		}, {
			id : "Asset 2.3",
			Rating : 20

		}, {
			id : "Asset 2.4",
			Rating : 0
		}]
	}, {
		id : "3",
		Title : "Root Catalogue 3",
		Rating : 10,
		parent : null
	},

	// Children of Root Catalogue 1
	{
		id : "4",
		Title : "Catalogue 1.1",
		Rating : 0,
		parent : "1",
		assets : [{
			id : "Asset 1.1.1",
			Rating : 0
		}, {
			id : "Asset 1.1.2",
			Rating : 30
		}]
	}, {
		id : "5",
		Title : "Catalogue 1.2",
		Rating : 0,
		parent : "1",
		assets : [{
			id : "Asset 1.2.1",
			Rating : 0
		}, {
			id : "Asset 1.2.2",
			Rating : 0
		}]
	}, {
		id : "6",
		Title : "Catalogue 1.3",
		Rating : 0,
		parent : "1"
	},

	// Children of Root Catalogue 2
	{
		id : "7",
		Title : "Catalogue 2.1",
		Rating : 0,
		parent : "2",
		assets : [{
			id : "Asset 2.1.1",
			Rating : 0
		}, {
			id : "Asset 2.1.2",
			Rating : 0
		}]
	}, {
		id : "8",
		Title : "Catalogue 2.2",
		Rating : 0,
		parent : "2"
	},

	// Children of Root Catalogue 3
	{
		id : "9",
		Title : "Catalogue 3.1",
		Rating : 0,
		parent : "3"
	},

	// Children of Catalogue 1.2
	{
		id : "10",
		Title : "Catalogue 1.2.1",
		Rating : 0,
		parent : "5"
	}, {
		id : "11",
		Title : "Catalogue 1.2.2",
		Rating : 0,
		parent : "5"
	},

	// Children of Catalogue 2.1
	{
		id : "12",
		Title : "Catalogue 2.1.1",
		Rating : 0,
		parent : "7"
	}, {
		id : "13",
		Title : "Catalogue 2.1.2",
		Rating : 0,
		parent : "7",
		assets : [{
			id : "Asset 2.1.2.1",
			Rating : 100
		}, {
			id : "Asset 2.1.2.2",
			Rating : 0
		}]
	},

	// Children of Catalogue 2.1.2
	{
		id : "14",
		Title : "Catalogue 2.1.2.1",
		Rating : 20,
		parent : "13"
	}, {
		id : "15",
		Title : "Catalogue 2.1.2.2",
		Rating : 5,
		parent : "13",
		assets : [{
			id : "Asset 2.1.2.2.1",
			Rating : 50
		}, {
			id : "Asset 2.1.2.2.2",
			Rating : 0
		}]
	}];

	return {
		getRootCatalogues : getRootCatalogues,
		getDetailedCatalogues : getDetailedCatalogues,
		getAssets : getAssets
	};

}());

