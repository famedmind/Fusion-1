function BindCommands() {
	Game.AddCommand('__Test', function(){
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		Game.Ping(MyEnt, Entities.GetAbsOrigin(MyEnt), false)
	}, '', 0)
}

function LogFuncsOf(Obj) {
	$.Msg(Object.getOwnPropertyNames(Obj).filter(function (p) {
		return typeof Obj[p] === 'function';
	}))
}

function MapLoaded(data) {
	BindCommands()
}

GameEvents.Subscribe('game_newmap', MapLoaded)