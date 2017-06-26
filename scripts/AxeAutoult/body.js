var damage = [250, 325, 400]
function AxeUltiF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	})
	
	CullingBlade(MyEnt, HEnts)
}

function CullingBlade(MyEnt, HEnts) {
	var Ulti = Entities.GetAbilityByName(MyEnt, "axe_culling_blade")
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl === 0 || Abilities.GetCooldownTimeRemaining(Ulti) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Ulti))
		return
	var UltiDmg = damage[UltiLvl - 1]
	var UltiCastRange = Abilities.GetCastRangeFix(Ulti) + 75
	
	HEnts = HEnts.filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && Entities.GetRangeToUnit(MyEnt, ent) <= UltiCastRange && Entities.GetHealth(ent) <= UltiDmg
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
		if(Entities.HasItemInInventory(ent, 'item_sphere')) {
			var sphere = Game.GetAbilityByName(ent, 'item_sphere')

			if (Abilities.GetCooldownTimeRemaining(sphere) - 2 <= 0)
				return false
		}
		
		GameUI.SelectUnit(MyEnt, false)
		Game.CastTarget(MyEnt, Ulti, ent, false)
		return false
	})
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
			function f() {
				if(AxeUlti.checked)
					$.Schedule(Fusion.MyTick, function() {
						AxeUltiF()
						f()
					})
			}
			f()
			Game.ScriptLogMsg('Script enabled: AxeUlti', '#00ff00')
		}
	}
}

var AxeUlti = Game.AddScript("AxeAutoult", AxeUltiOnCheckBoxClick)