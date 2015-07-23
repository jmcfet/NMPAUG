/*jshint newcap: false*/

var MenuNodeTest = TestCase("MenuNodeTest");

/*
 * Test the basics, that MenuNodes constructed with various parameters
 * reflect those parameters in their public properties.
 */
MenuNodeTest.prototype.testPublicProperties = function() {

	var node1 = new $U.core.menudata.MenuNode("node1Id", "node1Name", null, 1);
	var node2 = new $U.core.menudata.MenuNode("node2Id", "node2Name", node1, 1);
	var node3 = new $U.core.menudata.MenuNode("node3Id", "node3Name", node2, 2);
	var node4 = new $U.core.menudata.MenuNode("node4Id", "node4Name", node2, 2);

	node1.addChild(node2);
	node2.addChild(node3);
	node2.addChild(node4);

	assertEquals("node1Id", node1.id);
	assertEquals("node1Name", node1.name);
	assertNull(node1.parentId);
	assertEquals(1, node1.depth);
	assertEquals(1, node1.children.length);

	assertEquals("node2Id", node2.id);
	assertEquals("node2Name", node2.name);
	assertEquals("node1Id", node2.parentId);
	assertEquals(1, node2.depth);
	assertEquals(2, node2.children.length);

	assertEquals(node3, node2.children[0]);
	assertEquals(node4, node2.children[1]);

	assertEquals("node2Id", node3.parentId);

};

/*
 * Test that child nodes are handled as expected.
 */
MenuNodeTest.prototype.testChildNodes = function() {
	var node1 = new $U.core.menudata.MenuNode("node1Id", "node1Name", null, 1);
	var node2 = new $U.core.menudata.MenuNode("node2Id", "node2Name", node1, 2);
	var node3 = new $U.core.menudata.MenuNode("node3Id", "node3Name", node1, 2);
	var node4 = new $U.core.menudata.MenuNode("node4Id", "node4Name", node1, 2);

	// Add two child nodes to node1 and check
	node1.addChild(node2);
	node1.addChild(node3);
	assertEquals(2, node1.children.length);
	assertEquals(node2, node1.children[0]);
	assertEquals(node3, node1.children[1]);

	// Insert a third child node to node1 and check
	node1.insertChild(node4, 1);
	assertEquals(3, node1.children.length);
	assertEquals(node2, node1.children[0]);
	assertEquals(node4, node1.children[1]);
	assertEquals(node3, node1.children[2]);

	// Check the getChildIds function works as expected
	var childIds = node1.getChildIds();
	assertEquals(3, childIds.length);
	assertEquals("node2Id", childIds[0]);
	assertEquals("node4Id", childIds[1]);
	assertEquals("node3Id", childIds[2]);

};

/*
 * Test that descendent nodes are handled as expected.
 */
MenuNodeTest.prototype.testDescendentNodes = function() {
	var node1 = new $U.core.menudata.MenuNode("node1Id", "node1Name", null, 1);
	var i, j, k;
	var l, m, n;
	for ( i = 0; i < 5; i++) {
		l = new $U.core.menudata.MenuNode("nodeId." + i, "nodeName." + i, node1, 2);
		node1.addChild(l);
		for ( j = 0; j < 5; j++) {
			m = new $U.core.menudata.MenuNode("nodeId." + i + "." + j, "nodeName." + i + "." + j, l, 3);
			l.addChild(m);
			for ( k = 0; k < 5; k++) {
				n = new $U.core.menudata.MenuNode("nodeId." + i + "." + j + "." + k, "nodeName." + i + "." + j + "." + k, m, 4);
				m.addChild(n);
			}
		}
	}

	// Check the number of descendent ids, should be 5 + 5*5 + 5*5*5 = 155
	var descendentIds = node1.getDescendentIds();
	assertEquals(155, descendentIds.length);

	// Spot check a couple of descendend ids
	assertEquals("nodeId.0", descendentIds[0]);
	assertEquals("nodeId.0.0.1", descendentIds[3]);
	assertEquals("nodeId.4.4", descendentIds[149]);
	assertEquals("nodeId.4.4.4", descendentIds[154]);
};
