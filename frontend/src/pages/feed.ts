import { api, Post, ApiError } from '../api/client';
import { getSession } from '../main';
import { createPostCard } from '../components/postCard';

export async function renderFeed(): Promise<void> {
  const page = document.getElementById('page')!;
  const session = getSession();

  page.innerHTML = `
    ${session ? `
    <div class="compose-box">
      <textarea id="compose-input" placeholder="What's on your mind? (max 280 chars)"></textarea>
      <div class="compose-footer">
        <span class="char-count" id="char-count">0 / 280</span>
        <button class="btn-primary" id="btn-post" disabled>Post</button>
      </div>
    </div>` : ''}
    <div id="feed-list"><div class="spinner"></div></div>
  `;

  if (session) {
    const textarea = page.querySelector<HTMLTextAreaElement>('#compose-input')!;
    const charCount = page.querySelector<HTMLElement>('#char-count')!;
    const postBtn = page.querySelector<HTMLButtonElement>('#btn-post')!;

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 280`;
      charCount.className = 'char-count' + (len > 260 ? ' warn' : '') + (len > 280 ? ' over' : '');
      postBtn.disabled = len === 0 || len > 280;
    });

    postBtn.addEventListener('click', async () => {
      const content = textarea.value.trim();
      if (!content || content.length > 280) return;
      postBtn.disabled = true;
      try {
        const post = await api.posts.create(content);
        textarea.value = '';
        charCount.textContent = '0 / 280';
        postBtn.disabled = true;
        const card = createPostCard({
          post,
          username: session.username,
        });
        const list = document.getElementById('feed-list')!;
        list.insertBefore(card, list.firstChild);
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'Failed to create post');
        postBtn.disabled = false;
      }
    });
  }

  const feedList = document.getElementById('feed-list')!;

  let posts: Post[];
  try {
    posts = await api.posts.getAll();
  } catch {
    feedList.innerHTML = `<div class="msg-error">Failed to load posts. Please try again.</div>`;
    return;
  }

  if (posts.length === 0) {
    feedList.innerHTML = `
      <div class="empty-state">
        <h3>No posts yet</h3>
        <p>Be the first to post something!</p>
      </div>`;
    return;
  }

  feedList.innerHTML = '';
  posts.forEach((post) => {
    const card = createPostCard({
      post,
      username: `User_${post.userId}`,
    });
    feedList.appendChild(card);
  });
}
