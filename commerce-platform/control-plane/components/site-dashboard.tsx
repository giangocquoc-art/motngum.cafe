'use client';
import { useCallback, useEffect, useState } from 'react';
import { SITE_TEMPLATES, TEMPLATE_CATEGORIES, buildTemplateDocument, themeById } from '@/lib/builder/catalog';

type SiteRow={id:string;slug:string;title:string;draftVersion:number;publishedVersion:number|null;updatedAt:string;publishedAt:string|null};
export function SiteDashboard() {
  const [sites,setSites]=useState<SiteRow[]>([]);
  const [selected,setSelected]=useState(SITE_TEMPLATES[0].id);
  const [category,setCategory]=useState('Tất cả');
  const [working,setWorking]=useState(false);
  const [message,setMessage]=useState('');
  const [role,setRole]=useState<string|null>(null);
  const refresh=useCallback(async()=>{
    try{
      const response=await fetch('/api/sites',{cache:'no-store'});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Không lấy được danh sách');
      setSites(data.sites||[]);setRole(data.role||null);
    }catch(e){setMessage(e instanceof Error?e.message:'Không tải được website');}
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  async function createSite() {
    if(working)return;
    const template=SITE_TEMPLATES.find(t=>t.id===selected)||SITE_TEMPLATES[0];
    setWorking(true);setMessage('');
    try{
      const response=await fetch('/api/sites',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({document:buildTemplateDocument(template)})});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Tạo website thất bại');
      window.location.assign('/builder-demo?site='+encodeURIComponent(data.site.id));
    }catch(e){setMessage(e instanceof Error?e.message:'Không thể tạo site');setWorking(false);}
  }
  return <div className="mx-auto max-w-6xl p-5 md:p-8">
    <h1 className="text-3xl font-bold text-slate-900">Website của tôi</h1>
    <p className="mt-2 text-sm text-slate-600">Website thuộc tổ chức đang chọn. Mẫu tạo mới chỉ lưu nháp, chưa được phát hành hoặc bán hàng.</p>
    {message&&<p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    <section className="mt-7 rounded-xl border bg-white p-5">
      <h2 className="text-xl font-bold">Tạo website từ mẫu</h2>
      <div className="my-4 flex flex-wrap gap-2">
        {['Tất cả',...TEMPLATE_CATEGORIES].map(c=><button type="button" key={c}
          onClick={()=>setCategory(c)} className={'rounded-full px-3 py-1.5 text-xs font-semibold '+(category===c?'bg-slate-900 text-white':'bg-slate-100 text-slate-700')}>{c}</button>)}
      </div>
      <div className="grid max-h-72 grid-cols-2 gap-3 overflow-auto md:grid-cols-4">
        {SITE_TEMPLATES.filter(t=>category==='Tất cả'||t.category===category).map(t=>{
          const theme=themeById(t.theme);
          return <button type="button" key={t.id} onClick={()=>setSelected(t.id)} className={'rounded-xl border p-3 text-left '+(selected===t.id?'border-amber-600 ring-2 ring-amber-100':'border-slate-200')}>
            <div className="mb-2 h-14 rounded-lg p-3 text-xs font-bold" style={{background:theme.background,color:theme.foreground,borderLeft:'5px solid '+theme.primary}}>{t.name}</div>
            <p className="text-xs font-semibold">{t.name}</p><p className="text-[11px] text-slate-500">{t.category}</p>
          </button>;
        })}
      </div>
      <button type="button" onClick={createSite} disabled={working||!(role==='owner'||role==='editor'||role==='member')}
        className="mt-4 rounded-lg bg-amber-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
        {working?'Đang tạo...':'Tạo bản nháp và mở editor'}
      </button>
    </section>
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold">Các website đã lưu ({sites.length})</h2>
      {!sites.length?<p className="rounded-lg border bg-white p-6 text-sm text-slate-500">Chưa có website trong tổ chức này.</p>:
        <div className="grid gap-3 md:grid-cols-2">{sites.map(site=><article key={site.id} className="rounded-xl border bg-white p-5">
          <div className="flex items-start justify-between gap-2"><h3 className="font-bold">{site.title}</h3>
            <span className={'rounded-full px-2 py-1 text-xs '+(site.publishedVersion?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800')}>{site.publishedVersion?'Đã phát hành':'Bản nháp'}</span></div>
          <p className="mt-2 text-xs text-slate-500">/{site.slug} · Revision {site.draftVersion}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white" href={'/builder-demo?site='+site.id}>Chỉnh sửa</a>
            <a className="rounded-lg border px-3 py-2 text-xs" href={'/dashboard/sites/'+site.id+'/preview'}>Xem bản nháp</a>
            {site.publishedVersion&&<a className="rounded-lg border px-3 py-2 text-xs" href={'/s/'+site.slug} target="_blank" rel="noopener noreferrer">Mở bản công khai</a>}
          </div>
        </article>)}</div>}
    </section>
  </div>;
}
