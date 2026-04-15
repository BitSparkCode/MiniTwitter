import { getSession, clearSession, navigate } from '../main';

export function renderNavbar(): void {
  const nav = document.getElementById('navbar')!;
  const session = getSession();

  if (!session) {
    nav.innerHTML = `<span class="brand">🐣 MiniTwitter</span><div class="nav-links"></div>`;
    return;
  }

  nav.innerHTML = `
    <span class="brand">🐣 MiniTwitter</span>
    <div class="nav-links">
      <button data-nav="feed">Feed</button>
      <button data-nav="profile">@${session.username}</button>
      <button class="btn-logout" id="btn-logout">Logout</button>
    </div>
  `;

  nav.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((btn) => {
    const page = btn.dataset.nav!;
    if (window.location.hash === `#${page}`) btn.classList.add('active');
    btn.addEventListener('click', () => { void navigate(page); });
  });

  document.getElementById('btn-logout')!.addEventListener('click', () => {
    clearSession();
    window.location.hash = 'login';
  });
}
