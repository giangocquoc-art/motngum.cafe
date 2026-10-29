import './studio-template-effects.css';
import type { CSSProperties } from 'react';
import { ChevronDown, Image as ImageIcon } from 'lucide-react';
import type { Block, ThemeDefinition } from '@/lib/builder/catalog';
import { isSafeImage, isSafeLink } from '@/lib/builder/validation';

function safeImage(value:string) {
  return isSafeImage(value) && value ? new URL(value).toString() : null;
}
function safeLink(value:string) {
  return isSafeLink(value) ? value : null;
}
export function foregroundOnAccent(hex:string) {
  const h=hex.replace('#','');
  if(!/^[a-f0-9]{6}$/i.test(h))return '#ffffff';
  const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)
    .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
  const lum=0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  const white=(1.05)/(lum+0.05);
  // Use exact black/white so at least one contrast ratio always exceeds
  // WCAG AA 4.5:1 for ordinary text, including medium-tone accents.
  const black=(lum+0.05)/0.05;
  return black>white?'#000000':'#ffffff';
}
function parseRows(body:string,max=6):string[][] {
  return body.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,max)
    .map(x=>x.split('|').map(part=>part.trim().slice(0,300)));
}
export function studioColors(theme:ThemeDefinition): CSSProperties {
  return {
    '--studio-accent':theme.primary,'--studio-foreground':theme.foreground,
    '--studio-background':theme.background,'--studio-surface':theme.surface,
    '--studio-border':theme.border,'--studio-muted':theme.muted,
    '--studio-radius':theme.radius,'--studio-font':theme.font
  } as CSSProperties;
}

function ActionLink({block, navigate, base, inverse = false}: {block:Block; navigate?:(slug:string)=>void; base?:string; inverse?:boolean}) {
  if (!block.buttonLabel) return null;
  const href = safeLink(block.buttonUrl);
  const className = 'inline-flex items-center justify-center px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-85';
  const style:CSSProperties = {
    borderRadius:'var(--studio-radius)',
    backgroundColor:inverse?'var(--studio-foreground)':block.accent,
    color:inverse?'var(--studio-background)':foregroundOnAccent(block.accent)
  };
  if (!href) return <span className={className} style={style}>{block.buttonLabel}</span>;
  if (href.startsWith('#page:')) {
    const slug=href.slice(6);
    if (navigate) return <button type="button" className={className} style={style}
      onClick={e=>{e.stopPropagation();navigate(slug);}}>{block.buttonLabel}</button>;
    return <a className={className} style={style} href={(base||'')+'/'+encodeURIComponent(slug)}>
      {block.buttonLabel}</a>;
  }
  return <a className={className} style={style} href={href}
    target={href.startsWith('#')?undefined:'_blank'}
    rel={href.startsWith('#')?undefined:'noopener noreferrer'}
    onClick={navigate?e=>e.stopPropagation():undefined}>{block.buttonLabel}</a>;
}
function ImageSurface({src,alt,large=false}: {src:string;alt:string;large?:boolean}) {
  const valid = safeImage(src);
  return valid
    ? <img src={valid} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={'w-full object-cover '+(large?'min-h-[260px] max-h-[460px]':'h-44 @md:h-64')}/>
    : <div className={'flex items-center justify-center bg-gradient-to-br from-stone-100 via-gray-50 to-amber-100 text-sm text-stone-500 '+(large?'min-h-[260px]':'h-44')}><ImageIcon size={24} className="mr-2"/>Thêm hình ảnh HTTPS</div>;
}
export function BlockPreview({block,theme,navigate,base}: {block:Block;theme:ThemeDefinition;navigate?:(slug:string)=>void;base?:string}) {
  const accent = block.accent || theme.primary;
  const variant = block.variant;
  const isFull = variant==='full' || variant==='banner';
  const common:CSSProperties={borderRadius:'var(--studio-radius)'};
  const title = <h2 className={'font-bold tracking-tight '+(block.kind==='hero'?'text-3xl @md:text-5xl @lg:text-6xl':'text-2xl @md:text-3xl')}>{block.title}</h2>;
  const description = <p className={'mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 @md:text-base '+(block.kind==='hero'?'':'opacity-80')}>{block.body}</p>;
  const action = <div className="mt-6"><ActionLink block={block} navigate={navigate} base={base}/></div>;
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
    {title}<p className="mx-auto mt-4 max-w-xl whitespace-pre-line">{block.body}</p>
    <div className="mt-6"><ActionLink block={block} navigate={navigate} base={base} inverse/></div>
  </section>;
  if (block.kind==='text') return <section className={'mx-auto py-10 @md:py-16 '+(variant==='minimal'?'max-w-[660px]':'max-w-4xl')}><div className={variant==='centered'?'text-center':''}>{title}{description}</div></section>;
  // Native adaptation of shadcn/ui Card (MIT) in the shared renderer.
  // All content remains plain strings in validated SiteDocument v2.
  if(block.kind==='features' && variant==='cards')return <section
    data-studio-pattern="shadcn-card" className="py-10 @md:py-16">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3">{title}
      <span className="rounded-full border px-3 py-1 text-xs font-semibold"
        style={{borderColor:'var(--studio-border)',color:'var(--studio-muted)'}}>GIẢI PHÁP</span>
    </div>
    <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
      {rows.map((parts,i)=><article key={i} data-slot="card"
        className="flex flex-col gap-5 rounded-xl border px-6 py-7 shadow-sm transition-shadow hover:shadow-md"
        style={{borderColor:'var(--studio-border)',backgroundColor:'var(--studio-surface)'}}>
        <div data-slot="card-header" className="flex items-start justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-[.16em]"
            style={{color:'var(--studio-muted)'}}>MODULE {String(i+1).padStart(2,'0')}</span>
          <span className="flex size-8 items-center justify-center rounded-lg text-xs font-bold"
            style={{backgroundColor:accent,color:foregroundOnAccent(accent)}}>✓</span>
        </div>
        <h3 data-slot="card-title" className="text-lg font-bold leading-snug">{parts[0]}</h3>
        {parts[1]&&<p data-slot="card-description" className="text-sm leading-7 opacity-75">{parts[1]}</p>}
      </article>)}
    </div>
  </section>;
  // Magic UI BorderBeam motif (MIT), reimplemented without motion/react.
  if(block.kind==='features' && variant==='banner')return <section
    data-studio-pattern="magic-beam" className="py-9 @md:py-14">
    <div className="mb-8">{title}<p className="mt-3 text-sm opacity-75">
      Một ý tưởng rõ ràng luôn bắt đầu từ nội dung có trọng tâm.</p></div>
    <div className="grid gap-5 @md:grid-cols-3">
      {rows.map((parts,i)=><article key={i} className="studio-border-beam p-[2px]">
        <div className="h-full rounded-[inherit] p-6" style={{backgroundColor:'var(--studio-surface)'}}>
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{color:'var(--studio-accent)'}}>0{i+1} / STUDIO</span>
          <h3 className="mt-5 text-xl font-bold">{parts[0]}</h3>
          {parts[1]&&<p className="mt-4 text-sm leading-7 opacity-75">{parts[1]}</p>}
        </div>
      </article>)}
    </div>
  </section>;
  // Start Bootstrap Agency timeline (MIT), normalized to services/list.
  if(block.kind==='services' && variant==='list')return <section
    data-studio-pattern="agency-timeline" className="py-10 @md:py-16">
    <div className="mb-10 text-center">{title}</div>
    <ol className="studio-agency-timeline relative mx-auto max-w-4xl border-l-2 @md:border-l-0"
      style={{borderColor:'var(--studio-border)'}}>
      {rows.map((parts,i)=><li key={i} className="relative mb-8 grid gap-4 pl-8 @md:grid-cols-[1fr_80px_1fr] @md:gap-6 @md:pl-0">
        <div aria-hidden="true" className="absolute -left-[11px] top-3 flex size-5 items-center justify-center rounded-full @md:static @md:col-start-2 @md:row-start-1 @md:mx-auto @md:size-12"
          style={{backgroundColor:accent,color:foregroundOnAccent(accent)}}>
          <span className="hidden text-xs font-bold @md:inline">{String(i+1).padStart(2,'0')}</span>
        </div>
        <article className={'@md:row-start-1 '+(i%2===0?'@md:col-start-1 @md:text-right':'@md:col-start-3')}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--studio-foreground)'}}>
            Giai đoạn {String(i+1).padStart(2,'0')}</span>
          <h3 className="mt-2 text-lg font-bold">{parts[0]}</h3>
          {parts[1]&&<p className="mt-3 text-sm leading-7 opacity-75">{parts[1]}</p>}
        </article>
      </li>)}
    </ol>
  </section>;
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
