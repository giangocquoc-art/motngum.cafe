import { type EventDefinition, RpgPlayer, MAXHP, ATK, PDEF } from '@rpgjs/server';
import { BattleAi, EnemyType } from '@rpgjs/action-battle/server';
import { acceptQuest, recordRatDefeat, claimQuest, questSpec, shopPrices, buy, MAX_UPGRADE, RESPAWN_MS } from '../../gameplay/loop.mjs';
import { notifyAndSave, readProgress, writeProgress } from './progress';

// Single quest NPC. Every reward is computed once, prior to displaying the dialog.
export function ChuMeo():EventDefinition {
 return {
  name:'Bà Chủ Mèo',
  onInit(){this.setGraphic('npc')},
  async onAction(player:RpgPlayer){
   const p=readProgress(player), spec=questSpec(p.completed);
   if(p.state==='new'){
    const choice=await player.showChoices(
     'Bà Chủ: Chuột lại đến phá kho lúa! Nhiệm vụ chuyến '+(p.completed+1)+': đánh bại '+spec.target+' chuột. Thưởng '+spec.gold+' xu.',
     [{text:'Nhận nhiệm vụ',value:'accept'},{text:'Để sau',value:'cancel'}]
    );
    if(choice?.value!=='accept')return;
    writeProgress(player,acceptQuest(readProgress(player)));
    await notifyAndSave(player,'Nhiệm vụ đã nhận');
    await player.showText('Đã nhận nhiệm vụ: đánh bại '+spec.target+' chuột.');
    return;
   }
   if(p.count<spec.target){
    await player.showText('Bà Chủ: Tiến độ '+p.count+'/'+spec.target+' chuột. Đánh chuột phía ngoài làng, rồi quay về giao nhiệm vụ.');
    return;
   }
   const result=claimQuest(p);
   if(result.claimed){
    // Persist new quest state before yielding to UI; repeated interaction cannot claim twice.
    writeProgress(player,result.progress);
    player.gold+=result.gold;
    await notifyAndSave(player,'Hoàn thành nhiệm vụ! +'+result.gold+' xu. Tổng '+result.progress.completed+' chuyến săn.');
    await player.showText('Giỏi lắm! Nhận '+result.gold+' xu rồi. Con có thể nhận chuyến săn mới ngay!');
   }
  }
 };
}
export function TiemCa():EventDefinition {
 return {
  name:'Tiệm Cá & Móng Vuốt',
  onInit(){this.setGraphic('npc')},
  async onAction(player:RpgPlayer){
   const level=Number(player.getVariable('meo_claw_upgrades')||0);
   const prices=shopPrices(level);
   const choice=await player.showChoices(
    'Tiệm Cá: Bạn có '+player.gold+' xu | HP: '+player.hp+'/'+player.param[MAXHP]+' | Móng vuốt +'+level,
    [
     {text:'Cá nướng (+70 HP) — '+prices.fish+' xu',value:'fish'},
     {text:'Nghỉ trọ (đầy HP) — '+prices.rest+' xu',value:'rest'},
     {text:'Nâng móng vuốt +5 ATK — '+(level>=MAX_UPGRADE?'MAX':prices.upgrade+' xu'),value:'upgrade'},
     {text:'Rời cửa hàng',value:'cancel'}
    ]
   );
   if(!choice || choice.value==='cancel')return;
   const result=buy(choice.value,{gold:player.gold,hp:player.hp,maxHp:player.param[MAXHP],upgrades:level});
   if(!result.ok){await player.showText(result.reason);return;}
   player.gold=result.gold;
   player.hp=result.hp;
   if(result.upgrades>level){
    player.setVariable('meo_claw_upgrades',result.upgrades);
    player.param[ATK]+=5;
   }
   await notifyAndSave(player,result.message);
   await player.showText(result.message+' Còn '+player.gold+' xu.');
  }
 };
}
// Position is captured at creation. Dead entities are removed by the engine and
// re-spawned as NEW entities after a cooldown; no infinite duplicate rewards.
export function Rat(spawnX:number,spawnY:number):EventDefinition {
 return {
  name:'Chuột Đồng',
  onInit(){
   this.setGraphic('rat');
   this.param[MAXHP]=40;this.hp=40;this.param[ATK]=6;this.param[PDEF]=1;
   new BattleAi(this,{
    enemyType:EnemyType.Aggressive,
    visionRange:110,attackRange:43,attackCooldown:1700,
    rewards:{exp:8,gold:2,showNotification:false},
    onDefeated:({event,attacker}:any)=>{
     const p=attacker as RpgPlayer|undefined;
     const map=event?.getCurrentMap?.() ?? p?.getCurrentMap?.();
     // Schedule one respawn for each actual defeat; RPGJS calls this once.
     if(map?.createDynamicEvent){
       setTimeout(()=>{void map.createDynamicEvent({
         x:spawnX,y:spawnY,event:Rat(spawnX,spawnY)
       }).catch((e:unknown)=>console.error('[Meo Gioi] Respawn failed',e));},RESPAWN_MS);
     }
     if(!p||typeof p.getVariable!=='function')return;
     const result=recordRatDefeat(readProgress(p));
     if(!result.added)return;
     writeProgress(p,result.progress);
     const target=questSpec(result.progress.completed).target;
     void notifyAndSave(p,'Lưu tiến độ săn chuột');
     if(result.finished)void p.showText('Đã đủ '+target+' chuột! Về gặp Bà Chủ Mèo nhận thưởng.');
    }
   });
  }
 };
}
