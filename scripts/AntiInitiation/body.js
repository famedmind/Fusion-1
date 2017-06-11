var DisableAbils = [
	"item_orchid",
	"item_bloodthorn",
	"item_sheepstick",
	"item_cyclone",
	"pudge_dismember",
	"lion_voodoo",
	"puck_waning_rift",
	"shadow_shaman_voodoo",
	"dragon_knight_dragon_tail",
	"rubick_telekinesis"
]

var InitSpells = [
	"tidehunter_ravage",
	"axe_berserkers_call",
	"earthshaker_echo_slam",
	"magnataur_reverse_polarity",
	"legion_commander_duel",
	"beastmaster_primal_roar",
	"treant_overgrowth",
	"faceless_void_chronosphere",
	"batrider_flaming_lasso",
	"dark_seer_wall_of_replica",
	"slardar_slithereen_crush",
	"queenofpain_sonic_wave",
	"enigma_black_hole",
	"juggernaut_omni_slash",
	"puck_waning_rift",
	"pudge_dismember",
	"shadow_shaman_shackles",
	"sven_storm_bolt",
	"rubick_telekinesis",
	"lion_impale"
]

var flag = false
function AntiInitiationF(){
	if(!AntiInitiation.checked || flag)
		return
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var abil = -1
	for(var abilName of DisableAbils) {
		var abilL = Game.GetAbilityByName(MyEnt, abilName)
		if(abilL === -1 || Abilities.GetCooldownTimeRemaining(abilL) !== 0)
			continue
		abil = abilL
		break
	}
	if(abil === -1)
		return
	var Behavior = Game.Behaviors(abil)
	var HEnts = Game.PlayersHeroEnts()
	for (var i in HEnts) {
		var ent = parseInt(HEnts[i])
		if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		var abilrange = Abilities.GetCastRangeFix(abil)
		var Range = Entities.GetRangeToUnit(MyEnt, ent)
		if(Range > abilrange && abilrange !== 0)
			continue
		for(var m=0; m < Entities.GetAbilityCount(ent); m++){
			var Abil = Entities.GetAbility(ent, m)
			var AbilName = Abilities.GetAbilityName(Abil)
			var Cast = Abilities.IsInAbilityPhase(Abil)
			if( Abil==-1  || Abilities.GetCooldownTimeRemaining(Abil) !== 0 || Abilities.GetLevel(Abil)==0 || !Cast || InitSpells.indexOf(AbilName)==-1 )
				continue
			if(Cast){
				GameUI.SelectUnit(MyEnt,false)
				Game.EntStop(MyEnt, false)
				if(Behavior.indexOf(4) !== -1)
					Game.CastNoTarget(MyEnt, abil, false)
				else if(Behavior.indexOf(16)!=-1)
					Abilities.CreateDoubleTapCastOrder(abil, MyEnt)
				else if(Behavior.indexOf(8)!=-1 )
					Game.CastTarget(MyEnt, abil, ent, false)
				flag = true
				$.Schedule(0.5, function() {
					flag=false
				})
				return
			}
		}
	}
}


var AntiInitiationToggle = function(){
	if (!AntiInitiation.checked){
		Game.ScriptLogMsg('Script disabled: AntiInitiation', '#ff0000')
		return
	} else {
		function f() {
			$.Schedule (
				Game.MyTick,
				function() {
					AntiInitiationF()
					if(AntiInitiation.checked)
						f()
				}
			)
		}
		f()
		Game.ScriptLogMsg('Script enabled: AntiInitiation', '#00ff00')
	}
}

var AntiInitiation = Game.AddScript('AntiInitiation', AntiInitiationToggle)