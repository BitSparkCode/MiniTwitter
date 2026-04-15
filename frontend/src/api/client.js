const BASE = '/api';
function getToken() {
    return localStorage.getItem('token');
}
function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
async function request(method, path, body, auth = true) {
    const headers = {
        'Content-Type': 'application/json',
        ...(auth ? authHeaders() : {}),
    };
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204)
        return undefined;
    const data = await res.json();
    if (!res.ok) {
        const raw = data?.error;
        const message = Array.isArray(raw)
            ? raw.map((e) => e.message ?? String(e)).join(', ')
            : typeof raw === 'string' ? raw : 'Request failed';
        throw new ApiError(res.status, message);
    }
    return data;
}
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
    }
}
export const api = {
    auth: {
        register: (username, password) => request('POST', '/auth/register', { username, password }, false),
        login: (username, password) => request('POST', '/auth/login', { username, password }, false),
        logout: () => request('POST', '/auth/logout'),
    },
    posts: {
        getAll: () => request('GET', '/posts'),
        create: (content) => request('POST', '/posts', { content }),
        update: (id, content) => request('PUT', `/posts/${id}`, { content }),
        delete: (id) => request('DELETE', `/posts/${id}`),
    },
    comments: {
        getByPost: (postId) => request('GET', `/posts/${postId}/comments`),
        create: (postId, content) => request('POST', `/posts/${postId}/comments`, { content }),
        update: (id, content) => request('PUT', `/comments/${id}`, { content }),
        delete: (id) => request('DELETE', `/comments/${id}`),
    },
    reactions: {
        upsert: (postId, type) => request('POST', `/posts/${postId}/reactions`, { type }),
        delete: (postId) => request('DELETE', `/posts/${postId}/reactions`),
    },
    users: {
        getMe: () => request('GET', '/users/me'),
        updateMe: (username) => request('PUT', '/users/me', { username }),
        getUser: (id) => request('GET', `/users/${id}`),
        getActivity: (id) => request('GET', `/users/${id}/activity`),
        lock: (id, isLocked) => request('PUT', `/users/${id}/lock`, { isLocked }),
        setRole: (id, role) => request('PUT', `/users/${id}/role`, { role }),
    },
};
