/**
 * Object that represents a Dialog
 *
 * @class $U.core.widgets.dialog.Dialog
 *
 * @constructor
 * Create a new Dialog
 * @param {Object} configuration the configuration options supplied by the caller
 * @param {Function} callback a function to be executed by the caller
 * @param {Object} owner this is the caller class
 */

var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.dialog = $U.core.widgets.dialog || {};

$U.core.widgets.dialog.Dialog = ( function() {

	// The dialog scroller#s name
	var SCROLLER_NAME = "DialogScroller";

	var GUTTER = 20;

	var ACTIVE_HIGHLIGHT = "dialog-active-highlight";

	var supportsOrientationChange = "onorientationchange" in window;

	var orientationEvent = function() {
		window.scrollTo(0, 0);
	};

	var logger = $U.core.Logger.getLogger("$U.core.widgets.dialog");

	var radioButtonCount;

	var checkboxCount;

	var proto;

	var toastTimeout;

	var Dialog = function(config, callback, owner) {

		this._overlayEl = $U.core.util.DomEl.createDiv().attachTo($U.core.View.getViewContainer()).asElement();

		/**
		 * A container element for the dialog
		 * @private
		 */
		this._containerEl = $U.core.util.DomEl.createDiv().asElement();

		/**
		 * A dialog title element
		 * @private
		 */
		this._titleBarEl = $U.core.util.DomEl.createDiv().asElement();

		/**
		 * A dialog element
		 * @private
		 */
		this._dialogEl = $U.core.util.DomEl.createDiv().asElement();

		/**
		 * A container element for the dialog created in the caller
		 * @private
		 */
		this._config = config;
		/**
		 * a function to be executed by the caller
		 * @private
		 */
		this._callback = callback;
		/**
		 * The owner of the Dialog
		 * @private
		 */
		this._owner = owner;

		this._overlayEl.appendChild(this._containerEl);

		// Sets the dialog body on the dialog container
		this._containerEl.appendChild(this._dialogEl);

		this._isPhoneInstance = this instanceof $U.core.widgets.dialog.PhoneSettingsDialog;

	};

	Dialog.DIALOG_TYPE = {
		FULLSCREEN : {
			name : "fullscreen"
		},
		SETTINGS : {
			name : "settings"
		},
		GENERIC : {
			name : "generic"
		},
		TOAST : {
			name : "toast"
		}
	};

	Dialog.ATTRIBUTE_TYPES = {
		DATA_ATTRIBUTE : "data-attribute",
		DATA_INPUT_REQUIRED : "data-input-required"
	};

	/**
	 * Depending on which type we have set in our configuration create a suitable Dialog
	 *  @param {HTMLElement} container
	 *  @param {Function} callback
	 *  @param {Object} owner
	 */
	Dialog.create = function(config, callback, owner) {
		var result = null;
		switch (config.type) {
		case Dialog.DIALOG_TYPE.FULLSCREEN:
			result = new $U.core.widgets.dialog.FullscreenDialog(config, callback, owner);
			break;
		case Dialog.DIALOG_TYPE.SETTINGS:
			if ($U.core.Device.isPhone()) {
				result = new $U.core.widgets.dialog.PhoneSettingsDialog(config, callback, owner);
			} else {
				result = new $U.core.widgets.dialog.SettingsDialog(config, callback, owner);
			}
			break;
		case Dialog.DIALOG_TYPE.GENERIC:
			result = new $U.core.widgets.dialog.GenericDialog(config, callback, owner);
			break;
		case Dialog.DIALOG_TYPE.TOAST:
			result = new $U.core.widgets.dialog.GenericDialog(config);
			toastTimeout = window.setTimeout(function() {
				if (callback) {
					callback();
				} else {
					$U.core.View.hideDialog();
				}
			}, config.timeout);
			break;
		default:
			result = new $U.core.widgets.dialog.GenericDialog(config, callback, owner);
			break;
		}
		return result;
	};

	/**
	 * Gives the default error message configuration
	 * @param {String} title
	 * @param {String} message
	 * @param {boolean} messageIsHtml whether the message is html - if not then it's text
	 * @return {Object} error message configuration
	 */
	Dialog.getGenericMessageDialog = function(title, message, messageIsHtml, buttonText) {
		var genericMessageDialog = {
			title : title,
			type : $U.core.Device.isPhone() ? $U.core.widgets.dialog.Dialog.DIALOG_TYPE.FULLSCREEN : $U.core.widgets.dialog.Dialog.DIALOG_TYPE.GENERIC,
			className : "dialog-body padding",
			modal : true,
			buttons : [{
				text : buttonText ? buttonText : $U.core.util.StringHelper.getString("txtOK"),
				name : "close",
				focus : true
			}]
		};

		if (messageIsHtml) {
			genericMessageDialog.htmlmessage = message;
		} else {
			genericMessageDialog.message = message;
		}

		return genericMessageDialog;
	};

	/**
	 * Gives an error message which doesn't have any way to get rid of it.
	 * Showing this message will stop the user from using the app.
	 * @param {String} title
	 * @param {String} message
	 * @param {boolean} messageIsHtml whether the message is html - if not then it's text
	 * @return {Object} error message configuration
	 */
	Dialog.getTerminalMessageDialog = function(title, message, messageIsHtml) {
		var genericMessageDialog = {
			title : title,
			className : "dialog-body padding",
			modal : true
		};

		if (messageIsHtml) {
			genericMessageDialog.htmlmessage = message;
		} else {
			genericMessageDialog.message = message;
		}

		return genericMessageDialog;
	};

	/**
	 * Gives the toast message configuration
	 * @param {String} message
	 * @param {boolean} messageIsHtml whether the message is html - if not then it's text
	 * @param {number} timeout the time in milliseconds to show the message
	 * @return {Object} toast message configuration
	 */
	Dialog.getToastMessageDialog = function(message, messageIsHtml, timeout) {
		var toastMessageDialog = {
			dialogBodyClass : "dialog-toast padding",
			modal : true,
			type : Dialog.DIALOG_TYPE.TOAST,
			timeout : timeout
		};

		if (messageIsHtml) {
			toastMessageDialog.htmlmessage = message;
		} else {
			toastMessageDialog.message = message;
		}

		return toastMessageDialog;
	};

	function createBlurListener(el) {
		return function() {
			el.focus();
		};
	}

	proto = Dialog.prototype;

	/**
	 * Helper function to wrap up the creation of div elements
	 */
	function createDivEl(attachTo, className) {
		var style = className || "";
		var attachToEl = attachTo;
		return $U.core.util.DomEl.createDiv().setClassName(style).attachTo(attachToEl);
	}

	/**
	 * Helper function to wrap up the creation of elements with text
	 */
	function createElText(el, text, attachTo, className) {
		var style = className || "";
		var attachToEl = attachTo;
		return $U.core.util.DomEl.createElWithText(el, text).setClassName(style).attachTo(attachToEl);
	}

	/**
	 * Helper function to wrap up the creation of elements with html
	 */
	function createElHTML(el, html, attachTo, className) {
		var style = className || "";
		var attachToEl = attachTo;
		return $U.core.util.DomEl.createElWithHTML(el, html).setClassName(style).attachTo(attachToEl);
	}

	/**
	 * Create the title and populate the title bar
	 * For a dialog with the type 'settings' the title will be put in the header
	 * @private
	 */
	proto._createTitle = function() {
		var containerEl = this.getContainerEl();
		var dialogBody = this.getDialogEl();
		var config = this.getConfig();
		var title;
		if (config.title) {
			title = createElText("h2", config.title, this.getTitleBarEl());
			containerEl.insertBefore(this.getTitleBarEl(), dialogBody);
		}
	};

	/**
	 * Populates and activates the dialog. Usually called through the View
	 *  @param {Object} config
	 */
	proto.showDialog = function() {
		this._populate();
		this._addStyles();
		this._setOverlay();
		this._activate();
	};

	/**
	 * Applies the styles to the dialog using either the defaults or the classes
	 * supplied in the config
	 *  @param {Object} config
	 */
	proto._addStyles = function() {
		this._setTitleClass();
		this._setContainerClass();
		this._setBodyClass();
	};

	/**
	 * Shows the dialog and focuses the first inputbox
	 * @param {Boolean} [fromResize]
	 * @private
	 */
	proto._activate = function(fromResize) {

		var firstInput = this.getContainerEl().getElementsByClassName("dialog-input")[0];

		if (!fromResize && firstInput && $U.core.Device.isDesktop()) {
			firstInput.focus();
		}

		if (supportsOrientationChange) {
			window.addEventListener("orientationchange", orientationEvent);
		}
		$U.core.util.HtmlHelper.setDisplayBlock(this._overlayEl);
		$U.core.util.HtmlHelper.setVisibilityVisible(this._overlayEl);

		if (this.getContainerEl().scrollHeight > window.innerHeight) {
			// Only create a scroller if one doesn't already exist
			if (!this._dialogScroller) {
				this._dialogScroller = new $U.core.widgets.scroller.NagraScroller(this._overlayEl, {
					scrollingX : false,
					scrollingY : true,
					measureContent : true,
					bouncing : false,
					active : true
				}, SCROLLER_NAME);

				this._dialogScroller.reflow();
			}
		}
	};

	/**
	 * Populates the dialog
	 * this overrides the $U.core.widgets.dialog.Dialog method
	 */
	proto._populate = function() {
		var config = this.getConfig();
		if (config.title) {
			this._createTitle();
		}
		if (config.message) {
			this._createMessage();
		}
		if (config.htmlmessage) {
			this._createHTMLMessage();
		}
		if (config.listItems) {
			this._createListItems();
		}
		if (config.form) {
			this._createForm();
		}
		if (config.domElement) {
			this._addDomElement();
		}
		if (config.secondaryMessage) {
			this._createSecondaryMessage();
		}
		if (config.buttons) {
			this._createButtons();
		}
	};

	/**
	 * Hides the dialog with the option of destroying it
	 * @param {Boolean} [destroy]
	 */
	proto.deactivate = function(destroy) {
		if (supportsOrientationChange) {
			window.removeEventListener("orientationchange", orientationEvent);
		}
		if (this._config._postCloseCallback) {
			this._config._postCloseCallback();
		}
		if (toastTimeout) {
			window.clearTimeout(toastTimeout);
		}
		$U.core.util.HtmlHelper.setVisibilityHidden(this.getOverlayEl());
		if (destroy) {
			this._destroy();
		}
	};

	/**
	 * Removes the dialog from the DOM
	 * @private
	 */
	proto._destroy = function() {
		if (document.body.contains(this._overlayEl)) {
			this._overlayEl.parentNode.removeChild(this._overlayEl);
		}
	};

	/**
	 * Resize the dialog
	 */
	proto.resizeHandler = function() {
		var resize = true;
		this.deactivate();
		this._activate(resize);
	};

	/**
	 * Create the message and populate the dialog body
	 * @private
	 */
	proto._createMessage = function() {
		var newLines;
		var i;
		if (this._config.message) {
			newLines = this._config.message.split("\n");
			for ( i = 0; i < newLines.length; i++) {
				createElText("p", newLines[i], this.getDialogEl(), "dialog-text");
			}
		}
	};

	proto._addDomElement = function() {
		if (this._config.domElement) {
			this._config.domElement.attachTo(this.getDialogEl());
		}
	};

	/**
	 * Create the html message and populate the dialog body
	 * @private
	 */
	proto._createHTMLMessage = function() {
		if (this._config.htmlmessage) {
			createElHTML("div", this._config.htmlmessage, this.getDialogEl(), "dialog-text");
		}
	};

	/**
	 * Create the buttons and populate the dialog body
	 * @param {Object} buttons
	 * @private
	 */
	proto._createButtons = function() {
		var config = this.getConfig().buttons;
		this._btnContainer = createDivEl(this.getDialogEl(), "dialog-button-container").asElement();
		var btn;
		var btnEl;
		var btnArray = [];
		var i;
		var className = config.length <= 2 ? "dialog-button": "dialog-button btn-block";

		for ( i = 0; i < config.length; i++) {
			if (config[i]) {
				btn = createElText("button", config[i].text, this._btnContainer, className);
				btn.setAttributes([{
					name : Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE,
					value : config[i].name
				}]);
				btnEl = btn.asElement();
				btnEl.addEventListener("click", this._callToAction.bind(this), false);
				if (config[i].focus) {
					btnEl.focus();
					btnEl.addEventListener("blur", createBlurListener(btnEl));
				}
				btnArray.push(btn);
				if (config[i].icon) {
					btnEl.className = btnEl.className + " btn-padding";
					this._createIcons(btnEl, config[i].icon.iconPos, config[i].icon.iconClass);
				}
			}
		}
	};

	/**
	 * Create the list items and populate the dialog body
	 * @param {Object} liClassName the class used to render the list items
	 * @private
	 */
	proto._createListItems = function(liClassName) {
		var listItems = this.getConfig().listItems;
		var listItem;
		var anchor;
		var dialogBody = this.getDialogEl();
		var list = $U.core.util.DomEl.createEl("ul").setClassName("dialog-list-background").attachTo(dialogBody);
		var span;
		var i;

		if (!liClassName) {
			liClassName = "dialog-list";
		}

		//Firefox doesn't like adding the icon after the text, the text will overwrite the icon (see MSUI-474)
		for ( i = 0; i < listItems.length; i++) {

			listItem = $U.core.util.DomEl.createEl("li").setClassName(liClassName).attachTo(list).setAttributes([{
				name : Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE,
				value : listItems[i].name
			}]).asElement();

			if (listItems[i].hidden) {
				listItem.style.display = "none";
			}

			if (listItems[i].html) {
				listItem.appendChild(listItems[i].html);
			}

			// bind event listener
			listItem.addEventListener("click", this._callToAction.bind(this), false);

			span = $U.core.util.DomEl.createEl("span").attachTo(listItem).asElement();

			if (listItems[i].icon) {
				this._createIcons(span, null, "dialog-list-icon " + listItems[i].icon);
			}

			anchor = $U.core.util.DomEl.createEl("a").setClassName("dialog-list-item").attachTo(listItem).asElement();

			anchor.appendChild(document.createTextNode(listItems[i].text));

			// Add highlight to channel bar if user touches it for mobile only
			if (!$U.core.Device.isDesktop()) {
				$U.core.util.Highlighter.applyTouchHighlight(listItem, ACTIVE_HIGHLIGHT);
			}

		}
	};

	/**
	 * Create Icons and prepends them to the button
	 * @param {HTMLElement} btn
	 * @param {string} position left/right
	 * @param {string} className the class of the icon from font awesome
	 * @private
	 */
	proto._createIcons = function(btn, position, className) {
		var config = this.getConfig().buttons;
		//@formatter:off
		$U.core.util.DomEl.createEl(
			"i"
		).setClassName(
			"dialog-button-icon-" + position + " " + className
		).prependTo(
			btn
		);
		//@formatter:on
	};

	/**
	 * Creates a form and adds it to the dialog
	 * @param {Object} formConfig
	 * @private
	 */
	proto._createForm = function() {
		var config = this.getConfig().form;
		var form;
		var i;

		radioButtonCount = 0;

		//@formatter:off
		form = $U.core.util.DomEl.createEl(
			"form"
		).attachTo(
			this.getDialogEl()
		).setAttribute(
			"autocomplete", "off"
		).asElement();
		//@formatter:on

		function keyDownListener(evt) {
			if (evt.which === 13) {
				evt.preventDefault();
				this._callToAction(evt);
			}
		}


		form.addEventListener("keydown", keyDownListener.bind(this));

		for ( i = 0; i < config.fields.length; i++) {
			this._createFields(config.fields[i], form);
		}
	};

	/**
	 * Creates fields and adds them to the form
	 * @param {Array} fields
	 * @private
	 */
	proto._createFields = function(fields, form) {

		var htmlElement;
		var that = this;

		switch (fields.type) {
		case "text" :
		case "password" :
			htmlElement = this._createInputField(fields);
			htmlElement.attachTo(form).asElement();

			break;
		case "radio" :
			htmlElement = this._createRadioField(fields);
			form.appendChild(htmlElement);
			break;
		case "checkbox" :
			htmlElement = this._createCheckboxField(fields);
			form.appendChild(htmlElement);
			break;
		}
	};

	proto._createInputField = function(fields) {
		var inputWrapper;
		var inpuut;
		var focusedElement;

		var that = this;

		function clearWarning(evt) {
			var inputWarning;
			var input = evt.currentTarget;

			input.className = "dialog-input";

			inputWarning = input.parentNode.getElementsByTagName("i")[0];

			if (inputWarning) {
				inputWarning.parentNode.removeChild(inputWarning);
			}
		}

		var inputWrapprer = $U.core.util.DomEl.createDiv().setClassName("dialog-input-wrapper");

		var input = $U.core.util.DomEl.createEl("input").setClassName("dialog-input").setAttributes([{
			name : "name",
			value : fields.name
		}, {
			name : "type",
			value : fields.type
		}, {
			name : "value",
			value : fields.value || ""
		}, {
			name : "placeholder",
			value : fields.placeholder || ""
		}, {
			name : Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE,
			value : fields.name
		}, {
			name : "autocorrect",
			value : "off"
		}, {
			name : "autocapitalize",
			value : "off"
		}, {
			name : "maxlength",
			value : fields.maxlength || ""
		}, {
			name : "data-input-required",
			value : fields.required || false
		}]).attachTo(inputWrapprer);

		input.asElement().addEventListener("keydown", clearWarning);

		// Create a scroller on focus of an input so that a user is able to scroll inputs into focus if necessary
		input.asElement().addEventListener("focus", function(evt) {

			focusedElement = evt.currentTarget;

			if ($U.core.Device.isAndroid()) {
				// Only create a scroller if one doesn't already exist
				if (!that._dialogScroller) {
					that._dialogScroller = new $U.core.widgets.scroller.NagraScroller(that._overlayEl, {
						scrollingX : false,
						scrollingY : true,
						measureContent : true,
						bouncing : false,
						active : true
					}, SCROLLER_NAME);

					that._dialogScroller.reflow();
				}
			}
		});

		input.asElement().addEventListener("blur", function(evt) {
			if (that._dialogScroller) {
				// Only reset and delete the scroller if the user doesn't focus on another input field
				if (!evt.relatedTarget || evt.relatedTarget && focusedElement.nodeName !== evt.relatedTarget.nodeName) {
					// Set the scroller back to the top
					that._dialogScroller.reset();
					// Now destory it so that scrolling no longer occurs
					that._dialogScroller.destroy();
					// Clear the Scroller Obj
					delete that._dialogScroller;
				}
			}
		});

		return inputWrapprer;
	};

	proto._createRadioField = function(fields) {
		var input;
		var label;
		var li;

		var listItemClass = this._isPhoneInstance ? "dialog-list-no-bg" : "dialog-list dialog-radio";
		var labelItemClass = this._isPhoneInstance ? "dialog-radio-label-light" : "dialog-radio-label-dark";

		radioButtonCount++;

		li = $U.core.util.DomEl.createEl("li").setClassName(listItemClass).asElement();

		if (fields.hidden) {
			li.style.display = "none";
		}

		// Add highlight to channel bar if user touches it for mobile only
		if (!$U.core.Device.isDesktop()) {
			$U.core.util.Highlighter.applyTouchHighlight(li, ACTIVE_HIGHLIGHT);
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

		if(fields.changeEvt){
			input.asElement().addEventListener("change", fields.changeEvt);
		}

		$U.core.util.DomEl.createElWithText(
			"label",
			fields.label
		).setClassName(
			labelItemClass
		).attachTo(
			li
		).setAttribute(
			"for",
			fields.id
		);
		return li;
		//@formatter:on
	};

	proto._createCheckboxField = function(fields) {
		var input;
		var label;
		var li;

		checkboxCount++;

		var listItemClass = this._isPhoneInstance ? "dialog-list-no-bg" : "dialog-list dialog-checkbox";
		var labelItemClass = this._isPhoneInstance ? "dialog-checkbox-label-light" : "dialog-checkbox-label-dark";

		li = $U.core.util.DomEl.createEl("li").setClassName(listItemClass).asElement();

		if (fields.hidden) {
			li.style.display = "none";
		}

		// Add highlight to channel bar if user touches it for mobile only
		if (!$U.core.Device.isDesktop()) {
			$U.core.util.Highlighter.applyTouchHighlight(li, ACTIVE_HIGHLIGHT);
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
			name : Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE,
			value : fields.name
		}, {
			name : "id",
			value : fields.id
		}]).attachTo(li);

		if (fields.checked) {
			input.setAttribute("checked", true);
		}

		if(fields.changeEvt){
			input.asElement().addEventListener("change", fields.changeEvt);
		}

		$U.core.util.DomEl.createElWithText(
			"label",
			fields.label
		).setClassName(
			labelItemClass
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
	 * Creates a message to show below a form
	 * @private
	 */
	proto._createSecondaryMessage = function() {
		var text = this._config.secondaryMessage.split("\n");
		var dialogBody = this.getDialogEl();
		var i;

		for ( i = 0; i < text.length; i++) {
			createElText("p", text[i], dialogBody, "dialog-text-hidden");
		}
	};

	/**
	 * Sets the dialog container style
	 * @param {String} [className="dialog"]
	 * @private
	 */
	proto._setContainerClass = function() {
		var config = this.getConfig();
		var containerEl = this.getContainerEl();
		this._containerEl.className = config.dialogClass ? config.dialogClass : "dialog";
	};

	/**
	 * Sets the dialog container style
	 * @private
	 */
	proto._setTitleClass = function() {
		this.getTitleBarEl().className = "dialog-title-bar";
	};

	/**
	 * Sets the dialog body style
	 * @param {String} [className="dialog-body dialog-padding"]
	 * @private
	 */
	proto._setBodyClass = function() {
		var config = this.getConfig();
		var dialogEl = this.getDialogEl();
		dialogEl.className = config.dialogBodyClass ? config.dialogBodyClass : "dialog-body dialog-padding";
	};

	/**
	 * Set the position of the dialog. If a HTMLElement is provided
	 * call method to try and set element to its position
	 * @param {HTMLElement} [element]
	 * @private
	 */
	proto._setPosition = function(element) {

		var totalDialogH;
		var el = document.getElementById(element);

		if (!this._dialogWidth && !this._dialogHeight) {
			this._dialogWidth = this.getDialogWidth();
			this._dialogHeight = this.getDialogHeight();
		}

		if (el) {
			this._setPositionToElement(el);
		} else {

			totalDialogH = this._dialogHeight + GUTTER + GUTTER + 80;

			if (totalDialogH > window.innerHeight) {
				// For all devices if the dialog height is bigger than the screen size then set top and bottom to be the gutter size
				$U.core.util.HtmlHelper.setTop(this._containerEl, GUTTER);
				$U.core.util.HtmlHelper.setBottom(this._containerEl, GUTTER);

			} else {
				if ($U.core.Device.isDesktop() || this._config.type === Dialog.DIALOG_TYPE.TOAST) {
					// If the dialog is small enough to fit in the screen then Desktop devices and toast messages should always centre the dialogs in the screen
					$U.core.util.HtmlHelper.centreElementInParent(this._containerEl);
				} else {
					// All other devices should use as much real estate as possible and set the top to be gutter plus some extra
					$U.core.util.HtmlHelper.setTop(this._containerEl, GUTTER + 80);
				}
			}

			// As the dialog is bigger than the screen it will become a scroller. To make sure we can scroll the overlay. Set the overlay to be big enough to scroll
			if (this._btnContainer) {
				this._overlayEl.style.height = $U.core.View.getViewContainer().clientHeight + this._dialogHeight - this._btnContainer.clientHeight + "px";
			} else {
				this._overlayEl.style.height = $U.core.View.getViewContainer().clientHeight + this._dialogHeight;
			}

			// device agnostic always centre horizontally
			this._containerEl.style.left = "50%";
			this._containerEl.style.marginLeft = -Math.abs(this._dialogWidth) / 2 + "px";

			if (this._dialogScroller) {
				this._dialogScroller.reflow();
			}
		}
	};

	/**
	 * Set the position of the dialog to the position of an on screen
	 * HTMLElement
	 * @param {HTMLElement} element
	 * @private
	 */
	proto._setPositionToElement = function(element) {
		var eh = element.offsetHeight;
		var et = element.offsetTop + eh;
		var el = element.offsetLeft;
		var sw = $U.core.View.getViewContainer().offsetWidth;
		var sh = $U.core.View.getViewContainer().offsetHeight;
		var right = $U.core.Device.isPhone() ? "10px" : "20px";
		var tw = el + this._dialogWidth;
		if (tw > sw) {
			this._containerEl.style.right = right;
			this._containerEl.style.top = et + "px";
		} else {
			this._containerEl.style.left = el + "px";
			this._containerEl.style.top = et + "px";
		}
	};

	/**
	 * Generic handler which should be applied to all elements that a user may click
	 * @param {Event} evt
	 * @private
	 */
	proto._callToAction = function(evt) {

		var elements = this.getContainerEl().getElementsByTagName("*");
		var current = evt.currentTarget;
		var interactiveEls;

		// IE9 returns a node list for elements (not an array) so it's
		// necessary to iterate over all the keys, not simply the numeric indices
		// var keys = Object.keys(elements);
		var l = elements.length;
		var i;
		var el;

		// Disable placeholders otherwise the input field values will be the placeholders
		window.Placeholders.disable(this.getContainerEl());

		evt.stopPropagation();

		/**
		 * Checks whether the input element has a class of "required" already assigned
		 * @param HTMLElement
		 */
		function doesContainRequirdClass(elem) {
			var r = elem.className.indexOf("required") === -1 ? true : false;
			return r;
		}

		/** Add the required class to the input element and create a warning icon to display
		 * @param HTMLElement
		 */
		function addRequired(elem) {
			var errorIcon = $U.core.util.DomEl.createEl("i").setClassName("dialog-input-warning icon-warning-sign").asElement();
			elem.className = elem.className + " " + "required";
			elem.parentNode.appendChild(errorIcon);
		}

		function isRequired(elem) {
			var r = elem.getAttribute(Dialog.ATTRIBUTE_TYPES.DATA_INPUT_REQUIRED) === "true" ? true : false;
			return r;
		}

		interactiveEls = [{
			buttonClicked : current ? current.getAttribute(Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE) : undefined,
			buttonClickedEl : current ? current : undefined
		}];

		for ( i = 0; i < l; i++) {
			el = elements[i];
			if (el.hasAttribute && el.hasAttribute(Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE)) {
				if (isRequired(el) && el.value === "") {
					if (doesContainRequirdClass(el)) {
						addRequired(el);
					}
				}

				interactiveEls.push({
					type : el.nodeName,
					name : el.getAttribute(Dialog.ATTRIBUTE_TYPES.DATA_ATTRIBUTE),
					value : el.value,
					checked : el.checked
				});
			}
		}

		// Enable placeholders
		window.Placeholders.enable(this.getContainerEl());
		this._callback(interactiveEls, this._owner);
	};

	/**
	 * Changes the class applied to a specific button. Intended to be the button that was clicked
	 * @param {HTMLElement} button this is the button that was clicked
	 * @param {String} className
	 */
	proto.setButtonIcon = function(button, iconClass) {
		var icon = button.getElementsByTagName("i")[0].className = iconClass;
	};

	/**
	 * returns the dialogs Configuration
	 * @return {Object}
	 */
	proto.getConfig = function() {
		return this._config;
	};

	/**
	 * returns the dialogs overlay
	 * @return {HTMLElement}
	 */
	proto.getOverlayEl = function() {
		return this._overlayEl;
	};
	/**
	 * returns the dialogs container
	 * @return {HTMLElement}
	 */
	proto.getContainerEl = function() {
		return this._containerEl;
	};

	/**
	 * returns the dialogs title bar
	 * @return {HTMLElement}
	 */
	proto.getTitleBarEl = function() {
		return this._titleBarEl;
	};
	/**
	 * returns the dialogs body
	 * @return {HTMLElement}
	 */
	proto.getDialogEl = function() {
		return this._dialogEl;
	};
	/**
	 * returns the dialogs width
	 * @return {Number}
	 */
	proto.getDialogWidth = function() {
		return this.getContainerEl().getBoundingClientRect().width;
	};
	/**
	 * returns the dialogs height
	 * @return {Number}
	 */
	proto.getDialogHeight = function() {
		return this.getContainerEl().getBoundingClientRect().height;
	};
	/**
	 * returns the dialogs title
	 * @return {String}
	 */
	proto.getTitle = function() {
		var config = this.getConfig();
		return config.title || null;
	};

	/**
	 * Shows any hidden text on the dialog
	 * @param {String} newClass optional name for the new class of the secondary message
	 */
	proto.showSecondaryMessage = function(newClass) {
		var hidden = this._dialogEl.getElementsByClassName("dialog-text-hidden");
		var i;
		var len = hidden.length;
		for ( i = 0; i < len; i++) {
			hidden[i].className = newClass ? newClass : "dialog-text";
		}
	};

	proto.clearPasswordFields = function() {
		var pwdFields = document.querySelectorAll("input[type='password']");
		var i, l;

		l = pwdFields.length;

		for ( i = 0; i < pwdFields.length; i++) {
			pwdFields[i].value = "";
		}
	};

	return Dialog;

}());
