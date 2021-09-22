IDRegistry.genBlockID("MB_refinery");
Block.createBlock("MB_refinery", [
  { name: "Refinery", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("refinery", 0);
mesh.importFromFile(__dir__ + "assets/models/refinery.obj", "obj", null);
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_refinery, -1, icRenderModel);

IDRegistry.genBlockID("refinery");
Block.createBlock("refinery", [
  { name: "Refinery", texture: [["mp", 0], ["refinery_t", 0], ["refinery_s", 0], ["refinery_s", 0], ["refinery_s", 0], ["refinery_s", 0]], inCreative: true }
], "machine");


var guiRefienery = new UI.StandartWindow({

  standart: {

    header: { text: { text: Translation.translate("Refinery") } },
    inventory: { standart: true },
    background: { standart: true }
  },

  drawing: [
    { type: "bitmap", x: 550, y: 158, bitmap: "arrow_bg", scale: 0.6 },
    { type: "bitmap", x: 700, y: 135, bitmap: "rf_scale", scale: GUI_SCALE }

	],

  elements: {
    "slotResult": { type: "slot", x: 600, y: 150, size: 60 },
    "progressScale": { type: "scale", x: 550, y: 158, direction: 0, value: .5, bitmap: "arrow_full", scale: GUI_SCALE },

    "scaleEthanol": { type: "scale", x: 410, y: 90, direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE },

    "slotEthanol0": {
      type: "slot",
      x: 350,
      y: 250,
      isValid: function(id, count, data) {
        return LiquidLib.getItemLiquid(id, data) == "ethanol";
      }
    },
    "slotEthanol1": { type: "slot", x: 350, y: 185, isValid: function() { return false; } },


    "scalePlantOil": { type: "scale", x: 520, y: 140, direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE },

    "slotPlant0": {
      type: "slot",
      x: 460,
      y: 250,
      isValid: function(id, count, data) {
        return LiquidLib.getItemLiquid(id, data) == "plantoil";
      }
    },
    "slotPlant1": { type: "slot", x: 460, y: 185, isValid: function() { return false; } },

    "energyScale": { type: "scale", x: 700, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: 0.6 }
  }
});

MachineRegistry.registerElectricMachine(BlockID.refinery, {
  defaultValues: {
    power_tier: 1,
    energy_storage: 16000,
    energy_consumption: 80,
    work_time: 10,
    progress: 0,
    isActive: false,
  },

  getGuiScreen: function() {
    return guiRefienery;
  },

  init: function() {
    this.liquidStorage.setLimit("plantoil", 10);
    this.liquidStorage.setLimit("ethanol", 10);
    this.renderModel();
  },

  getLiquidFromItem: MachineRegistry.getLiquidFromItem,

  tick: function() {
    StorageInterface.checkHoppers(this);

    var newActive = false;
    var LiquidOut = 0.008;
    var output = this.container.getSlot("slotResult");
    if (this.liquidStorage.getAmount("ethanol") >= LiquidOut && this.liquidStorage.getAmount("plantoil") >= LiquidOut) {
      if (this.data.energy >= this.data.energy_consumption) {
        this.data.energy -= this.data.energy_consumption;
        this.data.progress += 1/ this.data.work_time;
        newActive = true;
        this.startPlaySound();
      }
      if (this.data.progress >= 1) {
        this.liquidStorage.getLiquid("ethanol", LiquidOut);
        this.liquidStorage.getLiquid("plantoil", LiquidOut);
        this.data.progress = 0;
        this.liquidStorage.addLiquid("biodiesel", 1);
      }
    }
    else {
      this.data.progress = 0;
    }
    if (!newActive)
      this.stopPlaySound(true);
    this.setActive(newActive);


    var slot1 = this.container.getSlot("slotPlant0");
    var slot2 = this.container.getSlot("slotPlant1");
    this.getLiquidFromItem("plantoil", slot1, slot2);

    var slot1 = this.container.getSlot("slotEthanol0");
    var slot2 = this.container.getSlot("slotEthanol1");
    this.getLiquidFromItem("ethanol", slot1, slot2);

    var energyStorage = this.getEnergyStorage();
    this.data.energy = Math.min(this.data.energy, energyStorage);

    this.container.setScale("progressScale", this.data.progress);
    this.liquidStorage.updateUiScale("scaleEthanol", "ethanol");
    this.liquidStorage.updateUiScale("scalePlant", "plantoil");
    //this.container.setScale("scaleLatex", this.liquidStorage.getAmount("latex") / this.liquidStorage.getLimit("latex"));
    this.container.setScale("energyScale", this.data.energy / energyStorage);
  },

  getEnergyStorage: function() {
    return this.data.energy_storage;
  },

  getStartSoundFile: function() {
    return "Machines/TurnOn.ogg";
  },
  getInterruptSoundFile: function() {
    return "Machines/TurnOff.ogg";
  },

  //renderModel: MachineRegistry.renderModelWithRotation,
  energyReceive: MachineRegistry.basicEnergyReceiveFunc

});

//TileRenderer.setRotationPlaceFunction(BlockID.latex_process, true);