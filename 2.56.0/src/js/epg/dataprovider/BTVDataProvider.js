var $U = $U || {};

$U.epg = $U.epg || {};
$U.epg.dataprovider = $U.epg.dataprovider || {};

$U.epg.dataprovider.BTVDataProvider = ( function() {

	/**
	 * Implementation of BTVDataProvider
	 * @class $U.epg.dataprovider.BTVDataProvider
	 * @singleton
	 */

	/**
	 * Returns an instance of a BTVDataProvider
	 * This implementation always returns a $U.epg.dataprovider.NoCacheBTVDataProvider
	 * @return {$U.epg.dataprovider.BTVDataProvider}
	 */
	function getInstance() {
		return $U.epg.dataprovider.NoCacheBTVDataProvider;
	}
	
	return {
		getInstance : getInstance
	};

}());
