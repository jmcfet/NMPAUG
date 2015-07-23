var $U = $U || {};
$U.header = $U.header || {};
/** * $U.header.DesktopHeaderBar */$U.header.DesktopHeaderBar = ( function() {
	var superClass = $U.header.HeaderBar;	var proto;
	var HEADER_ICONS = $U.header.HeaderBar.HEADER_ICONS;
	function DesktopHeaderBar(owner) {
		superClass.call(this, owner);
	}
	$N.apps.util.Util.extend(DesktopHeaderBar, superClass);	proto = DesktopHeaderBar.prototype;	proto._createToolBar = function() {		var parentalIcon;		parentalIcon = $U.core.parentalcontrols.ParentalControls.isLocked() ? HEADER_ICONS.iconLock : $U.header.HeaderBar.HEADER_ICONS.iconUnlock;		this._buttons.push($U.header.HeaderBar.createButtonObj("Parental", "parentalButton", "parental", parentalIcon, this._toolsHandler.bind(this)));		this._buttons.push($U.header.HeaderBar.createButtonObj("Settings", "settingsButton", "settings", HEADER_ICONS.iconSettings, this._toolsHandler.bind(this)));		superClass.prototype._createToolBar.call(this);	};
	/**	 * Enable the HeaderBar.	 */	proto.enable = function() {		this._searchBar.enable();	};
	/**	 * Disable the HeaderBar.	 */	proto.disable = function() {		this._searchBar.disable();	};
	return DesktopHeaderBar;}());
