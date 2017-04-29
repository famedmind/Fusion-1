var BSName = "item_bloodstone"

function AutoBloodstoneOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt) || !Entities.HasItemInInventory(MyEnt, BSName) || Entities.GetHealthPercent(MyEnt) > 9)
		return
	
	var item = -1;
	for(i = 0; i < 6; i++) {
		var item2 = Entities.GetItemInSlot(MyEnt, i)
		if(Abilities.GetAbilityName(item2) === BSName) {
			var item = item2;
		}
	}
	if(item == -1)
		return;
	Game.CastPosition(MyEnt, item, Entities.GetAbsOrigin(MyEnt), false)
}

function AutoBloodstoneOnToggle() {
	if (!AutoBloodstone.checked) {
		Game.ScriptLogMsg('Script disabled: AutoBloodstone', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				0.26,
				function() {
					AutoBloodstoneOnInterval()
					if(AutoBloodstone.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: AutoBloodstone', '#00ff00')
	}
}

var AutoBloodstone = Game.AddScript('AutoBloodstone', AutoBloodstoneOnToggle)