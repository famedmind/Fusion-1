//Автодизейбл инициаторов.
//айтемы с помощью которых будем дизейблить
var DisableItems = [
	"item_orchid",
	"item_bloodthorn",
	"item_sheepstick",
	"item_cyclone"
]

//абилки с помощью которых будем дизейблить
var DisableAbils = [
	"pudge_dismember",
	"lion_voodoo",
	"puck_waning_rift",
	"shadow_shaman_voodoo",
	"dragon_knight_dragon_tail",
	"rubick_telekinesis"
]

//спелы врагов на которые будет реагировать скрипт
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
	"queenofpain_sonic_wave"
]

var LenseBonusRange = 200
var interval = 0
var flag = false
var threads = 3 //threads :D

function AntiInitiationF(){
	if ( !AntiInitiation.checked || flag )
		return
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var item=-1
	c: // C:
	for(i in DisableItems)
		for(m = 0; m<6; m++){
			var it = Entities.GetItemInSlot( MyEnt, m )
			if(DisableItems[i]==Abilities.GetAbilityName(it) && Abilities.GetCooldownTimeRemaining(it)==0){
				item = it
				break c;
			}
		}
	C:
	if(item==-1){
		for(i in DisableAbils)
		for(m = 0; m<Entities.GetAbilityCount(MyEnt); m++){
			var it = Entities.GetAbility( MyEnt, m )
			if(DisableAbils[i]==Abilities.GetAbilityName(it) && Abilities.GetCooldownTimeRemaining(it)==0){
				item = it
				break C;
			}
		}	
	}
	if(item==-1)
		return
	var itemname = Abilities.GetAbilityName(item)
	var Behavior = Game.Behaviors(item)
	var HEnts = Game.PlayersHeroEnts()
	for (i in HEnts) {
		var ent = parseInt(HEnts[i])
		if (!Entities.IsEnemy(ent) || !Entities.IsAlive(ent))
			continue
		var itemrange = Abilities.GetCastRange(item)
		if(Entities.HasItemInInventory( MyEnt, 'item_aether_lens'))
			itemrange+=LenseBonusRange
		var Range = Entities.GetRangeToUnit(MyEnt, ent)
		if(Range>itemrange && itemrange!=0)
			continue
		for(m=0;m<Entities.GetAbilityCount(ent);m++){
			var Abil = Entities.GetAbility(ent, m)
			var AbilName = Abilities.GetAbilityName(Abil)
			var Cast = Abilities.IsInAbilityPhase(Abil)
			if( Abil==-1  || Abilities.GetCooldownTimeRemaining(Abil)!=0 || Abilities.GetLevel(Abil)==0 || !Cast || InitSpells.indexOf(AbilName)==-1 )
				continue
			if(Cast){
				GameUI.SelectUnit(MyEnt,false)
				Game.EntStop(MyEnt, false)
				if(Behavior.indexOf(4)!=-1)
					Game.CastNoTarget(MyEnt, item, false)
				else if(Behavior.indexOf(16)!=-1)
					Abilities.CreateDoubleTapCastOrder( item, MyEnt )
				else if(Behavior.indexOf(8)!=-1 )
					Game.CastTarget(MyEnt,item,ent,false)
				flag = true
				$.Schedule(0.5,function(){ flag=false })
				return
			}
		}
	}
}


var AutoCritFOnCheckBoxClick = function(){
	if ( !AntiInitiation.checked ){
		Game.ScriptLogMsg('Script disabled: AntiInitiation', '#ff0000')
		return
	}
	//циклически замкнутый таймер с проверкой условия с интервалом 'interval'
	function f(){ $.Schedule( interval,function(){
		AntiInitiationF()
		if(AntiInitiation.checked)
			f()
	})}
	for(i=0;i<threads;i++)
		f()
	Game.ScriptLogMsg('Script enabled: AntiInitiation', '#00ff00')
}

var AntiInitiation = Game.AddScript('AntiInitiation', AutoCritFOnCheckBoxClick)