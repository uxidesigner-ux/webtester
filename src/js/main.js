import { initI18n } from '../i18n/index.js';
const app = document.getElementById('app');
const html = await (await fetch('/src/components/dashboard.html')).text();
app.innerHTML = html;
await initI18n();
