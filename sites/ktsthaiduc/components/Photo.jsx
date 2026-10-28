'use client';
import {useState} from 'react';
export default function Photo({src,alt='',className='',label='',priority=false}){
  const [failed,setFailed]=useState(false);
  return <div className={'photo '+className}>
    {!failed&&src?<img src={src} alt={alt} loading={priority?'eager':'lazy'} onError={()=>setFailed(true)} />:null}
    {(!src||failed)&&<div className="photo-fallback" aria-label={alt}><span>THÁI ĐỨC / ARCHITECTURE</span><i aria-hidden="true" /></div>}
    {label&&<span className="photo-label">{label}</span>}
  </div>
}
