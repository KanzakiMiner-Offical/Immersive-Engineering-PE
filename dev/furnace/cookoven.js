IDRegistry.genBlockID("cokeBrick");
Block.createBlock("cokeBrick", [{ name: "Coke Brick", texture: [["cokeBrick", 0]], inCreative: true }]);
Recipes.addShaped({ id: BlockID.cokeBrick, count: 1, data: 0 }, [
	"aba",
	"bzb",
	"aba"
], ['a', 337, 0, 'b', 336, 0, 'z', 43, 0]);

IDRegistry.genBlockID("cokeOven");
Block.createBlock("cokeOven", [{ name: "Coke Oven", texture: [["cokeBrick", 0], ["cokeBrick", 0], ["cokeBrick", 0], ["cokeOvenoff", 0], ["cokeBrick", 0], ["cokeBrick", 0]], inCreative: true }]);

TileRenderer.setStandartModel(BlockID.cokeOven, [["cokeBrick", 0], ["cokeBrick", 0], ["cokeBrick", 0], ["cokeOvenoff", 0], ["cokeBrick", 0], ["cokeBrick", 0]]);
TileRenderer.registerRotationModel(BlockID.cokeOven, 0, [["cokeBrick", 0], ["cokeBrick", 0], ["cokeBrick", 0], ["cokeOvenoff", 0], ["cokeBrick", 0], ["cokeBrick", 0]]);
TileRenderer.registerRotationModel(BlockID.cokeOven, 4, [["cokeBrick", 0], ["cokeBrick", 0], ["cokeBrick", 0], ["cokeOvenon", 0], ["cokeBrick", 0], ["cokeBrick", 0]]);
/*
var Fuel = [
  BlockID.blockCoalCoke,
  VanillaItemID.coal
]*/

var ovenUI = new UI.StandartWindow({
  standart: {
    header: { text: { text: "Coke Oven" } },
    background: { color: android.graphics.Color.parseColor("#586a6e") },
    inventory: { standart: true }
  },
  drawing: [],
  elements: {
    "background": {type: "image", x: 270, y: 90, bitmap: "backgroundCokeOven", scale: 3.2},
    "slotLiquid0": {
      type: "slot",
      x: 550,
      y: 280,
      isValid: function(id, count, data) {
        return LiquidLib.getFullItem(id, data, "creosole") ? true : false;
      }
    },

    "slotLiquid1": { type: "slot", x: 550, y: 150, isValid: function() { return false; } },
    //"image_0": { type: "image", x: 850, y: 150, bitmap: "heat_bar_0", scale: 2.4 },
    "liquidScale": { type: "scale", x: 820, y: 160, direction: 1, bitmap: "gui_water_scale", scale: 3.6, value: 0.5 },
    "slotSource": { type: "slot", x: 410, y: 222, size: 60 },
    "slotResult": { type: "slot", x: 612, y: 204, size: 98},
    "progressScale": { type: "scale", x: 511, y: 224, direction: 0, bitmap: "heat_on", scale: 3.35, value: 0.5 },
  }
});


CokeOvenRecipe.add({
  input: { id: VanillaItemID.coal, count: 1 },
  output: { id: ItemID.coalCoke, data: 0, count: 1 },
  time: 1000,
  liquid: 5000
});

CokeOvenRecipe.add({
  input: { id: VanillaItemID.coal, count: 1 },
  output: { id: ItemID.coalCoke, data: 0, count: 1 },
  time: 9000,
  liquid: 500
})
FurnaceRegistry.register(BlockID.cokeOven, {
  defaultValues: {
    progress: 0,
    burn: 0,
    burnMax: 0,
    isActive: false
  },
  getGuiScreen: function() {
    return ovenUI;
  },

  addLiquidToItem: FurnaceRegistry.addLiquidToItem,

  tick: function() {
    StorageInterface.checkHoppers(this);

    var slot = this.container.getSlot("slotSource");
    var output = this.container.getSlot("slotResult");

    if (this.data.burn > 0) {
      this.data.burn--;
    }

    for (var s in CokeOvenRecipe.recipes) {
      var Recipe = CokeOvenRecipe.recipes[s];
      for (var z in Recipe.input) {
        var RecipeInput = Recipe.input;
        if (slot.id == RecipeInput.id && slot.count == RecipeInput.Count) {
          this.data.burnMax = this.data.burn = Recipe.time;
          if (this.data.burn <= 0) {
            slot.count -= RecipeInput.count;
            output.id = Recipe.output.id;
            output.count = Recipe.output.id;
            this.container.validateAll();
            var LiquidOut = Recipe.liquid / 1000;
            this.liquidStorage.addLiquid("creosole", LiquidOut);
            this.data.burn = 0;
          }
        }
      }
    }

    if (this.data.burn > 0) {
      this.activate();
    } else {
      this.deactivate();
    }

    var slot1 = this.container.getSlot("slotLiquid0");

    var slot2 = this.container.getSlot("slotLiquid1");

    this.addLiquidToItem("creosole", slot1, slot2);

    this.liquidStorage.updateUiScale("liquidScale", "creosole");

    this.container.setScale("progressScale", this.data.burn / this.data.burnMax || 0);

  }

});