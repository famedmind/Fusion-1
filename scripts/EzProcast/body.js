﻿try {
	Fusion.Panels.EzProcast.DeleteAsync(0)
	GameEvents.Unsubscribe(parseInt(Fusion.Subscribes.EzProcastonchatmsg))
} catch(e) {  }
	
var Config = []

function EzProcastF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var EntOnCursor = GameUI.FindScreenEntities( GameUI.GetCursorPosition() )
	var pos = Game.GetScreenCursonWorldVec()
	var items = Fusion.Panels.EzProcast.Children()[2].Children()
	var abils = []
	for(i in items)
		if(items[i].Children()[0].paneltype === 'DOTAAbilityImage')
			abils.push(items[i].Children()[0].abilityname)
		else
			if(items[i].Children()[0].paneltype === 'DOTAItemImage')
				abils.push(items[i].Children()[0].itemname)
	$.Msg('Abils: '+abils)
	Game.EntStop(MyEnt)
	for(i in abils){
		var AbName = abils[i]
		var Abil = Game.GetAbilityByName(MyEnt,abils[i])
		var EzPBeh = Game.Behaviors(Abil)
		var EzPDUTT = Abilities.GetAbilityTargetTeam(Abil)
		$.Msg('Team Target: '+EzPDUTT)
		$.Msg('Ability Behavior: '+EzPBeh)
		if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_TOGGLE) !== -1)
			Game.ToggleAbil(MyEnt, Abil)
		else if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_NO_TARGET) !== -1)
			Game.CastNoTarget(MyEnt, Abil)
		else if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
			Game.CastPosition(MyEnt, Abil, pos)
		else if(AbName=="item_ethereal_blade") {
			if(EntOnCursor.length!=0)
				Game.CastTarget(MyEnt, Abil, EntOnCursor[0].entityIndex)
			else
				Game.CastTarget(MyEnt, Abil, MyEnt)
		} else if(EzPBeh.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1 || EzPBeh.length === 0) {
			if( parseInt(EzPDUTT)==3 || parseInt(EzPDUTT)==1 ){
				Game.CastTarget(MyEnt, Abil, MyEnt)
			}else if( parseInt(EzPDUTT)!=-1 || parseInt(EzPDUTT)==4 ){
				Game.CastTarget(MyEnt, Abil, MyEnt)
			}else{
				Game.CastTarget(MyEnt, Abil, MyEnt)
			}
		}
	}
}

function EzProcast01OnOffLoad() {
	Fusion.GetXML('EzProcast/panel', function(a){
		Fusion.Panels.EzProcast = $.CreatePanel( 'Panel', Fusion.GetMainHUD(), 'EzProcast1' )
		Fusion.Panels.EzProcast.BLoadLayoutFromString( a, false, false )
		GameUI.MovePanel(Fusion.Panels.EzProcast,function(p){
			var position = p.style.position.split(' ')
			Config.MainPanel.x = position[0]
			Config.MainPanel.y = position[1]
			Fusion.SaveConfig('ezprocast', Config)
		})
		Fusion.GetConfig('ezprocast',function(a){
			Config = a[0]
			Fusion.Panels.EzProcast.style.position = Config.MainPanel.x + ' ' + Config.MainPanel.y + ' 0'
		})
		
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var AbC = Entities.GetAbilityCount( MyEnt )
		for(i=0;i<AbC;i++){
			var Ab = Entities.GetAbility( MyEnt, i )
			if( !Abilities.IsDisplayedAbility(Ab) || Abilities.IsPassive(Ab) )
				continue
			var P = $.CreatePanel( 'Panel', Fusion.Panels.EzProcast.Children()[0], 'EzProcast1Items' )
			P.BLoadLayoutFromString( '<root><script>function Add(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[2]);$.GetContextPanel().SetPanelEvent("onactivate", Rem)}function Rem(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[0]);$.GetContextPanel().SetPanelEvent("onactivate", Add)}</script><Panel style="border: 1px solid #000; border-radius: 10px;" onactivate="Add()"><DOTAAbilityImage /></Panel></root>', false, false )
			P.Children()[0].abilityname = Abilities.GetAbilityName( Ab )
		}
		var Inv = Game.GetInventory(MyEnt)
		for(i in Inv){
			Behaviors = Game.Behaviors(Inv[i])
			if( Behaviors.indexOf(2)!=-1 )
				continue
			var P = $.CreatePanel( 'Panel', Fusion.Panels.EzProcast.Children()[0], 'EzProcast1Items2' )
			P.BLoadLayoutFromString( '<root><script>function Add(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[2]);$.GetContextPanel().SetPanelEvent("onactivate", Rem)}function Rem(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[0]);$.GetContextPanel().SetPanelEvent("onactivate", Add)}</script><Panel style="border: 1px solid #000; border-radius: 10px;" onactivate="Add()"><DOTAItemImage /></Panel></root>', false, false )
			P.Children()[0].itemname = Abilities.GetAbilityName( Inv[i] )
		}
	});
}

function EzProcast01OnOff(){
	if ( !EzProcast01.checked ){
		try{
			Fusion.Panels.EzProcast.DeleteAsync(0)
		}catch(e){}
		Game.ScriptLogMsg('Script disabled: EzProcast-V0.1', '#ff0000')
		
	}else{
		EzProcast01OnOffLoad()
		Game.ScriptLogMsg('Script enabled: EzProcast-V0.1', '#00ff00')
	}
}
Game.AddCommand('__EzProcast', function() {
	EzProcastF()
}, '',0)
var EzProcast01 = Game.AddScript('EzProcast01', EzProcast01OnOff)

/*
MyID = Game.GetLocalPlayerID()
MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
Ent = Entities.GetAllEntitiesByName( "npc_dota_hero_pudge" )[0]

$.Schedule(0,function(){ Game.CastNoTarget(MyEnt, Entities.GetItemInSlot( MyEnt, 2 )) })
$.Schedule(0.1,function(){ Game.CastNoTarget(MyEnt, Entities.GetItemInSlot( MyEnt, 3 )) })
$.Schedule(0.2,function(){ Game.CastTarget(MyEnt, Entities.GetItemInSlot( MyEnt, 1 ), Ent) })
$.Schedule(0.3,function(){ Game.CastTarget(MyEnt, Entities.GetItemInSlot( MyEnt, 5 ), Ent) })

$.Schedule(0.4,function(){ Game.CastNoTarget(MyEnt, Entities.GetAbility( MyEnt, 1 )) })
$.Schedule(0.5,function(){ Game.CastTarget(MyEnt, Entities.GetAbility( MyEnt, 0 ), Ent) })
$.Schedule(0.6,function(){ Game.CastNoTarget(MyEnt, Entities.GetAbility( MyEnt, 3 ) ) })
*/
//Game.CastTarget(MyEnt, Entities.GetItemInSlot( MyEnt, 1 ), Ent)
