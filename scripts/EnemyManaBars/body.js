var MainHud = D2JS.GetMainHUD()
var uiw, uih
function DeleteAll() {
	try {
		D2JS.Panels.EnemyManaBars.forEach(function(panel) {
			try {
				panel.DeleteAsync(0)
			} catch(e) {  }
		})
	} catch(e) {  }
	try {
		D2JS.Particles.EnemyManaBars.forEach(function(par) {
			try {
				Particles.DestroyParticleEffect(par, par)
			} catch(e) {  }
		})
	} catch(e) {  }
	D2JS.Panels.EnemyManaBars = []
	D2JS.Particles.EnemyManaBars = []
}
DeleteAll()

function EMBEvery() {
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	})
	
	for(var i in D2JS.Panels.EnemyManaBars)
		if(HEnts.indexOf(i) === -1)
			D2JS.Panels.EnemyManaBars[i].visible = false
	
	HEnts.forEach(function(ent) {
		if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent) || Game.IsIllusion(ent)) {
			if (D2JS.Panels.EnemyManaBars[ent])
				D2JS.Panels.EnemyManaBars[ent].visible = false
			if(Entities.IsEnemy(ent) && Game.IsIllusion(ent) && typeof D2JS.Particles.EnemyManaBars[ent] === 'undefined' && D2JS.Configs.EnemyManaBars.DisplayParticle) {
				D2JS.Particles.EnemyManaBars[ent] = Particles.CreateParticle("particles/dark_smoke_test.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
				Particles.SetParticleControl(D2JS.Particles.EnemyManaBars[ent], 1, [500, 0, 0])
			}
			return
		}
		var xyz = Entities.GetAbsOrigin(ent)
		var healthbaroffset = 200
		if (!xyz || !healthbaroffset) {
			if (D2JS.Panels.EnemyManaBars[ent])
				D2JS.Panels.EnemyManaBars[ent].visible = false
			return
		}
		var uix = Game.WorldToScreenX(xyz[0], xyz[1], xyz[2] + healthbaroffset),
			uiy = Game.WorldToScreenY(xyz[0], xyz[1], xyz[2] + healthbaroffset)
		if (uix == -1 || uiy == -1) {
			if (D2JS.Panels.EnemyManaBars[ent])
				D2JS.Panels.EnemyManaBars[ent].visible = false
			return
		}
		var uixp = uix / uiw * 100
		var uiyp = uiy / uih * 100
		if (!isFinite(uixp) || !isFinite(uiyp) || !uixp || !uiyp) {
			if (D2JS.Panels.EnemyManaBars[ent])
				D2JS.Panels.EnemyManaBars[ent].visible = false
			return
		}
		if (!D2JS.Panels.EnemyManaBars[ent]) {
			D2JS.Panels.EnemyManaBars[ent] = $.CreatePanel("Panel", MainHud, "EnemyManaBar")
			D2JS.Panels.EnemyManaBars[ent].BLoadLayoutFromString("\
				<root>\
					<Panel style='margin: -22px 0 0 -52px;width:103px;height:15px;background-color:#000000ff;border: 1px solid #333;' class='EnemyManaBar'>\
						<Panel 	style='width:60%;height:100%;background-color:#4444ffff;'/>\
						<Label style='color:#ffffff55;font-size:13px;font-weight: bold;width:100%;opacity:0.5;text-align: center;' text='60%'/>\
					</Panel>\
				</root>\
			", false, false)
		}
		D2JS.Panels.EnemyManaBars[ent].visible = true
		D2JS.Panels.EnemyManaBars[ent].style.position = uixp + '% ' + uiyp + '% 0'
		var Mana = Entities.GetMana(parseInt(ent))
		var MaxMana = Entities.GetMaxMana(parseInt(ent))
		var ManaPercent = Math.floor(Mana / MaxMana * 100)
		if (!ManaPercent) {
			if (D2JS.Panels.EnemyManaBars[ent])
				D2JS.Panels.EnemyManaBars[ent].visible = false
			return
		}
		D2JS.Panels.EnemyManaBars[ent].Children()[0].style.width = ManaPercent + '%'
		D2JS.Panels.EnemyManaBars[ent].Children()[1].text = ManaPercent + '%'
	})
	if(EnemyManaBars.checked)
		$.Schedule(D2JS.MyTick, EMBEvery)
	else
		DeleteAll()
}

EnemyManaBarsF = function() {
	if (!EnemyManaBars.checked) {
		Game.ScriptLogMsg('Script disabled: EnemyManaBars', '#ff0000')
	} else {
		uiw = D2JS.GetMainHUD().actuallayoutwidth
		uih = D2JS.GetMainHUD().actuallayoutheight
		D2JS.GetConfig('EnemyManaBars', function(config) {
			D2JS.Configs.EnemyManaBars = config[0]
			EMBEvery()
		})
		Game.ScriptLogMsg('Script enabled: EnemyManaBars', '#00ff00')
	}
}
		
var EnemyManaBars = Game.AddScript('EnemyManaBars', EnemyManaBarsF)