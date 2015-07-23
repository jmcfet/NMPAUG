/**
 * A VOD PurchaseOption
 *
 * @class $U.core.mediaitem.PurchaseOption
 *
 * @constructor
 * Create a new PurchaseOption
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.mediaitem = $U.core.mediaitem || {};

$U.core.mediaitem.PurchaseOption = ( function() {

	function PurchaseOption() {
	}

	var proto = PurchaseOption.prototype;

	/**
	 * Return a string version of this PurchaseOption
	 */
	proto.toString = function() {
		return "id: " + this.id + " title: " + this.title + " description: " + this.description + " definition: " + this.definition + " duration: " + this.duration + " currency: " + this.currency + " price: " + this.price;
	};

	Object.defineProperties(proto, {

		/**
		 * @property {string} id
		 * @readonly
		 */
		"id" : {
			get : function() {
				return this._id;
			}
		},

		/**
		 * @property {string} title
		 * @readonly
		 */
		"title" : {
			get : function() {
				return this._title;
			}
		},

		/**
		 * @property {string} description
		 * @readonly
		 */
		"description" : {
			get : function() {
				return this._description;
			}
		},

		/**
		 * @property {string} definition
		 * @readonly
		 */
		"definition" : {
			get : function() {
				return this._definition;
			}
		},

		/**
		 * @property {number} duration the duration of the rental in minutes
		 * @readonly
		 */
		"duration" : {
			get : function() {
				return this._duration;
			}
		},

		/**
		 * @property {string} currency
		 * @readonly
		 */
		"currency" : {
			get : function() {
				return this._currency;
			}
		},

		/**
		 * @property {number} price
		 * @readonly
		 */
		"price" : {
			get : function() {
				return this._price;
			}
		},
		
		/**
		 * @property {Boolean} isFree
		 * @readonly
		 */
		"isFree" : {
			get : function() {
				return (this._price && this._price) > 0 ? false : true;
			}
		}
	});

	return PurchaseOption;
}());
