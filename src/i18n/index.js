import { detectLocale } from './utils.js';
async function load(locale){
  try{
    const r = await fetch(`/src/i18n/locales/${locale}/common.json`);
    if(!r.ok) throw new Error();
    return await r.json();
  }catch{
    return (await fetch('/src/i18n/locales/en-US/common.json')).json();
  }
}
export async function initI18n(){
  const locale = detectLocale();
  document.documentElement.lang = locale;
  const msg = await load(locale);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(msg[k]) el.innerHTML = msg[k];
  });
}
