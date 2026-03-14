function toSlug(raw = '') {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function preparePublish(report, validateReportFn) {
  const errors = [];
  const slug = toSlug(report?.slug ?? '');

  if (!slug) {
    errors.push('slug은 필수이며 URL-safe 형식이어야 합니다.');
  }

  if (!report?.title?.trim()) {
    errors.push('title은 필수입니다.');
  }

  const baseErrors = validateReportFn?.(report) ?? [];
  errors.push(...baseErrors);

  for (const block of report?.blocks ?? []) {
    if (block.type === 'rich-text') {
      for (const [idx, ref] of (block.references ?? []).entries()) {
        if (!isValidUrl(ref?.url ?? '')) {
          errors.push(`rich-text block(${block.id ?? 'unknown'}) reference[${idx}] URL은 http/https 형식이어야 합니다.`);
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    slug,
    paths: {
      content: `content/reports/${slug || '{slug}'}.json`,
      report: `/reports/${slug || '{slug}'}/`
    },
    fileName: `${slug || 'report'}.json`
  };
}

export function exportPublishJson(report) {
  const slug = toSlug(report?.slug ?? 'report');
  const payload = { ...report, slug };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug || 'report'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  return a.download;
}

export function getPublishStatus(slug, publishedSlugs = []) {
  const normalized = toSlug(slug);
  return {
    slug: normalized,
    isPublished: Boolean(normalized && publishedSlugs.includes(normalized))
  };
}

export async function publishReport(report, adapter, validateReportFn) {
  const prepared = preparePublish(report, validateReportFn);
  if (!prepared.ok) {
    return {
      ok: false,
      message: `출판 준비가 필요합니다. 오류 ${prepared.errors.length}건`,
      prepared
    };
  }

  return adapter.publish(report, prepared);
}

export function createManualPublishAdapter() {
  return {
    name: 'manual-download',
    async publish(report, prepared) {
      const fileName = exportPublishJson(report);
      return {
        ok: true,
        prepared,
        fileName,
        message:
          `발행용 JSON 다운로드 완료 (${fileName}). 다음 단계: ${prepared.paths.content} 경로에 파일 반영 → commit/push → build/deploy 후 ${prepared.paths.report} 공개 확인.`
      };
    }
  };
}
