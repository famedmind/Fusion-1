var BSName = "item_bloodstone"
var AegisName = "item_aegis"

function AutoDenyOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || !Entities.HasItemInInventory(MyEnt, BSName) || Entities.HasItemInInventory(MyEnt, AegisName) || Entities.GetHealthPercent(MyEnt) > 9)
		return
	
	var item = -1;
	for(i = 0; i < 6; i++) {
		var item2 = Entities.GetItemInSlot(MyEnt, i)
		var item2Name = Abilities.GetAbilityName(item2)
		if(item2Name === BSName) {
			var item = item2;
			break;
		}
	}
	if(item == -1)
		return;
	Game.CastPosition(MyEnt, item, Entities.GetAbsOrigin(MyEnt), false)
}

function AutoDenyOnToggle() {
	if (!AutoDeny.checked) {
		Game.ScriptLogMsg('Script disabled: AutoDeny', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				0.26,
				function() {
					AutoDenyOnInterval()
					if(AutoDeny.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: AutoDeny', '#00ff00')
	}
}

var AutoDeny = Game.AddScript('AutoDeny', AutoDenyOnToggle)