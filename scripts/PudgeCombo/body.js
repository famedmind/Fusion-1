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
	$.Schedule(Game.MyTick, CancelHook)
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
	var ent = Game.ClosetToMouse(500, true)
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

//function MapLoaded(data) {
	BindCommands()
//}

//GameEvents.Subscribe('game_newmap', MapLoaded)