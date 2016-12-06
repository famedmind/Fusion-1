var duration = 0.05
var castTime = 0.0
var interval = duration - castTime
//-------------------
var ConcussiveShotDamage = [60, 120, 180, 240]
var ConcussiveShotRange = 1600
//-------------------

function SkywrathMageWTFConcussiveShotOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
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

function SkywrathMageWTFConcussiveShotOnToggle() {
	if (!SkywrathMageWTFConcussiveShot.checked)
		Game.ScriptLogMsg('Script disabled: SkywrathMageWTFConcussiveShot', '#ff0000')
	else {
		function intervalFunc(){
			$.Schedule(
				interval,
				function() {
					SkywrathMageWTFConcussiveShotOnInterval()
					if(SkywrathMageWTFConcussiveShot.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: SkywrathMageWTFConcussiveShot', '#00ff00')
	}
}

var SkywrathMageWTFConcussiveShot = Game.AddScript('SkywrathMageWTFConcussiveShot', SkywrathMageWTFConcussiveShotOnToggle)