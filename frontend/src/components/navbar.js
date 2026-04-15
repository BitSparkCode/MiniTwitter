import { getSession, clearSession } from '../main';
export function renderNavbar() {
    const nav = document.getElementById('navbar');
    const session = getSession();
    if (!session) {
        nav.innerHTML = `<span class="brand">� MiniTwitter</span><div class="nav-links"></div>`;
        return;
    }
    nav.innerHTML = `
    <span class="brand">� MiniTwitter</span>
    <div class="nav-links">
      <button data-nav="feed">Feed</button>
      <button data-nav="profile">@${session.username}</button>
      <button class="btn-logout" id="btn-logout">Logout</button>
    </div>
  `;
    nav.querySelectorAll('[data-nav]').forEach((btn) => {
        const page = btn.dataset.nav;
        if (window.location.hash === `#${page}`)
            btn.classList.add('active');
        btn.addEventListener('click', () => {
            window.location.hash = page;
        });
    });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        clearSession();
        window.location.hash = 'login';
    });
}
