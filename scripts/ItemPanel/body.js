try {
	Game.Panels.ItemPanel.DeleteAsync(0)
} catch(e) {

}
D2JS.ItemPanel = []

function NewItem(oldinv, newinv, ent) {
	for(i in newinv){
		n = newinv[i]
		if(oldinv.indexOf(n) === -1 && D2JS.Configs.ItemPanel.Items.indexOf(Abilities.GetAbilityName(n))!= -1){
			if(D2JS.Configs.ItemPanel.Notify === "true") {
				A = $.CreatePanel('Panel', Game.Panels.ItemPanel, 'Alert' + ent + n)
				A.BLoadLayoutFromString( '<root><Panel style="width:100%;height:37px;background-color:#111;"><DOTAHeroImage heroname="" style="vertical-align:center;width:60px;height:35px;position:160px;"/><Image src="s2r://panorama/images/hud/button_courier_greenarrow_png.vtex" style="horizontal-align:center;vertical-align:center;" /><DOTAItemImage itemname="" style="vertical-align:center;width:60px;height:35px;position:20px;"/></Panel></root>', false, false )
				A.Children()[0].heroname = Entities.GetUnitName(ent)
				A.Children()[2].itemname = Abilities.GetAbilityName(n)
				A.DeleteAsync( parseInt( D2JS.Configs.ItemPanel.NotifyTime ) )
			}
			if (D2JS.Configs.ItemPanel.EmitSound === "true")
				Game.EmitSound('General.Buy')
		}
	}
}

function ItemPanelEvery() {
	if (!ItemPanel.checked) {
		D2JS.ItemPanel = []
		try {
			Game.Panels.ItemPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		return
	}
	if(Game.GetState() !== DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
		try {
			Game.Panels.ItemPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		for(var i=0; i < Game.Panels.ItemPanel.Children().length; i++)
			Game.Panels.ItemPanel.Children()[i].style.height = '0'
		D2JS.ItemPanel = []
		ItemPanel.checked = false
		return
	}
	var k = 0
	var IDs = Game.GetAllPlayerIDs()
	for(var i in IDs) {
		var Ent = Players.GetPlayerHeroEntityIndex(IDs[i])
		if(!Entities.IsEnemy(Ent))
			continue
		var P = Game.Panels.ItemPanel.Children()[k]
		P.style.height = '24px'
		P.Children()[0].heroname = Entities.GetUnitName(Ent)
		var Inv = Game.GetInventory(Ent)
		if(typeof D2JS.ItemPanel[Ent] === 'undefined')
			D2JS.ItemPanel[Ent] = []
		if (Array.isArray(D2JS.ItemPanel[Ent]))
			if(Game.CompareArrays(D2JS.ItemPanel[Ent], Inv)) {
				k++
				continue
			}
		NewItem(D2JS.ItemPanel[Ent], Inv, Ent)
		D2JS.ItemPanel[Ent] = Inv
		for(var i = 1; i < P.Children().length; i++)
			P.Children()[i].itemname = ""
		for(var n in Inv)
			P.Children()[parseInt(n) + 1].itemname = Abilities.GetAbilityName(Inv[n])
		k++
	}
	$.Schedule(Game.MyTick, ItemPanelEvery)
}

var ItemPanelLoad = function() {
	D2JS.GetXML('ItemPanel/panel', function(a) {
		Game.Panels.ItemPanel = $.CreatePanel( 'Panel', Game.GetMainHUD(), 'ItemPanel1' )
		Game.Panels.ItemPanel.BLoadLayoutFromString(a, false, false)
		for(var i=0; i < 5; i++)
			Game.Panels.ItemPanel.Children()[i].style.height = '0'
		GameUI.MovePanel(Game.Panels.ItemPanel, function(p) {
			var position = p.style.position.split(' ')
			D2JS.Configs.ItemPanel.MainPanel.x = position[0]
			D2JS.Configs.ItemPanel.MainPanel.y = position[1]
			D2JS.SaveConfig('ItemPanel', D2JS.Configs.ItemPanel)
		})
		
		D2JS.GetConfig('ItemPanel', function(response) {
			response = response[0]
			Game.Panels.ItemPanel.style.position = response.MainPanel.x + ' ' + response.MainPanel.y + ' 0'
			D2JS.Configs.ItemPanel = response
			ItemPanelEvery()
		})
	})
}

function ItemPanelLoadOnOff() {
	if (!ItemPanel.checked) {
		D2JS.ItemPanel = []
		try {
			Game.Panels.ItemPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		Game.ScriptLogMsg('Script disabled: ItemPanel', '#ff0000')
	} else {
		ItemPanelLoad()
		Game.ScriptLogMsg('Script enabled: ItemPanel', '#00ff00')
	}
}

var ItemPanel = Game.AddScript('ItemPanel', ItemPanelLoadOnOff)