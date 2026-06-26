import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

afterEach(() => {
  vi.unstubAllGlobals();
});

// Минимальный fake DOM для ветки execCommand: textarea с select() и
// document с createElement/body/execCommand.
function stubExecCommandDom(execResult: boolean | (() => boolean)) {
  const removed: unknown[] = [];
  const body = {
    appendChild: vi.fn(),
    removeChild: vi.fn((el: unknown) => removed.push(el)),
  };
  const execCommand = vi.fn(() =>
    typeof execResult === 'function' ? execResult() : execResult,
  );
  vi.stubGlobal('document', {
    createElement: () => ({ value: '', style: {}, setAttribute: vi.fn(), select: vi.fn() }),
    body,
    execCommand,
  });
  return { body, execCommand, removed };
}

describe('copyToClipboard', () => {
  it('использует navigator.clipboard, когда он доступен', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    expect(await copyToClipboard('https://komplid.ru')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('https://komplid.ru');
  });

  it('откатывается на execCommand, если writeText бросает (incognito/нет прав)', async () => {
    const writeText = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { execCommand, body } = stubExecCommandDom(true);

    expect(await copyToClipboard('текст')).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    // временный textarea удаляется даже при успехе
    expect(body.removeChild).toHaveBeenCalledTimes(1);
  });

  it('откатывается на execCommand, если clipboard API отсутствует', async () => {
    vi.stubGlobal('navigator', {});
    const { execCommand } = stubExecCommandDom(true);

    expect(await copyToClipboard('x')).toBe(true);
    expect(execCommand).toHaveBeenCalled();
  });

  it('возвращает false, если execCommand вернул false', async () => {
    vi.stubGlobal('navigator', {});
    stubExecCommandDom(false);

    expect(await copyToClipboard('x')).toBe(false);
  });

  it('не бросает и чистит textarea, если execCommand бросает', async () => {
    vi.stubGlobal('navigator', {});
    const { execCommand, body } = stubExecCommandDom(() => {
      throw new Error('execCommand failed');
    });

    expect(await copyToClipboard('x')).toBe(false);
    expect(execCommand).toHaveBeenCalled();
    expect(body.removeChild).toHaveBeenCalledTimes(1);
  });

  it('возвращает false, когда нет ни clipboard, ни document', async () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', undefined);

    expect(await copyToClipboard('x')).toBe(false);
  });
});
