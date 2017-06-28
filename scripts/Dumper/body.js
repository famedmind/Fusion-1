function BindCommands() {
	Game.AddCommand('__DumpEnemyAbilities', Fusion.Commands.DumpEnemyAbilities, '', 0)
	Game.AddCommand('__StartModifierDebugging', Fusion.Commands.ModifierDebugging.Command, '', 0)
}

var ModifierDebuggingEnabled = false
Fusion.Commands.ModifierDebugging = []
Fusion.Commands.ModifierDebugging.Command = function() {
	if(ModifierDebuggingEnabled)
		return
	ModifierDebuggingEnabled = true
	Fusion.Commands.ModifierDebugging.Function()
}

var lastBuffs = []
Fusion.Commands.ModifierDebugging.Function = function() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var buffs = Game.GetBuffsNames(MyEnt)
	if(!Fusion.DeepEquals(lastBuffs, buffs)) {
		lastBuffs = buffs
		$.Msg(buffs)
	}
	$.Schedule(Fusion.MyTick, Fusion.Commands.ModifierDebugging.Function)
}

Fusion.Commands.DumpEnemyAbilities = function() {
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	})
	HEnts.map(function(ent) {
		var entName = Entities.GetUnitName(ent).replace("npc_dota_hero_", "")
		var available = []
		for(var i = 0; i < Entities.GetNumItemsInInventory(ent); i++) {
			var item = Entities.GetItemInSlot(ent, i)
			available.push(item)
		}
		for(var i = 0; i < Entities.GetAbilityCount(ent); i++) {
			var abil = Entities.GetAbility(ent, i)
			available.push(abil)
		}
		$.Msg(entName + ": {")
		available.map(function(abil) {
			var abilName = Abilities.GetAbilityName(abil)
			if(typeof abilName !== 'string' || abilName === '')
				return
			$.Msg("\t" + abilName + " {")
			$.Msg("\t\t" + "Level: " + Abilities.GetLevel(abil))
			$.Msg("\t\t" + "Cooldown: " + Math.ceil(Abilities.GetCooldownTimeRemaining(abil)))
			$.Msg("\t" + "}")
		})
		$.Msg("}")
	})
}

BindCommands()