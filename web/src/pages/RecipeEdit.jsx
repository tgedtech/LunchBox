import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipesService } from '../services/recipesService';
import Modal from '../components/common/Modal';
import IngredientRow from '../components/recipes/IngredientRow';
import CreatableSelect from 'react-select/creatable';

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

  const [courseSel, setCourseSel] = useState(null);
  const [cuisineSel, setCuisineSel] = useState(null);
  const [tagsSel, setTagsSel] = useState([]);
  const [keyIngSel, setKeyIngSel] = useState(null);

  const [courseOptions, setCourseOptions] = useState([]);
  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [keyIngOptions, setKeyIngOptions] = useState([]);

  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [bulk, setBulk] = useState('');

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [warnModal, setWarnModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const debounceRef = useRef();
  const keyIngDebounce = useRef();

  const [units, setUnits] = useState([]);
  const onUnitCreated = (u) =>
    setUnits((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]));

  const selectStyle = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#f9fafb',
      borderColor: state.isFocused ? '#60a5fa' : '#d1d5db',
      boxShadow: 'none',
      borderRadius: '0.5rem',
      minHeight: '2.5rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: '#60a5fa' },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (provided) => ({
      ...provided, zIndex: 9999, backgroundColor: '#ffffff', borderRadius: '0.5rem',
      boxShadow: '0 4px 8px rgba(0,0,0,0.08)', marginTop: '4px',
    }),
    option: (provided, state) => ({
      ...provided, backgroundColor: state.isFocused ? '#f3f4f6' : '#ffffff',
      color: '#111827', cursor: 'pointer', fontSize: '0.875rem', padding: '0.5rem 0.75rem',
    }),
    placeholder: (p) => ({ ...p, color: '#9ca3af' }),
    singleValue: (p) => ({ ...p, color: '#111827' }),
    multiValue: (p) => ({ ...p, backgroundColor: '#eef2ff' }),
    multiValueLabel: (p) => ({ ...p, color: '#3730a3' }),
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // --- Preferred: load complete lists from API
        let lists;
        try {
          lists = await recipesService.lookupLists?.();
        } catch {}

        if (lists && (lists.courses || lists.cuisines || lists.tags)) {
          setCourseOptions((lists.courses || []).map(x => ({ value: x.name, label: x.name })));
          setCuisineOptions((lists.cuisines || []).map(x => ({ value: x.name, label: x.name })));
          setTagOptions((lists.tags || []).map(x => ({ value: x.name, label: x.name })));
        } else {
          // --- Fallback: derive from existing recipes (legacy behavior)
          const list = await recipesService.all({ take: 300 });
          const courses = new Set();
          const cuisines = new Set();
          const tags = new Set();
          (list || []).forEach(r => {
            if (r.course?.name) courses.add(r.course.name);
            if (r.cuisine?.name) cuisines.add(r.cuisine.name);
            (r.tags || []).forEach(t => t?.tag?.name && tags.add(t.tag.name));
          });
          setCourseOptions(Array.from(courses).sort().map(n => ({ value: n, label: n })));
          setCuisineOptions(Array.from(cuisines).sort().map(n => ({ value: n, label: n })));
          setTagOptions(Array.from(tags).sort().map(n => ({ value: n, label: n })));
        }

        // Units (optional)
        try {
          const u = await recipesService.listUnits?.();
          if (Array.isArray(u)) setUnits(u);
        } catch {}

        // Load recipe
        const r = await recipesService.byId(id);
        setTitle(r.title || '');
        setSourceUrl(r.sourceUrl || '');
        setDescription(r.description || '');
        setServings(typeof r.servings === 'number' ? String(r.servings) : '');
        setYields(r.yields || '');
        setFavorite(!!r.favorite);
        setImageUrl(r.imageUrl || '');

        setCourseSel(r.course?.name ? { value: r.course.name, label: r.course.name } : null);
        setCuisineSel(r.cuisine?.name ? { value: r.cuisine.name, label: r.cuisine.name } : null);

        if (r.keyIngredient?.id) {
          setKeyIngSel({ value: r.keyIngredient.id, label: r.keyIngredient.name });
        } else if (r.keyIngredientText) {
          setKeyIngSel({ value: undefined, label: r.keyIngredientText, __isNew__: true });
        } else {
          setKeyIngSel(null);
        }

        setTagsSel((r.tags || []).map(t => t?.tag?.name).filter(Boolean).map(n => ({ value: n, label: n })));

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

  const addIngredient = () =>
    setIngredients([...ingredients, { type: 'ITEM', amount: '', unitId: null, unitName: '', productId: null, name: '', notes: '' }]);
  const addHeading = () =>
    setIngredients([...ingredients, { type: 'HEADING', heading: 'Section', rawText: 'Section' }]);

  const updateIngredient = (i, patch) =>
    setIngredients(ingredients.map((row, ix) => (ix === i ? { ...row, ...patch } : row)));
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, ix) => ix !== i));

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
        const { exists } = await recipesService.validateTitle?.(title.trim(), id);
        if (exists) next.title = 'A recipe with this title already exists.';
      } catch {}
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
  }, [title, sourceUrl, servings]);
  const hasErrors = Object.keys(errors).length > 0;

  const onKeyIngInput = (val) => {
    clearTimeout(keyIngDebounce.current);
    keyIngDebounce.current = setTimeout(async () => {
      try {
        if (!val?.trim()) { setKeyIngOptions([]); return; }
        const list = await recipesService.searchProducts(val, 20);
        setKeyIngOptions((list || []).map(p => ({ value: p.id, label: p.name })));
      } catch (e) {
        console.error('key ingredient search failed', e);
      }
    }, 250);
  };

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

        courseName: courseSel?.label || undefined,
        cuisineName: cuisineSel?.label || undefined,

        keyIngredientId: keyIngSel && !keyIngSel.__isNew__ ? keyIngSel.value : undefined,
        keyIngredientText: keyIngSel?.__isNew__ ? keyIngSel.label : undefined,

        tags: (tagsSel || []).map(t => t.label),

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

            <div className="join join-vertical gap-2">
              <CreatableSelect
                styles={selectStyle}
                placeholder="Course (select or type to create)"
                isClearable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                options={courseOptions}
                value={courseSel}
                onChange={setCourseSel}
              />
              <CreatableSelect
                styles={selectStyle}
                placeholder="Cuisine (select or type to create)"
                isClearable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                options={cuisineOptions}
                value={cuisineSel}
                onChange={setCuisineSel}
              />
              <CreatableSelect
                styles={selectStyle}
                placeholder="Key Ingredient (search products or type free text)"
                isClearable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                options={keyIngOptions}
                value={keyIngSel}
                onInputChange={onKeyIngInput}
                onChange={setKeyIngSel}
                formatCreateLabel={(v) => `Use "${v}" as free text`}
              />
            </div>

            <div className="mt-2">
              <CreatableSelect
                styles={selectStyle}
                isMulti
                placeholder="Tags (select or type and press Enter)"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                options={tagOptions}
                value={tagsSel}
                onChange={setTagsSel}
              />
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
              <input value={yields} onChange={(e) => setYields(e.target.value)} type="text" placeholder="Yields" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={servings} onChange={(e) => setServings(e.target.value)} type="number" placeholder="Servings (duplicate input for convenience)" className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
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