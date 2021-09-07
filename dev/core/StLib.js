const StructureLib = {
	getStructure: function(cx, cy, cz, structure){
		let t=0;
		for(let i in structure){
			t++;
			var block = World.getBlock(cx + structure[i].x, cy + structure[i].y, cz + structure[i].z).id === structure[i].id;
			if(!block){t=0; return false;}
			if(structure.length == t){return true;}
			//Game.message(block);
		}
	},
	getModdedStructure: function(cx, cy, cz, structure){
		let t=0;
		var isValid = false;
		bl: for(let i in structure){
			var list = modifierAugmentApi.getList();
			var block = World.getBlock(cx + structure[i].x, cy + structure[i].y, cz + structure[i].z).id === structure[i].id;
			if(structure[i].id === BlockID.null_modifier){
				for(let u in list){
					block = World.getBlock(cx + structure[i].x, cy + structure[i].y, cz + structure[i].z).id === list[u];
					if(!block && u == list.length){t=0; break bl;}
				}
			}else{
			if(!block){t=0; break bl;}}
			if(structure.length == t){isValid = true; break bl;}
			//Game.message(block);
			t++;
		}
		return isValid;
	},
	
           // Unused
setStructure: function(coords, structure){
		let c = coords;
		let p = 0;
		str: for(let i in structure){
			if(World.getBlock(c.x + structure[i].x, c.y + structure[i].y, c.z + structure[i].z).id !== structure[i].id){
			for(let u = 9; u<45; u++){
				let item = Player.getInventorySlot(u);
				if(item.id === structure[i].id){
					Player.setInventorySlot(u, structure[i].id, item.count-1, 0);
					World.setBlock(c.x + structure[i].x, c.y + structure[i].y, c.z + structure[i].z, structure[i].id, 0);
					//break str;
				}else if(u==45){p=1; Game.message("Not Enough (> "+structure[i].id+" <) for assemble structure"); break str;}
			}
			}
			if(i==structure.length){if(p == 0){Game.message("Structure Assembler finished work");}else if(p == 1){Game.message("Structure Assembler finished work with error");}}
		}
	},
	breakStructure: function(coords, structure){
		let c = coords;
		//modifierApi.getModifier(structure, c);
		for(let i in structure){
			for(let u = 9; u<45; u++){
				let item = Player.getInventorySlot(u);
				if(item.id === structure[i].id){
					if(item.count<64){
						Player.setInventorySlot(u, structure[i].id, item.count+1, 0); World.setBlock(structure[i].x+c.x, structure[i].y+c.y, structure[i].z+c.z, 0); break;}
					}else if(item.id == 0){Player.setInventorySlot(u, structure[i].id, item.count+1, 0); World.setBlock(structure[i].x+c.x, structure[i].y+c.y, structure[i].z+c.z, 0); break;
				}else if(u==45){World.drop(c.x, c.y+1, c.z, structure[i].id, 1, 0); World.setBlock(structure[i].x+c.x, structure[i].y+c.y, structure[i].z+c.z, 0);}
			}
		}
	},
	structureAssembler: function(structure, coords){
		let c = coords;
		let destroy = false;
		destroy = ValkyrieLib.getStructure(c.x, c.y, c.z, structure);
		//Game.message(destroy);
		if(destroy){
			Game.message("Structure Destroyed");
			ValkyrieLib.breakStructure(c, structure);
		}else{
			ValkyrieLib.setStructure(coords, structure);
		}
	},
}
let slots = 0;
