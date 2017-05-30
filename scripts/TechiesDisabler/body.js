var DisablingAbils = [
	["item_force_staff", -1],
	["item_hurricane_pike", -1],
	["invoker_deafening_blast", 1100],
	["invoker_tornado", 1000],
	["pudge_meat_hook", 1450],
	["keeper_of_the_light_blinding_light", -1]
]

var flag = false
function Disable(MyEnt, ent) {
	if(flag)
		return
	var distance = Entities.GetRangeToUnit(MyEnt, ent)
	DisablingAbils.some(function(ar) {
		var abil = Game.GetAbilityByName(MyEnt, ar[0])
		if(abil === -1)
			return false
		var abilBehaviors = Game.Behaviors(abil)
		var speed = ar[1]
		if(distance > Abilities.GetCastRangeFix(abil) || !Abilities.IsCooldownReady(abil) || Abilities.IsHidden(abil) || !Abilities.IsActivated(abil))
			return false
		var techiesDist = 1200
		if(Entities.HasItemInInventory(ent, 'item_aether_lens'))
			techiesDist += D2JS.LenseBonusRange
		var techiesTime = 0.75
		var techiesSpeed = techiesDist * techiesTime
		if(speed === -1) {
			if(abilBehaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_POINT) !== -1)
				Game.CastPosition(MyEnt, abil, Game.VelocityWaypoint(ent, Abilities.GetCastPoint(abil), techiesSpeed))
			else if(abilBehaviors.indexOf(DOTA_ABILITY_BEHAVIOR.DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) !== -1 || abilBehaviors.length === 0)
				Game.CastTarget(MyEnt, abil, ent)
		} else {
			var a = Entities.GetAbsOrigin(MyEnt),
				b = Entities.GetAbsOrigin(ent),
				forward = Entities.GetForward(MyEnt),
				reachtime = (distance / speed),
				angle = Game.AngleBetweenVectors(a, forward, b),
				rottime = Game.RotationTime(angle, 0.7),
				delay = Abilities.GetCastPoint(abil),
				ping = (50 / 1000),
				time = reachtime + delay + ping + rottime,
				predict = Game.VelocityWaypoint(ent, time, techiesSpeed)
			Game.CastPosition(MyEnt, abil, predict)
		}
		flag = true
		$.Schedule(1.5, function() {
			flag = false
		})
		return true
	})
}

var AntiTechiesF = function() {
	var MyEnt = parseInt(Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID()))
	if(Game.IsGamePaused() || Entities.IsStunned(MyEnt) || !Entities.IsAlive(MyEnt))
		return
	var HEnts = Game.PlayersHeroEnts().map(function(ent) {
		return parseInt(ent)
	}).filter(function(ent) {
		return Entities.GetUnitName(ent) === "npc_dota_hero_techies" && Entities.IsAlive(ent) && !(Entities.IsBuilding(ent) || Entities.IsInvulnerable(ent)) && Entities.IsEnemy(ent)
	})
	HEnts.map(function(ent) {
		var buffsNames = Game.GetBuffsNames(ent)
		buffsNames.some(function(buffName) {
			if(buffName === "modifier_techies_suicide_leap") {
				Disable(MyEnt, ent)
				return true
			} else
				return false
		})
	})
}

function AntiTechiesToggle() {
	if (!AntiTechies.checked) {
		Game.ScriptLogMsg('Script disabled: AntiTechies', '#ff0000')
		return
	} else {
		function L() {
			if (AntiTechies.checked) {
				AntiTechiesF()
				$.Schedule(Game.MyTick, L)
			}
		}
		L()
		Game.ScriptLogMsg('Script enabled: AntiTechies', '#00ff00')
	}
}

var AntiTechies = Game.AddScript("AntiTechies", AntiTechiesToggle)