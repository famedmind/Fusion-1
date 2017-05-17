function BindCommands() {
	Game.AddCommand('__Test', function(){
		LogFuncsOf(Math)
		LogFuncsOf($)
		LogFuncsOf(this)
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