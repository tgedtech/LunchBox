// web/src/pages/recipes/RecipeNew.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipesService } from '../services/recipesService';

export default function RecipeNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('');
  const [yields, setYields] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [course, setCourse] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [keyIngredient, setKeyIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [bulk, setBulk] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const addIngredient = () =>
    setIngredients([...ingredients, { amount: '', unit: '', name: '', notes: '', type: 'item' }]);
  const updateIngredient = (i, patch) =>
    setIngredients(ingredients.map((row, ix) => (ix === i ? { ...row, ...patch } : row)));
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, ix) => ix !== i));

  const addStep = () => setSteps([...steps, '']);
  const updateStep = (i, v) => setSteps(steps.map((s, ix) => (ix === i ? v : s)));
  const removeStep = (i) => setSteps(steps.filter((_, ix) => ix !== i));

  const parseBulk = () => {
    // Very light parser: "Amt Unit Ingredient Name"
    const rows = bulk.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const parsed = rows.map((line) => {
      const m = line.match(/^(\S+)\s+(\S+)\s+(.+)$/);
      if (m) return { amount: m[1], unit: m[2], name: m[3], notes: '', type: 'item' };
      return { amount: '', unit: '', name: line, notes: '', type: 'item' };
    });
    setIngredients([...ingredients, ...parsed]);
    setBulk('');
  };

  const onSave = async () => {
    if (!title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    try {
      const exists = await recipesService.existsByTitle(title);
      if (exists) { alert('A recipe with this title already exists.'); setSaving(false); return; }
      await recipesService.create({
        title, source, description, servings, yields, tags,
        course, cuisine, keyIngredient, ingredients, steps,
      });
      navigate('/recipes');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-accent-content min-h-screen p-4">
      {/* Contextual bar */}
      <div className="bg-primary min-h-15 mb-4">
        <div className="flex justify-between">
          <h1 className="font-nunito-sans font-bold text-xl text-primary-content p-4">Add a Recipe</h1>
          <div className="flex justify-end gap-1 pr-1 pt-2">
            <button className="btn m-2 rounded-box" onClick={() => navigate('/recipes')}>Recipes</button>
            <button className="btn btn-error rounded-box m-2" onClick={() => navigate('/recipes')}>Cancel</button>
            <button className="btn btn-success rounded-box m-2" disabled={saving} onClick={onSave}>Save</button>
          </div>
        </div>
      </div>

      {/* Top cards */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-start">
        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md h-full flex-1">
          <div className="card-body h-full flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Recipe Information</h1>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text"
                   placeholder="Recipe name"
                   className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            <input value={source} onChange={(e) => setSource(e.target.value)} type="text"
                   placeholder="Source"
                   className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      className="textarea w-full rounded-box font-nunito-sans font-bold bg-base-content-content" />
            <div className="join join-horizontal gap-2">
              <input value={servings} onChange={(e) => setServings(e.target.value)} type="text"
                     placeholder="Servings"
                     className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={yields} onChange={(e) => setYields(e.target.value)} type="text"
                     placeholder="Yields"
                     className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            </div>
            <div className="join join-horizontal gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                     onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                     type="text" placeholder="Add a tag and press Enter"
                     className="input text-neutral-content font-nunito-sans font-bold w-full rounded-box bg-base-content-content" />
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
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md h-full flex-1">
          <div className="card-body h-full flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Recipe Details</h1>
            <div className="skeleton h-48 w-48" />
            <div className="join join-vertical gap-y-1">
              <input value={course} onChange={(e) => setCourse(e.target.value)} type="text"
                     placeholder="Course"
                     className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} type="text"
                     placeholder="Cuisine"
                     className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
              <input value={keyIngredient} onChange={(e) => setKeyIngredient(e.target.value)} type="text"
                     placeholder="Key Ingredient"
                     className="input input-bordered rounded-box font-nunito-sans font-bold w-full bg-base-content-content" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom cards */}
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md">
          <div className="card-body flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Ingredients</h1>
            <div role="tablist" className="tabs tabs-lift">
              <input type="radio" name="ingredient-tabs" className="tab bg-base-content-content"
                     aria-label="Line Item" defaultChecked />
              <div className="tab-content border-base-300 bg-base-content-content p-2">
                <table className="table w-full table-xs table-fixed">
                  <thead className="font-quicksand text-base-content font-bold">
                    <tr>
                      <th className="w-4 p-0"></th>
                      <th className="w-8 px-1">Amt</th>
                      <th className="w-10 px-1">Unit</th>
                      <th className="w-full px-1">Ingredient</th>
                      <th className="w-30 px-1">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="font-nunito-sans text-base-content">
                    {ingredients.map((row, i) => (
                      <tr key={i}>
                        <td className="p-0">
                          <button className="btn btn-ghost btn-xs" onClick={() => removeIngredient(i)}>✕</button>
                        </td>
                        <td className="px-1"><input value={row.amount}
                              onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                              className="input input-bordered input-xs w-full" /></td>
                        <td className="px-1"><input value={row.unit}
                              onChange={(e) => updateIngredient(i, { unit: e.target.value })}
                              className="input input-bordered input-xs w-full" /></td>
                        <td className="px-1"><input value={row.name}
                              onChange={(e) => updateIngredient(i, { name: e.target.value })}
                              className="input input-bordered input-xs w-full" /></td>
                        <td className="px-1"><input value={row.notes}
                              onChange={(e) => updateIngredient(i, { notes: e.target.value })}
                              className="input input-bordered input-xs w-full" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="join join-horizontal gap-x-2 mt-3">
                  <button className="btn btn-primary btn-soft btn-sm join-item rounded-box" onClick={addIngredient}>
                    + Add Ingredient
                  </button>
                </div>
              </div>

              <input type="radio" name="ingredient-tabs"
                     className="tab font-nunito-sans font-bold text-primary bg-base-content-content"
                     aria-label="Bulk Item Entry" />
              <div className="tab-content border-base-300 bg-base-content-content p-2">
                <textarea value={bulk} onChange={(e) => setBulk(e.target.value)}
                          className="textarea h-24 w-full bg-base-content-content"
                          placeholder={`Paste ingredients, one per line.\nFormat: Amount Unit Ingredient`} />
                <div className="mt-2">
                  <button className="btn btn-primary btn-sm" onClick={parseBulk}>Parse & Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm card-lg w-full md:w-1/2 max-w-md">
          <div className="card-body flex flex-col">
            <h1 className="card-title font-nunito-sans font-bold text-xl text-base-content">Instructions</h1>
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <div key={i} className="join">
                  <span className="btn btn-ghost btn-sm join-item">{i + 1}</span>
                  <textarea value={s} onChange={(e) => updateStep(i, e.target.value)}
                            className="textarea textarea-bordered join-item w-full" placeholder="Instruction step" />
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