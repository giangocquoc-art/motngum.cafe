/**
 * Lossless, dependency-free adapter between Motngum Studio v2 and Puck's flat Data.
 *
 * @puckeditor/core owns the editing UI; SiteDocument v2 is STILL the sole
 * persisted contract. Do not store the Puck workspace in PostgreSQL.
 *
 * Puck nested zones, custom props, custom root fields and unregistered components
 * are intentionally rejected until a versioned v3 migration can preserve them.
 */
import {
  BLOCK_KINDS,
  type Block,
  type BlockKind,
  type SiteDocument,
  type SitePage,
  type ThemeId,
} from './catalog';
import { validateSiteDocument } from './validation';

export const PUCK_WORKSPACE_FORMAT = 'motngum-puck-flat-v1' as const;

/** Compatible with Puck Data for flat, registered blocks (content + root). */
export type PuckBlock = {
  type: BlockKind;
  props: Omit<Block, 'kind'>;
};
export type PuckPageData = {
  content: PuckBlock[];
  root: Record<string, never>;
  zones?: Record<string, never>;
};
export type PuckWorkspacePage = {
  id: string;
  title: string;
  slug: string;
  data: PuckPageData;
};
export type PuckWorkspace = {
  format: typeof PUCK_WORKSPACE_FORMAT;
  siteDocumentVersion: 2;
  title: string;
  themeId: ThemeId;
  pages: PuckWorkspacePage[];
};

export class PuckConversionError extends Error {
  constructor(public readonly code: string) {
    super('Puck conversion rejected: ' + code);
    this.name = 'PuckConversionError';
  }
}
const reject = (code: string): never => { throw new PuckConversionError(code); };
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (object: Record<string, unknown>, names: readonly string[]) =>
  Object.keys(object).length === names.length &&
  Object.keys(object).every(key => names.includes(key));
const componentProps = [
  'id', 'variant', 'title', 'body', 'imageUrl', 'buttonLabel', 'buttonUrl', 'accent'
] as const;
const workspaceKeys = [
  'format', 'siteDocumentVersion', 'title', 'themeId', 'pages'
] as const;

function asValidDocument(input: unknown): SiteDocument {
  const value = validateSiteDocument(input);
  if (!value) return reject('invalid_v2_document');
  return value;
}
function blockToPuck(block: Block): PuckBlock {
  // Explicitly list each property: new SiteDocument props must be consciously
  // supported by the adapter, rather than silently dropped or overwritten.
  return {
    type: block.kind,
    props: {
      id: block.id,
      variant: block.variant,
      title: block.title,
      body: block.body,
      imageUrl: block.imageUrl,
      buttonLabel: block.buttonLabel,
      buttonUrl: block.buttonUrl,
      accent: block.accent,
    },
  };
}
function pageToPuck(page: SitePage): PuckPageData {
  return { content: page.blocks.map(blockToPuck), root: {} };
}

/** Encode a whole validated site; page IDs, slugs and order remain unchanged. */
export function siteToPuckWorkspace(input: unknown): PuckWorkspace {
  const doc = asValidDocument(input);
  return {
    format: PUCK_WORKSPACE_FORMAT,
    siteDocumentVersion: 2,
    title: doc.title,
    themeId: doc.themeId,
    pages: doc.pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      data: pageToPuck(page),
    })),
  };
}

/**
 * Puck may pass extra metadata when editing; never discard user-authored
 * fields/zones silently, as that would cause data loss on the next cloud save.
 */
function puckDataToBlocks(value: unknown): Block[] {
  if (!record(value)) return reject('invalid_puck_data');
  if (!Array.isArray(value.content)) return reject('missing_content');
  // Puck can represent an empty root either as {} or {props:{}}.
  // A populated root must still be rejected because v2 has no root fields.
  if (!record(value.root)) return reject('unsupported_root_fields');
  const rootKeys=Object.keys(value.root);
  if (rootKeys.length > 0 &&
      !(rootKeys.length === 1 && rootKeys[0] === 'props' &&
        record(value.root.props) && Object.keys(value.root.props).length === 0))
    return reject('unsupported_root_fields');
  if (value.zones !== undefined &&
      (!record(value.zones) || Object.keys(value.zones).length !== 0))
    return reject('nested_zones_not_supported_in_v2');
  if (!Object.keys(value).every(key => ['content', 'root', 'zones'].includes(key)))
    return reject('unsupported_puck_data_keys');

  return value.content.map((entry, index) => {
    if (!record(entry) || !exactKeys(entry, ['type', 'props']))
      return reject('invalid_component_' + index);
    if (typeof entry.type !== 'string' ||
        !BLOCK_KINDS.includes(entry.type as BlockKind))
      return reject('unknown_component_' + index);
    if (!record(entry.props) || !exactKeys(entry.props, componentProps))
      return reject('unmapped_component_props_' + index);
    const props = entry.props;
    // Let the canonical document validator perform field-level validation.
    return {
      kind: entry.type as BlockKind,
      id: props.id,
      variant: props.variant,
      title: props.title,
      body: props.body,
      imageUrl: props.imageUrl,
      buttonLabel: props.buttonLabel,
      buttonUrl: props.buttonUrl,
      accent: props.accent,
    } as Block;
  });
}

/** Reverse conversion; reject unknown fields, zones or document versions. */
export function puckWorkspaceToSite(input: unknown): SiteDocument {
  if (!record(input) || !exactKeys(input, workspaceKeys) ||
      input.format !== PUCK_WORKSPACE_FORMAT || input.siteDocumentVersion !== 2)
    return reject('unsupported_workspace_version');
  if (!Array.isArray(input.pages)) return reject('invalid_workspace_pages');
  const pages: SitePage[] = input.pages.map((item, index) => {
    if (!record(item) || !exactKeys(item, ['id', 'title', 'slug', 'data']))
      return reject('invalid_page_envelope_' + index);
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      blocks: puckDataToBlocks(item.data),
    } as SitePage;
  });
  return asValidDocument({
    version: 2, title: input.title, themeId: input.themeId, pages,
  });
}

/**
 * Edit one page without replacing the other pages or unpublishing a site.
 * Caller still saves via the existing versioned PATCH API (compare-and-swap).
 */
export function applyPuckPage(
  input: unknown, pageId: string, editedPageData: unknown
): SiteDocument {
  const doc = asValidDocument(input);
  if (!doc.pages.some(page => page.id === pageId)) return reject('page_not_found');
  const blocks = puckDataToBlocks(editedPageData);
  return asValidDocument({
    ...doc,
    pages: doc.pages.map(page => page.id === pageId ? { ...page, blocks } : page),
  });
}
