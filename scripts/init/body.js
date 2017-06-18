Fusion = {
	Configs: {},
	Commands: {},
	Panels: {},
	Particles: {},
	Subscribes: {},
	API: {},
	MyTick: 1 / 30,
	debug: false,
	debugScripts: true,
	debugAnimations: true,
	FusionServer: "http://m00fm0nkey.servegame.com:4297",
	SteamID: 0
}

Fusion.API.ReloadFusionVanilla = function() {
	Fusion.ReloadFusion("")
}

Fusion.API.ReloadFusionCustomGames = function() {
	Fusion.ReloadFusion("customgames")
}

Fusion.API.ReloadFusion = function(postfix) {
	Fusion.ServerRequest('scriptlist' + postfix, '', function(response) {
		var scriptlist = JSON.parse(response)
		Fusion.Panels.MainPanel.FindChildTraverse('scripts').RemoveAndDeleteChildren()
		scriptlist.forEach(Fusion.LoadScript)
	})
}

Fusion.API.LoadScript = function(script) {
	Fusion.ServerRequest('getscript', script, function(response) {
		var code = response
		if(Fusion.debugScripts)
			code = "try {" + code + "} catch(e) {$.Msg(e.stack)}"
		eval(code)
		$.Msg("JScript " + script + " loaded")
	})
}

Fusion.API.ServerRequest = function(name, val, callback) {
	var args = {
		type: 'POST',
		data: {},
		complete: function(a) {
			if (a.status === 200 && a.responseText !== null)
				callback(a.responseText.substring(0, a.responseText.length - 3))
		}
	}
	args['data'][name] = val
	args['data']['steamid'] = Fusion.SteamID
	
	$.AsyncWebRequest(Fusion.FusionServer, args)
}
	
Fusion.API.GetXML = function(file, callback){
	Fusion.ServerRequest('getxml', file, callback)
}

Fusion.API.GetConfig = function(config, callback) {
	Fusion.ServerRequest('getconfig', config, function(response) {
		callback(JSON.parse(response))
	})
}

Fusion.API.SaveConfig = function(config, json){
	Fusion.ServerRequest('writeconfig', JSON.stringify (
		{
			"filepath": config,
			"json": JSON.stringify(json)
		}
	), function(response) {
		
	})
}
	
Fusion.StatsEnabled = true
Fusion.MinimapActsEnabled = true
GameEvents.Subscribe('game_newmap', function(data) {
	Fusion.API.LoadFusion = function() {
		Fusion.SteamID = Game.GetLocalPlayerInfo().player_steamid
		Fusion.ReloadFusionVanilla()
		Game.AddCommand( '__ReloadFusionVanilla', function() {
			Fusion.ReloadFusionVanilla()
		}, '', 0)
		Game.AddCommand( '__ReloadFusionCustomGames', function() {
			Fusion.ReloadFusionCustomGames()
		}, '', 0)
		Game.AddCommand('__TogglePanel', function() {
			$.GetContextPanel().ToggleClass('Popup')
		}, '',0)
		Game.AddCommand('__ToggleMinimapActs', function() {
			var panel = Fusion.GetMainHUD()
			
			if(panel && (panel = panel.FindChild("HUDElements")))
			if(panel = panel.FindChild("minimap_container"))
				if(panel = panel.FindChild("GlyphScanContainer"))
					if(Fusion.MinimapActsEnabled = !Fusion.MinimapActsEnabled)
							panel.style.visibility = ""
						else
							panel.style.visibility = "collapse"
		}, '',0)
		Game.AddCommand('__ToggleStats', function() {
			var panel = Fusion.GetMainHUD()

			if(panel && (panel = panel.FindChild("HUDElements")))
				if(panel = panel.FindChild("quickstats"))
					if(Fusion.StatsEnabled = !Fusion.StatsEnabled)
						panel.style.visibility = ""
					else
						panel.style.visibility = "collapse"
		}, '',0)
		Fusion.Panels.MainPanel.ToggleClass('Popup')
	}
	
	function f() {
		$.Schedule (
			1,
			function() {
				if(Players.GetLocalPlayer() !== -1)
					Fusion.LoadFusion()
				else
					f()
			}
		)
	}
	f()
})

Fusion.API.GetMainHUD = function() {
	var globalContext = $.GetContextPanel()
	while(true)
		if(globalContext.paneltype == "DOTAHud")
			break
		else
			globalContext = globalContext.GetParent()
	return globalContext
}

var MainHUD = $.GetContextPanel()
if(Fusion.Panels.MainPanel !== undefined)
	Fusion.Panels.MainPanel.DeleteAsync(0)
Fusion.Panels.MainPanel = $.CreatePanel('Panel', MainHUD, 'DotaOverlay');
Fusion.GetXML("init/hud", function(response) {
	$.Msg("HUD Loaded!")
	
	Fusion.Panels.MainPanel.BLoadLayoutFromString(response, false, false)
	Fusion.Panels.MainPanel.ToggleClass('PopupOpened')
	Fusion.Panels.MainPanel.ToggleClass('Popup')
	Fusion.Panels.MainPanel.FindChildTraverse('Reload').SetPanelEvent('onactivate', Fusion.ReloadFusionVanilla)
	Fusion.Panels.MainPanel.FindChildTraverse('ReloadCustomGames').SetPanelEvent('onactivate', Fusion.ReloadFusionCustomGames)
	var slider = Fusion.Panels.MainPanel.FindChildInLayoutFile("CameraDistance")
	slider.min = 1300
	slider.max = 3000
	slider.value = 2000
	slider.lastValue = 0
	function OnTickSlider() {
		if (slider.value !== slider.lastValue) {
			GameUI.SetCameraDistance(slider.value)
			Fusion.Panels.MainPanel.FindChildTraverse('CamDist').text = 'Camera distance: ' + Math.floor(slider.value)
			lastValue = slider.value
		}
		$.Schedule(Fusion.MyTick, OnTickSlider)
	}
	OnTickSlider()
})