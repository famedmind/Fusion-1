function InvokerCombo() {
	var playerID = Game.GetLocalPlayerID()
	var MyEnt = Players.GetPlayerHeroEntityIndex(playerID)
	
	var enemy = Game.ClosetToMouse(500, true)
	var pos = Entities.GetAbsOrigin(enemy)
	
	var Veil = Entities.GetFirstItem(MyEnt, "item_veil_of_discord")
	var Eul = Entities.GetFirstItem(MyEnt, "item_cyclone")
	var Etherial = Entities.GetFirstItem(MyEnt, "item_ethereal_blade")
	var Orchid = Entities.GetFirstItem(MyEnt, "item_orchid")
	var Urn = Entities.GetFirstItem(MyEnt, "item_urn_of_shadows")
	var Dagon = D2JS.GetDagon(MyEnt)
	
	var SunStrike = Game.GetAbilityByName(MyEnt, 'invoker_sun_strike')
	var Emp = Game.GetAbilityByName(MyEnt, 'invoker_emp')
	var Meteor = Game.GetAbilityByName(MyEnt, 'invoker_chaos_meteor')
	var Tornado = Game.GetAbilityByName(MyEnt, 'invoker_tornado')
	var Cold = Game.GetAbilityByName(MyEnt, 'invoker_cold_snap')
	var Blast = Game.GetAbilityByName(MyEnt, 'invoker_deafening_blast')
	
	GameUI.SelectUnit(MyEnt, false)
	
	Game.CastTarget(MyEnt, Eul, enemy, false)
	Game.CastPosition(MyEnt, SunStrike, pos, false)
	
}

function Quas(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'invoker_quas')
	Game.CastNoTarget(MyEnt, Abil, false)
}

function Wex(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'invoker_wex')
	Game.CastNoTarget(MyEnt, Abil, false)
}

function Exort(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'invoker_exort')
	Game.CastNoTarget(MyEnt, Abil, false)
}

function Invoke(MyEnt) {
	var Abil = Game.GetAbilityByName(MyEnt, 'invoker_invoke')
	Game.CastNoTarget(MyEnt, Abil, false)
}

function BindCommands() {
	Game.AddCommand('__InvokerCombo', function(){
		InvokerCombo()
	}, '', 0)
}

//function MapLoaded(data) {
	BindCommands()
//}

//GameEvents.Subscribe('game_newmap', MapLoaded)