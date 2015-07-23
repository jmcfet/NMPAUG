/* Checks for a valid URL and, if available, transfers the browser to it - otherwise displaying an error page with retry functionality
 * Author:  Paul Connell
 * Date     2013/03/04
 */
function bootCheck(url) {

    var bootCheckPoint = "appInstalled"; /* This file needs to be on the server at URL, and needs 'Access-Control-Allow-Origin:*' applied to it on the server as a HTTP header */
    var bootCheckTimeout = 3000; /* How long to wait for a response */
    var xmlHttpTimeout;
    var httpRequest = false;

    function ajaxTimeout() {
        httpRequest.abort();
        errorOccured("requestTimedOut");
    }

    xmlHttpTimeout = setTimeout(ajaxTimeout, bootCheckTimeout);

    function errorOccured(errorType) {
        document.getElementById("retryButton").value = window.nmpConfig.errorRetryText;
        document.getElementById("errorRetry").style.display = "block";
        /* Could be extended to support different error messages per error occurred, logging etc. */
    }

    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
        if (httpRequest.overrideMimeType) {
            httpRequest.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) {
        try {
            httpRequest = new window.ActiveXObject("Msxml2.XMLHTTP");
        } catch(error1) {
            try {
                httpRequest = new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch (error2) {
                errorOccured("IENoAJAX");
            }
        }
    }

    if (!httpRequest) {
        // Cannot really recover from this, the browser cannot do AJAX!
        errorOccured("browserNotAJAX");
        return false;
    }

    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                window.location.replace(url);
            } else {
                clearTimeout(xmlHttpTimeout);
                errorOccured("statusNot200");
            }
            /* Further code can go here to support 302/303 redirects if required */
        }
    };

    httpRequest.open('GET', url + bootCheckPoint, false);
    httpRequest.send(null);
}
