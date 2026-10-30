/**
 * Explicit operator-only retention. Never called by a user request, cron or
 * ordinary editor save. Requires an fsynced local archive BEFORE deletion.
 */
import postgres from 'postgres';
import {mkdir,open} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const apply=process.argv.includes('--apply');
const dirArg=process.argv.find(x=>x.startsWith('--backup-dir='));
if(apply&&!dirArg)throw Error('Refusing destructive retention without --backup-dir=/private/secure/path');
const connection=process.env.POSTGRES_URL;
if(!connection)throw Error('POSTGRES_URL required');
const db=postgres(connection,{max:1});
const candidatesQuery=`
  WITH ranked AS (
    SELECT id,site_id,team_id,actor_id,version,document,action,created_at,
      ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY version DESC) AS recent_rank
    FROM builder_site_revisions
  )
  SELECT * FROM ranked
  WHERE recent_rank > 100 AND version % 25 <> 0
    AND action = 'save' AND created_at < NOW() - INTERVAL '30 days'
  ORDER BY site_id,version`;
try{
  const totals=await db.unsafe("SELECT COUNT(*)::int AS versions, COALESCE(SUM(pg_column_size(document)),0)::bigint AS document_bytes FROM builder_site_revisions");
  const candidates=await db.unsafe(candidatesQuery);
  console.log(JSON.stringify({mode:apply?'backup-and-prune':'dry-run',versions:totals[0].versions,
    documentBytes:totals[0].document_bytes,candidateCount:candidates.length},null,2));
  if(!apply)process.exitCode=0;
  else if(!candidates.length)console.log('No old snapshots need archiving.');
  else{
    const folder=resolve(dirArg.slice('--backup-dir='.length));
    await mkdir(folder,{recursive:true,mode:0o700});
    const filepath=join(folder,'motngum-revisions-'+new Date().toISOString().replace(/[:.]/g,'-')+'.ndjson');
    const file=await open(filepath,'wx',0o600);
    try{
      for(const row of candidates)await file.write(JSON.stringify(row)+'\n');
      await file.sync();
    }finally{await file.close();}
    // Lock every affected site in canonical order, so new saves and archival
    // cannot race on the same site's revision history.
    await db.begin(async tx=>{
      const ids=[...new Set(candidates.map(r=>r.site_id))].sort();
      for(const id of ids)await tx.unsafe('SELECT id FROM builder_sites WHERE id=$1 FOR UPDATE',[id]);
      const fresh=await tx.unsafe(candidatesQuery);
      const expected=candidates.map(r=>r.id).sort().join(',');
      const actual=fresh.map(r=>r.id).sort().join(',');
      if(expected!==actual)throw Error('Retention set changed after archive. Nothing deleted; rerun report.');
      await tx.unsafe('DELETE FROM builder_site_revisions WHERE id = ANY($1::uuid[])',
        [candidates.map(r=>r.id)]);
    });
    console.log('Archived and pruned '+candidates.length+' snapshots. Keep offline backup: '+filepath);
  }
}finally{await db.end();}
