// web/src/services/recipesService.js
const KEY = 'lb.recipes.v1';

const normalizeTitle = (s='') => s.trim().toLowerCase().replace(/\s+/g, ' ');
const fallbackImg = new URL('../assets/images/missingImage.png', import.meta.url).href;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
function uid() { return crypto?.randomUUID?.() || (Date.now().toString(36)+Math.random().toString(36).slice(2)); }

export const recipesService = {
  normalizeTitle,
  async all() { return read(); },
  async byId(id) { const r = read().find(r=>r.id===id); if(!r) throw new Error('Not found'); return r; },
  async existsByTitle(title, ignoreId=null) {
    const nt = normalizeTitle(title);
    return read().some(r => normalizeTitle(r.title) === nt && r.id !== ignoreId);
  },
  async create(data) {
    const now = new Date().toISOString();
    const rec = {
      id: uid(),
      title: (data.title||'Untitled Recipe').trim(),
      source: data.source||'', description: data.description||'',
      servings: data.servings||'', yields: data.yields||'',
      tags: Array.isArray(data.tags)? data.tags : [],
      course: data.course||'', cuisine: data.cuisine||'', keyIngredient: data.keyIngredient||'',
      favorite: !!data.favorite,
      imageUrl: data.imageUrl || fallbackImg,
      ingredients: Array.isArray(data.ingredients)? data.ingredients : [],
      steps: Array.isArray(data.steps)? data.steps : [],
      createdAt: now, updatedAt: now,
    };
    const list = read(); list.push(rec); write(list); return rec;
  },
  async update(id, patch) {
    const list = read();
    const i = list.findIndex(r=>r.id===id); if(i<0) throw new Error('Not found');
    list[i] = { ...list[i], ...patch, updatedAt: new Date().toISOString() }; write(list); return list[i];
  },
  async remove(id) { write(read().filter(r=>r.id!==id)); return { ok:true }; },
};