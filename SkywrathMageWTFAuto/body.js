var ConcussiveShotDamage = [60, 120, 180, 240]
var ConcussiveShotRange = 1600
var AncientSealRange = 700
var IgnoreBuffs = [
	"modifier_skywrath_mage_ancient_seal"
]


function SkywrathMageWTFAutoOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
	AncientSeal(MyEnt, HEnts)
	ConcussiveShot(MyEnt, HEnts)
}

function ConcussiveShot(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'skywrath_mage_concussive_shot')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	//Game.EntStop(MyEnt)
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsEnemy(ent))
			continue;
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > ConcussiveShotRange)
			continue
		
		Game.CastNoTarget(MyEnt, Abil, false)
	}
}

function AncientSeal(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'skywrath_mage_ancient_seal')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	//Game.EntStop(MyEnt)
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsEnemy(ent))
			continue;
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > ConcussiveShotRange)
			continue
		var buffsNames = Game.GetBuffsNames(ent)
		if(Game.IntersecArrays(buffsNames, IgnoreBuffs))
			return
		
		Game.CastTarget(MyEnt, Abil, ent, false)
	}
}

function SkywrathMageWTFAutoOnToggle() {
	if (!SkywrathMageWTFAuto.checked)
		Game.ScriptLogMsg('Script disabled: SkywrathMageWTFAuto', '#ff0000')
	else {
		function intervalFunc(){
			$.Schedule(
				Game.MyTick,
				function() {
					SkywrathMageWTFAutoOnInterval()
					if(SkywrathMageWTFAuto.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: SkywrathMageWTFAuto', '#00ff00')
	}
}

var SkywrathMageWTFAuto = Game.AddScript('SkywrathMageWTFAuto', SkywrathMageWTFAutoOnToggle)