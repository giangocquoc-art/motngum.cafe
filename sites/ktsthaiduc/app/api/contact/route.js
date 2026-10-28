import {NextResponse} from 'next/server';
export const runtime='nodejs';
const emailRX=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request){
  let data;try{data=await request.json()}catch{return NextResponse.json({error:'Dữ liệu không hợp lệ.'},{status:400})}
  const {name,phone,email='',service='',message,consent,website}=data||{};
  if(website)return NextResponse.json({ok:true});
  if(typeof name!=='string'||name.trim().length<2||name.length>90||typeof phone!=='string'||!/^\+?[0-9().\s-]{9,20}$/.test(phone)||typeof message!=='string'||message.trim().length<10||message.length>3000||typeof email!=='string'||email.length>160||(email&&!emailRX.test(email))||consent!=='on')return NextResponse.json({error:'Vui lòng kiểm tra họ tên, điện thoại, nội dung và đồng ý điều khoản.'},{status:400});
  const endpoint=process.env.CONTACT_ENDPOINT;
  if(!endpoint)return NextResponse.json({error:'Kênh tiếp nhận tạm chưa được cấu hình. Vui lòng gọi hoặc nhắn Zalo để được hỗ trợ.'},{status:503});
  try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);let result;try{result=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Relay-Source':'ktsthaiduc-site'},body:JSON.stringify({name:name.trim(),phone:phone.trim(),email:email.trim(),service:String(service).slice(0,100),message:message.trim()}),signal:controller.signal,cache:'no-store'})}finally{clearTimeout(timeout)}if(!result.ok)throw Error('storage_error');return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Không thể ghi nhận lúc này. Vui lòng liên hệ trực tiếp qua Zalo hoặc điện thoại.'},{status:502})}
}
