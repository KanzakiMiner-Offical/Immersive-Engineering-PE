LIBRARY({
	name: "ChargeItem",
	version: 1,
	shared: true,
	api: "CoreEngine"
});

var ChargeItemRegistry = {
	chargeData: {},
	
	registerItem: function(item, energy, capacity, level, isEnergyStorage){
		Item.setMaxDamage(item, capacity + 1);
		this.chargeData[item] = {
			type: "normal",
			energy: energy,
			id: item,
			level: level || 0,
			maxCharge: capacity,
			maxDamage: capacity + 1,
			isEnergyStorage: isEnergyStorage
		};
	},
	
	registerFlashItem: function(item, energy, amount, level){
		this.chargeData[item] = {
			type: "flash",
			id: item,
			level: level || 0,
			energy: energy,
			amount: amount,
			isEnergyStorage: true
		};
	},
	
	getItemData: function(id){
		return this.chargeData[id];
	},
	
	isFlashStorage: function(id){
		var data = this.getItemData(id);
		return (data && data.type == "flash");
	},
	
	isValidItem: function(id, energy, level){
		var data = this.getItemData(id);
		return (data && data.type == "normal" && data.energy == energy && data.level <= level || id == ItemID.debugItem);
	},
	
	isValidStorage: function(id, energy, level){
		var data = this.getItemData(id);
		return (data && data.isEnergyStorage && data.energy == energy && data.level <= level || id == ItemID.debugItem);
	},
	
	getEnergyStored: function(item, energy){
		var data = this.getItemData(item.id);
		if(!data || energy && data.energy != energy){
			return 0;
		}
		return Math.min(data.maxDamage - item.data, data.maxCharge);
	},
	
	getEnergyFrom: function(item, energy, amount, transf, level, getFromAll){
		if(item.id==ItemID.debugItem){
			return amount;
		}
		
		level = level || 0;
		var data = this.getItemData(item.id);
		if(!data || data.energy != energy || data.level > level || !getFromAll && !data.isEnergyStorage){
			return 0;
		}
		if(data.type == "flash"){
			if(amount < 1){
				return 0;
			}
			item.count--;
			if(item.count < 1){
				item.id = item.data = 0;
			}
			return data.amount;
		}
		
		if(item.data < 1){
			item.data = 1;
		}
		
		var energyGot = Math.min(amount, Math.min(data.maxDamage - item.data, transf));
		item.data += energyGot;
		return energyGot;
	},
	
	addEnergyTo: function(item, energy, amount, transf, level){
		if(item.id==ItemID.debugItem){
			return amount;
		}
		
		level = level || 0;
		if(!this.isValidItem(item.id, energy, level)){
			return 0;
		}
		
		var energyAdd = Math.min(amount, Math.min(item.data - 1, transf));
		item.data -= energyAdd;
		return energyAdd;
	},
	
	transportEnergy: function(api, field, result){
		var data = ChargeItemRegistry.getItemData(result.id);
		var amount = 0;
		for(var i in field){
			if(!ChargeItemRegistry.isFlashStorage(field[i].id)){
				amount += ChargeItemRegistry.getEnergyFrom(field[i], data.energy, data.maxCharge, data.maxCharge, 100, true);
			}
			api.decreaseFieldSlot(i);
		}
		ChargeItemRegistry.addEnergyTo(result, data.energy, amount, amount, 100);
	}
}

Callback.addCallback("tick", function(){
	var item = Player.getCarriedItem();
	var data = ChargeItemRegistry.getItemData(item.id);
	if(item.data==0 && data && data.type != "flash"){
		Player.setCarriedItem(item.id, 1, 1);
	}
});

EXPORT("ChargeItemRegistry", ChargeItemRegistry);
