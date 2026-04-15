import { api, ApiError } from '../api/client';
import { getSession, setSession } from '../main';
import { createPostCard } from '../components/postCard';
import { timeAgo } from '../components/postCard';
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
export async function renderProfile(userId) {
    const page = document.getElementById('page');
    const session = getSession();
    const isOwnProfile = !userId || (session !== null && userId === session.id);
    const targetId = userId ?? session?.id;
    if (!targetId) {
        page.innerHTML = `<div class="msg-error">User not found.</div>`;
        return;
    }
    page.innerHTML = '<div class="spinner"></div>';
    let activity = { posts: [], comments: [] };
    let profileUser = {
        id: targetId,
        username: `User #${targetId}`,
        role: 'user',
        createdAt: new Date().toISOString(),
    };
    try {
        if (isOwnProfile && session) {
            const me = await api.users.getMe();
            profileUser = { ...me, createdAt: me.createdAt };
        }
        else {
            const u = await api.users.getUser(targetId);
            profileUser = { id: u.id, username: u.username, role: u.role, createdAt: u.createdAt };
        }
        activity = await api.users.getActivity(targetId);
    }
    catch {
        page.innerHTML = `<div class="msg-error">Failed to load profile.</div>`;
        return;
    }
    const roleBadge = `<span class="role-badge ${profileUser.role}">${profileUser.role}</span>`;
    const isAdmin = session?.role === 'admin';
    const isOtherUser = !isOwnProfile && session !== null;
    page.innerHTML = `
    <div class="profile-header">
      <div class="profile-name">@${escapeHtml(profileUser.username)}</div>
      ${roleBadge}
      ${isOwnProfile ? `
      <div class="profile-edit-form">
        <input type="text" id="new-username" placeholder="New username" value="${escapeHtml(profileUser.username)}" />
        <button class="btn-primary" id="btn-update-username" style="white-space:nowrap">Update</button>
      </div>
      <div id="profile-msg" style="margin-top:8px;display:none"></div>
      ` : ''}
      ${isAdmin && isOtherUser ? `
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-ghost" id="btn-lock">Toggle Lock</button>
        <select id="role-select" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:5px 10px;border-radius:6px;font-size:13px">
          <option value="user">user</option>
          <option value="moderator">moderator</option>
          <option value="admin">admin</option>
        </select>
        <button class="btn-ghost" id="btn-set-role">Set Role</button>
      </div>
      <div id="admin-msg" style="margin-top:8px;display:none"></div>
      ` : ''}
      <div class="profile-stats" style="margin-top:16px">
        <div class="profile-stat"><strong>${activity.posts.length}</strong> Posts</div>
        <div class="profile-stat"><strong>${activity.comments.length}</strong> Comments</div>
        <div class="profile-stat">Joined <strong>${timeAgo(profileUser.createdAt)}</strong></div>
      </div>
    </div>

    <div class="feed-context">
      <span class="feed-context-icon">${isOwnProfile ? '👤' : '🔍'}</span>
      <span class="feed-context-label">${isOwnProfile ? 'Your posts &amp; comments' : `Posts &amp; comments by @${escapeHtml(profileUser.username)}`}</span>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="posts">Posts</button>
      <button class="tab-btn" data-tab="comments">Comments</button>
    </div>
    <div id="tab-content"></div>
  `;
    const renderPosts = () => {
        const container = document.getElementById('tab-content');
        if (activity.posts.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>No posts yet</h3></div>`;
            return;
        }
        container.innerHTML = '';
        activity.posts.forEach((post) => {
            const card = createPostCard({ post, username: profileUser.username });
            container.appendChild(card);
        });
    };
    const renderComments = () => {
        const container = document.getElementById('tab-content');
        if (activity.comments.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>No comments yet</h3></div>`;
            return;
        }
        container.innerHTML = '';
        activity.comments.forEach((c) => {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.dataset.commentId = String(c.id);
            card.innerHTML = `
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">
          Comment on post #${c.postId} · ${timeAgo(c.createdAt)}
        </div>
        <div class="comment-body-text" style="font-size:14px;line-height:1.5">${escapeHtml(c.content)}</div>
        <div class="comment-edit-inline" style="display:none;margin-top:8px">
          <textarea class="comment-edit-ta" rows="2" style="width:100%;box-sizing:border-box">${escapeHtml(c.content)}</textarea>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button class="btn-primary btn-save-inline" style="font-size:12px;padding:4px 12px">Save</button>
            <button class="btn-ghost btn-cancel-inline" style="font-size:12px;padding:4px 12px">Cancel</button>
          </div>
        </div>
        ${isOwnProfile ? `
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="btn-ghost btn-edit-inline" style="font-size:12px;padding:3px 10px">Edit</button>
          <button class="btn-danger btn-delete-inline" style="font-size:12px;padding:3px 10px">Delete</button>
        </div>` : ''}
      `;
            if (isOwnProfile) {
                const bodyText = card.querySelector('.comment-body-text');
                const editArea = card.querySelector('.comment-edit-inline');
                const ta = card.querySelector('.comment-edit-ta');
                const editBtn = card.querySelector('.btn-edit-inline');
                const saveBtn = card.querySelector('.btn-save-inline');
                const cancelBtn = card.querySelector('.btn-cancel-inline');
                const deleteBtn = card.querySelector('.btn-delete-inline');
                editBtn.addEventListener('click', () => {
                    bodyText.style.display = 'none';
                    editArea.style.display = '';
                    editBtn.style.display = 'none';
                });
                cancelBtn.addEventListener('click', () => {
                    bodyText.style.display = '';
                    editArea.style.display = 'none';
                    editBtn.style.display = '';
                });
                saveBtn.addEventListener('click', async () => {
                    const text = ta.value.trim();
                    if (!text)
                        return;
                    try {
                        const updated = await api.comments.update(c.id, text);
                        c.content = updated.content;
                        bodyText.textContent = updated.content;
                        ta.value = updated.content;
                        bodyText.style.display = '';
                        editArea.style.display = 'none';
                        editBtn.style.display = '';
                    }
                    catch (err) {
                        alert(err instanceof ApiError ? err.message : 'Failed to update');
                    }
                });
                deleteBtn.addEventListener('click', async () => {
                    if (!confirm('Delete this comment?'))
                        return;
                    try {
                        await api.comments.delete(c.id);
                        card.remove();
                        activity.comments = activity.comments.filter((x) => x.id !== c.id);
                    }
                    catch (err) {
                        alert(err instanceof ApiError ? err.message : 'Failed to delete');
                    }
                });
            }
            container.appendChild(card);
        });
    };
    renderPosts();
    page.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            page.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.tab === 'posts')
                renderPosts();
            else
                renderComments();
        });
    });
    if (isOwnProfile) {
        const usernameInput = page.querySelector('#new-username');
        const updateBtn = page.querySelector('#btn-update-username');
        const msgEl = page.querySelector('#profile-msg');
        updateBtn.addEventListener('click', async () => {
            const val = usernameInput.value.trim();
            if (!val)
                return;
            updateBtn.disabled = true;
            try {
                const updated = await api.users.updateMe(val);
                setSession({ ...session, username: updated.username });
                usernameInput.value = updated.username;
                msgEl.className = 'msg-success';
                msgEl.textContent = `Username updated to @${updated.username}!`;
                msgEl.style.display = 'block';
                page.querySelector('.profile-name').textContent = `@${updated.username}`;
                setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
            }
            catch (err) {
                msgEl.className = 'msg-error';
                msgEl.textContent = err instanceof ApiError ? err.message : 'Failed to update';
                msgEl.style.display = 'block';
            }
            finally {
                updateBtn.disabled = false;
            }
        });
    }
    if (isAdmin && isOtherUser) {
        const adminMsg = page.querySelector('#admin-msg');
        const showAdminMsg = (msg, type) => {
            adminMsg.className = type === 'error' ? 'msg-error' : 'msg-success';
            adminMsg.textContent = msg;
            adminMsg.style.display = 'block';
            setTimeout(() => { adminMsg.style.display = 'none'; }, 3000);
        };
        page.querySelector('#btn-lock')?.addEventListener('click', async () => {
            try {
                const result = await api.users.lock(targetId, true);
                showAdminMsg(`User ${result.username} locked.`, 'success');
            }
            catch (err) {
                showAdminMsg(err instanceof ApiError ? err.message : 'Failed', 'error');
            }
        });
        page.querySelector('#btn-set-role')?.addEventListener('click', async () => {
            const role = page.querySelector('#role-select').value;
            try {
                const result = await api.users.setRole(targetId, role);
                showAdminMsg(`Role set to ${result.role}.`, 'success');
            }
            catch (err) {
                showAdminMsg(err instanceof ApiError ? err.message : 'Failed', 'error');
            }
        });
    }
}
