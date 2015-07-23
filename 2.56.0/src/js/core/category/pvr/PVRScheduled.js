/**
 * Retrieves PVR Scheduled asset items
 * Wraps the JSFW PVR scheduled functionality
 * @class $U.core.category.pvrscheduled.PVRScheduled
 *
 */
var $U = $U || {};
$U.core = $U.core || {};
$U.core.category = $U.core.category || {};
$U.core.category.pvr = $U.core.category.pvr || {};

$U.core.category.pvr.PVRScheduled = ( function() {

	var logger = $U.core.Logger.getLogger("PVRScheduled");

	/**
	 * Registers a "Request to Record" has been made
	 * This can be triggered in the call to action bar
	 * @param {$U.core.mediaitem.MediaItem} item the item to toggle
	 * @param {Function} callback the callback to use if successful
	 */
	var registerRecord = function(item, callback) {
		if (logger) {
			logger.log("registerRecord", "Registering a Record event: " + item.channel.serviceId);
		}

		// Register the event to be recorded
		$N.services.gateway.dlna.MediaDevice.scheduleEventRecording(item.id, callback);
	};

	/**
	 * Deletes a Recording Task
	 * This can be triggered in the call to action bar
	 * @param {string} taskId of the task to delete
	 * @param {Function} callback the callback to use if successful
	 */
	var deleteRecordingTask = function(taskId, callback) {
		if (logger) {
			logger.log("deleteRecordingTask", "Deleting a Recording Task event: " + taskId);
		}
		$N.services.gateway.dlna.MediaDevice.deleteRecordingTask(taskId, callback);
	};

	/**
	 * Deletes a Recording Schedule (group of tasks)
	 * This can be triggered in the call to action bar
	 * @param {string} scheduleId of the schedule to delete
	 * @param {Function} callback the callback to use if successful
	 */
	var deleteRecordingSchedule = function(scheduleId, callback) {
		if (logger) {
			logger.log("deleteRecordingSchedule", "Deleting a Recording Schedule event: " + scheduleId);
		}
		$N.services.gateway.dlna.MediaDevice.deleteRecordingSchedule(scheduleId, callback);
	};

	/**
	 * Initialises the service
	 */
	var initialise = function() {
		//Stub, no functionality
	};

	return {
		initialise : initialise,
		registerRecord : registerRecord,
		deleteRecordingTask : deleteRecordingTask,
		deleteRecordingSchedule : deleteRecordingSchedule
	};

}());
