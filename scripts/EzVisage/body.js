var playerID = Game.GetLocalPlayerID()
Fusion.FamiliarBaseClass = "npc_dota_visage_familiar"
var GetFamiliars = function() {
	return Entities.GetAllEntitiesByClassname(Fusion.FamiliarBaseClass).map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !Entities.IsBuilding(ent) && !Entities.IsEnemy(ent) && !Entities.IsStunned(ent) && Entities.IsControllableByPlayer(ent, playerID) && !Entities.IsIllusion(ent)
	})
}

var EzVisageF = function() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	Familiars()
	Souls(MyEnt)
}

var HealBarrierPercent = 50
var Familiars = function() {
	GetFamiliars().forEach(function(ent) {
		//if(Buffs.GetStackCount(MyEnt, Fusion.GetBuffByName(ent, "modifier_visage_summon_familiars_damage_charge")) === 0)
		var StoneForm = Entities.GetAbilityByName(ent, "visage_summon_familiars_stone_form")
		if(Entities.GetHealthPercent(ent) <= HealBarrierPercent && Abilities.GetCooldownTimeRemaining(StoneForm) === 0) {
			GameUI.SelectUnit(ent, false)
			Game.CastNoTarget(ent, StoneForm, false)
		}
	})
}
var Souls = function(MyEnt) {
	var Abil = Entities.GetAbilityByName(MyEnt, "visage_soul_assumption")
	if(Abilities.GetLevel(Abil) === 0 || Abilities.GetCooldownTimeRemaining(Abil) !== 0 || Entities.GetMana(MyEnt) < Abilities.GetManaCost(Abil))
		return
	var AbilRange = Abilities.GetCastRangeFix(Abil)
	var AbilCastPoint = Abilities.GetCastPoint(Abil)
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent) && Entities.GetRangeToUnit(ent, MyEnt) <= AbilRange
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
	
	var SoulDamage = 20 + 65 * Buffs.GetStackCount(MyEnt, Fusion.GetBuffByName(MyEnt, "modifier_visage_soul_assumption"))
	HEnts.some(function(ent) {
		if(Fusion.HasLinkenAtTime(ent, AbilCastPoint) || Fusion.GetMagicMultiplier(MyEnt, ent) === 0)
			return false
		if(Fusion.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent)) <= SoulDamage) {
			GameUI.SelectUnit(MyEnt, false)
			Game.CastTarget(MyEnt, Abil, ent, false)
			return true
		}
	})
}

var EzVisageOnCheckBoxClick = function() {
	if (!EzVisage.checked) {
		Game.ScriptLogMsg('Script disabled: EzVisage', '#ff0000')
		return
	} else {
		function f() {
			if(EzVisage.checked)
				$.Schedule(Fusion.MyTick, function() {
					EzVisageF()
					f()
				})
		}
		f()
		Game.ScriptLogMsg('Script enabled: EzVisage', '#00ff00')
	}
}
var EzVisage = Game.AddScript("EzVisage", EzVisageOnCheckBoxClick)