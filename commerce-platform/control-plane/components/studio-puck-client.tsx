'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Puck, type Data } from '@puckeditor/core';
import { createMotngumPuckConfig } from '@/components/studio-puck-config';
import {
  applyPuckPage, PuckConversionError, siteToPuckWorkspace
} from '@/lib/builder/puck-adapter';
import { BLOCK_KINDS, KIND_LABELS, THEMES, createBlock, type BlockKind, type SiteDocument, type ThemeId } from '@/lib/builder/catalog';
import { MAX_SITE_BLOCKS, MAX_SITE_TOTAL_BLOCKS } from '@/lib/builder/validation';
import {
  addSitePage, countPageReferences, deleteSitePage, duplicateSitePage,
  moveSitePage, normalizePageSlug, renameSitePage, renameSitePageTitle, SitePageOperationError
} from '@/lib/builder/page-operations';
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
  const [puckEpoch,setPuckEpoch]=useState(0);
  const [quickKind,setQuickKind]=useState<BlockKind>('text');
  const [publishedUrl,setPublishedUrl]=useState<string|null>(null);
  const canPublish=role==='owner';
  const activePage=document.pages.find(page=>page.id===activePageId)||document.pages[0];
  const totalBlocks=document.pages.reduce((total,page)=>total+page.blocks.length,0);
  const canInsert=activePage.blocks.length<MAX_SITE_BLOCKS&&totalBlocks<MAX_SITE_TOTAL_BLOCKS;

  const config=useMemo(()=>createMotngumPuckConfig(document.themeId),[document.themeId]);
  const pageData=useMemo(()=>{
    const workspace=siteToPuckWorkspace(document);
    return workspace.pages.find(page=>page.id===activePage.id)!.data as Data;
    // Puck owns its page session until page/theme is explicitly switched;
    // do not replace its data prop on every keystroke.
  },[activePage.id, document.themeId, puckEpoch]);

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

  const flush:(manual?:boolean)=>Promise<boolean>=useCallback(async (manual=false):Promise<boolean>=>{
    if(pendingSave.current){
      const previous=await pendingSave.current;
      if(!previous)return false;
      if(!dirtyRef.current)return true;
      // Another caller is saving a newer local revision: join its in-flight
      // request rather than issuing two PATCHes for the same CAS version.
      return flush(manual);
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

  async function mutatePages(
    change:(source:SiteDocument)=>SiteDocument,
    options?:{selectLast?:boolean;selectNew?:boolean;remount?:boolean;message?:string}
  ){
    // Never switch or mutate navigation while the remote base revision is stale.
    if(!(await saveAll(false))){
      setNotice('Còn bản nháp chưa lưu hoặc có xung đột. Xuất JSON và xử lý trước khi sửa cấu trúc trang.');
      return;
    }
    try{
      const before=documentRef.current;
      const next=change(before);
      if(!commit(next))return;
      if(options?.selectNew){
        const ids=new Set(before.pages.map(page=>page.id));
        const added=next.pages.find(page=>!ids.has(page.id));
        if(added)setActivePageId(added.id);
      }
      if(options?.selectLast)setActivePageId(next.pages[0].id);
      if(options?.remount)setPuckEpoch(epoch=>epoch+1);
      setNotice(options?.message||'Đã thay đổi cấu trúc trang; đang tự lưu vào PostgreSQL.');
    }catch(error){
      const code=error instanceof SitePageOperationError?error.code:'unknown';
      setNotice('Không thể cập nhật trang: '+code+'. Bản nháp hiện tại không bị thay đổi.');
    }
  }

  function addPage(){
    const title=window.prompt('Tên trang mới (tối đa 80 ký tự):','Trang mới');
    if(title===null)return;
    if(!title.trim()){setNotice('Tên trang không được để trống.');return;}
    const suggested=normalizePageSlug(title);
    const slug=window.prompt('Đường dẫn trang mới (slug):',suggested);
    if(slug===null)return;
    void mutatePages(doc=>addSitePage(doc,title,normalizePageSlug(slug)),{
      selectNew:true,message:'Đã thêm trang mới. Thêm block trong bảng Puck ở dưới.'
    });
  }
  function renamePageTitle(){
    const title=window.prompt('Đổi tên trang:',activePage.title);
    if(title===null)return;
    void mutatePages(doc=>renameSitePageTitle(doc,activePage.id,title),{
      message:'Đã đổi tên trang, đường dẫn vẫn giữ nguyên.'
    });
  }
  function renamePageSlug(){
    const slug=window.prompt('Đổi đường dẫn trang (mọi CTA liên quan sẽ tự cập nhật):',activePage.slug);
    if(slug===null)return;
    void mutatePages(doc=>renameSitePage(doc,activePage.id,normalizePageSlug(slug)),{
      remount:true,message:'Đã đổi slug và cập nhật toàn bộ CTA nội bộ; dữ liệu đang tự lưu.'
    });
  }
  function duplicatePage(){
    const proposed=normalizePageSlug(activePage.slug+'-copy');
    const slug=window.prompt('Đường dẫn bản sao:',proposed);
    if(slug===null)return;
    void mutatePages(doc=>duplicateSitePage(doc,activePage.id,normalizePageSlug(slug)),{
      selectNew:true,message:'Đã nhân bản trang với ID mới cho mọi block.'
    });
  }
  function removePage(){
    if(documentRef.current.pages.length<2){setNotice('Website phải có ít nhất một trang.');return;}
    const source=documentRef.current;
    const refs=countPageReferences(source,activePage.id);
    let replacementId:string|undefined;
    if(refs>0){
      const alternatives=source.pages.filter(p=>p.id!==activePage.id);
      const slug=window.prompt(
        'Có '+refs+' liên kết trỏ đến trang này. Nhập slug trang thay thế:\n'
          + alternatives.map(p=>p.slug).join(', '),alternatives[0].slug
      );
      if(slug===null)return;
      const target=alternatives.find(p=>p.slug===slug.trim());
      if(!target){setNotice('Chưa chọn slug thay thế hợp lệ, không xóa trang.');return;}
      replacementId=target.id;
    }
    if(!window.confirm('Xóa trang '+activePage.title+' và toàn bộ block của trang?'+
      (refs>0?' Các CTA cũ sẽ chuyển đến trang thay thế.':'')))return;
    void mutatePages(doc=>deleteSitePage(doc,activePage.id,replacementId),{
      selectLast:true,message:'Đã xóa trang, bảo toàn liên kết nội bộ và đang lưu revision mới.'
    });
  }
  function quickInsertBlock(){
    if(!canInsert){setNotice('Đã đạt hạn mức 40 khối/trang hoặc 200 khối/site.');return;}
    void mutatePages(doc=>{
      const target=doc.pages.find(page=>page.id===activePage.id);
      const total=doc.pages.reduce((count,page)=>count+page.blocks.length,0);
      if(!target||target.blocks.length>=MAX_SITE_BLOCKS||total>=MAX_SITE_TOTAL_BLOCKS)
        throw new SitePageOperationError('block_limit');
      // Accessible alternative to drag/drop, sharing the same v2 registry.
      // New blocks have no fake CTA target; explicit user input is required.
      const block={...createBlock(quickKind,doc.themeId),buttonLabel:'',buttonUrl:''};
      return {...doc,pages:doc.pages.map(page=>page.id===target.id?
        {...page,blocks:[...page.blocks,block]}:page)};
    },{remount:true,message:'Đã thêm khối '+KIND_LABELS[quickKind]+'. Dùng Fields để sửa nội dung.'});
  }

  function reorderPage(direction:-1|1){
    void mutatePages(doc=>moveSitePage(doc,activePage.id,direction),{
      message:'Đã thay đổi thứ tự trang; trang đầu tiên là trang chủ.'
    });
  }

  async function publish(data?:Data) {
    if(!canPublish){setNotice('Chỉ chủ tổ chức mới được xuất bản.');return;}
    // Puck's built-in publish supplies its current canvas Data. The explicit
    // Studio toolbar publish uses the already validated onChange document.
    if(data)editPuck(activePageId,data);
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
        <p className="text-xs text-slate-500">Editor thử nghiệm (Gate C3/C4) · SiteDocument v2 · revision {versionRef.current}</p>
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
      {canPublish&&<button type="button" onClick={()=>{void publish();}} disabled={saving||blocked}
        className="rounded-lg border border-green-700 px-3 py-2 text-xs font-semibold text-green-800 disabled:opacity-40">Xuất bản staging</button>}
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
    <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 px-4 py-3" role="group" aria-label="Quản lý trang trong Puck">
      <button type="button" onClick={addPage} disabled={blocked||document.pages.length>=12}
        className="rounded-lg border border-amber-600 px-3 py-2 text-xs font-semibold disabled:opacity-40">+ Thêm trang</button>
      <button type="button" onClick={renamePageTitle} disabled={blocked}
        className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">Đổi tên</button>
      <button type="button" onClick={renamePageSlug} disabled={blocked}
        className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">Đổi slug</button>
      <button type="button" onClick={duplicatePage} disabled={blocked||document.pages.length>=12}
        className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">Nhân bản trang</button>
      <button type="button" onClick={()=>reorderPage(-1)} disabled={blocked||document.pages[0].id===activePage.id}
        className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">↑ Đưa lên</button>
      <button type="button" onClick={()=>reorderPage(1)} disabled={blocked||document.pages.at(-1)?.id===activePage.id}
        className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">↓ Đưa xuống</button>
      <button type="button" onClick={removePage} disabled={blocked||document.pages.length<2}
        className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-900 disabled:opacity-40">Xóa trang</button>
      <span className="ml-auto text-xs text-slate-600" aria-live="polite">
        {document.pages.length}/12 trang · {activePage.blocks.length}/40 khối trong trang · {totalBlocks}/200 khối toàn site
      </span>
    </div>
    <div className="flex flex-wrap items-center gap-2 border-b bg-white px-4 py-2" role="group" aria-label="Thêm khối không cần kéo thả">
      <label htmlFor="studio-quick-block" className="text-xs font-semibold text-slate-800">Chọn khối</label>
      <select id="studio-quick-block" aria-label="Loại khối thêm nhanh" value={quickKind}
        onChange={event=>setQuickKind(event.target.value as BlockKind)}
        className="max-w-xs rounded-lg border bg-white px-2 py-2 text-xs">
        {BLOCK_KINDS.map(kind=><option key={kind} value={kind}>{KIND_LABELS[kind]}</option>)}
      </select>
      <button type="button" onClick={quickInsertBlock} disabled={blocked||!canInsert}
        className="rounded-lg border border-amber-700 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-40">
        + Thêm khối vào trang
      </button>
      <span className="text-xs text-slate-500">Dùng Puck để kéo-thả; nút này hỗ trợ thao tác bàn phím và thiết bị cảm ứng.</span>
    </div>
    {!canInsert&&<p role="status" className="bg-amber-100 px-4 py-2 text-xs text-amber-900">
      Đã đạt giới hạn block. Hãy xóa bớt block trước khi kéo thêm hoặc nhân bản.</p>}
    <div className="min-h-[700px]" data-studio="puck">
      <Puck
        key={activePageId+'-'+document.themeId+'-'+puckEpoch}
        config={config}
        data={pageData}
        ui={{plugin:{current:'fields'}}}
        permissions={{insert:canInsert,duplicate:canInsert}}
        headerTitle={'Motngum Studio / '+activePage.title}
        headerPath={'/'+slug+'/'+activePage.slug}
        onChange={data=>editPuck(activePageId,data)}
        onPublish={data=>{void publish(data);}}
      />
    </div>
  </section>;
}
