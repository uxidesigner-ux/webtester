import { hydrateCharts } from '../rendering/chartRuntime.js';
import { renderReport, validateReport } from '../rendering/reportRenderer.js';

async function loadReport() {
  const root = document.getElementById('report-root');
  if (!root) throw new Error('report-root element is required');

  const jsonPath = root.dataset.reportJson;
  const slug = root.dataset.reportSlug;

  const path = jsonPath ?? `../../content/reports/${slug}.json`;
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load report JSON: ${path}`);
  return response.json();
}

function initReportUI() {
  const menuButton = document.getElementById('mobile-menu-button');
  const sidebar = document.getElementById('sidebar');
  const navLinks = document.querySelectorAll('#main-nav a');
  const sections = document.querySelectorAll('.content-section');

  if (menuButton && sidebar) {
    menuButton.addEventListener('click', () => {
      const isClosed = sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full');
      menuButton.setAttribute('aria-expanded', String(isClosed));
    });
  }

  function setActiveLink() {
    if (!sections.length || !navLinks.length) return;

    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (window.scrollY + 140 >= section.offsetTop) {
        activeIndex = index;
      }
    });

    navLinks.forEach((link, index) => {
      link.classList.toggle('active', index === activeIndex);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetSelector = link.getAttribute('href');
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }

      if (window.innerWidth < 1024 && sidebar) {
        sidebar.classList.add('-translate-x-full');
        menuButton?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  window.addEventListener('scroll', setActiveLink);
  setActiveLink();
}

const root = document.getElementById('report-root');
if (root) {
  const report = await loadReport();
  const errors = validateReport(report);
  if (errors.length > 0) {
    console.error('Report validation failed', errors);
    root.innerHTML = `<pre>${errors.join('\n')}</pre>`;
  } else {
    root.innerHTML = renderReport(report);
    initReportUI();
    hydrateCharts(report);
  }
}
