import { type EventDefinition, RpgPlayer, MAXHP, ATK, PDEF } from '@rpgjs/server';
import { BattleAi, EnemyType } from '@rpgjs/action-battle/server';
export function ChuMeo():EventDefinition {
 return {
  name:'Bà Chủ Mèo',
  onInit(){this.setGraphic('npc')},
  async onAction(player:RpgPlayer){
   const state=String(player.getVariable('meo_quest_state')||'new');
   const count=Number(player.getVariable('meo_rat_count')||0);
   if(state==='new'){
    player.setVariable('meo_quest_state','active');
    player.setVariable('meo_rat_count',0);
    await player.showText('Bà Chủ: Lũ chuột trộm gạo! Con hãy đánh bại 10 con rồi quay về gặp ta. Sẵn sàng chưa, mèo nhỏ?');
   }else if(state==='active'&&count<10){
    await player.showText('Bà Chủ: Đánh chuột bằng nút hành động. Con đã bắt được '+count+'/10 con. Cố lên nhé!');
   }else if(state==='active'&&count>=10){
    player.setVariable('meo_quest_state','done');
    player.setVariable('meo_coin',Number(player.getVariable('meo_coin')||0)+120);
    await player.showText('Giỏi quá! Đủ 10/10 chuột rồi! Ta thưởng con 120 xu mèo. Hãy đợi chương tiếp theo nha!');
   }else{
    await player.showText('Bà Chủ: Con là anh hùng của Làng Mèo! Phiêu lưu tiếp ở bản cập nhật sau nhé.');
   }
  }
 };
}
export function Rat():EventDefinition {
 return {
  name:'Chuột Đồng',
  onInit(){
   this.setGraphic('rat');
   this.param[MAXHP]=32;this.hp=32;this.param[ATK]=4;this.param[PDEF]=1;
   new BattleAi(this,{
    enemyType:EnemyType.Aggressive,visionRange:125,attackRange:44,attackCooldown:1600,
    rewards:{exp:8,gold:2,showNotification:true},
    onDefeated:({attacker}:any)=>{
     const p=attacker as RpgPlayer|undefined;
     if(!p||typeof p.getVariable!=='function')return;
     if(p.getVariable('meo_quest_state')!=='active')return;
     const count=Math.min(10,Number(p.getVariable('meo_rat_count')||0)+1);
     p.setVariable('meo_rat_count',count);
     if(count===10)p.showText('Đã bắt đủ 10 chuột! Hãy quay về gặp Bà Chủ Mèo để nhận thưởng.');
    }
   });
  }
 };
}
