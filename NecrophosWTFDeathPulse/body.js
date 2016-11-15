var duration = 0.05
var castTime = 0.0
var interval = duration - castTime
//-------------------
var DeathPulseHeal = [70, 90, 110, 130]
var DeathPulseDamage = [125, 175, 225, 275]
var DeathPulseMinHealPercent = 95
var DeathPulseAbilRange = 475
//-------------------

function NecrophosWTFDeathPulseOnInterval() {
	if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_necrolyte'){
		NecrophosWTFDeathPulse.checked = false
		Game.ScriptLogMsg('NecrophosWTFDeathPulse: Not Necrophos', '#cccccc')
		NecrophosWTFDeathPulseOnToggle()
		return
	}
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
	DeathPulse(MyEnt, HEnts)
}

function DeathPulse(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'necrolyte_death_pulse')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	var ToHeal = false
	
	//Game.EntStop(MyEnt)
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > DeathPulseAbilRange)
			continue
		if(!Entities.IsEnemy(ent) && Entities.GetHealthPercent(ent) > DeathPulseMinHealPercent)
			continue;
		
		ToHeal = true
		break
	}
	if(ToHeal === true)
		Game.CastNoTarget(MyEnt, Abil, false)
}

function NecrophosWTFDeathPulseOnToggle() {
	if (!NecrophosWTFDeathPulse.checked) {
		Game.ScriptLogMsg('Script disabled: NecrophosWTFDeathPulse', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				interval,
				function() {
					NecrophosWTFDeathPulseOnInterval()
					if(NecrophosWTFDeathPulse.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: NecrophosWTFDeathPulse', '#00ff00')
	}
}

var NecrophosWTFDeathPulse = Game.AddScript('NecrophosWTFDeathPulse', NecrophosWTFDeathPulseOnToggle)