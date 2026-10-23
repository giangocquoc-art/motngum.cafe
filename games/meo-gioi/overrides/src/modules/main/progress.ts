import { RpgPlayer } from '@rpgjs/server';
import {questState} from '../../gameplay/loop.mjs';

export function readProgress(player:RpgPlayer) {
  return questState(
    player.getVariable('meo_quest_state'),
    player.getVariable('meo_rat_count'),
    player.getVariable('meo_quests_completed') || (player.getVariable('meo_quest_state')==='done'?1:0)
  );
}
export function writeProgress(player:RpgPlayer,p:ReturnType<typeof readProgress>){
 player.setVariable('meo_quest_state',p.state);
 player.setVariable('meo_rat_count',p.count);
 player.setVariable('meo_quests_completed',p.completed);
}
export async function notifyAndSave(player:RpgPlayer,_message:string){
 try { await player.save(0) } catch (error) { console.error('[Meo Gioi] Save failed',error);void player.showText('Không lưu được tiến độ trên trình duyệt này.'); }
}
