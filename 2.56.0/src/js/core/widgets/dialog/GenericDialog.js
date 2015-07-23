/**
 * Generic Dialog is a specialisation of a Dialog
 *
 * @class $U.core.widgets.dialog.GenericDialog
 * @extends $U.core.widgets.dialog.Dialog
 *
 * @constructor
 * Create a new Generic Dialog
 * @param {HTMLElement} container
 * @param {Function} callback
 * @param {Object} owner this is the caller class
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.dialog = $U.core.widgets.dialog || {};

$U.core.widgets.dialog.GenericDialog = ( function() {

	var superClass = $U.core.widgets.dialog.Dialog;
	var proto;

	var GenericDialog = function(config, callback, owner) {
		superClass.call(this, config, callback, owner);
	};

	$N.apps.util.Util.extend(GenericDialog, $U.core.widgets.dialog.Dialog);
	proto = GenericDialog.prototype;

	/**
	 * Shows the dialog
	 * @private
	 */
	proto._activate = function() {
		this._setPosition(this._config.position);
		superClass.prototype._activate.call(this);
	};

	/**
	 * Sets the dialog overlay style
	 * @param {String} [className="dialog-overlay-modal"]
	 * @private
	 */
	proto._setOverlay = function() {
		var config = this.getConfig();
		var overlayEl = this.getOverlayEl();
		var eventListener = config.modal ? null : this._callToAction.bind(this);

		overlayEl.className = config.modal ? "dialog-overlay-modal" : "dialog-overlay";
		overlayEl.addEventListener("click", eventListener);
	};
	return GenericDialog;

}());
