IDRegistry.genBlockID("kineticDynamo");
Block.createBlock("kineticDynamo", [
  { name: "Kinetic Dynamo", texture: [["dynamoBottom", 0], ["dynamoTop", 0], ["dynamoSide", 0], ["dynamoSide", 0], ["dynamoFront", 0], ["dynamoSide", 0]], inCreative: true }], "machine");
/*
TileRenderer.setStandartModel(BlockID.kineticDynamo, [["dynamoTop", 0], ["dynamoTop", 0], ["dg_STORAGE", 0], ["dg_f", 0], ["dynamoTop", 0], ["dynamoTop", 0]]);
TileRenderer.registerRotationModel(BlockID.kineticDynamo, 0, [["dynamoTop", 0], ["dynamoTop", 0], ["dg_STORAGE", 0], ["dg_f", 0], ["dynamoTop", 0], ["dynamoTop", 0]]);
TileRenderer.registerRotationModel(BlockID.kineticDynamo, 4, [["dynamoTop", 0], ["dynamoTop", 0], ["dg_STORAGE", 3], ["dg_f", 1], ["dynamoTop", 0], ["dynamoTop", 0]]);
World.getBlockID(this.x,this.y,this.z+1)==17
*/
var EnergyProduc1 = [
  6,
  16,
  25,
  30
];
var EnergyProduc2 = [
  13,
  32,
  50,
  59
];
var EnergyProduc3 = [
  20,
  48,
  75,
  88
];
/*
var WindRate1 = [
  11.89,
  15,
  18,
  21,
  24,
  27,
  30,
  33,
  35,55
];
var WindRate2 = [
  15.8,
  20,
  24,
  28,
  32,
  36,
  40,
  43,
  47,4
];
var WindRate3 = [
  23.97,
  30,
  36,
  42,
  48,
  54,
  60,
  66,
  71.82
];*/
MachineRegistry.registerGenerator(BlockID.kineticDynamo, {

  defaultValues: {
    sails: 0,
    meta: 0,
    isActive: false
  },

  click: function() {
    let item = Player.getCarriedItem();
    if(Entity.getSneaking(Player.get())){
    if (this.data.sails < 8 && item.id == ItemID.windSail){
      this.data.sails += 1;
      Player.decreaseCarriedItem();
    }
}
  },


  waterWheel: function() {
    let arr1 = [false, false, false]; // Lượng Bánh xe
    let tier = 0;
    let arr2 = [false, false, false, false]; //lượng nước(chỉ cho water wheel)
    let power = 0;
    if (types == BlockID.waterWheel) {
      var TypeBlock = types;
      if (World.getBlockID(this.x, this.y, this.z + 1) == TypeBlock) {
        arr1[0] = true
        if (World.getBlockID(this.x, this.y, this.z + 2) == TypeBlock) {
          arr1[1] = true
          if (World.getBlockID(this.x, this.y, this.z + 3) == TypeBlock) {
            arr1[2] = true
          }
        }
      }

    }
    if (World.getBlockID(this.x, this.y + 1, this.z) === 8 /* && World.getBlockID(this.x + 1, this.y+3, this.z) === 8 && World.getBlockID(this.x + 1, this.y+3, this.z) === 8*/ ) {
      arr2[0] = true
    }

    if (World.getBlockID(this.x, this.y - 1, this.z) === 8) {
      arr2[1] = true
    }

    if (World.getBlockID(this.x + 1, this.y, this.z) === 8) {
      arr2[2] = true
    }

    if (World.getBlockID(this.x - 1, this.y, this.z) === 8) {
      arr2[3] = true
    }

    for (let i in arr2) {
      if (arr2[i]) {
        power++
      }
    }

    for (let e in arr1) {
      if (arr1[e]) {
        tier++
      }
    }

    if (tier > 0 && power > 0) {
      return {
        isWater: true,
        level: tier,
        pow: power
      }
    } else {
      return {
        isWater: false,
        level: 0,
        pow: 0
      }
    }

  },

  windMill: function() {
    //  Ktra thời tiết nhá
    var WTP = 0;
    var wtArray1 = [false, false];
    var CheckWeather = World.getWeather()
    if (CheckWeather.rain != 0 && CheckWeather.thunder == 0) {
      wtArray1[0] = true;
    }
    if (CheckWeather.rain != 0 && CheckWeather.thunder != 0) {
      wtArray1[1] = true;
    }
    for (let e in wtArray1) {
      if (wtArray1[e]) {
        WTP++
      }
    }

    if (WTP >= 0) {
      return {
        isRain: true,
        pw: WTP
      }
    } else {
      return {
        isRain: false,
        pw: 0
      }
    }
  },

  tick: function() {
    if (World.getBlock(this.x, this.y, this.z + 1) == BlockID.waterWheel) {
      var enerpro;
      var level = this.waterWheel().level;
      var pow = this.waterWheel().pow
      if (level != 0 && pow != 0) {
        if (level == 1) {
          enerpro = EnergyProduc1[pow];
        } else if (level == 2) {
          enerpro = EnergyProduc2[pow];
        } else if (level == 3) {
          enerpro = EnergyProduc3[pow];
        }
        this.data.energy += enerpro;
        this.activate();
      } else {
        this.deactivate();
      }
    }

    if (World.getBlock(this.x, this.y, this.z + 1) == BlockID.windMill) {
      var Sail = this.data.sails
      var enerpro;
      var weather = this.windMill().pw;
      if (this.windMill().isWind) {
        if (weather == 0) {
          enerpro = WindRate1[Sail];
        } else if (weather == 1) {
          enerpro = WindRate2[Sail];
        } else if (weather == 2) {
          enerpro = WindRate3[Sail];
        }

        this.data.energy += enerpro;
        this.activate();
      } else {
        this.deactivate();
      }
    }
    if (World.getBlock(this.x, this.y, this.z + 1) != BlockID.windMill && this.data.sails > 0) {
      World.drop(this.x, this.y + 0.5, this.z, ItemID.sail, this.data.sails, 0);
      this.data.sails = 0;
    }

    /*
    var energyStorage = this.getEnergyStorage();
    this.container.setScale("energyScale", this.data.energy / energyStorage);
    */
  },

  getEnergyStorage: function() {
    return 2560;
  },

  energyTick: function(type, src) {
    var output = Math.min(256, this.data.energy);
    this.data.energy += src.add(output) - output;
  }
});