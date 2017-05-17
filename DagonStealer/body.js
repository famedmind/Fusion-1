var DagonNames = ["item_dagon", "item_dagon_2", "item_dagon_3", "item_dagon_4", "item_dagon_5"]
var DagonDamage = [400, 500, 600, 700, 800]

function DagonStealerOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts()
	
	AutoDagon(MyEnt, HEnts)
}

function AutoDagon(MyEnt, HEnts) {
	var Dagon = GetDagon(MyEnt)
	var DagonRange = Abilities.GetCastRangeFix(Dagon)
	var DagonDamage = GetDagonDamage(Dagon)
	
	if(Abilities.GetCooldownTimeRemaining(Dagon) != 0)
		return
	
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(!Entities.IsAlive(ent))
			continue
		if(Entities.GetRangeToUnit(MyEnt, ent) > DagonRange)
			continue
		if(!Entities.IsEnemy(ent))
			continue
		
		var MagicResist = Entities.GetBaseMagicalResistanceValue(ent)
		var DagonDamage2 = DagonDamage - (DagonDamage / 100 * MagicResist)
		
		if(Entities.GetHealth(ent) <= DagonDamage2)
			Game.CastTarget(MyEnt, Dagon, ent, false)
	}
}

function GetDagon(MyEnt) {
	for(i = 0; i < 6; i++) {
		var item = Entities.GetFirstItem(MyEnt, DagonNames[n])
		if(item !== -1)
			return item
	}
	
	return -1
}

function GetDagonDamage(dagon) {
	var DagonLvl = Abilities.GetLevel(dagon)
	
	return DagonDamage[DagonLvl - 1]
}

function DagonStealerOnToggle() {
	if (!DagonStealer.checked) {
		Game.ScriptLogMsg('Script disabled: DagonStealer', '#ff0000')
		for(i = 0; i < 6; i++) {
			var item2 = Entities.GetItemInSlot(MyEnt, i)
			var item2Name = Abilities.GetAbilityName(item2)
			Game.ScriptLogMsg(item2Name, '#0000ff')
		}
	} else {
		function intervalFunc(){
			$.Schedule(
				Game.MyTick * 3,
				function() {
					DagonStealerOnInterval()
					if(DagonStealer.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: DagonStealer', '#00ff00')
	}
}

var DagonStealer = Game.AddScript('DagonStealer', DagonStealerOnToggle)