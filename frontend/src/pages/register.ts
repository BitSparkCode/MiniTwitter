import { api, ApiError } from '../api/client';
import { setSession, navigate } from '../main';

export function renderRegister(): void {
  const page = document.getElementById('page')!;
  page.innerHTML = `
    <div class="auth-card">
      <h1>Create your account</h1>
      <div id="reg-msg" style="display:none"></div>
      <div class="field">
        <label>Username</label>
        <input type="text" id="reg-username" placeholder="Choose a username (3–50 chars)" autocomplete="username" />
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="reg-password" placeholder="At least 6 characters" autocomplete="new-password" />
      </div>
      <div class="field">
        <label>Confirm Password</label>
        <input type="password" id="reg-confirm" placeholder="Repeat your password" autocomplete="new-password" />
      </div>
      <button class="btn-primary" id="btn-register">Create account</button>
      <div class="switch-link">
        Already have an account? <a href="#login">Sign in</a>
      </div>
    </div>
  `;

  const usernameEl = page.querySelector<HTMLInputElement>('#reg-username')!;
  const passwordEl = page.querySelector<HTMLInputElement>('#reg-password')!;
  const confirmEl = page.querySelector<HTMLInputElement>('#reg-confirm')!;
  const msgEl = page.querySelector<HTMLElement>('#reg-msg')!;
  const btn = page.querySelector<HTMLButtonElement>('#btn-register')!;

  const showMsg = (msg: string, type: 'error' | 'success') => {
    msgEl.className = type === 'error' ? 'msg-error' : 'msg-success';
    msgEl.textContent = msg;
    msgEl.style.display = 'block';
  };

  const submit = async () => {
    const username = usernameEl.value.trim();
    const password = passwordEl.value;
    const confirm = confirmEl.value;

    if (!username || !password || !confirm) { showMsg('Please fill in all fields', 'error'); return; }
    if (password !== confirm) { showMsg('Passwords do not match', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Creating account…';
    msgEl.style.display = 'none';

    try {
      await api.auth.register(username, password);
      showMsg('Account created! Signing you in…', 'success');
      const { token } = await api.auth.login(username, password);
      localStorage.setItem('token', token);
      const me = await api.users.getMe();
      setSession(me);
      await navigate('profile');
    } catch (err) {
      showMsg(err instanceof ApiError ? err.message : 'Registration failed', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create account';
    }
  };

  btn.addEventListener('click', submit);
  [usernameEl, passwordEl, confirmEl].forEach((el) =>
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); })
  );

  usernameEl.focus();
}
