//Показывает начало каста скилов
//Пока что 100% показывает следующие скилы: стан лины, санстрайк, стан лешрака, торрент кунки

for ( var i in Game.Particles.skillalert_garbage )
	try{ Particles.DestroyParticleEffect(Game.Particles.skillalert_garbage[i],Game.Particles.skillalert_garbage[i]) }catch(e){}
try{ GameEvents.Unsubscribe( parseInt( Game.Subscribes.SkillAlert ) )  }catch(e){}
Game.Particles.skillalert_garbage=[]

function MapLoaded(){
	try{ GameEvents.Unsubscribe( Game.Subscribes.SkillAlert ) }catch(e){}
	Game.Particles.skillalert_garbage = []
}
	
function find(array, value){
	for (var i = 0; i < array.length; i++) {
	  if (array[i] == value) return i;
	}
	return -1;
}

SAllertEvery = function(){
	thinkers = Entities.GetAllEntitiesByName('npc_dota_thinker')
	for ( var m in thinkers){
		EntityIndex = thinkers[m]
		Abs = Entities.GetAbsOrigin( EntityIndex )
		if ( !Abs ){
			if ( Game.Particles.skillalert_garbage[ EntityIndex ] ){
				try{ Particles.DestroyParticleEffect( Game.Particles.skillalert_garbage[ EntityIndex ], Game.Particles.skillalert_garbage[ EntityIndex ] ) }catch(e){}
				delete Game.Particles.skillalert_garbage[ EntityIndex ]
			}
			continue
		}
		if ( !Game.Particles.skillalert_garbage[ EntityIndex ] ){
			Game.Particles.skillalert_garbage[ EntityIndex  ] = Particles.CreateParticle("particles/neutral_fx/roshan_spawn.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN, 0)
		}
		Particles.SetParticleControl(Game.Particles.skillalert_garbage[ EntityIndex ], 0, Abs) 
	}
	for ( var i in Game.Particles.skillalert_garbage ){
		if ( find(thinkers,i) == -1 ){
			try{ Particles.DestroyParticleEffect(Game.Particles.skillalert_garbage[i],Game.Particles.skillalert_garbage[i]) }catch(e){}
			delete Game.Particles.skillalert_garbage[i]
		}
	}
}

function OnOff(){
	if ( !SkillAlert.checked ){
		Game.DTick(SAllertEvery)
		Game.ScriptLogMsg('Script disabled: SkillAlert', '#ff0000')
		for ( var i in Game.Particles.skillalert_garbage )
			try{ Particles.DestroyParticleEffect(Game.Particles.skillalert_garbage[i],Game.Particles.skillalert_garbage[i]) }catch(e){}
		try{ GameEvents.Unsubscribe( Game.Subscribes.SkillAlert ) }catch(e){}
		Game.Particles.skillalert_garbage = []
	}else{
		Game.Tick(SAllertEvery)
		Game.ScriptLogMsg('Script enabled: SkillAlert', '#00ff00')
		Game.Subscribes.SkillAlert = GameEvents.Subscribe('game_newmap', MapLoaded)
	}
}

var SkillAlert = Game.AddScript('SkillAlert', OnOff)