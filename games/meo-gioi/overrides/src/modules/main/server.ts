import { defineModule } from '@rpgjs/common';
import { RpgServer } from '@rpgjs/server';
import { player } from './player';
import { ChuMeo, TiemCa, Rat } from './event';

// The village NPCs are separated from the two rat fields to avoid spawn camping.
const rats=Array.from({length:16},(_,i)=>{
 const x=75+(i%8)*91, y=115+Math.floor(i/8)*425;
 return {id:'rat-'+(i+1),x,y,event:Rat(x,y)};
});
export default defineModule<RpgServer>({
 player,
 maps:[{id:'simplemap',events:[
  {id:'chu-meo',x:325,y:390,event:ChuMeo()},
  {id:'tiem-ca',x:235,y:390,event:TiemCa()},
  ...rats
 ]}]
});
