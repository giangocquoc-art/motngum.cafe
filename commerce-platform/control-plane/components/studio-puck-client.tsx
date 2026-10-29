'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { createMotngumPuckConfig } from '@/components/studio-puck-config';
import {
  applyPuckPage, PuckConversionError, siteToPuckWorkspace
} from '@/lib/builder/puck-adapter';
import { THEMES, type SiteDocument, type ThemeId } from '@/lib/builder/catalog';
import { validateSiteDocument } from '@/lib/builder/validation';

type Props={
  siteId:string;
  slug:string;
  initialDocument:SiteDocument;
  initialVersion:number;
  role:string;
};

export function StudioPuckClient({siteId,slug,initialDocument,initialVersion,role}:Props) {
  const [document,setDocument]=useState(initialDocument);
  const documentRef=useRef(initialDocument);
  const versionRef=useRef(initialVersion);
  const changeCount=useRef(0);
  const dirtyRef=useRef(false);
  const blockedRef=useRef(false);
  const pendingSave=useRef<Promise<boolean>|null>(null);
  const [dirty,setDirty]=useState(false);
  const [blocked,setBlocked]=useState(false);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState('Đang chỉnh sửa bản nháp với Puck · Chưa xuất bản.');
  const [activePageId,setActivePageId]=useState(initialDocument.pages[0].id);
  const [publishedUrl,setPublishedUrl]=useState<string|null>(null);
  const canPublish=role==='owner';
  const activePage=document.pages.find(page=>page.id===activePageId)||document.pages[0];

  const config=useMemo(()=>createMotngumPuckConfig(document.themeId),[document.themeId]);
  const pageData=useMemo(()=>{
    const workspace=siteToPuckWorkspace(document);
    return workspace.pages.find(page=>page.id===activePage.id)!.data as Data;
    // Puck owns its page session until page/theme is explicitly switched;
    // do not replace its data prop on every keystroke.
  },[activePage.id, document.themeId]);

  const commit=useCallback((next:SiteDocument)=>{
    const validated=validateSiteDocument(next);
    if(!validated){
      blockedRef.current=true;setBlocked(true);
      setNotice('Nội dung không hợp lệ theo schema v2. Chưa ghi vào cơ sở dữ liệu.');
      return false;
    }
    if(JSON.stringify(validated)===JSON.stringify(documentRef.current))return true;
    documentRef.current=validated;setDocument(validated);
    changeCount.current+=1;
    dirtyRef.current=true;setDirty(true);
    return true;
  },[]);

  const editPuck=useCallback((pageId:string,data:Data)=>{
    try{
      const next=applyPuckPage(documentRef.current,pageId,data);
      commit(next);
    }catch(error){
      blockedRef.current=true;setBlocked(true);
      setNotice(error instanceof PuckConversionError
        ? 'Puck trả về cấu trúc chưa hỗ trợ ('+error.code+'). Giữ nguyên dữ liệu cũ, chưa lưu.'
        : 'Không thể chuyển đổi dữ liệu Puck. Đã khóa tự lưu để bảo vệ bản nháp.');
    }
  },[commit]);

  const flush=useCallback(async (manual=false):Promise<boolean>=>{
    if(pendingSave.current){
      const previous=await pendingSave.current;
      if(!previous)return false;
      if(!dirtyRef.current)return true;
    }
    if(!dirtyRef.current)return true;
    if(blockedRef.current && !manual)return false;
    if(manual){blockedRef.current=false;setBlocked(false);}
    const operation=(async():Promise<boolean>=>{
      setSaving(true);
      setNotice('Đang lưu bản nháp vào PostgreSQL...');
      const snapshot=documentRef.current;
      const seq=changeCount.current;
      const version=versionRef.current;
      try{
        const response=await fetch('/api/sites/'+encodeURIComponent(siteId),{
          method:'PATCH',
          credentials:'same-origin',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({version,document:snapshot}),
        });
        const result=await response.json();
        if(!response.ok){
          if(response.status===409)throw Error('409: phiên bản từ người chỉnh sửa khác đã thay đổi. Xuất JSON dự phòng, tải lại để đối chiếu; không tự ghi đè.');
          if(response.status===401||response.status===403)throw Error('Phiên đăng nhập hoặc quyền chỉnh sửa không còn hợp lệ. Không tự thử lại.');
          if(response.status===422)throw Error('Tài liệu không vượt qua kiểm tra dữ liệu v2.');
          throw Error(result.error||'Không lưu được bản nháp');
        }
        if(!Number.isSafeInteger(result.site?.version)||result.site.version!==version+1)
          throw Error('Phản hồi phiên bản từ server không hợp lệ; cần xác minh lại trước khi ghi tiếp.');
        versionRef.current=result.site.version;
        if(seq===changeCount.current){
          dirtyRef.current=false;setDirty(false);
          setNotice('Đã lưu an toàn · revision '+result.site.version);
        }else{
          dirtyRef.current=true;setDirty(true);
          setNotice('Đã lưu revision '+result.site.version+'; đang chờ lưu những thay đổi tiếp theo.');
        }
        return true;
      }catch(error){
        blockedRef.current=true;setBlocked(true);
        setNotice('Dừng tự lưu: '+(error instanceof Error?error.message:String(error)));
        return false;
      }finally{setSaving(false);}
    })();
    pendingSave.current=operation;
    const success=await operation;
    pendingSave.current=null;
    return success;
  },[siteId]);

  useEffect(()=>{
    if(!dirty||blocked||saving)return;
    const timer=window.setTimeout(()=>{void flush();},1600);
    return ()=>window.clearTimeout(timer);
  },[dirty,blocked,saving,document,flush]);

  useEffect(()=>{
    if(!dirty)return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);
    return ()=>window.removeEventListener('beforeunload',warn);
  },[dirty]);

  const saveAll=useCallback(async(manual:boolean):Promise<boolean>=>{
    for(let attempt=0;attempt<5;attempt++){
      const saved=await flush(manual && attempt===0);
      if(!saved)return false;
      if(!dirtyRef.current)return true;
    }
    setNotice('Vẫn còn thay đổi đang tiếp diễn. Dừng chỉnh sửa và nhấn Lưu trước khi xuất bản.');
    return false;
  },[flush]);

  async function switchPage(targetId:string) {
    if(targetId===activePageId)return;
    if(!(await saveAll(false))){
      setNotice('Không thể chuyển trang khi còn bản nháp chưa lưu hoặc đang xung đột. Hãy xuất JSON dự phòng.');
      return;
    }
    setActivePageId(targetId);
  }
  async function changeTheme(themeId:ThemeId) {
    if(themeId===documentRef.current.themeId)return;
    if(!(await saveAll(false)))return;
    const previous=documentRef.current;
    commit({...previous,themeId});
  }

  async function publish(data:Data) {
    if(!canPublish){setNotice('Chỉ chủ tổ chức mới được xuất bản.');return;}
    editPuck(activePageId,data);
    if(blockedRef.current)return;
    if(!(await saveAll(false)))return;
    if(!window.confirm('Xuất bản snapshot revision '+versionRef.current+' trên staging? Không kích hoạt thanh toán.'))return;
    try {
      const response=await fetch('/api/sites/'+encodeURIComponent(siteId)+'/publish',{
        method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({version:versionRef.current})
      });
      const data=await response.json();
      if(!response.ok)throw Error(data.problems?.join(' · ')||data.error||'Publish thất bại');
      setPublishedUrl(data.url);
      setNotice('Đã xuất bản snapshot revision '+data.version+'.');
    }catch(error){
      setNotice('Chưa thể xuất bản: '+(error instanceof Error?error.message:String(error)));
    }
  }

  function exportJson(){
    const content=JSON.stringify(documentRef.current,null,2);
    const blob=new Blob([content],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const anchor=window.document.createElement('a');
    anchor.href=url;anchor.download='motngum-puck-'+siteId+'-v2.json';
    window.document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  return <section className="min-h-screen bg-slate-50">
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b bg-white px-4 py-3">
      <div className="mr-auto">
        <h1 className="text-base font-bold text-slate-900">Puck Studio · {document.title}</h1>
        <p className="text-xs text-slate-500">Editor thử nghiệm (Gate C2) · SiteDocument v2 · revision {versionRef.current}</p>
      </div>
      <label htmlFor="studio-puck-theme" className="text-xs font-semibold text-slate-700">Theme</label>
      <select id="studio-puck-theme" aria-label="Chọn theme" value={document.themeId}
        onChange={event=>{void changeTheme(event.target.value as ThemeId);}}
        className="rounded-lg border bg-white px-2 py-2 text-xs">
        {THEMES.map(theme=><option key={theme.id} value={theme.id}>{theme.name}</option>)}
      </select>
      <button type="button" onClick={()=>{void saveAll(true);}}
        disabled={saving} className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {saving?'Đang lưu...':blocked?'Thử lưu lại':dirty?'Lưu bản nháp':'Đã lưu'}
      </button>
      <button type="button" onClick={exportJson} className="rounded-lg border px-3 py-2 text-xs font-semibold">Xuất JSON dự phòng</button>
      <a className="rounded-lg border px-3 py-2 text-xs font-semibold" href={'/dashboard/sites/'+siteId+'/preview'} target="_blank" rel="noopener noreferrer">Xem bản nháp</a>
      {publishedUrl&&<a href={publishedUrl} className="text-xs font-semibold text-green-800" target="_blank" rel="noopener noreferrer">Xem bản đã xuất bản</a>}
      <a className="rounded-lg border px-3 py-2 text-xs font-semibold" href={'/builder-demo?site='+siteId}>Editor cũ</a>
    </header>
    <p role={blocked?'alert':'status'} className={'px-4 py-3 text-sm '+(blocked?'bg-rose-50 text-rose-900':'bg-amber-50 text-amber-950')}>{notice}</p>
    <nav aria-label="Các trang website" className="flex flex-wrap items-center gap-2 border-b bg-white px-4 py-3">
      {document.pages.map(page=><button type="button" key={page.id}
        onClick={()=>{void switchPage(page.id);}}
        aria-current={page.id===activePageId?'page':undefined}
        className={'rounded-lg px-3 py-2 text-xs font-semibold '+(page.id===activePageId?'bg-slate-900 text-white':'border bg-white text-slate-800')}>
        {page.title} <span className="opacity-60">/{page.slug}</span>
      </button>)}
      <span className="ml-auto text-xs text-slate-500">{dirty?'Có thay đổi chưa lưu':'Đồng bộ với cloud'}</span>
    </nav>
    <div className="min-h-[700px]" data-studio="puck">
      <Puck
        key={activePageId+'-'+document.themeId}
        config={config}
        data={pageData}
        ui={{plugin:{current:'fields'}}}
        headerTitle={'Motngum Studio / '+activePage.title}
        headerPath={'/'+slug+'/'+activePage.slug}
        onChange={data=>editPuck(activePageId,data)}
        onPublish={data=>{void publish(data);}}
      />
    </div>
  </section>;
}
