var triggerradius = 425
var dforce		= 600
var damage		= [300, 450, 600]
var scepterdamage = [450, 600, 750]

init()
function init() {
	D2JS.EzTechiesLVLUp = [-1, -1, -1]
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, 'techies_remote_mines')) - 1
	D2JS.EzTechiesLVLUp[lvl] = Game.GetGameTime()
}

for(i in Game.Particles.EzTechies)
	try {
		var par = parseInt(Game.Particles.EzTechies[i])
		Particles.DestroyParticleEffect(par, par)
	} catch(e) {  }
Game.Particles.EzTechies = []

try {
	Game.Panels.EzTechies.DeleteAsync(0)
} catch(e) {  }
try {
	GameEvents.Unsubscribe(parseInt(Game.Subscribes.EzTechiesMinesSpawn))
} catch(e) {  }
try {
	GameEvents.Unsubscribe(parseInt(Game.Subscribes.UltiUp))
} catch(e) {  }

Game.Subscribes.UltiUp = GameEvents.Subscribe("dota_player_learned_ability", function(event) {
	if(event.PlayerID != Game.GetLocalPlayerID() || event.abilityname!='techies_remote_mines')
		return
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, 'techies_remote_mines')) - 1
	D2JS.EzTechiesLVLUp[lvl] = Game.GetGameTime()
})

Game.Subscribes.EzTechiesMinesSpawn = GameEvents.Subscribe('npc_spawned', function(event) {
	var ent = parseInt(event.entindex)
	if(Entities.IsEnemy(ent))
		return
	if(Entities.GetUnitName(ent) === 'npc_dota_techies_remote_mine')
		var range = triggerradius
	else if(Entities.GetUnitName(ent) === 'npc_dota_techies_land_mine')
		var range = 400
	else
		return
	radius = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, ent)
	Particles.SetParticleControl(radius, 1, [range, 0, 0])
	Game.Particles.EzTechies.push(radius)
})

function EzTechiesF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	}).sort(function(ent1, ent2) {
		var rng1 = Entities.GetHealth(ent1)
		var rng2 = Entities.GetHealth(ent2)
		
		if(rng1 === rng2)
			return 0
		if(rng1 > rng2)
			return 1
		else
			return -1
	})
try {
	RemoteMines(MyEnt, HEnts)
	DenyMines(MyEnt)
} catch(e) {
	$.Msg(e.stack)
}
}

function CallMines(MyEnt, ent, callback, explosionCallback) {
	var mines = Entities.GetAllEntitiesByClassname('npc_dota_techies_mines').filter(function(ent) {
		return Entities.IsAlive(ent) && Entities.GetUnitName(ent) === 'npc_dota_techies_remote_mine' && Entities.IsValidEntity(ent)
	})
	var NeedMagicDmg = Game.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent))
	var rmines = []
	var rminessumdmg = 0
	if(Game.GetMagicMultiplier(MyEnt, ent) === 0)
		return
	mines.some(function(rmine) {
		var buffs = Game.GetBuffs(rmine)
		if(buffs.length === 0)
			return false
		
		var time = -1
		for(var k in buffs)
			if(Buffs.GetName(rmine, buffs[k]) === 'modifier_techies_remote_mine')
				var time = Buffs.GetCreationTime(rmine, buffs[k])
		if(time === -1)
			return false
		
		var dmg = 0
		for(var z = D2JS.EzTechiesLVLUp.length; z >= 0; z--)
			if(D2JS.EzTechiesLVLUp[z] !== -1 && time > D2JS.EzTechiesLVLUp[z]) {
				if(Entities.HasScepter(MyEnt))
					dmg = scepterdamage[z]
				else
					dmg = damage[z]
				break
			}
		
		if(callback(MyEnt, ent, rmine)) {
			rmines.push(rmine)
			rminessumdmg += dmg
			if(D2JS.debug)
				$.Msg("There's " + rminessumdmg + ", need " + NeedMagicDmg + " for " + Entities.GetUnitName(ent))
			if(rminessumdmg >= NeedMagicDmg) {
				explosionCallback(MyEnt, ent, rmines, rminessumdmg)
				return true
			}
		} else
			return false
	})
}

function DenyMines(MyEnt) {
	var dmgMines = Entities.GetAllEntitiesByClassname('npc_dota_techies_mines').filter(function(ent) {
		return Entities.IsAlive(ent) && Entities.GetUnitName(ent) === 'npc_dota_techies_remote_mine' && Entities.IsValidEntity(ent) && Entities.GetHealthPercent(ent) !== 100
	})
	dmgMines.forEach(function(rmine) {
		GameUI.SelectUnit(rmine, false)
		Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, 'techies_remote_mines_self_detonate'), false)
	})
	if(dmgMines.length !== 0)
		GameUI.SelectUnit(MyEnt, false)
}

function RemoteMines(MyEnt, HEnts) {
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl == 0)
		return
	
	HEnts = HEnts.filter(function(ent) {
		return Game.GetMagicMultiplier(MyEnt, ent) !== 0
	})
	HEnts.forEach(function(ent) {
		var callBackCalled = false
		CallMines (
			MyEnt, ent,
			function(MyEnt, ent, rmine) {
				return Entities.GetRangeToUnit(rmine, ent) <= triggerradius
			},
			function(MyEnt, ent, rmines) {
				callBackCalled = true
				rmines.forEach(function(rmine) {
					GameUI.SelectUnit(rmine, false)
					Game.CastNoTarget(rmine, Entities.GetAbilityByName(rmine, 'techies_remote_mines_self_detonate'), false)
				})
				GameUI.SelectUnit(MyEnt, false)
			}
		)
		
		var force = Game.GetAbilityByName(MyEnt,'item_force_staff')
		if (
			!callBackCalled &&
			force !== -1 &&
			Abilities.GetCooldownTimeRemaining(force) === 0 &&
			Entities.GetRangeToUnit(MyEnt, ent) <= Abilities.GetCastRangeFix(force)
		)
			CallMines (
				MyEnt, ent,
				function(MyEnt, ent, rmine) {
					var mineVec = Entities.GetAbsOrigin(rmine)
					var forceVec = D2JS.ForceStaffPos(ent)
					
					return Game.PointDistance(forceVec, mineVec) <= triggerradius
				},
				function(MyEnt, ent, rmines) {
					GameUI.SelectUnit(MyEnt,false)
					Game.CastTarget(MyEnt, force, ent, false)
				}
			)
	})
}

function RefreshR() {
	for(i in Game.Particles.EzTechies) {
		var par = parseInt(Game.Particles.EzTechies[i])
		Particles.DestroyParticleEffect(par, par)
	}
	Game.Particles.EzTechies = []
	var rmines = Entities.GetAllEntitiesByClassname('npc_dota_techies_mines')
	for(var rmine of rmines) {
		if(Entities.GetUnitName(rmine) === 'npc_dota_techies_remote_mine')
			var range = triggerradius
		else if(Entities.GetUnitName(rmine) === 'npc_dota_techies_land_mine')
			var range = 400
		else
			continue
		var particle = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW, rmine)
		Particles.SetParticleControl(particle, 1, [range, 0, 0])
		Game.Particles.EzTechies.push(particle)
	}
}

var EzTechiesCheckBoxClick = function(){
	if (!EzTechies.checked) {
		try{Game.Panels.EzTechies.DeleteAsync(0)}catch(e){}
		for(i in Game.Particles.EzTechies){
			Particles.DestroyParticleEffect(parseInt(Game.Particles.EzTechies[i]),parseInt(Game.Particles.EzTechies[i]))
			}
		Game.Particles.EzTechies = []
		Game.ScriptLogMsg('Script disabled: EzTechies', '#ff0000')
		return
	}
	if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_techies') {
		EzTechies.checked = false
		Game.ScriptLogMsg('Error: Your hero must be Techies to run this script', '#ff0000')
		return
	}
	RefreshR()
	Game.Panels.EzTechies = $.CreatePanel( "Panel", Game.GetMainHUD(), "EzTechiesSlider" )
	D2JS.GetConfig('EzTechies', function(config) {
		D2JS.Configs.EzTechies = config[0]
		D2JS.GetXML('EzTechies/slider', function(xml) {
			Game.Panels.EzTechies.BLoadLayoutFromString(xml, false, false)
			GameUI.MovePanel (
				Game.Panels.EzTechies,
				function(p) {
					var position = p.style.position.split(' ')
					D2JS.Configs.EzTechies.MainPanel.x = position[0]
					D2JS.Configs.EzTechies.MainPanel.y = position[1]
					D2JS.SaveConfig('EzTechies', D2JS.Configs.EzTechies)
				}
			)
			
			Game.Panels.EzTechies.style.position = D2JS.Configs.EzTechies.MainPanel.x + ' ' + D2JS.Configs.EzTechies.MainPanel.y + ' 0'
			var slider = []
			Game.Panels.EzTechies.Children()[0].min = 0
			Game.Panels.EzTechies.Children()[0].max = triggerradius
			Game.Panels.EzTechies.Children()[0].value = triggerradius
			Game.Panels.EzTechies.Children()[0].lastval = Game.Panels.EzTechies.Children()[0].value
			function x() {
				if(Game.Panels.EzTechies.Children()[0].value !== Game.Panels.EzTechies.Children()[0].lastval){
					triggerradius = Game.Panels.EzTechies.Children()[0].value
					Game.Panels.EzTechies.Children()[1].Children()[1].text = Math.floor(triggerradius)
					RefreshR()
				}
				Game.Panels.EzTechies.Children()[0].lastval = Game.Panels.EzTechies.Children()[0].value
				if(EzTechies.checked)
					$.Schedule(Game.MyTick, x)
			}
			x()
		})
	})
	
	function f() {
		$.Schedule (
			Game.MyTick,
			function() {
				EzTechiesF()
				if(EzTechies.checked)
					f()
			}
		)
	}
	f()
	Game.ScriptLogMsg('Script enabled: EzTechies', '#00ff00')
}

var EzTechies = Game.AddScript('EzTechies', EzTechiesCheckBoxClick)
