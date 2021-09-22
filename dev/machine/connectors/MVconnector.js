IDRegistry.genBlockID("connectorMV");
Block.createBlockWithRotation("connectorMV", [
  {
    name: "MV Connector",
    texture: [["connectorMV", 0], ["connectorMV", 1], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0]],
    inCreative: true
    }
]);

//Block.setBlockShape(BlockID.connectorMV, { x: 1 / 16, y: 0, z: 1 / 16 }, { x: 15 / 16, y: 7 / 16, z: 15 / 16 });

TileRenderer.setStandartModel(BlockID.connectorMV, [["connectorMV", 0], ["connectorMV", 1], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorMV, 0, [["connectorMV", 0], ["connectorMV", 1], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorMV, 1, [["connectorMV", 1], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0]]);

TileRenderer.registerRotationModel(BlockID.connectorMV, 2, [["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 1], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorMV, 3, [["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 1], ["connectorMV", 0], ["connectorMV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorMV, 4, [["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 1], ["connectorMV", 0]]);

TileRenderer.registerRotationModel(BlockID.connectorMV, 5, [["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 0], ["connectorMV", 1]]);

MachineRegistry.registerRFConnector(BlockID.connectorMV, {
	defaultValues: {
		meta: 0
	},
	
	getTier: function(){
		return 2;
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
		return 2048;
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
		World.drop(coords.x + .5, coords.y + .5, coords.z + .5, BlockID.connectorMV, 1, 0, extra);
	},
	
	renderModel: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta);
	},
	destroy: function(){
		BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
	}
});

//MachineRegistry.setStoragePlaceFunction("connectorMV", true);
ToolAPI.registerBlockMaterial(BlockID.connectorMV, "stone");
