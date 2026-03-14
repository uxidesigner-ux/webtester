import { hydrateCharts } from '../src/rendering/chartRuntime.js';
import { renderReport, validateReport } from '../src/rendering/reportRenderer.js';

const STORAGE_KEY = 'report-admin-draft-v1';

const editor = document.getElementById('editor');
const previewRoot = document.getElementById('preview-root');
const blockList = document.getElementById('block-list');
const adminMessage = document.getElementById('admin-message');
const previewFrame = document.getElementById('preview-frame');
const desktopBtn = document.getElementById('preview-desktop');
const mobileBtn = document.getElementById('preview-mobile');

const metaFields = {
  slug: document.getElementById('meta-slug'),
  title: document.getElementById('meta-title'),
  subtitle: document.getElementById('meta-subtitle'),
  description: document.getElementById('meta-description'),
  date: document.getElementById('meta-date'),
  theme: document.getElementById('meta-theme'),
  sources: document.getElementById('meta-sources')
};

const requiredElements = [editor, previewRoot, blockList, adminMessage, previewFrame, desktopBtn, mobileBtn, ...Object.values(metaFields)];
if (requiredElements.some((el) => !el)) {
  document.body.innerHTML = '<main style="padding:1rem"><h1>Admin initialization failed</h1><p>Required admin elements are missing. Check admin/index.html IDs.</p></main>';
  throw new Error('Admin initialization failed: missing required DOM elements');
}

const defaultReport = {
  slug: 'new-report-slug',
  title: '새 리포트 제목',
  subtitle: '부제목',
  description: '설명',
  date: new Date().toISOString().slice(0, 10),
  theme: 'default',
  sources: [],
  blocks: [
    {
      id: 'hero-1',
      type: 'hero',
      sectionId: 'overview',
      navLabel: '개요',
      visibleInNav: true,
      title: '요약',
      description: '핵심 내용을 입력하세요.',
      styleVariant: 'default',
      order: 1
    }
  ]
};

function setMessage(text, type = 'success') {
  adminMessage.textContent = text;
  adminMessage.className = `admin-message admin-message--${type}`;
}

function syncMetaFromReport(report) {
  metaFields.slug.value = report.slug ?? '';
  metaFields.title.value = report.title ?? '';
  metaFields.subtitle.value = report.subtitle ?? '';
  metaFields.description.value = report.description ?? '';
  metaFields.date.value = report.date ?? '';
  metaFields.theme.value = report.theme ?? '';
  metaFields.sources.value = (report.sources ?? []).join(', ');
}

function readEditorJson() {
  return JSON.parse(editor.value);
}

function writeEditorJson(report) {
  editor.value = JSON.stringify(report, null, 2);
}

function normalizeOrder(report) {
  report.blocks = (report.blocks ?? [])
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({ ...block, order: index + 1 }));
}

function renderBlockList(report) {
  blockList.innerHTML = '';
  const blocks = [...(report.blocks ?? [])].sort((a, b) => a.order - b.order);
  for (const [index, block] of blocks.entries()) {
    const li = document.createElement('li');
    li.className = 'admin-block-item';

    const row = document.createElement('div');
    row.className = 'admin-block-head';
    row.innerHTML = `<strong>${index + 1}. ${block.type}</strong>`;

    const meta = document.createElement('div');
    meta.className = 'admin-block-meta';
    meta.innerHTML = `<span>#${block.id}</span><span>${block.title ?? ''}</span><span>${block.sectionId}</span><span>${block.visibleInNav ? 'nav:on' : 'nav:off'}</span>`;

    const up = document.createElement('button');
    up.textContent = '↑';
    up.className = 'admin-btn admin-btn--small';
    up.addEventListener('click', () => moveBlock(block.id, -1));

    const down = document.createElement('button');
    down.textContent = '↓';
    down.className = 'admin-btn admin-btn--small';
    down.addEventListener('click', () => moveBlock(block.id, 1));

    const remove = document.createElement('button');
    remove.textContent = '삭제';
    remove.className = 'admin-btn admin-btn--small admin-btn--danger';
    remove.addEventListener('click', () => deleteBlock(block.id));

    const actions = document.createElement('div');
    actions.className = 'admin-inline-actions';
    actions.append(up, down, remove);

    li.append(row, meta, actions);
    blockList.append(li);
  }
}

function updateFromMeta() {
  try {
    const report = readEditorJson();
    report.slug = metaFields.slug.value.trim();
    report.title = metaFields.title.value.trim();
    report.subtitle = metaFields.subtitle.value.trim();
    report.description = metaFields.description.value.trim();
    report.date = metaFields.date.value;
    report.theme = metaFields.theme.value.trim();
    report.sources = metaFields.sources.value.split(',').map((s) => s.trim()).filter(Boolean);
    writeEditorJson(report);
    renderAll();
  } catch {
    setMessage('JSON 파싱 오류: 기본 정보 반영을 건너뜀', 'error');
  }
}

function setReport(report) {
  writeEditorJson(report);
  renderAll();
}

function addBlock(type) {
  const report = readEditorJson();
  const idx = (report.blocks?.length ?? 0) + 1;
  const block = {
    id: `${type}-${idx}`,
    type,
    sectionId: `${type}-${idx}`,
    navLabel: `${type}-${idx}`,
    visibleInNav: true,
    title: `${type} title`,
    description: `${type} description`,
    styleVariant: 'default',
    order: idx
  };

  if (type === 'chart') {
    block.chart = {
      type: 'bar',
      labels: ['A', 'B', 'C'],
      datasets: [{ label: '샘플', data: [10, 20, 30], backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd'] }]
    };
  }

  report.blocks = [...(report.blocks ?? []), block];
  normalizeOrder(report);
  setReport(report);
}

function deleteBlock(blockId) {
  const report = readEditorJson();
  report.blocks = (report.blocks ?? []).filter((block) => block.id !== blockId);
  normalizeOrder(report);
  setReport(report);
}

function moveBlock(blockId, offset) {
  const report = readEditorJson();
  const blocks = [...(report.blocks ?? [])].sort((a, b) => a.order - b.order);
  const currentIndex = blocks.findIndex((block) => block.id === blockId);
  const nextIndex = currentIndex + offset;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= blocks.length) return;
  [blocks[currentIndex], blocks[nextIndex]] = [blocks[nextIndex], blocks[currentIndex]];
  report.blocks = blocks;
  normalizeOrder(report);
  setReport(report);
}

function renderAll() {
  try {
    const report = readEditorJson();
    syncMetaFromReport(report);
    renderBlockList(report);

    const errors = validateReport(report);
    if (errors.length > 0) {
      previewRoot.innerHTML = `<pre>${errors.join('\n')}</pre>`;
      setMessage(`검증 오류 ${errors.length}건`, 'error');
      return;
    }

    previewRoot.innerHTML = renderReport(report);
    hydrateCharts(report);
    setMessage('Preview updated', 'success');
  } catch (error) {
    previewRoot.innerHTML = `<pre>${error.message}</pre>`;
    setMessage(error.message, 'error');
  }
}

for (const input of Object.values(metaFields)) {
  input.addEventListener('input', updateFromMeta);
}

document.getElementById('add-block').addEventListener('click', () => {
  addBlock(document.getElementById('new-block-type').value);
});

document.getElementById('new-report').addEventListener('click', () => {
  setReport(structuredClone(defaultReport));
  setMessage('새 리포트 초안을 생성했습니다.', 'success');
});

document.getElementById('save-draft').addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEY, editor.value);
  setMessage('localStorage에 초안을 저장했습니다.', 'success');
});

document.getElementById('load-draft').addEventListener('click', () => {
  const draft = localStorage.getItem(STORAGE_KEY);
  if (!draft) {
    setMessage('저장된 초안이 없습니다.', 'error');
    return;
  }
  editor.value = draft;
  renderAll();
  setMessage('초안을 불러왔습니다.', 'success');
});

document.getElementById('export-json').addEventListener('click', () => {
  const report = readEditorJson();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${report.slug || 'report'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  setMessage('JSON 파일을 내보냈습니다.', 'success');
});

document.getElementById('import-json').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  editor.value = await file.text();
  renderAll();
  setMessage('JSON 파일을 불러왔습니다.', 'success');
});

editor.addEventListener('input', renderAll);

desktopBtn.addEventListener('click', () => {
  previewFrame.classList.remove('preview-frame--mobile');
  previewFrame.classList.add('preview-frame--desktop');
  desktopBtn.classList.add('admin-btn--active');
  mobileBtn.classList.remove('admin-btn--active');
});

mobileBtn.addEventListener('click', () => {
  previewFrame.classList.remove('preview-frame--desktop');
  previewFrame.classList.add('preview-frame--mobile');
  mobileBtn.classList.add('admin-btn--active');
  desktopBtn.classList.remove('admin-btn--active');
});

setReport(structuredClone(defaultReport));
