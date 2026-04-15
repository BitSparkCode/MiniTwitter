import { api, UserMe } from './api/client';
import { renderNavbar } from './components/navbar';
import { renderLogin } from './pages/login';
import { renderRegister } from './pages/register';
import { renderFeed } from './pages/feed';
import { renderProfile } from './pages/profile';

export interface Session {
  id: number;
  username: string;
  role: string;
}

let _session: Session | null = null;
let _navigating = false;

export function getSession(): Session | null {
  return _session;
}

export function setSession(user: { id: number; username: string; role: string }): void {
  _session = { id: user.id, username: user.username, role: user.role };
  renderNavbar();
}

export function clearSession(): void {
  _session = null;
  localStorage.removeItem('token');
  renderNavbar();
}

async function tryRestoreSession(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const me: UserMe = await api.users.getMe();
    _session = { id: me.id, username: me.username, role: me.role };
  } catch {
    localStorage.removeItem('token');
  }
}

export async function navigate(path: string): Promise<void> {
  _navigating = true;
  window.location.hash = path;
  try {
    await route();
  } finally {
    _navigating = false;
  }
}

async function route(): Promise<void> {
  const hash = window.location.hash.slice(1) || 'feed';
  const [page, param] = hash.split('/');

  renderNavbar();

  const publicPages = ['login', 'register'];
  if (!_session && !publicPages.includes(page)) {
    window.location.hash = 'login';
    renderLogin();
    return;
  }
  if (_session && (page === 'login' || page === 'register')) {
    window.location.hash = 'feed';
    await renderFeed();
    return;
  }

  switch (page) {
    case 'login':
      renderLogin();
      break;
    case 'register':
      renderRegister();
      break;
    case 'feed':
      await renderFeed();
      break;
    case 'profile':
      await renderProfile(param ? Number(param) : undefined);
      break;
    default:
      await renderFeed();
  }
}

async function init(): Promise<void> {
  await tryRestoreSession();
  await route();
}

window.addEventListener('hashchange', () => { if (!_navigating) void route(); });

void init();
