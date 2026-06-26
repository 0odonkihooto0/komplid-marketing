import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestTemplateDownload, TemplateDownloadError } from './template-download';

const payload = {
  slug: 'aosr',
  filename: 'shablon-aosr-344pr.docx',
  email: 'user@example.com',
  role: 'pto',
  newsletterConsent: true,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestTemplateDownload', () => {
  it('возвращает downloadUrl при успешном ответе', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ downloadUrl: '/shablony-files/shablon-aosr-344pr.docx' }),
      } as Response),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await requestTemplateDownload(payload);

    expect(result.downloadUrl).toBe('/shablony-files/shablon-aosr-344pr.docx');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/template-download',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('бросает TemplateDownloadError с кодом при не-OK ответе', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response)),
    );

    await expect(requestTemplateDownload(payload)).rejects.toBeInstanceOf(TemplateDownloadError);
    await expect(requestTemplateDownload(payload)).rejects.toMatchObject({ status: 500 });
  });

  it('пробрасывает сетевую ошибку fetch (не TemplateDownloadError)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    const err = await requestTemplateDownload(payload).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TypeError);
    expect(err).not.toBeInstanceOf(TemplateDownloadError);
  });
});
