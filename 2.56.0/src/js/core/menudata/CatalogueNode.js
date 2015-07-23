/**
 * A specialisation of Node that represents a catalogue record from SDP / MDS
 *
 * @class $U.core.menudata.CatalogueNode
 * @extends $U.core.menudata.MenuNode
 *
 * @constructor
 * Creates a new CatalogueNode instance
 * @param {Object} catalogue the CatalogueNode's catalogue
 * @param {$U.core.menudata.MenuNode} parentNode the CatalogueNode's parentNode
 * @param {number} depth the CatalogueNode's depth'
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.menudata = $U.core.menudata || {};

$U.core.menudata.CatalogueNode = ( function() {

	var nodeCounter = 0;

	var superClass = $U.core.menudata.MenuNode;

	function isMDS() {
		return Boolean($U.core.Configuration.MDS_CONFIG);
	}

	function CatalogueNode(catalogue, parentNode, depth) {
		var id = String(isMDS() ? catalogue.id : catalogue.uid);
		var name = isMDS() ? catalogue.Title : catalogue.name;
		var rating;
		if (isMDS()) {
			rating = typeof catalogue.Rating === "object" ? catalogue.Rating.precedence : catalogue.Rating;
		} else {
			rating = catalogue.parentalRating;
		}
		var that = this;

		this._parentNode = parentNode;
		superClass.call(this, id, name, parentNode.id, depth, rating);
		nodeCounter++;

		// Now populate the children...
		$U.core.menudata.MenuData.getDataSource().getDetailedCatalogues(null, function(detailedCatalogues) {
			that.populateChildrenDetailSuccessCallback(detailedCatalogues);
		}, null, this._id);
	}


	$N.apps.util.Util.extend(CatalogueNode, superClass);

	/**
	 * Callback when children are populated and augmented
	 * @param {Object[]} detailedCatalogues
	 * @private
	 */
	CatalogueNode.prototype.populateChildrenDetailSuccessCallback = function(detailedCatalogues) {
		var i;
		var c;
		var l = detailedCatalogues.length;
		for ( i = 0; i < l; i++) {
			c = new CatalogueNode(detailedCatalogues[i], this, this._depth + 1);
			this.addChild(c);
		}
		nodeCounter--;
		if (nodeCounter === 0) {
			this._parentNode.loadCompleteCallback();
		}
	};

	/**
	 * Called by a child node when it detects that all CatalogueNodes are loaded
	 * @protected
	 */
	CatalogueNode.prototype.loadCompleteCallback = function() {
		this._parentNode.loadCompleteCallback();
	};

	return CatalogueNode;
}());
