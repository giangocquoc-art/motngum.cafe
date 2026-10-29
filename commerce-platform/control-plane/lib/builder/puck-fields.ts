/**
 * Puck-compatible field definitions, kept independent of @puckeditor/core
 * until the editor package and its pnpm lockfile are installed together.
 * These fields correspond exactly to the persisted SiteDocument v2 Block.
 */
import {
  BLOCK_KINDS, BLOCK_VARIANTS, KIND_LABELS,
  createBlock, type Block, type BlockKind, type BlockVariant, type ThemeId
} from './catalog';

export type StudioPuckField =
  | { type:'text'|'textarea'; label:string }
  | { type:'select'; label:string; options:{label:string;value:BlockVariant}[] };

const VARIANT_LABELS:Record<BlockVariant,string>={
  centered:'Căn giữa', split:'Hai cột', full:'Toàn khung', minimal:'Tối giản',
  grid:'Lưới', cards:'Thẻ', banner:'Banner', list:'Danh sách'
};
export const STUDIO_PUCK_FIELDS = {
  title: {type:'text',label:'Tiêu đề'},
  body: {type:'textarea',label:'Nội dung'},
  variant: {
    type:'select',label:'Bố cục',
    options:BLOCK_VARIANTS.map(value=>({label:VARIANT_LABELS[value],value})),
  },
  imageUrl: {type:'text',label:'Đường dẫn ảnh HTTPS'},
  buttonLabel: {type:'text',label:'Nhãn nút'},
  buttonUrl: {type:'text',label:'Liên kết nút'},
  accent: {type:'text',label:'Màu nhấn (#RRGGBB)'},
} satisfies Record<Exclude<keyof Block,'kind'|'id'>,StudioPuckField>;

/**
 * The Puck component type IS block.kind. Never generate a default id here:
 * Puck must assign a unique id when a component is added to the page.
 */
export function studioPuckDefinitions(themeId:ThemeId='coffee') {
  return Object.fromEntries(BLOCK_KINDS.map((kind:BlockKind)=>{
    const {id:_,kind:__, ...defaultProps}=createBlock(kind,themeId);
    return [kind,{
      label:KIND_LABELS[kind],
      fields:STUDIO_PUCK_FIELDS,
      defaultProps,
    }];
  })) as Record<BlockKind,{
    label:string;fields:typeof STUDIO_PUCK_FIELDS;defaultProps:Omit<Block,'kind'|'id'>
  }>;
}
