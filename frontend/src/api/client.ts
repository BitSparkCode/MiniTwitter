const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth ? (authHeaders() as Record<string, string>) : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await res.json();
  if (!res.ok) {
    const raw = data?.error;
    const message = Array.isArray(raw)
      ? raw.map((e: { message?: string }) => e.message ?? String(e)).join(', ')
      : typeof raw === 'string' ? raw : 'Request failed';
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export const api = {
  auth: {
    register: (username: string, password: string) =>
      request<{ id: number; username: string; role: string }>(
        'POST', '/auth/register', { username, password }, false
      ),
    login: (username: string, password: string) =>
      request<{ token: string }>('POST', '/auth/login', { username, password }, false),
    logout: () => request<{ message: string }>('POST', '/auth/logout'),
  },

  posts: {
    getAll: () => request<Post[]>('GET', '/posts'),
    create: (content: string) => request<Post>('POST', '/posts', { content }),
    update: (id: number, content: string) => request<Post>('PUT', `/posts/${id}`, { content }),
    delete: (id: number) => request<void>('DELETE', `/posts/${id}`),
  },

  comments: {
    getByPost: (postId: number) => request<Comment[]>('GET', `/posts/${postId}/comments`),
    create: (postId: number, content: string) =>
      request<Comment>('POST', `/posts/${postId}/comments`, { content }),
    update: (id: number, content: string) =>
      request<Comment>('PUT', `/comments/${id}`, { content }),
    delete: (id: number) => request<void>('DELETE', `/comments/${id}`),
  },

  reactions: {
    upsert: (postId: number, type: 'like' | 'dislike') =>
      request<Reaction>('POST', `/posts/${postId}/reactions`, { type }),
    delete: (postId: number) => request<void>('DELETE', `/posts/${postId}/reactions`),
  },

  users: {
    getMe: () => request<UserMe>('GET', '/users/me'),
    updateMe: (username: string) => request<UserMe>('PUT', '/users/me', { username }),
    getActivity: (id: number) => request<{ posts: Post[]; comments: Comment[] }>('GET', `/users/${id}/activity`),
    lock: (id: number, isLocked: boolean) =>
      request<{ id: number; username: string; isLocked: boolean }>('PUT', `/users/${id}/lock`, { isLocked }),
    setRole: (id: number, role: string) =>
      request<{ id: number; username: string; role: string }>('PUT', `/users/${id}/role`, { role }),
  },
};

export interface Post {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: number;
  postId: number;
  userId: number;
  type: 'like' | 'dislike';
  createdAt: string;
}

export interface UserMe {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}
