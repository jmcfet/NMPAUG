/**
 * Builds the mediacard play dialog
 *
 * @class $U.mediaCard.MediaCardPlayDialog
 */

var $U = $U || {};
$U.mediaCard = $U.mediaCard || {};

$U.mediaCard.MediaCardPlayDialog = ( function() {

	var PLAYABLE_OPTIONS_KEY = "txtMultipleOptions";
	var CANCEL_BTN_KEY = "txtCancel";
	var PLAY_BTN_KEY = "txtPlay";

	/**
	 * Helper function to get strings from language bundle
	 * @param {String} key
	 */
	function getString(key) {
		return $U.core.util.StringHelper.getString(key);
	}

	function getPlayableOptionsDialog(playableOptions, title) {
		var playable = playableOptions;
		var fields = [];
		var inputObj;
		var l = playable.length;
		var i;

		function createLabel(playable) {
			var label = "Play ";

			label += playable.title ? playable.title : playable.name;
			label += playable.definition ? " " + playable.definition : "";

			return label;
		}

		for ( i = 0; i < l; i++) {
			inputObj = {};
			inputObj.name = "option";
			inputObj.type = "radio";
			inputObj.label = createLabel(playable[i]);
			inputObj.value = ""+i+"";
			inputObj.id = i;
			inputObj.checked = (i === 0) ? true : false;
			fields.push(inputObj);
		}

		return {
			title : title,
			message : getString(PLAYABLE_OPTIONS_KEY),
			modal : true,
			form : {
				fields : fields
			},
			buttons : [{
				text : getString(PLAY_BTN_KEY),
				name : "play",
				icon : {
					iconClass : "icon-play",
					iconPos : "left"
				}
			}, {
				text : getString(CANCEL_BTN_KEY),
				name : "cancel",
				icon : {
					iconClass : "icon-check",
					iconPos : "left"
				}
			}]
		};
	}

	function showPlayOptionsDialog(playableOptions, title, callback) {
		$U.core.View.showDialog(getPlayableOptionsDialog(playableOptions, title), callback);

	}

	return {
		showPlayOptionsDialog : showPlayOptionsDialog
	};

}());
