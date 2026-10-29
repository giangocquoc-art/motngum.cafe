import type { CSSProperties } from 'react';
import { themeById, type Block, type SiteDocument } from '@/lib/builder/catalog';
import { isSafeImage, isSafeLink } from '@/lib/builder/validation';

const rows=(value:string,max=8)=>value.split('\n').map(x=>x.trim()).filter(Boolean)
  .slice(0,max).map(x=>x.split('|').map(y=>y.trim()));

function SiteAction({block,base}:{block:Block;base:string}) {
  if(!block.buttonLabel || !isSafeLink(block.buttonUrl))return null;
  const target=block.buttonUrl.startsWith('#page:')
    ? base+'/'+encodeURIComponent(block.buttonUrl.slice(6))
    : block.buttonUrl || '#';
  return <a href={target} rel={target.startsWith('http')?'noopener noreferrer':undefined}
    className="inline-flex rounded-lg px-5 py-3 text-sm font-semibold shadow-sm transition hover:opacity-85"
    style={{backgroundColor:block.accent,color:'#ffffff'}}>{block.buttonLabel}</a>;
}
function SiteImage({src,alt}:{src:string;alt:string}) {
  return isSafeImage(src) && src ? <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer"
    className="h-full min-h-48 w-full object-cover"/> : null;
}
function Content({block,base}:{block:Block;base:string}) {
  const title=<h2 className="mb-5 text-2xl font-bold tracking-tight md:text-4xl">{block.title}</h2>;
  const items=rows(block.body);
  if(block.kind==='hero')return <section className={'overflow-hidden rounded-xl '+(block.variant==='split'?'grid md:grid-cols-2':'')}>
    <div className="flex min-h-72 flex-col items-start justify-center gap-4 p-7 md:p-14"
      style={{backgroundColor:block.accent,color:'#ffffff'}}>
      <h1 className="text-3xl font-bold leading-tight md:text-5xl">{block.title}</h1>
      <p className="max-w-xl whitespace-pre-line leading-7 opacity-90">{block.body}</p>
      <SiteAction block={block} base={base}/>
    </div>
    {block.variant==='split'&&<SiteImage src={block.imageUrl} alt={block.title}/>}
  </section>;
  if(block.kind==='cta')return <section className="my-8 rounded-xl p-10 text-center" style={{backgroundColor:block.accent,color:'#ffffff'}}>
    <h2 className="text-3xl font-bold">{block.title}</h2><p className="my-5 whitespace-pre-line">{block.body}</p>
    <SiteAction block={block} base={base}/>
  </section>;
  if(block.kind==='image')return <section className="my-8 overflow-hidden rounded-xl"><SiteImage src={block.imageUrl} alt={block.title}/><p className="p-3 text-sm opacity-70">{block.title}</p></section>;
  if(block.kind==='gallery') {
    const imgs=[block.imageUrl,...block.body.split('\n')].filter(u=>u && isSafeImage(u)).slice(0,8);
    return <section className="my-12">{title}<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {imgs.map((src,i)=><div key={i} className="h-44 overflow-hidden rounded-xl md:h-60"><SiteImage src={src} alt={block.title+' '+(i+1)}/></div>)}
    </div></section>;
  }
  if(block.kind==='text')return <section className="mx-auto my-12 max-w-4xl">
    {title}<p className="whitespace-pre-line text-base leading-8 opacity-80">{block.body}</p>
  </section>;
  if(block.kind==='faq')return <section className="my-12">{title}<div className="divide-y opacity-90">
    {items.map(([q,a],i)=><details className="py-4" key={i}><summary className="cursor-pointer font-semibold">{q}</summary><p className="pt-3 text-sm leading-7">{a}</p></details>)}
  </div></section>;
  if(block.kind==='stats')return <section className="my-12">{title}<div className="grid grid-cols-2 gap-5 md:grid-cols-3">
    {items.map(([num,label],i)=><div key={i} className="border-l-4 pl-5" style={{borderColor:block.accent}}>
      <div className="text-3xl font-extrabold md:text-5xl">{num}</div><p className="mt-2 text-sm opacity-75">{label}</p>
    </div>)}</div></section>;
  if(block.kind==='contact')return <section className="my-12 rounded-xl border p-7 md:p-10">
    {title}<p className="whitespace-pre-line leading-8 opacity-80">{block.body}</p>
    <p className="mt-5 text-xs opacity-60">Vui lòng liên hệ qua thông tin ở trên. Chưa có biểu mẫu gửi dữ liệu trực tuyến.</p>
  </section>;
  if(block.kind==='newsletter')return <section className="my-12 rounded-xl border p-8 text-center">
    {title}<p className="opacity-80">{block.body}</p><p className="mt-3 text-xs opacity-60">Chức năng nhận bản tin chưa được kích hoạt.</p>
  </section>;
  const type=block.kind;
  const cardTypes=['features','services','products','testimonials','pricing','team','logos'];
  if(cardTypes.includes(type))return <section className="my-12">{title}<div className="grid gap-4 md:grid-cols-3">
    {items.map(([first,second,third],i)=><article key={i} className="overflow-hidden rounded-xl border p-5">
      {type==='products' && block.imageUrl && <div className="mb-4 h-36 overflow-hidden rounded-lg"><SiteImage src={block.imageUrl} alt={first}/></div>}
      <h3 className="text-lg font-bold">{first}</h3>
      {second&&<p className="mt-2 whitespace-pre-line text-sm leading-6 opacity-75">{second}</p>}
      {third&&<p className="mt-3 border-t pt-3 text-sm font-semibold">{third}</p>}
    </article>)}
  </div>{type==='products'&&<p className="mt-3 text-xs opacity-60">Danh mục trưng bày, chưa kết nối đặt hàng hoặc thanh toán.</p>}</section>;
  return null;
}
export function SiteRenderer({document,base,pageSlug}:{document:SiteDocument;base:string;pageSlug?:string}) {
  const theme=themeById(document.themeId);
  const page=document.pages.find(p=>p.slug===(pageSlug||document.pages[0].slug));
  if(!page)return null;
  const css:CSSProperties={background:theme.background,color:theme.foreground,
    fontFamily:theme.font,minHeight:'100vh'};
  return <div style={css}>
    <header className="border-b" style={{borderColor:theme.border}}>
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 p-5">
        <a className="text-lg font-bold" href={base}>{document.title}</a>
        <div className="flex flex-wrap items-center gap-5">
          {document.pages.map(p=><a key={p.id} className={'text-sm '+(p.id===page.id?'font-bold underline underline-offset-8':'opacity-75')}
            href={base+'/'+encodeURIComponent(p.slug)}>{p.title}</a>)}
        </div>
      </nav>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      {page.blocks.map(block=><Content key={block.id} block={block} base={base}/>)}
    </main>
    <footer className="mt-12 border-t p-8 text-center text-xs opacity-70" style={{borderColor:theme.border}}>
      © {new Date().getFullYear()} {document.title} · Motngum Studio
    </footer>
  </div>;
}
