'use client';

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type DragEvent } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, Copy, Download, Eye,
  FileJson, GripVertical, Image as ImageIcon, LayoutTemplate, Monitor, Paintbrush,
  PanelLeft, Plus, RotateCcw, Search, Smartphone, Tablet, Trash2, Undo2, Redo2, X
} from 'lucide-react';
import {
  BLOCK_KINDS, BLOCK_VARIANTS, DEFAULT_TEMPLATE_ID, KIND_LABELS,
  SITE_TEMPLATES, TEMPLATE_CATEGORIES, THEMES, buildTemplateDocument, createBlock, newId, themeById,
  type Block, type BlockKind, type SiteCategory, type SiteDocument, type SitePage,
  type SiteTemplate, type ThemeDefinition, type ThemeId
} from '@/lib/builder/catalog';

const STORAGE = 'motngum.visual-builder-demo.v2';
const LEGACY_STORAGE = 'motngum.visual-builder-demo.v1';
const MAX_FILE = 1024 * 1024;
const MAX_PAGES = 12;
const MAX_BLOCKS = 40;
const MAX_TOTAL = 200;
type Viewport = 'desktop' | 'tablet' | 'mobile';
type Sidebar = 'templates' | 'blocks' | 'pages' | 'themes';
type LegacyBlock = Omit<Block, 'variant'>;

function slugify(input: string) {
  return input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50);
}
function safeExternal(value: string) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? parsed.toString() : null;
  } catch { return null; }
}
function safeImage(value: string) {
  try { const u = new URL(value); return u.protocol === 'https:' ? u.toString() : null; } catch { return null; }
}
function foregroundOnAccent(hex: string) {
  const h=hex.replace('#',''); if(!/^[a-f0-9]{6}$/i.test(h))return '#ffffff';
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return (r*299+g*587+b*114)/1000>160?'#17202b':'#ffffff';
}
function safeLink(value: string) {
  if (/^#page:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return value;
  if (/^#[A-Za-z0-9_-]+$/.test(value)) return value;
  return safeExternal(value);
}
function parseRows(body: string, max = 6): string[][] {
  return body.split('\n').map(x => x.trim()).filter(Boolean).slice(0,max).map(x=>x.split('|').map(part=>part.trim().slice(0,300)));
}
function validateDocument(input: unknown): SiteDocument | null {
  if (!input || typeof input !== 'object') return null;
  const root = input as Record<string,unknown>;
  if (root.version !== 2 || typeof root.title !== 'string' || root.title.length > 120 ||
      typeof root.themeId !== 'string' || !THEMES.some(t=>t.id === root.themeId) ||
      !Array.isArray(root.pages) || root.pages.length < 1 || root.pages.length > MAX_PAGES) return null;
  const pageIds = new Set<string>(), slugs = new Set<string>(), blockIds = new Set<string>();
  const pages: SitePage[] = [];
  let count = 0;
  for (const pageRaw of root.pages) {
    if (!pageRaw || typeof pageRaw !== 'object') return null;
    const page = pageRaw as Record<string, unknown>;
    if (typeof page.id !== 'string' || page.id.length < 1 || page.id.length > 100 ||
        typeof page.title !== 'string' || page.title.length < 1 || page.title.length > 80 ||
        typeof page.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug) || page.slug.length > 60 ||
        pageIds.has(page.id) || slugs.has(page.slug) || !Array.isArray(page.blocks) || page.blocks.length > MAX_BLOCKS) return null;
    pageIds.add(page.id); slugs.add(page.slug);
    const blocks: Block[] = [];
    for (const blockRaw of page.blocks) {
      if (!blockRaw || typeof blockRaw !== 'object') return null;
      const block = blockRaw as Record<string, unknown>;
      if (typeof block.id !== 'string' || block.id.length < 1 || block.id.length > 100 || blockIds.has(block.id) ||
          !BLOCK_KINDS.includes(block.kind as BlockKind) || !BLOCK_VARIANTS.includes(block.variant as Block['variant']) ||
          typeof block.title !== 'string' || block.title.length > 160 ||
          typeof block.body !== 'string' || block.body.length > 2000 ||
          typeof block.imageUrl !== 'string' || block.imageUrl.length > 600 ||
          (block.imageUrl.length > 0 && !safeImage(block.imageUrl)) ||
          typeof block.buttonLabel !== 'string' || block.buttonLabel.length > 80 ||
          typeof block.buttonUrl !== 'string' || block.buttonUrl.length > 500 ||
          (block.buttonUrl.length > 0 && !safeLink(block.buttonUrl)) ||
          typeof block.accent !== 'string' || !/^#[a-f0-9]{6}$/i.test(block.accent)) return null;
      blockIds.add(block.id);
      blocks.push({
        id:block.id,kind:block.kind as BlockKind,variant:block.variant as Block['variant'],
        title:block.title,body:block.body,imageUrl:block.imageUrl,buttonLabel:block.buttonLabel,
        buttonUrl:block.buttonUrl,accent:block.accent
      });
      count++;
      if (count > MAX_TOTAL) return null;
    }
    pages.push({id:page.id,title:page.title,slug:page.slug,blocks});
  }
  return {version:2,title:root.title,themeId:root.themeId as ThemeId,pages};
}
function migrateLegacy(input: unknown): SiteDocument | null {
  if (!input || typeof input !== 'object') return null;
  const old = input as {version?:unknown; title?:unknown; blocks?:unknown};
  if (old.version !== 1 || typeof old.title !== 'string' || !Array.isArray(old.blocks) || old.blocks.length > MAX_BLOCKS) return null;
  const blocks = old.blocks.map((raw:LegacyBlock) => {
    if (!raw || typeof raw !== 'object' || !BLOCK_KINDS.includes(raw.kind)) return null;
    return {...raw,variant:'cards',imageUrl:safeImage(raw.imageUrl||'')||'',
      buttonUrl:safeLink(raw.buttonUrl||'')||''};
  });
  if (blocks.some(x=>x === null)) return null;
  return validateDocument({
    version:2,title:old.title,themeId:'coffee',
    pages:[{id:newId(),title:'Trang chủ',slug:'trang-chu',blocks}]
  });
}
function templatePreviewColors(theme: ThemeDefinition): CSSProperties {
  return {'--studio-accent':theme.primary,'--studio-foreground':theme.foreground,
    '--studio-background':theme.background,'--studio-surface':theme.surface,
    '--studio-border':theme.border,'--studio-muted':theme.muted,
    '--studio-radius':theme.radius,'--studio-font':theme.font} as CSSProperties;
}
function ActionLink({block, navigate, inverse = false}: {block:Block; navigate:(slug:string)=>void; inverse?:boolean}) {
  if (!block.buttonLabel) return null;
  const href = safeLink(block.buttonUrl);
  const className = 'inline-flex items-center justify-center px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-85';
  const style:CSSProperties = {borderRadius:'var(--studio-radius)',backgroundColor:inverse?'var(--studio-foreground)':'var(--studio-accent)',color:inverse?'var(--studio-background)':foregroundOnAccent(block.accent)};
  if (!href) return <span className={className} style={style}>{block.buttonLabel}</span>;
  if (href.startsWith('#page:')) return <button type="button" className={className} style={style} onClick={e=>{e.stopPropagation();navigate(href.slice(6));}}>{block.buttonLabel}</button>;
  return <a className={className} style={style} href={href} target={href.startsWith('#')?undefined:'_blank'} rel={href.startsWith('#')?undefined:'noopener noreferrer'} onClick={e=>e.stopPropagation()}>{block.buttonLabel}</a>;
}
function ImageSurface({src,alt,large=false}: {src:string;alt:string;large?:boolean}) {
  const valid = safeImage(src);
  return valid
    ? <img src={valid} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={'w-full object-cover '+(large?'min-h-[260px] max-h-[460px]':'h-44 @md:h-64')}/>
    : <div className={'flex items-center justify-center bg-gradient-to-br from-stone-100 via-gray-50 to-amber-100 text-sm text-stone-500 '+(large?'min-h-[260px]':'h-44')}><ImageIcon size={24} className="mr-2"/>Thêm hình ảnh HTTPS</div>;
}
function BlockPreview({block,theme,navigate}: {block:Block;theme:ThemeDefinition;navigate:(slug:string)=>void}) {
  const accent = block.accent || theme.primary;
  const variant = block.variant;
  const isFull = variant==='full' || variant==='banner';
  const common:CSSProperties={borderRadius:'var(--studio-radius)'};
  const title = <h2 className={'font-bold tracking-tight '+(block.kind==='hero'?'text-3xl @md:text-5xl @lg:text-6xl':'text-2xl @md:text-3xl')}>{block.title}</h2>;
  const description = <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 opacity-80 @md:text-base">{block.body}</p>;
  const action = <div className="mt-6"><ActionLink block={block} navigate={navigate}/></div>;
  const rows = parseRows(block.body);
  if(block.kind==='hero') {
    return <section className={'relative overflow-hidden '+(variant==='minimal'?'py-20 @md:py-32':'min-h-[260px]')} style={{...common,backgroundColor:variant==='minimal'?'transparent':accent,color:variant==='minimal'?'var(--studio-foreground)':(isFull&&safeImage(block.imageUrl)?'#ffffff':foregroundOnAccent(accent))}}>
      {isFull && safeImage(block.imageUrl) && <><div className="absolute inset-0" style={{backgroundImage:'linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.20)),url("'+safeImage(block.imageUrl)+'")',backgroundSize:'cover',backgroundPosition:'center'}}/><div className="absolute inset-0 bg-black/10"/></>}
      {variant==='split' ? <div className="relative grid min-h-[340px] @md:grid-cols-2">
        <div className="flex flex-col items-start justify-center p-7 @md:p-12">{title}{description}{action}</div>
        <div className="overflow-hidden"><ImageSurface src={block.imageUrl} alt={block.title} large/></div>
      </div> : <div className={'relative mx-auto flex max-w-4xl flex-col px-7 py-14 @md:px-14 @md:py-24 '+(variant==='centered'||variant==='cards'?'items-center text-center':'items-start')}>
        <div className="mb-5 inline-flex rounded-full border border-current/40 px-3 py-1 text-xs uppercase tracking-[.2em]">Motngum Studio</div>
        {title}{description}{action}
      </div>}
    </section>;
  }
  if (block.kind==='image') return <section className="overflow-hidden py-5" style={common}><ImageSurface src={block.imageUrl} alt={block.title} large/><div className="p-5"><h2 className="text-2xl font-bold">{block.title}</h2>{description}</div></section>;
  if (block.kind==='gallery') {
    const all=[block.imageUrl,...block.body.split('\n').map(x=>x.trim())].filter((u):u is string=>!!safeImage(u));
    const images=[...new Set(all)].slice(0,8);
    return <section className="py-10"><div className="mb-6">{title}<p className="mt-3 text-sm opacity-70">Những khoảnh khắc nổi bật</p></div>
      <div className="grid grid-cols-2 gap-2 @md:grid-cols-3">
      {(images.length?images:['']).map((src,i)=><div key={i} className="overflow-hidden" style={common}>
        <div className="relative h-32 @md:h-52 overflow-hidden"><ImageSurface src={src} alt={block.title+' '+(i+1)}/></div>
      </div>)}
      </div>
    </section>;
  }
  if (block.kind==='cta') return <section className="my-8 px-6 py-14 text-center @md:py-20" style={{...common,backgroundColor:accent,color:foregroundOnAccent(accent)}}>
    {title}<p className="mx-auto mt-4 max-w-xl whitespace-pre-line opacity-90">{block.body}</p>
    <div className="mt-6"><ActionLink block={block} navigate={navigate} inverse/></div>
  </section>;
  if (block.kind==='text') return <section className={'mx-auto py-10 @md:py-16 '+(variant==='minimal'?'max-w-[660px]':'max-w-4xl')}><div className={variant==='centered'?'text-center':''}>{title}{description}</div></section>;
  if (block.kind==='features'||block.kind==='services'||block.kind==='products'||block.kind==='logos') {
    const list = rows.length?rows:[[block.title]];
    return <section className="py-9"><div className="mb-7">{title}</div>
      <div className={'grid gap-3 '+(variant==='list'?'grid-cols-1':'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3')}>
        {list.map((parts,i)=><div key={i} className={'overflow-hidden border p-5 '+(variant==='minimal'?'border-transparent !px-0':'')} style={{...common,borderColor:'var(--studio-border)',backgroundColor:variant==='minimal'?'transparent':'var(--studio-surface)'}}>
          {block.kind==='products'&&<div className="mb-4 overflow-hidden" style={common}><ImageSurface src={block.imageUrl} alt={parts[0]}/></div>}
          {block.kind!=='logos'&&block.kind!=='products'&&<div className="mb-3 flex size-10 items-center justify-center rounded-full text-sm font-bold" style={{backgroundColor:accent,color:foregroundOnAccent(accent)}}>{String(i+1).padStart(2,'0')}</div>}
          <h3 className="font-semibold">{parts[0]}</h3>{parts[1]&&<p className="mt-2 text-sm opacity-70">{parts[1]}</p>}
        </div>)}
      </div>
    </section>;
  }
  if (block.kind==='stats') return <section className="py-9"><div className="mb-8">{title}</div><div className="grid grid-cols-2 gap-5 @md:grid-cols-3">{rows.map((p,i)=><div key={i} className="border-l-4 pl-4" style={{borderColor:accent}}><div className="text-3xl font-extrabold @md:text-5xl">{p[0]}</div><p className="mt-2 text-sm opacity-70">{p[1]}</p></div>)}</div></section>;
  if (block.kind==='pricing'||block.kind==='testimonials'||block.kind==='team') return <section className="py-10"><div className="mb-7">{title}</div>
    <div className="grid gap-4 @md:grid-cols-3">{rows.map((p,i)=><div key={i} className="border p-6" style={{...common,borderColor:'var(--studio-border)',backgroundColor:'var(--studio-surface)'}}>
      {block.kind==='testimonials'&&<div className="mb-4 text-lg" style={{color:accent}}>★★★★★</div>}
      <h3 className="text-lg font-bold">{p[0]}</h3><p className="mt-4 text-sm leading-7 opacity-75">{p[1]||''}</p>
      {p[2]&&<p className="mt-5 border-t pt-4 text-sm font-semibold" style={{borderColor:'var(--studio-border)'}}>{p[2]}</p>}
    </div>)}</div></section>;
  if (block.kind==='faq') return <section className="mx-auto max-w-4xl py-12">{title}<div className="mt-8 divide-y" style={{borderColor:'var(--studio-border)'}}>
    {rows.map((p,i)=><details key={i} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold">{p[0]}<ChevronDown size={18}/></summary><p className="pt-3 text-sm leading-7 opacity-70">{p[1]||''}</p></details>)}
  </div></section>;
  if (block.kind==='contact') return <section className="my-10 grid gap-7 border p-7 @md:grid-cols-2 @md:p-10" style={{...common,borderColor:'var(--studio-border)',backgroundColor:'var(--studio-surface)'}}>
    <div>{title}<p className="mt-5 whitespace-pre-line text-sm leading-8 opacity-75">{block.body}</p></div>
    <div className="rounded-xl border p-6 text-sm" style={{borderColor:'var(--studio-border)'}}><p className="font-bold">Liên hệ trực tiếp</p><p className="mt-3 opacity-70">Thông tin ở bên trái là dữ liệu mẫu. Hãy thay bằng thông tin thật trước khi phát hành.</p></div>
  </section>;
  if(block.kind==='newsletter') return <section className="my-10 px-7 py-12 text-center" style={{...common,backgroundColor:'var(--studio-surface)',border:'1px solid var(--studio-border)'}}>{title}<p className="mx-auto mt-3 max-w-xl text-sm opacity-75">{block.body}</p><p className="mt-4 text-xs opacity-60">Chức năng đăng ký nhận tin chưa kết nối máy chủ.</p></section>;
  return null;
}
function TemplateThumb({template}: {template:SiteTemplate}) {
  const t=themeById(template.theme);
  return <div className="relative aspect-[16/10] overflow-hidden rounded-lg" style={{backgroundColor:t.background,color:t.foreground}}>
    <div className="flex items-center justify-between border-b px-3 py-2 text-[8px]" style={{borderColor:t.border}}><b>{template.name}</b><span>● ● ●</span></div>
    <div className={'grid h-[82%] '+(template.layout==='split'?'grid-cols-2':'grid-cols-1')}>
      <div className={'flex flex-col justify-center p-3 '+(template.layout==='centered'?'items-center text-center':'')}>
        <div className="mb-2 h-1 w-10 rounded-full" style={{backgroundColor:t.primary}}/>
        <p className="line-clamp-2 text-[11px] font-bold leading-tight">{template.tagline}</p>
        <div className="mt-2 h-[3px] w-3/4 rounded-full opacity-30" style={{backgroundColor:t.foreground}}/>
        <div className="mt-1 h-[3px] w-1/2 rounded-full opacity-30" style={{backgroundColor:t.foreground}}/>
        <div className="mt-3 h-2 w-11 rounded-sm" style={{backgroundColor:t.primary}}/>
      </div>
      {(template.layout==='split'||template.layout==='full'||template.layout==='banner')&&
        <div className={'overflow-hidden '+(template.layout==='split'?'':'absolute inset-0 -z-10 opacity-30')}>
          <img src={template.heroImage.replace("?w=1400","?w=480&auto=format&fit=crop&q=65")} loading="lazy" alt="" className="h-full w-full object-cover"/>
        </div>}
    </div>
    <div className="absolute bottom-2 right-2 flex gap-1"><span className="size-2 rounded-full" style={{backgroundColor:t.primary}}/><span className="size-2 rounded-full" style={{backgroundColor:t.foreground}}/></div>
  </div>;
}
export default function BuilderDemoPage() {
  const [doc,setDoc]=useState<SiteDocument>(()=>buildTemplateDocument(SITE_TEMPLATES.find(t=>t.id===DEFAULT_TEMPLATE_ID)||SITE_TEMPLATES[0]));
  const [pageId,setPageId]=useState<string>('');
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [sidebar,setSidebar]=useState<Sidebar>('templates');
  const [category,setCategory]=useState<SiteCategory|'Tất cả'>('Tất cả');
  const [query,setQuery]=useState('');
  const [gallery,setGallery]=useState(true);
  const [candidate,setCandidate]=useState<string>(DEFAULT_TEMPLATE_ID);
  const [viewport,setViewport]=useState<Viewport>('desktop');
  const [preview,setPreview]=useState(false);
  const [hydrated,setHydrated]=useState(false);
  const [status,setStatus]=useState('Đang tải bản nháp...');
  const [revision,setRevision]=useState(0);
  const [cloudSiteId,setCloudSiteId]=useState<string|null>(null);
  const [cloudVersion,setCloudVersion]=useState<number|null>(null);
  const [cloudDirty,setCloudDirty]=useState(false);
  const [cloudWorking,setCloudWorking]=useState(false);
  const [publishedUrl,setPublishedUrl]=useState<string|null>(null);
  const undoRef=useRef<SiteDocument[]>([]);
  const redoRef=useRef<SiteDocument[]>([]);
  const dragRef=useRef<{id?:string;kind?:BlockKind}|null>(null);
  const fileInput=useRef<HTMLInputElement>(null);
  const theme=themeById(doc.themeId);
  const activePage=doc.pages.find(p=>p.id===pageId)||doc.pages[0];
  const activeBlock=activePage?.blocks.find(b=>b.id===selectedId)||null;
  const totalBlocks=doc.pages.reduce((n,p)=>n+p.blocks.length,0);
  const currentTemplate=SITE_TEMPLATES.find(t=>t.id===candidate)||SITE_TEMPLATES[0];
  const candidateDocument=buildTemplateDocument(currentTemplate);
  const galleryMatches=SITE_TEMPLATES.filter(t=>
    (category==='Tất cả'||t.category===category)&&
    (t.name+' '+t.description+' '+t.category).toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))
  );

  useEffect(()=>{
    let cancelled=false;
    async function load() {
      const siteId=new URLSearchParams(window.location.search).get('site');
      if(siteId) {
        try {
          const response=await fetch('/api/sites/'+encodeURIComponent(siteId),{cache:'no-store'});
          const data=await response.json();
          if(!response.ok)throw new Error(data.error||'Không thể mở dự án');
          const stored=validateDocument(data.site?.document);
          if(!stored)throw new Error('Dữ liệu website từ máy chủ không hợp lệ.');
          if(cancelled)return;
          setDoc(stored);setPageId(stored.pages[0].id);setGallery(false);
          setCloudSiteId(data.site.id);setCloudVersion(data.site.version);setCloudDirty(false);
          setPublishedUrl(data.site.publishedVersion?'/s/'+data.site.slug:null);
          setStatus('Đã tải website từ PostgreSQL, revision '+data.site.version+'.');
        }catch(e) {
          if(!cancelled)setStatus('Không mở được website: '+(e instanceof Error?e.message:'Lỗi kết nối')+'. Bản local vẫn có thể xuất JSON.');
        }finally{if(!cancelled)setHydrated(true);}
        return;
      }
      try {
        const raw=localStorage.getItem(STORAGE);
        const existing=raw?validateDocument(JSON.parse(raw)):null;
        if(existing){
          if(cancelled)return;
          setDoc(existing);setPageId(existing.pages[0]?.id||'');setGallery(false);
          setStatus('Đã khôi phục bản nháp trong trình duyệt.');
        }else {
          const old=localStorage.getItem(LEGACY_STORAGE);
          const migrated=old?migrateLegacy(JSON.parse(old)):null;
          if(migrated){if(cancelled)return;setDoc(migrated);setPageId(migrated.pages[0].id);setGallery(false);setStatus('Đã nâng cấp bản nháp v1.');}
          else if(raw)setStatus('Bản nháp không hợp lệ; hãy nhập JSON hoặc chọn mẫu.');
          else setStatus('Chọn một mẫu để bắt đầu thiết kế website.');
        }
      }catch{if(!cancelled)setStatus('Không đọc được bản lưu; hãy thử nhập JSON.');}
      if(!cancelled)setHydrated(true);
    }
    void load();
    return ()=>{cancelled=true;};
  },[]);
  useEffect(()=>{
    if(!hydrated)return;
    try{localStorage.setItem(STORAGE,JSON.stringify(doc));setStatus('Đã tự lưu bản nháp trong trình duyệt · Chưa xuất bản.');}
    catch{setStatus('Không lưu được; hãy xuất tệp JSON để sao lưu.');}
  },[doc,hydrated]);
  function commit(next:SiteDocument) {
    if(next===doc)return;
    undoRef.current=[...undoRef.current.slice(-39),doc];
    redoRef.current=[];
    setDoc(next);setCloudDirty(true);setRevision(r=>r+1);
  }
  function undo() {
    const next=undoRef.current.pop();if(!next)return;
    redoRef.current.push(doc);setDoc(next);setSelectedId(null);setCloudDirty(true);setRevision(r=>r+1);
  }
  function redo() {
    const next=redoRef.current.pop();if(!next)return;
    undoRef.current.push(doc);setDoc(next);setSelectedId(null);setCloudDirty(true);setRevision(r=>r+1);
  }
  function modifyPage(blocks:Block[]) {
    commit({...doc,pages:doc.pages.map(p=>p.id===activePage.id?{...p,blocks}:p)});
  }
  function patchBlock(patch:Partial<Block>) {
    if(!activeBlock)return;
    modifyPage(activePage.blocks.map(b=>b.id===activeBlock.id?{...b,...patch}:b));
  }
  function addBlock(kind:BlockKind,index=activePage.blocks.length) {
    if(activePage.blocks.length>=MAX_BLOCKS||totalBlocks>=MAX_TOTAL){setStatus('Đã đạt giới hạn 40 khối/trang hoặc 200 khối/site.');return;}
    const b=createBlock(kind,doc.themeId);
    const blocks=[...activePage.blocks];blocks.splice(Math.max(0,Math.min(index,blocks.length)),0,b);
    modifyPage(blocks);setSelectedId(b.id);
  }
  function moveBlock(id:string,to:number) {
    const blocks=[...activePage.blocks],from=blocks.findIndex(b=>b.id===id);
    if(from<0||to<0||to>=blocks.length||from===to)return;
    const [block]=blocks.splice(from,1);blocks.splice(to,0,block);modifyPage(blocks);
  }
  function dropAt(event:DragEvent<HTMLElement>,index:number) {
    event.preventDefault();const source=dragRef.current;dragRef.current=null;
    if(!source)return;
    if(source.kind){addBlock(source.kind,index);return;}
    if(source.id){const from=activePage.blocks.findIndex(b=>b.id===source.id);if(from<0)return;
      moveBlock(source.id,from<index?index-1:index);}
  }
  function startDrag(event:DragEvent<HTMLElement>,source:{id?:string;kind?:BlockKind}) {
    dragRef.current=source;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','motngum-block');
  }
  function navigate(slug:string) {
    const target=doc.pages.find(p=>p.slug===slug);
    if(target){setPageId(target.id);setSelectedId(null);}else setStatus('Trang đích không tồn tại trong bản nháp.');
  }
  function applyTemplate(template:SiteTemplate) {
    if(hydrated&&!gallery&&doc.pages.some(p=>p.blocks.length>0)&&!window.confirm('Áp dụng mẫu sẽ thay thế toàn bộ nội dung website. Hãy lưu cloud hoặc xuất JSON trước. Tiếp tục?'))return;
    const next=buildTemplateDocument(template);
    commit(next);setPageId(next.pages[0].id);setSelectedId(null);setGallery(false);setPreview(false);
    setStatus('Đã áp dụng mẫu '+template.name+' với 3 trang có thể chỉnh sửa.');
  }
  function changeTheme(themeId:ThemeId) {
    if(themeId===doc.themeId)return;
    const old=themeById(doc.themeId).primary,next=themeById(themeId).primary;
    commit({...doc,themeId,pages:doc.pages.map(p=>({...p,blocks:p.blocks.map(b=>({...b,accent:b.accent===old?next:b.accent}))}))});
  }
  function addPage() {
    if(doc.pages.length>=MAX_PAGES){setStatus('Tối đa 12 trang cho một website thử nghiệm.');return;}
    const base='trang-moi';let slug=base,n=2;
    while(doc.pages.some(p=>p.slug===slug))slug=base+'-'+n++;
    const p:SitePage={id:newId(),title:'Trang mới',slug,blocks:[createBlock('hero',doc.themeId,'minimal'),createBlock('text',doc.themeId,'minimal')]};
    commit({...doc,pages:[...doc.pages,p]});setPageId(p.id);setSelectedId(null);setSidebar('pages');
  }
  function patchPage(patch:Partial<SitePage>) {
    if(!activePage)return;
    commit({...doc,pages:doc.pages.map(p=>p.id===activePage.id?{...p,...patch}:p)});
  }
  function changeSlug(raw:string) {
    const slug=slugify(raw);if(!slug)return;
    if(doc.pages.some(p=>p.slug===slug&&p.id!==activePage.id)){setStatus('Đường dẫn trang đã được dùng.');return;}
    const previous=activePage.slug;
    if(previous===slug)return;
    commit({...doc,pages:doc.pages.map(p=>({
      ...p,
      ...(p.id===activePage.id?{slug}:{}),
      blocks:p.blocks.map(b=>b.buttonUrl==='#page:'+previous?{...b,buttonUrl:'#page:'+slug}:b)
    }))});
  }
  function duplicatePage() {
    if(doc.pages.length>=MAX_PAGES||totalBlocks+activePage.blocks.length>MAX_TOTAL){setStatus('Không đủ dung lượng để nhân bản trang.');return;}
    let slug=activePage.slug+'-copy',n=2;
    while(doc.pages.some(p=>p.slug===slug))slug=activePage.slug+'-copy-'+n++;
    const p={...activePage,id:newId(),title:activePage.title+' (bản sao)',slug,blocks:activePage.blocks.map(b=>({...b,id:newId()}))};
    commit({...doc,pages:[...doc.pages,p]});setPageId(p.id);setSelectedId(null);
  }
  function deletePage() {
    if(doc.pages.length===1){setStatus('Cần giữ ít nhất một trang.');return;}
    if(!window.confirm('Xóa trang '+activePage.title+' và toàn bộ nội dung?'))return;
    commit({...doc,pages:doc.pages.filter(p=>p.id!==activePage.id)});
    setPageId(doc.pages.find(p=>p.id!==activePage.id)?.id||'');setSelectedId(null);
  }
  function exportJson() {
    const blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='motngum-'+(slugify(doc.title)||'site')+'-v2.json';document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importJson(event:ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0];event.target.value='';
    if(!file)return;
    if(file.size>MAX_FILE){setStatus('Tệp vượt giới hạn 1 MB.');return;}
    try {
      const raw=JSON.parse(await file.text());
      const next=validateDocument(raw)||migrateLegacy(raw);
      if(!next)throw new Error('invalid format');
      if(!window.confirm('Nhập JSON sẽ thay thế website hiện tại. Tiếp tục?'))return;
      commit(next);setPageId(next.pages[0].id);setSelectedId(null);setGallery(false);
      setStatus('Đã nhập website hợp lệ ('+next.pages.length+' trang).');
    }catch{setStatus('Không thể nhập JSON: sai phiên bản, cấu trúc hoặc đường dẫn không an toàn.');}
  }
  function reset() {
    if(!window.confirm('Khôi phục website sẽ thay thế bản nháp. Tiếp tục?'))return;
    const next=buildTemplateDocument(SITE_TEMPLATES.find(t=>t.id===DEFAULT_TEMPLATE_ID)||SITE_TEMPLATES[0]);
    commit(next);setPageId(next.pages[0].id);setSelectedId(null);setGallery(true);
  }

  async function saveCloud() {
    if(cloudWorking || !hydrated)return;
    setCloudWorking(true);setStatus('Đang lưu bản nháp vào PostgreSQL...');
    const route=cloudSiteId?'/api/sites/'+encodeURIComponent(cloudSiteId):'/api/sites';
    try{
      const response=await fetch(route,{method:cloudSiteId?'PATCH':'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(cloudSiteId?{version:cloudVersion,document:doc}:{document:doc})});
      const data=await response.json();
      if(!response.ok){
        if(response.status===409)throw new Error('Có thay đổi từ phiên khác hoặc tổ chức đã đổi. Không ghi đè; hãy sao lưu JSON và tải lại phiên bản mới.');
        if(response.status===401)throw new Error('Cần đăng nhập. Bản nháp vẫn được giữ trong trình duyệt.');
        throw new Error(data.error||'Lưu site thất bại');
      }
      const id=cloudSiteId||data.site.id;
      setCloudSiteId(id);setCloudVersion(data.site.version);
      setCloudDirty(false);setStatus('Đã lưu an toàn trên PostgreSQL, revision '+data.site.version+'.');
      if(!cloudSiteId)window.history.replaceState(null,'','/builder-demo?site='+encodeURIComponent(id));
    }catch(e){setStatus('Không thể lưu cloud: '+(e instanceof Error?e.message:'Lỗi không xác định'));}
    finally{setCloudWorking(false);}
  }
  async function publishCloud() {
    if(!cloudSiteId || cloudVersion===null || cloudDirty || cloudWorking) {
      setStatus('Hãy lưu bản nháp lên cloud trước khi xuất bản.');return;
    }
    if(!window.confirm('Xuất bản snapshot lên URL staging? Website không nhận thanh toán. Tiếp tục?'))return;
    setCloudWorking(true);
    try{
      const response=await fetch('/api/sites/'+encodeURIComponent(cloudSiteId)+'/publish',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({version:cloudVersion})
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.problems?.join(' · ')||data.error||'Không thể xuất bản');
      setPublishedUrl(data.url);setStatus('Đã xuất bản snapshot revision '+data.version+' trên staging.');
    }catch(e){setStatus('Publish bị chặn: '+(e instanceof Error?e.message:'Không xác định'));}
    finally{setCloudWorking(false);}
  }

  const canvasWidth=viewport==='mobile'?'390px':viewport==='tablet'?'768px':'1120px';
  const isEditing=!preview;
  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur @md:px-5">
      <div className="mx-auto flex max-w-[1750px] flex-wrap items-center justify-between gap-3">
        <div><div className="flex items-center gap-2"><LayoutTemplate size={19} className="text-amber-700"/><b>Motngum Studio</b><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">DEMO</span></div>
          <p className="text-xs text-slate-500">Dựng website từ template · 24 mẫu · 8 theme</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={()=>setGallery(true)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><LayoutTemplate size={16}/>Chọn mẫu</button>
          <div className="flex items-center rounded-lg border border-slate-200">
            {([['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]] as const).map(([key,Icon])=>
              <button key={key} aria-label={'Xem '+key} title={'Xem '+key} onClick={()=>setViewport(key)} className={'p-2 '+(viewport===key?'bg-amber-100 text-amber-800':'text-slate-500')}><Icon size={17}/></button>)}
          </div>
          <button onClick={undo} disabled={!undoRef.current.length} title="Hoàn tác" aria-label="Hoàn tác" className="rounded-lg border p-2 disabled:opacity-30"><Undo2 size={17}/></button>
          <button onClick={redo} disabled={!redoRef.current.length} title="Làm lại" aria-label="Làm lại" className="rounded-lg border p-2 disabled:opacity-30"><Redo2 size={17}/></button>
          <button onClick={()=>setPreview(v=>!v)} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold"><Eye size={16}/>{preview?'Chỉnh sửa':'Xem trước'}</button>
          <a href="/dashboard/sites" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Website của tôi</a>
          {cloudSiteId&&<a href={'/dashboard/sites/'+cloudSiteId+'/preview'} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold" target="_blank" rel="noopener noreferrer">Preview nháp</a>}
          <button onClick={saveCloud} disabled={cloudWorking||!hydrated} className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {cloudWorking?'Đang xử lý...':cloudDirty||!cloudSiteId?'Lưu lên cloud':'Đã lưu trên cloud'}
          </button>
          {cloudSiteId&&<button onClick={publishCloud} disabled={cloudWorking||cloudDirty} className="rounded-lg border border-slate-400 px-3 py-2 text-xs font-semibold disabled:opacity-50">Xuất bản staging</button>}
          {publishedUrl&&<a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-green-700 px-3 py-2 text-xs font-semibold text-green-900">Mở site công khai</a>}
          <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><Download size={16}/>Xuất JSON</button>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-[1750px] px-3 py-3 @md:px-5">
      <div role="status" aria-live="polite" className="mb-3 rounded-lg bg-white px-4 py-2 text-xs text-slate-600">{status} Đang xem bản thử nghiệm, không có nút xuất bản hoặc thu tiền.</div>
      <div className={'grid items-start gap-4 '+(isEditing?'xl:grid-cols-[270px_minmax(0,1fr)_270px]':'')}>
        {isEditing&&<aside className="overflow-hidden rounded-xl border border-slate-200 bg-white xl:sticky xl:top-24">
          <div className="grid grid-cols-4 border-b border-slate-200 text-[11px] font-semibold">
            {([['templates','Mẫu',LayoutTemplate],['blocks','Khối',PanelLeft],['pages','Trang',FileJson],['themes','Theme',Paintbrush]] as const).map(([tab,label,Icon])=><button key={tab} onClick={()=>setSidebar(tab)} className={'flex flex-col items-center gap-1 px-1 py-3 '+(sidebar===tab?'border-b-2 border-amber-600 bg-amber-50 text-amber-900':'text-slate-600 hover:bg-slate-50')}><Icon size={17}/>{label}</button>)}
          </div>
          <div className="max-h-[75vh] overflow-auto p-3">
            {sidebar==='templates'&&<><p className="mb-3 text-sm font-bold">Kho giao diện · 24 mẫu</p><button onClick={()=>setGallery(true)} className="mb-3 w-full rounded-lg bg-amber-700 px-3 py-2 text-sm font-semibold text-white">Mở thư viện và xem trước</button>
              <div className="space-y-2">{SITE_TEMPLATES.filter(t=>t.category==='Cửa hàng'||t.category==='Portfolio').slice(0,6).map(t=>
                <button key={t.id} onClick={()=>{setCandidate(t.id);setGallery(true);}} className="w-full rounded-lg border p-2 text-left hover:border-amber-400"><TemplateThumb template={t}/><p className="mt-2 text-xs font-semibold">{t.name}</p></button>)}</div></>}
            {sidebar==='blocks'&&<><p className="mb-2 text-sm font-bold">Thư viện 16 thành phần</p><p className="mb-3 text-xs text-slate-500">Kéo vào vùng chấm hoặc nhấp để thêm cuối trang.</p>
              <div className="grid grid-cols-1 gap-2">{BLOCK_KINDS.map(kind=><button key={kind} draggable onDragStart={e=>startDrag(e,{kind})} onDragEnd={()=>dragRef.current=null} onClick={()=>addBlock(kind)} className="flex w-full cursor-grab items-center justify-between rounded-lg border border-slate-200 p-3 text-left text-xs hover:border-amber-500 hover:bg-amber-50"><span>{KIND_LABELS[kind]}</span><Plus size={15}/></button>)}</div></>}
            {sidebar==='pages'&&<><div className="mb-3 flex items-center justify-between"><b className="text-sm">Các trang ({doc.pages.length}/{MAX_PAGES})</b><button onClick={addPage} title="Thêm trang" className="rounded-lg bg-amber-700 p-2 text-white"><Plus size={17}/></button></div>
              <div className="space-y-2">{doc.pages.map(p=><button key={p.id} onClick={()=>{setPageId(p.id);setSelectedId(null)}} className={'flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left text-sm '+(p.id===activePage.id?'border-amber-400 bg-amber-50 font-semibold':'border-slate-200')}><span>{p.title}</span><span className="text-[10px] text-slate-500">/{p.slug}</span></button>)}</div>
              <hr className="my-4"/><b className="text-sm">Thiết lập trang</b>
              <label className="mt-3 block text-xs">Tên trang<input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" maxLength={80} value={activePage.title} onChange={e=>patchPage({title:e.target.value||' '})}/></label>
              <label className="mt-3 block text-xs">Đường dẫn slug<input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={activePage.slug} onChange={e=>changeSlug(e.target.value)} /></label>
              <div className="mt-4 flex gap-2"><button onClick={duplicatePage} className="flex items-center gap-1 rounded-lg border p-2 text-xs"><Copy size={14}/>Nhân bản</button><button onClick={deletePage} className="flex items-center gap-1 rounded-lg border p-2 text-xs text-red-700"><Trash2 size={14}/>Xóa trang</button></div>
            </>}
            {sidebar==='themes'&&<><b className="text-sm">Giao diện toàn website</b><p className="my-2 text-xs text-slate-500">Thay màu chủ đạo, nền, bề mặt, góc bo và typography trên mọi trang.</p>
              <div className="space-y-2">{THEMES.map(t=><button key={t.id} onClick={()=>changeTheme(t.id)} className={'w-full rounded-lg border p-3 text-left '+(t.id===doc.themeId?'border-amber-500 bg-amber-50':'border-slate-200')}>
                <div className="flex items-center gap-2"><span className="size-7 rounded-full border" style={{backgroundColor:t.primary}}/><span className="size-7 rounded-full border" style={{backgroundColor:t.background}}/><b className="text-sm">{t.name}</b>{t.id===doc.themeId&&<Check size={16} className="ml-auto text-amber-700"/>}</div><p className="mt-2 text-xs text-slate-600">{t.mood}</p>
              </button>)}</div></>}
          </div>
        </aside>}
        <main className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2">
            <div className="flex max-w-full flex-wrap items-center gap-1 overflow-auto">{doc.pages.map(p=><button key={p.id} onClick={()=>navigate(p.slug)} className={'rounded-md px-3 py-1.5 text-xs '+(p.id===activePage.id?'bg-slate-900 font-semibold text-white':'text-slate-600 hover:bg-slate-100')}>{p.title}</button>)}</div>
            <span className="px-2 text-xs text-slate-500">{viewport==='mobile'?'390 px':viewport==='tablet'?'768 px':'Desktop'}</span>
          </div>
          <div className="overflow-x-auto pb-5">
            <div className="@container mx-auto overflow-hidden border shadow-lg transition-[width] duration-200" style={{...templatePreviewColors(theme),width:canvasWidth,maxWidth:'100%',backgroundColor:'var(--studio-background)',color:'var(--studio-foreground)',fontFamily:'var(--studio-font)',borderColor:'var(--studio-border)',borderRadius:'var(--studio-radius)'}}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 @md:px-10" style={{borderColor:'var(--studio-border)'}}>
                <button onClick={()=>navigate(doc.pages[0].slug)} className="text-lg font-bold tracking-tight">{doc.title||'Website của tôi'}</button>
                <nav className="flex flex-wrap gap-2 @md:gap-5">{doc.pages.map(p=><button key={p.id} onClick={()=>navigate(p.slug)} className={'text-xs @md:text-sm '+(p.id===activePage.id?'font-bold underline underline-offset-8':'opacity-70 hover:opacity-100')}>{p.title}</button>)}</nav>
              </div>
              <div className="px-3 pb-2 @md:px-7">
                {activePage.blocks.map((block,index)=><div key={block.id}>
                  {isEditing&&<div onDragOver={e=>e.preventDefault()} onDrop={e=>dropAt(e,index)} aria-label={'Thả khối ở vị trí '+(index+1)} className="my-1 flex h-5 items-center justify-center rounded-lg border border-dashed border-transparent text-[10px] text-transparent hover:border-amber-500 hover:bg-amber-100 hover:text-amber-900">Thả tại đây</div>}
                  <section draggable={isEditing} onDragStart={e=>startDrag(e,{id:block.id})} onDragEnd={()=>dragRef.current=null} onClick={()=>isEditing&&setSelectedId(block.id)} className={'relative '+(isEditing?'cursor-pointer border-2 border-transparent hover:border-amber-300 '+(selectedId===block.id?'!border-amber-500':''):'')}>
                    {isEditing&&<div className="absolute right-1 top-1 z-20 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 font-sans text-slate-800 shadow-lg">
                      <GripVertical size={15} className="cursor-grab"/><button title="Lên" onClick={e=>{e.stopPropagation();moveBlock(block.id,index-1)}} disabled={index===0} className="rounded p-1 disabled:opacity-20"><ArrowUp size={15}/></button>
                      <button title="Xuống" onClick={e=>{e.stopPropagation();moveBlock(block.id,index+1)}} disabled={index===activePage.blocks.length-1} className="rounded p-1 disabled:opacity-20"><ArrowDown size={15}/></button>
                      <button title="Nhân bản" onClick={e=>{e.stopPropagation();if(activePage.blocks.length>=MAX_BLOCKS||totalBlocks>=MAX_TOTAL)return;const arr=[...activePage.blocks];const copy={...block,id:newId()};arr.splice(index+1,0,copy);modifyPage(arr);setSelectedId(copy.id)}} className="rounded p-1"><Copy size={15}/></button>
                      <button title="Xóa" onClick={e=>{e.stopPropagation();modifyPage(activePage.blocks.filter(b=>b.id!==block.id));if(selectedId===block.id)setSelectedId(null)}} className="rounded p-1 text-red-600"><Trash2 size={15}/></button>
                    </div>}
                    <BlockPreview block={block} theme={theme} navigate={navigate}/>
                  </section>
                </div>)}
                {isEditing&&<div onDragOver={e=>e.preventDefault()} onDrop={e=>dropAt(e,activePage.blocks.length)} className="my-4 rounded-xl border-2 border-dashed border-slate-300 px-4 py-7 text-center font-sans text-xs text-slate-500 hover:border-amber-500 hover:bg-amber-50"><Plus size={18} className="mx-auto mb-2"/>Thả một khối vào cuối trang</div>}
              </div>
              <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-7 text-xs opacity-70 @md:px-10" style={{borderColor:'var(--studio-border)'}}><span>© {new Date().getFullYear()} {doc.title}</span><span>Thiết kế bằng Motngum Studio · Bản nháp</span></footer>
            </div>
          </div>
        </main>
        {isEditing&&<aside className="rounded-xl border border-slate-200 bg-white p-4 xl:sticky xl:top-24">
          <h2 className="mb-4 text-sm font-bold">Thuộc tính thiết kế</h2>
          <label className="mb-4 block text-xs font-semibold">Tên website<input value={doc.title} maxLength={120} onChange={e=>commit({...doc,title:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
          {activeBlock?<div className="space-y-3">
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{KIND_LABELS[activeBlock.kind]}</div>
            <label className="block text-xs font-semibold">Bố cục<select value={activeBlock.variant} onChange={e=>patchBlock({variant:e.target.value as Block['variant']})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">{BLOCK_VARIANTS.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
            <label className="block text-xs font-semibold">Tiêu đề<input value={activeBlock.title} maxLength={160} onChange={e=>patchBlock({title:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
            <label className="block text-xs font-semibold">Nội dung / mỗi dòng một mục<textarea value={activeBlock.body} maxLength={2000} rows={6} onChange={e=>patchBlock({body:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
            {(['hero','image','gallery','products'].includes(activeBlock.kind))&&<label className="block text-xs font-semibold">URL ảnh HTTPS<input key={activeBlock.id+'-image-'+activeBlock.imageUrl} defaultValue={activeBlock.imageUrl} maxLength={600} onBlur={e=>{
              const value=e.currentTarget.value.trim();
              if(value!==''&&!safeImage(value)) {setStatus('URL hình ảnh phải bắt đầu bằng https:// hợp lệ.');e.currentTarget.value=activeBlock.imageUrl;return;}
              if(value!==activeBlock.imageUrl)patchBlock({imageUrl:value});
            }} placeholder="https://..." className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>}
            {(['hero','cta'].includes(activeBlock.kind))&&<><label className="block text-xs font-semibold">Chữ trên nút<input value={activeBlock.buttonLabel} maxLength={80} onChange={e=>patchBlock({buttonLabel:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
              <label className="block text-xs font-semibold">Liên kết (https hoặc #page:slug)<input key={activeBlock.id+'-link-'+activeBlock.buttonUrl} defaultValue={activeBlock.buttonUrl} maxLength={500} onBlur={e=>{
                const value=e.currentTarget.value.trim();
                if(value!==''&&!safeLink(value)){setStatus('Liên kết chỉ nhận http(s), #anchor hoặc #page:slug.');e.currentTarget.value=activeBlock.buttonUrl;return;}
                if(value!==activeBlock.buttonUrl)patchBlock({buttonUrl:value});
              }} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label></>}
            <label className="flex items-center justify-between text-xs font-semibold">Màu nhấn khối<input type="color" value={activeBlock.accent} onChange={e=>patchBlock({accent:e.target.value})} className="size-10 cursor-pointer"/></label>
          </div>:<p className="text-xs text-slate-500">Chọn một khối trên canvas để chỉnh sửa nội dung, màu sắc và bố cục.</p>}
          <hr className="my-4"/>
          <button onClick={()=>fileInput.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-slate-100"><FileJson size={16}/>Nhập website JSON</button>
          <input className="hidden" ref={fileInput} type="file" accept="application/json,.json" onChange={importJson}/>
          <button onClick={reset} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-slate-100"><RotateCcw size={16}/>Đặt lại mẫu</button>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">Trình duyệt có bản sao cục bộ. Dự án liên kết tài khoản có thể lưu thủ công lên PostgreSQL và phát hành snapshot staging; ảnh upload, form thật và thanh toán vẫn chưa bật.</p>
        </aside>}
      </div>
    </div>
    {gallery&&<div className="@container fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 px-3 py-4 @md:px-8 @md:py-8" role="dialog" aria-modal="true" aria-label="Thư viện mẫu website">
      <div className="mx-auto max-w-[1450px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b px-5 py-5 @md:px-7"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Motngum Studio / Template Gallery</p><h2 className="mt-1 text-2xl font-extrabold">Chọn một website để bắt đầu</h2><p className="mt-1 text-sm text-slate-500">24 mẫu có cấu trúc riêng · 6 ngành nghề · 8 theme · mỗi mẫu gồm 3 trang chỉnh sửa được</p></div><button onClick={()=>setGallery(false)} title="Đóng" className="rounded-lg border p-2"><X size={20}/></button></div>
        <div className="flex flex-wrap items-center gap-2 px-5 py-4 @md:px-7">
          <div className="flex min-w-[210px] flex-1 items-center gap-2 rounded-lg border px-3 py-2"><Search size={16} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tên mẫu hoặc ngành nghề..." className="w-full min-w-0 text-sm outline-none"/></div>
          <span className="text-xs text-slate-500">{galleryMatches.length} kết quả</span>
        </div>
        <div className="flex flex-wrap gap-2 px-5 pb-4 @md:px-7">{(['Tất cả',...TEMPLATE_CATEGORIES] as const).map(c=><button key={c} onClick={()=>setCategory(c)} className={'rounded-full border px-3 py-1.5 text-xs font-semibold '+(category===c?'border-amber-700 bg-amber-700 text-white':'border-slate-200 text-slate-600 hover:bg-slate-50')}>{c}</button>)}</div>
        <div className="grid gap-6 border-t p-4 @lg:grid-cols-[1fr_420px] @md:p-6">
          <div className="max-h-[62vh] overflow-y-auto pr-1"><div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @xl:grid-cols-3">
            {galleryMatches.map(t=><button key={t.id} onClick={()=>setCandidate(t.id)} className={'rounded-xl border p-2 text-left transition hover:border-amber-500 hover:shadow-md '+(t.id===candidate?'border-amber-500 ring-2 ring-amber-100':'border-slate-200')}>
              <TemplateThumb template={t}/><div className="flex items-center justify-between gap-2 px-1 pt-2"><b className="text-sm">{t.name}</b>{t.id===candidate&&<Check size={16} className="text-amber-700"/>}</div><p className="px-1 pt-1 text-[11px] text-slate-500">{t.category} · {themeById(t.theme).mood}</p><p className="px-1 pb-1 pt-2 text-xs leading-5 text-slate-600">{t.description}</p>
            </button>)}</div>{galleryMatches.length===0&&<p className="p-8 text-center text-slate-500">Không tìm thấy mẫu. Thử chọn ngành nghề khác.</p>}</div>
          <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Xem trước mẫu đang chọn</p><h3 className="mt-2 text-xl font-bold">{currentTemplate.name}</h3><p className="mt-1 text-sm text-slate-600">{currentTemplate.description}</p>
            <div className="my-4 overflow-hidden rounded-lg border border-slate-200"><TemplateThumb template={currentTemplate}/></div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Trang chủ thực tế từ mẫu</p>
            <div className="h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              <div className="@container" style={{...templatePreviewColors(themeById(currentTemplate.theme)),backgroundColor:'var(--studio-background)',color:'var(--studio-foreground)',fontFamily:'var(--studio-font)',fontSize:'12px'}}>
                <div className="border-b px-4 py-3 text-sm font-bold" style={{borderColor:'var(--studio-border)'}}>{currentTemplate.name}</div>
                <div className="px-3">{candidateDocument.pages[0].blocks.slice(0,3).map(b=><div key={b.id}><BlockPreview block={b} theme={themeById(currentTemplate.theme)} navigate={()=>{}}/></div>)}</div>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">{currentTemplate.order.map((k,i)=><span key={i} className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">{KIND_LABELS[k]}</span>)}</div>
            <p className="mb-4 text-xs text-slate-600">Áp dụng sẽ tạo Trang chủ / Giới thiệu / Liên hệ cùng giao diện nhất quán. Nội dung có thể sửa, không phải ảnh chụp mẫu tĩnh.</p>
            <button onClick={()=>applyTemplate(currentTemplate)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-3 text-sm font-bold text-white hover:bg-amber-800">Dùng mẫu {currentTemplate.name}<ArrowRight size={17}/></button>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">Đang chỉnh một website khác? Hãy xuất JSON để sao lưu trước khi thay mẫu.</p>
          </aside>
        </div>
      </div>
    </div>}
  </div>;
}
