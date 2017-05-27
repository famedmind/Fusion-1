try{ Game.Panels.ItemsPanel.DeleteAsync(0) }catch(e){}
var Config = []
Game.ItemsPanelItems = []

function NewItem(oldinv, newinv, ent){
	for(i in newinv){
		n = newinv[i]
		if ( oldinv.indexOf(n)==-1 && Config.Items.indexOf(Abilities.GetAbilityName(n))!= -1 ){
			if(Config.Notify=="true"){
				A = $.CreatePanel( 'Panel', Game.Panels.ItemsPanel, 'Alert'+ent+n )
				A.BLoadLayoutFromString( '<root><Panel style="width:100%;height:37px;background-color:#111;"><DOTAHeroImage heroname="" style="vertical-align:center;width:60px;height:35px;position:160px;"/><Image src="s2r://panorama/images/hud/button_courier_greenarrow_png.vtex" style="horizontal-align:center;vertical-align:center;" /><DOTAItemImage itemname="" style="vertical-align:center;width:60px;height:35px;position:20px;"/></Panel></root>', false, false )
				A.Children()[0].heroname = Entities.GetUnitName(ent)
				A.Children()[2].itemname = Abilities.GetAbilityName(n)
				A.DeleteAsync( parseInt( Config.NotifyTime ) )
			}
			if (Config.EmitSound === "true")
				Game.EmitSound('General.Buy')
		}
	}
}

function ItemsPanelEvery(){
	if (!ItemsPanel.checked) {
		Game.ItemsPanelItems = []
		try {
			Game.Panels.ItemsPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		return
	}
	if(Game.GetState() !== DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
		try {
			Game.Panels.ItemsPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		for(var i=0; i < Game.Panels.ItemsPanel.Children().length; i++)
			Game.Panels.ItemsPanel.Children()[i].style.height = '0'
		Game.ItemsPanelItems = []
		ItemsPanel.checked = false
		return
	}
	var k = 0
	var IDs = Game.GetAllPlayerIDs()
	for(var i in IDs) {
		var Ent = Players.GetPlayerHeroEntityIndex(IDs[i])
		if(!Entities.IsEnemy(Ent))
			continue
		var P = Game.Panels.ItemsPanel.Children()[k]
		P.style.height = '24px'
		P.Children()[0].heroname = Entities.GetUnitName(Ent)
		var Inv = Game.GetInventory(Ent)
		if (Array.isArray(Game.ItemsPanelItems[Ent]))
			if(Game.CompareArrays(Game.ItemsPanelItems[Ent], Inv)) {
				k++
				continue
			}
		else
			Game.ItemsPanelItems[Ent] = []
		NewItem(Game.ItemsPanelItems[Ent], Inv, Ent)
		Game.ItemsPanelItems[Ent] = Inv
		for(var n in Inv)
			P.Children()[parseInt(n)+1].itemname = Abilities.GetAbilityName(Inv[n])
		k++
	}
}

var ItemsPanelLoad = function() {
	D2JS.GetXML('ItemsPanel/panel', function(a){
		Game.Panels.ItemsPanel = $.CreatePanel( 'Panel', Game.GetMainHUD(), 'ItemsPanel1' )
		Game.Panels.ItemsPanel.BLoadLayoutFromString(a, false, false)
		for(var i=0; i<5; i++)
			Game.Panels.ItemsPanel.Children()[i].style.height = '0'
		GameUI.MovePanel(Game.Panels.ItemsPanel, function(p) {
			var position = p.style.position.split(' ')
			Config.MainPanel.x = position[0]
			Config.MainPanel.y = position[1]
			D2JS.SaveConfig('ItemsPanel', Config)
		})
		
		D2JS.GetConfig('ItemsPanel', function(a) {
			Config = a[0]
			Game.Panels.ItemsPanel.style.position = Config.MainPanel.x + ' ' + Config.MainPanel.y + ' 0'
		})
		Game.Subscribes.MoneyChanged.push(ItemsPanelEvery)
	})
}

function ItemsPanelLoadOnOff() {
	if (!ItemsPanel.checked) {
		Game.ItemsPanelItems = []
		try {
			Game.Panels.ItemsPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		Game.ScriptLogMsg('Script disabled: ItemsPanel', '#ff0000')
	} else {
		ItemsPanelLoad()
		Game.ScriptLogMsg('Script enabled: ItemsPanel', '#00ff00')
	}
}

var ItemsPanel = Game.AddScript('ItemsPanel', ItemsPanelLoadOnOff)