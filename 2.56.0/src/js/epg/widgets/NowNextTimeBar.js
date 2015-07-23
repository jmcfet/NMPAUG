/**
 * @class $U.epg.widgets.NowNextTimeBar
 * @extends $U.epg.widgets.TimeBar
 * Class that represents the Time Bar in an EPG
 *
 * @constructor
 * @param {HTMLElement} container Container that will hold this channel bar
 * @param {Object} EPGConfig EP configuration object
 * @param {Object} owner Owner object (most likely its caller)
 * @param {Object} EPGState EPG State object 
 */
var $U = $U || {};
$U.epg = $U.epg || {};
$U.epg.widgets = $U.epg.widgets || {};

$U.epg.widgets.NowNextTimeBar = ( function() {
	
	
	var NowNextTimeBar = function(container, EPGConfig, owner, EPGState) {
		$U.epg.widgets.TimeBar.call(this, container, EPGConfig, owner, EPGState);
	};

	//Extends class EPGEvent
	$N.apps.util.Util.extend(NowNextTimeBar, $U.epg.widgets.TimeBar);
	/**
	 * Populates the 'timebar' with now and next
	 */
	NowNextTimeBar.prototype.populate = function() {

		var i;
		var hourBar;
		this._hoursInBar = [$U.core.util.StringHelper.getString("txtNow"), $U.core.util.StringHelper.getString("txtNext")];

		var numberOfHoursRequired = 2;
		$(this._container).addClass("nownext");
		for ( i = 0; i < numberOfHoursRequired; i = i + 1) {

			hourBar = document.createElement("a");
			hourBar.className = "epg-time-span-nownext";
			hourBar.appendChild(document.createTextNode(this._hoursInBar[i]));

			this._container.appendChild(hourBar);
		}
	};

	return NowNextTimeBar;

}());
