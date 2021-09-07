IDRegistry.genBlockID("MB_liquidPipe");
Block.createBlock("MB_liquidPipe", [
	{name: "PIPE", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("mbfluidPipe", 0);
mesh.importFromFile(__dir__ + "assets/models/pipe.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_liquidPipe, 0, icRenderModel);

IDRegistry.genBlockID("liquidPipe");
Block.createBlock("liquidPipe", [
{name: "Liquid Pipe", texture: [["fluidPipe", 0]], inCreative: true}
]);

