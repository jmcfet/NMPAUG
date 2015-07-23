/*jshint newcap: false*/

var AssetScrollerTest = TestCase("AssetScrollerTest");

AssetScrollerTest.prototype.testCalculateRowHeightWith2RowsAnd200Height = function() {	
	// Create DOM
	/*:DOC container = <div id="container"></div> */
	//assertUndefined(this.container);
	var assetScroller = new $U.core.widgets.AssetScroller(this.container, true, 2);
	assetScroller._calculateSizes(200);
	assertEquals("row Height", 90,assetScroller._rowHeight);
};
AssetScrollerTest.prototype.testCalculateRowHeightWith3RowsAnd190Height = function() {	
	// Create DOM
	/*:DOC container = <div id="container"></div> */
	//assertUndefined(this.container);
	var assetScroller = new $U.core.widgets.AssetScroller(this.container, true, 3);
	assetScroller._calculateSizes(190);
	assertEquals("row Height", 50,assetScroller._rowHeight);
};