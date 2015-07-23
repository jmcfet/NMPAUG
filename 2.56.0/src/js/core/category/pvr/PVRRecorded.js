/**
 * Retrieves PVR Recorded asset items
 * Wraps the JSFW PVR Recorded functionality
 * @class $U.core.category.pvr.PVRecorded
 *
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRRecorded = ( function() {

	var logger = $U.core.Logger.getLogger("PVRRecorded");

	/**
	 * Deletes a Recording
	 * This can be triggered in the call to action bar
	 * @param {string} taskId of the task to delete
	 * @param {Function} callback the callback to use if successful
	 */
	var deleteRecording = function(taskId, callback) {

		if (logger) {
			logger.log("deleteRecording", "Deleting a Recorded event: " + taskId);
		}

		// Register the event to be PVRRecorded
		$N.services.gateway.dlna.MediaDevice.deleteRecording(taskId, callback);
	};

	var deleteFromTile = function(evt, mediaItem) {
		evt.stopPropagation();

		var taskId = mediaItem.id;
		deleteRecording(taskId, function(data) {
			if (logger) {
				logger.log("deleteListener", data);
			}
			$U.core.View.goBack();
		});

	};


	/**
	 * Initialises the service
	 */
	var initialise = function() {
		//Stub, no functionality currently
	};

	return {
		initialise : initialise,
		deleteRecording : deleteRecording,
		deleteFromTile : deleteFromTile
	};

}());
