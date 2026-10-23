import { defineModule } from '@rpgjs/common';
import { RpgServer } from '@rpgjs/server';
import { player } from './player';
import { ChuMeo, Rat } from './event';
const rats=Array.from({length:16},(_,i)=>({
 id:'rat-'+(i+1),
 x:75+(i%8)*91,
 y:115+Math.floor(i/8)*350,
 event:Rat()
}));
export default defineModule<RpgServer>({
 player,
 maps:[{id:'simplemap',events:[
  {id:'chu-meo',x:325,y:390,event:ChuMeo()},
  ...rats
 ]}]
});
