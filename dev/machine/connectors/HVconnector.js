IDRegistry.genBlockID("connectorHV");
Block.createBlockWithRotation("connectorHV", [
  {
    name: "HV Connector",
    texture: [["connectorHV", 0], ["connectorHV", 1], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0]],
    inCreative: true
    }
]);

Block.setBlockShape(BlockID.connectorHV, { x: 1 / 16, y: 0, z: 1 / 16 }, { x: 15 / 16, y: 5 / 16, z: 15 / 16 });

TileRenderer.setStandartModel(BlockID.connectorHV, [["connectorHV", 0], ["connectorHV", 1], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorHV, 0, [["connectorHV", 0], ["connectorHV", 1], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorHV, 1, [["connectorHV", 1], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0]]);

TileRenderer.registerRotationModel(BlockID.connectorHV, 2, [["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 1], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorHV, 3, [["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 1], ["connectorHV", 0], ["connectorHV", 0]]);

TileRenderer.registerRenderModel(BlockID.connectorHV, 4, [["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 1], ["connectorHV", 0]]);

TileRenderer.registerRotationModel(BlockID.connectorHV, 5, [["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 0], ["connectorHV", 1]]);

MachineRegistry.registerRFConnector(BlockID.connectorHV, {
	defaultValues: {
		meta: 0
	},
	
	getTier: function(){
		return 3;
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
		return 8192;
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
		World.drop(coords.x + .5, coords.y + .5, coords.z + .5, BlockID.connectorHV, 1, 0, extra);
	},
	
	renderModel: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta);
	},
	destroy: function(){
		BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
	}
});

MachineRegistry.setStoragePlaceFunction("connectorHV", true);
ToolAPI.registerBlockMaterial(BlockID.connectorHV, "stone");
