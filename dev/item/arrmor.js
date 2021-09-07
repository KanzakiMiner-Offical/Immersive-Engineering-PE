IDRegistry.genItemID("faradayHelmet");
IDRegistry.genItemID("faradayChestplate");
IDRegistry.genItemID("faradayLeggings");
IDRegistry.genItemID("faradayBoots");

Item.createArmorItem("faradayHelmet", "Faraday Helmet", {name: "faradayhelmet"}, {type: "helmet", armor: 2, durability: 130, texture: "armor/faraday_1.png"});
Item.createArmorItem("faradayChestplate", "Faraday Chestplate", {name: "faradaychestplate"}, {type: "chestplate", armor: 6, durability: 200, texture: "armor/faraday_1.png"});
Item.createArmorItem("faradayLeggings", "Faraday Leggings", {name: "faradayleggings"}, {type: "leggings", armor: 5, durability: 190, texture: "armor/faraday_2.png"});
Item.createArmorItem("faradayBoots", "Faraday Boots", {name: "faradayboots"}, {type: "boots", armor: 2, durability: 170, texture: "armor/faraday_1.png"});

Item.addRepairItemIds(ItemID.faradayHelmet, [ItemID.ingotAluminum]);
Item.addRepairItemIds(ItemID.faradayChestplate, [ItemID.ingotAluminum]);
Item.addRepairItemIds(ItemID.faradayLeggings, [ItemID.ingotAluminum]);
Item.addRepairItemIds(ItemID.faradayBoots, [ItemID.ingotAluminum]);

Recipes.addShaped({id: ItemID.faradayHelmet, count: 1, data: 0}, [
	"xxx",
	"x x"
], ['x', ItemID.plateAluminum, 0]);

Recipes.addShaped({id: ItemID.faradayChestplate, count: 1, data: 0}, [
	"x x",
	"xxx",
	"xxx"
], ['x', ItemID.plateAluminum, 0]);

Recipes.addShaped({id: ItemID.faradayLeggings, count: 1, data: 0}, [
	"xxx",
	"x x",
	"x x"
], ['x', ItemID.plateAluminum, 0]);

Recipes.addShaped({id: ItemID.faradayBoots, count: 1, data: 0}, [
	"x x",
	"x x"
], ['x', ItemID.plateAluminum, 0]);
