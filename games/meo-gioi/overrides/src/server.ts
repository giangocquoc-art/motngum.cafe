import { createServer, provideServerModules, LocalStorageSaveStorageStrategy, provideSaveStorage } from '@rpgjs/server';
import { provideTiledMap } from '@rpgjs/tiledmap/server';
import { provideActionBattle } from '@rpgjs/action-battle/server';
import { provideMain } from './modules/main';
export default createServer({providers:[
 provideMain(),
 provideSaveStorage(new LocalStorageSaveStorageStrategy({key:'meo_gioi_s0_save'})),
 provideServerModules([]),
 provideTiledMap(),
 provideActionBattle({preset:'classic'})
]});
