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
document.addEventListener('DOMContentLoaded', () => {
    const accordionButtons = document.querySelectorAll('.accordion-btn');
    accordionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.getAttribute('data-target'));
            const icon = btn.querySelector('svg');
            if (target) {
                target.classList.toggle('hidden');
                if (icon) icon.classList.toggle('rotate-180');
            }
        });
    });

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

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

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                window.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
            }
            if (window.innerWidth < 768 && sidebar) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });

    window.addEventListener('scroll', updateNav);
    updateNav();

    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = '"Paperlogy", sans-serif';
        Chart.defaults.color = '#4b5563';

        const c1 = document.getElementById('usTargetChart');
        if (c1) {
            new Chart(c1, {
                type: 'doughnut',
                data: {
                    labels: ['핵/미사일 인프라', '최고 지휘부(참수)', '해군력(호르무즈 방어)', '중간 간부(IRGC)'],
                    datasets: [{
                        data: [35, 25, 25, 15],
                        backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd', '#dbeafe'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
                }
            });
        }

        // 나머지 chart도 동일하게 이어서 분리
    }
});
