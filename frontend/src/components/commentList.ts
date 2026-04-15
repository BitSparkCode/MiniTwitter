import { api, Comment, ApiError } from '../api/client';
import { getSession } from '../main';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function buildCommentHTML(c: Comment, canModify: boolean, username = `User #${c.userId}`): string {
  return `
    <div class="comment-item" data-comment-id="${c.id}">
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-author" data-user-id="${c.userId}">@${escapeHtml(username)}</span>
          <span class="comment-time">${timeAgo(c.createdAt)}</span>
        </div>
        <div class="comment-content" id="comment-content-${c.id}">${escapeHtml(c.content)}</div>
        <div class="comment-edit-area" id="comment-edit-${c.id}" style="display:none">
          <textarea class="comment-edit-input" rows="2">${escapeHtml(c.content)}</textarea>
          <div class="edit-actions">
            <button class="btn-primary btn-save-comment" style="font-size:12px;padding:4px 12px">Save</button>
            <button class="btn-ghost btn-cancel-edit" style="font-size:12px;padding:4px 12px">Cancel</button>
          </div>
        </div>
        ${canModify ? `
        <div class="comment-actions">
          <button class="btn-ghost btn-edit-comment" style="font-size:12px;padding:3px 10px">Edit</button>
          <button class="btn-danger btn-delete-comment" style="font-size:12px;padding:3px 10px">Delete</button>
        </div>` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function renderCommentList(
  container: HTMLElement,
  postId: number,
  onCountChange?: (delta: number) => void
): Promise<void> {
  const session = getSession();
  container.innerHTML = '<div class="spinner"></div>';

  let comments: Comment[];
  try {
    comments = await api.comments.getByPost(postId);
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">Failed to load comments.</p>';
    return;
  }

  const uniqueUserIds = [...new Set(comments.map((c) => c.userId))];
  const usernameMap = new Map<number, string>();
  await Promise.all(
    uniqueUserIds.map(async (id) => {
      try {
        const u = await api.users.getUser(id);
        usernameMap.set(id, u.username);
      } catch {
        usernameMap.set(id, `User #${id}`);
      }
    })
  );

  const listHTML = comments
    .map((c) => {
      const canModify =
        session !== null &&
        (c.userId === session.id || ['moderator', 'admin'].includes(session.role));
      return buildCommentHTML(c, canModify, usernameMap.get(c.userId));
    })
    .join('');

  const composeHTML = session
    ? `<div class="comment-compose">
        <input type="text" placeholder="Add a comment…" id="new-comment-${postId}" />
        <button class="btn-primary" id="submit-comment-${postId}" style="white-space:nowrap">Post</button>
       </div>`
    : '';

  container.innerHTML = listHTML + composeHTML;

  if (session) {
    const input = container.querySelector<HTMLInputElement>(`#new-comment-${postId}`)!;
    const btn = container.querySelector<HTMLButtonElement>(`#submit-comment-${postId}`)!;

    const submitComment = async () => {
      const text = input.value.trim();
      if (!text) return;
      btn.disabled = true;
      try {
        const c = await api.comments.create(postId, text);
        input.value = '';
        const canModify = c.userId === session.id;
        const div = document.createElement('div');
        div.innerHTML = buildCommentHTML(c, canModify, session.username);
        const commentEl = div.firstElementChild as HTMLElement;
        container.insertBefore(commentEl, btn.parentElement!);
        attachCommentHandlers(commentEl, c.id, session, onCountChange);
        onCountChange?.(1);
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed to post comment');
      } finally {
        btn.disabled = false;
      }
    };

    btn.addEventListener('click', submitComment);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitComment(); });
  }

  container.querySelectorAll<HTMLElement>('.comment-item').forEach((el) => {
    const id = Number(el.dataset.commentId);
    attachCommentHandlers(el, id, session, onCountChange);
  });
}

function attachCommentHandlers(
  el: HTMLElement,
  commentId: number,
  session: ReturnType<typeof getSession>,
  onCountChange?: (delta: number) => void
): void {
  el.querySelector('.comment-author')?.addEventListener('click', () => {
    const userId = (el.querySelector('.comment-author') as HTMLElement).dataset.userId;
    if (userId) window.location.hash = `profile/${userId}`;
  });

  el.querySelector('.btn-edit-comment')?.addEventListener('click', () => {
    el.querySelector(`#comment-content-${commentId}`)!.setAttribute('style', 'display:none');
    el.querySelector(`#comment-edit-${commentId}`)!.removeAttribute('style');
    (el.querySelector('.btn-edit-comment') as HTMLElement).style.display = 'none';
  });

  el.querySelector('.btn-cancel-edit')?.addEventListener('click', () => {
    el.querySelector(`#comment-content-${commentId}`)!.removeAttribute('style');
    el.querySelector(`#comment-edit-${commentId}`)!.setAttribute('style', 'display:none');
    const editBtn = el.querySelector<HTMLElement>('.btn-edit-comment');
    if (editBtn) editBtn.style.display = '';
  });

  el.querySelector('.btn-save-comment')?.addEventListener('click', async () => {
    const ta = el.querySelector<HTMLTextAreaElement>('.comment-edit-input')!;
    const text = ta.value.trim();
    if (!text) return;
    try {
      const updated = await api.comments.update(commentId, text);
      el.querySelector(`#comment-content-${commentId}`)!.textContent = updated.content;
      el.querySelector(`#comment-content-${commentId}`)!.removeAttribute('style');
      el.querySelector(`#comment-edit-${commentId}`)!.setAttribute('style', 'display:none');
      const editBtn = el.querySelector<HTMLElement>('.btn-edit-comment');
      if (editBtn) editBtn.style.display = '';
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update');
    }
  });

  el.querySelector('.btn-delete-comment')?.addEventListener('click', async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.comments.delete(commentId);
      el.remove();
      onCountChange?.(-1);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete');
    }
  });

  void session;
}
