var Range = 100

var RoshanAegisPlaceLoad = function(){
	var Ents = Entities.GetAllEntities()
	try {
		for(var i in Game.Particles.RoshanAegisPlace)
			Particles.DestroyParticleEffect(Game.Particles.RoshanAegisPlace[i], Game.Particles.RoshanAegisPlace[i])
	} catch(e) {
		
	}
	for (var i in Ents) {
		var ent = parseInt(Ents[i])
		
		if(!Entities.IsRoshan(ent))
			continue
		
		Game.Particles.RoshanAegisPlace.push(Particles.CreateParticle("particles/neutral_fx/roshan_timer_rays.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent))
	}
	
	for(var i in Game.Particles.RoshanAegisPlace)
		Particles.SetParticleControl(Game.Particles.RoshanAegisPlace[i], 1, [Range, 0, 0])
}

function RoshanAegisPlaceOnOff(){
	if ( !RoshanAegisPlace.checked ){
		try {
			for(var i in Game.Particles.RoshanAegisPlace)
				Particles.DestroyParticleEffect(Game.Particles.RoshanAegisPlace[i], Game.Particles.RoshanAegisPlace[i])
		} catch(e) {
			
		}
		Game.ScriptLogMsg('Script disabled: RoshanAegisPlace', '#ff0000')
		
	}else{
		RoshanAegisPlaceLoad()
		Game.ScriptLogMsg('Script enabled: RoshanAegisPlace', '#00ff00')
	}
}

Game.Particles.RoshanAegisPlace = []
var RoshanAegisPlace = Game.AddScript('RoshanAegisPlace', RoshanAegisPlaceOnOff)