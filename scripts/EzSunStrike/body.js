﻿var SunStrikeDamage = [ 100, 162, 225, 287, 350, 412, 475, 537 ]
var SunStrikeDelay = 1.7
var SunStrikeRadius = 175
function EzSunstrikeOnInterval() {
	MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var SunStrike = Game.GetAbilityByName(MyEnt, "invoker_sun_strike")
	var SunStrikeDamageCur = SunStrikeDamage[Abilities.GetLevel(Game.GetAbilityByName(MyEnt, "invoker_exort")) - 2 + (Entities.HasScepter(MyEnt) ? 1 : 0)]
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || Abilities.GetCooldownTimeRemaining(SunStrike) !== 0)
		return
	
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && (Entities.IsStunned(ent) || Entities.IsRooted(ent))
	}).sort(function(ent1, ent2) {
		var rng1 = Entities.GetHealth(ent1)
		var rng2 = Entities.GetHealth(ent2)
		
		if(rng1 === rng2)
			return 0
		if(rng1 > rng2)
			return 1
		else
			return -1
	})
	
	if(HEnts.length !== 0) {
		var ent = parseInt(HEnts[0])
		if(Entities.GetHealth(ent) <= SunStrikeDamageCur) {
			SunStrikeTime = Game.GetGameTime() + SunStrikeDelay
			SunStrikePos = Game.VelocityWaypoint(ent, SunStrikeDelay)
			//GameUI.SelectUnit(MyEnt, false)
			//Game.CastPosition(MyEnt, SunStrike, SunStrikePos, false)
			GameUI.PingMinimapAtLocation(SunStrikePos)
			$.Schedule(Fusion.MyTick, function() {
				var time = SunStrikeTime - Game.GetGameTime()
				if(time < 0)
					return
				var SunStrikePos2 = SunStrikePos = Game.VelocityWaypoint(ent, time)
				if(Game.PointDistance(SunStrikePos, SunStrikePos2) > SunStrikeRadius) {
					Game.EntStop(MyEnt, false)
					$.Msg("cancel. " + Game.PointDistance(SunStrikePos, SunStrikePos2))
				}
			})
		}
	}
}
	
function EzSunstrikeOnToggle() {
	if (!EzSunstrike.checked) {
		Game.ScriptLogMsg('Script disabled: EzSunstrike', '#ff0000')
	} else {
		function intervalFunc() {
			$.Schedule(
				Fusion.MyTick,
				function() {
					EzSunstrikeOnInterval()
					if(EzSunstrike.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: EzSunstrike', '#00ff00')
	}
}

var EzSunstrike = Game.AddScript("EzSunstrike", EzSunstrikeOnToggle)