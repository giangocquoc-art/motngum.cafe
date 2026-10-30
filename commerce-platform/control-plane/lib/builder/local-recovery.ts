import { validateSiteDocument } from './validation';
import type { SiteDocument } from './catalog';

/** Temporary offline safety net, NEVER an alternative authoritative database. */
export const RECOVERY_TTL_MS=7*24*60*60*1000;
export type RecoverySnapshot={format:'motngum-recovery-v1';baseVersion:number;savedAt:number;document:SiteDocument};
export const recoveryKey=(userId:number,teamId:number,siteId:string) =>
  'studio:recovery:v1:'+userId+':'+teamId+':'+siteId;
export function recoveryEnvelope(document:SiteDocument,baseVersion:number,now=Date.now()):RecoverySnapshot {
  return {format:'motngum-recovery-v1',baseVersion,savedAt:now,document};
}
export function parseRecovery(value:string|null,now=Date.now()):RecoverySnapshot|null {
  if(!value || value.length>1_100_000)return null;
  try{
    const source=JSON.parse(value) as Partial<RecoverySnapshot>;
    if(source?.format!=='motngum-recovery-v1' ||
      !Number.isSafeInteger(source.baseVersion)||!source.baseVersion||source.baseVersion<1 ||
      typeof source.savedAt!=='number'||source.savedAt>now+60_000||
      now-source.savedAt>RECOVERY_TTL_MS)return null;
    const document=validateSiteDocument(source.document);
    if(!document)return null;
    return {format:'motngum-recovery-v1',baseVersion:source.baseVersion,savedAt:source.savedAt,document};
  }catch{return null;}
}
