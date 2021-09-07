IECore.registerMetal("Copper", "Copper");
IECore.registerMetal("Nickel", "Nickel");
IECore.registerMetal("Aluminum", "Aluminum");
IECore.registerMetal("Silver", "Silver");
IECore.registerMetal("Constantan", "Constantan");
IECore.registerMetal("Lead", "Lead");
IECore.registerMetal("Uranium", "Uranium");
IECore.registerMetal("Electrum", "Electrum");
IECore.registerMetal("Steel", "Steel");

 // IEplate
 IDRegistry.genItemID ("plateIron");
 Item.createItem ("plateIron", "Iron Plate", {name: "plateIron", meta: 0}, {stack: 64});

// IEdust

 IDRegistry.genItemID ("dustGold");
 Item.createItem ("dustGold", "Gold Dust", {name: "dustGold", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustIron");
 Item.createItem ("dustIron", "Iron Dust", {name: "dustIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustCoke");
 Item.createItem ("dustCoke", "Coke Dust", {name: "dustCoke", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustQuartz");
 Item.createItem ("dustQuartz", "Quartz Dust", {name: "dustQuartz", meta: 0}, {stack: 64});

 // IEstick
 IDRegistry.genItemID ("stickAluminum");
 Item.createItem ("stickAluminum", "Aluminum Stick", {name: "stickAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("stickSteel");
 Item.createItem ("stickSteel", "Steel Stick", {name: "stickSteel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("stickIron");
 Item.createItem ("stickIron", "Iron Stick", {name: "stickIron", meta: 0}, {stack: 64});
// IE Other
 IDRegistry.genItemID ("blueprint");
 Item.createItem ("blueprint", "Blue Print", {name: "blueprint", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("coalCoke");
 Item.createItem ("coalCoke", "Coke Coal", {name: "coalCoke", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("jerrycan");
 Item.createItem ("jerrycan", "Jerry Can", {name: "jerrycan", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("materialSlag");
 Item.createItem ("materialSlag", "Slag", {name: "materialSlag", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("waterwheelSegment");
 Item.createItem ("waterwheelSegment", "Water Wheel", {name: "waterwheelSegment", meta: 0}, {stack: 64});

  // IEdrill
 IDRegistry.genItemID ("drillheadIron");
 Item.createItem ("drillheadIron", "Iron Drill Head", {name: "drillheadIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("drillheadSteel");
 Item.createItem ("drillheadSteel", "Steel Drill Head", {name: "drillheadSteel", meta: 0}, {stack: 64});


 // IEtool
 IDRegistry.genItemID ("immersiveHammer");
 IDRegistry.genItemID ("immersiveCutter");
 Item.createItem ("immersiveHammer", "Hammer", {name: "toolHammer", meta: 0}, {stack: 1});
 Item.createItem ("immersiveCutter", "Wire Cutter", {name: "wirecutter", meta: 0}, {stack: 1});

// IEwire
 IDRegistry.genItemID ("wireCopper");
 Item.createItem ("wireCopper", "Copper Wire", {name: "wireCu", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("wireSteel");
 Item.createItem ("wireSteel", "Steel Wire", {name: "wireSteel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("wireAluminum");
 Item.createItem ("wireAluminum", "Aluminum Wire", {name: "wireAl", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("wireElectrum");
 Item.createItem ("wireElectrum", "Electrum Wire", {name: "wireElectrum", meta: 0}, {stack: 64});

 // IEmold
 IDRegistry.genItemID ("moldRod");
 Item.createItem ("moldRod", "Metal Press Mold: Rod", {name: "moldRod", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("moldPlate");
 Item.createItem ("moldPlate", "Metal Press Mold: Plate", {name: "moldPlate", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("moldWire");
 Item.createItem ("moldWire", "Metal Press Mold: Wire", {name: "moldWire", meta: 0}, {stack: 64});
 
   // IEscaff
 IDRegistry.genBlockID ("steelScaffolding");
 Block.createBlock ("steelScaffolding", [{name: "Steel Scaffolding", texture: [["steel_scaffolding", 0]], inCreative: true}]);
 
  IDRegistry.genBlockID ("aluminumScaffolding");
 Block.createBlock ("aluminumScaffolding", [{name: "Aluminum Scaffolding", texture: [["aluminum_scaffolding", 0]], inCreative: true}]);
 // IEengineering
 
 IDRegistry.genBlockID ("redEngineer");
 Block.createBlock ("redEngineer", [{name: "Redstone Engineering Block", texture: [["redstone_engineering", 0]], inCreative: true}]);
 
 IDRegistry.genBlockID ("heavyEngineer");
 Block.createBlock ("heavyEngineer", [{name: "Heavy Engineering Block", texture: [["heavy_engineering", 0]], inCreative: true}]);
 
 IDRegistry.genBlockID ("lightEngineer");
 Block.createBlock ("lightEngineer", [{name: "Light Engineering Block", texture: [["light_engineering", 0]], inCreative: true}]);

  // IETreated
IDRegistry.genBlockID ("woodTreatedplank");
 Block.createBlock ("woodTreatedplank", [{name: "Treated Wood Plank", texture: [["treatedWood", 0]], inCreative: true}]);
 IDRegistry.genItemID ("treatedStick");
 Item.createItem ("treatedStick", "Treated Stick", {name: "material_treatedStick", meta: 0}, {stack: 64});
 