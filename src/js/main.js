import { initI18n } from '../i18n/index.js';

const app = document.getElementById('app');
const html = await (await fetch(new URL('../components/dashboard.html', import.meta.url))).text();
app.innerHTML = html;
await initI18n();

initUI();
initCharts();

function initUI() {
  // Accordion
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = document.getElementById(btn.getAttribute('data-target'));
      const icon = btn.querySelector('svg');
      if (t) {
        t.classList.toggle('hidden');
        if (icon) icon.classList.toggle('rotate-180');
      }
    });
  });

  // Mobile Menu
  const mb = document.getElementById('mobile-menu-button');
  const sb = document.getElementById('sidebar');
  if (mb && sb) {
    mb.addEventListener('click', () => sb.classList.toggle('-translate-x-full'));
  }

  // ScrollSpy
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
      const s = document.querySelector(this.getAttribute('href'));
      if (s) {
        window.scrollTo({
          top: s.offsetTop - 80,
          behavior: 'smooth'
        });
      }
      if (window.innerWidth < 768 && sb) {
        sb.classList.add('-translate-x-full');
      }
    });
  });

  window.addEventListener('scroll', updateNav);
  updateNav();
}

function initCharts() {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return;
  }

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

  const c2 = document.getElementById('iranAssetChart');
  if (c2) {
    new Chart(c2, {
      type: 'doughnut',
      data: {
        labels: ['잔존 탄도미사일 (~1,000+발)', '저가 드론(샤헤드 등)', '대리 세력(헤즈볼라 등)', '해협 봉쇄(기뢰/잠수함)', '극초음속(파타 등)'],
        datasets: [{
          data: [30, 25, 15, 15, 15],
          backgroundColor: ['#7f1d1d', '#dc2626', '#f87171', '#fecaca', '#991b1b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }
      }
    });
  }

  const c3 = document.getElementById('economyChart');
  if (c3) {
    new Chart(c3, {
      type: 'bar',
      data: {
        labels: ['글로벌 유가 상승 압력', '한국 무역 수지 악화', '항공/해운 물류 마비', '미국 내 인플레이션', '한국 인플레이션 직격탄'],
        datasets: [{
          label: '경제 위협 지수',
          data: [95, 92, 85, 70, 90],
          backgroundColor: ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#b91c1c'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 100 }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  const c4 = document.getElementById('costAsymmetryChart');
  if (c4) {
    new Chart(c4, {
      type: 'bar',
      data: {
        labels: ['이란 공격 드론\n(샤헤드)', '미국 요격 미사일\n(패트리어트 등)'],
        datasets: [{
          label: '1발당 비용 (만 달러)',
          data: [2, 100],
          backgroundColor: ['#dc2626', '#3b82f6'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: '만 달러', font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(c) {
                return c.parsed.y + '만 달러 (~' + (c.parsed.y * 1300) + '만 원)';
              }
            }
          }
        }
      }
    });
  }

  const c5 = document.getElementById('hormuzDependencyChart');
  if (c5) {
    new Chart(c5, {
      type: 'bar',
      data: {
        labels: ['중국', '한국', '인도', '일본', 'EU'],
        datasets: [{
          label: '호르무즈 해협 의존도 (%)',
          data: [38, 12, 12, 8, 5],
          backgroundColor: ['#1e40af', '#dc2626', '#6b7280', '#3b82f6', '#93c5fd'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 45 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: function(c) {
                if (c.label === '한국') return '석유 소비국 중 최고 수준의 위험도';
                return '';
              }
            }
          }
        }
      }
    });
  }
}
