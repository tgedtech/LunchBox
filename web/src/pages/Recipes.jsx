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

  const overlayBtn =
    'btn btn-circle btn-ghost min-h-0 h-9 w-9 p-0 ' +
    'bg-base-100/70 text-base-content backdrop-blur-sm ' +
    'hover:bg-base-100/80';

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

  const toggleFav = async (id) => {
    await recipesService.toggleFavorite(id);
    setItems(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r));
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    await recipesService.remove(id);
    setItems(prev => prev.filter(r => r.id !== id));
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
              className="card relative bg-base-100 shadow-sm card-lg w-50 cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(`/recipes/${r.id}/edit`)}
            >
              <figure className="relative">
                <img
                  src={r.imageUrl || MissingImage}
                  alt={r.title}
                  className="w-full h-48 object-cover object-center rounded"
                />

                {/* Top-right: menu */}
                <details
                  className="dropdown dropdown-end absolute top-2 right-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <summary className={overlayBtn} aria-label="Card menu">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="5" viewBox="0 0 128 512" className="fill-current">
                      <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
                    </svg>
                  </summary>
                  <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box w-36 p-2 shadow">
                    <li><button onClick={() => navigate(`/recipes/${r.id}/edit`)}>Edit</button></li>
                    <li><button className="text-error" onClick={() => onDelete(r.id)}>Delete</button></li>
                  </ul>
                </details>
              </figure>

              <div className="card-body p-3 pb-5 flex flex-col">
                <h2 className="card-title font-nunito-sans text-sm text-neutral-content flex-1 break-words line-clamp-3">
                  {r.title}
                </h2>
              </div>

              {/* Bottom-right: favorite */}
              <button
                type="button"
                className={`absolute bottom-2 right-2 z-10 ${overlayBtn}`}
                onClick={(e) => { e.stopPropagation(); toggleFav(r.id); }}
                title={r.favorite ? 'Unfavorite' : 'Favorite'}
                aria-label="Toggle favorite"
              >
                <img
                  src={r.favorite ? HeartSolid : HeartRegular}
                  alt={r.favorite ? 'Favorite' : 'Not Favorite'}
                  className="w-4 h-4"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recipes;