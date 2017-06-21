var MeepoName = 'npc_dota_hero_meepo'

function PoofAllMeeposToMeepo(playerID, To, WithCheck, Queue) {
	var HEnts = Entities.GetAllEntitiesByClassname(MeepoName).map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !Entities.IsBuilding(ent) && !Entities.IsEnemy(ent) && !Entities.IsStunned(ent) && !(WithCheck && ent === To) && Entities.IsControllableByPlayer(ent, playerID) && !Entities.IsIllusion(ent)
	}).forEach(function(ent) {
		var Abil = Game.GetAbilityByName(ent, 'meepo_poof')
		GameUI.SelectUnit(ent, false)
		Game.EntStop(ent, false)
		Game.CastTarget(ent, Abil, To, Queue)
	})
}

function PoofAllMeeposToPos(playerID, To, Queue) {
	var HEnts = Entities.GetAllEntitiesByClassname(MeepoName).map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !Entities.IsBuilding(ent) && !Entities.IsEnemy(ent) && !Entities.IsStunned(ent) && !(WithCheck && ent === To) && Entities.IsControllableByPlayer(ent, playerID) && !Entities.IsIllusion(ent)
	}).forEach(function(ent) {
		var Abil = Game.GetAbilityByName(ent, 'meepo_poof')
		GameUI.SelectUnit(ent, false)
		Game.CastPosition(ent, Abil, To, Queue)
	})
}

function MeepoAutoPoof(flag, WithCheck) {
	var playerID = Game.GetLocalPlayerID()
	
	if (Players.GetPlayerSelectedHero(playerID) != MeepoName){
		Game.ScriptLogMsg('MeepoAutoPoof: Not Meepo', '#cccccc')
		return
	}
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
	if(flag === 0) {
		var SelectedEnt = Players.GetLocalPlayerPortraitUnit()
		PoofAllMeeposToMeepo(playerID, SelectedEnt, WithCheck)
		GameUI.SelectUnit(SelectedEnt, false)
		return
	}
	if(flag === 1) {
		var EntsOnCursor = GameUI.FindScreenEntities(GameUI.GetCursorPosition())
		if(EntsOnCursor.length != 0)
			PoofAllMeeposToMeepo(playerID, EntsOnCursor[0].entityIndex, WithCheck)
		else
			Game.ScriptLogMsg('MeepoAutoPoof: No Meepo at cursor', '#cccccc')
	}
	if(flag === 2)
		PoofAllMeeposToMeepo(playerID, MyEnt, WithCheck)
	if(flag === 3)
		PoofAllMeeposToPos(playerID, GameUI.GetCursorPosition())
	GameUI.SelectUnit(MyEnt, false)
}

function MeepoCombo() {
	var playerID = Game.GetLocalPlayerID()
	var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
	
	var EarthBindMeepo = GetMeepoWithAvailableEarthBind()
	if(EarthBindMeepo === -1) {
		Game.ScriptLogMsg('MeepoCombo: All earthbinds are at cooldown/stunned, cannot make combo!', '#cccccc')
		return
	}
	var EarthBind = Game.GetAbilityByName(EarthBindMeepo, 'meepo_earthbind')
	
	var Blink = Game.GetAbilityByName(MyEnt, "item_blink")
	/*
	if(Blink === undefined) {
		Game.ScriptLogMsg('MeepoCombo: No blink, cannot make combo!', '#cccccc')
		return
	}
	if(Abilities.GetCooldownTimeRemaining(Blink) !== 0) {
		Game.ScriptLogMsg('MeepoCombo: Blink are at cooldown, cannot make combo!', '#cccccc')
		return
	}
	*/
	
	var Veil = Game.GetAbilityByName(MyEnt, "item_veil_of_discord")
	var pos = Game.ScreenXYToWorld(GameUI.GetCursorPosition()[0], GameUI.GetCursorPosition()[1])
	
	GameUI.SelectUnit(EarthBindMeepo, false)
	Game.CastPosition(EarthBindMeepo, EarthBind, pos, false)
	GameUI.SelectUnit(MyEnt, false)
	if(Blink !== undefined)
		Game.CastPosition(MyEnt, Blink, pos, false)
	if(Veil !== undefined)
		Game.CastPosition(MyEnt, Veil, pos, false)
	PoofAllMeeposToMeepo(playerID, MyEnt, false, true)
}

function GetMeepoWithAvailableEarthBind() {
	var playerID = Game.GetLocalPlayerID()
	var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
	var HEnts = Entities.GetAllEntitiesByClassname(MeepoName).map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !Entities.IsBuilding(ent) && !Entities.IsEnemy(ent) && !Entities.IsStunned(ent) && !(WithCheck && ent === To) && Entities.IsControllableByPlayer(ent, playerID) && !Entities.IsIllusion(ent)
	}).forEach(function(ent) {
		var Abil = Game.GetAbilityByName(ent, 'meepo_earthbind')
		if(Abilities.GetCooldownTimeRemaining(Abil) === 0)
			return ent
	})
	return -1
}

function BindCommands() {
	Game.AddCommand('__MeepoAutoPoof_ToSelected', function() {
		MeepoAutoPoof(0, true)
	}, '', 0)
	
	Game.AddCommand('__MeepoAutoPoof_ToCursor', function() {
		MeepoAutoPoof(1, true)
	}, '', 0)

	Game.AddCommand('__MeepoAutoPoof_ToMain', function() {
		MeepoAutoPoof(2, true)
	}, '', 0)
	
	Game.AddCommand('__MeepoAutoPoof_ToSelected_All', function() {
		MeepoAutoPoof(0, false)
	}, '', 0)
	
	Game.AddCommand('__MeepoAutoPoof_ToCursor_All', function() {
		MeepoAutoPoof(1, false)
	}, '', 0)

	Game.AddCommand('__MeepoAutoPoof_ToMain_All', function() {
		MeepoAutoPoof(2, false)
	}, '', 0)
	
	Game.AddCommand('__MeepoCombo', function(){
		MeepoCombo()
	}, '', 0)
}

//function MapLoaded(data) {
	BindCommands()
//}

//GameEvents.Subscribe('game_newmap', MapLoaded)