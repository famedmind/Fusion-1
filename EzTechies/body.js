//Автоматическое взрывание бочек, отображенние суммарного урона стака мин, автофорсстафф, учет бафов

//радиус срабатывания дистанционных мин
var triggerradius = 300
//интервал(в секундах) через который будет делаться проверка
var interval = 0.1
//урон мин
var damageland = [150,190,225,260]
//урон бочек без аганима
var damage = [300,450,600]
//с аганимом
var scepterdamage = [450,600,750]

//бафы, при наличии которых у вражеских героев, мины не будут срабатывать
var IgnoreBuffs = [
	"modifier_abaddon_borrowed_time",
	"modifier_brewmaster_primal_split",
	"modifier_omniknight_repel",
	"modifier_phoenix_supernova_hiding",
	"modifier_tusk_snowball_movement",
	"modifier_tusk_snowball_movement_friendly",
	"modifier_juggernaut_blade_fury",
	"modifier_medusa_stone_gaze",
	"modifier_nyx_assassin_spiked_carapace",
	"modifier_templar_assassin_refraction_absorb",
	"modifier_oracle_false_promise",
	"modifier_dazzle_shallow_grave",
	"modifier_treant_living_armor",
	"modifier_life_stealer_rage"
]

//де\бафы на вражеских героях, умножающие маг. урон
var DebuffsAddMagicDmg = [
	//в большую сторону
	["modifier_item_veil_of_discord_debuff", 1.25],
	["modifier_bloodthorn_debuff", 1.3],
	["modifier_orchid_malevolence_debuff", 1.3],
	["modifier_item_ethereal_blade_ethereal", 1.4],
	["modifier_item_mask_of_madness_berserk", 1.25],
	["modifier_ghost_state", 1.4],
	["modifier_ice_vortex", [1.15,1.2,1.25,1.3]],
	["modifier_skywrath_mage_ancient_seal", [1.3,1.35,1.4,1.45]],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]],
	["modifier_shadow_demon_soul_catcher", [1.2,1.3,1.4,1.5]],
	["modifier_pugna_decrepify", [1.3,1.4,1.5,1.6]],
	
	//в меньшую сторону
	["modifier_item_pipe", 0.7],
	["modifier_ursa_enrage", 0.2],
	["modifier_item_pipe_aura", 0.9],
	["modifier_oracle_fates_edict", 0],
	["modifier_item_hood_of_defiance", 0.7],
	["modifier_item_planeswalkers_cloak", 0.85],
	["modifier_item_glimmer_cape", 0.85],
	["item_glimmer_cape_fade", 0.55],
	["modifier_wisp_overcharge", [0.95,0.9,0.85,0.8]],
	["modifier_pudge_flesh_heap", [0.94,0.92,0.9,0.88]],
	["modifier_rubick_null_field_effect", [0.9,0.86,0.82,0.78]],
	["modifier_antimage_spell_shield", [0.74,0.66,0.58,0.5]]
]

//бафы на вражеских героях, абсорбирующие определенное количество маг урона(не %)
var BuffsAbsorbMagicDmg = [
	["modifier_item_pipe_barrier", 400],
	["modifier_item_hood_of_defiance_barrier", 400],
	["modifier_item_infused_raindrop", 120],
	["modifier_abaddon_aphotic_shield", [110,140,170,200]],
	["modifier_ember_spirit_flame_guard", [50,200,350,500]]
]

//бафы на минере умножающие урон
var BuffsAddMagicDmgForMe = [
	["item_aether_lens", 1.05],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]]
]

//Game.EzTechies.Remotemines = []
if(!Array.isArray(Game.EzTechies)){
	Game.EzTechies = []
	Game.EzTechies.Remotemines = []
}
for(i in Game.EzTechies.Remotemines){
	try{Particles.DestroyParticleEffect(parseInt(Game.EzTechies.Remotemines[i][3]),parseInt(Game.EzTechies.Remotemines[i][3]))}catch(e){}
}

try{ Game.Panels.EzTechies.DeleteAsync(0) }catch(e){}
try{ GameEvents.Unsubscribe(parseInt(Game.Subscribes.EzTechiesRemoteMinesSpawn)) }catch(e){}
Game.Subscribes.EzTechiesRemoteMinesSpawn = GameEvents.Subscribe('npc_spawned', function(a){
	var ent = parseInt(a.entindex)
	if( Entities.IsEnemy(ent) )
		return
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(Entities.GetUnitName(ent)=='npc_dota_techies_remote_mine'){
		var type = 'remote'
		var UltiLvl = Abilities.GetLevel(Entities.GetAbility(MyEnt, 5))
		if (!Entities.HasScepter(MyEnt))
			var UltiDmg = damage[UltiLvl-1]
		else
			var UltiDmg = scepterdamage[UltiLvl-1]
		radius = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , ent)
		Particles.SetParticleControl(radius, 1, [triggerradius,0,0])
		Game.EzTechies.Remotemines.push( [ent, UltiDmg, type, radius] )
	}
	else if(Entities.GetUnitName(ent)=='npc_dota_techies_land_mine'){
		var type = 'land'
		var LandLvl = Abilities.GetLevel(Entities.GetAbility(MyEnt, 0))
		var LandDmg = damageland[LandLvl-1]
		radius = 0
		//radius = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , ent)
		//Particles.SetParticleControl(radius, 1, [triggerradius,0,0])
		Game.EzTechies.Remotemines.push( [ent, LandDmg, type, radius] )
	}
	else
		return
})
$.Msg(Game.GetBuffsNames(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())))

function EzTechiesF(){
	//получаем свой указатель
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var force = Game.GetAbilityByName(MyEnt,'item_force_staff')
	//проверяем включен ли скрипт в панели, выбран ли минер
	if ( !EzTechies.checked || Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_techies' )
		return
	//получаем указатель на свой ульт
	var Ulti = Entities.GetAbility(MyEnt, 5)
	//получаем уровень ультимейта
	var UltiLvl = Abilities.GetLevel(Ulti)
	//проверяем прокачку ульта
	if(UltiLvl==0)
		return
	//получаем объект с указателями на вражеских героев без иллюзий
	var HEnts = Game.PlayersHeroEnts()
	//в цикле перебираем вражеских героев
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		var buffsnames = Game.GetBuffsNames(ent)
		$.Msg(buffsnames)
		if ( !Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent) || Game.IntersecArrays(buffsnames, IgnoreBuffs))
			continue
		var MagicDamagePercent = 100 //%
		//базовый маг резист вражеского героя
		var MagicResist = Entities.GetBaseMagicalResistanceValue(ent)
		//объект с указателями на де\бафы вражеского героя
		var buffs = Game.GetBuffs(ent)
		//расчет доп. маг урона от дебафов у вражеского героя(н-р дискорд)
		for(m in buffs)
			for(k in DebuffsAddMagicDmg)
				if(Buffs.GetName(ent,buffs[m]) === DebuffsAddMagicDmg[k][0])
					if(Array.isArray(DebuffsAddMagicDmg[k][1]))
						MagicDamagePercent *= DebuffsAddMagicDmg[k][1][Abilities.GetLevel(Buffs.GetAbility(ent,buffs[i]))-1]
					else
						MagicDamagePercent *= DebuffsAddMagicDmg[k][1]
		//объект с указателями на мои бафы
		var buffsme = Game.GetBuffs(MyEnt)
		//расчет доп. маг урона от бафов на минере
		for(m in buffsme)
			for(k in BuffsAddMagicDmgForMe)
				if(Buffs.GetName(ent,buffsme[m]) === BuffsAddMagicDmgForMe[k][0])
					if(Array.isArray(BuffsAddMagicDmgForMe[k][1]))
						MagicDamagePercent *= BuffsAddMagicDmgForMe[k][1][Abilities.GetLevel(buffsme.GetAbility(ent,buffsme[i]))-1]
					else
						MagicDamagePercent *= BuffsAddMagicDmgForMe[k][1]
		if(MagicDamagePercent==0)
			continue
		//отнимаем маг. урон из-за бафов, абсорбирующих часть урона
		for(m in buffs)
			for(k in BuffsAbsorbMagicDmg)
				if(Buffs.GetName(ent,buffs[m]) === BuffsAbsorbMagicDmg[k][0])
					if(Array.isArray(BuffsAbsorbMagicDmg[k][1]))
						MagicDamagePercent -= BuffsAbsorbMagicDmg[k][1][Abilities.GetLevel(buffs.GetAbility(ent,buffs[i]))-1]
					else
						MagicDamagePercent -= BuffsAddMagicDmgForMe[k][1]
		//получили множитель маг урона, проверили бафы, теперь находим мины около противника и считаем урон
		var rmines = []
		var rminessummdmg = 0
		//здоровье вражеского героя
		var HP = Entities.GetHealth(ent)
		for(m in Game.EzTechies.Remotemines){
			var rmine = parseInt(Game.EzTechies.Remotemines[m][0])
			if(!Entities.IsValidEntity(rmine)){
				Game.EzTechies.Remotemines.splice(m,1)
				continue
			}
			var dmg = parseInt(Game.EzTechies.Remotemines[m][1])
			if( Entities.GetRangeToUnit(rmine,ent)>triggerradius )
				continue
			else{
				rmines.push(rmine)
				rminessummdmg += dmg
				if(rminessummdmg >= HP/100*MagicDamagePercent)
					break
			}
		}
		if(rmines.length!=0 || rminessummdmg!=0){
			if ( rminessummdmg >= HP/100*MagicDamagePercent ){
				for(n in rmines){
					var rminesn = parseInt(rmines[n])
					GameUI.SelectUnit(rminesn,false)
					Game.CastNoTarget(rminesn, parseInt(Entities.GetAbilityByName(rminesn, 'techies_remote_mines_self_detonate')), false)
					for(m in Game.EzTechies.Remotemines)
						if(Game.EzTechies.Remotemines[m][0]===rminesn)
							Game.EzTechies.Remotemines.splice(m,1)
					GameUI.SelectUnit(MyEnt)
				}
			}
		}else{
			
			if(force!=-1){
				
				var rmines = []
				var rminessummdmg = 0
				for(m in Game.EzTechies.Remotemines){
					var rmine = parseInt(Game.EzTechies.Remotemines[m][0])
					if(!Entities.IsValidEntity(rmine)){
						Game.EzTechies.Remotemines.splice(m,1)
						continue
					}
					var dmg = parseInt(Game.EzTechies.Remotemines[m][1])
					var zxc = Entities.GetAbsOrigin(ent)
					var zxcm = Entities.GetAbsOrigin(rmine)
					var dforce = 600
					var forward = Entities.GetForward(ent)
					var newzxc = [forward[0]*dforce+zxc[0],forward[1]*dforce+zxc[1],forward[2]*dforce+zxc[2]]
					var rng = Math.sqrt(Math.pow(newzxc[0]-zxcm[0],2)+Math.pow(newzxc[1]-zxcm[1],2)+Math.pow(newzxc[1]-zxcm[1],2))
					if(rng>triggerradius)
						continue
					else
					{
						rmines.push(rmine)
						rminessummdmg += dmg
						if(rminessummdmg >= HP/100*MagicDamagePercent){
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
function RefreshR(){
	for(i in Game.EzTechies.Remotemines){
		if(Game.EzTechies.Remotemines[i][2]!='remote')
			continue
		Particles.DestroyParticleEffect(parseInt(Game.EzTechies.Remotemines[i][3]),parseInt(Game.EzTechies.Remotemines[i][3]))
		Game.EzTechies.Remotemines[i][3] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , parseInt(Game.EzTechies.Remotemines[i][0]))
		Particles.SetParticleControl(parseInt(Game.EzTechies.Remotemines[i][3]), 1, [triggerradius,0,0])
	}
}
var EzTechiesCheckBoxClick = function(){
	if ( !EzTechies.checked ){
		try{Game.Panels.EzTechies.DeleteAsync(0)}catch(e){}
		for(i in Game.EzTechies.Remotemines){
			try{Particles.DestroyParticleEffect(parseInt(Game.EzTechies.Remotemines[i][3]),parseInt(Game.EzTechies.Remotemines[i][3]))}catch(e){}
		}
		Game.ScriptLogMsg('Script disabled: EzTechies', '#ff0000')
		return
	}
	if ( Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_techies' ){
		EzTechies.checked = false
		Game.ScriptLogMsg('EzTechies: Not Techies', '#ff0000')
		return
	}
	RefreshR()
	//циклически замкнутый таймер с проверкой условия с интервалом 'interval'
	Game.Panels.EzTechies = $.CreatePanel( "Panel", Game.GetMainHUD(), "EzTechiesSlider" )
	Game.Panels.EzTechies.BLoadLayoutFromString( '<root><styles><include src="s2r://panorama/styles/dotastyles.vcss_c" /><include src="s2r://panorama/styles/magadan.vcss_c" /></styles><Panel style="padding:3px;border-radius:5px;width:150px;height:50px;flow-children:down;background-color:#000000EE;"><Slider class="HorizontalSlider" style="width:600px;" direction="horizontal" text="zxc"/><Panel style="flow-children:right;horizontal-align:center;"><Label text="Радиус триггера:" style="font-size:14px;"/><Label text="300" style="color:green;font-size:16px;"/></Panel></Panel></root>', false, false)
	var Config = []
	GameUI.MovePanel(Game.Panels.EzTechies,function(p){
		var position = p.style.position.split(' ')
		Config.MainPanel.x = position[0]
		Config.MainPanel.y = position[1]
		Game.SaveConfig('eztechies', Config)
	})
	Game.GetConfig('eztechies',function(a){
		Config = a[0]
		Game.Panels.EzTechies.style.position = Config.MainPanel.x + ' ' + Config.MainPanel.y + ' 0'
	});
	var slider = []
	Game.Panels.EzTechies.Children()[0].min = 0
	Game.Panels.EzTechies.Children()[0].max = 500
	Game.Panels.EzTechies.Children()[0].value = triggerradius
	Game.Panels.EzTechies.Children()[0].lastval = Game.Panels.EzTechies.Children()[0].value
	function x(){ $.Schedule( 0.1,function(){
		if(Game.Panels.EzTechies.Children()[0].value!=Game.Panels.EzTechies.Children()[0].lastval){
			triggerradius=Game.Panels.EzTechies.Children()[0].value
			Game.Panels.EzTechies.Children()[1].Children()[1].text = Math.floor(triggerradius)
			RefreshR()
		}
		Game.Panels.EzTechies.Children()[0].lastval=Game.Panels.EzTechies.Children()[0].value
		if(EzTechies.checked)
			x() 
		}
	)}
	x()
	function f(){ $.Schedule( interval,function(){
		EzTechiesF()
		if(EzTechies.checked)
			f()
		}
	)}
	f()
	Game.ScriptLogMsg('Script enabled: EzTechies', '#00ff00')
}

var EzTechies = Game.AddScript('EzTechies', EzTechiesCheckBoxClick)