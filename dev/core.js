const IECore = {

  registerMetal: function(key, name, boolan) {

    let ingot = "ingot" + key;
    let storage = "storage" + key;
    let nugget = "nugget" + key;
    let dust = "dust" + key;
    let plate = "plate" + key;
    let yes = boolan;
    IDRegistry.genItemID(ingot);
    Item.createItem(ingot, name + " Ingot", { name: ingot, meta: 0 }, { stack: 64 });

    IDRegistry.genItemID(nugget);
    Item.createItem(nugget, name + " Nugget", { name: nugget, meta: 0 }, { stack: 64 });

    IDRegistry.genItemID(dust);
    Item.createItem(dust, name + " Dust", { name: dust, meta: 0 }, { stack: 64 });

    if (yes = true) {
      IDRegistry.genBlockID(storage);

      Block.createBlock(storage, [{ name: name + "Block", texture: [[storage, 0]], inCreative: true }]);

      ToolAPI.registerBlockMaterial(BlockID[storage], "stone", 2, true);
      Block.setDestroyLevel([storage], 2);
      ToolLib.addBlockDropOnExplosion([storage]);

      Recipes.addShaped({ id: BlockID[storage], count: 1, data: 0 }, [
		"xxx",
		"xxx",
		"xxx"
	], ['x', ItemID[ingot], 0]);
      Recipes.addShapeless({ id: ItemID[ingot], count: 9, data: 0 }, [{ id: BlockID[storage], data: 0 }]);
    }
    IDRegistry.genItemID(plate);
    Item.createItem(plate, name + " Plate", { name: plate, meta: 0 }, { stack: 64 });

    Recipes.addShaped({ id: ItemID[ingot], count: 1, data: 0 }, [
		"xxx",
		"xxx",
		"xxx"
	], ['x', ItemID[nugget], 0]);

    Recipes.addShapeless({ id: ItemID[nugget], count: 9, data: 0 }, [{ id: ItemID[ingot], data: 0 }]);



  },
  addRecipe: function(result, data, tool) {
    data.push({ id: tool, data: -1 });
    Recipes.addShapeless(result, data, function(api, field, result) {
      for (let i in field) {
        if (field[i].id == tool) {
          field[i].data++;
          if (field[i].data >= Item.getMaxDamage(tool)) {
            field[i].id = field[i].count = field[i].data = 0;
          }
        }
        else {
          api.decreaseFieldSlot(i);
        }
      }
    });
  }


};