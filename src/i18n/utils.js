import { DEFAULT_LOCALE, FALLBACK_LOCALE, LOCALE_ALIASES, SUPPORTED_LOCALES } from './config.js';
const norm = (s='') => s.toLowerCase().replace(/_/g,'-');
export const normalizeLocaleTag = (locale) => {
  if (!locale) return DEFAULT_LOCALE;
  const n = norm(locale);
  if (LOCALE_ALIASES[n]) return LOCALE_ALIASES[n];
  const exact = SUPPORTED_LOCALES.find(l => l.toLowerCase() === n);
  if (exact) return exact;
  const base = n.split('-')[0];
  return LOCALE_ALIASES[base] || FALLBACK_LOCALE;
};
export const detectLocale = () => {
  const q = new URLSearchParams(window.location.search).get('lang');
  const ls = localStorage.getItem('locale');
  const nav = navigator.languages?.[0] || navigator.language;
  return normalizeLocaleTag(q || ls || nav || DEFAULT_LOCALE);
};
