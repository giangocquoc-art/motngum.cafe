import {site} from '../lib/data';export default function robots(){return {rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:site.domain+'/sitemap.xml'}}
