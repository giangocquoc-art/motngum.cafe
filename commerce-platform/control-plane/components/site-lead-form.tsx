'use client';
import {useRef,useState,type FormEvent} from 'react';
export function SiteLeadForm({siteSlug,blockId,kind}:{
  siteSlug:string;blockId:string;kind:'contact'|'newsletter'
}){
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[message,setMessage]=useState('');
  const [consent,setConsent]=useState(false),[website,setWebsite]=useState('');
  const [loading,setLoading]=useState(false),[status,setStatus]=useState('');
  const requestId=useRef<string|null>(null);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!consent)return;
    setLoading(true);setStatus('');
    if(!requestId.current)requestId.current=window.crypto.randomUUID();
    try{
      const response=await fetch('/api/public-sites/'+encodeURIComponent(siteSlug)+'/submit',{
        method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({requestId:requestId.current,blockId,email,name,message,website,consent})
      });
      const data=await response.json();
      if(!response.ok)throw Error(response.status===429?'Đã nhận quá nhiều yêu cầu. Vui lòng thử lại sau.':
        data.error||'Không thể gửi biểu mẫu.');
      setStatus('Đã nhận thông tin. Cảm ơn bạn!');
      requestId.current=null;setName('');setEmail('');setMessage('');setConsent(false);
    }catch(error){setStatus(error instanceof Error?error.message:'Không thể gửi thông tin.');}
    finally{setLoading(false);}
  }
  return <form className="mt-5 flex flex-col gap-3" onSubmit={event=>{void submit(event);}}>
    {kind==='contact'&&<label className="flex flex-col gap-1 text-sm font-medium">Tên liên hệ
      <input required maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}
        className="rounded-lg border border-current/30 bg-transparent px-3 py-2" /></label>}
    <label className="flex flex-col gap-1 text-sm font-medium">Email
      <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}
        className="rounded-lg border border-current/30 bg-transparent px-3 py-2" /></label>
    {kind==='contact'&&<label className="flex flex-col gap-1 text-sm font-medium">Nội dung yêu cầu
      <textarea required rows={4} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)}
        className="rounded-lg border border-current/30 bg-transparent px-3 py-2" /></label>}
    <label className="hidden" aria-hidden="true">Website (để trống)
      <input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)} /></label>
    <label className="flex items-start gap-2 text-xs">
      <input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>
      Tôi đồng ý gửi các thông tin trên cho chủ website để họ phản hồi yêu cầu.
    </label>
    <button type="submit" disabled={loading||!consent}
      className="rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
      style={{backgroundColor:'#1f2937'}}>{loading?'Đang gửi...':'Gửi thông tin'}</button>
    {status&&<p role="status" aria-live="polite" className="text-sm">{status}</p>}
  </form>;
}
