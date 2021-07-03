// file: header.js

/*
                                                     Immersive Engineering PE
                                                             by KanzakiMiner
 
The original Resource Pack and Ideas belong to BluSunrize.
Some of the code comes from IC2.
This means that MineExplore is also the owner of this mod.

 This code is a copyright by MineExplore and me,do not distribute.
*/


// file: libs.js
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// import values
var Color = android.graphics.Color;
var PotionEffect = Native.PotionEffect;
var ParticleType = Native.ParticleType;
var BlockSide = Native.BlockSide;
var EntityType = Native.EntityType;
// load lib
alert("Immersive Engineering PE Rebirth-Remake By KanzakiMiner");

 IMPORT ("StorageInterface");
 IMPORT ("flags");
 IMPORT ("ToolType");
 IMPORT ("EnergyNet");
 IMPORT ("ChargeItem");
 IMPORT ("MachineRender");
 IMPORT ("TileRender");
 IMPORT ("LiquidLib");
 IMPORT ("ToolLib");
 
 
// file: core/sound_engine.js

let SoundAPI = {
	soundPlayers: [],
	soundsToRelease: [],
	maxPlayersCount: 28,
	
	getFilePath: function(name){
		return __dir__ + "res/sounds/" + name;
	},
	
	isSoundEnabled: function(){
		return Config.soundEnabled && isLevelDisplayed;
	},
	
	addSoundPlayer: function(name, loop, priorized){
		if(this.soundPlayers.length >= this.maxPlayersCount){
			Logger.Log(__name__ + " sound stack is full", "WARNING");
			return null;
		}
		let sound = new Sound(name, priorized);
		sound.setDataSource(this.getFilePath(name));
		sound.setLooping(loop || false);
		sound.prepare();
		this.soundPlayers.push(sound);
		return sound;
	},
	
	addMultiSoundPlayer: function(startingSound, startSound, finishingSound){
		if(this.soundPlayers.length >= this.maxPlayersCount){
			Logger.Log(__name__ + " sound stack is full", "WARNING");
			return;
		}
		let sound = new MultiSound(startingSound, startSound, finishingSound);
		this.soundPlayers.push(sound);
		return sound;
	},
	
	playSound: function(name, loop, disableMultiPlaying){
		if(!this.isSoundEnabled()) {return null;}
		let curSound = null;
		try{
		for(let i in this.soundPlayers){
			let sound = this.soundPlayers[i];
			if(sound.isPlaying()){
				if(sound.name == name && disableMultiPlaying){
					return sound;
				}
			}
			else if(sound.name == name) {
				sound.start();
				return sound;
			}
			else if(!sound.isPreparing && !sound.priorized){
				curSound = new Sound(name, false);
				curSound.setDataSource(this.getFilePath(name));
				curSound.setLooping(loop || false);
				curSound.prepare();
				sound = this.soundPlayers[i];
				if(!sound.isPreparing && !sound.isPlaying()){ // second check after preparing because of multi-threading
					this.soundPlayers[i] = curSound;
					this.soundsToRelease.push(sound);
				} else {
					this.soundPlayers.push(curSound);
				}
				break;
			}
		}
		if(!curSound){
			curSound = this.addSoundPlayer(name, loop, false);
		}
		curSound.start();
		//Game.message("sound "+ name +" started");
		}
		catch(err) {
			Logger.Log("sound "+ name +" start failed", "ERROR");
			Logger.Log(err, "ERROR");
		}
		return curSound;
	},
	
	playSoundAt: function(coord, name, loop, radius){
		if(loop && Entity.getDistanceBetweenCoords(coord, Player.getPosition()) > radius){
			return null;
		}
		let sound = this.playSound(name, loop);
		if(sound){
			sound.setSource(coord, radius);
		}
		return sound;
	},
	
	updateVolume: function(){
		for(let i in this.soundPlayers){
			let sound = this.soundPlayers[i];
			sound.setVolume(sound.volume);
		}
	},
	
	createSource: function(fileName, coord, radius){
		if(!this.isSoundEnabled()) {return null;}
		let curSound = null;
		try{
		for(let i in this.soundPlayers){
			let sound = this.soundPlayers[i];
			if(!sound.isPlaying() && !sound.isPreparing && !sound.priorized){
				curSound = new MultiSound(fileName[0], fileName[1], fileName[2]);
				sound = this.soundPlayers[i];
				if(!sound.isPreparing && !sound.isPlaying()){ // second check after preparing because of multi-threading
					this.soundPlayers[i] = curSound;
					this.soundsToRelease.push(sound);
				} else {
					this.soundPlayers.push(curSound);
				}
				break;
			}
		}
		if(!curSound){
			curSound = this.addMultiSoundPlayer(fileName[0], fileName[1], fileName[2]);
		}
		curSound.setSource(coord, radius);
		curSound.start();
		}
		catch(err) {
			Logger.Log("multi-sound ["+ fileName +"] start failed", "ERROR");
			Logger.Log(err, "ERROR");
		}
		return curSound;
	},
	
	updateSourceVolume: function(sound){
		let s = sound.source;
		let p = Player.getPosition();
		let volume = Math.max(0, 1 - Math.sqrt(Math.pow(p.x - s.x, 2) + Math.pow(p.y - s.y, 2) + Math.pow(p.z - s.z, 2))/s.radius);
		sound.setVolume(volume);
	},
	
	clearSounds: function(){
		for(let i = 0; i < this.soundPlayers.length; i++){
			let sound = this.soundPlayers[i];
			if(sound.isPlaying()){
				sound.stop();
			}
			if(!sound.priorized){
				sound.release();
				this.soundPlayers.splice(i--, 1);
			}
		}
	}
}

function Sound(name, priorized){
	this.name = name;
	this.media = new android.media.MediaPlayer();
	this.priorized = priorized || false;
	this.isPreparing = true;
	
	this.setDataSource = function(path){
		this.media.setDataSource(path);
	}
	
	this.setLooping = function(loop){
		this.media.setLooping(loop);
	}
	
	this.prepare = function(){
		this.media.prepare();
	}
	
	this.isPlaying = function(){
		return this.media.isPlaying();
	}
	
	this.isLooping = function(){
		return this.media.isLooping();
	}
	
	this.start = function(){
		this.media.start();
		this.isPreparing = false;
	}
	
	this.pause = function(){
		this.media.pause();
	}
	
	this.seekTo = function(ms){
		this.media.seekTo(ms);
	}
	
	this.stop = function(){
		this.media.pause();
		this.media.seekTo(0);
	}
	
	this.release = function(){
		this.media.release();
	}
	
	this.setVolume = function(volume){
		this.volume = volume;
		volume *= gameVolume;
		this.media.setVolume(volume, volume);
	}
	
	this.setVolume(1);
	
	this.setSource = function(coord, radius){
		this.source = {x: coord.x + 0.5, y: coord.y + 0.5, z: coord.z + 0.5, radius: radius, dimension: Player.getDimension()};
		SoundAPI.updateSourceVolume(this);
	}
}

function MultiSound(startingSound, startSound, finishingSound){
	this.parent = Sound;
	this.parent(startingSound || startSound, 0, true);
	
	this.startingSound = null;
	this.startSound = null;
	this.finishingSound = null;
	
	this.setDataSource(SoundAPI.getFilePath(startingSound || startSound));
	if(startingSound){
		this.startingSound = this.media;
		this.startSound = new android.media.MediaPlayer();
		this.startSound.setDataSource(SoundAPI.getFilePath(startSound));
		this.startSound.setLooping(true);
		let self = this;
		this.media.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
			onCompletion: function(mp){
				self.playStartSound();
			}
		}));
		this.startSound.prepareAsync();
	} else {
		this.startSound = this.media;
		this.setLooping(true);
	}
	this.prepare();
	
	if(finishingSound){
		let media = new android.media.MediaPlayer();
		media.setDataSource(SoundAPI.getFilePath(finishingSound));
		media.prepareAsync();
		this.finishingSound = media;
	}
	
	this.playStartSound = function(){
		this.media = this.startSound;
		this.media.start();
	}
	
	this.playFinishingSound = function(){
		if(!this.isFinishing){
			this.media = this.finishingSound;
			this.media.start();
			this.isFinishing = true;
		}
	}
	
	this.release = function(){
		this.startSound.release();
		if(this.startingSound){
			this.startingSound.release();
		}
		if(this.finishingSound){
			this.finishingSound.release();
		}
	}
}

Callback.addCallback("tick", function(){
	for(let i in SoundAPI.soundsToRelease){
		SoundAPI.soundsToRelease[i].release();
	}
	SoundAPI.soundsToRelease = [];
	for(let i in SoundAPI.soundPlayers){
		let sound = SoundAPI.soundPlayers[i];
		if(sound.isPlaying() && sound.source){
			if(sound.source.dimension == Player.getDimension()){
				SoundAPI.updateSourceVolume(sound);
			} else {
				sound.stop();
			}
		}
	}
});

Callback.addCallback("LevelLeft", function(){
	SoundAPI.clearSounds();
});

Callback.addCallback("MinecraftActivityStopped", function() {
	SoundAPI.clearSounds();
});

/*Volume in the settings*/
/*From SoundAPI lib by WolfTeam*/
var settings_path = "/storage/emulated/0/games/com.mojang/minecraftpe/options.txt";
var gameVolume = FileTools.ReadKeyValueFile(settings_path)["audio_sound"];
var prevScreen = false;
Callback.addCallback("NativeGuiChanged", function (screen) {
    var currentScreen = screen.startsWith("screen_world_controls_and_settings") || screen.startsWith("screen_controls_and_settings");
    if(prevScreen && !currentScreen){
        gameVolume = FileTools.ReadKeyValueFile(settings_path)["audio_sound"];
		SoundAPI.updateVolume();
    }
    prevScreen = currentScreen;
});




 // file: core/StLib.js
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
		destroy = StructureLib.getStructure(c.x, c.y, c.z, structure);
		//Game.message(destroy);
		if(destroy){
			Game.message("Structure Destroyed");
			StructureLib.breakStructure(c, structure);
		}else{
			StructureLib.setStructure(coords, structure);
		}
	},
}
let slots = 0;


 // file: config.js
let Config = {
	reload: function(){
		this.soundEnabled = __config__.getBool("sound_enabled");
		this.machineSoundEnabled = __config__.getBool("machine_sounds");
		this.voltageEnabled = __config__.getBool("voltage_enabled");
		this.wireDamageEnabled = __config__.getBool("wire_damage_enabled");
		
		var lang = FileTools.ReadKeyValueFile("games/com.mojang/minecraftpe/options.txt").game_language;
		this.language = (lang || "en_US").substring(0, 2);
	}
}

Config.reload();

var player;
Callback.addCallback("LevelLoaded", function(){
	Config.reload();
	player = Player.get();
});

isLevelDisplayed = false;
Callback.addCallback("LevelDisplayed", function(){
	isLevelDisplayed = true;
});
Callback.addCallback("LevelLeft", function(){
	isLevelDisplayed = false;
});

 
 
// file: core/Api.js

// constants
var GUI_SCALE = 3.2;

// API Machine
var RF = EnergyTypeRegistry.assureEnergyType("Rf", 0.25);
var MachineRegistry = {
	machineIDs: {},

	isMachine: function(id){
		return this.machineIDs[id];
	},
	
	// Machine Base
	registerPrototype: function(id, Prototype){
		// register ID
		this.machineIDs[id] = true;
		
		// audio
		if(Prototype.getStartSoundFile){
			if(!Prototype.getStartingSoundFile){
				Prototype.getStartingSoundFile = function(){return null;}
			}
			if(!Prototype.getInterruptSoundFile){
				Prototype.getInterruptSoundFile = function(){return null;}
			}
			Prototype.startPlaySound = Prototype.startPlaySound || function(){
				if(!Config.machineSoundEnabled){return;}
				let audio = this.audioSource;
				if(audio && audio.isFinishing){
					audio.stop();
					audio.media = audio.startingSound || audio.startSound;
					audio.start();
					audio.isFinishing = false;
				}
				else if(!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()){
					this.audioSource = SoundAPI.createSource([this.getStartingSoundFile(), this.getStartSoundFile(), this.getInterruptSoundFile()], this, 16);
				}
			}
			Prototype.stopPlaySound = Prototype.stopPlaySound || function(playInterruptSound){
				let audio = this.audioSource;
				if(audio){
					if(!audio.isPlaying()){
						this.audioSource = null;
					}
					else if(!audio.isFinishing){
						audio.stop();
						if(playInterruptSound){
							audio.playFinishingSound();
						}
					}
				}
			}
		} 
		else {
			Prototype.startPlaySound = Prototype.startPlaySound || function(name){
				if(!Config.machineSoundEnabled){return;}
				let audio = this.audioSource;
				if(!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()){
					let sound = SoundAPI.playSoundAt(this, name, true, 16);
					this.audioSource = sound;
				}
			}
			Prototype.stopPlaySound = Prototype.stopPlaySound || function(){
				if(this.audioSource && this.audioSource.isPlaying()){
					this.audioSource.stop();
					this.audioSource = null;
				}
			}
		}
		
		
		// machine activation
		if(Prototype.defaultValues && Prototype.defaultValues.isActive !== undefined){
			if(!Prototype.renderModel){
				Prototype.renderModel = this.renderModelWithRotation;
			}
			
			Prototype.setActive = Prototype.setActive || this.setActive;
			
			Prototype.activate = Prototype.activate || function(){
				this.setActive(true);
			}
			Prototype.deactivate = Prototype.deactivate || function(){
				this.setActive(false);
			}
			Prototype.destroy = Prototype.destroy || function(){
				BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
				this.stopPlaySound();
			}
		}
		
		if(!Prototype.init && Prototype.renderModel){
			Prototype.init = Prototype.renderModel;
		}
		
		ToolAPI.registerBlockMaterial(id, "stone", 1, true);
		Block.setDestroyTime(id, 3);
		TileEntity.registerPrototype(id, Prototype);
	},
	
	// RF machines
	registerElectricMachine: function(id, Prototype){
		// wire connection
		ICRender.getGroup("rf-wire").add(id, -1);
		//ICRender.getGroup("ic-wire").add(id, -1);
		
		// setup energy values
		if (Prototype.defaultValues){
			Prototype.defaultValues.energy = 0;
			Prototype.defaultValues.energy_receive = 0;
			Prototype.defaultValues.last_energy_receive = 0;
			Prototype.defaultValues.voltage = 0;
			Prototype.defaultValues.last_voltage = 0;
		}
		else{
			Prototype.defaultValues = {
				energy: 0,
				energy_receive: 0,
				last_energy_receive: 0,
				voltage: 0,
				last_voltage: 0
			};
		}
		
		Prototype.getTier = Prototype.getTier || function(){
			return 1;
		}
		
		if(!Prototype.getEnergyStorage){
			Prototype.getEnergyStorage = function(){
				return 0;
			};
		}
		
		if(!Prototype.energyTick){
			Prototype.energyTick = function(){
				this.data.last_energy_receive = this.data.energy_receive;
				this.data.energy_receive = 0;
				this.data.last_voltage = this.data.voltage;
				this.data.voltage = 0;
			};
		}
		
		if (!Prototype.getMaxPacketSize) {
			Prototype.getMaxPacketSize = function(tier){
				return 8 << this.getTier()*2;
			}
		}
		
		Prototype.energyReceive = Prototype.energyReceive || this.basicEnergyReceiveFunc;
		
		this.registerPrototype(id, Prototype);
		// register for energy net
		EnergyTileRegistry.addEnergyTypeForId(id, RF);
	},
	
	registerGenerator(id, Prototype){
		Prototype.canReceiveEnergy = function(){
			return false;
		},
	
		Prototype.isEnergySource = function(){
			return true;
		},
		
		Prototype.energyTick = Prototype.energyTick || this.basicEnergyOutFunc;
		
		this.registerElectricMachine(id, Prototype);
	},
	
	registerRFStorage(id, Prototype){
		Prototype.isEnergySource = function(){
			return true;
		},
		
		Prototype.energyReceive = Prototype.energyReceive || this.basicEnergyReceiveFunc;
		
		Prototype.energyTick = Prototype.energyTick || this.basicEnergyOutFunc;
		
		Prototype.isTeleporterCompatible = true;
		
		this.registerElectricMachine(id, Prototype);
	},
	
	// standard functions
	setStoragePlaceFunction: function(id, fullRotation){
		Block.registerPlaceFunction(BlockID[id], function(coords, item, block){
			var place = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
			World.setBlock(place.x, place.y, place.z, item.id, 0);
			World.playSound(place.x, place.y, place.z, "dig.stone", 1, 0.8)
			var rotation = TileRenderer.getBlockRotation(fullRotation);
			var tile = World.addTileEntity(place.x, place.y, place.z);
			tile.data.meta = rotation;
			TileRenderer.mapAtCoords(place.x, place.y, place.z, item.id, rotation);
			if(item.extra){
				tile.data.energy = item.extra.getInt("energy");
			}
		});
	},
	
	setFacing: function(coords){
		if(Entity.getSneaking(player)){
			var facing = coords.side ^ 1;
		} else {
			var facing = coords.side;
		}
		if(facing != this.data.meta){
			this.data.meta = facing;
			this.renderModel();
			return true;
		}
		return false;
	},
	
	renderModel: function(){
		if(this.data.isActive){
			TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, 0);
		} else {
			BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
		}
	},
	
	renderModelWithRotation: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive? 4 : 0));
	},
	
	renderModelWith6Sides: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive? 6 : 0));
	},
	
	setActive: function(isActive){
		if(this.data.isActive != isActive){
			this.data.isActive = isActive;
			this.renderModel();
		}
	},
	
	basicEnergyOutFunc: function(type, src){
		this.data.last_energy_receive = this.data.energy_receive;
		this.data.energy_receive = 0;
		this.data.last_voltage = this.data.voltage;
		this.data.voltage = 0;
		var output = this.getMaxPacketSize();
		if(this.data.energy >= output){
			this.data.energy += src.add(output) - output;
		}
	},
	
	basicEnergyReceiveFunc: function(type, amount, voltage) {
		var maxVoltage = this.getMaxPacketSize();
		if(voltage > maxVoltage){
			if(Config.voltageEnabled){
				World.setBlock(this.x, this.y, this.z, 0);
				World.explode(this.x + 0.5, this.y + 0.5, this.z + 0.5, 1.2, true);
				var sound = SoundAPI.playSound("Machines/MachineOverload.ogg", false, true);
				if(sound && !sound.source){
					sound.setSource(this, 32);
				}
				this.selfDestroy();
				return 1;
			}
			var add = Math.min(maxVoltage, this.getEnergyStorage() - this.data.energy);
		} else {
			var add = Math.min(amount, this.getEnergyStorage() - this.data.energy);
		}
		this.data.energy += add;
		this.data.energy_receive += add;
		this.data.voltage = Math.max(this.data.voltage, voltage);
		return add;
	},
	
	getLiquidFromItem: function(liquid, inputItem, outputItem, hand){
		if(hand) outputItem = {id: 0, count: 0, data: 0};
		var empty = LiquidLib.getEmptyItem(inputItem.id, inputItem.data);
		if(empty && (!liquid && this.interface.canReceiveLiquid(empty.liquid) || empty.liquid == liquid) && !this.liquidStorage.isFull(empty.liquid)){
			if(outputItem.id == empty.id && outputItem.data == empty.data && outputItem.count < Item.getMaxStack(empty.id) || outputItem.id == 0){
				var liquidLimit = this.liquidStorage.getLimit(empty.liquid);
				var storedAmount = this.liquidStorage.getAmount(liquid).toFixed(3);
				var count = Math.min(hand? inputItem.count : 1, parseInt((liquidLimit - storedAmount) / empty.amount));
				if(count > 0){
					this.liquidStorage.addLiquid(empty.liquid, empty.amount * count);
					inputItem.count -= count;
					outputItem.id = empty.id;
					outputItem.data = empty.data;
					outputItem.count += count;
					if(!hand) this.container.validateAll();
				}
				else if(inputItem.count == 1 && empty.storage){
					var amount = Math.min(liquidLimit - storedAmount, empty.amount);
					this.liquidStorage.addLiquid(empty.liquid, amount);
					inputItem.data += amount * 1000;
				}
				if(hand){
					if(outputItem.id){
						Player.addItemToInventory(outputItem.id, outputItem.count, outputItem.data);
					}
					if(inputItem.count == 0) inputItem.id = inputItem.data = 0;
					Player.setCarriedItem(inputItem.id, inputItem.count, inputItem.data);
					return true;
				}
			}
		}
	},
	
	addLiquidToItem: function(liquid, inputItem, outputItem){
		var amount = this.liquidStorage.getAmount(liquid).toFixed(3);
		if(amount > 0){
			var full = LiquidLib.getFullItem(inputItem.id, inputItem.data, liquid);
			if(full && (outputItem.id == full.id && outputItem.data == full.data && outputItem.count < Item.getMaxStack(full.id) || outputItem.id == 0)){
				if(amount >= full.amount){
					this.liquidStorage.getLiquid(liquid, full.amount);
					inputItem.count--;
					outputItem.id = full.id;
					outputItem.data = full.data;
					outputItem.count++;
					this.container.validateAll();
				}
				else if(inputItem.count == 1 && full.storage){
					if(inputItem.id == full.id){
						amount = this.liquidStorage.getLiquid(liquid, full.amount);
						inputItem.data -= amount * 1000;
					} else {
						amount = this.liquidStorage.getLiquid(liquid, full.storage);
						inputItem.id = full.id;
						inputItem.data = (full.storage - amount)*1000;
					}
				}
			}
		}
	},
	
	isValidRFItem: function(id, count, data, container){
		var level = container.tileEntity.getTier();
		return ChargeItemRegistry.isValidItem(id, "Rf", level);
	},
	
	isValidRFStorage: function(id, count, data, container){
		var level = container.tileEntity.getTier();
		return ChargeItemRegistry.isValidStorage(id, "Rf", level);
	},
	
	updateGuiHeader: function(gui, text){
		var header = gui.getWindow("header");
		header.contentProvider.drawing[2].text = Translation.translate(text);
	}
}

var transferByTier = {
	1: 32,
	2: 256,
	3: 2048,
	4: 8192
}

// BASE

Block.createSpecialType({
    base: 1,
    solid: true,
    destroytime: 5,
    explosionres: 30,
    lightopacity: 15,
    renderlayer: 2,
    sound: "stone"
}, "machine");

// file: core/machine/recipe.js

var MachineRecipeRegistry = {
	recipeData: {},
	
	registerRecipesFor: function(name, data, validateKeys){
		if(validateKeys){
			var newData = {};
			for(var key in data){
				if(key.indexOf(":") != -1){
					var keyArray = key.split(":");
					var newKey = eval(keyArray[0]) + ":" + keyArray[1];
				} else {
					var newKey = eval(key);
				}
				newData[newKey] = data[key];
			}
			data = newData;
		}
		this.recipeData[name] = data;
	},
	
	addRecipeFor: function(name, input, result){
		var recipes = this.requireRecipesFor(name, true);
		if(Array.isArray(recipes)){
			recipes.push({input: input, result: result});
		}
		else {
			recipes[input] = result;
		}
	},
	
	requireRecipesFor: function(name, createIfNotFound){
		if(!this.recipeData[name] && createIfNotFound){
			this.recipeData[name] = {};
		}
		return this.recipeData[name];
	},
	
	getRecipeResult: function(name, key1, key2){
		var data = this.requireRecipesFor(name);
		if(data){
			return data[key1] || data[key1+":"+key2];
		}
	},
	
	hasRecipeFor: function(name, key1, key2){
		return this.getRecipeResult(name, key1, key2)? true : false;
	}
	

	
}


// liquid
var MachineRecipeLiquidRegistry;
(function (MachineRecipeLiquidRegistry) {

    function registerFluidRecipes(name, data) {
        MachineRecipeLiquidRegistry.fluidRecipeData[name] = data;
    }
    MachineRecipeLiquidRegistry.registerFluidRecipes = registerFluidRecipes;
    function requireFluidRecipes(name) {
        if (!MachineRecipeLiquidRegistry.fluidRecipeData[name]) {
            MachineRecipeLiquidRegistry.fluidRecipeData[name] = {};
        }
        return MachineRecipeLiquidRegistry.fluidRecipeData[name];
    }
    MachineRecipeLiquidRegistry.requireFluidRecipes = requireFluidRecipes;
    function addFluidRecipe(name, liquid, data) {
        var recipes = requireFluidRecipes(name);
        recipes[liquid] = data;
    }
    MachineRecipeLiquidRegistry.addFluidRecipe = addFluidRecipe;
    function getFluidRecipe(name, liquid) {
        var recipes = requireFluidRecipes(name);
        return recipes[liquid];
    }
    MachineRecipeLiquidRegistry.getFluidRecipe = getFluidRecipe;
})(MachineRecipeLiquidRegistry || (MachineRecipeLiquidRegistry = {}));

// CRAFTING_TOOL_ITEM_MAX_DAMAGE
var CRAFTING_TOOL_ITEM_MAX_DAMAGE = 105;



var UpgradeAPI = {
	data: {},
	
	getUpgradeData: function(id){
		return this.data[id];
	},
	
	isUpgrade: function(id){
		return UpgradeAPI.data[id]? true : false;
	},
	
	isValidUpgrade: function(id, count, data, container){
		var upgrades = container.tileEntity.upgrades;
		var upgradeData = UpgradeAPI.getUpgradeData(id);
		if(upgradeData && (!upgrades || upgrades.indexOf(upgradeData.type) != -1)){
			return true;
		}
		return false;
	},

	registerUpgrade: function(id, type, func){
		this.data[id] = {type: type, func: func};
	},

	callUpgrade: function(item, machine, container, data){
		var upgrades = machine.upgrades;
		var upgrade = this.getUpgradeData(item.id);
		if(upgrade && (!upgrades || upgrades.indexOf(upgrade.type) != -1)){
			upgrade.func(item, machine, container, data);
		}
	},
	
	getUpgrades: function(machine, container){
		var upgrades = [];
		for(var slotName in container.slots){
			if(slotName.match(/Upgrade/)){
				var slot = container.getSlot(slotName);
				if(slot.id > 0){
					var find = false;
					for(var i in upgrades){
						var item = upgrades[i];
						if(item.id == slot.id && item.data == slot.data){
							item.count += slot.count;
							find = true;
							break;
						}
					}
					if(!find){
						item = {id: slot.id, count: slot.count, data: slot.data};
						upgrades.push(item);
					}
				}
			}
		}
		return upgrades;
	},

	executeUpgrades: function(machine){
		var container = machine.container;
		var data = machine.data;
		var upgrades = this.getUpgrades(machine, container);
		for(var i in upgrades){
			this.callUpgrade(upgrades[i], machine, container, data);
		}
		StorageInterface.checkHoppers(machine);
	},
}



// file: item/up.js

IDRegistry.genItemID("upgradeSpeed");
Item.createItem("upgradeSpeed", "Speed Upgrade", {name: "upgradespeed", meta: 0});

UpgradeAPI.registerUpgrade(ItemID.upgradeSpeed, "speed", function(item, machine, container, data){
	if(data.work_time){
		data.energy_consumption = Math.round(data.energy_consumption * Math.pow(1.6, item.count));
		data.work_time = Math.round(data.work_time * Math.pow(0.7, item.count));
	}
});
// file: core/WIRE.js

//wire API

let CableRegistry = {
	insulation_data: {},
	paint_data: [],
	
	getCableData: function(id){
		return this.insulation_data[id];
	},

	canBePainted: function(id){
		return this.paint_data.indexOf(id) != -1;
	},
	
	createBlock: function(nameID, properties, blockType){
		var variations = [];
		for(let i = 0; i < 16; i++){
			variations.push({name: properties.name, texture: [[properties.texture, i]]});
		}
		Block.createBlock(nameID, variations, blockType);
		this.paint_data.push(BlockID[nameID]);
	},
	
	registerCable: function(nameID, maxVoltage, maxInsulationLevel){
		if(maxInsulationLevel){
			for(let index = 0; index <= maxInsulationLevel; index++){
				let blockID = BlockID[nameID + index];
				this.insulation_data[blockID] = {name: nameID, insulation: index, maxInsulation: maxInsulationLevel};
				RF.registerWire(blockID, maxVoltage, this.cableConnectFunc);
				
				let itemID = ItemID[nameID + index];
				Block.registerDropFunction(nameID + index, function(coords, id, data){
					return [[itemID, 1, 0]];
				});

				Block.registerPopResourcesFunction(nameID + index, function(coords, block){
					if(Math.random() < 0.25){
						World.drop(coords.x + .5, coords.y + .5, coords.z + .5, itemID, 1, 0);
					}
					EnergyTypeRegistry.onWireDestroyed(coords.x, coords.y, coords.z, block.id);
				});
			}
		} else {
			RF.registerWire(BlockID[nameID], maxVoltage, this.cableConnectFunc);
			Block.registerDropFunction(nameID, function(coords, id, data){
				return [[ItemID[nameID], 1, 0]];
			});
			Block.registerPopResourcesFunction(nameID, function(coords, block){
				if(Math.random() < 0.25){
					World.drop(coords.x + .5, coords.y + .5, coords.z + .5, ItemID[nameID], 1, 0);
				}
				EnergyTypeRegistry.onWireDestroyed(coords.x, coords.y, coords.z, block.id);
			});
		}
	},

	setupModel: function(id, width) {
		TileRenderer.setupWireModel(id, 0, width, "rf-wire");
		
		var group = ICRender.getGroup("rf-wire");
		var groupPainted = ICRender.getGroup("rf-wire-painted");
		group.add(id, -1);
		
		// painted cables
		width /= 2;
		var boxes = [
			{side: [1, 0, 0], box: [0.5 + width, 0.5 - width, 0.5 - width, 1, 0.5 + width, 0.5 + width]},
			{side: [-1, 0, 0], box: [0, 0.5 - width, 0.5 - width, 0.5 - width, 0.5 + width, 0.5 + width]},
			{side: [0, 1, 0], box: [0.5 - width, 0.5 + width, 0.5 - width, 0.5 + width, 1, 0.5 + width]},
			{side: [0, -1, 0], box: [0.5 - width, 0, 0.5 - width, 0.5 + width, 0.5 - width, 0.5 + width]},
			{side: [0, 0, 1], box: [0.5 - width, 0.5 - width, 0.5 + width, 0.5 + width, 0.5 + width, 1]},
			{side: [0, 0, -1], box: [0.5 - width, 0.5 - width, 0, 0.5 + width, 0.5 + width, 0.5 - width]},
		]
		
		for(var data = 1; data < 16; data++){
			var groupColor = ICRender.getGroup("rf-wire" + data);
			groupColor.add(id, data);
			groupPainted.add(id, data);
			
			var render = new ICRender.Model();
			var shape = new ICRender.CollisionShape();
			for (var i in boxes) {
				var box = boxes[i];
				// render
				var model = BlockRenderer.createModel();
				model.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5], id, data);
				var condition1 = ICRender.BLOCK(box.side[0], box.side[1], box.side[2], group, false);
				var condition2 = ICRender.BLOCK(box.side[0], box.side[1], box.side[2], groupPainted, true);
				var condition3 = ICRender.BLOCK(box.side[0], box.side[1], box.side[2], groupColor, false);
				var condition = ICRender.AND(condition1, ICRender.OR(condition2, condition3));
				render.addEntry(model).setCondition(condition);
				// collision shape
				var entry = shape.addEntry();
				entry.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5]);
				entry.setCondition(condition);
			}
		
			// central box
			var model = BlockRenderer.createModel();
			model.addBox(0.5 - width, 0.5 - width, 0.5 - width, 0.5 + width, 0.5 + width, 0.5 + width, id, data);
			render.addEntry(model);
			
			var entry = shape.addEntry();
			entry.addBox(0.5 - width, 0.5 - width, 0.5 - width, 0.5 + width, 0.5 + width, 0.5 + width);
		
			var swidth = Math.max(width, 0.25);
			Block.setShape(id, 0.5 - swidth, 0.5 - swidth, 0.5 - swidth, 0.5 + swidth, 0.5 + swidth, 0.5 + swidth, data);
			
			BlockRenderer.setStaticICRender(id, data, render);
			BlockRenderer.setCustomCollisionShape(id, data, shape);
		}
	},

	cableConnectFunc: function(block, coord1, coord2, side){
		var block2 = World.getBlock(coord2.x, coord2.y, coord2.z);
		if(!CableRegistry.canBePainted(block2.id) || block2.data == 0 || block2.data == block.data){
			return true;
		}
		return false;
	}
}

// wire Damge
function isFriendlyMob(type){
	if(type >= 10 && type <= 31) return true;
	if(type == 74 || type == 75) return true;
	if(type == 108 || type == 109 || type >= 111 && type <= 113 || type == 115 || type == 118){
		return true;
	}
	return false;
}

function isHostileMob(type){
	if(type >= 32 && type <= 59) return true;
	if(type == 104 || type == 105 || type == 110 || type == 114 || type == 116){
		return true;
	}
	return false;
}

function canTakeDamage(entity, damageSource){
	var type = Entity.getType(entity);
	if(entity == player){
		if(Game.getGameMode() == 1) return false;
		switch(damageSource){
		case "electricity":
			if(Player.getArmorSlot(0).id == ItemID.faradayHelmet && Player.getArmorSlot(1).id == ItemID.faradayChestplate &&
			Player.getArmorSlot(2).id == ItemID.faradayLeggings && Player.getArmorSlot(3).id == ItemID.faradayBoots){
				return false;
			}
		break;
		case "radiation":
			return RadiationAPI.checkPlayerArmor();
		}
		return true;
	}
	return isFriendlyMob(type) || isHostileMob(type);
}

function damageEntityInR(entity, x, y, z){
	for(var yy = y-2; yy <= y+1; yy++)
	for(var xx = x-1; xx <= x+1; xx++)
	for(var zz = z-1; zz <= z+1; zz++){
		var blockID = World.getBlockID(xx, yy, zz);
		var cableData = CableRegistry.getCableData(blockID);
		if(cableData && cableData.insulation < cableData.maxInsulation){
			var net = EnergyNetBuilder.getNetOnCoords(xx, yy, zz);
			if(net && net.energyName == "Rf" && net.lastVoltage > insulationMaxVolt[cableData.insulation]){
				var damage = Math.ceil(net.lastVoltage / 8);
				Entity.damageEntity(entity, damage);
				return;
			}
		}
	}
}

var insulationMaxVolt = {
	0: 64,
	1: 128,
	2: 256
}

Callback.addCallback("tick", function(){
	if(World.getThreadTime()%20 == 0){
		if(Config.wireDamageEnabled){
			var entities = Entity.getAll();
		} else {
			var entities = [player];
		}
		for(var i in entities){
			var ent = entities[i];
			if(canTakeDamage(ent, "electricity") && Entity.getHealth(ent) > 0){
				var coords = Entity.getPosition(ent);
				damageEntityInR(ent, Math.floor(coords.x), Math.floor(coords.y), Math.floor(coords.z));
			}
		}
	}
});

// file: core/fluid.js

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


// file: item/wire.js
 IDRegistry.genItemID ("coilCopper0");
 Item.createItem ("coilCopper0", "Copper Coil", {name: "coilCopper", meta: 0}, {stack: 64});
 
  IDRegistry.genItemID ("coilCopper1");
 Item.createItem ("coilCopper1", "Insulated Copper Coil", {name: "coilCopper", meta: 1}, {stack: 64});

 IDRegistry.genItemID ("coilElectrum0");
 Item.createItem ("coilElectrum0", "Electrum Coil", {name: "coilElectrum", meta: 0}, {stack: 64});
 
  IDRegistry.genItemID ("coilElectrum1");
 Item.createItem ("coilElectrum1", "Insulated Electrum Coil", {name: "coilElectrum", meta: 1}, {stack: 64});

 IDRegistry.genItemID ("coilSteel");
 Item.createItem ("coilSteel", "Steel Coil", {name: "coilSteel", meta: 0}, {stack: 64});

// file: block/wire.js
Block.createSpecialType({
	destroytime: 0.05,
	explosionres: 0.5,
	renderlayer: 1,
}, "cable");

IDRegistry.genBlockID("coilCopper0");
IDRegistry.genBlockID("coilCopper1");
Block.createBlock("coilCopper0", [
	{name: "tile.wireCopper.name", texture: [["wireCopper", 0]], inCreative: false}
], "cable");
CableRegistry.createBlock("coilCopper1", {name: "tile.wireCopper.name", texture: "wireCopper1"}, "cable");
ToolAPI.registerBlockMaterial(BlockID.coilCopper0, "stone");
ToolAPI.registerBlockMaterial(BlockID.coilCopper1, "stone");

IDRegistry.genBlockID("coilElectrum0");
IDRegistry.genBlockID("coilElectrum1");
Block.createBlock("coilElectrum0", [
	{name: "tile.wireElectrum.name", texture: [["wireElectrum", 0]], inCreative: false}
], "cable");
CableRegistry.createBlock("coilCopper1", {name: "tile.wireElectrum.name", texture: "wireElectrum1"}, "cable");
ToolAPI.registerBlockMaterial(BlockID.coilElectrum0, "stone");
ToolAPI.registerBlockMaterial(BlockID.coilElectrum1, "stone");


CableRegistry.registerCable("coilCopper", 128, 1);
CableRegistry.registerCable("coilElectrum", 256, 1);

TileRenderer.setupWireModel(BlockID.coilElectrum0, -1, 2/16, "rf-wire");
CableRegistry.setupModel(BlockID.coilElectrum1, 2/16);
TileRenderer.setupWireModel(BlockID.coilCopper0, -1, 2/16, "rf-wire");
CableRegistry.setupModel(BlockID.coilCopper1, 2/16);

function registerCablePlaceFunc(nameID, blockID, blockData){
	Item.registerUseFunction(nameID, function(coords, item, block){
		var place = coords;
		if(!World.canTileBeReplaced(block.id, block.data)){
			place = coords.relative;
			block = World.getBlock(place.x, place.y, place.z);
			if(!World.canTileBeReplaced(block.id, block.data)){
				return;
			}
		}
		World.setBlock(place.x, place.y, place.z, blockID, blockData);
		Player.setCarriedItem(item.id, item.count - 1, item.data);
		EnergyTypeRegistry.onWirePlaced(place.x, place.y, place.z);
	});
}

for(var i = 0; i < 2; i++){
	registerCablePlaceFunc("coilCopper"+i, BlockID["coilCopper"+i], 0);
	Item.registerNameOverrideFunction(ItemID["coilCopper"+i], function(item, name){
		return name + "\n§7" + Translation.translate("Max RF/t: ") + "128 RF/t";
	});
}

for(var i = 0; i < 2; i++){
	registerCablePlaceFunc("coilElectrum"+i, BlockID["coilElectrum"+i], 0);
	Item.registerNameOverrideFunction(ItemID["coilElectrum"+i], function(item, name){
		return name + "\n§7" + Translation.translate("Max RF/t: ") + "256 RF/t";
	});
}


// file: item/armor.js
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

// file: item.js

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
 
  // IEingot
 IDRegistry.genItemID ("ingotCopper");
 Item.createItem ("ingotCopper", "Copper Ingot", {name: "ingotCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotAluminum");
 Item.createItem ("ingotAluminum", "Aluminum Ingot", {name: "ingotAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotConstantan");
 Item.createItem ("ingotConstantan", "Constantan Ingot", {name: "ingotConstantan", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotElectrum");
 Item.createItem ("ingotElectrum", "Electrum Ingot", {name: "ingotElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("ingotSilver");
 Item.createItem ("ingotSilver", "Silver Ingot", {name: "ingotSilver", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("ingotLead");
 Item.createItem ("ingotLead", "Lead Ingot", {name: "ingotLead", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("ingotNickel");
 Item.createItem ("ingotNickel", "Nickel Ingot", {name: "ingotNickel", meta: 0}, {stack: 64});
  
 IDRegistry.genItemID ("ingotUranium");
 Item.createItem ("ingotUranium", "Uranium Ingot", {name: "ingotUranium", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("ingotAluminum");
 Item.createItem ("ingotAluminum", "Aluminum Ingot", {name: "ingotAluminum", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("ingotBronze");
 Item.createItem ("ingotBronze", "Bronze Ingot", {name: "ingotBronze", meta: 0}, {stack: 64});

// IEnugget
 IDRegistry.genItemID ("nuggetAluminum");
 Item.createItem ("nuggetAluminum", "Aluminum nugget", {name: "nuggetAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetCopper");
 Item.createItem ("nuggetCopper", "Copper Nugget", {name: "nuggetCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetLead");
 Item.createItem ("nuggetLead", "Lead Nugget", {name: "nuggetLead", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetSilver");
 Item.createItem ("nuggetSilver", "Silver Nugget", {name: "nuggetSilver", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetElectrum");
 Item.createItem ("nuggetElectrum", "Electrum Nugget", {name: "nuggetElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetSteel");
 Item.createItem ("nuggetSteel", "Steel Nugget", {name: "nuggetSteel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetConstantan");
 Item.createItem ("nuggetConstantan", "Constantan Nugget", {name: "nuggetConstantan", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("nuggetNickel");
 Item.createItem ("nuggetNickel", "Nickel Nugget", {name: "nuggetNickel", meta: 0}, {stack: 64});
 
 IDRegistry.genItemID ("nuggetUranium");
 Item.createItem ("nuggetUranium", "Uranium Nugget", {name: "nuggetUranium", meta: 0}, {stack: 64});
 
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
 
 // IEplate
 IDRegistry.genItemID ("plateCopper");
 Item.createItem ("plateCopper", "Copper Plate", {name: "plateCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateAluminum");
 Item.createItem ("plateAluminum", "Aluminum Plate", {name: "plateAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateConstantan");
 Item.createItem ("plateConstantan", "Constantan Plate", {name: "plateConstantan", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateElectrum");
 Item.createItem ("plateElectrum", "Electrum Plate", {name: "plateElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateSilver");
 Item.createItem ("plateSilver", "Silver Plate", {name: "plateSilver", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateIron");
 Item.createItem ("plateIron", "Iron Plate", {name: "plateIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateNickel");
 Item.createItem ("plateNickel", "Nickel Plate", {name: "plateNickel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateLead");
 Item.createItem ("plateLead", "Lead Plate", {name: "plateLead", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("plateSteel");
 Item.createItem ("plateSteel", "Steel Plate", {name: "plateSteel", meta: 0}, {stack: 64});

// IEdust
 IDRegistry.genItemID ("dustAluminum");
 Item.createItem ("dustAluminum", "Aluminum Dust", {name: "dustAluminum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustCopper");
 Item.createItem ("dustCopper", "Copper Dust", {name: "dustCopper", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustGold");
 Item.createItem ("dustGold", "Gold Dust", {name: "dustGold", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustSilver");
 Item.createItem ("dustSilver", "Silver Dust", {name: "dustSilver", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustElectrum");
 Item.createItem ("dustElectrum", "Electrum Dust", {name: "dustElectrum", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustIron");
 Item.createItem ("dustIron", "Iron Dust", {name: "dustIron", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustCoke");
 Item.createItem ("dustCoke", "Coke Dust", {name: "dustCoke", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustLead");
 Item.createItem ("dustLead", "Lead Dust", {name: "dustLead", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustNickel");
 Item.createItem ("dustNickel", "Nickel Dust", {name: "dustNickel", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustQuartz");
 Item.createItem ("dustQuartz", "Quartz Dust", {name: "dustQuartz", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustUranium");
 Item.createItem ("dustUranium", "Uranium Dust", {name: "dustUranium", meta: 0}, {stack: 64});

 IDRegistry.genItemID ("dustSteel");
 Item.createItem ("dustSteel", "Steel Dust", {name: "dustSteel", meta: 0}, {stack: 64});

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
 
// file: recipes.js

// file: creative/GENER.js
IDRegistry.genBlockID("FGenerator");
Block.createBlock("FGenerator", [
	{name: "Furnace Generator", texture: [["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["machine_side", 0]], inCreative: true}]);

TileRenderer.setStandartModel(BlockID.FGenerator, [["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["machine_side", 0]]);
TileRenderer.registerRotationModel(BlockID.FGenerator, 0, [["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["CR_generator", 0], ["machine_side", 0], ["machine_side", 0]]);
TileRenderer.registerRotationModel(BlockID.FGenerator, 4, [["machine_side", 0], ["machine_side", 0], ["machine_side", 0], ["CR_Generator", 0], ["machine_side", 0], ["machine_side", 0]]);

var guiCRGenerator = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Creative Generator")}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	drawing: [
		{type: "bitmap", x: 530, y: 144, bitmap: "rf_scale", scale: 0.6},
		{type: "bitmap", x: 450, y: 150, bitmap: "fire_background", scale: GUI_SCALE},
	],
	
	elements: {
		"energyScale": {type: "scale", x: 530 + GUI_SCALE * 4, y: 144, direction: 0, value: 0.5, bitmap: "rf_scale_full", scale: 0.6},
		"burningScale": {type: "scale", x: 450, y: 150, direction: 1, value: 0.5, bitmap: "fire_scale", scale: GUI_SCALE},
		"slotEnergy": {type: "slot", x: 441, y: 75, isValid: function(id){return ChargeItemRegistry.isValidItem(id, "Rf", 1);}},
		"slotFuel": {type: "slot", x: 441, y: 212,
			isValid: function(id, count, data){
				return Recipes.getFuelBurnDuration(id, data) > 0;
			}
		},
		"textInfo1": {type: "text", x: 642, y: 142, width: 300, height: 30, text: "0/"},
		"textInfo2": {type: "text", x: 642, y: 172, width: 300, height: 30, text: "100000"}
	}
});


MachineRegistry.registerGenerator(BlockID.FGenerator, {
	defaultValues: {
		meta: 0,
		burn: 0,
		burnMax: 0,
		isActive: false
	},
	
	getGuiScreen: function(){
		return guiCRGenerator;
	},
	
	getFuel: function(slotName){
		var fuelSlot = this.container.getSlot(slotName);
		if (fuelSlot.id > 0){
			var burn = Recipes.getFuelBurnDuration(fuelSlot.id, fuelSlot.data);
			if (burn && !LiquidRegistry.getItemLiquid(fuelSlot.id, fuelSlot.data)){
				fuelSlot.count--;
				this.container.validateSlot(slotName);
				
				return burn;
			}
		}
		return 0;
	},
	
	tick: function(){
		StorageInterface.checkHoppers(this);
		var energyStorage = this.getEnergyStorage();
		
		if(this.data.burn <= 0 && this.data.energy + 10 < energyStorage){
			this.data.burn = this.data.burnMax = this.getFuel("slotFuel") / 4;
		}
		if(this.data.burn > 0 && 
		  (!this.data.isActive && this.data.energy + 100 <= energyStorage ||
		  this.data.isActive && this.data.energy + 10 <= energyStorage)){
			this.data.energy += 10;
			this.data.burn--;
			this.activate();
		} else {
			this.deactivate();
		}
		
		this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), "Rf", this.data.energy, 1);
		
		this.container.setScale("burningScale", this.data.burn / this.data.burnMax || 0);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
		this.container.setText("textInfo1", this.data.energy + "/");
	},
	
	getEnergyStorage: function(){
		return 10000;
	},
	
	energyTick: function(type, src){
		var output = Math.min(32, this.data.energy);
		this.data.energy += src.add(output) - output;
	},
	
	renderModel: MachineRegistry.renderModelWithRotation,
});

TileRenderer.setRotationPlaceFunction(BlockID.FGenerator);

StorageInterface.createInterface(BlockID.FGenerator, {
	slots: {
		"slotFuel": {input: true}
	},
	isValidInput: function(item){
		return Recipes.getFuelBurnDuration(item.id, item.data) > 0;
	}
});

// file: machine/refinery.js
IDRegistry.genBlockID("MB_refinery");
Block.createBlock("MB_refinery", [
	{name: "Refinery", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("refinery", 0);
mesh.importFromFile(__dir__ + "assets/models/refinery.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_refinery, -1, icRenderModel);

IDRegistry.genBlockID("refinery");
Block.createBlock("refinery", [
    { name: "Refinery", texture: [["refinery_t", 0], ["mp", 0], ["refinery_s", 0], ["refinery_s", 0], ["refinery_s", 0], ["refinery_s", 0]], inCreative: true }
], "machine");

// file: machine/refinery.js
IDRegistry.genBlockID("fermenter");
Block.createBlock("fermenter", [
	{name: "Fermenter", texture: [["fermenter", 0], ["fermenter", 0], ["fermenter", 0], ["fermenter", 1], ["fermenter", 0], ["fermenter", 0]], inCreative: true }
], "machine");

IDRegistry.genBlockID("coreFermenter");
Block.createBlock("coreFermenter", [
    { name: "Fermenter Core", texture: [["metal_t", 0], ["metal_t", 0], ["Fermenter_s", 0], ["Fermenter_f", 0], ["Fermenter_s", 0], ["Fermenter_s", 0]], inCreative: true }
], "machine");

var Fermenter_structure = [
{x: -1, y: 0, z: +1, id: BlockID.fermenter},
{x: -1, y: 0, z: 0, id: BlockID.lightEngineer},
{x: -1, y: 0, z: -1, id: BlockID.fermenter},
{x: -2, y: 0, z: +1, id: BlockID.fermenter},
{x: -2, y: 0, z: 0, id: BlockID.fermenter},
{x: -2, y: 0, z: -1, id: BlockID.fermenter},
{x: 0, y: 0, z: +1, id: BlockID.fermenter},
{x: 0, y: 0, z: -1, id: BlockID.fermenter},
{x: 0, y: +1, z: 0, id: BlockID.lightEngineer},
{x: 0, y: -1, z: 0, id: BlockID.lightEngineer},
{x: -1, y: +1, z: +1, id: BlockID.lightEngineer},
{x: -1, y: +1, z: 0, id: BlockID.lightEngineer},
{x: -1, y: +1, z: -1, id: BlockID.lightEngineer},
{x: -2, y: +1, z: +1, id: BlockID.lightEngineer},
{x: -2, y: +1, z: 0, id: BlockID.lightEngineer},
{x: -2, y: +1, z: -1, id: BlockID.lightEngineer},
{x: 0, y: +1, z: +1, id: BlockID.lightEngineer},
{x: 0, y: +1, z: -1, id: BlockID.lightEngineer},
{x: -1, y: -1, z: +1, id: BlockID.lightEngineer},
{x: -1, y: -1, z: 0, id: BlockID.lightEngineer},
{x: -1, y: -1, z: -1, id: BlockID.lightEngineer},
{x: -2, y: -1, z: +1, id: BlockID.lightEngineer},
{x: -2, y: -1, z: 0, id: BlockID.lightEngineer},
{x: -2, y: -1, z: -1, id: BlockID.lightEngineer},
{x: 0, y: -1, z: +1, id: BlockID.lightEngineer},
{x: 0, y: -1, z: -1, id: BlockID.lightEngineer}
];

var guiFermenter = new UI.StandartWindow({
	standart: {
		header: {text: {text: "Fermenter"}},
		inventory: {standart: true},
		background: {standart: true}
	},
	drawing: [
		{type: "bitmap", x: 480, y: 160, bitmap: "arrow_bar_background", scale: 3.2},
		{type: "bitmap", x: 480, y: 70, bitmap: "rf_scale", scale: 0.6},
	],
	elements: {
		"scaleEthanol": {type: "scale", x: 555, y: 151, direction: 0, bitmap: "liquid_ethanol", scale: 0.25, value: 1},
		"progressScale": {type: "scale", x: 480, y: 160, bitmap: "arrow_bar_scale", scale: 3.2},
		"energyScale": {type: "scale", x: 480, y: 69, direction: 0, bitmap: "rf_scale_full", scale: 0.6, value: 1},
		"slotIn": {type: "slot", x: 680, y: 140, size: 60,isValid: function(id, count, data){
            return LiquidLib.getItemLiquid(id, data) == "ethanol";
        }},
		"slotOut": {type: "slot", x: 680, y: 70, size: 60},
		"slotInput": {type: "slot", x: 408, y: 156, size: 60},
		"slotEnergy": {type: "slot", x: 750, y: 20, size: 45},
		"slotUpgrade1": {type: "slot", x: 820, y: 60, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade2": {type: "slot", x: 820, y: 119, isValid: UpgradeAPI.isValidUpgrade},
    }
});


MachineRegistry.registerPrototype(BlockID.coreFermenter, {
	defaultValues:{
		energy_storage: 20000,
		energy_consumption: 20,
		progress: 0,
		work_time: 200,
		isActive: false,
	},
	
	upgrades: ["speed"],
	
	getGuiScreen: function(){
       return guiFermenter;
    },
	
    setDefaultValues: function(){
        this.data.energymax = this.defaultValues.energymax;
        this.data.energy_consumption = this.defaultValues.energy_consumption;
        this.data.work_time = this.defaultValues.work_time;
    },
	
	init: function(){
		this.liquidStorage.setLimit("ethanol", 10);
		this.renderModel();
	},
	
	getLiquidFromItem: MachineRegistry.getLiquidFromItem,
	addLiquidToItem: MachineRegistry.addLiquidToItem,
	
    tick: function(){
    	var newActive = false;
		StorageInterface.checkHoppers(this);
		var slotFuel = this.container.getSlot("slotInput");
		
		// apple
		if(slotFuel.id == VanillaItemID.apple){
			if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    newActive = true;
                }
			if(this.data.progress >= 1){
				inSlot.count--;
				this.liquidStorage.getLiquid("ethanol", 0.08);
				this.data.progress = 0;
				}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
		this.setActive(newActive);
	}
		
		//potato
		if(slotFuel.id == VanillaItemID.potato){
			if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    newActive = true;
                }
			if(this.data.progress >= 1){
				inSlot.count--;
				this.liquidStorage.getLiquid("ethanol", 0.08);
				this.data.progress = 0;
				}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
		this.setActive(newActive);
	}
		
		//melon
		if(slotFuel.id == VanillaItemID.melon){
			if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    newActive = true;
                }
			if(this.data.progress >= 1){
				inSlot.count--;
				this.liquidStorage.getLiquid("ethanol", 0.08);
				this.data.progress = 0;
				}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
		this.setActive(newActive);
	}
		
		
		
		
		var slot1 = this.container.getSlot("slotIn");
		var slot2 = this.container.getSlot("slotOut");
		this.getLiquidFromItem("ethanol", slot1);
		this.addLiquidToItem("ethanol", slot2);
		
		this.container.setScale("energyScale", this.data.energy / this.data.energymax);
		this.container.setScale("progressScale", this.data.progress);
		this.liquidStorage.updateUiScale("scaleEthanol", "ethanol");
    },
    
        getEnergyStorage: function(){
        return this.data.energymax;
    },
    
	    validStructure: function(){
      	let x = this.x;
		  let y = this.y;
		  let z = this.z;
      isValidStructure = StructureLib.getStructure(x, y, z, Fermenter_structure);
    },
    
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc
});

TileRenderer.setRotationPlaceFunction(BlockID.coreFermenter, true);

// file: machine/metalPress.js

IDRegistry.genBlockID("MB_metalPress");
Block.createBlock("MB_metalPress", [
	{name: "Metal Press", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("metalPress", 0);
mesh.importFromFile(__dir__ + "assets/models/metalPress.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_metalPress, -1, icRenderModel);

IDRegistry.genBlockID("metalPress");
Block.createBlock("metalPress", [
    { name: "Metal Press", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }
], "machine");

var guimetalPress = new UI.StandartWindow({
	standart: {
		header: {text: {text: "Metal Press"}},
		inventory: {standart: true},
		background: {standart: true}
	},
	drawing: [
		{type: "bitmap", x: 510, y: 205, bitmap: "arrow_bar_background", scale: 3.2},
		{type: "bitmap", x: 680, y: 130, bitmap: "rf_scale", scale: 0.6},
	],
	elements: {
		"slotSource": {type: "slot", x: 350, y: 200, size: 63},
		"slotMold": {type: "slot", x: 440, y: 200, size: 64},
		"slotResult": {type: "slot", x: 590, y: 200, size: 60},
		"energyScale": {type: "scale", x: 680, y: 130, direction: 0, bitmap: "rf_scale_full", scale: 0.6, value: 1},
		"slotEnergy": {type: "slot", x: 750, y: 20, size: 45},
		"progressScale": {type: "scale", x: 510, y: 204, bitmap: "arrow_bar_scale", scale: 3.2},
		"slotUpgrade1": {type: "slot", x: 820, y: 60, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade2": {type: "slot", x: 820, y: 119, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade3": {type: "slot", x: 820, y: 178, isValid: UpgradeAPI.isValidUpgrade},
		"slotUpgrade4": {type: "slot", x: 820, y: 237, isValid: UpgradeAPI.isValidUpgrade},
    }
});

var MP_structure = [
{x: +1, y: 0, z: 0, id: BlockID.steelScaffolding},
{x: -1, y: 0, z: 0, id: BlockID.steelScaffolding},
{x: 0, y: +1, z: 0, id: VanillaBlockID.piston},
{x: 0, y: +2, z: 0, id: BlockID.heavyEngineer}
];





var MP_recipe_wire = [];

function addMPrecipewire(result, source){
	MP_recipe_wire.push({source: source, result: result});
}

var MP_recipe_plate = [];

function addMPrecipeplate(result, source){
	MP_recipe_plate.push({source: source, result: result});
}

var MP_recipe_rod = [];

function addMPreciperod(result, source){
	MP_recipe_rod.push({source: source, result: result});
}

Callback.addCallback("PreLoaded", function(){
//wire
addMPrecipewire({id: ItemID.wireCopper, count: 1}, [{id: ItemID.ingotCopper , count: 1}]);
addMPrecipewire({id: ItemID.wireSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1}]);
addMPrecipewire({id: ItemID.wireAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1}]);
addMPrecipewire({id: ItemID.wireElectrum, count: 1}, [{id: ItemID.ingotElectrum, count: 1}]);


//stick
addMPreciperod({id: ItemID.stickIron, count: 1}, [{id: 365 , count: 1}]);
addMPreciperod({id: ItemID.stickSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1}]);
addMPreciperod({id: ItemID.stickAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1}]);


//plate
addMPrecipeplate({id: ItemID.plateIron, count: 1}, [{id: 365 , count: 1}]);
addMPrecipeplate({id: ItemID.plateSteel, count: 1}, [{id: ItemID.ingotSteel, count: 1}]);
addMPrecipeplate({id: ItemID.plateAluminum, count: 1}, [{id: ItemID.ingotAluminum, count: 1}]);
addMPrecipeplate({id: ItemID.plateElectrum, count: 1}, [{id: ItemID.ingotElectrum, count: 1}]);
addMPrecipeplate({id: ItemID.plateCopper, count: 1}, [{id: ItemID.ingotCopper , count: 1}]);
addMPrecipeplate({id: ItemID.plateSilver, count: 1}, [{id: ItemID.ingotSilver, count: 1}]);
addMPrecipeplate({id: ItemID.plateConstanta, count: 1}, [{id: ItemID.ingotConstanta, count: 1}]);
addMPrecipeplate({id: ItemID.plateLead, count: 1}, [{id: ItemID.ingotLead, count: 1}]);
addMPrecipeplate({id: ItemID.plateNickel, count: 1}, [{id: ItemID.ingotNickel , count: 1}]);

});



MachineRegistry.registerPrototype(BlockID.metalPress, {
	defaultValues: {
		energy_storage: 24000,
		energy_consumption: 20,
		work_time: 200,
		progress: 0,
	    isActive: false
	},
	
	getGuiScreen: function(){
		return guimetalPress;
	},
	
	getTransportSlots: function(){
		return {input: ["slotSource"], output: ["slotResult"]};
	},
    
    setDefaultValues: function(){
        this.data.energymax = this.defaultValues.energymax;
        this.data.energy_consumption = this.defaultValues.energy_consumption;
        this.data.work_time = this.defaultValues.work_time;
    },
        
    
    tick: function(){
    	var newActive = false;
        var energySlot = this.container.getSlot("slotEnergy");              
        var moldSlot = this.container.getSlot("slotMold");
        var inSlot = this.container.getSlot("slotSource");
        var resultSlot = this.container.getSlot("slotResult");

// plate
        if (moldSlot.id == ItemID.moldPlate) {
            if (inSlot.id == MP_recipes_plate.source.id && moldSlot.count >= 1){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    newActive = true;
					this.startPlaySound();
                    
                }
                if(this.data.progress >= 1){
                    inSlot.count--;
                    resultSlot.id = MP_recipes_plate.result.id;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
				}
			}
		}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
			this.stopPlaySound(true);
		this.setActive(newActive);
// rod
	    if (moldSlot.id == ItemID.moldRod) {
            if (inSlot.id == MP_recipes_rod.source.id && moldSlot.count >= 1){
                if(this.data.energy >= this.data.energy_consumption){
                    this.data.energy -= this.data.energy_consumption;
                    this.data.progress += 1/this.data.work_time;
                    newActive = true;
					this.startPlaySound();
                    
                }
                if(this.data.progress >= 1){
                    inSlot.count--;
                    resultSlot.id = MP_recipes_rod.result.id;
                    resultSlot.data = 0;
                    resultSlot.count += 1;
                    this.container.validateAll();
                    this.data.progress = 0;
				}
			}
		}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
			this.stopPlaySound(true);
		this.setActive(newActive);
		
// wire
		
		
        this.container.setScale("energyScale", this.data.energy / this.data.energymax);
        this.container.setScale("progressScale", this.data.progress);
		this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), Math.min(200, this.data.energymax - this.data.energy), 2);
    },
    
    getEnergyStorage: function(){
        return this.data.energymax;
    },
    
    getStartSoundFile: function(){
		return "metal_press_smash.ogg";
    },
	getInterruptSoundFile: function(){
		return "metal_press_piston.ogg";
    },
    validStructure: function(){
    	let x = this.x;
		  let y = this.y;
		  let z = this.z;
      isValidStructure = StructureLib.getStructure(x, y, z, MP_structure);
    },
    
    
    energyTick: MachineRegistry.basicEnergyReceiveFunc

});

TileRenderer.setRotationPlaceFunction(BlockID.metalPress);


// file: machine/dieselGen.js
IDRegistry.genBlockID("MB_dieselGenerator");
Block.createBlock("MB_dieselGenerator", [
	{name: "Diesel Generator", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("dieselGenerator", 0);
mesh.importFromFile(__dir__ + "assets/models/dieselGenerator.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_dieselGenerator, 0, icRenderModel);

IDRegistry.genBlockID("dieselGen");
Block.createBlock("dieselGen", [
    { name: "Diesel Generator", texture: [["mp", 0], ["mp", 0], ["dg_STORAGE", 0], ["dg_f", 0], ["mp", 0], ["mp", 0]], inCreative: true }
], "machine");

TileRenderer.setStandartModel(BlockID.dieselGen, [["mp", 0], ["mp", 0], ["dg_STORAGE", 0], ["dg_f", 0], ["mp", 0], ["mp", 0]]);
TileRenderer.registerRotationModel(BlockID.dieselGen, 0, [["mp", 0], ["mp", 0], ["dg_STORAGE", 0], ["dg_f", 0], ["mp", 0], ["mp", 0]]);
TileRenderer.registerRotationModel(BlockID.dieselGen, 4, [["mp", 0], ["mp", 0], ["dg_STORAGE", 3], ["dg_f", 1], ["mp", 0], ["mp", 0]]);

MachineRecipeLiquidRegistry.registerFluidRecipes("dieselGen", {
	"biodiesel": {power: 512, amount: 100},
});

var guidieselGen = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Diesel Generator")}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	drawing: [
		{type: "bitmap", x: 702, y: 91, bitmap: "rf_scale", scale: 0.6},
		{type: "bitmap", x: 479, y: 160, bitmap: "gui_liquid_storage_overlay", scale: 4.3}
	],
	
	elements: {
		"energyScale": {type: "scale", x: 702 + 4*GUI_SCALE, y: 91, direction: 0, value: 0.5, bitmap: "rf_scale_full", scale: 0.6},
		"liquidScale": {type: "scale", x: 482, y: 169, direction: 0, value: 0.5, bitmap: "liquid_diesel_bio", scale: 0.15},
		"slot1": {type: "slot", x: 408, y: 156},
		"slot2": {type: "slot", x: 408, y: 80, isValid: function(){return false;}},
		"slotEnergy": {type: "slot", x: 725, y: 165, isValid: function(id){return ChargeItemRegistry.isValidItem(id, "Rf", 1);}}
	}
});

MachineRegistry.registerGenerator(BlockID.dieselGen, {
	defaultValues: {
		meta: 0,
		fuel: 0,
		liquid: null,
		isActive: false
	},
	
	getGuiScreen: function(){
		return guidieselGen;
	},
	
	init: function(){
		this.liquidStorage.setLimit(null, 16);
		this.renderModel();
	},
	
	getLiquidFromItem: MachineRegistry.getLiquidFromItem,
	
	click: function(id, count, data, coords){
		if(Entity.getSneaking(player)){
			var liquid = this.liquidStorage.getLiquidStored();
			return this.getLiquidFromItem(liquid, {id: id, count: count, data: data}, null, true);
		}
	},
	
	tick: function(){
		StorageInterface.checkHoppers(this);
		var energyStorage = this.getEnergyStorage();
		var liquid = this.liquidStorage.getLiquidStored();
		var slot1 = this.container.getSlot("slot1");
		var slot2 = this.container.getSlot("slot2");
		this.getLiquidFromItem(liquid, slot1, slot2);
		
		if(this.data.fuel <= 0){
			var fuel = MachineRecipeLiquidRegistry.getFluidRecipe("dieselGen", liquid);
			if(fuel && this.liquidStorage.getAmount(liquid).toFixed(3) >= fuel.amount/1000 && this.data.energy + fuel.power * fuel.amount <= energyStorage){
				this.liquidStorage.getLiquid(liquid, fuel.amount/1000);
				this.data.fuel = fuel.amount;
				this.data.liquid = liquid;
			}
		}
		if(this.data.fuel > 0){
			var fuel = MachineRecipeLiquidRegistry.getFluidRecipe("dieselGen", this.data.liquid);
			this.data.energy += fuel.power;
			this.data.fuel -= fuel.amount/20;
			this.activate();
			this.startPlaySound("diesel_generator.ogg");
		}
		else {
			this.data.liquid = null;
			this.stopPlaySound();
			this.deactivate();
		}
    
		this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), "Rf", this.data.energy, 1);
		
		this.liquidStorage.updateUiScale("liquidScale", liquid);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
	},
	
	getEnergyStorage: function(){
		return 100000;
	},
	
	energyTick: function(type, src){
		var output = Math.min(32, this.data.energy);
		this.data.energy += src.add(output) - output;
	},
	
	renderModel: MachineRegistry.renderModelWithRotation
});

TileRenderer.setRotationPlaceFunction(BlockID.dieselGen);

StorageInterface.createInterface(BlockID.dieselGen, {
	slots: {
		"slot1": {input: true},
		"slot2": {output: true}
	},
	isValidInput: function(item){
		var empty = LiquidLib.getEmptyItem(item.id, item.data);
		if(!empty) return false;
		return MachineRecipeLiquidRegistry.hasRecipeFor("dieselGen", empty.liquid);
	},
	canReceiveLiquid: function(liquid, side){
		return MachineRecipeLiquidRegistry.hasRecipeFor("dieselGen", liquid)
	},
	canTransportLiquid: function(liquid, side){ return false; }
});
// file: block/Pipe.js

IDRegistry.genBlockID("MB_liquidPipe");
Block.createBlock("MB_liquidPipe", [
	{name: "PIPE", texture: [["mp", 0], ["mp", 0], ["mp", 0], ["mp", 1], ["mp", 0], ["mp", 0]], inCreative: true }]);
var mesh = new RenderMesh();
mesh.setBlockTexture("mbfluidPipe", 0);
mesh.importFromFile(__dir__ + "assets/models/pipe.obj", "obj", null); 
var blockModel = new BlockRenderer.Model(mesh);
var icRenderModel = new ICRender.Model();
icRenderModel.addEntry(blockModel);
BlockRenderer.setStaticICRender(BlockID.MB_liquidPipe, 0, icRenderModel);

IDRegistry.genBlockID("liquidPipe");
Block.createBlock("liquidPipe", [
{name: "Liquid Pipe", texture: [["fluidPipe", 0]], inCreative: true}
]);



// file: ore.js

Block.createSpecialType({
	base: 1,
	solid: true,
	destroytime: 3,
	explosionres: 15,
	lightopacity: 15,
	renderlayer: 2,
	translucency: 0
}, "ore");

IDRegistry.genBlockID("oreAluminum");
Block.createBlock("oreAluminum", [
	{name: "Bauxite Ore", texture: [["ore_aluminum", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreAluminum, "stone", 2, true);
Block.setDestroyLevel("oreAluminum", 2);
ToolLib.addBlockDropOnExplosion("oreAluminum");

IDRegistry.genBlockID("oreCopper");
Block.createBlock("oreCopper", [
	{name: "Azurite Ore", texture: [["ore_copper", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreCopper, "stone", 2, true);
Block.setDestroyLevel("oreCopper", 2);
ToolLib.addBlockDropOnExplosion("oreCopper");

IDRegistry.genBlockID("oreNickel");
Block.createBlock("oreNickel", [
	{name: "Nickel Ore", texture: [["ore_nickel", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreNickel, "stone", 2, true);
Block.setDestroyLevel("oreNickel", 2);
ToolLib.addBlockDropOnExplosion("oreNickel");

IDRegistry.genBlockID("oreLead");
Block.createBlock("oreLead", [
	{name: "Galena Ore", texture: [["ore_lead", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreLead, "stone", 2, true);
Block.setDestroyLevel("oreLead", 2);
ToolLib.addBlockDropOnExplosion("oreLead");

IDRegistry.genBlockID("oreUranium");
Block.createBlock("oreUranium", [
	{name: "Uranium Ore", texture: [["ore_uranium", 0]], inCreative: true}
], "ore");
ToolAPI.registerBlockMaterial(BlockID.oreUranium, "stone", 3, true);
Block.setDestroyLevel("oreUranium", 3);
ToolLib.addBlockDropOnExplosion("oreUranium");
Item.addCreativeGroup("ores", Translation.translate("Ores"), [
    BlockID.oreAluminum,
	BlockID.oreCopper,
	BlockID.oreNickel,
	BlockID.oreLead,
	BlockID.oreSilver,
	BlockID.oreUranium
]);

// Oregen
var OreGenerator = {
	copper: {
		enabled: __config__.getBool("copper_ore.enabled"),
		count: __config__.getNumber("copper_ore.count"),
		size: __config__.getNumber("copper_ore.size"),
		minHeight: __config__.getNumber("copper_ore.minHeight"),
		maxHeight: __config__.getNumber("copper_ore.maxHeight")
	},
	aluninum: {
		enabled: __config__.getBool("aluminum_ore.enabled"),
		count: __config__.getNumber("aluminum_ore.count"),
		size: __config__.getNumber("aluminum_ore.size"),
		minHeight: __config__.getNumber("aluminum_ore.minHeight"),
		maxHeight: __config__.getNumber("aluminum_ore.maxHeight")
	},
	nickel: {
		enabled: __config__.getBool("nickel_ore.enabled"),
		count: __config__.getNumber("nickel_ore.count"),
		size: __config__.getNumber("nickel_ore.size"),
		minHeight: __config__.getNumber("nickel_ore.minHeight"),
		maxHeight: __config__.getNumber("nickel_ore.maxHeight")
	},
	lead: {
		enabled: __config__.getBool("lead_ore.enabled"),
		count: __config__.getNumber("lead_ore.count"),
		size: __config__.getNumber("lead_ore.size"),
		minHeight: __config__.getNumber("lead_ore.minHeight"),
		maxHeight: __config__.getNumber("lead_ore.maxHeight")
	},
	uranium: {
		enabled: __config__.getBool("uranium_ore.enabled"),
		count: __config__.getNumber("uranium_ore.count"),
		size: __config__.getNumber("uranium_ore.size"),
		minHeight: __config__.getNumber("uranium_ore.minHeight"),
		maxHeight: __config__.getNumber("uranium_ore.maxHeight")
	},

	randomCoords: function(random, chunkX, chunkZ, minHeight, maxHeight){
		minHeight = minHeight || 0;
		maxHeight = maxHeight || 128;
		var x = chunkX*16 + random.nextInt(16);
		var z = chunkZ*16 + random.nextInt(16);
		var y = random.nextInt(maxHeight - minHeight + 1) - minHeight;
		return {x: x, y: y, z: z};
	}
}

Callback.addCallback("GenerateChunkUnderground", function(chunkX, chunkZ, random){
	if(OreGenerator.copper.enabled){
		for(var i = 0; i < OreGenerator.copper.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.copper.minHeight, OreGenerator.copper.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreCopper, 0, OreGenerator.copper.size, false, random.nextInt());
		}
	}


	if(OreGenerator.aluminum.enabled){
		for(var i = 0; i < OreGenerator.aluminum.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.aluminum.minHeight, OreGenerator.aluminum.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreAluminum, 0, OreGenerator.aluminum.size, false, random.nextInt());
		}
	}
	
	if(OreGenerator.nickel.enabled){
		for(var i = 0; i < OreGenerator.nickel.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.nickel.minHeight, OreGenerator.nickel.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreNickel, 0, OreGenerator.nickel.size, false, random.nextInt());
		}
	}
	
	if(OreGenerator.lead.enabled){
		for(var i = 0; i < OreGenerator.lead.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.lead.minHeight, OreGenerator.lead.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreLead, 0, OreGenerator.lead.size, false, random.nextInt());
		}
	}

	if(OreGenerator.uranium.enabled){
		for(var i = 0; i < OreGenerator.uranium.count; i++){
			var coords = OreGenerator.randomCoords(random, chunkX, chunkZ, OreGenerator.uranium.minHeight, OreGenerator.uranium.maxHeight);
			GenerationUtils.generateOre(coords.x, coords.y, coords.z, BlockID.oreUranium, 0, OreGenerator.uranium.size, false, random.nextInt());
		}
	}
	
});
// file: auto.js

Item.registerUseFunction(ItemID.immersiveHammer, function(coords, item, block){
	if(block.id == BlockID.metalPress){StructureLib.structureAssembler(MB_structure, coords);}
	if(block.id == BlockID.coreFermenter){StructureLib.structureAssembler(Fermenter_structure, coords);}
	
});


// file: RV.js
var RV;
ModAPI.addAPICallback("RecipeViewer", function (api) {
    RV = api;
    var Bitmap = android.graphics.Bitmap;
    var RecipeTypeForIEPE = /** @class */ (function (_super) {
        __extends(RecipeTypeForIEPE, _super);
        function RecipeTypeForIEPE(name, icon, content) {
            var _a, _b;
            var _this = this;
            (_a = content.params) !== null && _a !== void 0 ? _a : (content.params = {});
            (_b = content.drawing) !== null && _b !== void 0 ? _b : (content.drawing = []);
            content.params.slot = "classic_slot";
            content.drawing.unshift({ type: "frame", x: 0, y: 0, width: 1000, height: 540, bitmap: "classic_frame_bg_light", scale: 2 });
            _this = _super.call(this, name, icon, content) || this;
            return _this;
        }
        return RecipeTypeForIEPE;
    }(api.RecipeType));

 var LiquidFuelRecipe = /** @class */ (function (_super) {
        __extends(LiquidFuelRecipe, _super);
        function LiquidFuelRecipe() {
            var _this = _super.call(this, "Liquid Fuel", ItemID.cellEmpty, {
                drawing: [
                    { type: "bitmap", x: 290, y: 140, scale: 8, bitmap: "furnace_burn" },
                    { type: "bitmap", x: 280, y: 260, scale: 8, bitmap: "classic_slot" }
                ],
                elements: {
                    inputLiq0: { x: 288, y: 268, width: 16 * 8, height: 16 * 8 },
                    text: { type: "text", x: 450, y: 320, font: { size: 40, color: Color.WHITE, shadow: 0.5 } }
                }
            }) || this;
            _this.setDescription("Fuel");
            _this.setTankLimit(100);
            return _this;
        }
        LiquidFuelRecipe.prototype.getAllList = function () {
            var list = [];
            var recipe = MachineRecipeLiquidRegistry.requireFluidRecipes("dieselGen");
            for (var liq in recipe) {
                list.push({
                    inputLiq: [{ liquid: liq, amount: recipe[liq].amount }],
                    power: recipe[liq].power
                });
            }
            return list;
        };
        LiquidFuelRecipe.prototype.onOpen = function (elements, recipe) {
            elements.get("text").setBinding("text", recipe.power + "RF / tick");
        };
        return LiquidFuelRecipe;
    }(RecipeTypeForIEPE));
    api.RecipeTypeRegistry.register("iepe_liquidFuel", new LiquidFuelRecipe());

});


// file: shared.js

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

