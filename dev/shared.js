ModAPI.registerAPI("ImmersiveAPI", {
	
    Structure: StructureLib,

    Machine: MachineRegistry,
    Recipe: MachineRecipeRegistry,
    RecipeLiquid: MachineRecipeLiquidRegistry,

    ChargeRegistry: ChargeItemRegistry,
    Cable: CableRegistry,
    
    Upgrade: UpgradeAPI,
    Config: Config,
    
    OreGen: OreGenerator,
    
    requireGlobal: function (command) {
        return eval(command);
    }

});
Logger.Log("ImmersiveAPI shared", "API");

