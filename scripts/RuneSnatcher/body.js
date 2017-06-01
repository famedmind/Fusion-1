var RuneRadius = 150

var SnatcherF = function() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var EntsOnCursor = GameUI.FindScreenEntities(GameUI.GetCursorPosition())
	var myVec = Entities.GetAbsOrigin(MyEnt)
	EntsOnCursor.forEach(function(entObj) {
		var Rune = entObj.entityIndex
		var RuneName = Entities.GetUnitName(Rune)
		if(RuneName === "" && !Entities.IsBuilding(Rune) && Game.PointDistance(Entities.GetAbsOrigin(Rune), myVec) > RuneRadius) {
			Game.PuckupRune(MyEnt, Rune, false) // Rune
			Game.PickupItem(MyEnt, Rune, false) // Aegis
		}
	})
}

function SnatcherToggle() {
	if (!Snatcher.checked) {
		Game.ScriptLogMsg('Script disabled: Snatcher', '#ff0000')
		return
	} else {
		function L() {
			if (Snatcher.checked) {
				SnatcherF()
				$.Schedule(Game.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg('Script enabled: Snatcher', '#00ff00')
	}
}

var Snatcher = Game.AddScript("Snatcher", SnatcherToggle)