//загрузка произвольного файла с сервера будь то конфиг или xml. Учитывайте, что это асинхронная функция, потому она не возвращает результат мгновенно.
//Пример использования: var test; Game.GetFile('папка_файла.xml', function(a){ test = a });

Game.GetFile = function(file, callback){
	$.AsyncWebRequest(
				'http://TrueProgrammer.servegame.com:4297',
				{
					type: 'POST',
					data: {
						'getfile': file
					},
					complete: function(a){ callback( a.responseText.substring(0, a.responseText.length - 2).toString() ) }
				}
	)
}

Game.GetXML = function(file, callback){
	$.AsyncWebRequest(
				'http://TrueProgrammer.servegame.com:4297',
				{
					type: 'POST',
					data: {
						'getxml': file
					},
					complete: function(a){ callback( a.responseText.substring(0, a.responseText.length - 2).toString() ) }
				}
	)
}

//загрузка конфига в json - спецификации
Game.GetConfig = function(config, callback){
	Game.GetFile (
		config,
		function(a){
			callback(JSON.parse(a))
		}
	)
}

//сохранение конфига в json - спецификации
Game.SaveConfig = function(config, json){
	$.AsyncWebRequest(
				'http://TrueProgrammer.servegame.com:4297',
			{
				type: 'POST',
				data: { 
					'writefile': JSON.stringify({ "filepath": config, "json": JSON.stringify(json) })
				}
			}
	)
}


//таймер, нежелательно использовать. Есть Game.Tick
Game.Every = function(start, time, tick, func){var startTime = Game.Time();var tickRate = tick;if(tick < 1){if(start < 0) tick--;tickRate = time / -tick;}var tickCount =  time/ tickRate;if(time < 0){tickCount = 9999999;}var numRan = 0;$.Schedule(start, (function(start,numRan,tickRate,tickCount){return function(){if(start < 0){start = 0;if(func()){return;}; }  var tickNew = function(){numRan++;delay = (startTime+tickRate*numRan)-Game.Time();if((startTime+tickRate*numRan)-Game.Time() < 0){delay = 0;}$.Schedule(delay, function(){if(func()){return;};tickCount--;if(tickCount > 0) tickNew();});};tickNew();}})(start,numRan,tickRate,tickCount));};

//глобальный массив функций
Game.GameTick = []
Game.GameSTick = []
Game.Tick = function(a){
	t = Game.GameTick.indexOf(a)
	if (t!=-1)
		return;
	Game.GameTick.push(a)
}
Game.DTick = function(a){
	t = Game.GameTick.indexOf(a)
	if (t==-1)
		return;
	delete Game.GameTick[t]
}
Game.STick = function(a){
	t = Game.GameSTick.indexOf(a)
	if (t!=-1)
		return;
	Game.GameSTick.push(a)
}
Game.DSTick = function(a){
	t = Game.GameSTick.indexOf(a)
	if (t==-1)
		return;
	delete Game.GameSTick[t]
}
if(Game.TicksRegistered == true){}else{
	Game.Every(-1, -1, 0, function(){
		for(a in Game.GameTick)
			Game.GameTick[a]()
	});
	Game.Every(-1, -1, 1, function(){
		for(a in Game.GameSTick)
			Game.GameSTick[a]()
	});
	Game.TicksRegistered = true
}
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
Game.Subscribes.OnMapLoadCB = GameEvents.Subscribe('game_newmap', function(){
	Game.EzTechies.Remotemines = []
	for(i in Game.Subscribes.OnMapLoad)
		Game.Subscribes.OnMapLoad[i]()
})
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
		if (!GameUI.IsControlDown())
			return
		var color = a.style.backgroundColor
		a.style.backgroundColor = '#FFFF00FF'
		var uiw = Game.GetMainHUD().actuallayoutwidth
		var uih = Game.GetMainHUD().actuallayoutheight
		linkpanel = function(){
			a.style.position = (GameUI.GetCursorPosition()[0]/uiw*100) + '% ' + (GameUI.GetCursorPosition()[1]/uih*100) + '% ' + '0'
			if (GameUI.IsMouseDown( 0 )){
				Game.DTick(linkpanel)
				a.SetPanelEvent('onactivate', e)
				a.style.backgroundColor = color
				callback(a)
			}
		}
		Game.Tick(linkpanel)
	}
	a.SetPanelEvent( 'onactivate', e)
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

//функция получения высоты полоски hp у героев
Game.GetHealthBarOffset = function(heroname){
	healthbaroffsets=[[["lone_druid"], 145],[["huskar"], 170],[["drow_ranger"], 130],[["pugna"], 140],[["naga_siren"], 180],[["wisp"], 160],[["vengefulspirit"], 170],[["ogre_magi"], 180],[["sand_king"], 130],[["slardar"], 140],[["jakiro"], 280],[["windrunner"], 160],[["tiny"], 165],[["morphling"], 140],[["lycan"], 220],[["medusa"], 200],[["enigma"], 220],[["oracle"], 240],[["razor"], 230],[["shredder"], 250],[["clinkz"], 144],[["templar_assassin"], 180],[["riki"], 115],[["magnataur"], 220],[["skeleton_king"], 190],[["slark"], 140],[["weaver"], 110],[["abaddon"], 175],[["puck"], 165],[["antimage"], 140],[["legion_commander"], 200],[["bane"], 235],[["kunkka"], 150],[["pudge"], 180],[["arc_warden"], 160],[["abyssal_underlord"], 200],[["winter_wyvern"], 200],[["ancient_apparition"], 190],[["techies"], 150],[["phoenix"], 240],[["life_stealer"], 130],[["faceless_void"], 150],[["venomancer"], 150],[["earthshaker"], 155],[["enchantress"], 180],[["undying"], 250],[["earth_spirit"], 200],[["mirana"], 155],[["keeper_of_the_light"], 230],[["lina"], 170],[["tusk"], 190],[["bristleback"], 200],[["centaur"], 220],[["troll_warlord"], 200],[["visage"], 180],[["phantom_lancer"], 190],[["spirit_breaker"], 160],[["elder_titan"], 200],[["rattletrap"], 130],[["nevermore"], 250],[["dazzle"], 160],[["tidehunter"], 190],[["disruptor"], 200],[["rubick"], 170],[["terrorblade"], 280],[["batrider"], 240],[["treant"], 260],[["phantom_assassin"], 180],[["meepo"], 125],[["brewmaster"], 140],[["night_stalker"], 165],[["luna"], 185],[["lion"], 170],[["beastmaster"], 180],[["axe"], 160],[["juggernaut"], 170],[["shadow_demon"], 175],[["obsidian_destroyer"], 350],[["spectre"], 180],[["silencer"], 130],[["bounty_hunter"], 120],[["zuus"], 130],[["invoker"], 170],[["omniknight"], 145],[["alchemist"], 200],[["furion"], 180],[["crystal_maiden"], 135],[["gyrocopter"], 240],[["broodmother"], 120],[["doom_bringer"], 240],[["ursa"], 150],[["chen"], 190],[["death_prophet"], 200],[["bloodseeker"], 130],[["shadow_shaman"], 130],[["storm_spirit"], 170],[["dark_seer"], 130],[["queenofpain"], 145],[["sniper"], 110],[["lich"], 225],[["skywrath_mage"], 300],[["necrolyte"], 160],[["warlock"], 195],[["nyx_assassin"], 200],[["sven"], 150],[["dragon_knight"], 170],[["tinker"], 150],[["leshrac"], 170],[["ember_spirit"], 200],[["witch_doctor"], 150],[["chaos_knight"], 220],[["viper"], 210]]
	var healthbaroffset
	for ( i=0; i<healthbaroffsets.length; i++){
		if ( heroname == "npc_dota_hero_" + healthbaroffsets[i][0] )
			healthbaroffset = healthbaroffsets[i][1]
	}
	return healthbaroffset
}

//приказ герою переместится в точку с координатами [x,y,z]
Game.MoveTo = function(ent, xyz, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_MOVE_TO_POSITION
	order.UnitIndex = ent
	order.Position = xyz;   
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order );
}

//каст способности или айтема на цель (chiling touch)
Game.CastTarget = function(ent, abil, target, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TARGET
	order.UnitIndex = ent
	order.TargetIndex  = target
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order );
}

//каст способности или айтема в точку (sunstrike)
Game.CastPosition = function(ent, abil, xyz, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_POSITION
	order.UnitIndex = ent
	order.Position = xyz
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

//каст способности или айтема
Game.CastNoTarget = function(ent, abil, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_NO_TARGET
	order.UnitIndex = ent
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

//переключение способности
Game.ToggleAbil = function(ent, abil, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE
	order.UnitIndex = ent
	order.AbilityIndex = abil
	order.Queue = queue
	order.ShowEffects = false
	Game.PrepareUnitOrders( order )
}

//приказ остановиться
Game.EntStop = function(ent, queue){
	var order = {};
	order.OrderType = dotaunitorder_t.DOTA_UNIT_ORDER_STOP 
	order.UnitIndex = ent
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
Game.GetInventory = function(entity){
	inv = []
	for(i = 0; i<6; i++){
		if(Entities.GetItemInSlot( entity, i )!=-1)
			inv.push(Entities.GetItemInSlot( entity, i ))
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
	Temp.BLoadLayoutFromString('<root><styles><include src="s2r://panorama/styles/dotastyles.vcss_c" /><include src="s2r://panorama/styles/magadan.vcss_c" /></styles><Panel><ToggleButton class="CheckBox" id="' + scriptName + '" text="' + scriptName + '"/></Panel></root>', false, false)  
	return $.GetContextPanel().FindChildTraverse(scriptName).Children()[0]
}


//SetCameraTargetPosition(10,10)
/*
GetName
GetClass
GetTexture
GetDuration
GetDieTime
GetRemainingTime
GetElapsedTime
GetCreationTime
GetStackCount
IsDebuff
IsHidden
GetCaster
GetParent
GetAbility
ent.IsMoving
*/
Game.ScriptLogMsg('Utils sucessfull loaded', '#00ff00')