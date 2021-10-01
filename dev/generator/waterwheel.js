/*IDRegistry.genBlockID("waterWheel");
Block.createBlock("waterWheel", [
	{name: "Water Wheel", texture: [["waterBlock", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("waterBlock", 0);
mesh.importFromFile(__dir__ + "assets/models/waterBlock.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.waterWheel, -1, icRenderModel);*/
IDRegistry.genBlockID("waterWheel");
Block.createBlock("waterWheel", [
	{name: "Water Wheel", texture: [["treatedWood", 0], ["treatedWood", 0], ["treatedWood", 0], ["treatedWood", 0], ["waterWheelBlock", 0], ["treatedWood", 0]], inCreative: true}]);
	
Block.setBlockShape(BlockID.waterWheel, {x: 0, y: 0, z: 0}, {x: 16 / 16, y: 15 / 16, z: 4 / 16});