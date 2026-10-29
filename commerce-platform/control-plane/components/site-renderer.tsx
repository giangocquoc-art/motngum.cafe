import { BlockPreview, studioColors } from '@/components/site-block';
import { themeById, type SiteDocument } from '@/lib/builder/catalog';

/**
 * Published and draft pages use the SAME block registry, variants and design tokens
 * as the visual editor. Only the navigation shell and editor selection controls differ.
 */
export function SiteRenderer({document,base,pageSlug}:{document:SiteDocument;base:string;pageSlug?:string}) {
  const theme=themeById(document.themeId);
  const page=document.pages.find(p=>p.slug===(pageSlug||document.pages[0].slug));
  if(!page)return null;
  const tokens=studioColors(theme);
  return <div className="@container min-h-screen" style={{
    ...tokens,
    backgroundColor:'var(--studio-background)',
    color:'var(--studio-foreground)',
    fontFamily:'var(--studio-font)'
  }}>
    <header className="border-b" style={{borderColor:'var(--studio-border)'}}>
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 @md:px-10">
        <a className="text-lg font-bold tracking-tight" href={base}>{document.title}</a>
        <div className="flex flex-wrap gap-2 @md:gap-5">
          {document.pages.map(p=><a key={p.id} className={'text-xs @md:text-sm '+(p.id===page.id?'font-bold underline underline-offset-8':'opacity-70 hover:opacity-100')}
            href={base+'/'+encodeURIComponent(p.slug)}>{p.title}</a>)}
        </div>
      </nav>
    </header>
    <main className="mx-auto max-w-6xl px-3 pb-2 @md:px-7">
      {page.blocks.map(block=><BlockPreview key={block.id} block={block} theme={theme} base={base}/>)}
    </main>
    <footer className="mx-auto mt-7 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t px-6 py-7 text-xs opacity-70 @md:px-10"
      style={{borderColor:'var(--studio-border)'}}>
      <span>© {new Date().getFullYear()} {document.title}</span>
      <span>Thiết kế bằng Motngum Studio</span>
    </footer>
  </div>;
}
