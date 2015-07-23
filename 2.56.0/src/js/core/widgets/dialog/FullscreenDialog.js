/**
 * Full screen Dialog is a specialisation of a Dialog, the signon screen is currently a full screen dialog
 *
 * @class $U.core.widgets.dialog.FullscreenDialog
 * @extends $U.core.widgets.dialog.Dialog
 *
 * @constructor
 * Create a new Full screen Dialog
 * @param {HTMLElement} container
 * @param {Function} callback
 * @param {Object} owner this is the caller class
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.dialog = $U.core.widgets.dialog || {};

$U.core.widgets.dialog.FullscreenDialog = ( function() {

	var superClass = $U.core.widgets.dialog.Dialog;

	var proto;

	var radioButtonCount;

	var FullscreenDialog = function(config, callback, owner) {
		superClass.call(this, config, callback, owner);
		this._overlayListener = null;
	
	};

	$N.apps.util.Util.extend(FullscreenDialog, $U.core.widgets.dialog.Dialog);
	proto = FullscreenDialog.prototype;

	/**
	 * Create the title for the dialog, as it is fullscreen set the class to fullscreen
	 * @private
	 */
	proto._createTitle = function() {
		superClass.prototype._createTitle.call(this);
		this._setTitleClass();
	};
	/**
	 * Sets the dialog container style
	 * @private
	 */
	proto._setTitleClass = function() {
		this.getTitleBarEl().className = "dialog-fullscreen-title";
	};

	/**
	 * Sets the dialog overlay style
	 * @param {String} [className="dialog-overlay-modal"]
	 * @private
	 */
	proto._setOverlay = function() {
		var overlayEl = this.getOverlayEl();
		overlayEl.className = "dialog-overlay";
	};

	proto._createRadioField = function(fields) {
		var input;
		var label;
		var li;

		radioButtonCount++;

		li = $U.core.util.DomEl.createEl("li").setClassName("dialog-list-no-bg").asElement();

		// Add highlight to channel bar if user touches it for mobile only
		if (!$U.core.Device.isDesktop()) {
			$U.core.util.Highlighter.applyTouchHighlight(li, "dialog-active-highlight");
		}

		//@formatter:off
		input = $U.core.util.DomEl.createEl(
			"input"
		).setClassName(
			"dialog-input"
		).setAttributes([{
			name : "name",
			value : fields.name
		}, {
			name : "type",
			value : fields.type
		}, {
			name : "value",
			value : fields.value || ""
		}, {
			name : $U.core.widgets.dialog.Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE,
			value : fields.name
		}, {
			name : "id",
			value : fields.id
		}]).attachTo(li);

		if (fields.checked) {
			input.setAttribute("checked", true);
		}

		$U.core.util.DomEl.createElWithText(
			"label",
			fields.label
		).setClassName(
			"dialog-radio-label-light"
		).attachTo(
			li
		).setAttribute(
			"for",
			fields.id
		);
		return li;
		//@formatter:on
	};

	/**
	 * Sets the dialog container style
	 * @private
	 */
	proto._setContainerClass = function() {
		var config = this.getConfig();
		var container = this.getContainerEl();
		container.className = config.dialogClass ? config.dialogClass : "dialog-fullscreen";
	};

	/**
	 * Sets the dialog body style
	 * @private
	 */
	proto._setBodyClass = function() {
		var config = this.getConfig();
		var body = this.getDialogEl();
		body.className = "dialog-body";
	};

	/**
	 * Shows the dialog
	 * @param {Boolean} [fromResize]
	 * @private
	 */
	proto._activate = function(fromResize) {
		superClass.prototype._activate.call(this, fromResize);

		var containerHeight = $U.core.View.getViewContainer().clientHeight;
		var dialogTitleHeight = this._titleBarEl.clientHeight;
		var dialogBodyHeight = this._dialogEl.clientHeight;

		this._overlayEl.style.height = containerHeight + dialogTitleHeight + dialogBodyHeight + "px";
		if (this._dialogScroller) {
			this._dialogScroller.reflow();
		}
	};

	/**
	 * Hides the dialog with the option of destroying it
	 * @param {Boolean} [destroy]
	 */
	proto.deactivate = function(destroy) {
		// $U.core.util.ScrollableHelper.disableScrollForContainer(this.getContainerEl());
		superClass.prototype.deactivate.call(this, destroy);
	};

	/**
	 * Append an element to this FullscreenDialog's container.
	 * Used to add language selection table to the sign on page
	 * @param {Object} element the element to append
	 */
	proto.appendElement = function(element) {
		this._containerEl.appendChild(element);
	};

	return FullscreenDialog;

}());
