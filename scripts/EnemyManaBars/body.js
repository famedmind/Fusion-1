﻿var MainHud = Game.GetMainHUD()
var uiw, uih
for( var i in Game.Panels.EnemyManaBars )
	try {
		Game.Panels.EnemyManaBars[i].DeleteAsync(0)
	} catch(e) {}
Game.Panels.EnemyManaBars=[]

function EMBEvery(){
	var Ents = Entities.GetAllHeroEntities()
	for(var i in Game.Panels.EnemyManaBars)
		if (Ents.indexOf(i) == -1)
			Game.Panels.EnemyManaBars[i].visible = false
		for (var i in Ents) {
			if (!Entities.IsEnemy(Ents[i]) || !Entities.IsAlive(Ents[i]) || Game.IsIllusion(Ents[i])) {
				if (Game.Panels.EnemyManaBars[Ents[i]])
					Game.Panels.EnemyManaBars[Ents[i]].visible = false
				continue
			}
			var xyz = Entities.GetAbsOrigin(Ents[i])
			var healthbaroffset = Game.GetHealthBarOffset(Entities.GetUnitName(Ents[i]))
			if (!xyz || !healthbaroffset) {
				if (Game.Panels.EnemyManaBars[Ents[i]])
					Game.Panels.EnemyManaBars[Ents[i]].visible = false
				continue
			}
			uix = Game.WorldToScreenX( xyz[0], xyz[1], xyz[2]+healthbaroffset )
			uiy = Game.WorldToScreenY( xyz[0], xyz[1], xyz[2]+healthbaroffset )
			if (uix == -1 || uiy == -1) {
				if (Game.Panels.EnemyManaBars[Ents[i]])
					Game.Panels.EnemyManaBars[Ents[i]].visible = false
				continue
			}
			var uixp = uix / uiw * 100
			var uiyp = uiy / uih * 100
			if (!isFinite(uixp) || !isFinite(uiyp) || !uixp || !uiyp) {
				if (Game.Panels.EnemyManaBars[Ents[i]])
					Game.Panels.EnemyManaBars[Ents[i]].visible = false
				continue
			}
			if (!Game.Panels.EnemyManaBars[Ents[i]]) {
				Game.Panels.EnemyManaBars[Ents[i]] = $.CreatePanel("Panel", MainHud, "EnemyManaBar")
				Game.Panels.EnemyManaBars[Ents[i]].BLoadLayoutFromString("<root><Panel style='margin: -22px 0 0 -52px;width:103px;height:15px;background-color:#000000ff;border: 1px solid #333;' class='EnemyManaBar'><Panel 	style='width:60%;height:100%;background-color:#4444ffff;'></Panel><Label style='color:#ffffff55;font-size:13px;font-weight: bold;width:100%;opacity:0.5;text-align: center;' text='60%'/></Panel></root>", false, false)
			}
			Game.Panels.EnemyManaBars[Ents[i]].visible = true
			Game.Panels.EnemyManaBars[Ents[i]].style.position = uixp + '% ' + uiyp + '% 0'
			var Mana = Entities.GetMana(parseInt(Ents[i]))
			var MaxMana = Entities.GetMaxMana(parseInt(Ents[i]))
			var ManaPercent = Math.floor(Mana / MaxMana * 100)
			if (!ManaPercent) {
				if (Game.Panels.EnemyManaBars[Ents[i]])
					Game.Panels.EnemyManaBars[Ents[i]].visible = false
				continue
			}
			Game.Panels.EnemyManaBars[Ents[i]].Children()[0].style.width = ManaPercent + '%'
			Game.Panels.EnemyManaBars[Ents[i]].Children()[1].text = ManaPercent + '%'
		}
}

EnemyManaBarsF = function() {
	if (!EnemyManaBars.checked) {
		Game.DTick(EMBEvery)
		for(var i in Game.Panels.EnemyManaBars)
			try {
				Game.Panels.EnemyManaBars[i].DeleteAsync(0)
			} catch(e) {
				
			}
		Game.Panels.EnemyManaBars=[]
		Game.ScriptLogMsg('Script disabled: EnemyManaBars', '#ff0000')
	} else {
		Game.Tick(EMBEvery)
		uiw = Game.GetMainHUD().actuallayoutwidth
		uih = Game.GetMainHUD().actuallayoutheight
		Game.ScriptLogMsg('Script enabled: EnemyManaBars', '#00ff00')
	}
}
		
var EnemyManaBars = Game.AddScript('EnemyManaBars', EnemyManaBarsF)