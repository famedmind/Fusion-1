var triggerradius = 425
var dforce		= 600
var damage		= [300, 450, 600]
var scepterdamage = [450, 600, 750]

D2JS.GetConfig('EzTechies', function(config) {
	D2JS.Configs.EzTechies = config
})

//Game.EzTechies.Remotemines = []
if(!Array.isArray(Game.EzTechies)){
	Game.EzTechies = []
	Game.EzTechies.Remotemines = []
}
if(!Array.isArray(Game.EzTechiesLVLUp)){
	Game.EzTechiesLVLUp = []
}

for(i in Game.Particles.EzTechies){
	try{Particles.DestroyParticleEffect(parseInt(Game.Particles.EzTechies[i]),parseInt(Game.Particles.EzTechies[i]))}catch(e){}
}
Game.Particles.EzTechies = []

try{ Game.Panels.EzTechies.DeleteAsync(0) }catch(e){}
try{ GameEvents.Unsubscribe(parseInt(Game.Subscribes.EzTechiesRemoteMinesSpawn)) }catch(e){}
try{ GameEvents.Unsubscribe(parseInt(Game.Subscribes.UltiUp)) }catch(e){}

Game.Subscribes.UltiUp = GameEvents.Subscribe("dota_player_learned_ability", function(event) {
	if(event.PlayerID != Game.GetLocalPlayerID() || event.abilityname!='techies_remote_mines')
		return
	
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var lvl = Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, 'techies_remote_mines')) - 1
	Game.EzTechiesLVLUp[lvl] = Game.GetGameTime()
})

Game.Subscribes.EzTechiesRemoteMinesSpawn = GameEvents.Subscribe('npc_spawned', function(event) {
	var ent = parseInt(event.entindex)
	if(Entities.IsEnemy(ent))
		return
	if(Entities.GetUnitName(ent) === 'npc_dota_techies_remote_mine'){
		radius = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , ent)
		Particles.SetParticleControl(radius, 1, [triggerradius, 0, 0])
		Game.Particles.EzTechies.push(radius)
	}
})

function EzTechiesF() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var force = Game.GetAbilityByName(MyEnt,'item_force_staff')
	if (Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_techies')
		return
	var Ulti = Entities.GetAbility(MyEnt, 5)
	var UltiLvl = Abilities.GetLevel(Ulti)
	if(UltiLvl==0)
		return
	var HEnts = Game.PlayersHeroEnts()
	for (var i in HEnts) {
		var ent = parseInt(HEnts[i])
		var buffsnames = Game.GetBuffsNames(ent)
		if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		if(Game.GetMagicMultiplier(MyEnt, ent) === 0)
			continue
		
		var rmines = []
		var rminessummdmg = 0
		var NeedMagicDmg = Game.GetNeededMagicDmg(MyEnt, ent, Entities.GetHealth(ent))
		var mines = Entities.GetAllEntitiesByClassname('npc_dota_techies_mines').filter(function(ent) {
			return Entities.IsAlive(ent) && Entities.GetUnitName(ent) === 'npc_dota_techies_remote_mine' && Entities.IsValidEntity(ent)
		})
		for(var m in mines) {
			var rmine = mines[m]
			var buffs = Game.GetBuffs(rmine)
			if(buffs.length==0)
				continue
			for(var k in buffs)
				if(Buffs.GetName(rmine,buffs[k]) === 'modifier_techies_remote_mine')
					var time = Buffs.GetCreationTime(rmine, buffs[k])
			for(var z = 0; z <= Game.EzTechiesLVLUp.length; z++) {
				if(time > Game.EzTechiesLVLUp[z]){
					if(Entities.HasScepter(MyEnt))
						var dmg = scepterdamage[z]
					else
						var dmg = damage[z]
					if(Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1 === z)
						break
				}
			}
			if(Entities.GetRangeToUnit(rmine, ent) <= triggerradius) {
				rmines.push(rmine)
				rminessummdmg += dmg
				if(rminessummdmg >= NeedMagicDmg)
					break
			} else
				continue
		}
		
		if(rmines.length !== 0 && rminessummdmg !== 0) {
			if (rminessummdmg >= NeedMagicDmg){
				for(n in rmines) {
					var rminesn = parseInt(rmines[n])
					GameUI.SelectUnit(rminesn, false)
					Game.CastNoTarget(rminesn, Entities.GetAbilityByName(rminesn, 'techies_remote_mines_self_detonate'), false)
				}
				GameUI.SelectUnit(MyEnt, false)
			}
		} else {
			if (
				force !== -1
				&& Abilities.GetCooldownTimeRemaining(force) === 0
				&& Entities.GetRangeToUnit(MyEnt, ent) <= Abilities.GetCastRangeFix(force)
			) {
				var rmines = []
				var rminessummdmg = 0
				C:
				for(var m in mines){
					var rmine = mines[m]
					var buffs = Game.GetBuffs(rmine)
					if(buffs.length==0)
						continue
					for(var k in buffs)
						if(Buffs.GetName(rmine,buffs[k])=='modifier_techies_remote_mine')
							var time = Buffs.GetCreationTime(rmine, buffs[k])
					for(var z = 0; z <= Game.EzTechiesLVLUp.length; z++) {
						if(time > Game.EzTechiesLVLUp[z]) {
							if(Entities.HasScepter(MyEnt))
								var dmg = scepterdamage[z]
							else
								var dmg = damage[z]
							if(Abilities.GetLevel(Entities.GetAbilityByName(MyEnt, "techies_remote_mines")) - 1 === z)
								break
						}
					}
					var entVec = Entities.GetAbsOrigin(ent)
					var mineVec = Entities.GetAbsOrigin(rmine)
					var entForward = Entities.GetForward(ent)
					var forceVec = [
						entVec[0] + entForward[0] * dforce,
						entVec[1] + entForward[1] * dforce,
						entVec[2] + entForward[2] * dforce
					]
					if(Game.PointDistance(forceVec, mineVec) > triggerradius)
						continue
					else {
						rmines.push(rmine)
						rminessummdmg += dmg
						if(rminessummdmg >= NeedMagicDmg){
							GameUI.SelectUnit(MyEnt,false)
							Game.CastTarget(MyEnt, force, ent, false)
							break
						}
					}
				}
			}
		}
	}
}
function RefreshR() {
	var mines = Entities.GetAllEntitiesByClassname('npc_dota_techies_mines')
	for(i in Game.Particles.EzTechies){
		Particles.DestroyParticleEffect(parseInt(Game.Particles.EzTechies[i]),parseInt(Game.Particles.EzTechies[i]))
	}
	Game.Particles.EzTechies = []
	for(m in mines) {
		var rmine = mines[m]
		if(Entities.GetUnitName(rmine)!='npc_dota_techies_remote_mine')
			continue
		var particle = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , rmine)
		Particles.SetParticleControl(particle, 1, [triggerradius,0,0])
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
	if ( Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_techies' ){
		EzTechies.checked = false
		Game.ScriptLogMsg('Error: Your hero must be Techies to run this script', '#ff0000')
		return
	}
	RefreshR()
	Game.Panels.EzTechies = $.CreatePanel( "Panel", Game.GetMainHUD(), "EzTechiesSlider" )
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
		Game.Panels.EzTechies.Children()[0].max = 500
		Game.Panels.EzTechies.Children()[0].value = triggerradius
		Game.Panels.EzTechies.Children()[0].lastval = Game.Panels.EzTechies.Children()[0].value
		function x(){
			$.Schedule (
				Game.MyTick,
				function() {
					if(Game.Panels.EzTechies.Children()[0].value!=Game.Panels.EzTechies.Children()[0].lastval){
						triggerradius = Game.Panels.EzTechies.Children()[0].value
						Game.Panels.EzTechies.Children()[1].Children()[1].text = Math.floor(triggerradius)
						RefreshR()
					}
					Game.Panels.EzTechies.Children()[0].lastval=Game.Panels.EzTechies.Children()[0].value
					if(EzTechies.checked)
						x() 
				}
			)
		}
		x()
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