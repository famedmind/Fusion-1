var positionModifiers = [
	["modifier_invoker_sun_strike", 1.7],
	["modifier_kunkka_torrent_thinker", 1.6],
	["modifier_lina_light_strike_array", 0.5],
	["modifier_leshrac_split_earth_thinker", 0.35]
]
var targetModifiers = [
	["modifier_spirit_breaker_charge_of_darkness_vision", 1.5, "particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge_target_mark.vpcf"],
	["modifier_tusk_snowball_visible", 1.5, "particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge_target_mark.vpcf"/*"particles/econ/items/crystal_maiden/ti7_immortal_shoulder/cm_ti7_immortal_base_attack_snowball.vpcf"*/]
]
var z = []

function SAlertEvery(){
	if (!SkillAlert.checked)
		return
	
	Entities.GetAllEntitiesByName('npc_dota_thinker').map(function(ent) {
		var vec = Entities.GetAbsOrigin(ent)
		var buffsnames = Game.GetBuffsNames(ent)
		if(buffsnames.length !== 2)
			return
		positionModifiers.map(function(ar) {
			var name = ar[0]
			var duration = ar[1]
			$.Msg(vec)
			if(name === buffsnames[1])
				CreateTimerParticle(vec, duration, ent)
		})
	})
	
	Entities.GetAllEntities().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsEnemy(ent))
	}).map(function(ent) {
		var buffs = Game.GetBuffsNames(ent)
		var xyz = Entities.GetAbsOrigin(ent)
		
		for(var buff of buffs)
			for(var modifier of targetModifiers)
				if(buff === modifier[0]) {
					CreateFollowParticle(modifier[1], modifier[2], ent)
					break
				}
	})
}

function CreateFollowParticle(time, particlepath, ent) {
	if(z.indexOf(ent) !== -1)
		return
	var p = Particles.CreateParticle(particlepath, ParticleAttachment_t.PATTACH_OVERHEAD_FOLLOW, ent)
	Particles.SetParticleControl(p, 0, 0)
	z.push(ent)
	$.Schedule (
		time + Game.MyTick,
		function() {
			Particles.DestroyParticleEffect(p,p)
			z.splice(z.indexOf(ent), 1)
		}
	)
}

function CreateTimerParticle(vec, time, ent) {
	if(z.indexOf(ent) !== -1)
		return
	var p = Particles.CreateParticle("particles/neutral_fx/roshan_spawn.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN, 0)
	Particles.SetParticleControl(p, 0, vec)
	z.push(ent)
	$.Schedule (
		time + Game.MyTick,
		function() {
			Particles.DestroyParticleEffect(p,p)
			z.splice(z.indexOf(ent), 1)
		}
	)
}

function SkillAlertToggle() {
	if (!SkillAlert.checked)
		Game.ScriptLogMsg('Script disabled: SkillAlert', '#ff0000')
	else {
		function f() {
			$.Schedule (
				Game.MyTick,
				function(){
					if(SkillAlert.checked)
						SAlertEvery()
					f()
				}
			)
		}
		f()
		Game.ScriptLogMsg('Script enabled: SkillAlert', '#00ff00')
	}
}

var SkillAlert = Game.AddScript("SkillAlert", SkillAlertToggle)