var CropAPI = {
  regSeed: function(id, name, age) {
    IDRegistry.genItemID(id + "Seed");
    Item.createItem(id + "Seed", name, { name: "seed" + id, meta: 0 });
    
    for (var i = 0; i <= age; i++) {
      let Id = id + "_age" + i;
      IDRegistry.genBlockID(Id);
      Block.createBlock(Id, [
        { name: Id, texture: [[Id, 0]], inCreative: false }
            ], "crop");
      Block.setBlockShape(BlockID[Id], { x: 0, y: 0, z: 0 }, { x: 1, y: 0.001, z: 1 });
      BlockRenderer.addRenderCallback(Id, function(api, coords) {
        api.renderBoxId(coords.x, coords.y, coords.z, 0.2499, 0.01, 0, 0.25, 0.99, 1, Id, 0);
        api.renderBoxId(coords.x, coords.y, coords.z, 0, 0.01, 0.2499, 1, 0.99, 0.25, Id, 0);
        api.renderBoxId(coords.x, coords.y, coords.z, 0.7499, 0.01, 0, 0.75, 0.99, 1, Id, 0);
        api.renderBoxId(coords.x, coords.y, coords.z, 0, 0.01, 0.7499, 1, 0.99, 0.75, Id, 0);
      });
      BlockRenderer.enableCustomRender(Id);
      if (i != age) {
        Callback.addCallback("ItemUse", function(coords, item, block) {
          let c = coords;
          if (item.id == 858 && block.id == BlockID[Id]) {
            Player.decreaseCarriedItem(1);
            for (var i = 0; i < 16; i++) {
              var px = c.x + Math.random();
              var pz = c.z + Math.random();
              var py = c.y + Math.random();
              Particles.addParticle(37, px, py, pz, 0, 0, 0);
            }
            if (Math.random() <= 0.4) {
              World.setBlock(c.x, c.y, c.z, BlockID[id + "_age" + age], 0);
            }
          }
        });
      } else if (i = age) {
        Callback.addCallback("ItemUse", function(coords, item, block) {
          let c = coords;
          if (item.id == 858 && block.id == BlockID[Id]) {
            World.setBlock(c.x, c.y, c.z, BlockID[Id], 0);
          }
        });
      }
    }
  },
  regDrop: function(block, age, seed, ripe) {
    for (var i = 0; i <= age - 1; i++) {
      Block.registerDropFunction(block + i, function(coords, id, data) {
        return [[ItemID[seed], 1, 0]];
      });
      Block.registerNeighbourChangeFunction(block + i, function(coords, block, changeCoords, region) {
        if (region.getBlockId(coords.x, coords.y - 1, coords.z) != 60) {
          World.destroyBlock(coords.x, coords.y, coords.z, true);
        }
      });
    }
    Block.registerDropFunction(block + age, function(coords, id, data) {
      return [[ItemID[seed], randomInt(0, 3), 0], [ItemID[ripe], 1, 0]];
    });
    Block.registerNeighbourChangeFunction(block + age, function(coords, block, changeCoords, region) {
      if (region.getBlockId(coords.x, coords.y - 1, coords.z) != 60) {
        World.destroyBlock(coords.x, coords.y, coords.z, true);
      }
    });
  },
  regGrowing: function(block, level) {
    Block.setRandomTickCallback(BlockID[block + level], function(x, y, z, id, data, region) {
      if (Math.random() < 0.2 && region.getLightLevel(x, y, z) >= 9) {
        World.setBlock(x, y, z, BlockID[block + (level + 1)], 0);
      }
    });
  },
  regPlant: function(seed, blockId) {
    Callback.addCallback("ItemUse", function(coords, item, block) {
      let c = coords;
      if ((item.id == ItemID[seed] && block.id == 60) && World.getBlockID(c.x, c.y + 1, c.z) == 0) {
        World.setBlock(c.x, c.y + 1, c.z, BlockID[blockId + "0"], 0);
        Player.decreaseCarriedItem(1);
      }
    });
  }
}

CropAPI.regSeed("hemp", "Industrial Hemp", 4)

IDRegistry.genBlockID("hemp_tree");
Block.createBlock("hemp_tree", [{name: "Industrial Hemp Spawn", texture: [["hempSpawn", 0]], inCreative: true}], "flower");
Block.setBlockShape(BlockID.hemp_tree, {x: 0, y: 0, z: 0}, {x: 1, y: 0.001, z: 1});
BlockRenderer.addRenderCallback("hemp_tree", function(api, coords, block){
	api.renderBoxId(coords.x, coords.y, coords.z, 0.4999, 0.01, 0, 0.5, 0.99, 1, "hemp_tree", 0);
	api.renderBoxId(coords.x, coords.y, coords.z, 0, 0.01, 0.4999, 1, 0.99, 0.5, "hemp_tree", 0);
});
BlockRenderer.enableCustomRender("hemp_tree");
Block.registerDropFunction("hemp_tree", function (coords, id, data){
    return [[ItemID.hempSeed, randomInt(1, 3), 0]];
});


Callback.addCallback("GenerateChunk", function (chunkX, chunkZ) {
        let coords = GenerationUtils.randomCoords(chunkX, chunkZ, 64, 128);
        coords = GenerationUtils.findSurface(coords.x, coords.y, coords.z);
        var grassTest = World.getBlockID(coords.x, coords.y, coords.z);
        if(Math.random() <= 0.05){
            if(grassTest == 2){
                World.setBlock(coords.x, coords.y+1, coords.z, BlockID.hemp_tree, 0);
            
        }
    }
});