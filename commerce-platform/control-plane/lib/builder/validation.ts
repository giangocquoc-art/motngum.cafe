import {
  BLOCK_KINDS, BLOCK_VARIANTS, THEMES,
  type Block, type BlockKind, type SiteDocument, type SitePage, type ThemeId
} from './catalog';

export const MAX_SITE_PAYLOAD = 1024 * 1024;
export const MAX_SITE_PAGES = 12;
export const MAX_SITE_BLOCKS = 40;
export const MAX_SITE_TOTAL_BLOCKS = 200;

export function isSafeImage(value: string): boolean {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}
export function isSafeLink(value: string): boolean {
  if (!value) return true;
  if (/^#page:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return true;
  if (/^#[a-zA-Z0-9_-]+$/.test(value)) return true;
  try { const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

export function validateSiteDocument(value: unknown): SiteDocument | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const doc = value as Record<string, unknown>;
  if (doc.version !== 2 || typeof doc.title !== 'string' || !doc.title.trim() ||
      doc.title.length > 120 || typeof doc.themeId !== 'string' ||
      !THEMES.some(t => t.id === doc.themeId) || !Array.isArray(doc.pages) ||
      doc.pages.length < 1 || doc.pages.length > MAX_SITE_PAGES) return null;
  const pageIds = new Set<string>(), slugs = new Set<string>(), blockIds = new Set<string>();
  const pages: SitePage[] = [];
  let count = 0;
  for (const rawPage of doc.pages) {
    if (!rawPage || typeof rawPage !== 'object' || Array.isArray(rawPage)) return null;
    const p = rawPage as Record<string,unknown>;
    if (typeof p.id !== 'string' || p.id.length < 1 || p.id.length > 100 ||
        typeof p.title !== 'string' || !p.title.trim() || p.title.length > 80 ||
        typeof p.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) ||
        p.slug.length > 60 || pageIds.has(p.id) || slugs.has(p.slug) ||
        !Array.isArray(p.blocks) || p.blocks.length > MAX_SITE_BLOCKS) return null;
    pageIds.add(p.id); slugs.add(p.slug);
    const blocks: Block[] = [];
    for (const rawBlock of p.blocks) {
      if (!rawBlock || typeof rawBlock !== 'object' || Array.isArray(rawBlock)) return null;
      const b = rawBlock as Record<string,unknown>;
      if (typeof b.id !== 'string' || !b.id || b.id.length > 100 || blockIds.has(b.id) ||
          !BLOCK_KINDS.includes(b.kind as BlockKind) ||
          !BLOCK_VARIANTS.includes(b.variant as Block['variant']) ||
          typeof b.title !== 'string' || b.title.length > 160 ||
          typeof b.body !== 'string' || b.body.length > 2000 ||
          typeof b.imageUrl !== 'string' || b.imageUrl.length > 600 || !isSafeImage(b.imageUrl) ||
          typeof b.buttonLabel !== 'string' || b.buttonLabel.length > 80 ||
          typeof b.buttonUrl !== 'string' || b.buttonUrl.length > 500 || !isSafeLink(b.buttonUrl) ||
          typeof b.accent !== 'string' || !/^#[a-f0-9]{6}$/i.test(b.accent)) return null;
      blockIds.add(b.id); count++;
      if (count > MAX_SITE_TOTAL_BLOCKS) return null;
      blocks.push({
        id:b.id, kind:b.kind as BlockKind, variant:b.variant as Block['variant'],
        title:b.title, body:b.body, imageUrl:b.imageUrl, buttonLabel:b.buttonLabel,
        buttonUrl:b.buttonUrl, accent:b.accent
      });
    }
    pages.push({id:p.id,title:p.title,slug:p.slug,blocks});
  }
  return {version:2,title:doc.title,themeId:doc.themeId as ThemeId,pages};
}

/** No public release of obviously fabricated metrics, testimonials or contacts. */
export function publishIssues(doc: SiteDocument): string[] {
  const problems: string[] = [];
  const slugs = new Set(doc.pages.map(p=>p.slug));
  if (!doc.pages[0].blocks.length) problems.push('Trang chủ không có nội dung.');
  for (const page of doc.pages) {
    for (const block of page.blocks) {
      if (block.buttonUrl.startsWith('#page:') && !slugs.has(block.buttonUrl.slice(6)))
        problems.push('Liên kết tới trang không tồn tại: '+block.buttonUrl);
      if (/hello@example\.com|0900 000 000|Điền địa chỉ|Thay nội dung của bạn|Đối tác 0[1-9]/i.test(block.body))
        problems.push('Trang '+page.title+' còn thông tin demo.');
      if (/120\+\|Khách hàng tin tưởng|15\+\|Dự án tiêu biểu|98%\|Phản hồi tích cực/.test(block.body))
        problems.push('Trang '+page.title+' còn số liệu minh họa.');
      if (block.kind === 'testimonials' && /Minh Anh\||Hoàng Nam\||Bảo Trân\|/.test(block.body))
        problems.push('Trang '+page.title+' còn đánh giá giả định.');
    }
  }
  return [...new Set(problems)].slice(0,20);
}
