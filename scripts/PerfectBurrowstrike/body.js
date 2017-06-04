var PerfectBurrowstrikeOnCheckBoxClick = function(){
	if ( PerfectBurrowstrike.checked ){
		GameUI.SetMouseCallback( function(eventName,arg){
			var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
			var Abil = Game.GetAbilityByName(MyEnt, 'sandking_burrowstrike')
			var AbilLvl = parseInt(Abilities.GetLevel(Abil))
			if(AbilLvl === 0)
				return
			var AbilCast = Abilities.GetCastRangeFix(Abil)
			if (/*GameUI.GetClickBehaviors()!==3 ||*/ Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_sand_king')
				return false
			if ( eventName == "pressed" ) {
				if (arg === 0) {
					var myent = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
					var xyz = Entities.GetAbsOrigin(myent)
					var xyz2 = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())
					var vec = [xyz2[0]-xyz[0], xyz2[1]-xyz[1], xyz2[2]-xyz[2]]
					var range = Math.sqrt(Math.pow(vec[0],2)+Math.pow(vec[1],2)+Math.pow(vec[2],2))
					if(range <= AbilCast)
						return false
					var evec = [vec[0]/range, vec[1]/range, vec[2]/range]
					Game.CastPosition(myent, Abil, [xyz[0]+evec[0] * AbilCast, xyz[1]+evec[1] * AbilCast, xyz[2]+evec[2] * AbilCast], false)
					return true
				}
				if (arg === 1)
					return false
			}
			return false
		})
		Game.ScriptLogMsg('Script enabled: PerfectBurrowstrike', '#00ff00')
		return
	}
	GameUI.SetMouseCallback( function(){})
	Game.ScriptLogMsg('Script disabled: PerfectBurrowstrike', '#ff0000')
}
// dota_player_used_ability https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools:ru/Scripting:ru/Built-In_Engine_Events

var PerfectBurrowstrike = Game.AddScript('PerfectBurrowstrike', PerfectBurrowstrikeOnCheckBoxClick)