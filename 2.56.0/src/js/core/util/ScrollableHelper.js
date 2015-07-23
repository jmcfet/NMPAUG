var $U = $U || {};
$U.core = $U.core || {};
$U.core.util = $U.core.util || {};

/**
 * @class $U.core.util.ScrollableHelper
 * Manages the scrolling of containers in the application
 */
$U.core.util.ScrollableHelper = ( function() {

	/**
	 * Enables scrolling for a given container
	 * @param {HTMLElement} container
	 */
	var enableScrollForContainer = function(container) {
		container.ontouchmove = function(evt) {
			evt.stopPropagation();
		};
	};

	/**
	 * Disables scrolling for a given container
	 * @param {HTMLElement} container
	 */
	var disableScrollForContainer = function(container) {
		container.ontouchmove = function(evt) {
			evt.preventDefault();
		};
	};

	return {
		enableScrollForContainer : enableScrollForContainer,
		disableScrollForContainer : disableScrollForContainer
	};

}());
