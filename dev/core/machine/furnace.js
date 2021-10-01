const FurnaceRegistry = {

  furnaceIDs: {},


  isMachine: function(id) {
    return this.furnaceIDs[id];
  },

  register: function(id, Prototype) {
    // register ID
    this.furnaceIDs[id] = true;

    // click fix
    Prototype.onItemClick = Prototype.onItemClick || function(id, count, data, coords) {
      if (this.click(id, count, data, coords)) return true;
      if (Entity.getSneaking(player)) return false;
      var gui = this.getGuiScreen();
      if (gui) {
        this.container.openAs(gui);
        return true;
      }
    };

    if (Prototype.wrenchClick) {
      Prototype.click = function(id, count, data, coords) {
        var item = Player.getCarriedItem();
        if (ICTool.isValidWrench(item, 10)) {
          if (this.wrenchClick(id, count, data, coords))
            ICTool.useWrench(item, 10);
          return true;
        }
        return false;
      };
    }

    // audio
    if (Prototype.getStartSoundFile) {
      if (!Prototype.getStartingSoundFile) {
        Prototype.getStartingSoundFile = function() { return null; }
      }
      if (!Prototype.getInterruptSoundFile) {
        Prototype.getInterruptSoundFile = function() { return null; }
      }
      Prototype.startPlaySound = Prototype.startPlaySound || function() {
        if (!Config.machineSoundEnabled) { return; }
        let audio = this.audioSource;
        if (audio && audio.isFinishing) {
          audio.stop();
          audio.media = audio.startingSound || audio.startSound;
          audio.start();
          audio.isFinishing = false;
        }
        else if (!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()) {
          this.audioSource = SoundAPI.createSource([this.getStartingSoundFile(), this.getStartSoundFile(), this.getInterruptSoundFile()], this, 16);
        }
      }
      Prototype.stopPlaySound = Prototype.stopPlaySound || function(playInterruptSound) {
        let audio = this.audioSource;
        if (audio) {
          if (!audio.isPlaying()) {
            this.audioSource = null;
          }
          else if (!audio.isFinishing) {
            audio.stop();
            if (playInterruptSound) {
              audio.playFinishingSound();
            }
          }
        }
      }
    }
    else {
      Prototype.startPlaySound = Prototype.startPlaySound || function(name) {
        if (!Config.machineSoundEnabled) { return; }
        let audio = this.audioSource;
        if (!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()) {
          let sound = SoundAPI.playSoundAt(this, name, true, 16);
          this.audioSource = sound;
        }
      }
      Prototype.stopPlaySound = Prototype.stopPlaySound || function() {
        if (this.audioSource && this.audioSource.isPlaying()) {
          this.audioSource.stop();
          this.audioSource = null;
        }
      }
    }


    // machine activation
    if (Prototype.defaultValues && Prototype.defaultValues.isActive !== undefined) {
      if (!Prototype.renderModel) {
        Prototype.renderModel = this.renderModelWithRotation;
      }

      Prototype.setActive = Prototype.setActive || this.setActive;

      Prototype.activate = Prototype.activate || function() {
        this.setActive(true);
      }
      Prototype.deactivate = Prototype.deactivate || function() {
        this.setActive(false);
      }
      Prototype.destroy = Prototype.destroy || function() {
        BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
        this.stopPlaySound();
      }
    }

    if (!Prototype.init && Prototype.renderModel) {
      Prototype.init = Prototype.renderModel;
    }

    ToolAPI.registerBlockMaterial(id, "stone", 1, true);
    Block.setDestroyTime(id, 3);
    TileEntity.registerPrototype(id, Prototype);
  },
  setStoragePlaceFunction: function(id, fullRotation) {

    Block.registerPlaceFunction(BlockID[id], function(coords, item, block) {

      var place = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
      World.setBlock(place.x, place.y, place.z, item.id, 0);
      World.playSound(place.x, place.y, place.z, "dig.stone", 1, 0.8)
      var rotation = TileRenderer.getBlockRotation(fullRotation);
      var tile = World.addTileEntity(place.x, place.y, place.z);
      tile.data.meta = rotation;
      TileRenderer.mapAtCoords(place.x, place.y, place.z, item.id, rotation);
      if (item.extra) {
        tile.data.energy = item.extra.getInt("energy");
      }
    });
  },

  setFacing: function(coords) {
    if (Entity.getSneaking(player)) {
      var facing = coords.side ^ 1;
    } else {
      var facing = coords.side;
    }
    if (facing != this.data.meta) {
      this.data.meta = facing;
      this.renderModel();
      return true;
    }
    return false;
  },

  renderModel: function() {
    if (this.data.isActive) {
      TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, 0);
    } else {
      BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
    }
  },

  renderModelWithRotation: function() {
    TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive ? 4 : 0));
  },

  renderModelWith6Sides: function() {
    TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive ? 6 : 0));
  },

  setActive: function(isActive) {
    if (this.data.isActive != isActive) {
      this.data.isActive = isActive;
      this.renderModel();
    }
  },

  getLiquidFromItem: function(liquid, inputItem, outputItem, hand) {
    if (hand) outputItem = { id: 0, count: 0, data: 0 };
    var empty = LiquidLib.getEmptyItem(inputItem.id, inputItem.data);
    if (empty && (!liquid && this.interface.canReceiveLiquid(empty.liquid) || empty.liquid == liquid) && !this.liquidStorage.isFull(empty.liquid)) {
      if (outputItem.id == empty.id && outputItem.data == empty.data && outputItem.count < Item.getMaxStack(empty.id) || outputItem.id == 0) {
        var liquidLimit = this.liquidStorage.getLimit(empty.liquid);
        var storedAmount = this.liquidStorage.getAmount(liquid).toFixed(3);
        var count = Math.min(hand ? inputItem.count : 1, parseInt((liquidLimit - storedAmount) / empty.amount));
        if (count > 0) {
          this.liquidStorage.addLiquid(empty.liquid, empty.amount * count);
          inputItem.count -= count;
          outputItem.id = empty.id;
          outputItem.data = empty.data;
          outputItem.count += count;
          if (!hand) this.container.validateAll();
        }
        else if (inputItem.count == 1 && empty.storage) {
          var amount = Math.min(liquidLimit - storedAmount, empty.amount);
          this.liquidStorage.addLiquid(empty.liquid, amount);
          inputItem.data += amount * 1000;
        }
        if (hand) {
          if (outputItem.id) {
            Player.addItemToInventory(outputItem.id, outputItem.count, outputItem.data);
          }
          if (inputItem.count == 0) inputItem.id = inputItem.data = 0;
          Player.setCarriedItem(inputItem.id, inputItem.count, inputItem.data);
          return true;
        }
      }
    }
  },

  addLiquidToItem: function(liquid, inputItem, outputItem) {
    var amount = this.liquidStorage.getAmount(liquid).toFixed(3);
    if (amount > 0) {
      var full = LiquidLib.getFullItem(inputItem.id, inputItem.data, liquid);
      if (full && (outputItem.id == full.id && outputItem.data == full.data && outputItem.count < Item.getMaxStack(full.id) || outputItem.id == 0)) {
        if (amount >= full.amount) {
          this.liquidStorage.getLiquid(liquid, full.amount);
          inputItem.count--;
          outputItem.id = full.id;
          outputItem.data = full.data;
          outputItem.count++;
          this.container.validateAll();
        }
        else if (inputItem.count == 1 && full.storage) {
          if (inputItem.id == full.id) {
            amount = this.liquidStorage.getLiquid(liquid, full.amount);
            inputItem.data -= amount * 1000;
          } else {
            amount = this.liquidStorage.getLiquid(liquid, full.storage);
            inputItem.id = full.id;
            inputItem.data = (full.storage - amount) * 1000;
          }
        }
      }
    }
  }
}

const KilnAlloyRecipe = {
  recipes: [],

  add: function(obj) {
    if (!obj)
      return;

    let input = obj.input;
    if (!input || !input.id)
      return;

    input.data = input.data || 0;

    this.recipes.push(obj);
  },

  getResult: function(id, data) {
    if (!id)
      return null;

    for (let i in this.recipes) {
      let recipe = this.recipes[i];
      let input = recipe.input;
      if (input.id === id && (input.data === -1 || input.data === data))
        return recipe;
    }
    return null;
  },
  show: function(api) {
    api.registerRecipeType("ie_kilnalloy", {
      contents: {
        icon: BlockID.kiln_core,
        drawing: [
          { type: "bitmap", x: 500, y: 220, bitmap: "furnace_bar_scale", scale: 6 },
            ],
        elements: {
          input0: { type: "slot", x: 240, y: 150, size: 120 },
          input1: { type: "slot", x: 360, y: 150, size: 120 },
          output0: { type: "slot", x: 652, y: 210, size: 120 },
        }
      },
      getList: function(id, data, isUsage) {
        let list = [];
        if (isUsage) {
          for (let i in this.recipes) {
            let recipe = this.recipes[i];
            let input = recipe.input;
            for (let j in input) {
              if (input[j].id == id) {
                list.push({
                  input: input,
                  output: [recipe.result]
                });
              }
            }
          }
        }
        else {
          for (let i in this.recipes) {
            let recipe = this.recipes[i];
            if (recipe.result.id == id) {
              list.push({
                input: recipe.input,
                output: [recipe.result]
              });
            }
          }
        }
        return list;
      }
    });
  }

};

const CokeOvenRecipe = {
  recipes: [],

  add: function(obj) {
    if (!obj)
      return;

    let input = obj.input;
    if (!input || !input.id)
      return;

    input.data = input.data || 0;

    this.recipes.push(obj);
  },

  getResult: function(id, data) {
    if (!id)
      return null;

    for (let i in this.recipes) {
      let recipe = this.recipes[i];
      let input = recipe.input;
      if (input.id === id && (input.data === -1 || input.data === data))
        return recipe;
    }
    return null;
  },
  show: function(api) {
    api.registerRecipeType("ie_cokeoven", {
      contents: {
        icon: BlockID.cokeOven,
        drawing: [
          { type: "bitmap", x: 500, y: 220, bitmap: "furnace_bar_scale", scale: 6 },
            ],
        elements: {
          input0: { type: "slot", x: 240, y: 150, size: 120 },
          //input1: { type: "slot", x: 360, y: 150, size: 120 },
          output0: { type: "slot", x: 652, y: 210, size: 120 },
        }
      },
      getList: function(id, data, isUsage) {
        let list = [];
        if (isUsage) {
          for (let i in this.recipes) {
            let recipe = this.recipes[i];
            let input = recipe.input;
            for (let j in input) {
              if (input[j].id == id) {
                list.push({
                  input: input,
                  output: recipe.result
                });
              }
            }
          }
        }
        else {
          for (let i in this.recipes) {
            let recipe = this.recipes[i];
            if (recipe.result.id == id) {
              list.push({
                input: recipe.input,
                output: recipe.result
              });
            }
          }
        }
        return list;
      }
    });
  }

};

const BlastRecipe = {
  recipes: [],

  add: function(obj) {
    if (!obj)
      return;

    let input = obj.input;
    if (!input || !input.id)
      return;

    input.data = input.data || 0;

    this.recipes.push(obj);
  },

  getResult: function(id, data) {
    if (!id)
      return null;

    for (let i in this.recipes) {
      let recipe = this.recipes[i];
      let input = recipe.input;
      if (input.id === id && (input.data === -1 || input.data === data))
        return recipe;
    }
    return null;
  },
  show: function(api) {
    api.registerRecipeType("ie_blastfurnace", {
      contents: {
        icon: BlockID.blastFurnace,
        drawing: [
          { type: "bitmap", x: 500, y: 220, bitmap: "furnace_bar_scale", scale: 6 },
            ],
        elements: {
          input0: { type: "slot", x: 240, y: 210, size: 120 },
          //input1: { type: "slot", x: 360, y: 150, size: 120 },
          output0: { type: "slot", x: 652, y: 210, size: 120 },
          output1: { type: "slot", x: 652, y: 90, size: 120 },
        }
      },
      getList: function(id, data, isUsage) {
        let list = [];
        if (isUsage) {
          for (let i in this.recipes) {
            let recipe = this.recipes[i];
            let input = recipe.input;
            for (let j in input) {
              if (input[j].id == id) {
                list.push({
                  input: input,
                  output: [
                    { id: recipe.result.id, count: recipe.result.count },
                    { id: recipe.dop.id, count: recipe.dop.count }
                    ]
                });
              }
            }
          }
        }
        else {
          for (let i in this.recipes) {
            let recipe = this.recipes[i];
            if (recipe.result.id == id) {
              list.push({
                input: recipe.input,
                output: [
                  { id: recipe.result.id, count: recipe.result.count },
                  { id: recipe.dop.id, count: recipe.dop.count }
             		]
              });
            }
          }
        }
        return list;
      }
    });
  }

};