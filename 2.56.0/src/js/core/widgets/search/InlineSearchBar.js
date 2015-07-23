/**
 *
 *
 * @class $U.core.widgets.search.InlineSearchBar
 * @extends  $U.core.widgets.search.SearchBar
 *
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.search = $U.core.widgets.search || {};

$U.core.widgets.search.InlineSearchBar = ( function() {

	var logger = $U.core.Logger.getLogger("InlineSearchBar");

	var proto;

	var superClass;

	var InlineSearchBar = function(owner) {
		superClass.call(this, owner);

		this._isShown = false;
	};

	// Extends the SearchBar
	superClass = $U.core.widgets.search.SearchBar;

	$N.apps.util.Util.extend(InlineSearchBar, superClass);
	// short hand for prototype
	proto = InlineSearchBar.prototype;

	/**
	 * This method build the HTML elements that make up the search bar
	 * @param {HTMLElement} docRef - the HTMLELement that will contain the search bar
	 */
	proto._build = function(docRef) {
		// create the HTML elements for the search bar
		this._searchContainer = document.createElement("div");
		this._inputEl = document.createElement("input");
		this._buttonEl = document.createElement("i");
		this._suggestionsEl = document.createElement("ul");
		this._closeButtonEl = document.createElement("i");

		//Add styles to the HTML elements
		this._searchContainer.className = "search-inline-container";
		this._buttonEl.className = "search-inline-container-icon-search icon-search icon-2x";
		this._inputEl.className = "search-inline-input ui-autocomplete-input";
		this._suggestionsEl.className = "search-suggestions-inline-container";
		this._closeButtonEl.className = "search-inline-container-icon-close icon-remove icon-2x";

		// Append the HTML Elements to the container
		if(!$U.core.Device.isDesktop()){
			this._searchContainer.appendChild(this._closeButtonEl);
		}
		this._searchContainer.appendChild(this._inputEl);
		this._searchContainer.appendChild(this._buttonEl);
		this._searchContainer.appendChild(this._suggestionsEl);

		// Finally append them all to the container
		docRef.appendChild(this._searchContainer);
		$U.core.util.HtmlHelper.setClass(docRef, "tools-inline-search");
		//Set up the suggestions container
		this._setSuggestionContainer(this._suggestionsEl);

	};

	/**
	 * Enable the SearchBar.
	 */
	proto.enable = function() {
		this._inputEl.disabled = false;
	};

	/**
	 * Disable the SearchBar.
	 */
	proto.disable = function() {
		this._inputEl.disabled = true;
	};

	proto.hide = function() {
		if (this._searchContainer) {
			this._inputEl.blur();
			$U.core.util.HtmlHelper.setVisibilityHidden(this._searchContainer);
			this._searchContainer.style.opacity = 0;
			this._isShown = false;
		}
	};

	proto.show = function() {
		var that = this;
		if (this._searchContainer) {
			$U.core.util.HtmlHelper.setVisibilityVisible(this._searchContainer);
			setTimeout(function(){
				that._searchContainer.style.opacity = 1;
				that._inputEl.focus();
				that._isShown = true;
			},200);
		}
	};

	proto.hideAndResetHeaderBar = function() {
		if (this._searchContainer) {
			this._inputEl.blur();
			$U.core.util.HtmlHelper.setVisibilityHidden(this._searchContainer);
			this._searchContainer.style.opacity = 0;
			$U.core.View.getHeader().restoreHeaderBar();
			this._isShown = false;
		}
	};
	/**
	 * Resize handler
	 */
	proto.resizeHandler = function() {
		//do nothing
	};

	proto.getIsShown = function(){
		return this._isShown;
	};

	return InlineSearchBar;
}());