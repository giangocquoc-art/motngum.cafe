import { RpgPlayer, type RpgPlayerHooks, ATK, PDEF, MAXHP } from '@rpgjs/server';
export const player: RpgPlayerHooks = {
 onConnected(player: RpgPlayer) {
  player.changeMap('simplemap',{x:300,y:300});
  player.name='Mèo Du Hành';
  player.setGraphic('cat');
  player.param[MAXHP]=150;player.hp=150;player.param[ATK]=22;player.param[PDEF]=8;
  if(!player.getVariable('meo_quest_state'))player.setVariable('meo_quest_state','new');
 },
 onInput(player: RpgPlayer,{action}) {
  if(action==='escape')player.callMainMenu();
 }
};
