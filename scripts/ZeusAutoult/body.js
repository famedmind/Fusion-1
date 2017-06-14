var damage = [225,325,425]

function ZeusAutoultF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbilityByName(MyEnt, "zuus_thundergods_wrath")
	var UltiLvl = Abilities.GetLevel(Ulti)
	var UltiDmg = damage[UltiLvl-1]
	
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	
	var HEnts = Game.PlayersHeroEnts()
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if (!Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent))
			continue
		if(Game.GetMagicMultiplier(MyEnt, ent) === 0)
			continue
		
		if(Game.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= UltiDmg) {
			Game.CastNoTarget(MyEnt, Ulti, false)
			return
		}
	}
}

var ZeusAutoultOnCheckBoxClick = function(){
	if (!ZeusAutoult.checked){
		Game.ScriptLogMsg('Script disabled: ZeusAutoult', '#ff0000')
		return
	} else {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_zuus'){
			ZeusAutoult.checked = false
			Game.ScriptLogMsg('ZeusAutoult: Not Zeus', '#ff0000')
			return
		}
		function f() {
			$.Schedule (
				Fusion.MyTick,
				function() {
					ZeusAutoultF()
					if(ZeusAutoult.checked)
						f()
				}
			)
		}
		f()
		Game.ScriptLogMsg('Script enabled: ZeusAutoult', '#00ff00')
	}
}

var ZeusAutoult = Game.AddScript('ZeusAutoult', ZeusAutoultOnCheckBoxClick)