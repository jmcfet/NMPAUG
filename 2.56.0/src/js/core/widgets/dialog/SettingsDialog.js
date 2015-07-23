/**
 * SettingsDialog is a specialisation of a Dialog, it handles the settings UI component
 *
 * @class $U.core.widgets.dialog.SettingsDialog
 * @extends $U.core.widgets.dialog.Dialog
 *
 * @constructor
 * Create a new Settings Dialog
 * @param {HTMLElement} container
 * @param {Function} callback
 * @param {Object} owner this is the caller class
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.dialog = $U.core.widgets.dialog || {};

$U.core.widgets.dialog.SettingsDialog = ( function() {

	var superClass = $U.core.widgets.dialog.Dialog;
	var proto;

	var SettingsDialog = function(config, callback, owner) {
		superClass.call(this, config, callback, owner);
	};

	$N.apps.util.Util.extend(SettingsDialog, $U.core.widgets.dialog.Dialog);
	proto = SettingsDialog.prototype;

	/**
	 * Activates the dialog.
	 * overrides $U.core.widgets.dialog.Dialog activate however calls the
	 * parents activate method also
	 */
	proto._activate = function(fromResize) {
		var config = this.getConfig();

		if (!fromResize) {
			this._setPosition(config.position);
		} else if(!$U.core.Device.isPhone() && fromResize) {
			this._setPosition(config.position);
		}
		superClass.prototype._activate.call(this);
	};

	/**
	 * Sets the dialog overlay style and event listener if required
	 * For the settings Dialog we do not need an event listener
	 * @param {String} [className="dialog-overlay-modal"]
	 * @private
	 */
	proto._setOverlay = function() {
		var overlayEl = this.getOverlayEl();
		overlayEl.className = "dialog-overlay-modal";
		overlayEl.addEventListener("click", this._callToAction.bind(this));
	};

	/**
	 * Sets the dialog body style
	 * @param {String} [className="dialog-body dialog-padding"]
	 * @private
	 */
	proto._setBodyClass = function() {
		var config = this.getConfig();
		var dialogEl = this.getDialogEl();
		dialogEl.className = config.dialogBodyClass ? config.dialogBodyClass : "dialog-body dialog-no-padding";
	};

	return SettingsDialog;

}());
