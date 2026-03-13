import { initI18n } from '../i18n/index.js';
const app = document.getElementById('app');
const html = await (await fetch(new URL('../components/dashboard.html', import.meta.url))).text();
app.innerHTML = html;
await initI18n();
