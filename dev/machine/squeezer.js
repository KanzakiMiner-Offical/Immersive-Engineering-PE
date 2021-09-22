IDRegistry.genBlockID("squeeze r");
Block.createBlock("squeezer", [
  { name: "Squeezer", texture: [["squeezer", 0], ["squeezer", 0], ["squeezer", 0], ["squeezer", 0], ["squeezer", 0], ["squeezer", 0]], inCreative: true }
], "machine");

IDRegistry.genBlockID("coreSqueezer");
Block.createBlock("coreSqueezer", [
  { name: "Squeezer Core", texture: [["metal_t", 0], ["metal_t", 0], ["Squeezer_s", 0], ["Squeezer_f", 0], ["Squeezer_s", 0], ["Squeezer_s", 0]], inCreative: true }
], "machine");

var Squeezer_structure = [
  { x: -1, y: 0, z: +1, id: BlockID.squeezer },
  { x: -1, y: 0, z: 0, id: BlockID.lightEngineer },
  { x: -1, y: 0, z: -1, id: BlockID.squeezer },
  { x: -2, y: 0, z: +1, id: BlockID.squeezer },
  { x: -2, y: 0, z: 0, id: BlockID.squeezer },
  { x: -2, y: 0, z: -1, id: BlockID.squeezer },
  { x: 0, y: 0, z: +1, id: BlockID.squeezer },
  { x: 0, y: 0, z: -1, id: BlockID.squeezer },
  { x: 0, y: +1, z: 0, id: BlockID.lightEngineer },
  { x: 0, y: -1, z: 0, id: BlockID.lightEngineer },
  { x: -1, y: +1, z: +1, id: BlockID.lightEngineer },
  { x: -1, y: +1, z: 0, id: BlockID.lightEngineer },
  { x: -1, y: +1, z: -1, id: BlockID.lightEngineer },
  { x: -2, y: +1, z: +1, id: BlockID.lightEngineer },
  { x: -2, y: +1, z: 0, id: BlockID.lightEngineer },
  { x: -2, y: +1, z: -1, id: BlockID.lightEngineer },
  { x: 0, y: +1, z: +1, id: BlockID.lightEngineer },
  { x: 0, y: +1, z: -1, id: BlockID.lightEngineer },
  { x: -1, y: -1, z: +1, id: BlockID.lightEngineer },
  { x: -1, y: -1, z: 0, id: BlockID.lightEngineer },
  { x: -1, y: -1, z: -1, id: BlockID.lightEngineer },
  { x: -2, y: -1, z: +1, id: BlockID.lightEngineer },
  { x: -2, y: -1, z: 0, id: BlockID.lightEngineer },
  { x: -2, y: -1, z: -1, id: BlockID.lightEngineer },
  { x: 0, y: -1, z: +1, id: BlockID.lightEngineer },
  { x: 0, y: -1, z: -1, id: BlockID.lightEngineer }
];

var SqueezerRecipe = [
  { id: 295, count: 0.08 },
  { id: 361, count: 0.04 }, // pumkin
  { id: 362, count: 0.02 }, // melon
  { id: 435, count: 0.06 } // beetroot
];

var guiSqueezer = new UI.StandartWindow({
  standart: {
    header: { text: { text: "Squeezer" } },
    inventory: { standart: true },
    background: { standart: true }
  },
  drawing: [
    { type: "bitmap", x: 480, y: 160, bitmap: "arrow_bar_background", scale: 3.2 },
    { type: "bitmap", x: 480, y: 70, bitmap: "rf_scale", scale: 0.6 }
	],
  elements: {
    "scaleLiquid": { type: "scale", x: 555, y: 151, direction: 0, bitmap: "", scale: 3.2, value: 1 },
    "progressScale": { type: "scale", x: 480, y: 160, bitmap: "arrow_bar_scale", scale: 3.2 },
    "energyScale": { type: "scale", x: 480, y: 69, direction: 0, bitmap: "rf_scale_full", scale: 0.6, value: 1 },
    "slotIn": {
      type: "slot",
      x: 680,
      y: 140,
      size: 60,
      isValid: function(id, count, data) {
        return LiquidLib.getItemLiquid(id, data) == "plantoil";
      }
    },
    "slotOut": { type: "slot", x: 680, y: 70, size: 60 },
    "slotInput": { type: "slot", x: 408, y: 156, size: 60 },
    "slotEnergy": { type: "slot", x: 750, y: 20, size: 45 }
  }
});


MachineRegistry.registerElectricMachine(BlockID.coreSqueezer, {
  defaultValues: {
    energy_storage: 16000,
    energy_consumption: 64,
    progress: 0,
    work_time: 100,
    isActive: false,
  },

  getGuiScreen: function() {
    return guiSqueezer;
  },

  setDefaultValues: function() {
    this.data.energymax = this.defaultValues.energymax;
    this.data.energy_consumption = this.defaultValues.energy_consumption;
    this.data.work_time = this.defaultValues.work_time;
  },

  init: function() {
    this.liquidStorage.setLimit("plantoil", 24);
  },

  addLiquidToItem: MachineRegistry.addLiquidToItem,

  tick: function() {
    var newActive = false;
    StorageInterface.checkHoppers(this);
    var slotFuel = this.container.getSlot("slotInput");

    for (var i in FementerRecipe) {
      var recipe = FementerRecipe[i]
      if (slotFuel.id == recipe.id) {
        if (this.data.energy >= this.data.energy_consumption) {
          this.data.energy -= this.data.energy_consumption;
          this.data.progress += 1 / this.data.work_time;
          newActive = true;
        }
        if (this.data.progress >= 1) {
          slotFuel.count--;
          this.liquidStorage.getLiquid("plantoil", recipe.count);
          this.container.validateAll();
          this.data.progress = 0;
        }
        else {
          this.data.progress = 0;
        }
        if (!newActive)
          this.setActive(newActive);
      }
    }
    
    if (slotFuel.id == ItemID.coalCoke && slotFuel.count == 8) {
        if (this.data.energy >= this.data.energy_consumption) {
          this.data.energy -= this.data.energy_consumption;
          this.data.progress += 1 / this.data.work_time;
          newActive = true;
        }
        if (this.data.progress >= 1) {
        let slotOuput = this.container.getSlot("slotOut");
          slotFuel.count -= 8;
          this.container.validateAll();
          this.data.progress = 0;
          slotOutput.id = ItemID.dustHOPGraphite;
          slotOutput.count += 1;
        }
        else {
          this.data.progress = 0;
        }
        if (!newActive)
          this.setActive(newActive);
      }

    var slot1 = this.container.getSlot("slotIn");
    var slot2 = this.container.getSlot("slotOut");
    this.addLiquidToItem("plantoil", slot1, slot2);

    this.data.energy = Math.min(this.data.energy, energyStorage);

    this.container.setScale("energyScale", this.data.energy / this.data.energymax);
    this.container.setScale("progressScale", this.data.progress);
    this.liquidStorage.updateUiScale("scaleLiquid", "plantoil");
  },

  getEnergyStorage: function() {
    return this.data.energymax;
  },

  validStructure: function() {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    isValidStructure = StructureLib.getStructure(x, y, z, Squeezer_structure);
  },


  energyTick: MachineRegistry.basicEnergyReceiveFunc

});

TileRenderer.setRotationPlaceFunction(BlockID.coreSqueezer, true);