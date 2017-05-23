	Game.D2JSInit = true
	D2JS = {}
	D2JS.ScriptVersion = "1.2"
	D2JS.D2JSServer = "http://m00fm0nkey.servegame.com:4297"

	D2JS.ReloadD2JSVanilla = function(){
		D2JS.ReloadD2JS("")
	}

	D2JS.ReloadD2JSCustomGames = function() {
		D2JS.ReloadD2JS("customgames")
	}

	D2JS.ReloadD2JS = function(postfix) {
		D2JS.ServerRequest('scriptlist' + postfix, '', function(response) {
			var scriptlist = JSON.parse(response)
			$('#trics').RemoveAndDeleteChildren()
			scriptlist.map(function (name) {
				D2JS.LoadScript(name)
			});
		})
	}

	D2JS.LoadScript = function(script) {
		D2JS.ServerRequest('getscript', script, function(response) {
			eval(response)
			$.Msg("JScript " + script + " loaded")
		})
	}

	D2JS.CheckVersion = function() {
		D2JS.ServerRequest('version', '', function(response) {
			if(response !== D2JS.ScriptVersion)
				D2JSEvents.SendEventClientSide (
					'antiaddiction_toast',
					{
						"message": "Please update your D2JS version",
						"duration": "999999"
					}
				)
		})
	}

	D2JS.ServerRequest = function(name, val, callback) {
		var args = {
			type: 'POST',
			data: {},
			complete: function(a) {
				if (a.status === 200 && a.responseText !== null )
					callback(a.responseText.substring(0, a.responseText.length - 3))
			}
		}
		args['data'][name] = val
		args['data']['steamid'] = Game.GetLocalPlayerInfo().player_steamid
		
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

	GameEvents.Subscribe('game_newmap', function(data) {
		D2JS.LoadD2JS = function() {
			D2JS.CheckVersion()
			D2JS.ReloadD2JSVanilla()
			Game.AddCommand( '__ReloadD2JSVanilla', function() {
				D2JS.ReloadD2JSVanilla()
			}, '', 0)
			Game.AddCommand( '__ReloadD2JSCustomGames', function() {
				D2JS.ReloadD2JSCustomGames()
			}, '', 0)
			Game.AddCommand('__TogglePanel', function() {
				D2JS.Panel.ToggleClass('Popup')
			}, '',0)
			$.GetContextPanel().ToggleClass('Popup')
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
$.GetContextPanel().ToggleClass('PopupOpened')
$.GetContextPanel().ToggleClass('Popup')