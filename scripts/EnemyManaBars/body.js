var MainHud = Fusion.GetMainHUD()
var uiw, uih
function DeleteAll() {
	try {
		Fusion.Panels.EnemyManaBars.forEach(function(panel) {
			try {
				panel.DeleteAsync(0)
			} catch(e) {  }
		})
	} catch(e) {  }
	try {
		Fusion.Particles.EnemyManaBars.forEach(function(par) {
			try {
				Particles.DestroyParticleEffect(par, par)
			} catch(e) {  }
		})
	} catch(e) {  }
	Fusion.Panels.EnemyManaBars = []
	Fusion.Particles.EnemyManaBars = []
}
DeleteAll()

function EMBEvery() {
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	})
	
	for(var i in Fusion.Panels.EnemyManaBars)
		if(HEnts.indexOf(i) === -1)
			Fusion.Panels.EnemyManaBars[i].visible = false
	
	HEnts.forEach(function(ent) {
		if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent) || Game.IsIllusion(ent)) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			if(Entities.IsEnemy(ent) && Game.IsIllusion(ent) && typeof Fusion.Particles.EnemyManaBars[ent] === 'undefined' && Fusion.Configs.EnemyManaBars.DisplayParticle) {
				Fusion.Particles.EnemyManaBars[ent] = Particles.CreateParticle("particles/dark_smoke_test.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
				Particles.SetParticleControl(Fusion.Particles.EnemyManaBars[ent], 1, [500, 0, 0])
			}
			return
		}
		var xyz = Entities.GetAbsOrigin(ent)
		var healthbaroffset = 200
		if (!xyz || !healthbaroffset) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		var uix = Game.WorldToScreenX(xyz[0], xyz[1], xyz[2] + healthbaroffset),
			uiy = Game.WorldToScreenY(xyz[0], xyz[1], xyz[2] + healthbaroffset)
		if (uix == -1 || uiy == -1) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		var uixp = uix / uiw * 100
		var uiyp = uiy / uih * 100
		if (!isFinite(uixp) || !isFinite(uiyp) || !uixp || !uiyp) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		if (!Fusion.Panels.EnemyManaBars[ent]) {
			Fusion.Panels.EnemyManaBars[ent] = $.CreatePanel("Panel", MainHud, "EnemyManaBar")
			Fusion.Panels.EnemyManaBars[ent].BLoadLayoutFromString("\
				<root>\
					<Panel style='margin: -22px 0 0 -52px;width:103px;height:15px;background-color:#000000ff;border: 1px solid #333;' class='EnemyManaBar'>\
						<Panel 	style='width:60%;height:100%;background-color:#4444ffff;'/>\
						<Label style='color:#ffffff55;font-size:13px;font-weight: bold;width:100%;opacity:0.5;text-align: center;' text='60%'/>\
					</Panel>\
				</root>\
			", false, false)
		}
		Fusion.Panels.EnemyManaBars[ent].visible = true
		Fusion.Panels.EnemyManaBars[ent].style.position = uixp + '% ' + uiyp + '% 0'
		var Mana = Entities.GetMana(parseInt(ent))
		var MaxMana = Entities.GetMaxMana(parseInt(ent))
		var ManaPercent = Math.floor(Mana / MaxMana * 100)
		if (!ManaPercent) {
			if (Fusion.Panels.EnemyManaBars[ent])
				Fusion.Panels.EnemyManaBars[ent].visible = false
			return
		}
		Fusion.Panels.EnemyManaBars[ent].Children()[0].style.width = ManaPercent + '%'
		Fusion.Panels.EnemyManaBars[ent].Children()[1].text = ManaPercent + '%'
	})
	if(EnemyManaBars.checked)
		$.Schedule(Fusion.MyTick, EMBEvery)
	else
		DeleteAll()
}

EnemyManaBarsF = function() {
	if (!EnemyManaBars.checked) {
		Game.ScriptLogMsg('Script disabled: EnemyManaBars', '#ff0000')
	} else {
		uiw = Fusion.GetMainHUD().actuallayoutwidth
		uih = Fusion.GetMainHUD().actuallayoutheight
		Fusion.GetConfig('EnemyManaBars', function(config) {
			Fusion.Configs.EnemyManaBars = config[0]
			EMBEvery()
		})
		Game.ScriptLogMsg('Script enabled: EnemyManaBars', '#00ff00')
	}
}
		
var EnemyManaBars = Game.AddScript('EnemyManaBars', EnemyManaBarsF)