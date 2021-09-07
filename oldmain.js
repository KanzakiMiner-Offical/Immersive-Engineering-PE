// file: lib.js

alert("Link Start!");

 IMPORT ("flags");
 IMPORT ("ToolType");
 IMPORT ("energylib");
 IMPORT ("ChargeItem");
 IMPORT ("MachineRender");
 IMPORT ("TileRender");
 IMPORT ("LiquidLib");

// file: API/machine.js
// energy (Eu)
var EU = EnergyTypeRegistry.assureEnergyType("Eu", 1);

var GUI_BAR_STANDART_SCALE = 3.2;
var UpgradeAPI = {
	_elements: {},

	registerUpgrade: function(id, upgrade){
		UpgradeAPI._elements[id] = upgrade;
	},

	executeUpgrade: function(item, machine, container, data, coords){
		if(UpgradeAPI._elements[item.id]){
			UpgradeAPI._elements[item.id](item.count, machine, container, data, coords);
		}
	},

	executeAll: function(machine){
		var container = machine.container;
		var data = machine.data;
		var coords = {x: machine.x, y: machine.y, z: machine.z};
		
		var upgrades = {};
		for(var slotName in container.slots){
			if(slotName.match(/Upgrade/)){
				var slot = container.getSlot(slotName);
				if(!upgrades[slot.id]){upgrades[slot.id] = slot.count;}
				else{upgrades[slot.id] += slot.count;}
			}
		}
		for(var upgrade in upgrades){
			UpgradeAPI.executeUpgrade({id: upgrade, count: upgrades[upgrade]}, machine, container, data, coords);
		}
		return upgrades;
	},
	
	findNearestContainers: function(coords, direction){
		var directions = {
			up: {x: 0, y: 1, z: 0},
			down: {x: 0, y: -1, z: 0},
			east: {x: 1, y: 0, z: 0},
			west: {x: -1, y: 0, z: 0},
			south: {x: 0, y: 0, z: 1},
			north: {x: 0, y: 0, z: -1},
		}
		var containers = [];
		if(direction){
			dir = directions[direction]
			var container = World.getContainer(coords.x + dir.x, coords.y + dir.y, coords.z + dir.z);
			if(container){containers.push(container);}
		}
		else{
			for(var i in directions){
				var dir = directions[i];
				var container = World.getContainer(coords.x + dir.x, coords.y + dir.y, coords.z + dir.z);
				if(container){containers.push(container);}
			}
		}
		return containers;
	}
}


var MachineRegistry = {
	machineIDs: {},

	isMachine: function(id){
		return this.machineIDs[id];
	},

	registerPrototype: function(id, Prototype){
		// register render
		ICRender.getGroup("ic-wire").add(id, -1);
		// register ID
		this.machineIDs[id] = true;
		// setup energy value
		if (Prototype.defaultValues){
			Prototype.defaultValues.energy = 0;
		}
		else{
			Prototype.defaultValues = {
				energy: 0
			};
		}
		// copy functions
		if(!Prototype.getEnergyStorage){
			Prototype.getEnergyStorage = function(){
				return 0;
			};
		}
		
		
		ToolAPI.registerBlockMaterial(id, "stone");
		Block.setDestroyTime(id, 3);
		TileEntity.registerPrototype(id, Prototype);
		EnergyTileRegistry.addEnergyTypeForId(id, EU);
	},

	// standart functions
	getMachineDrop: function(coords, blockID, level, standartDrop){
		var item = Player.getCarriedItem();
		if(item.id==ItemID.wrench){
			ToolAPI.breakCarriedTool(10);
			World.setBlock(coords.x, coords.y, coords.z, 0);
			if(Math.random() < 0.8){return [[blockID, 1, 0]];}
			return [[standartDrop || blockID, 1, 0]];
		}
		if(item.id==ItemID.electricWrench && item.data + 500 <= Item.getMaxDamage(item.id)){
			Player.setCarriedItem(item.id, 1, item.data + 500);
			World.setBlock(coords.x, coords.y, coords.z, 0);
			return [[blockID, 1, 0]];
		}
		if(level > 0){
			return [[standartDrop || blockID, 1, 0]];
		}
		return [];
	},
	
	basicEnergyReceiveFunc: function(type, src){
		var energyNeed = this.getEnergyStorage() - this.data.energy;
		this.data.energy += src.getAll(energyNeed);
	}
}






var ENERGY_ITEM_NAME = function(item, name){
	var energyStorage = Item.getMaxDamage(item.id) - 1;
	var energyStored = Math.min(energyStorage - item.data + 1, energyStorage);
	if(energyStored==0){return name;}
	return name + "\n§7" + energyStored + "/" + energyStorage + " Eu";
}



var ChargeItemRegistry = {
	chargeData: {},
	
	registerItem: function(item, energy, level, preventUncharge, isTool){
		Item.setMaxDamage(item, energy + 1);
		this.chargeData[item] = {
			type: "normal",
			id: item,
			level: level || 0,
			maxDamage: energy + 1,
			maxCharge: energy,
			preventUncharge: preventUncharge,
			isTool: isTool
		};
	},
	
	registerFlashItem: function(item, energy, level){
		this.chargeData[item] = {
			type: "flash",
			id: item,
			level: level || 0,
			energy: energy,
		};
	},
	
	getItemData: function(id){
		return this.chargeData[id];
	},
	
	isFlashStorage: function(id){
		var data = this.getItemData(id);
		return data && data.type == "flash";
	},
	
	getEnergyFrom: function(item, amount, level, getFromAll){
		if(item.id==ItemID.debugItem){
			return amount;
		}
		
		level = level || 0;
		var data = this.getItemData(item.id);
		if(!data || data.level > level || !getFromAll && data.preventUncharge){
			return 0;
		}
		if(data.type == "flash"){
			if(amount < 1){
				return 0;
			}
			item.count--;
			if(item.count < 1){
				item.id = item.data = 0;
			}
			return data.energy;
		}
		if(item.data < 1){
			item.data = 1;
		}
		
		var energyGot = Math.min(amount, data.maxDamage - item.data);
		item.data += energyGot;
		return energyGot;
	},
	
	addEnergyTo: function(item, energy, transf, level){
		level = level || 0;
		var data = this.getItemData(item.id);
		if(!data || data.type == "flash" || data.level > level){
			return 0;
		}
		
		var energyAdd = Math.min(item.data - 1, transf);
		if(energy >= energyAdd){
			item.data -= energyAdd;
			return energyAdd;
		}
		return 0;
	},
	
	getEnergyStored: function(item){
		var data = this.getItemData(item.id);
		if(!data){
			return 0;
		}
		return data.maxDamage - item.data;
	},
 Energyremove: function(item,energy)
 {
 var data = this.getItemData(item.id);
 var EnEU = Item.getMaxDamage(item.id)
 
 if(EnEU > energy)
 {
  Item.getMaxDamage(item.id) - energy;
 }
 else if(EnEU < energy)
 {
  

 }
 else if(EnEU < 0)
 {
   
   Item.getMaxDamage(item.id) ++;
 }
 
  
 }
}



// file: block/ore.js
 var RYDA = Block.createSpecialType ({
  base: 15,
  solid: true,
  destroytime: 6,
  opaque: true
 });
 IDRegistry.genBlockID ("oreAluminum");

 Block.createBlock ("oreAluminum", [{name: "Boxit Ore", texture: [["oreAluminum", 0]], inCreative: true}]);


 Block.registerDropFunction ("oreAluminum", function (coords, id, data, diggingLevel, toolLevel) {return [[4, 1, data]];
 });


 Callback.addCallback ("GenerateChunkUnderground", function (chunkX, chunkZ) {
     for (var i = 0; i <5; i ++) {
         var coords = GenerationUtils.randomCoords (chunkX, chunkZ, 10, 60);
             GenerationUtils.generateOre (coords.x, coords.y, coords.z, BlockID.oreAluminum, 0, 6);
     }
 }
 )

 var RYDA = Block.createSpecialType ({
  base: 15,
  solid: true,
  destroytime: 6,
  opaque: true
 });
 IDRegistry.genBlockID ("oreCopper");

 Block.createBlock ("oreCopper", [{name: "Copper Ore", texture: [["oreCopper", 0]], inCreative: true}]);


 Block.registerDropFunction ("oreCopper", function (coords, id, data, diggingLevel, toolLevel) {return [[4, 1, data]];
 });


 Callback.addCallback ("GenerateChunkUnderground", function (chunkX, chunkZ) {
     for (var i = 0; i <5; i ++) {
         var coords = GenerationUtils.randomCoords (chunkX, chunkZ, 10, 60);
             GenerationUtils.generateOre (coords.x, coords.y, coords.z, BlockID.oreCopper, 0, 6);
     }
 }
 )


 var RYDA = Block.createSpecialType ({
  base: 15,
  solid: true,
  destroytime: 8,
  opaque: true
 });
 IDRegistry.genBlockID ("oreLead");

 Block.createBlock ("oreLead", [{name: "Lead Ore", texture: [["oreLead", 0]], inCreative: true}]);


 Block.registerDropFunction ("oreLead", function (coords, id, data, diggingLevel, toolLevel) {return [[4, 1, data]];
 });


 Callback.addCallback ("GenerateChunkUnderground", function (chunkX, chunkZ) {
     for (var i = 0; i <5; i ++) {
         var coords = GenerationUtils.randomCoords (chunkX, chunkZ, 10, 60);
             GenerationUtils.generateOre (coords.x, coords.y, coords.z, BlockID.oreLead, 0, 6);
     }
 }
 )

 var RYDA = Block.createSpecialType ({
  base: 15,
  solid: true,
  destroytime: 6,
  opaque: true
 });
 IDRegistry.genBlockID ("oreNickel");

 Block.createBlock ("oreNickel", [{name: "Nickel Ore", texture: [["oreNickel", 0]], inCreative: true}]);


 Block.registerDropFunction ("oreNickel", function (coords, id, data, diggingLevel, toolLevel) {return [[4, 1, data]];
 });


 Callback.addCallback ("GenerateChunkUnderground", function (chunkX, chunkZ) {
     for (var i = 0; i <5; i ++) {
         var coords = GenerationUtils.randomCoords (chunkX, chunkZ, 10, 60);
             GenerationUtils.generateOre (coords.x, coords.y, coords.z, BlockID.oreNickel, 0, 6);
     }
 }
 )

 var RYDA = Block.createSpecialType ({
  base: 15,
  solid: true,
  destroytime: 6,
  opaque: true
 });
 IDRegistry.genBlockID ("oreSilver");

 Block.createBlock ("oreSilver", [{name: "Silver Ore", texture: [["oreSilver", 0]], inCreative: true}]);


 Block.registerDropFunction ("oreSilver", function (coords, id, data, diggingLevel, toolLevel) {return [[BlockID.oreSilver, 1, data]];
 });


 Callback.addCallback ("GenerateChunkUnderground", function (chunkX, chunkZ) {
     for (var i = 0; i <5; i ++) {
         var coords = GenerationUtils.randomCoords (chunkX, chunkZ, 10, 60);
             GenerationUtils.generateOre (coords.x, coords.y, coords.z, BlockID.oreSilver, 0, 6);
     }
 }
 )

 
 // file: scaffolding.js
 IDRegistry.genBlockID ("steelScaffolding");
 Block.createBlock ("steelScaffolding", [{name: "Steel Scaffoldings", texture: [["scaffoldingSide2", 0]], inCreative: true}]);
 
 // file: eneering.js
 IDRegistry.genBlockID ("redEngineer");
 Block.createBlock ("redEngineer", [{name: "Redstone Engineering Block", texture: [["redstone_engineering_0", 0]], inCreative: true}]);
 
 IDRegistry.genBlockID ("heavyEngineer");
 Block.createBlock ("heavyEngineer", [{name: "Heavy Engineering Block", texture: [["heavy_engineering_0", 0]], inCreative: true}]);
 
 IDRegistry.genBlockID ("lightEngineer");
 Block.createBlock ("lightEngineer", [{name: "Light Engineering Block", texture: [["light_engineering_0", 0]], inCreative: true}]);
 
 // file: OvenBrick.js
 IDRegistry.genBlockID ("cokeBrick");
 Block.createBlock ("cokeBrick", [{name: "Oven Brick", texture: [["cokeBrick", 0]], inCreative: true}]);
 

 // file: machine/dieselGenerator.js
IDRegistry.genBlockID("dieselGenerator");
Block.createBlock("dieselGenerator", [
	{name: "Diesel Generator", texture: [["metal_dieselGenerator", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("metal_dieselGenerator", 0);
mesh.importFromFile(__dir__ + "assets/models/dieselGenerator.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.dieselGenerator, -1, icRenderModel);




var guiDieselGenerator = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Diesel Generator"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
    {type: "bitmap", x: 950, y: 150, bitmap: "GuiPowerBar", scale: GUI_BAR_STANDART_SCALE},
    {type: "bitmap", x: 350, y: 150, bitmap: "rf_scale", scale: GUI_BAR_STANDART_SCALE},
    ],
    
    elements: {
        "energyScale": {type: "scale", x: 950 + GUI_BAR_STANDART_SCALE, y: 150 + GUI_BAR_STANDART_SCALE, direction: 1, value: 0, bitmap: "rf_scale_full", scale: GUI_BAR_STANDART_SCALE},
"fuelScale": {type: "scale", x: 350 + GUI_BAR_STANDART_SCALE, y: 150 + GUI_BAR_STANDART_SCALE, direction: 1, value: 0, bitmap: "DieselBar", scale: GUI_BAR_STANDART_SCALE},
"slotEnergy": {type: "slot", x: 880, y: 190}, 
"slotFuel": {type: "slot", x: 400, y: 190},      
"textInfo1": {type: "text", x: 510, y: 190, width: 200, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}},
"textInfo2": {type: "text", x: 610, y: 190, width: 200, height: 30, text: "kJ", font: {color: android.graphics.Color.GREEN}},
"textInfo3": {type: "text", x: 510, y: 230, width: 200, height: 30, text: "Diesel Fuel:", font: {color: android.graphics.Color.GREEN}},
"textInfo5": {type: "text", x: 680, y: 230, width: 200, height: 30, text: "0", font: {color: android.graphics.Color.GREEN}}
    }
});




MachineRegistry.register(BlockID.dieselGenerator, {
    defaultValues: {       
        energymax: 100000000,
        dieselfuel: 0,
        dieselfuelmax: 24000      
        
    },
    
   
    
    getGuiScreen: function(){
        return guiDieselGenerator;
    },
        
    isGenerator: function() {
        return true;
    },
    
    getTransportSlots: function(){
        return {input: ["slotFuel"]};
    },
    
    tick: function(){
        var content = this.container.getGuiContent();
        var energySlot = this.container.getSlot("slotEnergy"); 
        var fuelSlot = this.container.getSlot("slotFuel"); 
        this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), this.data.energy, 200, 2); 
        if (fuelSlot.id == ItemID.dieselbucket && this.data.dieselfuel < this.data.dieselfuelmax)
        {
            this.data.dieselfuel += 1000;
            fuelSlot.count--;
            this.container.validateAll();
        }
        if (this.data.dieselfuel > 0 && this.data.energy < this.data.energymax)
        {
            this.data.energy += 512000;
            this.data.dieselfuel--;
        }
      
       
       
      
      this.container.setText("textInfo1", this.data.energy / 1000);
      this.container.setText("textInfo5", this.data.dieselfuel);
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("fuelScale", this.data.dieselfuel / this.data.dieselfuelmax);
        
    },
    energyTick: function(type, src){
        
        var output = Math.min(350, this.data.energy);
        this.data.energy += src.add(output) - output;
    }

});

// file: machine/coreDrill.js
IDRegistry.genBlockID("coreDrill");
Block.createBlock("coreDrill", [
	{name: "Drill Core", texture: [["coreDrill", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("coreDrill", 0);
mesh.importFromFile(__dir__ + "assets/models/coredrill.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.coreDrill, -1, icRenderModel);

// file: machine/metalPress.js
IDRegistry.genBlockID("metalPress");
Block.createBlock("metalPress", [
	{name: "Metal Press", texture: [["metalPress", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("metalPress", 0);
mesh.importFromFile(__dir__ + "assets/models/metalPress.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.metalPress, -1, icRenderModel);

var guimetalPress = new UI.StandartWindow({
	standart: {
		header: {text: {text: "Metal Press"}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	params: {       
		slot: "default_slot",
		invSlot: "default_slot"              
	},
	
	drawing: [
		{type: "bitmap", x: 740, y: 180, bitmap: "arrow_bar_background", scale: GUI_BAR_STANDART_SCALE},
		{type: "bitmap", x: 450, y: 150, bitmap: "reflux_bar0", scale: GUI_BAR_STANDART_SCALE},
	],
	
	elements: {
		"progressScale": {type: "scale", x: 734, y: 180, direction: 1, value: 0.5, bitmap: "arrow_bar_scale", scale: GUI_BAR_STANDART_SCALE*1.01},
		"slotSource1": {type: "slot", x: 640, y: 180, size: 64},
		"energyScale": {type: "scale", x: 450, y: 150, direction: 1, value: 1, bitmap: "reflux_bar1", scale: GUI_BAR_STANDART_SCALE},
		"slotSource2": {type: "slot", x: 640, y: 280, size: 64},
		"slotEnergy": {type: "slot", x: 441, y: 212, size: 64},
		"slotResult": {type: "slot", x: 840, y: 280, size: 64},
	}
});

var MPIF_recipes = [];

function addMPIF_recipe(result, source){
	MPIF_recipes.push({source: source, result: result});
}

Callback.addCallback("PreLoaded", function(){
//wire
addMPIFrecipe({id: ItemID.wireCopper, count: 1}, [{id: ItemID.ingotCopper , count: 1},{id:ItemID.moldWire,count:0}]);
addMPIFrecipe({id: ItemID.wireSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1},{id:ItemID.moldWire,count:0}]);
addMPIFrecipe({id: ItemID.wireAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1},{id:ItemID.moldWire,count:0}]);
addMPIFrecipe({id: ItemID.wireElectrum, count: 1}, [{id: ItemID.ingotElectrum, count: 1},{id:ItemID.moldWire,count:0}]);
//stick
addMPIFrecipe({id: ItemID.stickIron, count: 1}, [{id: 365 , count: 1},{id:ItemID.moldRod,count:0}]);
addMPIFrecipe({id: ItemID.stickSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1},{id:ItemID.moldRod,count:0}]);
addMPIFrecipe({id: ItemID.stickAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1},{id:ItemID.moldRod,count:0}]);
//plate
addMPIFrecipe({id: ItemID.plateIron, count: 1}, [{id: 365 , count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateElectrum, count: 1}, [{id: ItemID.ingotElectrum, count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateCopper, count: 1}, [{id: ItemID.ingotCopper , count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateSilver, count: 1}, [{id: ItemID.ingotSilver, count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateConstanta, count: 1}, [{id: ItemID.ingotConstanta, count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateLead, count: 1}, [{id: ItemID.ingotLead, count: 1},{id:ItemID.moldPlate,count:0}]);
addMPIFrecipe({id: ItemID.plateNickel, count: 1}, [{id: ItemID.ingotNickel , count: 1},{id:ItemID.moldPlate,count:0}]);

});

Callback.addCallback("PreLoaded", function(){	
	MachineRegistry.updateGuiHeader(guimetalPress, "Metal PRESS");
});


MachineRegistry.registerPrototype(BlockID.metalPress, {
	defaultValues: {
		energy_storage: 40000,
		energy_consumption: 200,
		work_time: 200,
		progress: 0,
		mode: 0
	},
	
	getGuiScreen: function(){
		return guimetalPress;
	},
	
	getTransportSlots: function(){
		return {input: ["slotSource1"], output: ["slotResult"]};
	},
	
	setDefaultValues: function(){
		this.data.energy_storage = this.defaultValues.energy_storage;
		this.data.energy_consumption = this.defaultValues.energy_consumption;
		this.data.work_time = this.defaultValues.work_time;
	},
	
	tick: function(){
		StorageInterface.checkHoppers(this);
		
		var sourceItems = {};
		var source;
		var result;
		for(var i = 1; i <= 2; i++){
			var slot = this.container.getSlot("slotSource" + i);
			if(slot.id > 0 && slot.data==0){
				sourceItems[slot.id] = sourceItems[slot.id] || 0;
				sourceItems[slot.id] += slot.count;
			}
		}
		for(var i in MPIF_recipes){
			var recipe = MPIF_recipes[i];
			source = recipe.source;
			var valid = true;
			for(var s in source){
				var count = sourceItems[source[s].id];
				if(!count || count < source[s].count){
					valid = false;
					break;
				}
			}
			if(valid){
				result = recipe.result;
				break;
			}
		}
		
		if(result){
			var resultSlot = this.container.getSlot("slotResult");
			if(resultSlot.id == result.id && resultSlot.count <= 64 - result.count || resultSlot.id == 0){
				if(this.data.energy >= this.data.energy_consumption){
					this.data.energy -= this.data.energy_consumption;
					this.data.progress += 1/this.data.work_time;
				}
				if(this.data.progress >= 1){
					sourceSlot.count -= 1;
					resultSlot.id = result.id;
					resultSlot.count += result.count;
					this.container.validateAll();
					this.data.progress = 0;
				}
			}
		}
		else {
			this.data.progress = 0;
		}
		
		var energyStorage = this.getEnergyStorage();
		this.data.energy = Math.min(this.data.energy, energyStorage);
		this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(32, energyStorage - this.data.energy), 0);
		
		this.container.setScale("progressScale", this.data.progress);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
	},
	
	getEnergyStorage: function(){
		return this.data.energy_storage;
	},
	
	energyTick: MachineRegistry.basicEnergyReceiveFunc
});
// file: machine/crusher.js
IDRegistry.genBlockID("crusher");
Block.createBlock("crusher", [
	{name: "Crusher", texture: [["crusher", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("crusher", 0);
mesh.importFromFile(__dir__ + "assets/models/crusher.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.crusher, -1, icRenderModel);

// file: machine/ConnecHV.js
IDRegistry.genBlockID("connecHC");
Block.createBlock("connecHC", [
	{name: "Connector HV", texture: [["connectorHV", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("connectorHV", 0);
mesh.importFromFile(__dir__ + "assets/models/connectorHV.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.connecHC, -1, icRenderModel);

// file: machine/watermill.js
IDRegistry.genBlockID("watermill");
Block.createBlock("watermill", [
	{name: "Water Mill", texture: [["waterBlock", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("waterBlock", 0);
mesh.importFromFile(__dir__ + "assets/models/waterBlock.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.watermill, -1, icRenderModel);

// file: machine/transHV.js
IDRegistry.genBlockID("transHV");
Block.createBlock("transHV", [
	{name: "Transformer HV", texture: [["transformerHV", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("transformerHV", 0);
mesh.importFromFile(__dir__ + "assets/models/transformerHV.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.transHV, -1, icRenderModel);

// file: machine/workbench.js
IDRegistry.genBlockID("workBench");
Block.createBlock("workBench", [
	{name: "Engineer Workbench", texture: [["workbench", 0]], inCreative: true}]);
var mesh = new RenderMesh();
mesh.setBlockTexture("workbench", 0);
mesh.importFromFile(__dir__ + "assets/models/workbench.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.workBench, -1, icRenderModel);

// file: other.js
 IDRegistry.genItemID ("dieselbucket");
 IDRegistry.genItemID ("creosoteblock");
 IDRegistry.genItemID ("immersivehammer");
 IDRegistry.genItemID ("immersivecutter");
 Item.createItem ("dieselbucket", "Bucket Of Diesel", {name: "bucketDiesel", meta: 0}, {stack: 1});
 Item.createItem ("creosoteblock", "Bucket Of Creosote", {name: "bucketCreosote", meta: 0}, {stack: 1});
 Item.createItem ("immersivehammer", "Hammer", {name: "toolHammer", meta: 0}, {stack: 1});
 Item.createItem ("immersivecutter", "Wire Cutter", {name: "wirecutter", meta: 0}, {stack: 1});
 
// file: block/wood.js
IDRegistry.genBlockID ("woodTreatedplank");
 Block.createBlock ("woodTreatedplank", [{name: "Treated Wood Plank", texture: [["treatedWood", 0]], inCreative: true}]);
 IDRegistry.genItemID ("treatedStick");
 Item.createItem ("treatedStick", "Treated Wood Stick", {name: "material_treatedStick", meta: 0}, {stack: 64});
 
 Recipes.addShaped ({id: BlockID.woodTreatedplank, count: 8, data: 0}, [
  "aaa",
  "aza",
  "aaa"
  ], ['a', 5, 0, 'z', ItemID.creosoteblock, 0]);
  
 Recipes.addShaped ({id: BlockID.treatedStick, count: 4, data: 0}, [
  "a",
  "a",
  ""
  ], ['a', BlockID.woodTreatedplank, 0]);

// file: machine/immerBlastFurnace.js
 IDRegistry.genBlockID ("blastBrick");
 Block.createBlock ("blastBrick", [{name: "Blast Brick", texture: [["blastBrick", 0]], inCreative: true}]);
 
 Recipes.addShaped ({id: BlockID.blastBrick, count: 1, data: 0}, [
 "aba",
 "bzb",
 "aba"
 ], ['a', 405, 0, 'b', 336, 0, 'z', 213, 0]);
 
 Recipes.addShaped ({id: BlockID.immerBlastFurnaceOn, count: 1, data: 0}, [
 "aaa",
 "aaa",
 "aaa"
 ], ['a', BlockID.blastBrick, 0]);
  
 Recipes.addShaped ({id: BlockID.immerBlastFurnace, count: 1, data: 0}, [
 "aaa",
 "aaa",
 "aaa"
 ], ['a', BlockID.immerBlastFurnaceOn, 0]);
 
var BLOCK_TYPE_IMMERFURNACE = Block.createSpecialType({
	base: 5,
	explosionres: 7,
	destroytime: 1,
});

 IDRegistry.genBlockID ("immerBlastFurnaceOn");
 Block.createBlock ("immerBlastFurnaceOn", [{name: "Blast Furnace", texture: [["immerBlastFurnaceOn", 0], ["immerBlastFurnaceOn", 0], ["immerBlastFurnaceOn", 0], ["immerBlastFurnaceOn", 0]  , ["immerBlastFurnaceOn", 0], ["immerBlastFurnaceOn", 0]], inCreative: false}]);
 
 IDRegistry.genBlockID ("immerBlastFurnace");
 Block.createBlock ("immerBlastFurnace", [{name: "Blast Furnace", texture: [["immerBlastFurnace", 0], ["immerBlastFurnace", 0], ["immerBlastFurnace", 0], ["immerBlastFurnace", 0]  , ["immerBlastFurnace", 0], ["immerBlastFurnace", 0]], inCreative: false}]);, inCreative: true}
],BLOCK_TYPE_IMMERFURNACE);


var guiimmerBlastFurnace = new UI.StandartWindow({
	standart: {
		header: {text: {text: "Blast Furnace"}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	params: {       
		slot: "default_slot",
		invSlot: "default_slot"              
	},
	
	drawing: [
		{type: "bitmap", x: 740, y: 180, bitmap: "arrow_bar_background", scale: GUI_BAR_STANDART_SCALE},
		{type: "bitmap", x: 540, y: 180, bitmap: "heat_off", scale: GUI_BAR_STANDART_SCALE*1.01}
	],
	
	elements: {
		"burningScale": {type: "scale", x: 543, y: 180, direction: 1, value: 0.5, bitmap: "heat_on", scale: GUI_BAR_STANDART_SCALE},
		"progressScale": {type: "scale", x: 734, y: 180, direction: 1, value: 0.5, bitmap: "arrow_bar_scale", scale: GUI_BAR_STANDART_SCALE*1.01},
		"slotSource": {type: "slot", x: 640, y: 180, isValid: function(){return false;}},
		"slotResult1": {type: "slot", x: 640, y: 280, isValid: function(){return false;}},
		"slotResult2": {type: "slot", x: 840, y: 280, isValid: function(){return false;}}
	}
});

// file: machine/capacitor.js
 IDRegistry.genBlockID ("capHV");
 Block.createBlock ("capHV", [{name: "HV Capacitor", texture :  [["capHV_bot", 0], ["capHV_top", 0], ["capHV_side", 0], ["capHV_side", 0], ["capHV_side", 0], ["capHV_side", 0]], inCreative: true}]);
 
 var guiHVCap = new UI.StandartWindow({
	standart: {
		header: {text: {text: "HV Capacitor"}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	params: {       
		slot: "default_slot",
		    
	},
	
	
	drawing: [
		
	],
	
	elements: {
		
		"slot1": {type: "slot", x: 440, y: 70},
		"slot2": {type: "slot", x: 580, y: 70},
		"textInfo1": {type: "text", x: 642, y: 142, width: 300, height: 30, text: "0/"},
		"textInfo2": {type: "text", x: 642, y: 172, width: 300, height: 30, text: "100000 RF"}
	}
});



MachineRegistry.registerPrototype(BlockID.capHV, {
	isStorage:  true,
	
getGuiScreen: function(){
		return guiHVCap;
	},
	tick: function(){
		var energyStorage = this.getEnergyStorage();
		this.container.setScale("energyScale", this.data.energy / energyStorage);
		this.container.setText("textInfo1", parseInt(this.data.energy) + "/");
		this.container.setText("textInfo2", energyStorage + "");
		
		var TRANSFER = 2048;
		this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slot2"), Math.min(TRANSFER, energyStorage - this.data.energy), 2);
		this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slot1"), this.data.energy, TRANSFER, 2);
	},
	
	getEnergyStorage: function(){
		return 100000;
	},
	
	energyTick: function(type, src){
		var TRANSFER = 512;
		this.data.energy += src.storage(Math.min(TRANSFER*4, this.getEnergyStorage() - this.data.energy), Math.min(TRANSFER, this.data.energy));
	}

})


// file: machine/cokeOven.js
 IDRegistry.genBlockID ("cokeBrick");
 Block.createBlock ("cokeBrick", [{name: "Oven Brick", texture: [["cokeBrick", 0]], inCreative: true}]);
 Recipes.addShaped ({id: BlockID.cokeBrick, count: 1, data: 0}, [
 "aba",
 "bzb",
 "aba"
 ], ['a', 337, 0, 'b', 336, 0, 'z', 12, 0]);

 IDRegistry.genBlockID ("cokeOven1");
 Block.createBlock ("cokeOven1", [{name: "Oven brick", texture: [["cokeOven1", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven2");
 Block.createBlock ("cokeOven2", [{name: "Oven brick", texture: [["cokeOven2", 0], ["cokeOven2", 0], ["cokeOven2", 0], ["cokeOven2", 0  ], ["cokeOven2", 0], ["cokeOven2", 0]], inCreative: false}]);


 IDRegistry.genBlockID ("cokeOven3");
 Block.createBlock ("cokeOven3", [{name: "Oven brick", texture: [["cokeOven3", 0], ["cokeOven3", 0], ["cokeOven3", 0], ["cokeOven3", 0  ], ["cokeOven3", 0], ["cokeOven3", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven");
 Block.createBlock ("cokeOven", [{name: "Oven brick", texture: [["cokeOven", 0], ["cokeOven", 0], ["cokeOven", 0], ["cokeOven", 0  ], ["cokeOven", 0], ["cokeOven", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven0");
 Block.createBlock ("cokeOven0", [{name: "Oven brick", texture: [["cokeOven0", 0], ["cokeOven0", 0], ["cokeOven0", 0], ["cokeOven0", 0  ], ["cokeOven0", 0], ["cokeOven0", 0]], inCreative: false}]);


 IDRegistry.genBlockID ("cokeOven5");
 Block.createBlock ("cokeOven5", [{name: "Oven brick", texture: [["cokeOven5", 0], ["cokeOven5", 0], ["cokeOven5", 0], ["cokeOven5", 0  ], ["cokeOven5", 0], ["cokeOven5", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOvenon");
 Block.createBlock ("cokeOvenon", [{name: "Oven brick", texture: [["cokeOvenon", 0], ["cokeOvenon", 0], ["cokeOvenon", 0], ["cokeOvenon", 0  ], ["cokeOvenon", 0], ["cokeOvenon", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven4on");
 Block.createBlock ("cokeOven4on", [{name: "Oven brick", texture: [["cokeOven4on", 0], ["cokeOven4on", 0], ["cokeOven4on", 0], ["cokeOven4on", 0  ], ["cokeOven4on", 0], ["cokeOven4on", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOvenoff");
 Block.createBlock ("cokeOvenoff", [{name: "Oven brick", texture: [["cokeOvenoff", 0], ["cokeOvenoff", 0], ["cokeOvenoff", 0], ["cokeOvenoff", 0  ], ["cokeOvenoff", 0], ["cokeOvenoff", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven8");
 Block.createBlock ("cokeOven8", [{name: "Oven brick", texture: [["cokeOven8", 0], ["cokeOven8", 0], ["cokeOven8", 0], ["cokeOven8", 0  ], ["cokeOven8", 0], ["cokeOven8", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven4off");
 Block.createBlock ("cokeOven4off", [{name: "Oven brick", texture: [["cokeOven4off", 0], ["cokeOven4off", 0], ["cokeOven4off", 0], ["cokeOven4off", 0  ], ["cokeOven4off", 0], ["cokeOven4on", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven6");
 Block.createBlock ("cokeOven6", [{name: "Oven brick", texture: [["cokeOven6", 0], ["cokeOven6", 0], ["cokeOven6", 0], ["cokeOven6", 0  ], ["cokeOven6", 0], ["cokeOven6", 0]], inCreative: false}]);

 IDRegistry.genBlockID ("cokeOven7");
 Block.createBlock ("cokeOven7", [{name: "Oven brick", texture: [["cokeOven7", 0], ["cokeOven7", 0], ["cokeOven7", 0], ["cokeOven7", 0  ], ["cokeOven7", 0], ["cokeOven7", 0]], inCreative: false}]);

// file: item.js

 IDRegistry.genBlockID ("storageCopper");
 Block.createBlock ("storageCopper", [{name: "Copper block", texture: [["storageCopper", 0]], inCreative: true}]);

 IDRegistry.genBlockID ("storageSilver");
 Block.createBlock ("storageSilver", [{name: "Silver block", texture: [["storageSilver", 0]], inCreative: true}]);

 IDRegistry.genBlockID ("storageElectrum");
 Block.createBlock ("storageElectrum", [{name: "Electrum block", texture: [["storageElectrum", 0]], inCreative: true}]);

 IDRegistry.genBlockID ("storageSteel");
 Block.createBlock ("storageSteel", [{name: "Steel block", texture: [["storageSteel", 0]], inCreative: true}]);

 IDRegistry.genBlockID ("storageLead");
 Block.createBlock ("storageLead", [{name: "Lead block", texture: [["storageLead", 0]], inCreative: true}]);

 IDRegistry.genItemID ("ingotCopper");
 Item.createItem ("ingotCopper", "Copper Ingot", {name: "ingotCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotAluminum");
 Item.createItem ("ingotAluminum", "Aluminum Ingot", {name: "ingotAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotConstanta");
 Item.createItem ("ingotConstanta", "Bronze Ingot", {name: "ingotConstanta", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotElectrum");
 Item.createItem ("ingotElectrum", "Electrum Ingot", {name: "ingotElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotSilver");
 Item.createItem ("ingotSilver", "Silver Ingot", {name: "ingotSilver", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("ingotLead");
 Item.createItem ("ingotLead", "Lead Ingot", {name: "ingotLead", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("ingotNickel");
 Item.createItem ("ingotNickel", "Nickel Ingot", {name: "ingotNickel", meta: 0}, {stack: 64});


 IDRegistry.genItemID ("blueprint");
 Item.createItem ("blueprint", "Blue Print", {name: "blueprint", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("coilCopper");
 Item.createItem ("coilCopper", "Copper Coil", {name: "coilCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("coilElectrum");
 Item.createItem ("coilElectrum", "Electrum Coil", {name: "coilElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("coilHV");
 Item.createItem ("coilHV", "HV Coil", {name: "coilHV", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetAluminum");
 Item.createItem ("nuggetAluminum", "Aluminum nugget", {name: "nuggetAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetCopper");
 Item.createItem ("nuggetCopper", "Copper Nugget", {name: "nuggetCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetLead");
 Item.createItem ("nuggetLead", "Lead Nugget", {name: "nuggetLead", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetSilver");
 Item.createItem ("nuggetSilver", "Silver Nugget", {name: "nuggetSilver", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetElectrum");
 Item.createItem ("nuggetElectrum", "Electrum Nugget", {name: "nuggetElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("coalCoke");
 Item.createItem ("coalCoke", "Coke Coal", {name: "coalCoke", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("stickAluminum");
 Item.createItem ("stickAluminum", "Aluminum Stick", {name: "stickAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("stickSteel");
 Item.createItem ("stickSteel", "Steel Stick", {name: "stickSteel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("stickIron");
 Item.createItem ("stickIron", "Iron Stick", {name: "stickIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("jerrycan");
 Item.createItem ("jerrycan", "Jerry Can", {name: "jerrycan", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("materialSlag");
 Item.createItem ("materialSlag", "Slag", {name: "materialSlag", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("waterwheelSegment");
 Item.createItem ("waterwheelSegment", "Water Wheel", {name: "waterwheelSegment", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("drillheadIron");
 Item.createItem ("drillheadIron", "Iron Drill Head", {name: "drillheadIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("drillheadSteel");
 Item.createItem ("drillheadSteel", "Steel Drill Head", {name: "drillheadSteel", meta: 0}, {stack: 64});

 Recipes.addShaped ({id: ItemID.waterwheelSegment, count: 4, data: 0}, [
         "oxo",
         "xyx",
         "yxy"
     ], ['x', 280, 0, 'y', 5, 1]);

 IDRegistry.genItemID ("plateCopper");
 Item.createItem ("plateCopper", "Copper Plate", {name: "plateCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateAluminum");
 Item.createItem ("plateAluminum", "Aluminum Plate", {name: "plateAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateConstanta");
 Item.createItem ("plateConstanta", "Constanta Plate", {name: "plateConstanta", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateElectrum");
 Item.createItem ("plateElectrum", "Electrum Plate", {name: "plateElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateSilver");
 Item.createItem ("plateSilver", "Silver Plate", {name: "plateSilver", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateIron");
 Item.createItem ("plateIron", "Iron Plate", {name: "plateIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateNickel");
 Item.createItem ("plateNickel", "Nickel Plate", {name: "plateNickel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateLead");
 Item.createItem ("plateLead", "Lead Plate", {name: "plateLead", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateSteel");
 Item.createItem ("plateSteel", "Steel Plate", {name: "plateSteel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustAluminum");
 Item.createItem ("dustAluminum", "Aluminum Dust", {name: "dustAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustCopper");
 Item.createItem ("dustCopper", "Copper Dust", {name: "dustCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustGold");
 Item.createItem ("dustGold", "Gold Dust", {name: "dustGold", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustSilver");
 Item.createItem ("dustSilver", "Silver Dust", {name: "dustSilver", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustElectrum");
 Item.createItem ("dustElectrum", "Electrum Dust", {name: "dustElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustIron");
 Item.createItem ("dustIron", "Iron Dust", {name: "dustIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustCoke");
 Item.createItem ("dustCoke", "Coke Dust", {name: "dustCoke", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustLead");
 Item.createItem ("dustLead", "Lead Dust", {name: "dustLead", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustNickel");
 Item.createItem ("dustNickel", "Nickel Dust", {name: "dustNickel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustQuartz");
 Item.createItem ("dustQuartz", "Quartz Dust", {name: "dustQuartz", meta: 0}, {stack: 64});


 IDRegistry.genItemID ("wireCopper");
 Item.createItem ("wireCopper", "Copper Wire", {name: "wireCu", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("wireSteel");
 Item.createItem ("wireSteel", "Steel Wire", {name: "wireSteel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("wireAluminum");
 Item.createItem ("wireAluminum", "Aluminum Wire", {name: "wireAl", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("wireElectrum");
 Item.createItem ("wireElectrum", "Electrum Wire", {name: "wireElectrum", meta: 0}, {stack: 64});


 IDRegistry.genItemID ("moldRod");
 Item.createItem ("moldRod", "Metal Press Mold: Rod", {name: "moldRod", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("moldPlate");
 Item.createItem ("moldPlate", "Metal Press Mold: Plate", {name: "moldPlate", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("moldWire");
 Item.createItem ("moldWire", "Metal Press Mold: Wire", {name: "moldWire", meta: 0}, {stack: 64});