GameEvents.Subscribe('game_newmap', MapLoaded)
GameEvents.Subscribe('player_team', RefreshToggles)
function RefreshToggles(){
	MyID = Game.GetLocalPlayerID()
	Toggles = $('#trics').Children()
	if ( MyID == -1 )
		for ( var i in Toggles )
			Toggles[i].enabled = false
	else
		for ( var i in Toggles )
			Toggles[i].enabled = true
}

function MapLoaded(data){
	Game.AddCommand( '__ToggleSPanel', Toggle, '',0 )
	GameUI.SetCameraDistance( slider.value )
	RefreshToggles()
}
function Toggle(){
	$.GetContextPanel().ToggleClass('PopupOpened')
}
//обработчик слайдера для изменения высоты камеры
var slider = $.GetContextPanel().FindChildInLayoutFile( "CameraDistance" )
var lastValue = 0
function OnValueChanged(slider){
	GameUI.SetCameraDistance( slider.value )
	$('#CamDist').text = 'Дальность камеры: ' + Math.floor(slider.value)
}
slider.min = 1000
slider.max = 1800
slider.value = 1134
lastValue = slider.value
$('#CamDist').text = 'Дальность камеры: ' + Math.floor(slider.value)
Game.Every(-1, -1, 0, function(){ 
	if (slider.value != lastValue)
		OnValueChanged(slider);
	lastValue = slider.value;
});

Game.ScriptLogMsg('MainScript sucessfull loaded', '#00ff00')