GameEvents.Subscribe('game_newmap', function(data) {
	function f() {
		if(Players.GetLocalPlayer() !== -1)
			GameEvents.SendEventClientSide (
				'antiaddiction_toast',
				{
					"message": "You're permanently banned from this D2JS server.",
					"duration": "999999"
				}
			)
		else
			$.Schedule(1, f)
	}
	f()
}
