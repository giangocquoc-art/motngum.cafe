import {cookie,noCache,safeOrigin} from '../_lib/security.js';
export default function handler(req,res){noCache(res);if(req.method!=='POST')return res.status(405).end();if(!safeOrigin(req))return res.status(403).end();res.setHeader('Set-Cookie',cookie('',0));return res.status(200).json({ok:true});}
