ModAPI.addAPICallback("RecipeViewer", function(api){
	let RecipeViewer = api.Core;
	const Bitmap = android.graphics.Bitmap;
	const Canvas = android.graphics.Canvas;
	const Rect = android.graphics.Rect;

	let bmp, cvs, source;
	let x = y = 0;


	RecipeViewer.registerRecipeType("iepe_crusher", {
		contents: {
			icon: BlockID.crusher,
			drawing: [
				{type: "bitmap", x: 430, y: 200, scale: 6, bitmap: "arrow_bar_scale"}
			],
			elements: {
				input0: {type: "slot", x: 280, y: 190, size: 120},
				output0: {type: "slot", x: 600, y: 190, size: 120}
			}
		},
		getList: function(id, data, isUsage){
			let result;
			if(isUsage){
				result = MachineRecipeRegistry.getRecipeResult("crusher", id, data);
				return result ? [{
					input: [{id: id, count: 1, data: data}],
					output: [result]
				}] : [];
			}
			let list = [];
			let recipe = MachineRecipeRegistry.requireRecipesFor("crusher");
			let item;
			for(let key in recipe){
				result = recipe[key];
				if(result.id == id && (result.data == data || data == -1)){
					item = key.split(":");
					list.push({
						input: [{id: parseInt(item[0]), count: result.sourceCount || 1, data: parseInt(item[1] || 0)}],
						output: [result]
					});
				}
			}
			return list;
		}
	});

});
