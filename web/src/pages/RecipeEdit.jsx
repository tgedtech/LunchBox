import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipesService } from '../services/recipesService';

function RecipeEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  // base fields
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('');
  const [yields, setYields] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // taxonomy-ish
  const [course, setCourse] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [keyIngredient, setKeyIngredient] = useState('');

  // tags
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // details
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [bulk, setBulk] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await recipesService.byId(id);
        // populate base
        setTitle(r.title || '');
        setSourceUrl(r.sourceUrl || '');
        setDescription(r.description || '');
        setServings(r.servings ?? '');
        setYields(r.yields || '');
        setFavorite(!!r.favorite);
        setImageUrl(r.imageUrl || '');

        // taxonomy-ish
        setCourse(r.course?.name || '');
        setCuisine(r.cuisine?.name || '');
        setKeyIngredient(r.keyIngredient?.name || r.keyIngredientText || '');

        // tags
        setTags((r.tags || []).map(t => t.tag?.name).filter(Boolean));

        // ingredients
        setIngredients(
          (r.ingredients || []).map(row => ({
            type: row.type, // 'ITEM' | 'HEADING'
            amount: row.amount ?? null,
            unitId: row.unitId ?? null,
            unitName: row.unit?.name || '',
            productId: row.productId ?? null,
            name: row.name || '',
            notes: row.notes || '',
            heading: row.heading || '',
            rawText: row.rawText || '',
            candidateName: row.candidateName || row.name || '',
          }))
        );

        // steps
        setSteps((r.steps || []).sort((a,b)=>a.idx-b.idx).map(s => s.body || ''));
      } catch (e) {
        console.error(e);
        alert('Failed to load recipe.');
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // tag helpers
  const addTag = () => {
    const t = (tagInput || '').trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  // ingredients helpers
  const addIngredient = () =>
    setIngredients([...ingredients, { type: 'ITEM', amount: '', unitId: null, unitName: '', productId: null, name: '', notes: '' }]);
  const addHeading = () =>
    setIngredients([...ingredients, { type: 'HEADING', heading: 'Section', rawText: 'Section' }]);
  const updateIngredient = (i, patch) =>
    setIngredients(ingredients.map((row, ix) => (ix === i ? { ...row, ...patch } : row)));
  const removeIngredient = (i) =>
    setIngredients(ingredients.filter((_, ix) => ix !== i));

  // bulk parse
  const parseBulk = () => {
    const rows = bulk.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const parsed = rows.map((line) => {
      const m = line.match(/^(\S+)\s+(\S+)\s+(.+)$/);
      if (m) return { type: 'ITEM', amount: m[1], unitId: null, unitName: m[2], productId: null, name: m[3], notes: '', candidateName: m[3], rawText: line };
      return { type: 'ITEM', amount: null, unitId: null, unitName: '', productId: null, name: line, notes: '', candidateName: line, rawText: line };
    });
    setIngredients([...ingredients, ...parsed]);
    setBulk('');
  };

  // steps helpers
  const addStep = () => setSteps([...steps, '']);
  const updateStep = (i, v) => setSteps(steps.map((s, ix) => (ix === i ? v : s)));
  const removeStep = (i) => setSteps(steps.filter((_, ix) => ix !== i));

  const onSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        sourceUrl: sourceUrl || null,
        description: description || null,
        servings: servings ? Number(servings) : null,
        yields: yields || null,
        favorite,
        imageUrl: imageUrl || null,

        courseName: course || undefined,
        cuisineName: cuisine || undefined,
        keyIngredientText: keyIngredient || undefined,

        tags,

        ingredients: ingredients.map((row) => {
          if (row.type === 'HEADING') {
            return {
              type: 'HEADING',
              heading: row.heading || row.rawText || 'Section',
              rawText: row.rawText || row.heading || 'Section',
            };
          }
          return {
            type: 'ITEM',
            amount: row.amount === '' ? null : row.amount,
            unitId: row.unitId || null,
            productId: row.productId || null,
            name: row.name || null,
            notes: row.notes || null,
            rawText:
              row.rawText ||
              [row.amount, row.unitName, row.name, row.notes].filter(Boolean).join(' ').trim(),
            candidateName: row.candidateName || row.name || null,
          };
        }),

        steps: steps.map((s) => String(s || '')),
      };

      await recipesService.update(id, payload);
      navigate('/recipes');
    } catch (e) {
      console.error(e);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    try {
      await recipesService.remove(id);
      navigate('/recipes');
    } catch (e) {
      console.error(e);
      alert('Failed to delete recipe.');
    }
  };

  if (loading) {
    return <div className="p-4 opacity-70">Loading…</div>;
  }

  return (
    <div className="bg-accent-content min-h-screen p-4">
      {/* Contextual bar */}
      <div className="bg-primary min-h-15 mb-4">
        <div className="flex justify-between">
          <h1 className="font-nunito-sans font-bold text-xl text-primary-content p-4">Edit Recipe</h1>
          <div className="flex justify-end gap-1 pr-1 pt-2">
            <button className="btn m-2 rounded-box" onClick={() => navigate('/recipes')}>Recipes</button>
            <button className="btn btn-error rounded-box m-2" onClick={() => navigate('/recipes')}>Cancel</button>
            <button className="btn btn-outline btn-error rounded-box m-2" onClick={onDelete}>Delete</button>
            <button className="btn btn-success rounded-box m-2" disabled={saving} onClick={onSave}>Save</button>
          </div>
        </div>
      </div>

      {/* Top cards */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-start">
        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md h-full flex-1">
          <div className="card-body h-full flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Recipe Information</h1>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Recipe name" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} type="text" placeholder="Source URL" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="textarea w-full rounded-box font-nunito-sans font-bold bg-base-content-content" />
            <div className="join join-horizontal gap-2">
              <input value={servings} onChange={(e) => setServings(e.target.value)} type="number" placeholder="Servings" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={yields} onChange={(e) => setYields(e.target.value)} type="text" placeholder="Yields" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            </div>
            <div className="join join-horizontal gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} type="text" placeholder="Add a tag and press Enter" className="input text-neutral-content font-nunito-sans font-bold w-full rounded-box bg-base-content-content" />
              <button className="btn" onClick={addTag}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span key={t} className="badge badge-accent badge-md flex items-center gap-1">{t}
                  <button type="button" className="btn btn-xs btn-circle btn-ghost" onClick={() => removeTag(t)}>✕</button>
                </span>
              ))}
            </div>
            <div className="form-control mt-2">
              <label className="label cursor-pointer gap-2">
                <input type="checkbox" className="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />
                <span className="label-text">Mark as favorite</span>
              </label>
            </div>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="text" placeholder="Image URL (optional)" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md h-full flex-1">
          <div className="card-body h-full flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Recipe Details</h1>
            <div className="skeleton h-48 w-48" />
            <div className="join join-vertical gap-y-1">
              <input value={course} onChange={(e) => setCourse(e.target.value)} type="text" placeholder="Course" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} type="text" placeholder="Cuisine" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={keyIngredient} onChange={(e) => setKeyIngredient(e.target.value)} type="text" placeholder="Key Ingredient" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom cards */}
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Ingredients */}
        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md">
          <div className="card-body flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Ingredients</h1>
            <div role="tablist" className="tabs tabs-lift">
              <input type="radio" name="ingredient-tabs" className="tab bg-base-content-content" aria-label="Line Item" defaultChecked />
              <div className="tab-content border-base-300 bg-base-content-content p-2">
                <table className="table w-full table-xs table-fixed">
                  <thead className="font-quicksand text-base-content font-bold">
                    <tr>
                      <th className="w-4 p-0"></th>
                      <th className="w-12 px-1">Amt</th>
                      <th className="w-16 px-1">Unit</th>
                      <th className="w-full px-1">Ingredient</th>
                      <th className="w-30 px-1">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="font-nunito-sans text-base-content">
                    {ingredients.map((row, i) =>
                      row.type === 'HEADING' ? (
                        <tr key={`h-${i}`}>
                          <td className="p-0">
                            <button className="btn btn-ghost btn-xs" onClick={() => removeIngredient(i)}>✕</button>
                          </td>
                          <td colSpan={4} className="px-1">
                            <input
                              value={row.heading || ''}
                              onChange={(e) => updateIngredient(i, { heading: e.target.value, rawText: e.target.value })}
                              className="input input-bordered input-xs w-full"
                              placeholder="Section heading"
                            />
                          </td>
                        </tr>
                      ) : (
                        <tr key={i}>
                          <td className="p-0">
                            <button className="btn btn-ghost btn-xs" onClick={() => removeIngredient(i)}>✕</button>
                          </td>
                          <td className="px-1">
                            <input
                              value={row.amount ?? ''}
                              onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                              className="input input-bordered input-xs w-full"
                              placeholder="e.g. 1.5"
                            />
                          </td>
                          <td className="px-1">
                            <input
                              value={row.unitName || ''}
                              onChange={(e) => updateIngredient(i, { unitName: e.target.value })}
                              className="input input-bordered input-xs w-full"
                              placeholder="cup, g, tbsp…"
                            />
                          </td>
                          <td className="px-1">
                            <input
                              value={row.name || ''}
                              onChange={(e) => updateIngredient(i, { name: e.target.value, candidateName: e.target.value })}
                              className="input input-bordered input-xs w-full"
                              placeholder="Ingredient name"
                            />
                          </td>
                          <td className="px-1">
                            <input
                              value={row.notes || ''}
                              onChange={(e) => updateIngredient(i, { notes: e.target.value })}
                              className="input input-bordered input-xs w-full"
                              placeholder="Notes"
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                <div className="join join-horizontal gap-x-2 mt-3">
                  <button className="btn btn-primary btn-soft btn-sm join-item rounded-box" onClick={addIngredient}>
                    + Add Ingredient
                  </button>
                  <button className="btn btn-primary btn-soft btn-sm join-item rounded-box" onClick={addHeading}>
                    + Add Heading
                  </button>
                </div>
              </div>

              <input type="radio" name="ingredient-tabs" className="tab font-nunito-sans font-bold text-primary bg-base-content-content" aria-label="Bulk Item Entry" />
              <div className="tab-content border-base-300 bg-base-content-content p-2">
                <textarea
                  className="textarea h-24 w-full bg-base-content-content"
                  placeholder={`Paste your ingredients here, one per line.\nFormat: Amount Unit Ingredient Name`}
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                />
                <div className="mt-2">
                  <button className="btn btn-primary btn-sm" onClick={parseBulk}>Parse & Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md">
          <div className="card-body flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Instructions</h1>
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <div key={i} className="join">
                  <span className="btn btn-ghost btn-sm join-item">{i + 1}</span>
                  <textarea
                    value={s}
                    onChange={(e) => updateStep(i, e.target.value)}
                    className="textarea textarea-bordered join-item w-full"
                    placeholder="Instruction step"
                  />
                  <button className="btn btn-ghost join-item" onClick={() => removeStep(i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-primary btn-soft btn-sm self-start" onClick={addStep}>+ Add Step</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeEdit;