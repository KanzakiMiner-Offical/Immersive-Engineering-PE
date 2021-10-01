/*
 chưa biết làm gì
*/
IDRegistry.genBlockID("windMill");
Block.createBlock("windMill", [
	{name: "Wind Mill", texture: [["treatedWood", 0], ["treatedWood", 0], ["treatedWood", 0], ["treatedWood", 0], ["windMillBlock", 0], ["treatedWood", 0]], inCreative: true}]);
	
Block.setBlockShape(BlockID.windMill, {x: 0, y: 0, z: 0}, {x: 16 / 16, y: 15 / 16, z: 4 / 16});

IDRegistry.genItemID ("windSail");

 Item.createItem ("windSail", "Wind Mill Sail", {name: "sail", meta: 1}, {stack: 64});
