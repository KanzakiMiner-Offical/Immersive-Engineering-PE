IDRegistry.genBlockID("MB_crusher");
Block.createBlock("MB_crusher", [
	{name: "Crusher", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("crusher", 0);
mesh.importFromFile(__dir__ + "assets/models/crusher.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_crusher, -1, icRenderModel);

IDRegistry.genBlockID("crusher");
Block.createBlock("crusher", [
    { name: "Crusher", texture: [["stone", 0], ["stone", 0], ["stone", 0], ["stone", 0], ["stone", 0], ["stone", 0]], inCreative: true }
], "machine");

TileRenderer.setStandartModel(BlockID.crusher, [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 0], ["mp", 0], ["mp", 0]]);
TileRenderer.registerRotationModel(BlockID.crusher, 0, [["mp", 0], ["mp", 0], ["mp", 0], ["stone", 0], ["mp", 0], ["mp", 0]]);
TileRenderer.registerRotationModel(BlockID.crusher, 4, [["mp", 0], ["mp", 1], ["mp", 0], ["stone", 1], ["mp", 0], ["np", 0]]);

var Crusher_structure = [
{x: 0, y: -1, z: 0, id: BlockID.lightEngineer}
];

MachineRecipeRegistry.registerRecipesFor("crusher", {
		// ores
		16: {id: ItemID.dustCoke, count: 2, data: 0},
		15: {id: ItemID.dustIron, count: 2, data: 0},
		"BlockID.oreCopper": {id: ItemID.dustCopper, count: 2, data: 0},
		"BlockID.oreAluminum": {id: ItemID.dustAluminum, count: 2, data: 0},
		"BlockID.oreLead": {id: ItemID.dustLead, count: 2, data: 0},
		"BlockID.oreSilver": {id: ItemID.dustSilver, count: 2, data: 0},
		"BlockID.oreUranium": {id: ItemID.dustUranium, count: 2, data: 0},
		
		// ingots
		265: {id: ItemID.dustIron, count: 1, data: 0},
		266: {id: ItemID.dustGold, count: 1, data: 0},
		"ItemID.ingotCopper": {id: ItemID.dustCopper, count: 1, data: 0},
		"ItemID.ingotAluminum": {id: ItemID.dustAluminum, count: 1, data: 0},
		"ItemID.ingotBronze": {id: ItemID.dustBronze, count: 1, data: 0},
		"ItemID.ingotSteel": {id: ItemID.dustSteel, count: 1, data: 0},
		"ItemID.ingotLead": {id: ItemID.dustLead, count: 1, data: 0},
		"ItemID.ingotSilver": {id: ItemID.dustSilver, count: 1, data: 0},
		// plates
		"ItemID.plateIron": {id: ItemID.dustIron, count: 1, data: 0},
		"ItemID.plateNickel": {id: ItemID.dustNickel, count: 1, data: 0},
		"ItemID.plateCopper": {id: ItemID.dustCopper, count: 1, data: 0},
		"ItemID.plateAluminum": {id: ItemID.dustAluminum, count: 1, data: 0},
		"ItemID.plateSilver": {id: ItemID.dustSilver, count: 1, data: 0},
		"ItemID.plateSteel": {id: ItemID.dustSteel, count: 1, data: 0},
		"ItemID.plateLead": {id: ItemID.dustLead, count: 1, data: 0},
		// other materials
		1: {id: 4, count: 1, data: 0},
		4: {id: 12, count: 1, data: 0},
		13: {id: 318, count: 1, data: 0},
		24: {id: 12, count: 2, data: 0},
		35: {id: 287, count: 2, data: 0},
		79: {id: 332, count: 4, data: 0},
		89: {id: 348, count: 4, data: 0},
		128: {id: 12, count: 3, data: 0},
		152: {id: 331, count: 9, data: 0},
		155: {id: 406, count: 4, data: 0},
		156: {id: 406, count: 6, data: 0},
		179: {id: 12, count: 2, data: 1},
		180: {id: 12, count: 3, data: 1},
		352: {id: 351, count: 5, data: 15}, 
		369: {id: 377, count: 5, data: 0}
	}, true);


var guiCrusher = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("crusher")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
		{type: "bitmap", x: 530, y: 155, bitmap: "arrow_bar_background", scale: GUI_SCALE},
		{type: "bitmap", x: 450, y: 155, bitmap: "energy_small_background", scale: GUI_SCALE}
	],

	elements: {
		"progressScale": {type: "scale", x: 530, y: 155, direction: 0, value: 0.5, bitmap: "arrow_bar_scale", scale: GUI_SCALE},
		"energyScale": {type: "scale", x: 450, y: 155, direction: 1, value: 0.5, bitmap: "energy_small_scale", scale: GUI_SCALE},
		"slotSource": {type: "slot", x: 441, y: 79, isValid: function(id, count, data){
			return MachineRecipeRegistry.hasRecipeFor("crusher", id, data);
		}},
		"slotEnergy": {type: "slot", x: 441, y: 218, isValid: MachineRegistry.isValidRFStorage},
		"slotResult": {type: "slot", x: 625, y: 148, isValid: function(){return false;}},
		"slotUpgrade1": {type: "slot", x: 820, y: 60, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade2": {type: "slot", x: 820, y: 119, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade3": {type: "slot", x: 820, y: 178, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade4": {type: "slot", x: 820, y: 237, isValid: UpgradeAPI.isValidUpgrade},
	}
});

Callback.addCallback("LevelLoaded", function(){
	MachineRegistry.updateGuiHeader(guiCrusher, "crusher");
});

MachineRegistry.registerElectricMachine(BlockID.crusher, {
	defaultValues: {
		power_tier: 1,
		energy_storage: 120000,
		energy_consumption: 200,
		work_time: 300,
		meta: 0,
		progress: 0,
		isActive: false
	},
	
	getGuiScreen: function(){
		return guiCrusher;
	},
	
	getTier: function(){
		return this.data.power_tier;
	},
	
	setDefaultValues: function(){
		this.data.power_tier = this.defaultValues.power_tier;
		this.data.energy_storage = this.defaultValues.energy_storage;
		this.data.energy_consumption = this.defaultValues.energy_consumption;
		this.data.work_time = this.defaultValues.work_time;
	},

	tick: function(){
		this.setDefaultValues();
		
		var newActive = false;
		var sourceSlot = this.container.getSlot("slotSource");
		var resultSlot = this.container.getSlot("slotResult");
		var result = MachineRecipeRegistry.getRecipeResult("crusher", sourceSlot.id, sourceSlot.data);
		if(result && (resultSlot.id == result.id && resultSlot.data == result.data && resultSlot.count <= 64 - result.count || resultSlot.id == 0)){
			if(this.data.energy >= this.data.energy_consumption){
				this.data.energy -= this.data.energy_consumption;
				this.data.progress += 1/this.data.work_time;
				newActive = true;
				this.startPlaySound();
			}
			if(this.data.progress.toFixed(3) >= 1){
				sourceSlot.count--;
				resultSlot.id = result.id;
				resultSlot.data = result.data;
				resultSlot.count += result.count;
				this.container.validateAll();
				this.data.progress = 0;
			}
		}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
			this.stopPlaySound(true);
		this.setActive(newActive);
		
		var tier = this.getTier();
		var energyStorage = this.getEnergyStorage();
		this.data.energy = Math.min(this.data.energy, energyStorage);
		this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), "Eu", energyStorage - this.data.energy, transferByTier[tier], tier);
		
		this.container.setScale("progressScale", this.data.progress);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
	},

	getEnergyStorage: function(){
		return this.data.energy_storage;
	},
	
	getStartSoundFile: function(){
		return "Crusher/crusher.ogg";
    },
	getInterruptSoundFile: function(){
		return "More/chargeFast.ogg";
    },
    
	    validStructure: function(){
      	let x = this.x;
		  let y = this.y;
		  let z = this.z;
      isValidStructure = StructureLib.getStructure(x, y, z, Crusher_structure);
    },
	
	renderModel: MachineRegistry.renderModelWithRotation,
	energyReceive: MachineRegistry.basicEnergyReceiveFunc
});

TileRenderer.setRotationPlaceFunction(BlockID.crusher);

StorageInterface.createInterface(BlockID.crusher, {
	slots: {
		"slotSource": {input: true},
		"slotResult": {output: true}
	},
	isValidInput: function(item){
		return MachineRecipeRegistry.hasRecipeFor("crusher", item.id, item.data);
	}
});

