Game.MyTick = 1 / 30

var LenseBonusRange = 200
Abilities.GetCastRangeFix = function(abil) { // Don't conflict with internal usage
	var AbilRange = Abilities.GetCastRange(abil)
	var Caster = Abilities.GetCaster(abil)
	
	var Behaviors = Game.Behaviors(abil)
	if(Entities.HasItemInInventory(Caster, 'item_aether_lens') && (Behaviors.indexOf(16)!=-1 || Behaviors.indexOf(8)!=-1))
		AbilRange += LenseBonusRange
	
	return AbilRange
}

Game.IgnoreBuffs = [
	"modifier_abaddon_borrowed_time",
	"modifier_skeleton_king_reincarnation_scepter_active",
	"modifier_brewmaster_primal_split",
	"modifier_omniknight_repel",
	"modifier_phoenix_supernova_hiding",
	"modifier_tusk_snowball_movemEnemyEntity",
	"modifier_tusk_snowball_movemEnemyEntity_friendly",
	"modifier_juggernaut_blade_fury",
	"modifier_medusa_stone_gaze",
	"modifier_nyx_assassin_spiked_carapace",
	"modifier_templar_assassin_refraction_absorb",
	"modifier_oracle_false_promise",
	"modifier_dazzle_shallow_grave",
	"modifier_treant_living_armor",
	"modifier_life_stealer_rage",
	"modifier_item_aegis",
	"modifier_tusk_snowball_movement",
	"modifier_tusk_snowball_movement_friendly"
]

Game.BuffsAbsorbMagicDmg = [
	["modifier_item_pipe_barrier", 400],
	["modifier_item_hood_of_defiance_barrier", 400],
	["modifier_item_infused_raindrop", 120],
	["modifier_abaddon_aphotic_shield", [110,140,170,200]],
	["modifier_ember_spirit_flame_guard", [50,200,350,500]]
]

Game.BuffsAddMagicDmgForMe = [
	["item_aether_lens", 1.05],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]]
]

Game.DebuffsAddMagicDmg = [
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

Game.GetMagicMultiplier = function(entFrom, entTo) {
	var multiplier = 1.0
	var buffsnames = Game.GetBuffsNames(entTo)
	
	if (Game.IntersecArrays(buffsnames, Game.IgnoreBuffs) || Entities.IsMagicImmune(entTo))
		return 0.0
	
	var enemyBuffs = Game.GetBuffs(entTo)
	var myBuffs = Game.GetBuffs(entFrom)
	for(var i in enemyBuffs)
		for(var k in Game.DebuffsAddMagicDmg)
			if(Buffs.GetName(entTo, enemyBuffs[i]) === Game.DebuffsAddMagicDmg[k][0])
				if(Array.isArray(Game.DebuffsAddMagicDmg[k][1]))
					multiplier *= Game.DebuffsAddMagicDmg[k][1][Abilities.GetLevel(Buffs.GetAbility(entTo, enemyBuffs[i])) - 1]
				else
					multiplier *= Game.DebuffsAddMagicDmg[k][1]
	
	for(var i in myBuffs)
		for(var k in Game.BuffsAddMagicDmgForMe)
			if(Buffs.GetName(entFrom, myBuffs[i]) === Game.BuffsAddMagicDmgForMe[k][0])
				if(Array.isArray(Game.BuffsAddMagicDmgForMe[k][1]))
					multiplier *= Game.BuffsAddMagicDmgForMe[k][1][Abilities.GetLevel(Buffs.GetAbility(entFrom, myBuffs[i])) - 1]
				else
					multiplier *= Game.BuffsAddMagicDmgForMe[k][1]
	
	multiplier += Entities.GetArmorReductionForDamageType(entTo, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
	
	return multiplier
}

Game.GetNeededMagicDmg = function(entFrom, entTo, dmg) {
	var enemyBuffs = Game.GetBuffs(entTo)
	for(var i in enemyBuffs)
		for(var k in Game.BuffsAbsorbMagicDmg)
			if(Buffs.GetName(entTo, enemyBuffs[i]) === Game.BuffsAbsorbMagicDmg[k][0])
				if(Array.isArray(Game.BuffsAbsorbMagicDmg[k][1]))
					dmg += Game.BuffsAbsorbMagicDmg[k][1][Abilities.GetLevel(Buffs.GetAbility(entTo, enemyBuffs[i])) - 1]
				else
					dmg += Game.BuffsAbsorbMagicDmg[k][1]
	
	return dmg * Game.GetMagicMultiplier(entFrom, entTo)
}

Game.AngleBetweenVectors = function(a_pos, a_facing, b_pos) {
    var distancevector = [b_pos[0] - a_pos[0], b_pos[1] - a_pos[1]];
    var normalize = [ distancevector[0] / Math.sqrt(Math.pow(distancevector[0],2) + Math.pow(distancevector[1],2)), distancevector[1] / Math.sqrt(Math.pow(distancevector[0],2) + Math.pow(distancevector[1],2))];
    var anglerad = Math.acos((a_facing[0] * normalize[0]) + (a_facing[1] * normalize[1]));
    return anglerad
}
 
Game.AngleBetweenTwoFaces = function(a_facing, b_facing) {
    return Math.acos((a_facing[0] * b_facing[0]) + (a_facing[1] * b_facing[1]));
}
 
Game.RotationTime = function(angle,rotspeed) {
    return (0.03 * angle / rotspeed);
}

Game.ClosetToMouse = function(range, enemy) {
	var mousePos = Game.ScreenXYToWorld(GameUI.GetCursorPosition()[0],GameUI.GetCursorPosition()[1])
	var enemies = []
	var enemyTeam = Game.PlayersHeroEnts()
	if(enemy)
		enemyTeam = enemyTeam.filter(function(ent) {
			return ent > 0 && Entities.IsEnemy(ent)
		})
 
	if(enemyTeam.length > 0) {
		for(var enemy of enemyTeam) {
			var enemyXY = Entities.GetAbsOrigin(enemy)
			var distance = Game.PointDistance(mousePos, enemyXY)
			if(distance < range) {
				enemies.push([enemy, distance])
			}
		}
		
		return enemies.sort(function(a, b) {
			if(a[1] > b[1])
				return 1
			else if(a[1] < b[1])
				return -1
			else
				return 0
		})[0][0]
	} else {
		return -1
	}
}

Entities.GetFirstItem = function(ent, ItemName) {
	for(i = 0; i < 6; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(Abilities.GetAbilityName(item) === ItemName)
			return item
	}
	
	return -1
}

Game.GetSpeed = function(ent) {
    if(Entities.IsMoving(ent)) {
        var a = Entities.GetBaseMoveSpeed(ent);
        var b = Entities.GetMoveSpeedModifier(ent,a);
        return b;
    } else {
        return 1;
    }
}
 
Game.VelocityWaypoint = function(ent, time){
    var zxc = Entities.GetAbsOrigin(ent)
    var forward = Entities.GetForward(ent)
    var movespeed = Game.GetSpeed(ent);
 
    return [zxc[0] + (forward[0] * movespeed * time),zxc[1] + (forward[1] * movespeed * time),zxc[2]]
}

Game.Every = function(start, time, tick, func){var startTime = Game.Time();var tickRate = tick;if(tick < 1){if(start < 0) tick--;tickRate = time / -tick;}var tickCount =  time/ tickRate;if(time < 0){tickCount = 9999999;}var numRan = 0;$.Schedule(start, (function(start,numRan,tickRate,tickCount){return function(){if(start < 0){start = 0;if(func()){return;}; }  var tickNew = function(){numRan++;delay = (startTime+tickRate*numRan)-Game.Time();if((startTime+tickRate*numRan)-Game.Time() < 0){delay = 0;}$.Schedule(delay, function(){if(func()){return;};tickCount--;if(tickCount > 0) tickNew();});};tickNew();}})(start,numRan,tickRate,tickCount));};

//глобальный массив для хранения партиклов
if(!Array.isArray(Game.Particles))
	Game.Particles = []
if(!Array.isArray(Game.Panels))
	Game.Panels = []
if(Array.isArray(Game.Subscribes)){
	for(i in Game.Subscribes){
		if ( typeof Game.Subscribes[i] === 'number' )
			try{ GameEvents.Unsubscribe(Game.Subscribes[i]) }catch(e){}
		else if( typeof Game.Subscribes[i] === 'object' ){
			for(m in Game.Subscribes[i])
				try{ GameEvents.Unsubscribe(Game.Subscribes[i][m]) }catch(e){}
		}
	}
}
Game.Subscribes = []
Game.Subscribes.OnMapLoad = []
Game.Subscribes.MoneyChanged = []
//Game.Subscribes.OnMapLoadCB = GameEvents.Subscribe('game_newmap', function() {
	for(i in Game.Subscribes.OnMapLoad)
		Game.Subscribes.OnMapLoad[i]()
//})
Game.Subscribes.MoneyChangedCB = GameEvents.Subscribe('dota_money_changed', function(){
	for(i in Game.Subscribes.MoneyChanged)
		Game.Subscribes.MoneyChanged[i]()
})


//сообщение в боковую панель
Game.ScriptLogMsg = function(msg, color){
	var ScriptLog = $('#ScriptLog')
	var ScriptLogMessage = $.CreatePanel( "Label", ScriptLog, "ScriptLogMessage" )
	ScriptLogMessage.BLoadLayoutFromString( "<root><Label /></root>", false, false)
	ScriptLogMessage.style.fontSize = '15px'
	var text = '	•••	' + msg
	ScriptLogMessage.text = text
	if (color){
		ScriptLogMessage.style.color = color
		ScriptLogMessage.style.textShadow = '0px 0px 4px 1.2 ' + color + '33';
	}
	ScriptLogMessage.DeleteAsync(7)
	AnimatePanel( ScriptLogMessage, {"opacity": "0;"}, 2, "linear", 4)
}

//Функция делает панельку перемещаемой кликом мыши по ней. callback нужен например для того, чтобы сохранить координаты панели в файл
GameUI.MovePanel = function(a, callback){
	var e = function(){
		var m = true
		if (!GameUI.IsControlDown())
			return
		var color = a.style.backgroundColor
		a.style.backgroundColor = '#FFFF00FF'
		var uiw = Game.GetMainHUD().actuallayoutwidth
		var uih = Game.GetMainHUD().actuallayoutheight
		linkpanel = function(){
			a.style.position = (GameUI.GetCursorPosition()[0] / uiw * 100) + '% ' + (GameUI.GetCursorPosition()[1] / uih * 100) + '% ' + '0'
			if (GameUI.IsMouseDown(0)) {
				m = false
				a.SetPanelEvent('onactivate', e)
				a.style.backgroundColor = color
				callback(a)
			}
		}
		function L() {
			$.Schedule (
				0,
				function() {
					L()
					if(m) 
						linkpanel()
					
				}
			)
		}
		L()
	}
	a.SetPanelEvent('onactivate', e)
}

//нахождение главного родительского HUD`a
Game.GetMainHUD = function(){
	var globalContext=$.GetContextPanel()
	while(true){
		if(globalContext.paneltype == "DOTAHud"){
			break
		}else{
			globalContext = globalContext.GetParent()
		}
	}
	return globalContext
}

Game.HPBarOffsets={"npc_dota_hero_abaddon":175,"npc_dota_hero_abyssal_underlord":200,"npc_dota_hero_alchemist":200,"npc_dota_hero_ancient_apparition":190,"npc_dota_hero_antimage":140,"npc_dota_hero_arc_warden":160,"npc_dota_hero_axe":160,"npc_dota_hero_bane":235,"npc_dota_hero_batrider":240,"npc_dota_hero_beastmaster":180,"npc_dota_hero_bloodseeker":130,"npc_dota_hero_bounty_hunter":120,"npc_dota_hero_brewmaster":140,"npc_dota_hero_bristleback":200,"npc_dota_hero_broodmother":120,"npc_dota_hero_centaur":220,"npc_dota_hero_chaos_knight":220,"npc_dota_hero_chen":190,"npc_dota_hero_clinkz":144,"npc_dota_hero_crystal_maiden":135,"npc_dota_hero_dark_seer":130,"npc_dota_hero_dazzle":160,"npc_dota_hero_death_prophet":200,"npc_dota_hero_disruptor":200,"npc_dota_hero_doom_bringer":240,"npc_dota_hero_dragon_knight":170,"npc_dota_hero_drow_ranger":130,"npc_dota_hero_earth_spirit":200,"npc_dota_hero_earthshaker":155,"npc_dota_hero_elder_titan":200,"npc_dota_hero_ember_spirit":200,"npc_dota_hero_enchantress":180,"npc_dota_hero_enigma":220,"npc_dota_hero_faceless_void":150,"npc_dota_hero_furion":180,"npc_dota_hero_gyrocopter":240,"npc_dota_hero_huskar":170,"npc_dota_hero_invoker":170,"npc_dota_hero_jakiro":280,"npc_dota_hero_juggernaut":170,"npc_dota_hero_keeper_of_the_light":230,"npc_dota_hero_kunkka":150,"npc_dota_hero_legion_commander":200,"npc_dota_hero_leshrac":170,"npc_dota_hero_lich":225,"npc_dota_hero_life_stealer":130,"npc_dota_hero_lina":170,"npc_dota_hero_lion":170,"npc_dota_hero_lone_druid":145,"npc_dota_hero_luna":185,"npc_dota_hero_lycan":220,"npc_dota_hero_magnataur":220,"npc_dota_hero_medusa":200,"npc_dota_hero_meepo":125,"npc_dota_hero_mirana":155,"npc_dota_hero_monkey_king":165,"npc_dota_hero_morphling":140,"npc_dota_hero_naga_siren":180,"npc_dota_hero_necrolyte":160,"npc_dota_hero_nevermore":250,"npc_dota_hero_night_stalker":165,"npc_dota_hero_nyx_assassin":200,"npc_dota_hero_obsidian_destroyer":350,"npc_dota_hero_ogre_magi":180,"npc_dota_hero_omniknight":145,"npc_dota_hero_oracle":240,"npc_dota_hero_phantom_assassin":180,"npc_dota_hero_phantom_lancer":190,"npc_dota_hero_phoenix":240,"npc_dota_hero_puck":165,"npc_dota_hero_pudge":180,"npc_dota_hero_pugna":140,"npc_dota_hero_queenofpain":145,"npc_dota_hero_rattletrap":130,"npc_dota_hero_razor":230,"npc_dota_hero_riki":115,"npc_dota_hero_rubick":170,"npc_dota_hero_sand_king":130,"npc_dota_hero_shadow_demon":175,"npc_dota_hero_shadow_shaman":130,"npc_dota_hero_shredder":250,"npc_dota_hero_silencer":130,"npc_dota_hero_skeleton_king":190,"npc_dota_hero_skywrath_mage":300,"npc_dota_hero_slardar":140,"npc_dota_hero_slark":140,"npc_dota_hero_sniper":110,"npc_dota_hero_spectre":180,"npc_dota_hero_spirit_breaker":160,"npc_dota_hero_storm_spirit":170,"npc_dota_hero_sven":150,"npc_dota_hero_target_dummy":200,"npc_dota_hero_techies":150,"npc_dota_hero_templar_assassin":180,"npc_dota_hero_terrorblade":280,"npc_dota_hero_tidehunter":190,"npc_dota_hero_tinker":150,"npc_dota_hero_tiny":165,"npc_dota_hero_treant":260,"npc_dota_hero_troll_warlord":200,"npc_dota_hero_tusk":190,"npc_dota_hero_undying":250,"npc_dota_hero_ursa":150,"npc_dota_hero_vengefulspirit":170,"npc_dota_hero_venomancer":150,"npc_dota_hero_viper":210,"npc_dota_hero_visage":180,"npc_dota_hero_warlock":195,"npc_dota_hero_weaver":110,"npc_dota_hero_windrunner":160,"npc_dota_hero_winter_wyvern":200,"npc_dota_hero_wisp":160,"npc_dota_hero_witch_doctor":150,"npc_dota_hero_zuus":130}

Game.MoveToPos = function(ent, xyz, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_POSITION
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.MoveToTarget = function(ent, ent, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_TARGET
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.MoveToAttackPos = function(ent, xyz, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_MOVE
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.MoveToAttackTarget = function(ent, ent, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_TARGET
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.CastTarget = function(ent, abil, target, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET
	order.UnitIndex = ent
	order.TargetIndex  = target
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.CastPosition = function(ent, abil, xyz, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_POSITION
	order.UnitIndex = ent
	order.Position = xyz
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders( order )
}

Game.CastNoTarget = function(ent, abil, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET
	order.UnitIndex = ent
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders( order )
}

Game.ToggleAbil = function(ent, abil, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE
	order.UnitIndex = ent
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders( order )
}

Game.EntStop = function(ent, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_STOP 
	order.UnitIndex = ent
	order.Queue = queue
	order.ShowEffects = D2JS.debugAnimations
	Game.PrepareUnitOrders( order )
}

Game.DisassembleItem = function(ent, item, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_DISASSEMBLE_ITEM 
	order.UnitIndex = ent
	order.AbilityIndex = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

Game.DropItem = function(ent, item, xyz, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_DROP_ITEM
	order.UnitIndex = ent
	order.Position = xyz
	order.AbilityIndex = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

Game.PickupItem = function(ent, item, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_ITEM 
	order.UnitIndex = ent
	order.TargetIndex  = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

Game.ItemLock = function(ent, item, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK
	order.UnitIndex = ent
	order.TargetIndex  = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

Game.PuckupRune = function(ent, rune, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_RUNE 
	order.UnitIndex = ent
	order.TargetIndex  = rune
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

Game.PurchaseItem = function(ent, itemid, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PURCHASE_ITEM 
	order.UnitIndex = ent
	order.AbilityIndex = itemid
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

//Получение расстояния между двумя точками в пространстве, высшая математика епта
Game.PointDistance = function(a,b){
	return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2)+Math.pow(a[1]-b[1],2))
}

//"округление" числа до определенного кол-ва знаков после запятой
Game.roundPlus = function(x, n){
	if(isNaN(x) || isNaN(n)) return false;
	var m = Math.pow(10,n)
	return Math.round(x*m)/m
}

//логарифм по основанию
Math.logb = function(number, base) {
	return Math.log(number) / Math.log(base)
}

//поэлементное сравнение двух массивов, порядок элементов не учитывается
Game.CompareArrays = function(a,b){
	if (a==b)
		return true
	if (a.length!=b.length)
		return false
	for(i in a)
		if (a[i]!=b[i])
			return false
	return true
}

//проверяет есть ли в двух объектах хотя бы один одинаковый элемент
Game.IntersecArrays = function(a,b){
	for(i in a)
		for(m in b)
			if(a[i]==b[m])
				return true
	return false
}

//получение массива с инвентарем юнита
Game.GetInventory = function(ent) {
	var inv = []
	for(i = 0; i < 6; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(item !== -1)
			inv.push(item)
	}
	return inv
}

//проверяет является ли иллюзией герой
Game.IsIllusion = function(entity){
	var PlayersEnt = []
	var PlayersIDs = Game.GetAllPlayerIDs()
	for(i in PlayersIDs)
		PlayersEnt.push( Players.GetPlayerHeroEntityIndex( PlayersIDs[i] ) )
	if (PlayersEnt.indexOf(entity)==-1)
		return true
	else
		return false
}

//список указателей на героев без иллюзий
Game.PlayersHeroEnts = function(){
	var PlayersEnt = []
	var PlayersIDs = Game.GetAllPlayerIDs()
	for(i in PlayersIDs)
		PlayersEnt.push( Players.GetPlayerHeroEntityIndex( PlayersIDs[i] ) )
	return PlayersEnt
}

//возвращает DOTA_ABILITY_BEHAVIOR в удобном представлении
Game.Behaviors = function(DABor){
	var DABh = []
	var ZBehavior = Abilities.GetBehavior( parseInt( DABor ) )
	var s = 32
	while ( ZBehavior > 0 && s > 0 ){
		if(Math.pow(2,s)>ZBehavior){
			s--
			continue
		}
		ZBehavior-=Math.pow(2,s)
		DABh.push(Math.pow(2,s))
	}
	return DABh
}

//ищет по названию и в абилках и в инвентаре
Game.GetAbilityByName = function(ent,name){
	var GABN = Entities.GetAbilityByName( ent, name )
	if (GABN!=-1)
		return GABN
	var itemsnum = Entities.GetNumItemsInInventory( ent )
	for(i=0;i<itemsnum;i++){
		var item = Entities.GetItemInSlot( ent, i )
		if(Abilities.GetAbilityName(item)==name)
			return item
	}
	return -1
}

//объект с указателями на бафы юнита
Game.GetBuffs = function(ent){
	var buffs = []
	for(i=0;i<Entities.GetNumBuffs(ent);i++)
		buffs.push(ent,Entities.GetBuff(ent,i))
	return buffs
}
//объект с именами бафов юнита
Game.GetBuffsNames = function(ent){
	var buffs = []
	for(i=0;i<Entities.GetNumBuffs(ent);i++)
		buffs.push(Buffs.GetName(ent,Entities.GetBuff(ent,i)))
	return buffs
}

//анимирование панелей. Источник moddota.com
var AnimatePanel_DEFAULT_DURATION = "300.0ms";
var AnimatePanel_DEFAULT_EASE = "linear";
function AnimatePanel(panel, values, duration, ease, delay)
{
	var durationString = (duration != null ? parseInt(duration * 1000) + ".0ms" : AnimatePanel_DEFAULT_DURATION);
	var easeString = (ease != null ? ease : AnimatePanel_DEFAULT_EASE);
	var delayString = (delay != null ? parseInt(delay * 1000) + ".0ms" : "0.0ms"); 
	var transitionString = durationString + " " + easeString + " " + delayString;
	var i = 0;
	var finalTransition = ""
	for (var property in values)
	{
		finalTransition = finalTransition + (i > 0 ? ", " : "") + property + " " + transitionString;
		i++;
	}
	panel.style.transition = finalTransition + ";";
	for (var property in values)
		panel.style[property] = values[property];
}


//клонирование объекта
Game.CloneObject = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

Game.AddScript = function(scriptName, onCheckBoxClick) {
	var Temp = $.CreatePanel("Panel", $('#trics'), scriptName)
	Temp.SetPanelEvent('onactivate', onCheckBoxClick)
	Temp.BLoadLayoutFromString('<root><styles><include src="s2r://panorama/styles/dotastyles.vcss_c"/><include src="s2r://panorama/styles/magadan.vcss_c"/></styles><Panel><ToggleButton class="CheckBox" id="' + scriptName + '" text="' + scriptName + '"/></Panel></root>', false, false)  
	
	$("#trics").Children().sort(function(a,b){
		if (a.text > b.text) return 1;
		if (a.text < b.text) return -1;
	})
	
	return $.GetContextPanel().FindChildTraverse(scriptName).Children()[0]
}


Game.ScriptLogMsg('Utils sucessfull loaded', '#00ff00')
if(Game.ServerRequest === null)
	GameEvents.SendEventClientSide (
		'antiaddiction_toast',
		{
			"message": "Please update your D2JS version",
			"duration": "999999"
		}
	)