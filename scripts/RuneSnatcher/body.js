var RuneRadius = 150

var SnatcherF = function(){
	if(Game.IsGamePaused())
		return
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	var EntsOnCursor = GameUI.FindScreenEntities(GameUI.GetCursorPosition())
	var myVec = Entities.GetAbsOrigin(MyEnt)
	EntsOnCursor.forEach(function(entObj) {
		var Rune = entObj.entityIndex
		if(Game.PointDistance(Entities.GetAbsOrigin(Rune), myVec) > RuneRadius)
			Game.PuckupRune(MyEnt, entObj.entityIndex, false)
	})
}

function SnatcherOnOff() {
	if (!Snatcher.checked) {
		Game.ScriptLogMsg('Script disabled: Rune Snatcher', '#ff0000')
		return
	} else {
		function L() {
			if (Snatcher.checked) {
				SnatcherF()
				$.Schedule(Game.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg('Script enabled: Rune Snatcher', '#00ff00')
	}
}

var Snatcher = Game.AddScript("RuneSnatcher", SnatcherOnOff)