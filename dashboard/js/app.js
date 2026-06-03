'use strict';
const API_BASE = 'https://radar-instagram-production.up.railway.app';

loadAll();
setInterval(loadAll, 30000);

async function loadAll() {
  await Promise.all([loadStats(), loadComments(), loadAlerts(), loadKeywords(), loadUsers()]);
}

async function api(path) {
  const r = await fetch(API_BASE + path);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function loadStats() {
  try {
    const d = await api('/api/comments/stats');
    setText('statComments', d.total_comments);
    setText('statAlerts', d.unread_alerts);
    setText('statUsers', d.monitored_users);
    setText('statKeywords', d.active_keywords);
  } catch(e) { console.error('stats:', e); }
}

async function loadComments() {
  try {
    const { data } = await api('/api/comments?limit=10');
    const tbody = document.getElementById('commentsTable');
    if (!data || !data.length) { tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-5 text-gray-500">Nenhum comentario ainda.<\/td><\/tr>'; return; }
    tbody.innerHTML = data.map(c =>
      '<tr class="hover:bg-gray-750"><td class="px-4 py-3 font-medium text-purple-300">@' + esc(c.username) + '<\/td><td class="px-4 py-3 max-w-xs truncate">' + esc(c.text) + '<\/td><td class="px-4 py-3 text-gray-400 whitespace-nowrap">' + fmtDate(c.timestamp) + '<\/td><\/tr>'
    ).join('');
  } catch(e) { console.error('comments:', e); }
}

async function loadAlerts() {
  try {
    const { data } = await api('/api/alerts?limit=10');
    const list = document.getElementById('alertsList');
    if (!data || !data.length) { list.innerHTML = '<p class="text-gray-500 text-sm">Nenhum alerta gerado.<\/p>'; return; }
    list.innerHTML = data.map(a =>
      '<div class="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3 fade-in ' + (a.read ? 'opacity-50' : '') + '">' +
      '<span class="text-xl">' + (a.type === 'keyword' ? '🔑' : '👤') + '<\/span>' +
      '<div class="flex-1 min-w-0"><p class="text-sm font-semibold">' + esc(a.reason) + '<\/p>' +
      '<p class="text-xs text-gray-400 truncate">@' + esc(a.username) + ' - "' + esc(a.comment_text) + '"<\/p>' +
      '<p class="text-xs text-gray-500 mt-0.5">' + fmtDate(a.created_at) + '<\/p><\/div>' +
      (!a.read ? '<button onclick="markRead(\'' + a.id + '\')" class="text-xs text-gray-500 hover:text-white">✓<\/button>' : '') +
      '<\/div>'
    ).join('');
  } catch(e) { console.error('alerts:', e); }
}

async function markRead(id) {
  await fetch(API_BASE + '/api/alerts/' + id + '/read', { method: 'PATCH' });
  loadAlerts(); loadStats();
}

async function markAllRead() {
  await fetch(API_BASE + '/api/alerts/read-all', { method: 'PATCH' });
  loadAlerts(); loadStats(); toast('Todos os alertas marcados como lidos');
}

async function loadKeywords() {
  try {
    const { data } = await api('/api/keywords');
    const list = document.getElementById('keywordsList');
    list.innerHTML = (data || []).map(k =>
      '<li class="flex justify-between items-center bg-gray-700 rounded-lg px-3 py-1.5"><span>' + (k.active ? '🔍' : '⏸') + ' ' + esc(k.word) + '<\/span><button onclick="deleteItem(\'keywords\',\'' + k.id + '\')" class="text-red-400 hover:text-red-300 text-xs">✕<\/button><\/li>'
    ).join('') || '<li class="text-gray-500 text-sm">Nenhuma palavra.<\/li>';
  } catch(e) { console.error('keywords:', e); }
}

async function addKeyword() {
  const input = document.getElementById('kwInput');
  const word = input.value.trim();
  if (!word) return;
  await fetch(API_BASE + '/api/keywords', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ word }) });
  input.value = ''; loadKeywords(); loadStats(); toast('Palavra-chave adicionada!');
}

async function loadUsers() {
  try {
    const { data } = await api('/api/monitored-users');
    const list = document.getElementById('usersList');
    list.innerHTML = (data || []).map(u =>
      '<li class="flex justify-between items-center bg-gray-700 rounded-lg px-3 py-1.5"><span>👤 @' + esc(u.username) + '<\/span><button onclick="deleteItem(\'monitored-users\',\'' + u.id + '\')" class="text-red-400 hover:text-red-300 text-xs">✕<\/button><\/li>'
    ).join('') || '<li class="text-gray-500 text-sm">Nenhum usuario.<\/li>';
  } catch(e) { console.error('users:', e); }
}

async function addUser() {
  const input = document.getElementById('userInput');
  const username = input.value.trim();
  if (!username) return;
  await fetch(API_BASE + '/api/monitored-users', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username }) });
  input.value = ''; loadUsers(); loadStats(); toast('Usuario adicionado!');
}

async function deleteItem(resource, id) {
  if (!confirm('Remover?')) return;
  await fetch(API_BASE + '/api/' + resource + '/' + id, { method: 'DELETE' });
  if (resource === 'keywords') { loadKeywords(); loadStats(); } else { loadUsers(); loadStats(); }
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val ?? '-'; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtDate(iso) { if (!iso) return '-'; return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }); }
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.style.opacity = '1'; setTimeout(() => { t.style.opacity = '0'; }, 3000); }
