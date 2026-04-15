import { api, Post, Reaction, ApiError } from '../api/client';
import { getSession } from '../main';
import { renderCommentList } from './commentList';

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface PostCardOptions {
  post: Post;
  username: string;
  userReaction?: Reaction | null;
  likeCount?: number;
  dislikeCount?: number;
  onDeleted?: (postId: number) => void;
}

export function createPostCard(opts: PostCardOptions): HTMLElement {
  const { post, username } = opts;
  const session = getSession();
  const canModify =
    session !== null &&
    (post.userId === session.id || ['moderator', 'admin'].includes(session.role));

  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.postId = String(post.id);

  let likeCount = opts.likeCount ?? 0;
  let dislikeCount = opts.dislikeCount ?? 0;
  let userReaction = opts.userReaction ?? null;

  const render = () => {
    const activeLike = userReaction?.type === 'like' ? 'active-like' : '';
    const activeDislike = userReaction?.type === 'dislike' ? 'active-dislike' : '';

    card.innerHTML = `
      <div class="post-header">
        <div class="post-meta">
          <span class="post-author" data-user-id="${post.userId}">@${escapeHtml(username)}</span>
          <span class="post-time">${timeAgo(post.createdAt)}</span>
        </div>
        ${canModify ? `
        <div style="display:flex;gap:4px">
          <button class="btn-ghost btn-edit-post" style="font-size:12px;padding:4px 10px">Edit</button>
          <button class="btn-danger btn-delete-post" style="font-size:12px;padding:4px 10px">Delete</button>
        </div>` : ''}
      </div>
      <div class="post-content" id="post-content-${post.id}">${escapeHtml(post.content)}</div>
      <div class="post-edit-area" id="post-edit-${post.id}" style="display:none">
        <textarea id="post-edit-input-${post.id}" rows="3">${escapeHtml(post.content)}</textarea>
        <div class="edit-actions">
          <button class="btn-primary btn-save-post" style="font-size:12px;padding:5px 14px">Save</button>
          <button class="btn-ghost btn-cancel-post" style="font-size:12px;padding:5px 14px">Cancel</button>
        </div>
      </div>
      <div class="post-actions">
        ${session ? `
        <button class="btn-reaction ${activeLike}" id="btn-like-${post.id}">👍 ${likeCount}</button>
        <button class="btn-reaction ${activeDislike}" id="btn-dislike-${post.id}">👎 ${dislikeCount}</button>
        ` : `<span style="font-size:13px;color:var(--text-muted)">👍 ${likeCount} &nbsp; 👎 ${dislikeCount}</span>`}
        ${session ? `<button class="btn-comment-toggle" id="btn-comments-${post.id}">💬 Comments</button>` : ''}
      </div>
      <div class="comments-section" id="comments-section-${post.id}" style="display:none"></div>
    `;

    attachHandlers();
  };

  const attachHandlers = () => {
    card.querySelector('.post-author')?.addEventListener('click', () => {
      window.location.hash = `profile/${post.userId}`;
    });

    card.querySelector('.btn-edit-post')?.addEventListener('click', () => {
      card.querySelector(`#post-content-${post.id}`)!.setAttribute('style', 'display:none');
      card.querySelector(`#post-edit-${post.id}`)!.removeAttribute('style');
    });

    card.querySelector('.btn-cancel-post')?.addEventListener('click', () => {
      card.querySelector(`#post-content-${post.id}`)!.removeAttribute('style');
      card.querySelector(`#post-edit-${post.id}`)!.setAttribute('style', 'display:none');
    });

    card.querySelector('.btn-save-post')?.addEventListener('click', async () => {
      const ta = card.querySelector<HTMLTextAreaElement>(`#post-edit-input-${post.id}`)!;
      const text = ta.value.trim();
      if (!text) return;
      try {
        const updated = await api.posts.update(post.id, text);
        post.content = updated.content;
        card.querySelector(`#post-content-${post.id}`)!.textContent = updated.content;
        card.querySelector(`#post-content-${post.id}`)!.removeAttribute('style');
        card.querySelector(`#post-edit-${post.id}`)!.setAttribute('style', 'display:none');
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed to update post');
      }
    });

    card.querySelector('.btn-delete-post')?.addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      try {
        await api.posts.delete(post.id);
        card.remove();
        opts.onDeleted?.(post.id);
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed to delete post');
      }
    });

    card.querySelector(`#btn-like-${post.id}`)?.addEventListener('click', async () => {
      try {
        if (userReaction?.type === 'like') {
          await api.reactions.delete(post.id);
          likeCount--;
          userReaction = null;
        } else {
          if (userReaction?.type === 'dislike') dislikeCount--;
          const r = await api.reactions.upsert(post.id, 'like');
          likeCount++;
          userReaction = r;
        }
        render();
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed');
      }
    });

    card.querySelector(`#btn-dislike-${post.id}`)?.addEventListener('click', async () => {
      try {
        if (userReaction?.type === 'dislike') {
          await api.reactions.delete(post.id);
          dislikeCount--;
          userReaction = null;
        } else {
          if (userReaction?.type === 'like') likeCount--;
          const r = await api.reactions.upsert(post.id, 'dislike');
          dislikeCount++;
          userReaction = r;
        }
        render();
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed');
      }
    });

    let commentsOpen = false;
    card.querySelector(`#btn-comments-${post.id}`)?.addEventListener('click', () => {
      const section = card.querySelector<HTMLElement>(`#comments-section-${post.id}`)!;
      commentsOpen = !commentsOpen;
      if (commentsOpen) {
        section.style.display = 'block';
        renderCommentList(section, post.id);
      } else {
        section.style.display = 'none';
      }
    });
  };

  render();
  return card;
}
