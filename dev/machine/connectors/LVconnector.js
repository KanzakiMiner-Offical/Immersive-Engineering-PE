/*IDRegistry.genBlockID("connecLV");
Block.createBlock("connecLV", [
  { name: "LV Connector", texture: [["connectorLV", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("connectorLV", 0);
mesh.importFromFile(__dir__ + "assets/models/connectorLV.obj", "obj", null);
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.connecLV, -1, icRenderModel);

MachineRegistry.registerTransformer(BlockID.connecLV, 2);
*/
IDRegistry.genBlockID("connectorLV");
Block.createBlockWithRotation("connectorLV", [
  {
    name: "LV Connector",
    texture: [["connectorLV", 0], ["connectorLV", 1], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0]],
    inCreative: true
    }
]);

Block.setBlockShape(BlockID.connectorLV, { x: 1 / 16, y: 0, z: 1 / 16 }, { x: 15 / 16, y: 4 / 16, z: 15 / 16 });

TileRenderer.setStandartModel(BlockID.connectorLV, [["connectorLV", 0], ["connectorLV", 1], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorLV, 0, [["connectorLV", 0], ["connectorLV", 1], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorLV, 1, [["connectorLV", 1], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0]]);

TileRenderer.registerRotationModel(BlockID.connectorLV, 2, [["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 1], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorLV, 3, [["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 1], ["connectorLV", 0], ["connectorLV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorLV, 4, [["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 1], ["connectorLV", 0]]);

TileRenderer.registerRotationModel(BlockID.connectorLV, 5, [["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 0], ["connectorLV", 1]]);

MachineRegistry.registerRFConnector(BlockID.connectorLV, {
	defaultValues: {
		meta: 0
	},
	
	getTier: function(){
		return 1;
	},
	
	wrenchClick: function(id, count, data, coords){
		if(this.setFacing(coords)){
			EnergyNetBuilder.rebuildTileNet(this);
			return true;
		}
		return false;
	},
		
	setFacing: MachineRegistry.setFacing,
	
	getEnergyStorage: function(){
		return 512;
	},
	
	canReceiveEnergy: function(side, type){
		return side == this.data.meta;
	},
	
	canExtractEnergy: function(side, type){
		return side == this.data.meta;
	},
	
	destroyBlock: function(coords, player){
		var extra;
		if(this.data.energy > 0){
			extra = new ItemExtraData();
			extra.putInt("energy", this.data.energy);
		}
		World.drop(coords.x + .5, coords.y + .5, coords.z + .5, BlockID.connectorLV, 1, 0, extra);
	},
	
	renderModel: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta);
	},
	destroy: function(){
		BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
	}
});

MachineRegistry.setStoragePlaceFunction("connectorLV", true);
ToolAPI.registerBlockMaterial(BlockID.connectorLV, "stone");
