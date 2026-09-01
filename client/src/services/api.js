const API_BASE = '/api';

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

export const api = {
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
      method: 'POST'
    };

    if (itemData instanceof FormData) {
      options.body = itemData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(itemData);
    }

    const res = await fetch(`${API_BASE}/items`, options);
    return handleResponse(res);
  },

  // Update Item
  async updateItem(id, itemData) {
    let options = {
      method: 'PUT'
    };

    if (itemData instanceof FormData) {
      options.body = itemData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(itemData);
    }

    const res = await fetch(`${API_BASE}/items/${id}`, options);
    return handleResponse(res);
  },

  // Update Item Status (claim / resolve / reopen)
  async updateItemStatus(id, statusData) {
    const res = await fetch(`${API_BASE}/items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  // Delete Item
  async deleteItem(id, permanent = false) {
    const res = await fetch(`${API_BASE}/items/${id}?permanent=${permanent}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
