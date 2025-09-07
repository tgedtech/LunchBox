import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipesService } from '../services/recipesService';
import Modal from '../components/common/Modal';
import IngredientRow from '../components/recipes/IngredientRow';

function RecipeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('');
  const [yields, setYields] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [course, setCourse] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [keyIngredient, setKeyIngredient] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [bulk, setBulk] = useState('');

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [warnModal, setWarnModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const debounceRef = useRef();

  // Units cache for the ingredient unit select
  const [units, setUnits] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Load units list (for unit creatable)
        try {
          const list = await recipesService.listUnits();
          setUnits(list || []);
        } catch (e) {
          console.error('Failed to load units', e);
        }

        const r = await recipesService.byId(id);
        setTitle(r.title || '');
        setSourceUrl(r.sourceUrl || '');
        setDescription(r.description || '');
        setServings(typeof r.servings === 'number' ? String(r.servings) : '');
        setYields(r.yields || '');
        setFavorite(!!r.favorite);
        setImageUrl(r.imageUrl || '');
        setCourse(r.course?.name || '');
        setCuisine(r.cuisine?.name || '');
        setKeyIngredient(r.keyIngredientText || r.keyIngredient?.name || '');
        setTags((r.tags || []).map((t) => t.tag?.name).filter(Boolean));
        setIngredients(
          (r.ingredients || []).map((row) =>
            row.type === 'HEADING'
              ? {
                  type: 'HEADING',
                  heading: row.heading || row.rawText || 'Section',
                  rawText: row.rawText || row.heading || 'Section',
                }
              : {
                  type: 'ITEM',
                  amount: row.amount ?? '',
                  unitId: row.unitId || null,
                  unitName: row.unit?.name || '',
                  productId: row.productId || null,
                  name: row.name || '',
                  notes: row.notes || '',
                  rawText: row.rawText || '',
                  candidateName: row.candidateName || row.name || '',
                }
          )
        );
        setSteps((r.steps || []).sort((a, b) => a.idx - b.idx).map((s) => s.body || ''));
      } catch (e) {
        console.error(e);
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const addIngredient = () =>
    setIngredients([
      ...ingredients,
      { type: 'ITEM', amount: '', unitId: null, unitName: '', productId: null, name: '', notes: '' },
    ]);
  const addHeading = () =>
    setIngredients([...ingredients, { type: 'HEADING', heading: 'Section', rawText: 'Section' }]);

  const updateIngredient = (i, patch) =>
    setIngredients(ingredients.map((row, ix) => (ix === i ? { ...row, ...patch } : row)));
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, ix) => ix !== i));
  const onUnitCreated = (u) =>
    setUnits((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]));

  const parseBulk = () => {
    const rows = bulk.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const parsed = rows.map((line) => {
      const m = line.match(/^(\S+)\s+(\S+)\s+(.+)$/);
      if (m) {
        return {
          type: 'ITEM',
          amount: m[1],
          unitId: null,
          unitName: m[2],
          productId: null,
          name: m[3],
          notes: '',
          candidateName: m[3],
          rawText: line,
        };
      }
      return {
        type: 'ITEM',
        amount: null,
        unitId: null,
        unitName: '',
        productId: null,
        name: line,
        notes: '',
        candidateName: line,
        rawText: line,
      };
    });
    setIngredients([...ingredients, ...parsed]);
    setBulk('');
  };

  const addStep = () => setSteps([...steps, '']);
  const updateStep = (i, v) => setSteps(steps.map((s, ix) => (ix === i ? v : s)));
  const removeStep = (i) => setSteps(steps.filter((_, ix) => ix !== i));

  const isValidUrl = (u) => {
    if (!u) return true;
    try { new URL(u); return true; } catch { return false; }
  };
  const isNonNegNumber = (v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0);

  const runValidation = async () => {
    const next = {};
    if (!title.trim()) next.title = 'Title is required.';
    else {
      try {
        const { exists } = await recipesService.validateTitle(title.trim(), id);
        if (exists) next.title = 'A recipe with this title already exists.';
      } catch {
        // ignore network hiccups for realtime validation
      }
    }
    if (!isValidUrl(sourceUrl)) next.sourceUrl = 'Please enter a valid URL.';
    if (!isNonNegNumber(servings)) next.servings = 'Servings must be a number ≥ 0.';
    setErrors(next);
    return next;
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { runValidation(); }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [title, sourceUrl, servings]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasErrors = Object.keys(errors).length > 0;

  const onSave = async () => {
    const latest = await runValidation();
    if (Object.keys(latest).length) { setWarnModal(true); return; }

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
            name: row.name || null,
            productId: row.productId || null,
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
      if (e?.response?.status === 409) {
        setErrors((prev) => ({ ...prev, title: 'A recipe with this title already exists.' }));
        setWarnModal(true);
      } else {
        console.error(e);
        setWarnModal(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      await recipesService.remove(id);
      navigate('/recipes');
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteModal(false);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="bg-accent-content min-h-screen p-4">
      {/* Contextual bar */}
      <div className="bg-primary min-h-15 mb-4">
        <div className="flex justify-between">
          <h1 className="font-nunito-sans font-bold text-xl text-primary-content p-4">Edit Recipe</h1>
          <div className="flex justify-end gap-1 pr-1 pt-2">
            <button className="btn m-2 rounded-box" onClick={() => navigate('/recipes')}>Recipes</button>
            <button className="btn btn-error rounded-box m-2" onClick={() => navigate('/recipes')}>Cancel</button>
            <button className="btn btn-warning rounded-box m-2" onClick={() => setDeleteModal(true)}>Delete…</button>
            <button className="btn btn-success rounded-box m-2" disabled={saving || hasErrors} onClick={onSave}>Save</button>
          </div>
        </div>
      </div>

      {/* Top cards */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-start">
        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md h-full flex-1">
          <div className="card-body h-full flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Recipe Information</h1>

            <label className="form-control w-full">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Recipe name"
                className={`input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && <span className="text-error text-xs mt-1">{errors.title}</span>}
            </label>

            <label className="form-control w-full">
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                type="text"
                placeholder="Source URL"
                className={`input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content ${errors.sourceUrl ? 'input-error' : ''}`}
              />
              {errors.sourceUrl && <span className="text-error text-xs mt-1">{errors.sourceUrl}</span>}
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="textarea w-full rounded-box font-nunito-sans font-bold bg-base-content-content"
            />

            <div className="join join-horizontal gap-2">
              <label className="form-control w-full">
                <input
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  type="number"
                  placeholder="Servings"
                  className={`input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content ${errors.servings ? 'input-error' : ''}`}
                />
                {errors.servings && <span className="text-error text-xs mt-1">{errors.servings}</span>}
              </label>
              <input
                value={yields}
                onChange={(e) => setYields(e.target.value)}
                type="text"
                placeholder="Yields"
                className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content"
              />
            </div>

            <div className="join join-horizontal gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                type="text"
                placeholder="Add a tag and press Enter"
                className="input text-neutral-content font-nunito-sans font-bold w-full rounded-box bg-base-content-content"
              />
              <button className="btn" onClick={addTag}>Add</button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span key={t} className="badge badge-accent badge-md flex items-center gap-1">
                  {t}
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

            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              type="text"
              placeholder="Image URL (optional)"
              className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content"
            />
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
                    {ingredients.map((row, i) => (
                      <IngredientRow
                        key={`${row.type}-${i}`}
                        row={row}
                        index={i}
                        onChange={updateIngredient}
                        onRemove={removeIngredient}
                        allUnits={units}
                        onUnitCreated={onUnitCreated}
                      />
                    ))}
                  </tbody>
                </table>
                <div className="join join-horizontal gap-x-2 mt-3">
                  <button className="btn btn-primary btn-soft btn-sm join-item rounded-box" onClick={addIngredient}>+ Add Ingredient</button>
                  <button className="btn btn-primary btn-soft btn-sm join-item rounded-box" onClick={addHeading}>+ Add Heading</button>
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

      {/* Modals */}
      <Modal
        open={warnModal}
        onClose={() => setWarnModal(false)}
        title="Please fix the issues"
        message={errors.title || errors.sourceUrl || errors.servings ? 'Some fields need your attention before we can save.' : 'Unable to save right now.'}
        cancelText="OK"
        tone="warning"
      />
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={onDelete}
        title="Delete recipe?"
        message="Are you sure you want to delete this recipe? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        tone="error"
      />
    </div>
  );
}

export default RecipeEdit;