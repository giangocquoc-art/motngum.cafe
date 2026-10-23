// Pure game rules shared by quest NPC, combat and merchant.
// Client has no authority over rewards; a future multiplayer server must run these rules.
export const QUEST_STATES = Object.freeze({ NEW: 'new', ACTIVE: 'active' });
export const MAX_UPGRADE = 3;
export const DEFAULT_HP = 150;
export const DEFAULT_ATK = 22;
export const RESPAWN_MS = 6500;

export function safeInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : fallback;
}
export function questSpec(completed = 0) {
  const clears = Math.min(1000, safeInt(completed));
  return Object.freeze({
    target: 5 + Math.min(5, Math.floor(clears / 2)),
    gold: 60 + Math.min(120, clears * 15),
  });
}
export function questState(state, count = 0, completed = 0) {
  const spec = questSpec(completed);
  const stage = state === QUEST_STATES.ACTIVE ? QUEST_STATES.ACTIVE : QUEST_STATES.NEW;
  return { state: stage, count: stage === QUEST_STATES.ACTIVE ? Math.min(spec.target, safeInt(count)) : 0, completed: safeInt(completed) };
}
export function acceptQuest(progress) {
  const p = questState(progress.state, progress.count, progress.completed);
  return p.state === QUEST_STATES.ACTIVE ? p : { ...p, state: QUEST_STATES.ACTIVE, count: 0 };
}
export function recordRatDefeat(progress) {
  const p = questState(progress.state, progress.count, progress.completed);
  if (p.state !== QUEST_STATES.ACTIVE) return { progress: p, added: false, finished: false };
  const target = questSpec(p.completed).target;
  if (p.count >= target) return { progress: p, added: false, finished: true };
  const count = p.count + 1;
  return { progress: { ...p, count }, added: true, finished: count === target };
}
export function claimQuest(progress) {
  const p = questState(progress.state, progress.count, progress.completed);
  const spec = questSpec(p.completed);
  if (p.state !== QUEST_STATES.ACTIVE || p.count < spec.target)
    return { progress: p, claimed: false, gold: 0 };
  return { progress: {state: QUEST_STATES.NEW, count: 0, completed: p.completed + 1}, claimed: true, gold: spec.gold };
}
export function shopPrices(upgrades = 0) {
  return { fish: 25, rest: 12, upgrade: 90 + Math.min(MAX_UPGRADE, safeInt(upgrades)) * 70 };
}
export function buy(kind, {gold, hp, maxHp, upgrades}) {
  const money=safeInt(gold), level=Math.min(MAX_UPGRADE,safeInt(upgrades));
  const maximum=Math.max(1,safeInt(maxHp,DEFAULT_HP));
  const health=Math.min(maximum,safeInt(hp));
  const costs=shopPrices(level);
  if (kind === 'fish') {
    if (health>=maximum) return { ok:false, reason:'Mèo đang đầy máu, không cần ăn cá.' };
    if (money<costs.fish) return { ok:false, reason:'Chưa đủ xu để mua cá.' };
    return { ok:true, gold: money-costs.fish, hp: Math.min(maximum,health+70), upgrades:level, message:'Ăn cá hồi phục tối đa 70 HP.' };
  }
  if (kind === 'rest') {
    if (health>=maximum) return {ok:false,reason:'Mèo đã khỏe mạnh rồi.'};
    if (money<costs.rest) return {ok:false,reason:'Chưa đủ xu để nghỉ trọ.'};
    return {ok:true,gold:money-costs.rest,hp:maximum,upgrades:level,message:'Nghỉ trọ hồi đầy HP.'};
  }
  if (kind === 'upgrade') {
    if(level>=MAX_UPGRADE) return {ok:false,reason:'Móng vuốt đã đạt cấp tối đa +3.'};
    if(money<costs.upgrade) return {ok:false,reason:'Chưa đủ xu để nâng móng vuốt.'};
    return {ok:true,gold:money-costs.upgrade,hp:health,upgrades:level+1,message:'Móng vuốt được tăng thêm 5 ATK.'};
  }
  return {ok:false,reason:'Vật phẩm không hợp lệ.'};
}
export function faintPenalty(gold) {
  // New players never lose access to the repeatable quest or become trapped at 0 gold.
  return Math.min(15, Math.floor(safeInt(gold)/10));
}
