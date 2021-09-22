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