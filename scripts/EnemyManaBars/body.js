var MainHud = Game.GetMainHUD()
var uiw, uih
function DeleteAll() {
	try {
		for(var panel of Game.Panels.EnemyManaBars)
			try {
				panel.DeleteAsync(0)
			} catch(e) {  }
	} catch(e) {  }
	try {
		for(var i in Game.Particles.EnemyManaBars)
			try {
				var par = Game.Particles.EnemyManaBars[i]
				Particles.DestroyParticleEffect(par, par)
			} catch(e) {  }
	} catch(e) {  }
	Game.Panels.EnemyManaBars=[]
	Game.Particles.EnemyManaBars=[]
}
DeleteAll()

function EMBEvery() {
	var Ents = Entities.GetAllHeroEntities()
	for(var i in Game.Panels.EnemyManaBars)
		if (Ents.indexOf(i) === -1)
			Game.Panels.EnemyManaBars[i].visible = false
		for (var ent of Ents) {
			if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent) || Game.IsIllusion(ent)) {
				if (Game.Panels.EnemyManaBars[ent])
					Game.Panels.EnemyManaBars[ent].visible = false
				if(Entities.IsEnemy(ent) && Game.IsIllusion(ent) && typeof Game.Particles.EnemyManaBars[ent] === 'undefined' && D2JS.Configs.EnemyManaBars.DisplayParticle) {
					Game.Particles.EnemyManaBars[ent] = Particles.CreateParticle("particles/dark_smoke_test.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
					Particles.SetParticleControl(Game.Particles.EnemyManaBars[ent], 1, [500, 0, 0])
				}
				continue
			}
			var xyz = Entities.GetAbsOrigin(ent)
			var healthbaroffset = 200
			if (!xyz || !healthbaroffset) {
				if (Game.Panels.EnemyManaBars[ent])
					Game.Panels.EnemyManaBars[ent].visible = false
				continue
			}
			var uix = Game.WorldToScreenX(xyz[0], xyz[1], xyz[2] + healthbaroffset),
				uiy = Game.WorldToScreenY(xyz[0], xyz[1], xyz[2] + healthbaroffset)
			if (uix == -1 || uiy == -1) {
				if (Game.Panels.EnemyManaBars[ent])
					Game.Panels.EnemyManaBars[ent].visible = false
				continue
			}
			var uixp = uix / uiw * 100
			var uiyp = uiy / uih * 100
			if (!isFinite(uixp) || !isFinite(uiyp) || !uixp || !uiyp) {
				if (Game.Panels.EnemyManaBars[ent])
					Game.Panels.EnemyManaBars[ent].visible = false
				continue
			}
			if (!Game.Panels.EnemyManaBars[ent]) {
				Game.Panels.EnemyManaBars[ent] = $.CreatePanel("Panel", MainHud, "EnemyManaBar")
				Game.Panels.EnemyManaBars[ent].BLoadLayoutFromString("\
					<root>\
						<Panel style='margin: -22px 0 0 -52px;width:103px;height:15px;background-color:#000000ff;border: 1px solid #333;' class='EnemyManaBar'>\
							<Panel 	style='width:60%;height:100%;background-color:#4444ffff;'/>\
							<Label style='color:#ffffff55;font-size:13px;font-weight: bold;width:100%;opacity:0.5;text-align: center;' text='60%'/>\
						</Panel>\
					</root>\
				", false, false)
			}
			Game.Panels.EnemyManaBars[ent].visible = true
			Game.Panels.EnemyManaBars[ent].style.position = uixp + '% ' + uiyp + '% 0'
			var Mana = Entities.GetMana(parseInt(ent))
			var MaxMana = Entities.GetMaxMana(parseInt(ent))
			var ManaPercent = Math.floor(Mana / MaxMana * 100)
			if (!ManaPercent) {
				if (Game.Panels.EnemyManaBars[ent])
					Game.Panels.EnemyManaBars[ent].visible = false
				continue
			}
			Game.Panels.EnemyManaBars[ent].Children()[0].style.width = ManaPercent + '%'
			Game.Panels.EnemyManaBars[ent].Children()[1].text = ManaPercent + '%'
		}
		if(EnemyManaBars.checked)
			$.Schedule(Game.MyTick, EMBEvery)
		else
			DeleteAll()
}

EnemyManaBarsF = function() {
	if (!EnemyManaBars.checked) {
		Game.ScriptLogMsg('Script disabled: EnemyManaBars', '#ff0000')
	} else {
		uiw = Game.GetMainHUD().actuallayoutwidth
		uih = Game.GetMainHUD().actuallayoutheight
		D2JS.GetConfig('EnemyManaBars', function(config) {
			D2JS.Configs.EnemyManaBars = config[0]
			EMBEvery()
		})
		Game.ScriptLogMsg('Script enabled: EnemyManaBars', '#00ff00')
	}
}
		
var EnemyManaBars = Game.AddScript('EnemyManaBars', EnemyManaBarsF)