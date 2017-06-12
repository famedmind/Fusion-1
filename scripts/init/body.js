D2JS = {
	Configs: {},
	Commands: {},
	Panels: {},
	Particles: {},
	Subscribes: {},
	MyTick: 1 / 30,
	debug: false,
	debugScripts: true,
	debugAnimations: true,
	D2JSServer: "http://m00fm0nkey.servegame.com:4297",
	SteamID: 0
}

D2JS.ReloadD2JSVanilla = function() {
	D2JS.ReloadD2JS("")
}

D2JS.ReloadD2JSCustomGames = function() {
	D2JS.ReloadD2JS("customgames")
}

D2JS.ReloadD2JS = function(postfix) {
	D2JS.ServerRequest('scriptlist' + postfix, '', function(response) {
		var scriptlist = JSON.parse(response)
		D2JS.Panels.MainPanel.FindChildTraverse('trics').RemoveAndDeleteChildren()
		scriptlist.forEach(D2JS.LoadScript)
	})
}

D2JS.LoadScript = function(script) {
	D2JS.ServerRequest('getscript', script, function(response) {
		var code = response
		if(D2JS.debugScripts)
			code = "try {" + code + "} catch(e) {$.Msg(e.stack)}"
		eval(code)
		$.Msg("JScript " + script + " loaded")
	})
}

D2JS.ServerRequest = function(name, val, callback) {
	var args = {
		type: 'POST',
		data: {},
		complete: function(a) {
			if (a.status === 200 && a.responseText !== null)
				callback(a.responseText.substring(0, a.responseText.length - 3))
		}
	}
	args['data'][name] = val
	args['data']['steamid'] = D2JS.SteamID
	
	$.AsyncWebRequest(D2JS.D2JSServer, args)
}
	
D2JS.GetXML = function(file, callback){
	D2JS.ServerRequest('getxml', file, callback)
}

D2JS.GetConfig = function(config, callback) {
	D2JS.ServerRequest('getconfig', config, function(response) {
		callback(JSON.parse(response))
	})
}

D2JS.SaveConfig = function(config, json){
	D2JS.ServerRequest('writeconfig', JSON.stringify (
		{
			"filepath": config,
			"json": JSON.stringify(json)
		}
	), function(response) {
		
	})
}

D2JS.GetHUD_REBORN = function() {
	var panel = $.GetContextPanel()
	while(panel = panel.GetParent())
		if(panel.id == "Hud")
			break
		
	return panel
}
	
D2JS.StatsEnabled = true
D2JS.MinimapActsEnabled = true
GameEvents.Subscribe('game_newmap', function(data) {
	D2JS.LoadD2JS = function() {
		D2JS.SteamID = Game.GetLocalPlayerInfo().player_steamid
		D2JS.ReloadD2JSVanilla()
		Game.AddCommand( '__ReloadD2JSVanilla', function() {
			D2JS.ReloadD2JSVanilla()
		}, '', 0)
		Game.AddCommand( '__ReloadD2JSCustomGames', function() {
			D2JS.ReloadD2JSCustomGames()
		}, '', 0)
		Game.AddCommand('__TogglePanel', function() {
			$.GetContextPanel().ToggleClass('Popup')
		}, '',0)
		Game.AddCommand('__ToggleMinimapActs', function() {
			var panel = D2JS.GetHUD_REBORN()
			
			if(panel && (panel = panel.FindChild("HUDElements")))
			if(panel = panel.FindChild("minimap_container"))
				if(panel = panel.FindChild("GlyphScanContainer"))
					if(D2JS.MinimapActsEnabled = !D2JS.MinimapActsEnabled)
							panel.style.visibility = null
						else
							panel.style.visibility = "collapse"
		}, '',0)
		Game.AddCommand('__ToggleStats', function() {
			var panel = D2JS.GetHUD_REBORN()

			if(panel && (panel = panel.FindChild("HUDElements")))
				if(panel = panel.FindChild("quickstats"))
					if(D2JS.StatsEnabled = !D2JS.StatsEnabled)
						panel.style.visibility = null
					else
						panel.style.visibility = "collapse"
		}, '',0)
		D2JS.Panels.MainPanel.ToggleClass('Popup')
	}
	
	function f() {
		$.Schedule (
			1,
			function() {
				if(Players.GetLocalPlayer() !== -1)
					D2JS.LoadD2JS()
				else
					f()
			}
		)
	}
	f()
})
var MainHUD = $.GetContextPanel()
if(D2JS.Panels.MainPanel !== undefined)
	D2JS.Panels.MainPanel.DeleteAsync(0)
D2JS.Panels.MainPanel = $.CreatePanel('Panel', MainHUD, 'DotaOverlay');
D2JS.GetXML("init/hud", function(response) {
	$.Msg("HUD Loaded!")
	
	D2JS.Panels.MainPanel.BLoadLayoutFromString(response, false, false)
	D2JS.Panels.MainPanel.ToggleClass('PopupOpened')
	D2JS.Panels.MainPanel.ToggleClass('Popup')
	D2JS.Panels.MainPanel.FindChildTraverse('Reload').SetPanelEvent('onactivate', D2JS.ReloadD2JSVanilla)
	D2JS.Panels.MainPanel.FindChildTraverse('ReloadCustomGames').SetPanelEvent('onactivate', D2JS.ReloadD2JSCustomGames)
	var slider = D2JS.Panels.MainPanel.FindChildInLayoutFile("CameraDistance")
	var lastValue = 0
	slider.min = 1300
	slider.max = 3000
	slider.value = 2000
	function OnTickSlider() {
		if (slider.value !== lastValue) {
			GameUI.SetCameraDistance(slider.value)
			D2JS.Panels.MainPanel.FindChildTraverse('CamDist').text = 'Camera distance: ' + Math.floor(slider.value)
			lastValue = slider.value
		}
		$.Schedule(D2JS.MyTick, OnTickSlider)
	}
	OnTickSlider()
})