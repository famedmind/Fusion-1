//Автоматически прожимает ульт когда у вражеского героя мало здоровья. Автоматически расчитывает маг. резист, уровень ультимейта, наличие аганима и де\бафов.

//интервал(в секундах) через который будет делаться проверка
var interval = 0.3
//урон ульта без аганима
var damage = [225,325,425]
//с аганимом
var scepterdamage = [440,540,640]
//манакост
var manacost = [225,325,450]
//debugg
var debug = false

//бафы, при наличии которых у вражеских героев, ульт не будет срабатывать
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
	"modifier_life_stealer_rage",
	"modifier_item_aegis"
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

//бафы на зевсе умножающие урон
var BuffsAddMagicDmgForMe = [
	["item_aether_lens", 1.05],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]]
]


function ZeusAutoultF(){
	//проверяем включен ли скрипт в панели
	if ( !ZeusAutoult.checked )
		return
	//получаем свой указатель
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	if(debug)
		$.Msg( 'My buffs: ' + Game.GetBuffsNames(MyEnt) )
	//получаем указатель на свой ульт
	var Ulti = Entities.GetAbility(MyEnt, 3)
	//получаем уровень ультимейта
	var UltiLvl = Abilities.GetLevel(Ulti)
	//проверяем прокачку ульта
	if(UltiLvl==0)
		return
	//проверяем кулдаун ульта и достаток маны
	if ( Abilities.GetCooldownTimeRemaining(Ulti) != 0 || Entities.GetMana(MyEnt)<manacost[UltiLvl-1] )
		return
	//проверяем наличие аганима
	if (!Entities.HasScepter(MyEnt))
		var UltiDmg = damage[UltiLvl-1]
	else
		var UltiDmg = scepterdamage[UltiLvl-1]
	//получаем объект с указателями на вражеских героев без иллюзий
	var HEnts = Game.PlayersHeroEnts()
	//в цикле перебираем вражеских героев
	for (i in HEnts) {
		ent = parseInt(HEnts[i])
		var MagicDamage = UltiDmg
		//объект с именами бафов
		var buffsnames = Game.GetBuffsNames(ent)
		if(debug)
			$.Msg( 'Enemy[' + ent + '] buffs: ' + buffsnames )
		//проверяем чтобы ульт не сработал на союзника, в бкб, в эгиду в игнорируемые бафы(н-р карапасы, рефракшн)
		if ( !Entities.IsEnemy(ent) || Entities.IsMagicImmune(ent) || !Entities.IsAlive(ent) || Game.IntersecArrays(buffsnames, IgnoreBuffs))
			continue
		//базовый маг резист вражеского героя
		var MagicResist = Entities.GetBaseMagicalResistanceValue(ent)
		//объект с указателями на де\бафы вражеского героя
		var buffs = Game.GetBuffs(ent)
		//расчет доп. маг урона от дебафов у вражеского героя(н-р дискорд)
		for(m in buffs)
			for(k in DebuffsAddMagicDmg)
				if(Buffs.GetName(ent,buffs[m]) === DebuffsAddMagicDmg[k][0])
					if(Array.isArray(DebuffsAddMagicDmg[k][1]))
						MagicDamage *= DebuffsAddMagicDmg[k][1][Abilities.GetLevel(Buffs.GetAbility(ent,buffs[i]))-1]
					else
						MagicDamage *= DebuffsAddMagicDmg[k][1]
		//объект с указателями на мои бафы
		var buffsme = Game.GetBuffs(MyEnt)
		//расчет доп. маг урона от бафов на зевсе
		for(m in buffsme)
			for(k in BuffsAddMagicDmgForMe)
				if(Buffs.GetName(ent,buffsme[m]) === BuffsAddMagicDmgForMe[k][0])
					if(Array.isArray(BuffsAddMagicDmgForMe[k][1]))
						MagicDamage *= BuffsAddMagicDmgForMe[k][1][Abilities.GetLevel(buffsme.GetAbility(ent,buffsme[i]))-1]
					else
						MagicDamage *= BuffsAddMagicDmgForMe[k][1]
					
		//отнимаем маг. урон из-за бафов, абсорбирующих часть урона
		for(m in buffs)
			for(k in BuffsAbsorbMagicDmg)
				if(Buffs.GetName(ent,buffs[m]) === BuffsAbsorbMagicDmg[k][0])
					if(Array.isArray(BuffsAbsorbMagicDmg[k][1]))
						MagicDamage -= BuffsAbsorbMagicDmg[k][1][Abilities.GetLevel(buffs.GetAbility(ent,buffs[i]))-1]
					else
						MagicDamage -= BuffsAddMagicDmgForMe[k][1]
		//получаем чистый урон с учетом резиста
		var dmgclear = MagicDamage - MagicDamage/100*MagicResist
		//здоровье вражеского героя
		var HP = Entities.GetHealth(ent)
		
		//сравниваем, ультуем.
		if ( HP <= dmgclear )
			Game.CastNoTarget(MyEnt, Ulti)
		return
	}
}

var ZeusAutoultOnCheckBoxClick = function(){
	if ( !ZeusAutoult.checked ){
		Game.ScriptLogMsg('Script disabled: ZeusAutoult', '#ff0000')
		return
	}
	if ( Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) != 'npc_dota_hero_zuus' ){
		ZeusAutoult.checked = false
		Game.ScriptLogMsg('ZeusAutoult: Not Zeus', '#ff0000')
		return
	}
	//циклически замкнутый таймер с проверкой условия с интервалом 'interval'
	function f(){ $.Schedule( interval,function(){
		ZeusAutoultF()
		if(ZeusAutoult.checked)
			f()
	})}
	f()
	Game.ScriptLogMsg('Script enabled: ZeusAutoult', '#00ff00')
}

var ZeusAutoult = Game.AddScript('ZeusAutoult', ZeusAutoultOnCheckBoxClick)