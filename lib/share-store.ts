import { promises as fs } from 'fs';
import path from 'path';
import { customAlphabet } from 'nanoid';

const ALPHABET = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const TOKEN_LEN = 8;
const newToken = customAlphabet(ALPHABET, TOKEN_LEN);

function storeDir(): string {
  const env = process.env.SHARE_STORE_DIR;
  if (env && env.trim()) return env.trim();
  return path.join(process.cwd(), '.share-store');
}

function safeTokenOrNull(token: string): string | null {
  if (!/^[0-9a-zA-Z]{6,12}$/.test(token)) return null;
  return token;
}

export async function ensureStoreReady(): Promise<void> {
  await fs.mkdir(storeDir(), { recursive: true });
}

export async function writeShare(payload: unknown): Promise<string> {
  await ensureStoreReady();
  for (let i = 0; i < 5; i++) {
    const token = newToken();
    const fp = path.join(storeDir(), `${token}.json`);
    try {
      await fs.writeFile(fp, JSON.stringify(payload), { flag: 'wx' });
      return token;
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === 'EEXIST') continue;
      throw err;
    }
  }
  throw new Error('failed to allocate unique share token after 5 attempts');
}

export async function readShare(token: string): Promise<unknown | null> {
  const safe = safeTokenOrNull(token);
  if (!safe) return null;
  const fp = path.join(storeDir(), `${safe}.json`);
  try {
    const raw = await fs.readFile(fp, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
