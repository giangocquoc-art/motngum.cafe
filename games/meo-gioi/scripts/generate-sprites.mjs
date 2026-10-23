import fs from "node:fs";
import {deflateSync} from "node:zlib";
const W=144,H=192, cells=48;
function crc32(buf){let c=0xffffffff;for(let n of buf){c^=n;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
const chunk=(tag,body)=>{const t=Buffer.from(tag),len=Buffer.alloc(4),c=Buffer.alloc(4);len.writeUInt32BE(body.length);c.writeUInt32BE(crc32(Buffer.concat([t,body])));return Buffer.concat([len,t,body,c])};
function sprite(name){
 const image=Buffer.alloc(W*H*4);
 const put=(x,y,color)=>{if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;for(let k=0;k<4;k++)image[i+k]=color[k]};
 const rect=(x,y,w,h,c)=>{for(let yy=Math.floor(y);yy<y+h;yy++)for(let xx=Math.floor(x);xx<x+w;xx++)put(xx,yy,c)};
 const ellipse=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c)};
 const col=(hex)=>[...hex.match(/../g).map(s=>parseInt(s,16)),255];
 for(let dir=0;dir<4;dir++)for(let frame=0;frame<3;frame++){
  const ox=frame*48,oy=dir*48, sway=frame===1?2:0;
  if(name==="cat"||name==="npc"){
   const fur=col(name==="cat"?"f6ad62":"f5d1a7"),shade=col("b76646"),line=col("69402f"),white=col("fff4dc"),pink=col("f48898"),eyes=col("252f35");
   ellipse(ox+24,oy+33+sway,14,9,line);ellipse(ox+24,oy+32+sway,12,8,fur);
   rect(ox+10,oy+34,6,8,shade);rect(ox+32,oy+34,6,8,shade);
   rect(ox+9,oy+9,11,14,line);rect(ox+29,oy+9,11,14,line);
   rect(ox+11,oy+11,8,11,fur);rect(ox+30,oy+11,8,11,fur);
   ellipse(ox+24,oy+24+sway,17,15,line);ellipse(ox+24,oy+23+sway,15,13,fur);
   ellipse(ox+24,oy+28+sway,10,6,white);
   if(dir!==3){ellipse(ox+17,oy+22+sway,2,3,eyes);ellipse(ox+31,oy+22+sway,2,3,eyes);rect(ox+22,oy+27+sway,5,3,pink)}
   else rect(ox+20,oy+20+sway,8,9,shade);
   rect(ox+36,oy+34+sway,7,4,shade);
   if(name==="npc")rect(ox+13,oy+35+sway,22,4,pink);
  }else {
   const line=col("5c6172"),body=col("959ba8"),ear=col("e7a4ae"),eye=col("242e40"),nose=col("f57b8d");
   ellipse(ox+24,oy+33+sway,13,9,line);ellipse(ox+24,oy+32+sway,11,7,body);
   ellipse(ox+12,oy+18+sway,6,7,line);ellipse(ox+36,oy+18+sway,6,7,line);
   ellipse(ox+12,oy+18+sway,4,5,ear);ellipse(ox+36,oy+18+sway,4,5,ear);
   ellipse(ox+24,oy+26+sway,14,12,line);ellipse(ox+24,oy+25+sway,12,10,body);
   ellipse(ox+19,oy+25+sway,2,3,eye);ellipse(ox+29,oy+25+sway,2,3,eye);rect(ox+22,oy+29+sway,4,3,nose);
   rect(ox+34,oy+35,10,3,line);
  }
 }
 const raw=Buffer.alloc(H*(1+W*4));
 for(let y=0;y<H;y++){const offset=y*(1+W*4);raw[offset]=0;image.copy(raw,offset+1,y*W*4,(y+1)*W*4)}
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw)),chunk("IEND",Buffer.alloc(0))]);
}
const path=new URL("../public/spritesheets/",import.meta.url);
fs.mkdirSync(path,{recursive:true});
for(const name of ["cat","npc","rat"])fs.writeFileSync(new URL(name+".png",path),sprite(name));
console.log("[Meo Gioi] Original pixel-art sprites generated");
