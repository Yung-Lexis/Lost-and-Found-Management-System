const API_BASE = '/api';

/**
 * Token management helpers
 */
export const authStorage = {
  getToken() {
    return localStorage.getItem('findnest_auth_token');
  },
  setToken(token) {
    if (token) {
      localStorage.setItem('findnest_auth_token', token);
    } else {
      localStorage.removeItem('findnest_auth_token');
    }
  },
  getUser() {
    try {
      const user = localStorage.getItem('findnest_auth_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    if (user) {
      localStorage.setItem('findnest_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('findnest_auth_user');
    }
  },
  clear() {
    localStorage.removeItem('findnest_auth_token');
    localStorage.removeItem('findnest_auth_user');
  }
};

/**
 * Helper to handle fetch responses and errors
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.message || data?.errors?.join(', ') || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Helper to generate default headers with Auth token if present
 */
function getHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Stats
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/stats/summary`);
    return handleResponse(res);
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  // Items List / Search / Filter
  async getItems(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        query.append(key, value);
      }
    });

    const res = await fetch(`${API_BASE}/items?${query.toString()}`);
    return handleResponse(res);
  },

  // Single Item
  async getItemById(id) {
    const res = await fetch(`${API_BASE}/items/${id}`);
    return handleResponse(res);
  },

  // Smart Matches
  async getItemMatches(id) {
    const res = await fetch(`${API_BASE}/items/${id}/matches`);
    return handleResponse(res);
  },

  // Create Item (Supports FormData for image upload or standard JSON)
  async createItem(itemData) {
    let options = {
      method: 'POST',
      headers: getHeaders()
    };

    if (itemData instanceof FormData) {
      options.body = itemData;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(itemData);
    }

    const res = await fetch(`${API_BASE}/items`, options);
    return handleResponse(res);
  },

  // Update Item (Staff protected)
  async updateItem(id, itemData) {
    let options = {
      method: 'PUT',
      headers: getHeaders()
    };

    if (itemData instanceof FormData) {
      options.body = itemData;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(itemData);
    }

    const res = await fetch(`${API_BASE}/items/${id}`, options);
    return handleResponse(res);
  },

  // Update Item Status (Staff protected)
  async updateItemStatus(id, statusData) {
    const res = await fetch(`${API_BASE}/items/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  // Delete Item (Staff protected)
  async deleteItem(id, permanent = false) {
    const res = await fetch(`${API_BASE}/items/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
