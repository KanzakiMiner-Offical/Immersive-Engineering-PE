Item.registerUseFunction(ItemID.immersiveHammer, function(coords, item, block){
	if(block.id == BlockID.metalPress){StructureLib.structureAssembler(MB_structure, coords);}
	if(block.id == BlockID.coreFermenter){StructureLib.structureAssembler(Fermenter_structure, coords);}
	if(block.id == BlockID.crusher){StructureLib.structureAssembler(Crusher_structure, coords);}
	
});