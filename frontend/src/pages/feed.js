import { api, ApiError } from '../api/client';
import { getSession } from '../main';
import { createPostCard } from '../components/postCard';
export async function renderFeed() {
    const page = document.getElementById('page');
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
    <div class="feed-context">
      <span class="feed-context-icon">🌐</span>
      <span class="feed-context-label">All posts &mdash; from everyone</span>
    </div>
    <div id="feed-list"><div class="spinner"></div></div>
  `;
    if (session) {
        const textarea = page.querySelector('#compose-input');
        const charCount = page.querySelector('#char-count');
        const postBtn = page.querySelector('#btn-post');
        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            charCount.textContent = `${len} / 280`;
            charCount.className = 'char-count' + (len > 260 ? ' warn' : '') + (len > 280 ? ' over' : '');
            postBtn.disabled = len === 0 || len > 280;
        });
        postBtn.addEventListener('click', async () => {
            const content = textarea.value.trim();
            if (!content || content.length > 280)
                return;
            postBtn.disabled = true;
            try {
                const post = await api.posts.create(content);
                textarea.value = '';
                charCount.textContent = '0 / 280';
                postBtn.disabled = true;
                const card = createPostCard({ post, username: session.username });
                const list = document.getElementById('feed-list');
                list.insertBefore(card, list.firstChild);
            }
            catch (err) {
                alert(err instanceof ApiError ? err.message : 'Failed to create post');
                postBtn.disabled = false;
            }
        });
    }
    const feedList = document.getElementById('feed-list');
    let posts;
    try {
        posts = await api.posts.getAll();
    }
    catch {
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
    const uniqueUserIds = [...new Set(posts.map((p) => p.userId))];
    const usernameMap = new Map();
    await Promise.all(uniqueUserIds.map(async (id) => {
        try {
            const u = await api.users.getUser(id);
            usernameMap.set(id, u.username);
        }
        catch {
            usernameMap.set(id, `User #${id}`);
        }
    }));
    feedList.innerHTML = '';
    posts.forEach((post) => {
        const card = createPostCard({
            post,
            username: usernameMap.get(post.userId) ?? `User #${post.userId}`,
        });
        feedList.appendChild(card);
    });
}
