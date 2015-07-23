var $U = $U || {};
$U.header = $U.header || {};

/**
 * $U.header.TabletHeaderBar
 */

$U.header.TabletHeaderBar = ( function() {

	var superClass = $U.header.HeaderBar;
	var proto;

	var HEADER_ICONS = $U.header.HeaderBar.HEADER_ICONS;

	/**
	 * @class $U.header.TabletHeaderBar

	 * Object that represents a Header
	 * @template
	 * @constructor
	 * @param {Object} owner
	 */
	var TabletHeaderBar = function(owner) {
		superClass.call(this, owner);
	};

	$N.apps.util.Util.extend(TabletHeaderBar, $U.header.HeaderBar);
	proto = TabletHeaderBar.prototype;

	proto._createToolBar = function() {
		var parentalIcon;

		parentalIcon = $U.core.parentalcontrols.ParentalControls.isLocked() ? HEADER_ICONS.iconLock : $U.header.HeaderBar.HEADER_ICONS.iconUnlock;

		this._buttons.push($U.header.HeaderBar.createButtonObj("Parental", "parentalButton", "parental", parentalIcon, this._toolsHandler.bind(this)));
		this._buttons.push($U.header.HeaderBar.createButtonObj("Settings", "settingsButton", "settings", HEADER_ICONS.iconSettings, this._toolsHandler.bind(this)));
		this._buttons.push($U.header.HeaderBar.createButtonObj("Search", "searchButton", "search", HEADER_ICONS.iconSearch, this._toolsHandler.bind(this)));

		superClass.prototype._createToolBar.call(this);
	};

	return TabletHeaderBar;

}());
