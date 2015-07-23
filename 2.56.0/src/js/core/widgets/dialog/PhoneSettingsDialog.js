/**
 * SettingsDialog is a specialisation of a Dialog, it handles the settings UI component
 *
 * @class $U.core.widgets.dialog.PhoneSettingsDialog
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

$U.core.widgets.dialog.PhoneSettingsDialog = ( function() {

	var superClass = $U.core.widgets.dialog.SettingsDialog;

	var proto;

	var radioButtonCount;

	var ACTIVE_HIGHLIGHT = "dialog-active-highlight";

	var PhoneSettingsDialog = function(config, callback, owner) {
		superClass.call(this, config, callback, owner);
	};

	$N.apps.util.Util.extend(PhoneSettingsDialog, $U.core.widgets.dialog.SettingsDialog);
	proto = PhoneSettingsDialog.prototype;

	function getTransformProperty() {
		return $U.core.Device.getVendorPrefix().js + "Transform";
	}

	function getTransitionProperty() {
		return $U.core.Device.getVendorPrefix().js + "Transition";
	}

	function getTranslateXValue(Xvalue) {
		return "translateX" + "(" + Xvalue + "px)";
	}

	function getTransformValue() {
		return $U.core.Device.getVendorPrefix().css + "transform 0.2s linear";
	}

	/**
	 * Populates the dialog
	 * this overrides the $U.core.widgets.dialog.Dialog method
	 * @private
	 */
	proto._populate = function() {
		var config = this.getConfig();
		if (config.message) {
			this._createMessage();
		}
		if (config.listItems) {
			this._createListItems("dialog-list-no-bg");
		}
		if (config.form) {
			this._createForm();
		}
		if (config.secondaryMessage) {
			this._createSecondaryMessage();
		}
		if (config.buttons) {
			this._createButtons();
		}
		if (config.secondaryMessage || config.message) {
			$(document.getElementsByClassName("dialog-text")).addClass("dialog-text-settings").removeClass("dialog-text");
		}
	};

	/**
	 * activates the phone settings dialog
	 * @private
	 */
	proto._activate = function() {

		// superClass.prototype._activate.call(this);
		$U.core.View.showDialogScreen();
		$U.core.util.HtmlHelper.setDisplayNone(this._overlayEl);
		this._overlayEl.style[getTransformProperty()] = getTranslateXValue(window.innerWidth);
		this._overlayEl.style[getTransitionProperty()] = getTransformValue();

	};

	/**
	 * Sets the dialog overlay style.
	 * overrides the setOverlay
	 * @private
	 */
	proto._setOverlay = function() {
		var overlayEl = this.getOverlayEl();
		overlayEl.className = "dialog-overlay-settings";
	};

	/**
	 * Sets the dialog container style
	 * @private
	 */
	proto._setContainerClass = function() {
		var containerEl = this.getContainerEl();
		containerEl.className = "dialog-settings no-radius";
	};

	/**
	 * Sets the dialog body style
	 * @private
	 */
	proto._setBodyClass = function() {
		var containerEl = this.getContainerEl();
		if (this.getConfig().form) {
			containerEl.className = "dialog-form-padding no-radius";
		} else {
			containerEl.className = "dialog-no-padding no-radius";
		}
	};

	/**
	 * Makes the menu display in the dom by applying css classes to it
	 */
	proto.show = function() {
		var transProp;
		// Show the Phone settings dialog
		$U.core.util.HtmlHelper.setDisplayBlock(this._overlayEl);
		// Force a layout so to make sure the transition property has been applied
		transProp = window.getComputedStyle(this._overlayEl)[getTransitionProperty()];
		// As the Phone settings dialog is still out of view move it into view.
		this._overlayEl.style[getTransformProperty()] = getTranslateXValue(0);
	};

	/**
	 * Hide the menu by setting the translateX value back to 0.
	 */
	proto.hide = function() {

		var that = this;
		// Set the Phone Settings Dialog back out of the view
		this._overlayEl.style[getTransformProperty()] = getTranslateXValue(window.innerWidth);

		// Use the setTimeout method to destroy the Phone settings Dialog after it has been moved out of view
		// better to use the timeout method than a transitionEnd listener as not 100% cross browser reliable
		// the transition out takes aprox 200ms so give 500ms before destroy to allow 300ms grace
		setTimeout(function() {
			that._destroy();
		}, 500);

	};

	/**
	 * Resize the dialog
	 */
	proto.resizeHandler = function() {
		// do nothing in this instance
	};

	/**
	 * Shows any hidden text on the dialog
	 */
	proto.showSecondaryMessage = function() {
		superClass.prototype.showSecondaryMessage.call(this, "dialog-text-settings");
	};

	/**
	 * Handles the click on the option, it checks first if the user has already clicked on the item before send the click upto the superClass.
	 * @param {Object} evt
	 */
	proto._callToAction = function(evt) {
		if ($U.core.View.getCanClick()) {
			$U.core.View.setCanClick(false);
			superClass.prototype._callToAction.call(this, evt);
		}
	};

	return PhoneSettingsDialog;

}());
