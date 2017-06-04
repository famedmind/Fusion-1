var hookspeed = 1450,
	hookwidth = 100,
	myVec, myForwardVec, enVec, MyEnt, ent
function Hook(callback) {
	myVec = Entities.GetAbsOrigin(MyEnt)
	myForwardVec = Entities.GetForward(MyEnt)
	enVec = Entities.GetAbsOrigin(ent)
	//enForwardVec = Entities.GetForward(ent)
	var
		hook = Game.GetAbilityByName(MyEnt, 'pudge_meat_hook'),
		distance = Entities.GetRangeToUnit(MyEnt, ent),
		reachtime = (distance / hookspeed),
		angle = Game.AngleBetweenVectors(myVec, myForwardVec, enVec),
		rottime = Game.RotationTime(angle, 0.7),
		delay = Abilities.GetCastPoint(hook),
		time = reachtime + delay + rottime + Game.MyTick,
		predict = Game.VelocityWaypoint(ent, time)
	
	if(distance > Abilities.GetCastRangeFix(hook))
		return
	
	Game.CastPosition(ent, hook, predict, false)
	$.Schedule(time, function() {
		if(!CancelHook())
			callback()
	})
}

function CancelHook() {
	var distance = Game.PointDistance(enVec, Entities.GetAbsOrigin(ent))/*,
		angle = Game.AngleBetweenTwoFaces(enForwardVec, myForwardVec)*/
	
	if(distance > hookwidth) {
		Game.EntStop(MyEnt, false)
		PudgeCombo()
		return true
	} else
		return false
}

function Rot() {
	var rot = Game.GetAbilityByName(MyEnt,'pudge_rot'),
		userbuffs = Game.GetBuffsNames(ent),
		MyEntbuffs = Game.GetBuffsNames(MyEnt),
		distance = Entities.GetRangeToUnit(MyEnt, ent)

	if(!Game.IntersecArrays(MyEntbuffs, ['modifier_pudge_rot']))
		Abilities.ExecuteAbility(rot, MyEnt, false)
}

function Urn() {
	var urn = Game.GetAbilityByName(MyEnt, 'item_urn_of_shadows'),
		urncharges = Items.GetCurrentCharges(urn)
		
	if(urncharges > 0)
		Game.CastTarget(MyEnt, urn, ent, false)
}

function Dismember() {
	var dismember = Game.GetAbilityByName(MyEnt,'pudge_dismember')

	Game.CastTarget(MyEnt, dismember, ent, false)
}

D2JS.Commands.PudgeCombo = function() {
	Hook(function() {
		Urn()
		Rot()
		Dismember()
	})
}

function PudgeComboCommand() {
	MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	ent = Game.ClosetToMouse(1000, true)
	if(ent === undefined)
		return
	D2JS.Commands.PudgeCombo()
}

function BindCommands() {
	Game.AddCommand("__PudgeCombo", PudgeComboCommand, "", 0)
}

//function MapLoaded(data) {
	BindCommands()
//}

//GameEvents.Subscribe('game_newmap', MapLoaded)