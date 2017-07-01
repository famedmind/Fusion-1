﻿Fusion.LenseBonusRange = 200
Fusion.ForceStaffUnits = 600

Fusion.GetBuffByName = function(ent, buffName) {
	var ret
	Game.GetBuffs(ent).some(function(buff) {
		if(Buffs.GetName(ent, buff) === buffName) {
			ret = buff
			return true
		}
		
		return false
	})
	
	return ret
}

Fusion.LinkenTargetName = "modifier_item_sphere_target"
Fusion.HasLinkenAtTime = function(ent, time) {
	var sphere = Game.GetAbilityByName(ent, 'item_sphere')
	if (
		(
			sphere !== undefined &&
			Abilities.GetCooldownTimeRemaining(sphere) - time <= 0
		) ||
		Fusion.GetBuffByName(ent) !== -1
	)
		return true
	
	return false
}

Fusion.DeepEquals = function (x, y) {
	if((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
		if(Object.keys(x).length != Object.keys(y).length)
			return false;

		for (var prop in x) {
			if (y.hasOwnProperty(prop))	
				if (!Fusion.DeepEquals(x[prop], y[prop]))
					return false;
			else
				return false;
		}

		return true;
	} else
		if(x !== y)
			return false;
		else
			return true;
}

Game.GetScreenCursonWorldVec = function() {
	return Game.ScreenXYToWorld(GameUI.GetCursorPosition()[0], GameUI.GetCursorPosition()[1])
}

Abilities.GetCastRangeFix = function(abil) { // Don't conflict with internal usage
	var AbilRange = Abilities.GetCastRange(abil)
	var Caster = Abilities.GetCaster(abil)
	
	var Behaviors = Game.Behaviors(abil)
	if(Entities.HasItemInInventory(Caster, 'item_aether_lens') && (Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1 || Behaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1))
		AbilRange += Fusion.LenseBonusRange
	
	return AbilRange
}

Fusion.ForceStaffPos = function(ent) {
	var entVec = Entities.GetAbsOrigin(ent)
	var entForward = Entities.GetForward(ent)
	var forceVec = [
		entVec[0] + entForward[0] * Fusion.ForceStaffUnits,
		entVec[1] + entForward[1] * Fusion.ForceStaffUnits,
		entVec[2] + entForward[2] * Fusion.ForceStaffUnits
	]
	
	return forceVec
}

Fusion.IgnoreBuffs = [
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

Fusion.BuffsAbsorbMagicDmg = [
	["modifier_item_pipe_barrier", 400],
	["modifier_item_hood_of_defiance_barrier", 400],
	["modifier_item_infused_raindrop", 120],
	["modifier_abaddon_aphotic_shield", [110,140,170,200]],
	["modifier_ember_spirit_flame_guard", [50,200,350,500]]
]

Fusion.BuffsAddMagicDmgForMe = [
	["item_aether_lens", 1.05],
	["modifier_bloodseeker_bloodrage", [1.25,1.3,1.35,1.4]]
]

Fusion.DebuffsAddMagicDmg = [
	//в большую сторону
	["modifier_item_veil_of_discord_debuff", 1.25],
	["modifier_bloodthorn_debuff", 1.3],
	["modifier_orchid_malevolence_debuff", 1.3],
	["modifier_item_ethereal_blade_ethereal", 1.4],
	["modifier_item_mask_of_madness_berserk", 1.25],
	["modifier_ghost_state", 1.4],
	["modifier_ice_vortex", [1.15, 1.2, 1.25, 1.3]],
	["modifier_skywrath_mage_ancient_seal", [1.3, 1.35, 1.4, 1.45]],
	["modifier_bloodseeker_bloodrage", [1.25, 1.3, 1.35, 1.4]],
	["modifier_shadow_demon_soul_catcher", [1.2, 1.3, 1.4, 1.5]],
	["modifier_pugna_decrepify", [1.3, 1.4, 1.5, 1.6]],
	["modifier_necrolyte_sadist_active", 1.2],
	
	//в меньшую сторону
	["modifier_item_pipe", 0.7],
	["modifier_ursa_enrage", 0.2],
	["modifier_item_pipe_aura", 0.9],
	["modifier_oracle_fates_edict", 0],
	["modifier_item_hood_of_defiance", 0.7],
	["modifier_item_planeswalkers_cloak", 0.85],
	["modifier_item_glimmer_cape", 0.85],
	["item_glimmer_cape_fade", 0.55],
	["modifier_wisp_overcharge", [0.95, 0.9, 0.85, 0.8]],
	["modifier_pudge_flesh_heap", [0.94, 0.92, 0.9, 0.88]],
	["modifier_rubick_null_field_effect", [0.9, 0.86, 0.82, 0.78]],
	["modifier_antimage_spell_shield", [0.74, 0.66, 0.58, 0.5]]
]

Fusion.GetMagicMultiplier = function(entFrom, entTo) {
	var multiplier = 1.0
	var buffsnames = Game.GetBuffsNames(entTo)
	
	if (Game.IntersecArrays(buffsnames, Fusion.IgnoreBuffs) || Entities.IsMagicImmune(entTo))
		return 0.0
	
	var enemyBuffs = Game.GetBuffs(entTo)
	var myBuffs = Game.GetBuffs(entFrom)
	for(var i in enemyBuffs)
		for(var k in Fusion.DebuffsAddMagicDmg)
			if(Buffs.GetName(entTo, enemyBuffs[i]) === Fusion.DebuffsAddMagicDmg[k][0])
				if(Array.isArray(Fusion.DebuffsAddMagicDmg[k][1]))
					multiplier *= Fusion.DebuffsAddMagicDmg[k][1][Abilities.GetLevel(Buffs.GetAbility(entTo, enemyBuffs[i])) - 1]
				else
					multiplier *= Fusion.DebuffsAddMagicDmg[k][1]
	
	for(var i in myBuffs)
		for(var k in Fusion.BuffsAddMagicDmgForMe)
			if(Buffs.GetName(entFrom, myBuffs[i]) === Fusion.BuffsAddMagicDmgForMe[k][0])
				if(Array.isArray(Fusion.BuffsAddMagicDmgForMe[k][1]))
					multiplier *= Fusion.BuffsAddMagicDmgForMe[k][1][Abilities.GetLevel(Buffs.GetAbility(entFrom, myBuffs[i])) - 1]
				else
					multiplier *= Fusion.BuffsAddMagicDmgForMe[k][1]
	
	multiplier += Entities.GetArmorReductionForDamageType(entTo, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
	
	return multiplier
}

Fusion.GetNeededMagicDmg = function(entFrom, entTo, dmg) {
	Game.GetBuffs(entTo).forEach(function(enemyBuff) {
		Fusion.BuffsAbsorbMagicDmg.forEach(function(absorbBuff) {
			if(Buffs.GetName(entTo, enemyBuff) === absorbBuff[0])
				if(Array.isArray(absorbBuff[1]))
					dmg += absorbBuff[1][Abilities.GetLevel(Buffs.GetAbility(entTo, enemyBuff)) - 1]
				else
					dmg += absorbBuff[1]
		})
	})
	
	return dmg * Fusion.GetMagicMultiplier(entFrom, entTo)
}

Game.AngleBetweenVectors = function(a_pos, a_facing, b_pos) {
	var distancevector = [b_pos[0] - a_pos[0], b_pos[1] - a_pos[1]]
	var normalize = [ distancevector[0] / Math.sqrt(Math.pow(distancevector[0],2) + Math.pow(distancevector[1],2)), distancevector[1] / Math.sqrt(Math.pow(distancevector[0],2) + Math.pow(distancevector[1],2))]
	var anglerad = Math.acos((a_facing[0] * normalize[0]) + (a_facing[1] * normalize[1]))
	return anglerad
}

Game.AngleBetweenTwoFaces = function(a_facing, b_facing) {
	return Math.acos((a_facing[0] * b_facing[0]) + (a_facing[1] * b_facing[1]))
}

Game.RotationTime = function(angle, rotspeed) { // MovementTurnRate
	return (Fusion.MyTick * angle / rotspeed)
}

Game.ClosetToMouse = function(MyEnt, range, enemy) {
	var pos = Game.GetScreenCursonWorldVec()
	var enemyTeam = Game.PlayersHeroEnts()
	if(enemy)
		enemyTeam = enemyTeam.filter(function(ent) {
			return Entities.IsEnemy(ent) && Entities.IsAlive(ent) && !Entities.IsBuilding(ent) && !Entities.IsInvulnerable(ent)
		})

	if(enemyTeam.length > 0)
		return enemyTeam.map(function(ent) {
			var enemyXY = Entities.GetAbsOrigin(ent)
			var distance = Game.PointDistance(pos, enemyXY)
			if(distance < range)
				return ent
			else
				return undefined
		}).filter(function(ent) {
			return ent !== undefined
		}).sort(function(ent1, ent2) {
			var dst1 = Game.PointDistance(ent1, MyEnt),
				dst2 = Game.PointDistance(ent2, MyEnt)
			if(dst1 > dst2)
				return 1
			else if(dst1 < dst2)
				return -1
			else
				return 0
		})[0]
	else
		return undefined
}

Game.GetAbilityByName = function(ent, name) {
	var ab = Entities.GetAbilityByName(ent, name)
	if (ab !== -1)
		return ab
	for(var i = 0; i < 7; i++) {
		var item = Entities.GetItemInSlot(ent, i)
		if(Abilities.GetAbilityName(item) === name)
			return item
	}
}

Game.GetSpeed = function(ent) {
	if(Entities.IsMoving(ent)) {
		var a = Entities.GetBaseMoveSpeed(ent)
		var b = Entities.GetMoveSpeedModifier(ent,a)
		return b
	} else {
		return 1
	}
}

Game.VelocityWaypoint = function(ent, time, movespeed) {
	var zxc = Entities.GetAbsOrigin(ent)
	var forward = Entities.GetForward(ent)
	if(typeof movespeed === 'undefined')
		var movespeed = Game.GetSpeed(ent)

	return [zxc[0] + (forward[0] * movespeed * time),zxc[1] + (forward[1] * movespeed * time),zxc[2]]
}

if(Array.isArray(Fusion.Subscribes)) {
	Fusion.Subscribes.forEach(function(sub) {
		if (typeof sub === 'number')
			try {
				GameEvents.Unsubscribe(sub)
			} catch(e) {}
		else if(typeof sub === 'object')
			sub.forEach(function(sub2) {
				try {
					GameEvents.Unsubscribe(sub2)
				} catch(e) {}
			})
	})
}


//сообщение в боковую панель
Game.ScriptLogMsg = function(msg, color) {
	var ScriptLog = Fusion.Panels.MainPanel.FindChildTraverse('ScriptLog')
	var ScriptLogMessage = $.CreatePanel( "Label", ScriptLog, "ScriptLogMessage" )
	ScriptLogMessage.BLoadLayoutFromString( "<root><Label /></root>", false, false)
	ScriptLogMessage.style.fontSize = '15px'
	var text = '	•••	' + msg
	ScriptLogMessage.text = text
	if (color) {
		ScriptLogMessage.style.color = color
		ScriptLogMessage.style.textShadow = '0px 0px 4px 1.2 ' + color + '33'
	}
	ScriptLogMessage.DeleteAsync(7)
	Fusion.AnimatePanel( ScriptLogMessage, {"opacity": "0;"}, 2, "linear", 4)
}

//Функция делает панельку перемещаемой кликом мыши по ней. callback нужен например для того, чтобы сохранить координаты панели в файл
GameUI.MovePanel = function(a, callback) {
	a.SetPanelEvent('onactivate', function() {
		var m = true
		if (!GameUI.IsControlDown())
			return
		var color = a.style.backgroundColor
		a.style.backgroundColor = '#FFFF00FF'
		var uiw = Fusion.GetMainHUD().actuallayoutwidth
		var uih = Fusion.GetMainHUD().actuallayoutheight
		linkpanel = function() {
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
	})
}

Game.MoveToPos = function(ent, xyz, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_POSITION
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.MoveToTarget = function(ent, ent, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_TARGET
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.MoveToAttackPos = function(ent, xyz, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_MOVE
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.MoveToAttackTarget = function(ent, ent, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_ATTACK_TARGET
	order.UnitIndex = ent
	order.Position = xyz
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.CastTarget = function(ent, abil, target, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET
	order.UnitIndex = ent
	order.TargetIndex  = target
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.CastPosition = function(ent, abil, xyz, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_POSITION
	order.UnitIndex = ent
	order.Position = xyz
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.CastNoTarget = function(ent, abil, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET
	order.UnitIndex = ent
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.ToggleAbil = function(ent, abil, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE
	order.UnitIndex = ent
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.EntStop = function(ent, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_STOP
	order.UnitIndex = ent
	order.Queue = queue
	order.ShowEffects = Fusion.debugAnimations
	Game.PrepareUnitOrders(order)
}

Game.DisassembleItem = function(ent, item, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_DISASSEMBLE_ITEM
	order.UnitIndex = ent
	order.AbilityIndex = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Game.DropItem = function(ent, item, xyz, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_DROP_ITEM
	order.UnitIndex = ent
	order.Position = xyz
	order.AbilityIndex = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Game.PickupItem = function(ent, item, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_ITEM
	order.UnitIndex = ent
	order.TargetIndex  = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Game.ItemLock = function(ent, item, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK
	order.UnitIndex = ent
	order.TargetIndex  = item
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Game.PuckupRune = function(ent, rune, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_ITEM
	order.UnitIndex = ent
	order.TargetIndex  = rune
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Game.PuckupRune = function(ent, rune, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_RUNE
	order.UnitIndex = ent
	order.TargetIndex  = rune
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

Game.PurchaseItem = function(ent, itemid, queue) {
	var order = {}
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_PURCHASE_ITEM
	order.UnitIndex = ent
	order.AbilityIndex = itemid
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders(order)
}

//Получение расстояния между двумя точками в пространстве, высшая математика епта
Game.PointDistance = function(a,b) {
	return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2)+Math.pow(a[1]-b[1],2))
}

//"округление" числа до определенного кол-ва знаков после запятой
Game.roundPlus = function(x, n) {
	if(isNaN(x) || isNaN(n)) return false
	var m = Math.pow(10,n)
	return Math.round(x*m)/m
}

//логарифм по основанию
Math.logb = function(number, base) {
	return Math.log(number) / Math.log(base)
}

//поэлементное сравнение двух массивов, порядок элементов не учитывается
Game.CompareArrays = function(a,b) {
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
Game.IntersecArrays = function(a,b) {
	for(i in a)
		for(m in b)
			if(a[i] === b[m])
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
Game.IsIllusion = function(entity) {
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
Game.PlayersHeroEnts = function() {
	var PlayersEnt = []
	var PlayersIDs = Game.GetAllPlayerIDs()
	for(i in PlayersIDs)
		PlayersEnt.push( Players.GetPlayerHeroEntityIndex( PlayersIDs[i] ) )
	return PlayersEnt
}

//возвращает DOTA_ABILITY_BEHAVIOR в удобном представлении
Game.Behaviors = function(DABor) {
	var DABh = []
	var ZBehavior = Abilities.GetBehavior( parseInt( DABor ) )
	var s = 32
	while ( ZBehavior > 0 && s > 0 ) {
		if(Math.pow(2,s)>ZBehavior) {
			s--
			continue
		}
		ZBehavior-=Math.pow(2,s)
		DABh.push(Math.pow(2,s))
	}
	return DABh
}

//объект с указателями на бафы юнита
Game.GetBuffs = function(ent) {
	var buffs = []
	for(var i=0; i < Entities.GetNumBuffs(ent); i++)
		buffs.push(ent, Entities.GetBuff(ent,i))
	return buffs
}

//объект с именами бафов юнита
Game.GetBuffsNames = function(ent) {
	return Game.GetBuffs(ent).map(function(buff) {
		return Buffs.GetName(ent, buff)
	})
}

//анимирование панелей. Источник moddota.com
var AnimatePanel_DEFAULT_DURATION = "300.0ms"
var AnimatePanel_DEFAULT_EASE = "linear"
Fusion.AnimatePanel = function(panel, values, duration, ease, delay) {
	var durationString = (duration != null ? parseInt(duration * 1000) + ".0ms" : AnimatePanel_DEFAULT_DURATION)
	var easeString = (ease != null ? ease : AnimatePanel_DEFAULT_EASE)
	var delayString = (delay != null ? parseInt(delay * 1000) + ".0ms" : "0.0ms")
	var transitionString = durationString + " " + easeString + " " + delayString
	var i = 0
	var finalTransition = ""
	for (var property in values)
	{
		finalTransition = finalTransition + (i > 0 ? ", " : "") + property + " " + transitionString
		i++
	}
	panel.style.transition = finalTransition + ";"
	for (var property in values)
		panel.style[property] = values[property]
}


//клонирование объекта
Game.CloneObject = function(obj) {
	if (null == obj || "object" != typeof obj) return obj
	var copy = obj.constructor()
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]
	}
	return copy
}

Game.AddScript = function(scriptName, onCheckBoxClick) {
	var Temp = $.CreatePanel("Panel", Fusion.Panels.MainPanel.FindChildTraverse('scripts'), scriptName)
	Temp.SetPanelEvent('onactivate', onCheckBoxClick)
	Temp.BLoadLayoutFromString('\
		<root>\
			<styles>\
				<include src="s2r://panorama/styles/dotastyles.vcss_c"/>\
				<include src="s2r://panorama/styles/magadan.vcss_c"/>\
			</styles>\
			<Panel>\
				<ToggleButton class="CheckBox" id="' + scriptName + '" text="' + scriptName + '"/>\
			</Panel>\
		</root>\
	', false, false) 
	Fusion.Panels.MainPanel.FindChildTraverse("scripts").Children().sort(function(a, b) {
		var aText = a.Children()[0].text
		var bText = b.Children()[0].text
		return aText.toLowerCase() > bText.toLowerCase()
	})
	
	return $.GetContextPanel().FindChildTraverse(scriptName).Children()[0]
}

Game.ScriptLogMsg('Utils sucessfull loaded', '#00ff00')