/**
 * @class $U.core.widgets.search.StandAloneSearchBar
 * @extends $U.core.widgets.search.SearchBar
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.widgets = $U.core.widgets || {};
$U.core.widgets.search = $U.core.widgets.search || {};

$U.core.widgets.search.StandAloneSearchBar = ( function() {

	var logger = $U.core.Logger.getLogger("StandAloneSearchBar");

	var proto;

	var superClass;

	var StandAloneSearchBar = function(owner) {
		superClass.call(this, owner);
	};

	// Extends the Search Bar
	superClass = $U.core.widgets.search.SearchBar;

	$N.apps.util.Util.extend(StandAloneSearchBar, superClass);

	// short hand for prototype
	proto = StandAloneSearchBar.prototype;

	/**
	 * This method build the HTML elements that make up the search bar
	 * @param {HTMLElement} docRef - the HTMLELement that will contain the search bar
	 */
	proto._build = function(docRef) {
		// create the HTML elements for the search bar
		this._searchContainer = document.createElement("div");
		this._inputEl = document.createElement("input");
		this._buttonEl = document.createElement("button");
		this._buttonIcon = document.createElement("i");
		this._suggestionsEl = document.createElement("ul");
		this._loadingAnimation = document.createElement("i");

		//Add styles to the HTML elements
		this._searchContainer.className = "search-container";
		this._buttonEl.className = "search-button";
		this._inputEl.className = "search-input ui-autocomplete-input";
		this._suggestionsEl.className = "search-suggestions-container";
		this._buttonIcon.className = "icon-search";
		this._loadingAnimation.className = "seach-loading-icon icon-spinner icon-spin";

		// Append the HTML Elements to the container
		this._searchContainer.appendChild(this._inputEl);
		this._searchContainer.appendChild(this._loadingAnimation);
		this._searchContainer.appendChild(this._suggestionsEl);

		this._buttonEl.appendChild(this._buttonIcon);

		// Finally append them all to the container
		docRef.appendChild(this._searchContainer);
		docRef.appendChild(this._buttonEl);

		//Set up the suggestions container
		this._setSuggestionContainer(this._suggestionsEl);
	};

	/**
	 * Resizes the input elements depending on the screen size
	 */
	proto.resizeHandler = function() {
		var viewContainer;
		var screenWidth;
		var buttonWidth;
		var inputWidth;
		// left/right and space between input and button (*3)
		var gutters = this._gutterSize * 3;

		// get the name of the screen that the input belongs to
		viewContainer = $U.core.View.getViewContainer();
		// get the screen width
		screenWidth = viewContainer.getBoundingClientRect().width;
		// Get the width of the search button
		buttonWidth = this._buttonEl.getBoundingClientRect().width;
		// Set the width of the input element
		inputWidth = screenWidth - buttonWidth - gutters;
		// set the element width
		$U.core.util.HtmlHelper.setWidth(this._searchContainer, inputWidth);
		$U.core.util.HtmlHelper.setWidth(this._inputEl, inputWidth);
		$U.core.util.HtmlHelper.setWidth(this._suggestionsEl, inputWidth);

	};

	return StandAloneSearchBar;
}()); 