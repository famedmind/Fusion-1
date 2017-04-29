function BindCommands() {
	Game.AddCommand('__SetTimeoutForHost', function() {
		SetTimeoutForHost()
	}, '', 0)
	Game.AddCommand('__Set1TimeoutForHost', function() {
		Set1TimeoutForHost()
	}, '', 0)
	
	Game.AddCommand('__Angel_Fuck', function() {
		for(var i = 0; i < 100; i++)
			Pick()
		GameEvents.SendEventClientSide('antiaddiction_toast', {"message":"Success", "duration":"3"})
	}, '', 0)
	
	Game.AddCommand('__Angel_Pick', function() {
		Pick()
		GameEvents.SendEventClientSide('antiaddiction_toast', {"message":"Success", "duration":"3"})
	}, '', 0)
	
	Game.AddCommand('__Angel_TPTest', function() {
		GameEvents.SendCustomGameEventToServer (
			"tp_menu_button_pressed",
			{		
				playerID: Game.GetLocalPlayerID(),
				playerBt: 1 // From 1 up to 12
			}
		)
	}, '', 0)
}

function SetTimeoutForHost() { //Host-troll
	Game.SetAutoLaunchEnabled(false)
	Game.SetAutoLaunchEnabled(true)
	Game.SetAutoLaunchDelay(1500000000000)
	Game.SetRemainingSetupTime(400000000000000) 
}

function Set1TimeoutForHost() { //Host-antitroll
	Game.SetAutoLaunchEnabled(false)
	Game.SetAutoLaunchEnabled(true)
	Game.SetAutoLaunchDelay(1)
	Game.SetRemainingSetupTime(1) 
}

function Pick() {
	var data = {
		playerID: Game.GetLocalPlayerID(),
		hero	: "npc_dota_hero_techies"
	}
	GameEvents.SendCustomGameEventToServer("pick_menu_onpick", data)
}

function MapLoaded(data) {
	BindCommands()
}

GameEvents.Subscribe('game_newmap', MapLoaded)