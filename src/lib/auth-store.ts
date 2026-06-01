import { promises as fs } from 'node:fs';
import path from 'node:path';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type AuthStoreFile = {
  users: AuthUser[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const storeFilePath = path.join(process.cwd(), 'data', 'auth-users.json');

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createId(email: string) {
  return `user-${Buffer.from(email).toString('hex').slice(0, 12)}`;
}

function defaultStore(): AuthStoreFile {
  return {
    users: [
      {
        id: 'user-demo',
        name: 'Solomon Leek',
        email: 'solomon@elevanda.com',
        password: 'Elevanda6!',
      },
    ],
  };
}

let storeCache: AuthStoreFile | null = null;
let storeLoadPromise: Promise<AuthStoreFile> | null = null;

export function isValidEmail(email: string) {
  return emailPattern.test(normalizeEmail(email));
}

async function ensureStoreFile() {
  try {
    await fs.access(storeFilePath);
  } catch {
    await fs.mkdir(path.dirname(storeFilePath), { recursive: true });
    await fs.writeFile(storeFilePath, JSON.stringify(defaultStore(), null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStoreFile();
  const raw = await fs.readFile(storeFilePath, 'utf8');
  const parsed = JSON.parse(raw) as Partial<AuthStoreFile>;
  const users = Array.isArray(parsed.users) ? parsed.users : [];

  return { users };
}

async function writeStore(store: AuthStoreFile) {
  await fs.mkdir(path.dirname(storeFilePath), { recursive: true });
  await fs.writeFile(storeFilePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

async function loadStore() {
  if (storeCache) {
    return storeCache;
  }

  if (!storeLoadPromise) {
    storeLoadPromise = readStore().then((store) => {
      storeCache = store;
      return store;
    });
  }

  return storeLoadPromise;
}

export async function getUserByEmail(email: string) {
  const store = await loadStore();
  return store.users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

export async function createUser(user: { email: string; password: string; name: string }) {
  const email = normalizeEmail(user.email);

  if (!isValidEmail(email)) {
    throw new Error('invalid_email');
  }

  const store = await loadStore();

  if (store.users.some((entry) => normalizeEmail(entry.email) === email)) {
    throw new Error('already_exists');
  }

  const created: AuthUser = {
    id: createId(email),
    name: user.name.trim() || 'New User',
    email,
    password: user.password,
  };

  store.users.push(created);
  await writeStore(store);

  return created;
}
