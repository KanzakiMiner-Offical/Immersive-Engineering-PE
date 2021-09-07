Block.createSpecialType({
	base: 1,
	solid: true,
	destroytime: 3,
	explosionres: 15,
	lightopacity: 15,
	renderlayer: 2,
	translucency: 0
}, "ore");

IDRegistry.genBlockID("oreAluminum");
Block.createBlock("oreAluminum", [
	{name: "Bauxite Ore", texture: [["ore_aluminum", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreAluminum, "stone", 2, true);
Block.setDestroyLevel("oreAluminum", 2);
ToolLib.addBlockDropOnExplosion("oreAluminum");

IDRegistry.genBlockID("oreCopper");
Block.createBlock("oreCopper", [
	{name: "Azurite Ore", texture: [["ore_copper", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreCopper, "stone", 2, true);
Block.setDestroyLevel("oreCopper", 2);
ToolLib.addBlockDropOnExplosion("oreCopper");

IDRegistry.genBlockID("oreNickel");
Block.createBlock("oreNickel", [
	{name: "Nickel Ore", texture: [["ore_nickel", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreNickel, "stone", 2, true);
Block.setDestroyLevel("oreNickel", 2);
ToolLib.addBlockDropOnExplosion("oreNickel");

IDRegistry.genBlockID("oreLead");
Block.createBlock("oreLead", [
	{name: "Galena Ore", texture: [["ore_lead", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreLead, "stone", 2, true);
Block.setDestroyLevel("oreLead", 2);
ToolLib.addBlockDropOnExplosion("oreLead");

IDRegistry.genBlockID("oreUranium");
Block.createBlock("oreUranium", [
	{name: "Uranium Ore", texture: [["ore_uranium", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreUranium, "stone", 3, true);
Block.setDestroyLevel("oreUranium", 3);
ToolLib.addBlockDropOnExplosion("oreUranium");
Item.addCreativeGroup("ores", Translation.translate("Ores"), [
    BlockID.oreAluminum
	BlockID.oreCopper,
	BlockID.oreNickel,
	BlockID.oreLead,
	BlockID.oreUranium
]);

var OreGenerator = {
	copper: {
		enabled: __config__.getBool("copper_ore.enabled"),
		count: __config__.getNumber("copper_ore.count"),
		size: __config__.getNumber("copper_ore.size"),
		minHeight: __config__.getNumber("copper_ore.minHeight"),
		maxHeight: __config__.getNumber("copper_ore.maxHeight")
	},
	aluninum: {
		enabled: __config__.getBool("aluminum_ore.enabled"),
		count: __config__.getNumber("aluminum_ore.count"),
		size: __config__.getNumber("aluminum_ore.size"),
		minHeight: __config__.getNumber("aluminum_ore.minHeight"),
		maxHeight: __config__.getNumber("aluminum_ore.maxHeight")
	},
	nickel: {
		enabled: __config__.getBool("nickel_ore.enabled"),
		count: __config__.getNumber("nickel_ore.count"),
		size: __config__.getNumber("nickel_ore.size"),
		minHeight: __config__.getNumber("nickel_ore.minHeight"),
		maxHeight: __config__.getNumber("nickel_ore.maxHeight")
	},
	lead: {
		enabled: __config__.getBool("lead_ore.enabled"),
		count: __config__.getNumber("lead_ore.count"),
		size: __config__.getNumber("lead_ore.size"),
		minHeight: __config__.getNumber("lead_ore.minHeight"),
		maxHeight: __config__.getNumber("lead_ore.maxHeight")
	},
	uranium: {
		enabled: __config__.getBool("uranium_ore.enabled"),
		count: __config__.getNumber("uranium_ore.count"),
		size: __config__.getNumber("uranium_ore.size"),
		minHeight: __config__.getNumber("uranium_ore.minHeight"),
		maxHeight: __config__.getNumber("uranium_ore.maxHeight")
	},
	
	addFlag: function(name, flag, disableOre){
		if(this[name].enabled){
			var flag = !Flags.addFlag(flag)
			if(disableOre) this[name].enabled = flag;
		}
	},

	randomCoords: function(random, chunkX, chunkZ, minHeight, maxHeight){
		minHeight = minHeight || 0;
		maxHeight = maxHeight || 128;
		var x = chunkX*16 + random.nextInt(16);
		var z = chunkZ*16 + random.nextInt(16);
		var y = random.nextInt(maxHeight - minHeight + 1) - minHeight;
		return {x: x, y: y, z: z};
	}
}

OreGenerator.addFlag("copper", "oreGenCopper");
OreGenerator.addFlag("nickel", "oreGenNickel");
OreGenerator.addFlag("aluminum", "oreGenAluminum");
OreGenerator.addFlag("lead", "oreGenLead", true);
OreGenerator.addFlag("uranium", "oreGenUranium", true);

Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ, random){
	if(OreGenerator.copper.enabled){
		for(var i = 0; i < OreGenerator.copper.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.copper.minHeight, OreGenerator.copper.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreCopper, 0, OreGenerator.copper.size, false, random.nextInt());
		}
	}


	if(OreGenerator.aluminum.enabled){
		for(var i = 0; i < OreGenerator.aluminum.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.aluminum.minHeight, OreGenerator.aluminum.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreAluminum, 0, OreGenerator.aluminum.size, false, random.nextInt());
		}
	}
	
	if(OreGenerator.nickel.enabled){
		for(var i = 0; i < OreGenerator.nickel.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.nickel.minHeight, OreGenerator.nickel.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreNickel, 0, OreGenerator.nickel.size, false, random.nextInt());
		}
	}
	
	if(OreGenerator.lead.enabled){
		for(var i = 0; i < OreGenerator.lead.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.lead.minHeight, OreGenerator.lead.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreLead, 0, OreGenerator.lead.size, false, random.nextInt());
		}
	}

	if(OreGenerator.uranium.enabled){
		for(var i = 0; i < OreGenerator.uranium.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.uranium.minHeight, OreGenerator.uranium.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreUranium, 0, OreGenerator.uranium.size, false, random.nextInt());
		}
	}
	
});
