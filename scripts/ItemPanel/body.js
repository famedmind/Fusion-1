﻿try {
	Fusion.Panels.ItemPanel.DeleteAsync(0)
} catch(e) {

}
Fusion.ItemPanel = []

function NewItem(oldinv, newinv, ent) {
	for(i in newinv){
		n = newinv[i]
		if(oldinv.indexOf(n) === -1 && Fusion.Configs.ItemPanel.Items.indexOf(Abilities.GetAbilityName(n))!= -1){
			if(Fusion.Configs.ItemPanel.Notify === "true") {
				A = $.CreatePanel('Panel', Fusion.Panels.ItemPanel, 'Alert' + ent + n)
				A.BLoadLayoutFromString('\
<root>\
	<Panel style="width:100%;height:37px;background-color:#111;">\
		<DOTAHeroImage heroname="" style="vertical-align:center;width:60px;height:35px;position:0px;"/>\
		<DOTAItemImage itemname="" style="vertical-align:center;width:60px;height:35px;position:70px;"/>\
	</Panel>\
</root>\
				', false, false)
				A.Children()[0].heroname = Entities.GetUnitName(ent)
				A.Children()[1].itemname = Abilities.GetAbilityName(n)
				A.DeleteAsync(parseInt(Fusion.Configs.ItemPanel.NotifyTime))
			}
			if (Fusion.Configs.ItemPanel.EmitSound === "true")
				Game.EmitSound('General.Buy')
		}
	}
}

function ItemPanelEvery() {
	if (!ItemPanel.checked) {
		Fusion.ItemPanel = []
		try {
			Fusion.Panels.ItemPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		return
	}
	if(Game.GameStateIsBefore(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)) {
		try {
			Fusion.Panels.ItemPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		for(var i=0; i < Fusion.Panels.ItemPanel.Children().length; i++)
			Fusion.Panels.ItemPanel.Children()[i].style.height = '0'
		Fusion.ItemPanel = []
		ItemPanel.checked = false
		return
	}
	var k = 0
	var IDs = Game.GetAllPlayerIDs()
	for(var i in IDs) {
		var Ent = Players.GetPlayerHeroEntityIndex(IDs[i])
		if(!Entities.IsEnemy(Ent))
			continue
		var P = Fusion.Panels.ItemPanel.Children()[k]
		P.style.height = '24px'
		P.Children()[0].heroname = Entities.GetUnitName(Ent)
		var Inv = Game.GetInventory(Ent)
		if(typeof Fusion.ItemPanel[Ent] === 'undefined')
			Fusion.ItemPanel[Ent] = []
		if (Array.isArray(Fusion.ItemPanel[Ent]))
			if(Game.CompareArrays(Fusion.ItemPanel[Ent], Inv)) {
				k++
				continue
			}
		NewItem(Fusion.ItemPanel[Ent], Inv, Ent)
		Fusion.ItemPanel[Ent] = Inv
		for(var i = 1; i < P.Children().length; i++)
			P.Children()[i].itemname = ""
		for(var n in Inv)
			P.Children()[parseInt(n) + 1].itemname = Abilities.GetAbilityName(Inv[n])
		k++
	}
	if(ItemPanel.checked)
		$.Schedule(Fusion.MyTick, ItemPanelEvery)
}

function ItemPanelLoad() {
	Fusion.GetXML('ItemPanel/panel', function(a) {
		Fusion.Panels.ItemPanel = $.CreatePanel('Panel', Fusion.Panels.Main, 'ItemPanel1')
		Fusion.Panels.ItemPanel.BLoadLayoutFromString(a, false, false)
		for(var i=0; i < 5; i++)
			Fusion.Panels.ItemPanel.Children()[i].style.height = '0'
		GameUI.MovePanel(Fusion.Panels.ItemPanel, function(p) {
			var position = p.style.position.split(' ')
			Fusion.Configs.ItemPanel.MainPanel.x = position[0]
			Fusion.Configs.ItemPanel.MainPanel.y = position[1]
			Fusion.SaveConfig('ItemPanel', Fusion.Configs.ItemPanel)
		})
		
		Fusion.GetConfig('ItemPanel', function(response) {
			response = response[0]
			Fusion.Panels.ItemPanel.style.position = response.MainPanel.x + ' ' + response.MainPanel.y + ' 0'
			Fusion.Configs.ItemPanel = response
			ItemPanelEvery()
		})
	})
}

function ItemPanelLoadOnOff() {
	if (!ItemPanel.checked) {
		Fusion.ItemPanel = []
		try {
			Fusion.Panels.ItemPanel.DeleteAsync(0)
		} catch(e) {
			
		}
		Game.ScriptLogMsg('Script disabled: ItemPanel', '#ff0000')
	} else {
		ItemPanelLoad()
		Game.ScriptLogMsg('Script enabled: ItemPanel', '#00ff00')
	}
}

var ItemPanel = Game.AddScript('ItemPanel', ItemPanelLoadOnOff)