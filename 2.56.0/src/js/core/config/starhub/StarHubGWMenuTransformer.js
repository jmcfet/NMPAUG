/**
 * Contains custom logic for transforming the Starhub MDS menu structure.
 *
 * MDS will deliver a catalogue structure including an "On Demand Channels" node with child nodes relating to BTV channels.
 *
 * Some of the child nodes should be presented under "Catch Up TV" rather than "On Demand Channels".
 *
 * This class will take the menu from MDS and create a "Catch Up TV" node and move some of the "On Demand Channels" child nodes into the "Catch Up TV node".
 *
 * The transformation will be driven by a configuration file that includes information about whether a channel is "On Demand" or "Catch Up".
 *
 * @class $U.core.StarHubGWMenuTransformer
 * @constructor
 *
 * @author kellett
 */
var $U = $U || {};
$U.core = $U.core || {};

$U.core.StarHubGWMenuTransformer = ( function() {

	var logger = $U.core.Logger.getLogger("StarHubGWMenuTransformer");

	// Config file for Starhub environment is :
	// http://172.28.136.13/resources/config.json
	// Use this in place of the Madrid lab url
	var CONFIG_URL = "http://172.28.136.13/resources/config.json";

	// The id of the on demand node (must be in line with MDS)
	// May be different for Starhub environment
	var ON_DEMAND_NODE_ID = "405";

	// Timeout in milliseconds to wait for the config file
	var CONFIG_TIMEOUT = 10000;

	// String used to identify catch up channels in the config file
	var CATCHUP_TYPE = "CATCH_UP";

	// The id we will use for the catch up node
	var CATCHUP_NODE_ID = "$CATCH_UP";

	// The language bundle key for the catch up node name
	var CATCHUP_NODE_NAME_KEY = "txtCatchUpNodeName";

	// The root of the menu to transform
	var root;

	// The callback function
	var callback;

	// The catch up node that will be created
	var catchupNode;

	/**
	 * Transform a menu.
	 *
	 * Note that this mehod is asynchronous and that it operates by transforming the menu that is passed in then firing a callback when complete.
	 *
	 * @param {Object} _root the root of the menu to transform
	 * @param {Object} _callback the function to call when transformation is complete
	 */
	function transform(_root, _callback) {

		// Store the reference to the root and callback passed in
		root = _root;
		callback = _callback;

		// Forget the catchupNode as it will be recreated (needed in case of app refresh)
		catchupNode = undefined;

		// Fetch the configuration file, then callback on success or failure
		fetchFile(CONFIG_URL, configurationSuccess, configurationFailure);
	}

	/**
	 * Fetch a file and callback on success or failure.
	 *
	 * @param {Object} url the url of the file to fetch
	 * @param {Object} successCallback the function to call on success
	 * @param {Object} failureCallback the function to call on failure
	 * @private
	 */
	function fetchFile(url, successCallback, failureCallback) {
		var ajaxHandler = new $N.apps.core.AjaxHandler();
		ajaxHandler.responseCallback = function(xmlhttp) {
			if (xmlhttp) {
				if (xmlhttp.status === 200) {
					if (logger) {
						logger.log("fetchFile", "Success");
					}
					successCallback(xmlhttp);
				} else {
					if (logger) {
						logger.log("fetchFile", "Failure", xmlhttp);
					}
					failureCallback();
				}
			} else {
				if (logger) {
					logger.log("fetchFile", "Failure");
				}
				failureCallback();
			}
		};

		if (logger) {
			logger.log("fetchFile", "Attempting to fetch configuration file: ", CONFIG_URL);
		}
		ajaxHandler.requestData(url, CONFIG_TIMEOUT, false);
	}

	/**
	 * Handle successfull fetching of the configuration file

	 * @param {Object} xmlhttp the fetched xmlhttp object
	 * @private
	 */
	function configurationSuccess(xmlhttp) {

		// Get the config from the xmlhttp
		var config = $N.apps.util.JSON.parse(xmlhttp.responseText);

		// Get the list of services from the config
		var services = config && config.services;

		// Find the catch up services
		var catchupServices = getServicesByType(services, CATCHUP_TYPE);

		// Find the existing on demand node by its id
		var onDemandNode = root.getNode(ON_DEMAND_NODE_ID);

		// Move the on demand node to the bottom of the list
		if (onDemandNode) {
			moveNode(onDemandNode, root, root);
		}

		// For each catch up service find the MDS node that it identifies.
		// If that node is a child of the on demand node then move it to the catchup node.
		// Note that the catchup node will be created if necessary.
		catchupServices.forEach(function(service) {
			var node = root.getNode("" + service.catalogueUid);
			if (node && node.parentId) {
				if (node.parentId === ON_DEMAND_NODE_ID) {
					moveNode(node, onDemandNode, getCatchupNode());
					if (logger) {
						logger.log("configurationSuccess", "Moving node from On Demand to Catchup ", node);
					}
				}
			}
		});
		
		callback();
	}

	/**
	 * Handle failed fetching of the configuration file
	 *
	 * @private
	 */
	function configurationFailure() {
		callback();
	}

	function getServicesByType(services, type) {
		var result = [];
		// Put each service into the map according to its type
		if (services && services.forEach) {
			services.forEach(function(service) {
				if (service.type === type) {
					result.push(service);
				}
			});
		}
		return result;
	}

	function getCatchupNode() {
		if (catchupNode === undefined) {
			catchupNode = new $U.core.menudata.MenuNode(CATCHUP_NODE_ID, geCatchupNodeName(), root, 1, undefined, false);
			root.addChild(catchupNode);
			if (logger) {
				logger.log("getCatchupNode", "Created catchup node", catchupNode);
			}
		}
		return catchupNode;
	}

	function moveNode(node, parent, newParent) {
		parent.removeChild(node);
		newParent.addChild(node);
	}

	/**
	 * Return the catch up node name from the language bundle 
	 */
	function geCatchupNodeName() {	
		return $U.core.util.StringHelper.getString(CATCHUP_NODE_NAME_KEY);
	}

	// The public API
	return {
		transform : transform
	};

}());
