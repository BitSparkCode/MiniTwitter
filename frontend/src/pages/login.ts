import { api, ApiError } from '../api/client';
import { setSession, navigate } from '../main';

export function renderLogin(): void {
  const page = document.getElementById('page')!;
  page.innerHTML = `
    <div class="auth-card">
      <h1>Sign in to MiniTwitter</h1>
      <div id="login-error" style="display:none"></div>
      <div class="field">
        <label>Username</label>
        <input type="text" id="login-username" placeholder="Your username" autocomplete="username" />
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="login-password" placeholder="Your password" autocomplete="current-password" />
      </div>
      <button class="btn-primary" id="btn-login">Sign in</button>
      <div class="switch-link">
        Don't have an account? <a href="#register">Register</a>
      </div>
    </div>
  `;

  const usernameEl = page.querySelector<HTMLInputElement>('#login-username')!;
  const passwordEl = page.querySelector<HTMLInputElement>('#login-password')!;
  const errorEl = page.querySelector<HTMLElement>('#login-error')!;
  const btn = page.querySelector<HTMLButtonElement>('#btn-login')!;

  const showError = (msg: string) => {
    errorEl.className = 'msg-error';
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  };

  const submit = async () => {
    const username = usernameEl.value.trim();
    const password = passwordEl.value;
    if (!username || !password) { showError('Please fill in all fields'); return; }

    btn.disabled = true;
    btn.textContent = 'Signing in…';
    errorEl.style.display = 'none';

    try {
      const { token } = await api.auth.login(username, password);
      localStorage.setItem('token', token);
      const me = await api.users.getMe();
      setSession(me);
      await navigate('feed');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  };

  btn.addEventListener('click', submit);
  [usernameEl, passwordEl].forEach((el) =>
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); })
  );

  usernameEl.focus();
}
