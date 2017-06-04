var ExpRanged = 1300
var DaggerRanged = 1200

function DestroyParticles() {
	try {
		Particles.DestroyParticleEffect(Game.Particles.ExpRange, Game.Particles.ExpRange)
		Particles.DestroyParticleEffect(Game.Particles.DaggerRange, Game.Particles.DaggerRange)
	} catch(e) {  }
}

function ExpRangeEnable() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Game.Particles.ExpRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Game.Particles.DaggerRange = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, MyEnt)
	Particles.SetParticleControl(Game.Particles.ExpRange, 1, [ExpRanged, 0, 0])
	Particles.SetParticleControl(Game.Particles.DaggerRange, 1, [DaggerRanged, 0, 0])
}

function exprangeOnOff(){
	if (!ExpRange.checked) {
		DestroyParticles()
		Game.ScriptLogMsg('Script disabled: ExpRange', '#ff0000')
	} else {
		ExpRangeEnable()
		Game.ScriptLogMsg('Script enabled: ExpRange', '#00ff00')
	}
}

var ExpRange = Game.AddScript('ExpRange', exprangeOnOff)
DestroyParticles()