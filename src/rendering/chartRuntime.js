export function hydrateCharts(report) {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return;
  }

  for (const block of report.blocks ?? []) {
    if (block.type !== 'chart') continue;
    const canvas = document.querySelector(`[data-chart-block-id="${block.id}"]`);
    if (!canvas) {
      console.error(`Missing chart canvas for block: ${block.id}`);
      continue;
    }

    const labels = block.chart?.labels ?? [];
    for (const dataset of block.chart?.datasets ?? []) {
      if ((dataset.data ?? []).length !== labels.length) {
        console.error(`Chart block ${block.id} data length mismatch`, block.chart);
        continue;
      }
    }

    new Chart(canvas, {
      type: block.chart?.type ?? 'bar',
      data: {
        labels,
        datasets: block.chart?.datasets ?? []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
