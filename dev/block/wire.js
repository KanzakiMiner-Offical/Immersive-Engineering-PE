Block.createSpecialType({
	destroytime: 0.05,
	explosionres: 0.5,
	renderlayer: 1,
}, "cable");

IDRegistry.genBlockID("coilCopper0");
IDRegistry.genBlockID("coilCopper1");
Block.createBlock("coilCopper0", [
	{name: "tile.wireCopper.name", texture: [["wireCopper", 0]], inCreative: false}
], "cable");
CableRegistry.createBlock("coilCopper1", {name: "tile.wireCopper.name", texture: "wireCopper1"}, "cable");
ToolAPI.registerBlockMaterial(BlockID.coilCopper0, "stone");
ToolAPI.registerBlockMaterial(BlockID.coilCopper1, "stone");

IDRegistry.genBlockID("coilElectrum0");
IDRegistry.genBlockID("coilElectrum1");
Block.createBlock("coilElectrum0", [
	{name: "tile.wireElectrum.name", texture: [["wireElectrum", 0]], inCreative: false}
], "cable");
CableRegistry.createBlock("coilCopper1", {name: "tile.wireElectrum.name", texture: "wireElectrum1"}, "cable");
ToolAPI.registerBlockMaterial(BlockID.coilElectrum0, "stone");
ToolAPI.registerBlockMaterial(BlockID.coilElectrum1, "stone");


CableRegistry.registerCable("coilCopper", 2048, 1);
CableRegistry.registerCable("coilElectrum", 8192, 1);

TileRenderer.setupWireModel(BlockID.coilElectrum0, -1, 2/16, "rf-wire");
CableRegistry.setupModel(BlockID.coilElectrum1, 2/16);
TileRenderer.setupWireModel(BlockID.coilCopper0, -1, 2/16, "rf-wire");
CableRegistry.setupModel(BlockID.coilCopper1, 2/16);

function registerCablePlaceFunc(nameID, blockID, blockData){
	Item.registerUseFunction(nameID, function(coords, item, block){
		var place = coords;
		if(!World.canTileBeReplaced(block.id, block.data)){
			place = coords.relative;
			block = World.getBlock(place.x, place.y, place.z);
			if(!World.canTileBeReplaced(block.id, block.data)){
				return;
			}
		}
		World.setBlock(place.x, place.y, place.z, blockID, blockData);
		Player.setCarriedItem(item.id, item.count - 1, item.data);
		EnergyTypeRegistry.onWirePlaced(place.x, place.y, place.z);
	});
}

for(var i = 0; i < 2; i++){
	registerCablePlaceFunc("coilCopper"+i, BlockID["coilCopper"+i], 0);
	Item.registerNameOverrideFunction(ItemID["coilCopper"+i], function(item, name){
		return name + "\n§7" + Translation.translate("Max RF/t: ") + "2048 RF/t";
	});
}

for(var i = 0; i < 2; i++){
	registerCablePlaceFunc("coilElectrum"+i, BlockID["coilElectrum"+i], 0);
	Item.registerNameOverrideFunction(ItemID["coilElectrum"+i], function(item, name){
		return name + "\n§7" + Translation.translate("Max RF/t: ") + "8192 RF/t";
	});
}

