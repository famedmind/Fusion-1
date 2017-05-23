var RunesPos = [[-4352.03125,192,304],
				[-2824,4136,432],
				[3551.96875,368,432],
				[1295.96875,-4128,432],
				[2618.0625,-2003,248.59375],
				[-1760,1216,176]]
var RuneRadius = 150
var CircleRadius = 600
var MyEnt,XYZ,xyz,Runes,Rune,SnatcherSt,abs,item,SnatcherCircleParticle

Game.SnatcherConfig = D2JS.GetConfig('RuneSnatcher')
if(SnatcherCircleParticle!=-1&&typeof SnatcherCircleParticle!='undefined')
	try{Particles.DestroyParticleEffect(SnatcherCircleParticle,SnatcherCircleParticle)}catch(e){}

var SnatcherF = function(){
	if(Game.IsGamePaused())
		return
	MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	XYZ = Entities.GetAbsOrigin(MyEnt)
	
	Runes = []
	var rc = 0
	
	for(var cr in RunesPos) {
		Runes=Runes.concat(GameUI.FindScreenEntities([Game.WorldToScreenX(RunesPos[cr][0] - 0,RunesPos[cr][1],RunesPos[cr][2] - 100),Game.WorldToScreenY(RunesPos[cr][0] + 0,RunesPos[cr][1],RunesPos[cr][2] + 100)]))
	}
	
	if(Game.SnatcherConfig.Indicator) {
		for(var cr in RunesPos) {
			if(Game.PointDistance(XYZ,RunesPos[cr]) < CircleRadius && Game.PointDistance(XYZ,RunesPos[cr]) > RuneRadius) {
				if(SnatcherSt!=1){
					if(SnatcherCircleParticle!=-1&&typeof SnatcherCircleParticle!='undefined')
						try{Particles.DestroyParticleEffect(SnatcherCircleParticle,SnatcherCircleParticle)}catch(e){}
				
					SnatcherCircleParticle = Particles.CreateParticle("particles/range_display_red.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
					Particles.SetParticleControl(SnatcherCircleParticle, 1, [RuneRadius,0,0])
					
					SnatcherSt = 1
					break
				}
			}else if(Game.PointDistance(XYZ,RunesPos[cr]) < RuneRadius || Game.PointDistance(XYZ,RunesPos[cr]) < RuneRadius) {
				if(SnatcherSt!=2){
					if(SnatcherCircleParticle!=-1&&typeof SnatcherCircleParticle!='undefined')
						try{Particles.DestroyParticleEffect(SnatcherCircleParticle,SnatcherCircleParticle)}catch(e){}
					SnatcherCircleParticle = Particles.CreateParticle("particles/range_display_blue.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
					Particles.SetParticleControl(SnatcherCircleParticle, 1, [RuneRadius,0,0])
					SnatcherSt=2
					break
				}
			}else{
				rc++
			}
		}
	}

	if(RunesPos.length == rc && SnatcherCircleParticle!=-1 && typeof SnatcherCircleParticle!='undefined') {
		try{Particles.DestroyParticleEffect(SnatcherCircleParticle,SnatcherCircleParticle)}catch(e){}
		SnatcherSt=0
	}
		
	
	for(i in Runes){
		Rune = Runes[i].entityIndex
		xyz = Entities.GetAbsOrigin(Rune)
		if(Game.PointDistance(XYZ,xyz) > RuneRadius)
			continue
		Game.PuckupRune(MyEnt,Rune,false)
	}
}

function SnatcherOnOff() {
	if ( !Snatcher.checked ){
		if(SnatcherCircleParticle!=-1 && typeof SnatcherCircleParticle!='undefined') {
			try{Particles.DestroyParticleEffect(SnatcherCircleParticle,SnatcherCircleParticle)}catch(e){}
		}
		SnatcherSt=0
		Game.ScriptLogMsg('Деактивирован: Rune Snatcher', '#ff0000')
		return
	}
	
	function L(){ $.Schedule( 0.1,function(){
		if (typeof Snatcher != "undefined" && Snatcher.checked){
			SnatcherF()
			L()
		}
	})}
	L()
	
	Game.ScriptLogMsg('Активирован: Rune Snatcher', '#00ff00')
}
var Snatcher = Game.AddScript("RuneSnatcher", SnatcherOnOff)