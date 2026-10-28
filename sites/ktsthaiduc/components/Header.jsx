'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState,useEffect} from 'react';
const items=[['/','Trang chủ'],['/gioi-thieu','Giới thiệu'],['/du-an','Dự án'],['/dich-vu','Dịch vụ'],['/dao-tao','Đào tạo'],['/lien-he','Liên hệ']];
export default function Header(){const pathname=usePathname();const [open,setOpen]=useState(false);useEffect(()=>setOpen(false),[pathname]);return <header className="site-header"><div className="container nav-wrap"><Link className="brand" href="/" aria-label="KTS Thái Đức - Trang chủ"><span className="brand-mark">T<span>.</span>D</span><span className="brand-copy">THÁI ĐỨC<span>ARCHITECTURE & DESIGN</span></span></Link><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Đóng mở menu">{open?'✕':'☰'}</button><nav className={open?'nav is-open':'nav'} aria-label="Điều hướng chính">{items.map(([href,label])=><Link key={href} href={href} className={pathname===href||(href==='/du-an'&&pathname.startsWith('/du-an/'))?'active':''}>{label}</Link>)}<a className="nav-cta" href="tel:0978849037">TƯ VẤN ↗</a></nav></div></header>}
