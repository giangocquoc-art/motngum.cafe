import {hasAdminSession,noCache} from '../_lib/security.js';
export default function handler(req,res){noCache(res);if(req.method!=='GET')return res.status(405).end();return res.status(200).json({loggedIn:hasAdminSession(req)});}
