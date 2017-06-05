var damage = [250, 325, 400]
function AxeUltiF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var Ulti = Entities.GetAbilityByName(MyEnt, "axe_culling_blade")
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	var UltiDmg = damage[UltiLvl - 1]
	var UltiCastRange = Abilities.GetCastRangeFix(Ulti) + 75
	
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && Entities.GetRangeToUnit(MyEnt, ent) <= UltiCastRange
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
	
	HEnts.some(function(ent) {
		var ent = parseInt(HEnts[0])
		if(Entities.GetHealth(ent) <= UltiDmg) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Ulti, ent, false)
			return true
		}
		return false
	})
	
	if(AxeUlti.checked)
		$.Schedule(Game.MyTick, AxeUltiF)
}
var AxeUltiOnCheckBoxClick = function(){
	if (!AxeUlti.checked) {
		Game.ScriptLogMsg('Script disabled: AxeUlti', '#ff0000')
		return
	} else {
		if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_axe') {
			AxeUlti.checked = false
			AxeUltiOnCheckBoxClick()
			return
		} else {
			AxeUltiF()
			Game.ScriptLogMsg('Script enabled: AxeUlti', '#00ff00')
		}
	}
}

var AxeUlti = Game.AddScript("AxeAutoult", AxeUltiOnCheckBoxClick)