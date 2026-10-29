import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCK_KINDS, BLOCK_VARIANTS, SITE_TEMPLATES, THEMES,
  buildTemplateDocument, createBlock, type SiteDocument, type SitePage
} from '../lib/builder/catalog';
import { studioPuckDefinitions, STUDIO_PUCK_FIELDS } from '../lib/builder/puck-fields';
import { publishIssues, validateSiteDocument } from '../lib/builder/validation';
import { addSitePage, renameSitePageTitle, duplicateSitePage, moveSitePage, normalizePageSlug,
  renameSitePage, countPageReferences, deleteSitePage, SitePageOperationError } from '../lib/builder/page-operations';
import {
  applyPuckPage, PuckConversionError,
  puckWorkspaceToSite, siteToPuckWorkspace,
} from '../lib/builder/puck-adapter';

const deepCopy = <T,>(x: T): T => structuredClone(x);
const legacySeed = SITE_TEMPLATES.find(t=>t.id==='maison-cafe')!;
const errorCode = (fn: () => unknown, expected: string) =>
  assert.throws(fn, (error: unknown) => error instanceof PuckConversionError && error.code === expected);

test('all 27 catalog templates, including 3 pages each, round-trip byte-equivalent JSON', () => {
  assert.equal(SITE_TEMPLATES.length, 27);
  for (const template of SITE_TEMPLATES) {
    const before = buildTemplateDocument(template);
    const snapshot = deepCopy(before);
    const puck = siteToPuckWorkspace(before);
    assert.equal(puck.pages.length, 3, template.id);
    assert.deepEqual(puckWorkspaceToSite(puck), before, template.id);
    assert.deepEqual(before, snapshot, 'serializer must not mutate the live draft');
  }
});
test('all 16 kinds × 8 layouts × 8 themes round-trip with Vietnamese/Unicode and links', () => {
  for (const theme of THEMES) {
    const blocks = BLOCK_KINDS.flatMap((kind) =>
      BLOCK_VARIANTS.map((variant, index) => {
        const block = createBlock(kind, theme.id, variant);
        return {
          ...block, body: 'Nội dung tiếng Việt 中文 🎨 "quotes" | dòng ' + index + '\nDòng thứ hai',
          title: kind + ' — ' + variant, buttonUrl: '#page:page-1'
        };
      })
    );
    assert.equal(blocks.length, 128);
    const pages: SitePage[] = Array.from({ length: 4 }, (_, i) => ({
      id: 'stable-page-' + i,
      title: 'Trang ' + (i + 1),
      slug: 'page-' + (i + 1),
      blocks: blocks.slice(i * 32, (i + 1) * 32),
    }));
    const document: SiteDocument = { version: 2, title: 'Bảo toàn dữ liệu', themeId: theme.id, pages };
    const packed = siteToPuckWorkspace(document);
    assert.deepEqual(puckWorkspaceToSite(packed), document);
    for (let i = 0; i < 4; i++) {
      assert.deepEqual(
        packed.pages[i].data.content.map(c => c.props.id),
        pages[i].blocks.map(b => b.id)
      );
    }
  }
});
test('save of one Puck page cannot change the metadata, sibling pages or persisted input', () => {
  const source = buildTemplateDocument(legacySeed);
  const snapshot = deepCopy(source);
  const workspace = siteToPuckWorkspace(source);
  workspace.pages[1].data.content[0].props.body = 'Cập nhật riêng cho trang giới thiệu';
  workspace.pages[1].data.content.reverse();
  const updated = applyPuckPage(source, source.pages[1].id, workspace.pages[1].data);
  assert.deepEqual(source, snapshot);
  assert.deepEqual(updated.pages[0], source.pages[0]);
  assert.deepEqual(updated.pages[2], source.pages[2]);
  assert.equal(updated.pages[1].slug, source.pages[1].slug);
  assert.equal(updated.pages[1].id, source.pages[1].id);
  assert.equal(updated.themeId, source.themeId);
  assert.equal(updated.title, source.title);
  assert.deepEqual(updated.pages[1].blocks.map(b => b.id),
    [...source.pages[1].blocks.map(b => b.id)].reverse());
  assert.equal(updated.pages[1].blocks.at(-1)?.body,'Cập nhật riêng cho trang giới thiệu');
  errorCode(() => applyPuckPage(source, 'does-not-exist', workspace.pages[0].data), 'page_not_found');
});
test('rejects unknown Puck components, custom props, missing fields and nested regions', () => {
  const source=buildTemplateDocument(legacySeed);
  const basis=siteToPuckWorkspace(source);
  const mutations: Array<[string, (copy: typeof basis) => void]> = [
    ['unknown_component_0', d => { (d.pages[0].data.content[0] as any).type='InjectedWidget'; }],
    ['unmapped_component_props_0', d => { (d.pages[0].data.content[0].props as any).customWidget='invisible'; }],
    ['unmapped_component_props_0', d => { delete (d.pages[0].data.content[0].props as any).body; }],
    ['unsupported_root_fields', d => { (d.pages[0].data.root as any).customLogo='lost'; }],
    ['nested_zones_not_supported_in_v2', d => { (d.pages[0].data as any).zones={row:[{type:'text'}]}; }],
    ['unsupported_puck_data_keys', d => { (d.pages[0].data as any).hiddenContent=true; }],
    ['invalid_component_0', d => { (d.pages[0].data.content[0] as any).readOnly=true; }],
    ['invalid_v2_document', d => { d.pages[0].data.content[0].props.buttonUrl='javascript:alert(1)'; }],
    ['invalid_v2_document', d => { d.pages[0].data.content[0].props.imageUrl='data:image/svg+xml;base64,123'; }],
    ['invalid_v2_document', d => { d.pages[1].slug=d.pages[0].slug; }],
    ['invalid_v2_document', d => { d.pages[1].data.content[0].props.id=d.pages[0].data.content[0].props.id; }],
    ['invalid_v2_document', d => { d.pages[0].data.content[0].props.title='x'.repeat(161); }],
    ['invalid_v2_document', d => { d.pages[0].data.content[0].props.accent='red'; }],
    ['unsupported_workspace_version', d => { (d as any).siteDocumentVersion=3; }],
    ['unsupported_workspace_version', d => { (d as any).previewMetadata={foo:1}; }],
    ['invalid_page_envelope_0', d => { (d.pages[0] as any).anotherField=true; }]
  ];
  for (const [code, mutate] of mutations) {
    const copy=deepCopy(basis);
    mutate(copy);
    errorCode(() => puckWorkspaceToSite(copy), code);
  }
  assert.deepEqual(puckWorkspaceToSite(basis),source);
});
test('accepts an empty Puck root props object but rejects nonempty root props', () => {
  const doc=buildTemplateDocument(legacySeed);
  const data=siteToPuckWorkspace(doc);
  (data.pages[0].data.root as any).props={};
  assert.deepEqual(puckWorkspaceToSite(data),doc);
  // Actual Puck 0.24 injects synthetic root.props.id='root' during initialization.
  (data.pages[0].data.root as any).props={id:'root'};
  assert.deepEqual(puckWorkspaceToSite(data),doc);
  (data.pages[0].data.root as any).props={branding:'unknown'};
  errorCode(() => puckWorkspaceToSite(data),'unsupported_root_fields');
});
test('Puck block ordering changes only in selected page and cannot exceed limits', () => {
  const doc=buildTemplateDocument(legacySeed);
  const payload=siteToPuckWorkspace(doc);
  payload.pages[0].data.content.reverse();
  const edited=applyPuckPage(doc,doc.pages[0].id,payload.pages[0].data);
  assert.deepEqual(edited.pages[0].blocks.map(b=>b.id),
    [...doc.pages[0].blocks.map(b=>b.id)].reverse());
  const extra=deepCopy(payload.pages[0].data.content[0]);
  while(payload.pages[0].data.content.length<=40){
    const item=deepCopy(extra);
    item.props.id='unique-overflow-'+payload.pages[0].data.content.length;
    payload.pages[0].data.content.push(item);
  }
  errorCode(() => applyPuckPage(doc,doc.pages[0].id,payload.pages[0].data),'invalid_v2_document');
});

test('field registry covers 16 Puck component types and has no static default IDs',()=>{
  const schema=studioPuckDefinitions();
  assert.deepEqual(Object.keys(schema),BLOCK_KINDS);
  assert.deepEqual(Object.keys(STUDIO_PUCK_FIELDS),
    ['title','body','variant','imageUrl','buttonLabel','buttonUrl','accent']);
  assert.deepEqual(STUDIO_PUCK_FIELDS.variant.options.map(x=>x.value),BLOCK_VARIANTS);
  for(const kind of BLOCK_KINDS){
    const item=schema[kind];
    assert.ok(item.label);
    assert.equal('id' in item.defaultProps,false);
    assert.equal('kind' in item.defaultProps,false);
    assert.equal(item.defaultProps.buttonLabel,'');
    assert.equal(item.defaultProps.buttonUrl,'');
    assert.equal(item.defaultProps.variant,'cards');
    assert.equal(item.fields.body.type,'textarea');
  }
});

test('page slug rename atomically rewrites cross-page CTA links and remains reversible via Puck',()=>{
  const original=buildTemplateDocument(legacySeed);
  const destination=original.pages.find(page=>page.slug==='lien-he')!;
  const before=JSON.stringify(original);
  const refs=countPageReferences(original,destination.id);
  assert.ok(refs>0,'fixture must contain inbound links');
  const renamed=renameSitePage(original,destination.id,'ket-noi-moi');
  assert.equal(renamed.pages.find(page=>page.id===destination.id)?.slug,'ket-noi-moi');
  assert.equal(JSON.stringify(renamed).includes('#page:lien-he'),false);
  assert.equal(renamed.pages.flatMap(page=>page.blocks).filter(block=>block.buttonUrl==='#page:ket-noi-moi').length >=refs,true);
  assert.equal(JSON.stringify(original),before,'source site must not mutate');
  assert.deepEqual(puckWorkspaceToSite(siteToPuckWorkspace(renamed)),renamed);
  assert.throws(()=>renameSitePage(renamed,destination.id,renamed.pages[0].slug),
    (error:unknown)=>error instanceof SitePageOperationError&&error.code==='duplicate_slug');
});
test('deleting a referenced page requires explicit destination and preserves all link targets',()=>{
  const doc=buildTemplateDocument(legacySeed);
  const contact=doc.pages.find(page=>page.slug==='lien-he')!;
  const about=doc.pages.find(page=>page.slug==='gioi-thieu')!;
  assert.ok(countPageReferences(doc,contact.id)>0);
  assert.throws(()=>deleteSitePage(doc,contact.id),
    (error:unknown)=>error instanceof SitePageOperationError&&error.code==='replacement_required');
  assert.throws(()=>deleteSitePage(doc,contact.id,contact.id),
    (error:unknown)=>error instanceof SitePageOperationError&&error.code==='invalid_replacement');
  const safe=deleteSitePage(doc,contact.id,about.id);
  assert.equal(safe.pages.length,doc.pages.length-1);
  assert.equal(JSON.stringify(safe).includes('#page:lien-he'),false);
  const newLinks=safe.pages.flatMap(page=>page.blocks).filter(block=>block.buttonUrl==='#page:gioi-thieu');
  assert.ok(newLinks.length>=countPageReferences(doc,contact.id));
  assert.deepEqual(puckWorkspaceToSite(siteToPuckWorkspace(safe)),safe);
  const onlyOne={...safe,pages:safe.pages.slice(0,1)};
  assert.throws(()=>deleteSitePage(onlyOne,onlyOne.pages[0].id),
    (error:unknown)=>error instanceof SitePageOperationError&&error.code==='last_page');
});

test('C3 page creation, naming, order and duplication preserve immutable v2 and distinct block IDs',()=>{
  const source=buildTemplateDocument(legacySeed),before=structuredClone(source);
  const added=addSitePage(source,'Hồ sơ công ty','ho-so-cong-ty');
  assert.equal(added.pages.length,source.pages.length+1);
  assert.equal(added.pages.at(-1)?.slug,'ho-so-cong-ty');
  assert.deepEqual(source,before);
  const rename=renameSitePageTitle(added,added.pages.at(-1)!.id,'Giới thiệu doanh nghiệp');
  assert.equal(rename.pages.at(-1)?.title,'Giới thiệu doanh nghiệp');
  assert.equal(rename.pages.at(-1)?.slug,'ho-so-cong-ty');
  const copied=duplicateSitePage(rename,source.pages[0].id,'trang-chu-copy');
  assert.equal(copied.pages.length,5);
  assert.deepEqual(copied.pages[1].blocks.map(b=>({...b,id:null})),
    source.pages[0].blocks.map(b=>({...b,id:null})));
  const uniqueIds=copied.pages.flatMap(p=>p.blocks.map(b=>b.id));
  assert.equal(new Set(uniqueIds).size,uniqueIds.length);
  assert.equal(new Set(copied.pages.map(p=>p.id)).size,copied.pages.length);
  const moved=moveSitePage(copied,copied.pages[1].id,-1);
  assert.equal(moved.pages[0].slug,'trang-chu-copy');
  assert.deepEqual(puckWorkspaceToSite(siteToPuckWorkspace(moved)),moved);
  assert.equal(normalizePageSlug('Giới thiệu Đà Nẵng!'),'gioi-thieu-da-nang');
  assert.throws(()=>addSitePage(source,'Tác giả',source.pages[0].slug),
    (e:unknown)=>e instanceof SitePageOperationError&&e.code==='duplicate_slug');
  assert.throws(()=>renameSitePageTitle(source,source.pages[0].id,'  '),
    (e:unknown)=>e instanceof SitePageOperationError&&e.code==='invalid_title');
  assert.throws(()=>moveSitePage(source,source.pages[0].id,-1),
    (e:unknown)=>e instanceof SitePageOperationError&&e.code==='page_boundary');
});
test('C4 editor site limits fail closed without mutating source',()=>{
  let doc=buildTemplateDocument(legacySeed);
  for(let i=doc.pages.length;i<12;i++)
    doc=addSitePage(doc,'Trang '+i,'trang-'+i);
  assert.equal(doc.pages.length,12);
  assert.throws(()=>addSitePage(doc,'Quá giới hạn','qua-gioi-han'),
    (e:unknown)=>e instanceof SitePageOperationError&&e.code==='page_limit');
  assert.throws(()=>duplicateSitePage(doc,doc.pages[0].id,'copy'),
    (e:unknown)=>e instanceof SitePageOperationError&&e.code==='page_limit');
});

test('all three source-normalized MIT templates are distinct, editable, and cannot publish demo contacts',()=>{
  const curated=SITE_TEMPLATES.filter(t=>t.curatedSource);
  assert.deepEqual(curated.map(t=>t.curatedSource),
    ['shadcn-card','magic-border-beam','startbootstrap-agency']);
  const docs=curated.map(buildTemplateDocument);
  assert.equal(new Set(docs.map(d=>JSON.stringify(d.pages[0].blocks.map(b=>b.kind+':'+b.variant)))).size,3);
  for(let i=0;i<docs.length;i++){
    const doc=docs[i];
    assert.deepEqual(validateSiteDocument(doc),doc,curated[i].id);
    assert.deepEqual(puckWorkspaceToSite(siteToPuckWorkspace(doc)),doc);
    assert.equal(doc.pages.length,3);
    assert.ok(doc.pages.every(p=>p.blocks.length>=2));
    assert.equal(doc.pages.flatMap(p=>p.blocks).some(b=>b.kind==='stats'||b.kind==='testimonials'),false,
      'curated sources must not include invented customer statistics or testimonials');
    assert.ok(publishIssues(doc).length>0,'unfinished template contact and placeholders must block publishing');
    const slugs=new Set(doc.pages.map(page=>page.slug));
    for(const block of doc.pages.flatMap(page=>page.blocks)){
      if(block.buttonUrl.startsWith('#page:'))
        assert.ok(slugs.has(block.buttonUrl.slice(6)), 'CTA target must exist in same template');
    }
  }
  assert.equal(docs[0].pages[0].blocks.find(b=>b.kind==='features')?.variant,'cards');
  assert.equal(docs[1].pages[0].blocks.find(b=>b.kind==='features')?.variant,'banner');
  assert.equal(docs[2].pages[0].blocks.find(b=>b.kind==='services')?.variant,'list');
});
