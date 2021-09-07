IDRegistry.genBlockID("steelFence");

Block.createBlock("steelFence", [

	{name: "Steel Fence", texture: [["storageSteel", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.steelFence, "stone", 2, true);
Block.setDestroyLevel("steelFence", 2);
ToolLib.addBlockDropOnExplosion("steelFence");
