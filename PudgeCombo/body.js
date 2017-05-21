function ClosetToMouse(range) {
	var mousePos = Game.ScreenXYToWorld(GameUI.GetCursorPosition()[0],GameUI.GetCursorPosition()[1])
	var enemies = []
	var enemyTeam = Game.PlayersHeroEnts().filter(function(ent) {
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

var PING = (50 / 1000)
var GLOBALTIME
var ENEMYFORWARD
var POS
function Hook(MyEnt, ent) {
	var hook = Game.GetAbilityByName(MyEnt,'pudge_meat_hook'),
		hookspeed = 1600
		a = Entities.GetAbsOrigin(MyEnt),
		b = Entities.GetAbsOrigin(ent),
		forward = Entities.GetForward(MyEnt),
		enforward = Entities.GetForward(ent),
		distance = Game.PointDistance(a,b),
		reachtime = (distance / hookspeed),
		angle = Game.AngleBetweenVectors(a, forward, b),
		rottime = Game.RotationTime(angle, 0.7),
		delay = Game.MyTick,
		time = reachtime + delay + PING + rottime,
		predict = Game.VelocityWaypoint(ent, time)
		GLOBALTIME = time
		ENEMYFORWARD = enforward
		POS = b

	Game.CastPosition(ent, hook, predict, false)
	CancelHook(MyEnt, ent)
}

function CancelHook(MyEnt, ent) {
	$.Schedule(Game.MyTick - 0.09, function() {
		var b = Entities.GetAbsOrigin(ent),
			distance = Game.PointDistance(b, POS),
			enforward = Entities.GetForward(ent),
			angle = Game.AngleBetweenTwoFaces(ENEMYFORWARD, enforward)
		
		if(angle > 0.20 || distance > 200) {
			$.Msg(angle)
			$.Msg(distance)
			Game.EntStop(MyEnt, false)
			Cast()
		}
	})
}

function Rot(MyEnt, ent) {
	var rot = Game.GetAbilityByName(MyEnt,'pudge_rot'),
		userbuffs = Game.GetBuffsNames(ent),
		MyEntbuffs = Game.GetBuffsNames(MyEnt),
		a = Entities.GetAbsOrigin(MyEnt),
		b = Entities.GetAbsOrigin(ent),
		distance = Game.PointDistance(a,b)

	if(!Game.IntersecArrays(MyEntbuffs, ['modifier_pudge_rot'])) {
		if(distance < 125) {
			Abilities.ExecuteAbility(rot, MyEnt, false)
		}
	}
}

function Urn(MyEnt, ent) {
	var urn = Game.GetAbilityByName(MyEnt, 'item_urn_of_shadows'),
		urncharges = Items.GetCurrentCharges(urn)
		
	if(distance < 160 || urncharges > 0) {
		Game.CastTarget(MyEnt, urn, ent, false)
	}
}

function Dismember(MyEnt, ent) {
	var dismember = Game.GetAbilityByName(MyEnt,'pudge_dismember'),
		userbuffs = Game.GetBuffsNames(ent),
		MyEntbuffs = Game.GetBuffsNames(MyEnt),
		a = Entities.GetAbsOrigin(MyEnt),
		b = Entities.GetAbsOrigin(ent),
		distance = Game.PointDistance(a,b)

	if(distance < 160) {
		Game.Castent(MyEnt, dismember, ent, false)
	}
}
 
function PudgeCombo() {
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var ent = ClosetToMouse(500)
	if(ent === -1)
		return
 
	function Cast() {
		Hook(MyEnt, ent)
		Urn(MyEnt, ent)
		Rot(MyEnt, ent)
		Dismember(MyEnt, ent)
	}
 
	Cast()
}

function BindCommands() {
	Game.AddCommand("__PudgeCombo", PudgeCombo, "", 0)
}

function MapLoaded(data) {
	BindCommands()
}

GameEvents.Subscribe('game_newmap', MapLoaded)