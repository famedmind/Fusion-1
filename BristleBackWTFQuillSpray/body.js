var duration = 0.05
var castTime = 0.0
var interval = duration - castTime
//-------------------
var QuillSprayRange = 625
var QuillSprayDamage = [20, 40, 60, 80]
//-------------------

function BristleBackWTFQuillSprayOnInterval() {
	if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_bristleback'){
		BristleBackWTFQuillSpray.checked = false
		Game.ScriptLogMsg('BristleBackWTFQuillSpray: Not BristleBack', '#cccccc')
		return
	}
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	QuillSpray(MyEnt, HEnts)
}

function QuillSpray(MyEnt, HEnts) {
	var Abil = Game.GetAbilityByName(MyEnt, 'bristleback_quill_spray')
	var AbilLvl = parseInt(Abilities.GetLevel(Abil))
	if(AbilLvl === 0)
		return
	
	//Game.EntStop(MyEnt)
	Game.CastNoTarget(MyEnt, Abil, false)
}

function BristleBackWTFQuillSprayOnToggle() {
	if (!BristleBackWTFQuillSpray.checked) {
		Game.ScriptLogMsg('Script disabled: BristleBackWTFQuillSpray', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				interval,
				function() {
					BristleBackWTFQuillSprayOnInterval()
					if(BristleBackWTFQuillSpray.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: BristleBackWTFQuillSpray', '#00ff00')
	}
}

var BristleBackWTFQuillSpray = Game.AddScript('BristleBackWTFQuillSpray', BristleBackWTFQuillSprayOnToggle)