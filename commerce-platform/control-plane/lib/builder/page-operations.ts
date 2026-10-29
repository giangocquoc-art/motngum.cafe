import type { SiteDocument } from './catalog';
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
