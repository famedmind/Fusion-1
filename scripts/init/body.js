Fusion = {
	Configs: {},
	Commands: {},
	Panels: {},
	Particles: {},
	Subscribes: {},
	MyTick: 1 / 30,
	debug: false,
	debugLoad: false,
	//debugScripts: true,
	debugAnimations: false,
	FusionServer: "http://localhost:4297",
	SteamID: 0
}

Fusion.ReloadFusionVanilla = function() {
	Fusion.ReloadFusion("")
}

Fusion.ReloadFusionCustomGames = function() {
	Fusion.ReloadFusion("customgames")
}

Fusion.ReloadFusion = function(postfix) {
	Fusion.LoadFusion(function() {
		Fusion.ServerRequest("scriptlist" + postfix, "", function(response) {
			var scriptlist = JSON.parse(response)
			Fusion.Panels.MainPanel.FindChildTraverse("scripts").RemoveAndDeleteChildren()
			scriptlist.forEach(Fusion.LoadScript)
		})
	})
}

Fusion.LoadScript = function(scriptName) {
	Fusion.ServerRequest("getscript", scriptName, function(response) {
		var code = response
		//if(Fusion.debugScripts)
			code = "try {" + code + "} catch(e) {$.Msg(\"Error in " + scriptName + ": \" + e)}"
		eval(code)
		$.Msg("JScript " + scriptName + " loaded")
	})
}

Fusion.ServerRequest = function(name, val, callback) {
	var args = {
		type: "POST",
		data: {},
		complete: function(a) {
			if (a.status === 200 && a.responseText !== null)
				callback(a.responseText.substring(0, a.responseText.length - 1))
			else {
				if(Fusion.debugLoad)
					var log = "Can't load \"" + name + "\" @ " + val + ", returned " + JSON.stringify(a) + "."
				if(a.status - 400 <= 0 || a.status - 400 > 99) {
					if(Fusion.debugLoad)
						log += " Trying again."
					Fusion.ServerRequest(name, val, callback)
				}
			}
		}
	}
	args["data"][name] = val
	args["data"]["steamid"] = Fusion.SteamID // comment if you don"t wanted in logging your steamid
	
	$.AsyncWebRequest(Fusion.FusionServer, args)
}
	
Fusion.GetXML = function(file, callback){
	Fusion.ServerRequest("getxml", file, callback)
}

Fusion.GetConfig = function(scriptName, callback) {
	Fusion.ServerRequest("getconfig", scriptName, function(json) {
		callback(JSON.parse(json)[0])
	})
}

Fusion.SaveConfig = function(scriptName, config) {
	Fusion.ServerRequest("writeconfig", JSON.stringify (
		{
			"filepath": scriptName,
			"json": JSON.stringify(config)
		}
	), function(response) {
		
	})
}

Fusion.StatsEnabled = true
Fusion.MinimapActsEnabled = true
Fusion.HUDEnabled = true
Fusion.LoadFusion = function(callback) {
	if(Fusion.Panels.MainPanel !== undefined)
		Fusion.Panels.MainPanel.DeleteAsync(0)
	Fusion.Panels.MainPanel = $.CreatePanel("Panel", Fusion.Panels.Main, "DotaOverlay");
	Fusion.GetXML("init/hud", function(layout_string) {
		$.Msg("HUD now are initializing...")
		
		Fusion.Panels.MainPanel.BLoadLayoutFromString(layout_string, false, false)
		Fusion.Panels.MainPanel.ToggleClass("PopupOpened")
		Fusion.Panels.MainPanel.ToggleClass("Popup")
		Fusion.Panels.MainPanel.FindChildTraverse("Reload").SetPanelEvent("onactivate", Fusion.ReloadFusionVanilla)
		Fusion.Panels.MainPanel.FindChildTraverse("ReloadCustomGames").SetPanelEvent("onactivate", Fusion.ReloadFusionCustomGames)
		Fusion.Panels.MainPanel.Slider = Fusion.Panels.MainPanel.FindChildInLayoutFile("CameraDistance")
		Fusion.Panels.MainPanel.CamDist = Fusion.Panels.MainPanel.FindChildTraverse("CamDist")
		
		$.Msg("HUD initializing finished!")
		
		Fusion.GetConfig("init", function(config) {
			Fusion.Configs.init = config
			$.Msg("Initializing slider...")
			
			with(Fusion.Panels.MainPanel) {
				Slider.min = config.Slider.Min
				Slider.max = config.Slider.Max
				Slider.value = config.Slider.Value
				Slider.lastValue = -1 // -1 to make sure camera distance will be changed
				Slider.saved = true
			}
			
			function OnTickSlider() {
				with(Fusion.Panels.MainPanel) {
					if(!Slider.mousedown && !Slider.saved) {
						Fusion.SaveConfig("init", Fusion.Configs.init)
						Slider.saved = true
					}
					if (Slider.lastValue != Slider.value) {
						GameUI.SetCameraDistance(Slider.value)
						if(Slider.lastValue != -1) {
							Fusion.Configs.init.Slider.Value = Slider.value
							Slider.saved = false
						}
						CamDist.text = "Camera distance: " + Math.floor(Slider.value)
						Slider.lastValue = Slider.value
					}
				}
				$.Schedule(Fusion.MyTick, OnTickSlider)
			}
			OnTickSlider()
			$.Msg("Slider initialized!")
		})
		
		
		Fusion.SteamID = Game.GetLocalPlayerInfo().player_steamid
		Game.AddCommand( "__ReloadFusionVanilla", Fusion.ReloadFusionVanilla, "", 0)
		Game.AddCommand( "__ReloadFusionCustomGames", Fusion.ReloadFusionCustomGames, "", 0)
		Game.AddCommand("__TogglePanel", function() {
			Fusion.Panels.MainPanel.ToggleClass("Popup")
		}, "",0)
		Game.AddCommand("__ToggleMinimapActs", function() {
			var panel = Fusion.Panels.Main.HUDElements
			
			if(panel = panel.FindChild("minimap_container").FindChild("GlyphScanContainer"))
				if(Fusion.MinimapActsEnabled = !Fusion.MinimapActsEnabled)
						panel.style.visibility = ""
					else
						panel.style.visibility = "collapse"
		}, "",0)
		Game.AddCommand("__ToggleStats", function() {
			var panel = Fusion.Panels.Main.HUDElements
			
			if(panel = panel.FindChild("quickstats"))
				if(Fusion.StatsEnabled = !Fusion.StatsEnabled)
					panel.style.visibility = ""
				else
					panel.style.visibility = "collapse"
		}, "",0)
		Fusion.Panels.MainPanel.ToggleClass("Popup")
		if(callback !== undefined)
			callback()
	})
}

if(Fusion.Panels.MainPanel !== undefined)
	Fusion.Panels.MainPanel.DeleteAsync(0)

function InstallMainHUD() {
	var globalContext = $.GetContextPanel()
	while(true)
		if(globalContext.paneltype == "DOTAHud")
			break
		else
			globalContext = globalContext.GetParent()
	Fusion.Panels.Main = globalContext
	Fusion.Panels.Main.HUDElements = Fusion.Panels.Main.FindChild("HUDElements")
}

function f() {
	$.Schedule (
		0.04,
		function() {
			if(Players.GetLocalPlayer() !== -1)
				Fusion.ReloadFusionVanilla()
			else
				f()
		}
	)
}
InstallMainHUD()
f()