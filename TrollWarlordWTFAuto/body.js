var QuillSprayRange = 625
var QuillSprayDamage = [20, 40, 60, 80]

function TrollWarlordWTFAutoOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	WhirlingAxes(MyEnt, HEnts)
	//BattleTrance(MyEnt, HEnts)
}

function WhirlingAxes(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'troll_warlord_whirling_axes_melee')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}

function BattleTrance(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'troll_warlord_battle_trance')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	
	Game.CastNoTarget(MyEnt, Abil, false)
}


function TrollWarlordWTFAuto() {
	if (!TrollWarlordWTFAuto.checked) {
		Game.ScriptLogMsg('Script disabled: TrollWarlordWTFAuto', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Game.MyTick,
				function() {
					TrollWarlordWTFAutoOnInterval()
					if(TrollWarlordWTFAuto.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: TrollWarlordWTFAuto', '#00ff00')
	}
}

var TrollWarlordWTFAuto = Game.AddScript('TrollWarlordWTFAuto', TrollWarlordWTFAuto)