﻿var interval = Game.Tick
//-------------------
var ConcussiveShotDamage = [60, 120, 180, 240]
var ConcussiveShotRange = 1600
//-------------------

function TerrorBladeWTFConjureImageOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Entities.GetAllHeroEntities()
	
	ConjureImage(MyEnt, HEnts)
}

function ConjureImage(MyEnt, HEnts) {
	var Abil = Entities.GetAbility(MyEnt, 2 - 1)
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	//Game.EntStop(MyEnt)
	if(Abilities.GetToggleState(Abil) === false) {
		Game.CastNoTarget(MyEnt, Abil, false)
	}
}

function TerrorBladeWTFConjureImageOnToggle() {
	if (!TerrorBladeWTFConjureImage.checked)
		Game.ScriptLogMsg('Script disabled: TerrorBladeWTFConjureImage', '#ff0000')
	else {
		function intervalFunc(){
			$.Schedule(
				interval,
				function() {
					TerrorBladeWTFConjureImageOnInterval()
					if(TerrorBladeWTFConjureImage.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: TerrorBladeWTFConjureImage', '#00ff00')
	}
}

var TerrorBladeWTFConjureImage = Game.AddScript('TerrorBladeWTFConjureImage', TerrorBladeWTFConjureImageOnToggle)