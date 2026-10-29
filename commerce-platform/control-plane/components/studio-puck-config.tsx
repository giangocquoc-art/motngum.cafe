'use client';

import type { Config } from '@puckeditor/core';
import { BlockPreview, studioColors } from '@/components/site-block';
import { BLOCK_KINDS, themeById, type Block, type BlockKind, type ThemeId } from '@/lib/builder/catalog';
import { studioPuckDefinitions } from '@/lib/builder/puck-fields';

/**
 * Puck edits the existing v2 schema, not a second CMS or renderer. Each
 * registered type wraps the exact BlockPreview used in public pages.
 * Strict adapter (puck-adapter.ts) rejects unregistered types and zones.
 */
export function createMotngumPuckConfig(themeId: ThemeId): Config {
  const theme=themeById(themeId);
  const registry=studioPuckDefinitions(themeId);
  const components=Object.fromEntries(BLOCK_KINDS.map(kind=>{
    const definition=registry[kind];
    return [kind,{
      label:definition.label,
      fields:definition.fields,
      defaultProps:definition.defaultProps,
      render:(props: Omit<Block,'kind'>)=>(
        <div className="@container min-h-[40px]" style={{
          ...studioColors(theme),backgroundColor:'var(--studio-background)',
          color:'var(--studio-foreground)',fontFamily:'var(--studio-font)'
        }}>
          <BlockPreview
            block={{
              id:props.id,kind:kind as BlockKind,variant:props.variant,
              title:props.title,body:props.body,imageUrl:props.imageUrl,
              buttonLabel:props.buttonLabel,buttonUrl:props.buttonUrl,accent:props.accent
            }}
            theme={theme} navigate={()=>{}}
          />
        </div>
      ),
    }];
  })) as unknown as Config['components'];
  // Group the 16 blocks for faster discovery; this is the existing core
  // component registry, not a second library of templates.
  return {
    components,
    categories:{
      intro:{title:'Khởi đầu & giới thiệu',components:['hero','text','image','cta','features']},
      showcase:{title:'Trưng bày nội dung',components:['gallery','services','team','logos']},
      credibility:{title:'Uy tín & thông tin',components:['stats','testimonials','faq']},
      commerce:{title:'Thương mại & tương tác',components:['products','pricing','contact','newsletter']}
    }
  } as Config;
}
