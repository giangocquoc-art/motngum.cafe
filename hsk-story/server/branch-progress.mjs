import { neon } from '@neondatabase/serverless';
import { userFor } from './auth.mjs';
import { bodyJSON, originFor, json, publicError } from './http.mjs';
import Engine from '../duong-re/branch-engine.js';
import Learning from '../duong-re/branch-learning.js';
import Recall from '../duong-re/session-recall.js';

const invalid = () => Object.assign(new Error('Invalid branch snapshot'), { status: 400 });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function sanitizeSnapshot(raw) {
  const expectedLearningLength = raw && (raw.version === 1 || raw.version === 2) ? Learning.legacyTotal : raw && raw.version === 3 ? 12 : raw && raw.version === 4 && Array.isArray(raw.learning) && raw.learning.length === 15 ? 15 : Learning.total;
  if (!plain(raw) || ![1, 2, 3, 4].includes(raw.version) || !Array.isArray(raw.path) || raw.path.length > 50 || !Array.isArray(raw.learning) || raw.learning.length !== expectedLearningLength) throw invalid();
  const path = raw.path.map(item => {
    if (!plain(item) || typeof item.at !== 'string' || typeof item.choice !== 'string' || item.at.length > 100 || item.choice.length > 100) throw invalid();
    return { at: item.at, choice: item.choice };
  });
  const replay = Engine.load({version: 1, path});
  if (JSON.stringify(replay.path) !== JSON.stringify(path)) throw invalid();
  const learning = raw.learning.map(item => {
    if (item === null) return null;
    if (!plain(item) || !['correct', 'assisted', 'skipped'].includes(item.status) || !Number.isInteger(item.attempts) || item.attempts < 0 || item.attempts > 100 || typeof item.hint !== 'boolean' || (item.status === 'assisted' && !item.hint)) throw invalid();
    const checked = Learning.clean([item])[0];
    if (!checked) throw invalid();
    return checked;
  });
  while (learning.length < Learning.total) learning.push(null);
  let draft = null;
  if (raw.draft != null) {
    const d = raw.draft, pending = Learning.pending(replay, learning);
    if (!plain(d) || !Number.isInteger(d.index) || !pending || d.index !== pending.index || d.at !== replay.node || !Array.isArray(d.path) || JSON.stringify(d.path) !== JSON.stringify(path) || !Number.isInteger(d.attempts) || d.attempts < 0 || d.attempts > 100 || typeof d.helped !== 'boolean' || typeof d.draft !== 'string' || d.draft.length > 100) throw invalid();
    draft = {index:d.index, at:d.at, path, attempts:d.attempts, helped:d.helped, draft:d.draft};
    if (d.evidence != null) {
      const checked = Learning.clean([{status:'correct',attempts:d.attempts,hint:d.helped,evidence:d.evidence}])[0];
      if (!checked) throw invalid();
      draft.evidence = checked.evidence;
    }
    if (d.helpSources != null) {
      const allowed = ['model','subtitles','tiles','sample','ai'];
      if (!Array.isArray(d.helpSources) || d.helpSources.some(value => !allowed.includes(value))) throw invalid();
      draft.helpSources = allowed.filter(value => d.helpSources.includes(value));
    }
  }
  if (raw.version >= 2 && raw.recall == null) throw invalid();
  let recall;
  try { recall = raw.version === 1 ? Recall.fresh() : Recall.clean(raw.recall); } catch { throw invalid(); }
  if (!recall || (recall.status === 'in-progress' && (replay.node !== 'school-gate' || !path.some(item => item.at === 'arrival'))) || (recall.boundary !== 'continued' && recall.status !== 'unseen' && (replay.node !== 'school-gate' || !path.some(item => item.at === 'arrival')))) throw invalid();
  const result = {version: Learning.snapshotVersion || 3, path, learning, draft, recall};
  if (JSON.stringify(result).length > 120000) throw invalid();
  return result;
}
function database() { return neon(process.env.CHIMSE_DATABASE_URL, {fetchOptions: {signal: AbortSignal.timeout(10000)}}); }
function record(row) { return row && row.branch_revision > 0 ? {revision: row.branch_revision, snapshot: row.branch_snapshot, updatedAt: row.branch_updated_at} : {revision: 0, snapshot: null, updatedAt: null}; }
export function createHandler(resolveUser = userFor, getDatabase = database) {
 return async function handler(req, res) {
  try {
   if (!['GET', 'PUT'].includes(req.method)) return json(res, 405, {error:'Method not allowed'});
   const origin = originFor(req);
   if (req.method === 'PUT' && (!req.headers.origin || req.headers['x-chimse-client'] !== 'account-v1')) return json(res, 403, {error:'Origin required'});
   const user = await resolveUser(req, res, origin), db = getDatabase();
   // A session may change in another tab while a save is queued. Never write
   // one account's local story using a different account's cookie.
   if (!user || req.headers['x-chimse-owner'] !== user.id) return json(res, 403, {error:'Account changed'});
   if (req.method === 'GET') {
    const rows = await db`SELECT branch_revision, branch_snapshot, branch_updated_at FROM public.learner_progress WHERE user_id=${user.id}`;
    return json(res, 200, record(rows[0]));
   }
   const body = bodyJSON(req, 131072);
   if (!Number.isSafeInteger(body.revision) || body.revision < 0 || body.revision > 2147483646) return json(res, 400, {error:'Invalid revision'});
   const snapshot = JSON.stringify(sanitizeSnapshot(body.snapshot));
   const rows = body.revision === 0
    ? await db`INSERT INTO public.learner_progress(user_id,snapshot,branch_revision,branch_snapshot,branch_updated_at) VALUES (${user.id},'{"v":1,"story":null,"intro":null,"review":null}'::jsonb,1,${snapshot}::jsonb,now()) ON CONFLICT (user_id) DO UPDATE SET branch_revision=1,branch_snapshot=EXCLUDED.branch_snapshot,branch_updated_at=now() WHERE public.learner_progress.branch_revision=0 RETURNING branch_revision,branch_snapshot,branch_updated_at`
    : await db`UPDATE public.learner_progress SET branch_revision=branch_revision+1,branch_snapshot=${snapshot}::jsonb,branch_updated_at=now() WHERE user_id=${user.id} AND branch_revision=${body.revision} RETURNING branch_revision,branch_snapshot,branch_updated_at`;
   if (rows.length) return json(res, 200, record(rows[0]));
   const latest = await db`SELECT branch_revision,branch_snapshot,branch_updated_at FROM public.learner_progress WHERE user_id=${user.id}`;
   return json(res, 409, {...record(latest[0]),conflict:true});
  } catch (error) { publicError(res, error); }
 };
}
export default createHandler();
