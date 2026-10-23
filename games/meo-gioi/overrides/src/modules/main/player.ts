import { RpgPlayer, type RpgPlayerHooks, ATK, PDEF, MAXHP } from '@rpgjs/server';
import { DEFAULT_HP, DEFAULT_ATK, faintPenalty, questState } from '../../gameplay/loop.mjs';
import { notifyAndSave, readProgress, writeProgress } from './progress';

const SPAWN = { x: 300, y: 335 };
const BASE_MAP = 'simplemap';

export const player: RpgPlayerHooks = {
  async onConnected(player: RpgPlayer) {
    let loaded = false;
    try {
      const result = await player.load(0, { reason: 'load', source: 'login' }, { changeMap: true });
      loaded = result.ok;
    } catch (error) {
      console.warn('[Meo Gioi] Could not load local save; starting new character.', error);
    }
    if (!loaded) {
      player.initializeDefaultStats();
      player.name = 'Mèo Du Hành';
      player.param[MAXHP] = DEFAULT_HP;
      player.hp = DEFAULT_HP;
      player.param[ATK] = DEFAULT_ATK;
      player.param[PDEF] = 8;
      player.gold = 0;
      writeProgress(player, questState('new',0,0));
      player.setVariable('meo_claw_upgrades',0);
      await player.changeMap(BASE_MAP,SPAWN);
      await notifyAndSave(player,'Chào mừng đến Làng Mèo! Hãy đến gặp Bà Chủ Mèo để nhận nhiệm vụ.');
    } else {
      // S0 migration: old "done" quests become eligible for new quest runs.
      const progress=readProgress(player);
      writeProgress(player,progress);
      if (player.getVariable('meo_s0_currency_migrated') !== true) {
        const oldCoins=Number(player.getVariable('meo_coin')||0);
        if(Number.isSafeInteger(oldCoins)&&oldCoins>0)player.gold+=Math.min(1000,oldCoins);
        player.setVariable('meo_s0_currency_migrated',true);
      }
      if(player.hp<=0)player.hp=Math.ceil(player.param[MAXHP]/2);
    }
    player.setGraphic('cat');
  },
  async onDead(player: RpgPlayer) {
    const lost=faintPenalty(player.gold);
    player.gold=Math.max(0,player.gold-lost);
    player.hp=Math.max(1,Math.ceil(player.param[MAXHP]/2));
    await player.changeMap(BASE_MAP,SPAWN);
    await notifyAndSave(player,'Hồi sinh');
    await player.showText('Bạn đã hồi sinh ở làng với nửa HP, mất '+lost+' xu. Nhiệm vụ vẫn được giữ.');
  },
  onInput(player: RpgPlayer, {action}) {
    if(action==='escape')player.callMainMenu();
  }
};
