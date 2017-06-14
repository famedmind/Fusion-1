﻿function AutoBottleOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	
	var Bottle = Game.GetAbilityByName(MyEnt, "item_bottle")
	if(Entities.IsInRangeOfFountain(MyEnt))
		Game.CastNoTarget(MyEnt, Bottle, false)
}

function AutoBottleOnToggle() {
	if (!AutoBottle.checked) {
		Game.ScriptLogMsg('Script disabled: AutoBottle', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				Fusion.MyTick,
				function() {
					AutoBottleOnInterval()
					if(AutoBottle.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: AutoBottle', '#00ff00')
	}
}

var AutoBottle = Game.AddScript('AutoBottle', AutoBottleOnToggle)