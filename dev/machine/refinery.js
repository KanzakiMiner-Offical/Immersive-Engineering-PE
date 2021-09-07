IDRegistry.genBlockID("MB_refinery");
Block.createBlock("MB_refinery", [
	{name: "Refinery", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("refinery", 0);
mesh.importFromFile(__dir__ + "assets/models/refinery.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_refinery, -1, icRenderModel);

IDRegistry.genBlockID("refinery");
Block.createBlock("refinery", [
    { name: "Refinery", texture: [["mp", 0], ["refinery_t", 0], ["refinery_s", 0], ["refinery_s", 0], ["refinery_s", 0], ["refinery_s", 0]], inCreative: true }
], "machine");