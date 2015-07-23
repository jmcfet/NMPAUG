/**
 * A specialisation of VODItem that represents an MDS VOD asset that is a member of a series
 *
 * @class $U.core.mediaitem.VODSeriesItem
 * @extends $U.core.mediaitem.MDSVODItem
 *
 * @constructor
 * Create a new VODSeriesItem
 * @param {Object} dataObject the underlying data object from MDS
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.VODSeriesItem = ( function() {

	var logger = $U.core.Logger.getLogger("VODSeriesItem");

	var superClass = $U.core.mediaitem.MDSVODItem;

	function VODSeriesItem(dataObject, seriesTitle) {
		superClass.call(this, dataObject);
		this._seriesTitle = seriesTitle;
	}

	$N.apps.util.Util.extend(VODSeriesItem, superClass);
	var proto = VODSeriesItem.prototype;

	Object.defineProperties(proto, {
		/**
		 * @property {string} seriesTitle this VODSeriesItem's series title
		 * @readonly
		 */
		"seriesTitle" : {
			get : function() {
				return this._seriesTitle;
			}
		},
		
		"seriesItem" : {
			get : function() {
				return true;
			}
		}		
	});

	return VODSeriesItem;
}());
