IDRegistry.genBlockID("kilnbrick");
Block.createBlock("kilnbrick", [
  { name: "Kiln Brick", texture: [["kilnalloy", 0], ["kilnalloy", 0], ["kilnalloy", 0], ["kilnalloy", 0], ["kilnalloy", 0], ["kilnalloy", 0]], inCreative: true }
], "opaque");
ToolAPI.registerBlockMaterial(BlockID.kilnbrick, "stone", 1);
Block.setDestroyLevel(BlockID.kilnbrick, 1);

IDRegistry.genBlockID("kiln_core");
Block.createBlock("kiln_core", [
  { name: "Kiln Alloy", texture: [["kilnF", 0], ["kilnside", 0], ["kilnside", 0], ["kilnside", 0], ["kilnside", 0], ["kilnside", 0]], inCreative: true }
], "opaque");
ToolAPI.registerBlockMaterial(BlockID.kilnalloy, "stone", 1);
Block.setDestroyLevel(BlockID.kilnalloy, 1);
/*
Callback.addCallback("PreLoaded", function(){
    //Bronze
    addaloyIErecipe({id: ItemID.ingotBronze, count: 4}, [{id: ItemID.ingotCopper, count: 3},{id:ItemID.ingotTin, count:1}]);
    
});

// mod compatibility
ModAPI.addAPICallback("ICore", function(api){
});*/

KilnAlloyRecipe.add({
  input: [{ id: ItemID.ingotCopper, count: 1 }, { id: ItemID.ingotNickel, count: 1 }],
  output: { id: ItemID.ingotConstantan, data: 0, count: 2 },
  time: 200
});

//kilnalloy
var kilnUI = new UI.StandartWindow({
  standart: {
    header: { text: { text: "Kiln Alloy" } },
    background: { color: android.graphics.Color.parseColor("#b3b3b3") },
    inventory: { standart: true }
  },
  drawing: [],
  elements: {
    "slotFuel": { type: "slot", x: 840, y: 360, size: 64, bitmap: "coal_slot" },
    "image_0": { type: "image", x: 850, y: 150, bitmap: "heat_bar_0", scale: 2.4 },
    "burningScale": { type: "scale", x: 850, y: 150, direction: 1, bitmap: "heat_bar_1", scale: 12, value: 0.5 },
    "slotSource1": { type: "slot", x: 500, y: 180, size: 64 },
    "slotSource2": { type: "slot", x: 580, y: 180, size: 63 },
    "image_1": { type: "image", x: 640, y: 260, bitmap: "furnace_bar_background", scale: 3.6 },
    "slotResult": { type: "slot", x: 730, y: 250, size: 77 },
    "progressScale": { type: "scale", x: 640, y: 260, direction: 0, bitmap: "furnace_bar_scale", scale: 3.55, value: 0.5 },
  }
});

FurnaceRegistry.register(BlockID.kiln_core, {
  defaultValues: {
    progress: 0,
    burn: 0,
    burnMax: 0,
    isActive: false
  },
  getGuiScreen: function() {
    return kilnUI;
  },

  tick: function() {
    StorageInterface.checkHoppers(this);

    for (var i = 1; i <= 2; i++) {
      var slot = this.container.getSlot("slotSource" + i);
      // let recipe = KilnAlloyRecipe.getResult(slot.id, slot.data);
      for (var s in KilnAlloyRecipe.recipes) {
        var Recipe = KilnAlloyRecipe.recipes[s];
        for (var z in Recipe.input) {
          var RecipeInput = Recipe.input[z];
          if (slot.id == RecipeInput.id && slot.data == RecipeInput.data && slot.count == RecipeInput.count.count) {
            if (this.data.burn == 0) {
              this.data.burn = this.data.burnMax = this.getFuel("slotFuel");
            }
            if (this.data.burn > 0 && this.data.progress++ >= Recipe.time) {
              var output = this.container.getSlot("slotResult");
              output.id = Recipe.output.id;
              output.data = Recipe.output.data;
              output.count = Recipe.output.count;

              slot.id -= RecipeInput.count;

              this.container.validateAll();
              this.data.progress = 0;
            }
          } else {
            this.data.progress = 0;
          }
        }
      }
    }
    /*var sourceItems = {};
    var source;
    var result;
    for(var i = 1; i <= 2; i++){
        var slot = this.container.getSlot("slotSource" + i);
        if(slot.id > 0 && slot.data==0){
            sourceItems[slot.id] = sourceItems[slot.id] || 0;
            sourceItems[slot.id] += slot.count;
        }
    }
    for(var i in aloyIE_recipe){
        var recipe = aloyIE_recipe[i];
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
    
    if(this.data.burn > 0){
        this.data.burn--;
    }
    
    var resultSlot = this.container.getSlot("slotResult");
    if(result && (resultSlot.id == result.id && resultSlot.count + result.count <= 64 || resultSlot.id == 0)){
        if(this.data.burn==0){
            this.data.burn = this.data.burnMax = this.getFuel("slotFuel");
        }
        if(this.data.burn > 0 && this.data.progress++ >= 200){
            for(var s in source){
                var count = source[s].count;
                for(var i = 1; i <= 4; i++){
                    var slot = this.container.getSlot("slotSource" + i);
                    if(slot.id == source[s].id){
                        var c = Math.min(count, slot.count);
                        slot.count -= c;
                        count -= c;
                    }
                }
            }
            resultSlot.id = result.id;
            resultSlot.count += result.count;
            this.container.validateAll();
            this.data.progress = 0;
        }
    }
    else{
        this.data.progress = 0;
    }
    */

    if (this.data.burn > 0) {
      this.activate();
    } else {
      this.data.progress = 0;
      this.deactivate();
    }

    this.container.setScale("burningScale", this.data.burn / this.data.burnMax || 0);
    this.container.setScale("progressScale", this.data.progress / 200);
  },

  getFuel: function(slotName) {
    var fuelSlot = this.container.getSlot(slotName);
    if (fuelSlot.id > 0) {
      var burn = Recipes.getFuelBurnDuration(fuelSlot.id, fuelSlot.data);
      if (burn) {
        if (LiquidRegistry.getItemLiquid(fuelSlot.id, fuelSlot.data)) {
          var empty = LiquidRegistry.getEmptyItem(fuelSlot.id, fuelSlot.data);
          fuelSlot.id = empty.id;
          fuelSlot.data = empty.data;
          return burn;
        }
        fuelSlot.count--;
        this.container.validateSlot(slotName);
        return burn;
      }
    }
    return 0;
  },
});

//TileRenderer.setRotationPlaceFunction(BlockID.kiln_core);

StorageInterface.createInterface(BlockID.kiln_core, {
  slots: {
    "slotSource1": { input: true, isValid: function(item, side) { return side == 1 } },
    "slotSource2": { input: true, isValid: function(item, side) { return side == 1 } },
    "slotResult": { output: true }
  }
});