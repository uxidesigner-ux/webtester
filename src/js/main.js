import { initI18n } from '../i18n/index.js';
const app = document.getElementById('app');
const html = await (await fetch(new URL('../components/dashboard.html', import.meta.url))).text();
app.innerHTML = html;
await initI18n();
const navLinks = document.querySelectorAll('#main-nav a');
const sections = document.querySelectorAll('.content-section');

function updateNav() {
    let i = sections.length;
    while (--i && window.scrollY + 120 < sections[i].offsetTop) {}
    navLinks.forEach(link => link.classList.remove('active'));
    if (i >= 0 && navLinks[i]) {
        navLinks[i].classList.add('active');
    }
}
