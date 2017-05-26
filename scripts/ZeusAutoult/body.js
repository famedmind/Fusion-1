var damage = [225,325,425]
var scepterdamage = [440,540,640]
var manacost = [225,325,450]


function ZeusAutoultF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var Ulti = Entities.GetAbility(MyEnt, 3)
	var UltiLvl = Abilities.GetLevel(Ulti)
	
	if(UltiLvl === 0)
		return
	if (Abilities.GetCooldownTimeRemaining(Ulti) != 0 || Entities.GetMana(MyEnt)<manacost[UltiLvl-1])
		return
	
	if (!Entities.HasScepter(MyEnt))
		var UltiDmg = damage[UltiLvl-1]
	else
		var UltiDmg = scepterdamage[UltiLvl-1]
	
	var HEnts = Game.PlayersHeroEnts()
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if (!Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent))
			continue
		if(Game.GetMagicMultiplier(MyEnt, ent) === 0)
			continue
		
		if(Game.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= UltiDmg) {
			Game.CastNoTarget(MyEnt, Ulti)
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
				Game.MyTick,
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