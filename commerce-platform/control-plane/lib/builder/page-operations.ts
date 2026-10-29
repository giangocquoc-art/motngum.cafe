import { newId, type SiteDocument } from './catalog';
import { MAX_SITE_PAGES } from './validation';
import { validateSiteDocument } from './validation';

/** Explicitly reject edits that would produce broken references or invalid v2. */
export class SitePageOperationError extends Error {
  constructor(public readonly code:string) {
    super('Invalid website page operation: '+code);
    this.name='SitePageOperationError';
  }
}
function valid(doc:unknown) {
  const result=validateSiteDocument(doc);
  if(!result)throw new SitePageOperationError('invalid_document');
  return result;
}
const pageSlugValid = (slug:string) =>
  slug.length>0 && slug.length<=60 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
const referenced = (doc:SiteDocument,oldSlug:string,excludedPageId?:string) =>
  doc.pages.reduce((sum,page)=>sum+(page.id===excludedPageId?0:
    page.blocks.filter(block=>block.buttonUrl==='#page:'+oldSlug).length),0);

export function renameSitePage(doc:SiteDocument,pageId:string,nextSlug:string):SiteDocument {
  const source=valid(doc);
  const target=source.pages.find(page=>page.id===pageId);
  if(!target)throw new SitePageOperationError('page_not_found');
  if(!pageSlugValid(nextSlug))throw new SitePageOperationError('invalid_slug');
  if(source.pages.some(page=>page.id!==pageId&&page.slug===nextSlug))
    throw new SitePageOperationError('duplicate_slug');
  if(target.slug===nextSlug)return source;
  const old='#page:'+target.slug;
  return valid({
    ...source,pages:source.pages.map(page=>({
      ...page, ...(page.id===pageId?{slug:nextSlug}:{}),
      blocks:page.blocks.map(block=>block.buttonUrl===old?
        {...block,buttonUrl:'#page:'+nextSlug}:block)
    }))
  });
}

/** Number of inbound links *from surviving pages*, not links on deleted page. */
export function countPageReferences(doc:SiteDocument,pageId:string):number {
  const source=valid(doc);
  const target=source.pages.find(page=>page.id===pageId);
  if(!target)throw new SitePageOperationError('page_not_found');
  return referenced(source,target.slug,target.id);
}
export function deleteSitePage(doc:SiteDocument,pageId:string,replacementId?:string):SiteDocument {
  const source=valid(doc);
  if(source.pages.length===1)throw new SitePageOperationError('last_page');
  const target=source.pages.find(page=>page.id===pageId);
  if(!target)throw new SitePageOperationError('page_not_found');
  const references=referenced(source,target.slug,target.id);
  const replacement=replacementId?source.pages.find(page=>page.id===replacementId):undefined;
  if(replacementId&&(!replacement||replacement.id===target.id))
    throw new SitePageOperationError('invalid_replacement');
  if(references>0&&!replacement)
    throw new SitePageOperationError('replacement_required');
  const old='#page:'+target.slug;
  return valid({
    ...source,
    pages:source.pages.filter(page=>page.id!==pageId).map(page=>({
      ...page,
      blocks:page.blocks.map(block=>
        block.buttonUrl===old&&replacement?
          {...block,buttonUrl:'#page:'+replacement.slug}:block)
    }))
  });
}

/** New pages are never pre-populated with fabricated testimonials or metrics. */
export function addSitePage(doc:SiteDocument,title:string,slug:string):SiteDocument {
  const source=valid(doc);
  if(source.pages.length>=MAX_SITE_PAGES)throw new SitePageOperationError('page_limit');
  if(!title.trim()||title.length>80)throw new SitePageOperationError('invalid_title');
  if(!pageSlugValid(slug))throw new SitePageOperationError('invalid_slug');
  if(source.pages.some(page=>page.slug===slug))throw new SitePageOperationError('duplicate_slug');
  return valid({...source,pages:[...source.pages,{id:newId(),title:title.trim(),slug,blocks:[]}]});
}
export function renameSitePageTitle(doc:SiteDocument,pageId:string,title:string):SiteDocument {
  const source=valid(doc);
  if(!source.pages.some(page=>page.id===pageId))throw new SitePageOperationError('page_not_found');
  if(!title.trim()||title.length>80)throw new SitePageOperationError('invalid_title');
  return valid({...source,pages:source.pages.map(page=>page.id===pageId?{...page,title:title.trim()}:page)});
}
export function duplicateSitePage(doc:SiteDocument,pageId:string,newSlug:string):SiteDocument {
  const source=valid(doc);
  if(source.pages.length>=MAX_SITE_PAGES)throw new SitePageOperationError('page_limit');
  const sourcePage=source.pages.find(page=>page.id===pageId);
  if(!sourcePage)throw new SitePageOperationError('page_not_found');
  if(!pageSlugValid(newSlug))throw new SitePageOperationError('invalid_slug');
  if(source.pages.some(page=>page.slug===newSlug))throw new SitePageOperationError('duplicate_slug');
  const copied={...sourcePage,id:newId(),title:(sourcePage.title+' (bản sao)').slice(0,80),slug:newSlug,
    blocks:sourcePage.blocks.map(block=>({...block,id:newId()}))};
  const index=source.pages.findIndex(page=>page.id===pageId);
  return valid({...source,pages:[...source.pages.slice(0,index+1),copied,...source.pages.slice(index+1)]});
}
export function moveSitePage(doc:SiteDocument,pageId:string,direction:-1|1):SiteDocument {
  const source=valid(doc);
  const index=source.pages.findIndex(page=>page.id===pageId);
  if(index<0)throw new SitePageOperationError('page_not_found');
  const next=index+direction;
  if(next<0||next>=source.pages.length)throw new SitePageOperationError('page_boundary');
  const pages=[...source.pages];
  [pages[index],pages[next]]=[pages[next],pages[index]];
  return valid({...source,pages});
}

/** URL editor input is normalized, never interpreted as executable markup. */
export function normalizePageSlug(value:string):string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
}
