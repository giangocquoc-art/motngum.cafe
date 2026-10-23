# MIÊU GIỚI PHIÊU LƯU — GAME DESIGN & RELEASE PLAN
## Genre and vision
Cozy action-RPG about a cat guarding a rice village, playable in 5–15 minute loops on desktop/mobile.
The genre is **single-player ARPG prototype first**, multiplayer MMO later (never claim MMO until an authoritative persistent backend is implemented).

## S0 audit
1. The original quest is one-and-done; no new objectives after the first reward.
2. Rat roster is finite and enemies are removed after defeat, so no sustainable gameplay.
3. Native `player.gold` and custom `meo_coin` are inconsistent.
4. No shop, meaningful resource sink or defeat/revival rules.
5. The HTML quest panel was hard-coded, not a player-state HUD.
6. Character stats were overwritten at every connection, and saving lacked an explicit slot-load lifecycle.
7. Standalone localStorage allows client tampering. No account, cross-device cloud save, authoritative PvP or trade security.
8. Runtime depends on a pinned third-party starter download. Supply-chain and build availability must be controlled.

## Core loop — S1
- Talk to village guardian, accept quest.
- Defeat N rats (5→10), each worth 8 XP / 2 gold native RPGJS reward.
- Rats respawn at their home positions after 6.5 seconds. Quest counts only while active, clamp at N.
- Return to guardian once completed, claim +60→180 gold, exactly once. Repeatable without cooldown.
- Merchant sells heal +70 HP for 25 gold, full rest for 12 gold, claw upgrade +5 ATK up to +3 with growing costs.
- At 0 HP, revive at village with half HP; lose 10% of current gold, capped at 15 gold. Quest progress remains.
- Explicit save slot 0 on rewards/purchases/defeat; load on next entry. S0 save currency/progression migrated once.
- All gold flows use native RPGJS `player.gold`. No extra currency.
- Mobile: RPGJS mobile controls plus smaller readable overlay.

## Balance constraints
- A beginner can earn enough to rest after defeating 6 rats (2 gold each). Completing the first quest awards 60 gold, enabling at least two rests.
- No idle/infinite wallet generation. Kills have HP + combat cost.
- Quests cannot pay twice; merchant rejects insufficient funds, full-health purchases, unknown actions, capped upgrades.
- Death cannot softlock progress or send gold negative.
- Future: server validates kills/purchases/quests when MMORPG enabled. Browser save is not cheat-resistant.

## Release gates
S1: unit tests + npm build + real browser canvas + mobile viewport + smoke interaction, THEN alias promotion.
S2: regions and unlocks, unique bosses, loot drops, equipment slots, live objective UI, controllable movement/combat tutorial, accessibility.
S3: account auth, Cloudflare Worker + Durable Objects per room, D1 for user/account snapshots, atomic write-based server economy, reconnect, movement rate limits. PvP only after cheat-resistant server state.
S4: social co-op, guilds, ranked rewards, seasonal content, telemetry-based balancing, moderation/privacy.
Do not combine MMORPG clients with standalone localStorage as a source of authority.

## Acceptance cases
1. New player accepts a quest; counter is initially zero.
2. Kill 5 rats; quest is complete but cannot turn in early.
3. Turn in once; exact award, no duplicate award on repeated click.
4. Start next quest with reset counter.
5. Kill enough rats even after initial roster defeated (respawn verified).
6. Buying fish while full HP is rejected; healing caps at max.
7. Claw upgrades stop at +3 and never charge on refused purchase.
8. Defeat restores half HP at village, retains quest, never creates negative gold.
9. Reload preserves quest count, gold, upgrades and level in same browser.
10. Works in mobile landscape and desktop; input mapping confirmed by interaction.
