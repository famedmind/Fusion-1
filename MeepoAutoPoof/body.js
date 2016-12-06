var meepoName = 'npc_dota_hero_meepo'

function PoofAllMeeposTo(playerID, To) {
	var HEnts = Entities.GetAllEntitiesByClassname(meepoName)
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		
		if(Entities.IsIllusion(ent))
			continue
		if(!Entities.IsControllableByPlayer(ent, playerID))
			continue
		if(ent === To)
			continue
		if(Entities.IsStunned(ent) || !Entities.IsAlive(ent))
			return
		
		var Abil = Game.GetAbilityByName(ent, 'meepo_poof')
		GameUI.SelectUnit(ent, false)
		Game.CastTarget(ent, Abil, To, false)
	}
}

function MeepoAutoPoof(flag) {
	var playerID = Game.GetLocalPlayerID()
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
	if(flag === 0) {
		var SelectedEnt = Players.GetLocalPlayerPortraitUnit()
		PoofAllMeeposTo(playerID, SelectedEnt)
		GameUI.SelectUnit(SelectedEnt, false)
		return
	}
	if(flag === 1) {
		var EntsOnCursor = GameUI.FindScreenEntities(GameUI.GetCursorPosition())
		if(EntsOnCursor.length != 0)
			PoofAllMeeposTo(playerID, EntsOnCursor[0].entityIndex)
		else
			Game.ScriptLogMsg('MeepoAutoPoof: Not Meepo at cursor', '#cccccc')
	}
	if(flag === 2)
		PoofAllMeeposTo(playerID, MyEnt)
	GameUI.SelectUnit(MyEnt, false)
}

function BindCommands() {
	Game.AddCommand('MeepoAutoPoof_ToSelected', function(){
		MeepoAutoPoof(0)
	}, '', 0)
	
	Game.AddCommand('MeepoAutoPoof_ToCursor', function(){
		MeepoAutoPoof(1)
	}, '', 0)

	Game.AddCommand('MeepoAutoPoof_ToMain', function(){
		MeepoAutoPoof(2)
	}, '', 0)
}

function MapLoaded(data) {
	BindCommands()
}

GameEvents.Subscribe('game_newmap', MapLoaded)