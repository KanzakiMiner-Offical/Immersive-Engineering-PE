IDRegistry.genBlockID("blastBrick");
Block.createBlock("blastBrick", [{ name: "Blast Brick", texture: [["blastBrick", 0]], inCreative: true }]);
/*
Recipes.addShaped({ id: BlockID.blastFurnace, count: 1, data: 0 }, [
	"aba",
	"bzb",
	"aba"
], ['a', 337, 0, 'b', 336, 0, 'z', 43, 0]);
*/
IDRegistry.genBlockID("blastFurnace");
Block.createBlock("blastFurnace", [{ name: "Coke Oven", texture: [["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnaceoff", 0], ["blastFurnace", 0], ["blastFurnace", 0]], inCreative: true }]);

TileRenderer.setStandartModel(BlockID.blastFurnace, [["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnaceoff", 0], ["blastFurnace", 0], ["blastFurnace", 0]]);
TileRenderer.registerRotationModel(BlockID.blastFurnace, 0, [["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnaceoff", 0], ["blastFurnace", 0], ["blastFurnace", 0]]);
TileRenderer.registerRotationModel(BlockID.blastFurnace, 4, [["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnace", 0], ["blastFurnaceon", 0], ["blastFurnace", 0], ["blastFurnace", 0]]);

var blastUI = new UI.StandartWindow({
  standart: {
    header: { text: { text: "Blast Furnace" } },
    background: { color: android.graphics.Color.parseColor("#5e200f") },
    inventory: { standart: true }
  },
  drawing: [],
  elements: {
    "background": { type: "image", x: 270, y: 90, bitmap: "backgroundBlastFurnace", scale: 3.2 },
    "slotSource": { type: "slot", x: 480, y: 160, size: 60 },
    "slotResult": { type: "slot", x: 703, y: 143, size: 94 },
    "slotFuel": { type: "slot", x: 479, y: 304, size: 60 },
    "slotSlag": { type: "slot", x: 720, y: 303, size: 60 },
    "scale_0": { type: "scale", x: 481, y: 237, direction: 0, bitmap: "heat_on", scale: 3.2, value: 1 },
    "scale_1": { type: "scale", x: 578, y: 233, direction: 0, bitmap: "progress", scale: 3.45, value: 1 }
  }
});

BlastRecipe.add({
  input: { id: 265, data: 0 },
  output: { id: ItemID.ingotSteel, data: 0 },
  dop: { id: ItemID.materialSlag, data: 0, count: 1 },
  time: 3200
});

BlastRecipe.add({
  input: { id: 42, data: 0 },
  output: { id: ItemID.storageSteel, data: 0 },
  dop: { id: ItemID.materialSlag, data: 0, count: 9 },
  time: 32000
});

FurnaceRegister.register(BlockID.blastFurnace, {

  defaultValues: {
    progress: 0,
    burn: 0,
    burnMax: 0,
    isActive: false,
    maxtime: 0
  },

  getGuiScreen: function() {
    return blastUI;
  },

  tick: function() {
    StorageInterface.checkHoppers(this);

    var inputSlot = this.container.getSlot("slotSource");
    var outputSlot = this.container.getSlot("slotOutput");
    var slagSlot = this.container.getSlot("slotSlag");
    var fuelSlot = this.container.getSlot("slotFuel");

    if (this.data.burn > 0) {
      this.data.burn--;
    }

    for (var r in BlastRecipe.recipes) {
      var recipe = BlastRecipe.recipes[r];
      var input = recipe.input;
      var out = recipe.output;
      var dop = recipe.do;
      if (inputSlot.id == input.id && inputSlot.count == input.count /*&& this.data.burn > 0*/ ) {
        this.data.progress++;
        this.data.maxtime += recipe.time
        if (this.data.progress >= this.data.maxtime) {
          inputSlot.count -= input.count;
          outputSlot.id = output.id;
          outputSlot.count = output.count;
          slagSlot.id = dop.id;
          slagSlot.count = dop.count;
          this.container.validateAll();
          this.data.progress = 0;
          this.data.maxtime = 0;
          this.data.burn = 0;
        }
      }
    }

    if (fuelSlot.id == BlockID.blockCoalCoke || fuelSlot.id == ItemID.coalCoke || fuelSlot.id == VanillaItemID.coal) {
      this.data.burn = this.data.burnMax = Recipe.getFuelBurnDuration(fuelSlot.id, fuelSlot.data);
    } else {
      this.data.burn = this.data.burnMax = 0;
    }
    /*if (slagSlot.id = ItemID.materialSlag){
      if(slagSlot.count <= 5){
        this.data.maxtime += 100;
      } else if (slagSlot.count <= 25){
        this.data.maxtime += 500;
      } else if (slagSlot.count <= 50){
        this.data.maxtime += 1000;
      } else if (slagSlot.count <= 64){
        this.data.maxtime += 1280;
      } 
      return this.data.maxtime;
    }*/

    if (slagSlot.id == ItemID.materialSlag) {
      if (slagSlot.count > 0) {
        this.data.maxtime += 40 * slagSlot.count;
      }
      return this.data.maxtime;
    }


    if (this.data.burn > 0) {
      this.activate();
    } else {
      this.deactivate();
    }

    this.container.setScale("scale_1", this.data.progress / this.data.maxtime);
    this.container.setScale("scale_0", this.data.burn / this.data.burnMax || 0);
  }

});