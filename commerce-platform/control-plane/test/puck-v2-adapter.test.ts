import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCK_KINDS, BLOCK_VARIANTS, SITE_TEMPLATES, THEMES,
  buildTemplateDocument, createBlock, type SiteDocument, type SitePage
} from '../lib/builder/catalog';
import { studioPuckDefinitions, STUDIO_PUCK_FIELDS } from '../lib/builder/puck-fields';
import { renameSitePage, countPageReferences, deleteSitePage, SitePageOperationError } from '../lib/builder/page-operations';
import {
  applyPuckPage, PuckConversionError,
  puckWorkspaceToSite, siteToPuckWorkspace,
} from '../lib/builder/puck-adapter';

const deepCopy = <T,>(x: T): T => structuredClone(x);
const errorCode = (fn: () => unknown, expected: string) =>
  assert.throws(fn, (error: unknown) => error instanceof PuckConversionError && error.code === expected);

test('all 24 seeded templates, including 3 pages each, round-trip byte-equivalent JSON', () => {
  assert.equal(SITE_TEMPLATES.length, 24);
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
  const source = buildTemplateDocument(SITE_TEMPLATES[0]);
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
  const source=buildTemplateDocument(SITE_TEMPLATES[0]);
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
  const doc=buildTemplateDocument(SITE_TEMPLATES[0]);
  const data=siteToPuckWorkspace(doc);
  (data.pages[0].data.root as any).props={};
  assert.deepEqual(puckWorkspaceToSite(data),doc);
  (data.pages[0].data.root as any).props={branding:'unknown'};
  errorCode(() => puckWorkspaceToSite(data),'unsupported_root_fields');
});
test('Puck block ordering changes only in selected page and cannot exceed limits', () => {
  const doc=buildTemplateDocument(SITE_TEMPLATES[0]);
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
    assert.equal(item.defaultProps.variant,'cards');
    assert.equal(item.fields.body.type,'textarea');
  }
});

test('page slug rename atomically rewrites cross-page CTA links and remains reversible via Puck',()=>{
  const original=buildTemplateDocument(SITE_TEMPLATES[0]);
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
  const doc=buildTemplateDocument(SITE_TEMPLATES[0]);
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
