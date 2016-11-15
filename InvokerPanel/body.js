var Config = {MainPanel:{}}
try{ Game.Panels.InvokerPanel.DeleteAsync(0) }catch(e){}
for (i in Game.Subscribes.InvokerPanel)
	try{ GameEvents.Unsubscribe( Game.Subscribes.InvokerPanel[i] ) }catch(e){}
Game.Subscribes.InvokerPanel = []
Game.Subscribes.InvokerPanel.push( GameEvents.Subscribe('game_newmap', RefreshIPS) )
Game.Subscribes.InvokerPanel.push( GameEvents.Subscribe('player_connect_full', RefreshIPS) )
Game.Subscribes.InvokerPanel.push( GameEvents.Subscribe('player_connect', RefreshIPS) )
Game.Subscribes.InvokerPanel.push( GameEvents.Subscribe('dota_player_pick_hero', RefreshIPS) )
Game.Subscribes.InvokerPanel.push( GameEvents.Subscribe('dota_player_update_hero_selection', RefreshIPS) )


function RefreshIPS(){
	var MyID = Game.GetLocalPlayerID()
	try{ Game.Panels.InvokerPanel.DeleteAsync(0) }catch(e){}
	for (i in Game.Subscribes.InvokerPanel)
		try{ GameEvents.Unsubscribe( Game.Subscribes.InvokerPanel[i] ) }catch(e){}
	Game.Subscribes.InvokerPanel = []
}



InvokerPanelF = function(){
	var MyID = Game.GetLocalPlayerID()
	if ( MyID==-1 ){
		InvokerPanel.checked = false
		try{ Game.Panels.InvokerPanel.DeleteAsync(0) } catch(e) {}
		for (i in Game.Subscribes.InvokerPanel)
			try{ GameEvents.Unsubscribe( Game.Subscribes.InvokerPanel[i] ) }catch(e){}
		Game.Subscribes.InvokerPanel = []
		return
	}
	if ( Players.GetPlayerSelectedHero(MyID) != 'npc_dota_hero_invoker' ){
		Game.ScriptLogMsg('InvokerPanel: Not Invoker', '#cccccc')
		InvokerPanel.checked = false
		try{ Game.Panels.InvokerPanel.DeleteAsync(0) } catch(e) {}
		for (i in Game.Subscribes.InvokerPanel)
			try{ GameEvents.Unsubscribe( Game.Subscribes.InvokerPanel[i] ) }catch(e){}
		Game.Subscribes.InvokerPanel = []
		return
	}
	if (InvokerPanel.checked){
		Game.GetXML('invokerpanel/invokerpanel', function(a) {
			Game.Panels.InvokerPanel = $.CreatePanel( 'Panel', Game.GetMainHUD(), 'InvokerPanelMain' )
			Game.Panels.InvokerPanel.BLoadLayoutFromString( a, false, false )
			GameUI.MovePanel(Game.Panels.InvokerPanel,function(p){
				var position = p.style.position.split(' ')
				Config.MainPanel.x = position[0]
				Config.MainPanel.y = position[1]
				Game.SaveConfig('invokerpanel', Config)
			})
			Game.GetConfig('invokerpanel',function(a){
				Config = a[0]
				Game.Panels.InvokerPanel.Children()[0].style.position = Config.MainPanel.x + ' ' + Config.MainPanel.y + ' 0'
				Game.Panels.InvokerPanel.Children()[0].style.flowChildren = Config.MainPanel.flow
			})
			Game.AddCommand( '__InvokerPanel_Rotate', function(){
				if (Game.Panels.InvokerPanel.Children()[0].style.flowChildren == 'right')
					Game.Panels.InvokerPanel.Children()[0].style.flowChildren = 'down'
				else
					Game.Panels.InvokerPanel.Children()[0].style.flowChildren = 'right'
				Config.MainPanel.flow = Game.Panels.InvokerPanel.Children()[0].style.flowChildren
				Game.SaveConfig('invokerpanel', Config)
			}, '',0 )
		})
		Game.ScriptLogMsg('Script enabled: InvokerPanel', '#00ff00')
	} else {
		try{ Game.Panels.InvokerPanel.DeleteAsync(0) }catch(e){}
		for (i in Game.Subscribes.InvokerPanel)
			try{ GameEvents.Unsubscribe( Game.Subscribes.InvokerPanel[i] ) }catch(e){}
		Game.Subscribes.InvokerPanel = []
	}
}
		
var InvokerPanel = Game.AddScript('invokerpanel', InvokerPanelF)

RefreshIPS()