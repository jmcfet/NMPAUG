/*global require*/
var page = require('webpage').create();
var system = require('system');
var url = system.args[1];
console.log('Loading ' + url);
page.settings.userAgent = "Phantom"; 
page.open(url, function(status) {
	console.log('Loaded ' + url + ' with status ' + status);
});