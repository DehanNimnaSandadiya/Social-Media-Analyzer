// api.js — centralised fetch helper

const API_BASE = window.location.origin; // same origin as Flask serves frontend

const API = {
  _getHeaders() {
    const token = localStorage.getItem('token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async _handle(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || data.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  },

  async get(url) {
    const res = await fetch(API_BASE + url, { headers: this._getHeaders() });
    return this._handle(res);
  },

  async post(url, body) {
    const res = await fetch(API_BASE + url, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(body)
    });
    return this._handle(res);
  },

  async put(url, body) {
    const res = await fetch(API_BASE + url, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(body)
    });
    return this._handle(res);
  },

  async delete(url) {
    const res = await fetch(API_BASE + url, {
      method: 'DELETE',
      headers: this._getHeaders()
    });
    return this._handle(res);
  }
};

// Toast helper (available globally)
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Auth guard
function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
