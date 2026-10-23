import { provideClientGlobalConfig, provideClientModules, Presets, withMobile } from '@rpgjs/client';
import { provideMain } from '../modules/main';
import { provideTiledMap } from '@rpgjs/tiledmap/client';
export default {
 providers:[
  provideTiledMap({basePath:'map'}),
  provideClientGlobalConfig(),
  provideMain(),
  provideClientModules([
   { spritesheets:[
    {id:'cat',image:'spritesheets/cat.png',...Presets.RMSpritesheet(3,4)},
    {id:'npc',image:'spritesheets/npc.png',...Presets.RMSpritesheet(3,4)},
    {id:'rat',image:'spritesheets/rat.png',...Presets.RMSpritesheet(3,4)}
   ]},
   withMobile()
  ])
 ]
};
