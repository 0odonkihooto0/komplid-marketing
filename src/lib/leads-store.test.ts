import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { countWaitlistLeads } from './leads-store';

/**
 * Счётчик мест в бете показывается на главной, поэтому ошибаться ему нельзя:
 * завышенное «занято» — выдуманный дефицит (CLAUDE.md §21).
 */
describe('countWaitlistLeads', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'leads-'));
    process.env.LEADS_DATA_DIR = dir;
  });

  afterEach(async () => {
    delete process.env.LEADS_DATA_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  async function writeLeads(lines: string): Promise<void> {
    await writeFile(path.join(dir, 'leads.jsonl'), lines, 'utf8');
  }

  it('возвращает ноль, если файла ещё нет', async () => {
    expect(await countWaitlistLeads()).toBe(0);
  });

  it('считает записи', async () => {
    await writeLeads(
      '{"email":"a@example.ru","source":"homepage"}\n' +
        '{"email":"b@example.ru","source":"pricing"}\n',
    );
    expect(await countWaitlistLeads()).toBe(2);
  });

  it('не считает один адрес дважды', async () => {
    await writeLeads(
      '{"email":"a@example.ru","source":"homepage"}\n' +
        '{"email":"A@Example.RU ","source":"pto"}\n',
    );
    expect(await countWaitlistLeads()).toBe(1);
  });

  it('пропускает битые строки, а не падает на них', async () => {
    await writeLeads(
      '{"email":"a@example.ru"}\n' +
        'это не json\n' +
        '\n' +
        '{"source":"без почты"}\n' +
        '{"email":"b@example.ru"}\n',
    );
    expect(await countWaitlistLeads()).toBe(2);
  });
});
