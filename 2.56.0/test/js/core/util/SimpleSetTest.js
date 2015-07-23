/*jshint newcap: false*/

var SimpleSetTest = TestCase("SimpleSetTest");

SimpleSetTest.prototype.testNewSetIsEmpty = function() {
	var set = new $U.core.util.SimpleSet();
	assert(set.isEmpty());	
	assertEquals(0, set.getSize());	
}; 

SimpleSetTest.prototype.testPopulatedSetIsNotEmpty = function() {
	var set = new $U.core.util.SimpleSet();
	assert(set.add({}));
	assertFalse(set.isEmpty());	
	assertEquals(1, set.getSize());	
}; 

SimpleSetTest.prototype.testAddingUniqueItems = function() {
	var set = new $U.core.util.SimpleSet();
	assert(set.add({}));
	assert(set.add({}));
	assert(set.add({}));
	assertFalse(set.isEmpty());
	assertEquals(3, set.getSize());
}; 

SimpleSetTest.prototype.testAddingDuplicateItems = function() {
	var set = new $U.core.util.SimpleSet();
	var item = {};
	assert(set.add(item));
	assertFalse(set.add(item));
	assertEquals(1, set.getSize());	
};

SimpleSetTest.prototype.testRemovingItemFromEmptySet = function() {
	var set = new $U.core.util.SimpleSet();
	assertFalse(set.remove({}));
};

SimpleSetTest.prototype.testAddingAndRemovingItem = function() {
	var set = new $U.core.util.SimpleSet();
	var item = {};
	assert(set.add(item));
	assert(set.remove(item));
	assert(set.isEmpty());
};

SimpleSetTest.prototype.testAddingAndRemovingItems = function() {
	var set = new $U.core.util.SimpleSet();
	var item1 = {};
	var item2 = {};
	var item3 = {};
	assert(set.add(item1));
	assert(set.add(item2));
	assert(set.add(item3));
	assert(set.remove(item2));
	assert(set.remove(item3));
	assert(set.remove(item1));
	assert(set.isEmpty());
};

SimpleSetTest.prototype.testRemovingDuplicateItems = function() {
	var set = new $U.core.util.SimpleSet();
	var item1 = {};
	var item2 = {};
	var item3 = {};
	assert(set.add(item1));
	assert(set.add(item2));
	assert(set.add(item3));
	assert(set.remove(item2));
	assertFalse(set.remove(item2));
	assertEquals(2, set.getSize());
};

SimpleSetTest.prototype.testSetContainsAddedObjects = function() {
	var set = new $U.core.util.SimpleSet();	
	var item1 = {};
	var item2 = {};
	var item3 = {};
	set.add(item1);
	set.add(item2);
	set.add(item3);
	assert(set.contains(item1));
	assert(set.contains(item2));
	assert(set.contains(item3));
};

