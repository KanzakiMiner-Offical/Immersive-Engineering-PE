LiquidRegistry.registerLiquid("biodiesel", "Bio Diesel", ["biodiesel_flow"]);

LiquidRegistry.registerLiquid("creosote", "Creosote", ["creosote_flow"]);

LiquidRegistry.registerLiquid("ethanol", "Ethanol", ["ethanol_flow"]);

LiquidRegistry.registerLiquid("plantoil", "Plant Oil", ["plantoil_flow"]);


 IDRegistry.genItemID ("bucketBiodiesel");
 IDRegistry.genItemID ("bucketCreosote");
 IDRegistry.genItemID ("bucketEthanol");
 IDRegistry.genItemID ("bucketPlantoil");
 Item.createItem ("bucketBiodiesel", "Bucket Of Bio Diesel", {name: "bucket_diesel", meta: 0}, {stack: 1});
 Item.createItem ("bucketCreosote", "Bucket Of Creosote", {name: "bucket_creosote", meta: 0}, {stack: 1});
 Item.createItem ("bucketEthanol", "Bucket Of Ethanol", {name: "bucket_ethanol", meta: 0}, {stack: 1});
 Item.createItem ("bucketPlantoil", "Bucket Of Plant Oil", {name: "bucket_plantoil", meta: 0}, {stack: 1});
 
LiquidLib.registerItem("biodiesel", VanillaItemID.bucket, ItemID.bucketBiodiesel, 1000);

LiquidLib.registerItem("creosote", VanillaItemID.bucket, ItemID.bucketCreosote, 1000);

LiquidLib.registerItem("ethanol", VanillaItemID.bucket, ItemID.bucketEthanol, 1000);

LiquidLib.registerItem("plantoil", VanillaItemID.bucket, ItemID.bucketPlantoil, 1000);
