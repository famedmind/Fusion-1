var feeder = false

function AntiAFKOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	GameUI.SelectUnit(MyEnt, false)
	AFK(MyEnt, HEnts)
}

function AFK(MyEnt, HEnts) {
	var minDistance = 66666
	var lastMin
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent))
			continue
		if(Entities.IsEnemy(ent))
			continue
		if(ent === MyEnt)
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) < minDistance) {
			var minDistance = Entities.GetRangeToUnit(MyEnt, ent)
			var lastMin = ent
		}
	}
	
	if(feeder)
		Game.MoveToAttackPos(MyEnt, Entities.GetAbsOrigin(lastMin), false)
	else
		Game.MoveToPos(MyEnt, Entities.GetAbsOrigin(lastMin), false)
}

function AntiAFKOnToggle() {
	if (!AntiAFK.checked) {
		Game.ScriptLogMsg('Script disabled: AntiAFK', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Game.MyTick,
				function() {
					AntiAFKOnInterval()
					if(AntiAFK.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: AntiAFK', '#00ff00')
	}
}

var AntiAFK = Game.AddScript('AntiAFK', AntiAFKOnToggle)