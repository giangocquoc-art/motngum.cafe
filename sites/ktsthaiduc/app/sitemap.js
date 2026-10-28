import {projects,site} from '../lib/data';
export default function sitemap(){return ['', '/gioi-thieu','/du-an','/dich-vu','/dao-tao','/lien-he','/chinh-sach-bao-mat',...projects.map(p=>'/du-an/'+p.slug)].map(route=>({url:site.domain+route,lastModified:new Date(),changeFrequency:route.includes('/du-an/')?'monthly':'weekly',priority:route===''?1:0.7}))}
