var duration = 5
var castTime = 0.5
var interval = duration - castTime
//-------------------
var ShadowGraveRanges = [0, 550, 700, 850, 1000]
//-------------------

function DazzleWTFGraveOnInterval() {
	if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_dazzle'){
		DazzleWTFGrave.checked = false
		Game.ScriptLogMsg('DazzleWTFGrave: Not Dazzle', '#cccccc')
		return
	}
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	ShadowGrave(MyEnt, HEnts)
}

function ShadowGrave(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'dazzle_shallow_grave')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	var AbilRange = ShadowGraveRanges[AbilLvl]
	
	//Game.EntStop(MyEnt)
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if(Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > AbilRange)
			continue
		var buffsNames = Game.GetBuffsNames(ent)
		if(Game.IntersecArrays(buffsNames, ["modifier_dazzle_shallow_grave"]))
			continue
		
		Game.CastTarget(MyEnt, Abil, ent, false)
	}
}

function DazzleWTFGraveOnToggle() {
	if (!DazzleWTFGrave.checked) {
		Game.ScriptLogMsg('Script disabled: DazzleWTFGrave', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				interval,
				function() {
					DazzleWTFGraveOnInterval()
					if(DazzleWTFGrave.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: DazzleWTFGrave', '#00ff00')
	}
}

var DazzleWTFGrave = Game.AddScript('DazzleWTFGrave', DazzleWTFGraveOnToggle)