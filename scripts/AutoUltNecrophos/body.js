var interval = 0.1
var damage = [0.6, 0.75, 0.9]
var LenseBonusRange = 200
var rangeCast = 600
var StunDuration = 1.5

function AutoUltNecrophosF() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	var Ulti = Entities.GetAbilityByName(MyEnt, 'necrolyte_reapers_scythe')
	var UltiRange = Abilities.GetCastRangeFix(Ulti)
	
	var UltiLvl = Abilities.GetLevel(Ulti)
	var UltiCd = Abilities.GetCooldownTimeRemaining(Ulti)
	var UltiDmg = Abilities.GetAbilityDamage(Ulti)
	var UltiManaCost = Abilities.GetManaCost(Ulti)
	var DamagePerMissHP = damage[UltiLvl-1]
	
	if(UltiLvl==0 || UltiCd > 0 || UltiManaCost > Entities.GetMana(MyEnt))
		return
	
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && Entities.GetRangeToUnit(MyEnt, ent) <= UltiRange && !Entities.IsMagicImmune(ent)
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
		var dmg = (Entities.GetMaxHealth(ent) - Entities.GetHealth(ent)) * DamagePerMissHP
		var NeededDmg = Game.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent))
		
		if(NeededDmg <= dmg) {
			GameUI.SelectUnit(MyEnt,false)
			Game.CastTarget(MyEnt, Ulti, ent, false)
			return true
		} else {
			var Dagon = Fusion.GetDagon(MyEnt)
			if(Dagon !== undefined) {
				var DagonDamage = Fusion.GetDagonDamage(Dagon)
				if (
					Abilities.GetCooldownTimeRemaining(Dagon) === 0 &&
					NeededDmg <= (dmg + DagonDamage)
				) {
					GameUI.SelectUnit(MyEnt, false)
					Game.CastTarget(MyEnt, Dagon, ent, false)
					Game.EntStop(MyEnt, false)
				}
			}
		}
		return false
	})
}

var AutoUltNecrophosOnCheckBoxClick = function(){
	if (!AutoUltNecrophos.checked) {
		Fusion.Panels.AutoUltNecrophos.DeleteAsync(0)
		Game.ScriptLogMsg('Script disabled: AutoUltNecrophos', '#ff0000')
		return
	}
	if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) !== 'npc_dota_hero_necrolyte') {
		AutoUltNecrophos.checked = false
		Game.ScriptLogMsg('AutoUltNecrophos: Not Nercophos', '#ff0000')
		return
	}

	function f() {
		$.Schedule (
			interval,
			function() {
				AutoUltNecrophosF()
				if(AutoUltNecrophos.checked)
					f()
			}
		)
	}
	f()
	Game.ScriptLogMsg('Script enabled: AutoUltNecrophos', '#00ff00')
}

var AutoUltNecrophos = Game.AddScript("AutoUltNecrophos", AutoUltNecrophosOnCheckBoxClick)
