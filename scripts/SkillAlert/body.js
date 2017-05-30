var modifiers = [
	["modifier_invoker_sun_strike", 1.7],
	["modifier_kunkka_torrent_thinker", 1.6],
	["modifier_lina_light_strike_array", 0.5],
	["modifier_leshrac_split_earth_thinker", 0.35],
	["modifier_spirit_breaker_charge_of_darkness_vision", 1.5],
	["modifier_tusk_snowball_visible", 1.5]
]
var alertModifiers = [
	"modifier_spirit_breaker_charge_of_darkness_vision",
	"modifier_tusk_snowball_visible"
]
var alertParticle = "particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge_target_mark.vpcf"

var z = []

function SAlertEvery(){
	if (!SkillAlert.checked)
		return
	
	Entities.GetAllEntitiesByName('npc_dota_thinker').map(function(ent) {
		var xyz = Entities.GetAbsOrigin(ent)
		var buffsnames = Game.GetBuffsNames(ent)
		if(buffsnames.length !== 1)
			return
		CreateTimerParticle(xyz, modifiers[i][1])	
	})
	
	Entities.GetAllEntities().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsEnemy(ent))
	}).map(function(ent) {
		var buffs = Game.GetBuffsNames(ent)
		var xyz = Entities.GetAbsOrigin(ent)
		
		for(var buff of buffs)
			for(var modifier of modifiers)
				if(modifier[0] === buff)
					if(Game.IntersecArrays(alertModifiers, [modifier[0]]))
						CreateFollowParticle(modifier[1], alertParticle, ent)
					else
						CreateTimerParticle(xyz, modifier[1])
	})
}

function CreateFollowParticle(time, particlepath, someobj, ent) {
	if(z.indexOf(ent) !== -1)
		return
	var p = Particles.CreateParticle(particlepath, ParticleAttachment_t.PATTACH_OVERHEAD_FOLLOW, someobj)
	Particles.SetParticleControl(p, 0, 0)
	z.push(ent)
	$.Schedule (
		time + 0.1,
		function() {
			Particles.DestroyParticleEffect(p,p)
			z.splice(z.indexOf(ent), 1)
		}
	)
}

function CreateTimerParticle(xyz, time, ent) {
	if(z.indexOf(ent) !== -1)
		return
	var p = Particles.CreateParticle("particles/neutral_fx/roshan_spawn.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN, 0)
	Particles.SetParticleControl(p, 0, xyz)
	z.push(ent)
	$.Schedule (
		time + Game.Tick,
		function() {
			Particles.DestroyParticleEffect(p,p)
			z.splice(z.indexOf(ent), 1)
		}
	)
}

function SkillAlertChkBox() {
	if (!SkillAlert.checked)
		Game.ScriptLogMsg('Деактивирован: SkillAlert', '#ff0000')
	else {
		function f() {
			$.Schedule (
				Game.Tick,
				function(){
					if(SkillAlert.checked)
						SAlertEvery()
					f()
				}
			)
		}
		f()
		Game.ScriptLogMsg('Активирован: SkillAlert', '#00ff00')
	}
}

var SkillAlert = Game.AddScript("SkillAlert", SkillAlertChkBox)