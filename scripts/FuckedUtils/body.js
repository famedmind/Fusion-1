function BindCommands() {
	Game.AddCommand('__SetTimeoutForHost', function() {
		SetTimeoutForHost()
	}, '', 0)
	Game.AddCommand('__Set1TimeoutForHost', function() {
		Set1TimeoutForHost()
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

//function MapLoaded(data) {
	BindCommands()
//}

//GameEvents.Subscribe('game_newmap', MapLoaded)