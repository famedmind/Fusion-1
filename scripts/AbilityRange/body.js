try{ D2JS.Panels.AbilityRange.DeleteAsync(0) }catch(e){}
for (i in Game.Subscribes.AbilityRange)
	try{ GameEvents.Unsubscribe( Game.Subscribes.AbilityRange[i] ) }catch(e){}
for(i in D2JS.Particles.AbilityRange)
	try{ Particles.DestroyParticleEffect(D2JS.Particles.AbilityRange[i],D2JS.Particles.AbilityRange[i]) }catch(e){}

D2JS.Particles.AbilityRange = []
Game.Subscribes.AbilityRange = []
D2JS.Panels.AbilityRange = []
var Config = []

function GetAbilityRange(Abil) {
	var abil = parseInt(Abil)
	return Abilities.GetCastRangeFix(abil)
}

function InventoryChanged(data){
	var MyID = Game.GetLocalPlayerID()
	if ( MyID==-1 )
		return
	MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
	if ( MyEnt==-1 )
		return
	if ( D2JS.Particles.AbilityRange.length == 0 )
		return
	for(var i in D2JS.Particles.AbilityRange){
		Range = GetAbilityRange(i)
		Particles.DestroyParticleEffect(D2JS.Particles.AbilityRange[i],D2JS.Particles.AbilityRange[i])
		if ( !Range || Range <= 0 )
			return
		D2JS.Particles.AbilityRange[i] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
		Particles.SetParticleControl(D2JS.Particles.AbilityRange[i], 1,  [Range,0,0])
	}
}

Destroy = function(){
	try{ D2JS.Panels.AbilityRange.DeleteAsync(0) }catch(e){}
	for (var i in Game.Subscribes.AbilityRange.length)
		try{ GameEvents.Unsubscribe( Game.Subscribes.AbilityRange[i] ) }catch(e){}
	for(var i in D2JS.Particles.AbilityRange)
		try{ Particles.DestroyParticleEffect(D2JS.Particles.AbilityRange[i],D2JS.Particles.AbilityRange[i]) }catch(e){}
	Game.Subscribes.AbilityRange = []
	D2JS.Particles.AbilityRange = []
}

function SkillLearned(data){
	var MyID = Game.GetLocalPlayerID()
	var MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
	if ( data.PlayerID != MyID )
		return
	var LearnedAbil =  Entities.GetAbilityByName( MyEnt, data.abilityname )
	if ( LearnedAbil == -1 )
		return
	Range = GetAbilityRange( LearnedAbil )
	if ( data.abilityname == 'attribute_bonus' || Range<=0 )
		return
	if (D2JS.Particles.AbilityRange[LearnedAbil]){
		Particles.DestroyParticleEffect(D2JS.Particles.AbilityRange[LearnedAbil],D2JS.Particles.AbilityRange[LearnedAbil])
		D2JS.Particles.AbilityRange[LearnedAbil] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
		Particles.SetParticleControl(D2JS.Particles.AbilityRange[LearnedAbil], 1,  [Range,0,0])
	}
	CheckBs = AbilityRangePanel.Children()
	for(c=0;c<CheckBs.length;c++){
		Abil = CheckBs[c].GetAttributeInt('Skill', 0)
		if ( Abil == LearnedAbil )
			return
	}
	var CheckB = $.CreatePanel( "ToggleButton", AbilityRangePanel, "AbilityRangeSkill" )
	CheckB.BLoadLayoutFromString( "<root><styles><include src='s2r://panorama/styles/magadan.css' /><include src='s2r://panorama/styles/dotastyles.vcss_c' /></styles><Panel><ToggleButton class='CheckBox'  style='vertical-align:center;'></ToggleButton><DOTAAbilityImage style='width:30px;margin:30px;border-radius:15px;'/></Panel></root>", false, false)  
	CheckB.Children()[1].abilityname = Abilities.GetAbilityName(LearnedAbil)
	CheckB.SetAttributeInt('Skill', LearnedAbil)
	CheckB.SetPanelEvent( 'onactivate', chkboxpressed )
}

function chkboxpressed(){
	var MyEnt = Players.GetPlayerHeroEntityIndex(Game.GetLocalPlayerID())
	var CheckBs = AbilityRangePanel.Children()
	for(c=0;c<CheckBs.length;c++){
		var Checked = CheckBs[c].Children()[0].checked
		var Abil = CheckBs[c].GetAttributeInt('Skill', 0)
		if (Abil == 0 )
			continue
		if (Checked){
			if (!D2JS.Particles.AbilityRange[Abil]){
				D2JS.Particles.AbilityRange[Abil] = Particles.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
				Range = GetAbilityRange( Abil )
				Particles.SetParticleControl(D2JS.Particles.AbilityRange[Abil], 1,  [Range,0,0])
			}
		}else{
			if (D2JS.Particles.AbilityRange[Abil]){
				Particles.DestroyParticleEffect(D2JS.Particles.AbilityRange[Abil],D2JS.Particles.AbilityRange[Abil])
				delete D2JS.Particles.AbilityRange[Abil]
			}
		}
	}
}

AbilityRangeF = function(){
	if (AbilityRange.checked){
		var MyID = Game.GetLocalPlayerID()
		if ( MyID==-1 ){
			AbilityRange.checked = false
			Destroy()
			return
		}
		MyEnt = Players.GetPlayerHeroEntityIndex(MyID)
		if ( MyEnt==-1 ){
			AbilityRange.checked = false
			Destroy()
			return
		}
		D2JS.Panels.AbilityRange = $.CreatePanel( 'Panel', Game.GetMainHUD(), 'AbilityRangePanel' )
		D2JS.Panels.AbilityRange.BLoadLayoutFromString( "<root><Panel class='AbilityRangePanel' style='flow-children: down;background-color:#00000099;border-radius:15px;padding:20px 0;'></Panel></root>", false, false )
		GameUI.MovePanel(D2JS.Panels.AbilityRange,function(p){
			var position = D2JS.Panels.AbilityRange.style.position.split(' ')
			Config.MainPanel.x = position[0]
			Config.MainPanel.y = position[1]
			D2JS.SaveConfig('AbilityRange', Config)
		})
		D2JS.GetConfig('AbilityRange',function(a){
			Config = a[0]
			D2JS.Panels.AbilityRange.style.position = Config.MainPanel.x + ' ' + Config.MainPanel.y + ' 0'
			D2JS.Panels.AbilityRange.style.flowChildren = Config.MainPanel.flow
		});
		Game.AddCommand( '__AbilityRange_Rotate', function(){
			if (D2JS.Panels.AbilityRange.style.flowChildren == 'right')
				D2JS.Panels.AbilityRange.style.flowChildren = 'down'
			else
				D2JS.Panels.AbilityRange.style.flowChildren = 'right'
			Config.MainPanel.flow = D2JS.Panels.AbilityRange.style.flowChildren
			D2JS.SaveConfig('AbilityRange', Config)
		}, '',0 )
	}else{
		Game.ScriptLogMsg('Script disabled: AbilityRange', '#ff0000')
		Destroy()
		return
	}
	AbilityRangePanel = Game.GetMainHUD().FindChildrenWithClassTraverse( 'AbilityRangePanel' )[0]
	for ( i = 0; i < Entities.GetAbilityCount(MyEnt ); i++){
		Abil = Entities.GetAbility(MyEnt,i)
		if ( Abil == -1 )
			continue
		Range = GetAbilityRange( Abil )
		if (Abilities.GetAbilityName(Abil) == 'attribute_bonus' || Range<=0 )
			continue
		Behavior = Abilities.GetBehavior( Abil )
		CheckB = $.CreatePanel( "ToggleButton", AbilityRangePanel, "AbilityRangeSkill" )
		CheckB.BLoadLayoutFromString( "<root><styles><include src='s2r://panorama/styles/magadan.css' /><include src='s2r://panorama/styles/dotastyles.vcss_c' /></styles><Panel><ToggleButton class='CheckBox'  style='vertical-align:center;'></ToggleButton><DOTAAbilityImage style='width:30px;margin:3px;border-radius:15px;'/></Panel></root>", false, false)  
		CheckB.Children()[1].abilityname = Abilities.GetAbilityName(Abil)
		CheckB.SetAttributeInt('Skill', Abil)
		CheckB.SetPanelEvent( 'onactivate', chkboxpressed )
	}
	Game.Subscribes.AbilityRange.push( GameEvents.Subscribe('dota_player_learned_ability', SkillLearned) )
	Game.Subscribes.AbilityRange.push( GameEvents.Subscribe('dota_inventory_changed', InventoryChanged) )
	Game.ScriptLogMsg('Script enabled: AbilityRange', '#00ff00')
}

var AbilityRange = Game.AddScript('AbilityRange', AbilityRangeF)
Destroy()
AbilityRange.checked = false