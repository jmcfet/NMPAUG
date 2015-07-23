// This needs to emulate this call:
// $U.epg.dataprovider.BTVDataProvider.getInstance().fetchAllChannelsByLongName(function(allChannelsByLongName) {
	// // set all channels
	// that._allChannelsByLongName = allChannelsByLongName;
	// // Go and get the assets
	// that._fetchNextAssets();
// });
/*global $M:true */

var $M = $M || {};

$M.MockBTVDataProvider = ( function() {

	function getInstance() {
		return $M.MockBTVDataProvider;
	}

	function fetchAllChannelsByLongName(callback) {
		callback([]);
	}

	return {
		getInstance : getInstance,
		fetchAllChannelsByLongName : fetchAllChannelsByLongName
	};

}());