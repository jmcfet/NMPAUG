var $U = $U || {};
$U.header = $U.header || {};

	var superClass = $U.header.HeaderBar;
	var HEADER_ICONS = $U.header.HeaderBar.HEADER_ICONS;
	function DesktopHeaderBar(owner) {
		superClass.call(this, owner);
	}
	$N.apps.util.Util.extend(DesktopHeaderBar, superClass);
	/**
	/**
	return DesktopHeaderBar;