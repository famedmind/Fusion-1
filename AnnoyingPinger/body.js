function AnnoyingPingerOnInterval() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var HEnts = Game.PlayersHeroEnts()
	
	GameUI.PingMinimapAtLocation(Entities.GetAbsOrigin(MyEnt))
	Pings(HEnts)
}

function Pings(HEnts) {
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(Entities.IsEnemy(ent))
			continue
		
		GameUI.PingMinimapAtLocation(Entities.GetAbsOrigin(ent))
	}
}

function AnnoyingPingerOnToggle() {
	if (!AnnoyingPinger.checked) {
		Game.ScriptLogMsg('Script disabled: AnnoyingPinger', '#ff0000')
	} else {
		function intervalFunc(){
			$.Schedule(
				0.02,
				function() {
					AnnoyingPingerOnInterval()
					if(AnnoyingPinger.checked)
						intervalFunc()
				}
			)
		}
		intervalFunc()
		Game.ScriptLogMsg('Script enabled: AnnoyingPinger', '#00ff00')
	}
}

var AnnoyingPinger = Game.AddScript('AnnoyingPinger', AnnoyingPingerOnToggle)