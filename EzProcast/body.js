
try{
	Game.Panels.EzProcast.DeleteAsync(0)
	GameEvents.Unsubscribe( parseInt(Game.Subscribes.EzProcastonchatmsg) )
}catch(e){}
	
var Config = []

Game.EzProcastF = function(){
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var EntOnCursor = GameUI.FindScreenEntities( GameUI.GetCursorPosition() )
	var CursorXYZ = Game.ScreenXYToWorld( GameUI.GetCursorPosition()[0],GameUI.GetCursorPosition()[1] )
	var items = Game.Panels.EzProcast.Children()[2].Children()
	var abils = []
	for(i in items){
		if(items[i].Children()[0].paneltype=='DOTAAbilityImage'){
			abils.push(items[i].Children()[0].abilityname)
		
		}else if(items[i].Children()[0].paneltype=='DOTAItemImage'){
			abils.push(items[i].Children()[0].itemname)
		}
	}
	$.Msg('Abils: '+abils)
	Game.EntStop(MyEnt)
	for(i in abils){
		var AbName = abils[i]
		var Abil = Game.GetAbilityByName(MyEnt,abils[i])
		var EzPBeh = Game.Behaviors( Abil )
		var EzPDUTT = Abilities.GetAbilityTargetTeam( Abil )
		$.Msg('Team Target: '+EzPDUTT)
		$.Msg('Ability Behavior: '+EzPBeh)
		if(EzPBeh.indexOf(512)!=-1){
			$.Msg('voni')
			Game.ToggleAbil(MyEnt, Abil)
			continue
			
		}else if(EzPBeh.indexOf(4)!=-1){
			
			Game.CastNoTarget(MyEnt, Abil)
			continue
			
		}else if(EzPBeh.indexOf(16)!=-1){
			
			Game.CastPosition(MyEnt, Abil, CursorXYZ)
			continue
			
		}else if(AbName=="item_ethereal_blade"){
			
			if(EntOnCursor.length!=0)
				Game.CastTarget(MyEnt, Abil, EntOnCursor[0].entityIndex)
			else
				Game.CastTarget(MyEnt, Abil, MyEnt)
			
		}else if(EzPBeh.indexOf(8)!=-1 || EzPBeh.length == 0 ){
			
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

EzProcast01OnOffLoad = function(){
	Game.GetXML('EzProcast/panel', function(a){
		Game.Panels.EzProcast = $.CreatePanel( 'Panel', Game.GetMainHUD(), 'EzProcast1' )
		Game.Panels.EzProcast.BLoadLayoutFromString( a, false, false )
		GameUI.MovePanel(Game.Panels.EzProcast,function(p){
			var position = p.style.position.split(' ')
			Config.MainPanel.x = position[0]
			Config.MainPanel.y = position[1]
			Game.SaveConfig('ezprocast', Config)
		})
		Game.GetConfig('ezprocast',function(a){
			Config = a[0]
			Game.Panels.EzProcast.style.position = Config.MainPanel.x + ' ' + Config.MainPanel.y + ' 0'
		});
		
		var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
		var AbC = Entities.GetAbilityCount( MyEnt )
		for(i=0;i<AbC;i++){
			var Ab = Entities.GetAbility( MyEnt, i )
			if( !Abilities.IsDisplayedAbility(Ab) || Abilities.IsPassive(Ab) )
				continue
			var P = $.CreatePanel( 'Panel', Game.Panels.EzProcast.Children()[0], 'EzProcast1Items' )
			P.BLoadLayoutFromString( '<root><script>function Add(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[2]);$.GetContextPanel().SetPanelEvent("onactivate", Rem)}function Rem(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[0]);$.GetContextPanel().SetPanelEvent("onactivate", Add)}</script><Panel style="border: 1px solid #000; border-radius: 10px;" onactivate="Add()"><DOTAAbilityImage /></Panel></root>', false, false )
			P.Children()[0].abilityname = Abilities.GetAbilityName( Ab )
		}
		var Inv = Game.GetInventory(MyEnt)
		for(i in Inv){
			Behaviors = Game.Behaviors(Inv[i])
			if( Behaviors.indexOf(2)!=-1 )
				continue
			var P = $.CreatePanel( 'Panel', Game.Panels.EzProcast.Children()[0], 'EzProcast1Items2' )
			P.BLoadLayoutFromString( '<root><script>function Add(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[2]);$.GetContextPanel().SetPanelEvent("onactivate", Rem)}function Rem(){Parent=$.GetContextPanel().GetParent().GetParent();$.GetContextPanel().SetParent(Parent.Children()[0]);$.GetContextPanel().SetPanelEvent("onactivate", Add)}</script><Panel style="border: 1px solid #000; border-radius: 10px;" onactivate="Add()"><DOTAItemImage /></Panel></root>', false, false )
			P.Children()[0].itemname = Abilities.GetAbilityName( Inv[i] )
		}
	});
}

function EzProcast01OnOff(){
	if ( !EzProcast01.checked ){
		try{
			Game.Panels.EzProcast.DeleteAsync(0)
		}catch(e){}
		GameEvents.Unsubscribe( Game.Subscribes.EzProcastonchatmsg )
		Game.ScriptLogMsg('Script disabled: EzProcast-V0.1', '#ff0000')
		
	}else{
		EzProcast01OnOffLoad()
		Game.Subscribes.EzProcastonchatmsg = GameEvents.Subscribe( 'player_chat', function(a){if(a.text=='-ez'){Game.EzProcastF()}} )
		Game.ScriptLogMsg('Script enabled: EzProcast-V0.1', '#00ff00')
	}
}

var EzProcast01 = Game.AddScript('EzProcast01', EzProcast01OnOff)


