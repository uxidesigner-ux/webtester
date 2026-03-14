import { hydrateCharts } from '../src/rendering/chartRuntime.js';
import { renderReport, validateReport } from '../src/rendering/reportRenderer.js';

const STORAGE_KEY = 'report-admin-draft-v1';
const DRAFT_INDEX_KEY = 'report-admin-draft-index-v1';
const DRAFT_ITEM_PREFIX = 'report-admin-draft-item:';

const editor = document.getElementById('editor');
const previewRoot = document.getElementById('preview-root');
const blockList = document.getElementById('block-list');
const adminMessage = document.getElementById('admin-message');
const previewFrame = document.getElementById('preview-frame');
const desktopBtn = document.getElementById('preview-desktop');
const mobileBtn = document.getElementById('preview-mobile');
const publishedList = document.getElementById('published-list');
const draftList = document.getElementById('draft-list');

const richTextEditor = document.getElementById('rich-text-editor');
const richTextTarget = document.getElementById('rich-text-target');
const rtTitle = document.getElementById('rt-title');
const rtDescription = document.getElementById('rt-description');
const rtBody = document.getElementById('rt-body');
const rtReferences = document.getElementById('rt-references');
const rtAddRef = document.getElementById('rt-add-ref');

let selectedRichTextId = null;

const metaFields = {
  slug: document.getElementById('meta-slug'),
  title: document.getElementById('meta-title'),
  subtitle: document.getElementById('meta-subtitle'),
  description: document.getElementById('meta-description'),
  date: document.getElementById('meta-date'),
  theme: document.getElementById('meta-theme'),
  sources: document.getElementById('meta-sources')
};

const requiredElements = [
  editor,
  previewRoot,
  blockList,
  adminMessage,
  previewFrame,
  desktopBtn,
  mobileBtn,
  publishedList,
  draftList,
  richTextEditor,
  richTextTarget,
  rtTitle,
  rtDescription,
  rtBody,
  rtReferences,
  rtAddRef,
  ...Object.values(metaFields)
];

if (requiredElements.some((el) => !el)) {
  document.body.innerHTML = '<main class="admin-init-error"><h1>Admin initialization failed</h1><p>Required admin elements are missing. Check admin/index.html IDs.</p></main>';
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
    },
    {
      id: 'rich-text-1',
      type: 'rich-text',
      sectionId: 'details',
      navLabel: '상세분석',
      visibleInNav: true,
      title: '상세 분석',
      description: '핵심 배경 정보',
      body: '<p>여기에 본문을 입력하세요.</p>',
      references: [],
      styleVariant: 'default',
      order: 2
    }
  ]
};

function setMessage(text, type = 'success') {
  adminMessage.textContent = text;
  adminMessage.className = `admin-message admin-message--${type}`;
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

function syncMetaFromReport(report) {
  metaFields.slug.value = report.slug ?? '';
  metaFields.title.value = report.title ?? '';
  metaFields.subtitle.value = report.subtitle ?? '';
  metaFields.description.value = report.description ?? '';
  metaFields.date.value = report.date ?? '';
  metaFields.theme.value = report.theme ?? '';
  metaFields.sources.value = (report.sources ?? []).join(', ');
}

function setReport(report) {
  writeEditorJson(report);
  renderAll();
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
    setMessage('JSON 파싱 오류: 기본 정보 반영 실패', 'error');
  }
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

  if (type === 'rich-text') {
    block.body = '<p>본문을 입력하세요.</p>';
    block.references = [];
  }

  report.blocks = [...(report.blocks ?? []), block];
  normalizeOrder(report);
  setReport(report);
}

function deleteBlock(blockId) {
  const report = readEditorJson();
  report.blocks = (report.blocks ?? []).filter((block) => block.id !== blockId);
  if (selectedRichTextId === blockId) selectedRichTextId = null;
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

function applyRichTextSelection(blockId) {
  selectedRichTextId = blockId;
  renderRichTextEditor();
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

    if (block.type === 'rich-text') {
      const edit = document.createElement('button');
      edit.textContent = selectedRichTextId === block.id ? '편집중' : '편집';
      edit.className = `admin-btn admin-btn--small ${selectedRichTextId === block.id ? 'admin-btn--active' : ''}`;
      edit.addEventListener('click', () => applyRichTextSelection(block.id));
      actions.append(edit);
    }

    actions.append(up, down, remove);
    li.append(row, meta, actions);
    blockList.append(li);
  }
}

function getSelectedRichTextBlock(report) {
  if (!selectedRichTextId) return null;
  return (report.blocks ?? []).find((block) => block.id === selectedRichTextId && block.type === 'rich-text') ?? null;
}

function updateSelectedRichText(mutator) {
  const report = readEditorJson();
  const block = getSelectedRichTextBlock(report);
  if (!block) return;
  mutator(block);
  writeEditorJson(report);
  renderAll();
}

function renderReferenceRows(references = []) {
  rtReferences.innerHTML = '';
  references.forEach((ref, idx) => {
    const row = document.createElement('div');
    row.className = 'admin-ref-item';
    row.innerHTML = `
      <label class="admin-field">label <input data-ref-key="label" data-ref-idx="${idx}" value="${ref.label ?? ''}" /></label>
      <label class="admin-field">url <input data-ref-key="url" data-ref-idx="${idx}" value="${ref.url ?? ''}" placeholder="https://..." /></label>
    `;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'admin-btn admin-btn--small admin-btn--danger';
    remove.textContent = 'reference 삭제';
    remove.addEventListener('click', () => {
      updateSelectedRichText((block) => {
        block.references = (block.references ?? []).filter((_, i) => i !== idx);
      });
    });

    row.append(remove);
    rtReferences.append(row);
  });
}

function renderRichTextEditor() {
  const report = readEditorJson();
  const block = getSelectedRichTextBlock(report);
  if (!block) {
    richTextEditor.hidden = true;
    richTextTarget.textContent = '선택된 블록 없음';
    return;
  }

  richTextEditor.hidden = false;
  richTextTarget.textContent = block.id;
  rtTitle.value = block.title ?? '';
  rtDescription.value = block.description ?? '';
  rtBody.value = block.body ?? block.content ?? '';
  renderReferenceRows(block.references ?? []);
}

function renderDraftList() {
  draftList.innerHTML = '';
  const slugs = JSON.parse(localStorage.getItem(DRAFT_INDEX_KEY) ?? '[]');
  if (slugs.length === 0) {
    draftList.innerHTML = '<li class="admin-list-empty">저장된 local draft가 없습니다.</li>';
    return;
  }

  for (const slug of slugs) {
    const li = document.createElement('li');
    li.className = 'admin-list-item';
    li.innerHTML = `<span>${slug}</span>`;

    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'admin-btn admin-btn--small';
    load.textContent = '불러오기';
    load.addEventListener('click', () => {
      const text = localStorage.getItem(`${DRAFT_ITEM_PREFIX}${slug}`);
      if (!text) {
        setMessage(`초안(${slug})을 찾을 수 없습니다.`, 'error');
        return;
      }
      editor.value = text;
      renderAll();
      setMessage(`초안(${slug})을 불러왔습니다.`, 'success');
    });

    li.append(load);
    draftList.append(li);
  }
}

async function renderPublishedList() {
  publishedList.innerHTML = '<li class="admin-list-empty">published 목록 로딩 중...</li>';
  const candidates = ['middle-east-2025', 'middle-east-war-2026', 'tesla-weekly'];

  const items = [];
  for (const slug of candidates) {
    try {
      const res = await fetch(`../content/reports/${slug}.json`, { cache: 'no-store' });
      if (!res.ok) continue;
      const report = await res.json();
      items.push({ slug: report.slug, title: report.title });
    } catch {
      // ignore individual fetch error
    }
  }

  if (items.length === 0) {
    publishedList.innerHTML = '<li class="admin-list-empty">published report를 찾지 못했습니다.</li>';
    return;
  }

  publishedList.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'admin-list-item';
    li.innerHTML = `<span><strong>${item.title}</strong><small>${item.slug}</small></span>`;
    publishedList.append(li);
  }
}

function renderAll() {
  try {
    const report = readEditorJson();
    syncMetaFromReport(report);
    renderBlockList(report);
    renderRichTextEditor();

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

rtTitle.addEventListener('input', () => {
  updateSelectedRichText((block) => {
    block.title = rtTitle.value;
  });
});

rtDescription.addEventListener('input', () => {
  updateSelectedRichText((block) => {
    block.description = rtDescription.value;
  });
});

rtBody.addEventListener('input', () => {
  updateSelectedRichText((block) => {
    block.body = rtBody.value;
  });
});

rtReferences.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const idx = Number(target.dataset.refIdx);
  const key = target.dataset.refKey;
  if (Number.isNaN(idx) || !key) return;

  updateSelectedRichText((block) => {
    const refs = [...(block.references ?? [])];
    refs[idx] = { ...(refs[idx] ?? {}), [key]: target.value };
    block.references = refs;
  });
});

rtAddRef.addEventListener('click', () => {
  updateSelectedRichText((block) => {
    block.references = [...(block.references ?? []), { label: '', url: '' }];
  });
});

document.getElementById('add-block').addEventListener('click', () => {
  addBlock(document.getElementById('new-block-type').value);
});

document.getElementById('new-report').addEventListener('click', () => {
  selectedRichTextId = null;
  setReport(structuredClone(defaultReport));
  setMessage('새 리포트 초안을 생성했습니다.', 'success');
});

document.getElementById('save-draft').addEventListener('click', () => {
  const report = readEditorJson();
  const slug = report.slug?.trim() || 'untitled-draft';
  localStorage.setItem(STORAGE_KEY, editor.value);
  localStorage.setItem(`${DRAFT_ITEM_PREFIX}${slug}`, editor.value);

  const index = new Set(JSON.parse(localStorage.getItem(DRAFT_INDEX_KEY) ?? '[]'));
  index.add(slug);
  localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify([...index]));

  renderDraftList();
  setMessage(`초안 저장 완료: browser localStorage (${slug})`, 'success');
});

document.getElementById('load-draft').addEventListener('click', () => {
  const draft = localStorage.getItem(STORAGE_KEY);
  if (!draft) {
    setMessage('저장된 기본 초안이 없습니다.', 'warning');
    return;
  }
  editor.value = draft;
  renderAll();
  setMessage('기본 초안을 불러왔습니다.', 'success');
});

document.getElementById('export-json').addEventListener('click', () => {
  const report = readEditorJson();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${report.slug || 'report'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  setMessage('발행용 JSON 파일을 내보냈습니다.', 'success');
});

document.getElementById('import-json').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  editor.value = await file.text();
  selectedRichTextId = null;
  renderAll();
  setMessage('JSON 파일을 불러왔습니다.', 'success');
});

document.getElementById('refresh-published').addEventListener('click', async () => {
  await renderPublishedList();
  setMessage('Published 목록을 갱신했습니다.', 'success');
});

document.getElementById('refresh-drafts').addEventListener('click', () => {
  renderDraftList();
  setMessage('Local draft 목록을 갱신했습니다.', 'success');
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
renderDraftList();
await renderPublishedList();
