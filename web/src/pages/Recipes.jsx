import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesService } from '../services/recipesService';
import MissingImage from '../assets/images/missingImage.png';
import HeartSolid from '../assets/icons/heart-solid.svg';
import HeartRegular from '../assets/icons/heart-regular.svg';

function Recipes() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('title');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await recipesService.all();
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const v = (q || '').trim().toLowerCase();
    let list = items;
    if (v) list = list.filter(r =>
      r.title?.toLowerCase().includes(v) ||
      (r.tags || []).some(t => t.tag?.name?.toLowerCase().includes(v))
    );
    if (sortKey === 'title') list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [items, q, sortKey]);

  const toggleFav = async (e, id) => {
    e.stopPropagation();
    await recipesService.toggleFavorite(id);
    setItems(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r));
  };

  const openEdit = (id) => navigate(`/recipes/${id}/edit`);

  const onDelete = async (e, id, title) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await recipesService.remove(id);
      setItems(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete recipe.');
    }
  };

  return (
    <div className="bg-accent-content min-h-screen">
      {/* Contextual menu */}
      <div className="bg-primary min-h-15">
        <div className="flex justify-between items-center">
          <h1 className="font-nunito-sans font-bold text-xl text-primary-content p-4">Recipes</h1>
          <div className="flex items-center gap-2 pr-2">
            <details className="dropdown dropdown-end">
              <summary className="btn m-2 rounded-box">Sort By</summary>
              <ul className="menu dropdown-content bg-base-100 rounded-box w-52 p-2 font-bold font-nunito-sans text-end">
                <li><button onClick={() => setSortKey('title')}>Title</button></li>
              </ul>
            </details>
            <button className="btn btn-error rounded-box m-2" onClick={() => navigate('/recipes/new')}>
              <span className="mr-1">＋</span> Add Recipe
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-base-100 p-3">
        <div className="join join-vertical gap-y-1 max-w-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search Recipes"
            className="input input-bordered input-sm w-full font-nunito-sans font-bold rounded-box"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="p-4">
        {loading && <div className="opacity-70">Loading…</div>}
        {!loading && filtered.length === 0 && (
          <div className="opacity-70">
            No recipes yet. Click <span className="badge">Add Recipe</span> to create one.
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="card bg-base-100 shadow-sm card-lg w-50 cursor-pointer"
              onClick={() => openEdit(r.id)}
            >
              <figure className="relative">
                <img
                  src={r.imageUrl || MissingImage}
                  alt={r.title}
                  className="w-full h-48 object-cover object-center rounded"
                />

                {/* 3-dots menu trigger */}
                <button
                  type="button"
                  className="btn btn-circle btn-ghost absolute top-2 right-2 z-20 p-1 min-h-0 h-8 w-8 flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(prev => prev === r.id ? null : r.id); }}
                  aria-label="Card menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="18" width="5" viewBox="0 0 128 512" className="fill-current">
                    <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
                  </svg>
                </button>

                {/* Small dropdown menu */}
                {openMenuId === r.id && (
                  <div
                    className="absolute top-10 right-2 z-30 bg-base-100 rounded-box shadow p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="btn btn-ghost btn-sm w-full justify-start" onClick={() => openEdit(r.id)}>Edit</button>
                    <button className="btn btn-ghost btn-sm w-full justify-start text-error" onClick={(e) => onDelete(e, r.id, r.title)}>Delete…</button>
                  </div>
                )}
              </figure>

              <div className="card-body p-3 pb-5 flex flex-col relative">
                <div className="flex justify-between items-start pr-8">
                  <h2 className="card-title font-nunito-sans text-sm text-neutral-content flex-1 break-words line-clamp-3">
                    {r.title}
                  </h2>
                </div>

                {/* Favorite bottom-right */}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-base-100/80 backdrop-blur rounded-full p-2"
                  onClick={(e) => toggleFav(e, r.id)}
                  title={r.favorite ? 'Unfavorite' : 'Favorite'}
                >
                  <img
                    src={r.favorite ? HeartSolid : HeartRegular}
                    alt={r.favorite ? 'Favorite' : 'Not Favorite'}
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recipes;