IDRegistry.genBlockID("MB_metalPress");
Block.createBlock("MB_metalPress", [
	{name: "Metal Press", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("metalPress", 0);
mesh.importFromFile(__dir__ + "assets/models/metalPress.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_metalPress, -1, icRenderModel);

IDRegistry.genBlockID("metalPress");
Block.createBlock("metalPress", [
    { name: "Metal Press", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }
], "machine");

var guimetalPress = new UI.StandartWindow({
	standart: {
		header: {text: {text: "Metal Press"}},
		inventory: {standart: true},
		background: {standart: true}
	},
	drawing: [
		{type: "bitmap", x: 510, y: 205, bitmap: "arrow_bar_background", scale: 3.2},
		{type: "bitmap", x: 680, y: 130, bitmap: "rf_scale", scale: 0.6},
	],
	elements: {
		"slotSource": {type: "slot", x: 350, y: 200, size: 63},
		"slotCan": {type: "slot", x: 440, y: 200, size: 64},
		"slotResult": {type: "slot", x: 590, y: 200, size: 60},
		"energyScale": {type: "scale", x: 680, y: 130, direction: 0, bitmap: "rf_scale_full", scale: 0.6, value: 1},
		"slotEnergy": {type: "slot", x: 750, y: 20, size: 45},
		"progressScale": {type: "scale", x: 510, y: 204, bitmap: "arrow_bar_scale", scale: 3.2},
    }
});

var MP_structure = [
{x: +1, y: 0, z: 0, id: BlockID.steelScaffolding},
{x: -1, y: 0, z: 0, id: BlockID.steelScaffolding},
{x: 0, y: +1, z: 0, id: VanillaBlockID.piston},
{x: 0, y: +2, z: 0, id: BlockID.heavyEngineer}
];



Callback.addCallback("PreLoaded", function(){
	MachineRecipeRegistry.registerRecipesFor("metalPress", {
		"ItemID.ingotAluminum": {storage: [ItemID.moldRod, 1], result: [ItemID.stickAluminum, 1, 0]},
		"ItemID.ingotSteel": {storage: [ItemID.moldRod, 1], result: [ItemID.stickSteel, 1, 0]},
		365: {storage: [ItemID.moldRod, 14], result: [ItemID.stickIron, 14, 0]},
		
	}, true);
/*
addMPrecipewire({id: ItemID.wireCopper, count: 1}, [{id: ItemID.ingotCopper , count: 1}]);
addMPrecipewire({id: ItemID.wireSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1}]);
addMPrecipewire({id: ItemID.wireAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1}]);
addMPrecipewire({id: ItemID.wireElectrum, count: 1}, [{id: ItemID.ingotElectrum, count: 1}]);

addMPrecipeplate({id: ItemID.plateIron, count: 1}, [{id: 365 , count: 1}]);
addMPrecipeplate({id: ItemID.plateSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1}]);
addMPrecipeplate({id: ItemID.plateAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1}]);
addMPrecipeplate({id: ItemID.plateElectrum, count: 1}, [{id: ItemID.ingotElectrum, count: 1}]);
addMPrecipeplate({id: ItemID.plateCopper, count: 1}, [{id: ItemID.ingotCopper , count: 1}]);
addMPrecipeplate({id: ItemID.plateSilver, count: 1}, [{id: ItemID.ingotSilver, count: 1}]);
addMPrecipeplate({id: ItemID.plateConstanta, count: 1}, [{id: ItemID.ingotConstanta, count: 1}]);
addMPrecipeplate({id: ItemID.plateLead, count: 1}, [{id: ItemID.ingotLead, count: 1}]);
addMPrecipeplate({id: ItemID.plateNickel, count: 1}, [{id: ItemID.ingotNickel , count: 1}]);
*/
});



MachineRegistry.registerPrototype(BlockID.metalPress, {
	defaultValues: {
		energy_storage: 24000,
		energy_consumption: 20,
		work_time: 200,
		progress: 0,
	    isActive: false
	},
	
	getGuiScreen: function(){
		return guimetalPress;
	},
	
	getTransportSlots: function(){
		return {input: ["slotSource"], output: ["slotResult"]};
	},
    
    setDefaultValues: function(){
        this.data.energymax = this.defaultValues.energymax;
        this.data.energy_consumption = this.defaultValues.energy_consumption;
        this.data.work_time = this.defaultValues.work_time;
    },
        
    
    tick: function(){
		this.resetValues();
		
		var sourceSlot = this.container.getSlot("slotSource");
		var resultSlot = this.container.getSlot("slotResult");
		var canSlot = this.container.getSlot("slotCan");
		
		var newActive = false;
		var recipe = MachineRecipeRegistry.getRecipeResult("metalPress", sourceSlot.id);
		if(recipe && canSlot.id == recipe.storage[0] && canSlot.count >= recipe.storage[1] && (resultSlot.id == recipe.result[0] && resultSlot.data == recipe.result[2] && resultSlot.count <= 64 - recipe.result[1] || resultSlot.id == 0)){
			if(this.data.energy >= this.data.energy_consumption){
				this.data.energy -= this.data.energy_consumption;
				this.data.progress += 1/this.data.work_time;
				newActive = true;
			}
			if(this.data.progress.toFixed(3) >= 1){
				sourceSlot.count--;
				resultSlot.id = recipe.result[0];
				resultSlot.data = recipe.result[2];
				resultSlot.count += recipe.result[1];
				this.container.validateAll();
				this.data.progress = 0;
			}
		}
		else {
			this.data.progress = 0;
		}
		this.setActive(newActive);
		
		var energyStorage = this.getEnergyStorage();
		this.data.energy = Math.min(this.data.energy, energyStorage);
		
		this.container.setScale("progressScale", this.data.progress);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
    },
    
    getEnergyStorage: function(){
        return this.data.energy_storage;
    },
    
    getStartSoundFile: function(){
		return "metal_press_smash.ogg";
    },
	getInterruptSoundFile: function(){
		return "metal_press_piston.ogg";
    },
    validStructure: function(){
    	let x = this.x;
		  let y = this.y;
		  let z = this.z;
      isValidStructure = StructureLib.getStructure(x, y, z, MP_structure);
    },
    
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc

});

TileRenderer.setRotationPlaceFunction(BlockID.metalPress);
