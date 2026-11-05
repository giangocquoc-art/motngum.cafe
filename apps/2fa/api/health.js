import { sql } from './_lib/db.js';
import { noCache } from './_lib/security.js';
export default async function handler(req,res){
  noCache(res);
  if(req.method !== 'GET') return res.status(405).json({ok:false});
  try{
    const result = await sql`SELECT 1 AS ok`;
    return res.status(200).json({ok:result?.[0]?.ok === 1});
  }catch{
    return res.status(503).json({ok:false});
  }
}
