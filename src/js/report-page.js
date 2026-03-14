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

function getScrollOffset() {
  return window.innerWidth < 1024 ? 96 : 24;
}

function initReportUI() {
  const menuButton = document.getElementById('mobile-menu-button');
  const sidebar = document.getElementById('sidebar');
  const navLinks = Array.from(document.querySelectorAll('#main-nav a'));
  const sectionsById = new Map(Array.from(document.querySelectorAll('.content-section')).map((section) => [section.id, section]));
  const navItems = navLinks
    .map((link) => {
      const targetId = link.getAttribute('href')?.slice(1) ?? '';
      const section = sectionsById.get(targetId);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (menuButton && sidebar) {
    menuButton.addEventListener('click', () => {
      const isClosed = sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full');
      menuButton.setAttribute('aria-expanded', String(isClosed));
    });
  }

  function setActiveLink() {
    if (!navItems.length) return;

    let active = navItems[0];
    for (const item of navItems) {
      if (window.scrollY + getScrollOffset() + 64 >= item.section.offsetTop) {
        active = item;
      }
    }

    navItems.forEach(({ link }) => {
      link.classList.toggle('active', link === active.link);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetSelector = link.getAttribute('href');
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      if (target) {
        window.scrollTo({ top: Math.max(0, target.offsetTop - getScrollOffset()), behavior: 'smooth' });
      }

      if (window.innerWidth < 1024 && sidebar) {
        sidebar.classList.add('-translate-x-full');
        menuButton?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      detail.parentElement?.querySelectorAll('details[open]').forEach((openDetail) => {
        if (openDetail !== detail) {
          openDetail.removeAttribute('open');
        }
      });
    });
  });

  window.addEventListener('scroll', setActiveLink);
  window.addEventListener('resize', setActiveLink);
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
