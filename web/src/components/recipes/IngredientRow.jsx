// web/src/components/recipes/IngredientRow.jsx
import { useCallback, useMemo, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { recipesService } from '../../services/recipesService';

// Simple debounce to reduce API spam
function useDebounced(fn, delay = 250) {
  const t = useRef();
  return useCallback((...args) => {
    clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function IngredientRow({
  row,
  index,
  onChange,
  onRemove,
  allUnits = [],
  onUnitCreated, // (unit) => void
}) {
  const [productOptions, setProductOptions] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Product select value (<CreatableSelect /> wants { value, label })
  const productValue = useMemo(() => {
    if (row.productId && row.name) return { value: row.productId, label: row.name };
    if (row.productId && !row.name) return { value: row.productId, label: row.productId };
    if (row.name) return { value: row.name, label: row.name };
    return null;
  }, [row.productId, row.name]);

  const unitOptions = useMemo(
    () => (allUnits || []).map(u => ({ value: u.id, label: u.name })),
    [allUnits]
  );

  const unitValue = useMemo(() => {
    if (row.unitId) {
      const u = allUnits.find(x => x.id === row.unitId);
      if (u) return { value: u.id, label: u.name };
    }
    if (row.unitName) return { value: row.unitName, label: row.unitName };
    return null;
  }, [row.unitId, row.unitName, allUnits]);

  const loadProducts = useDebounced(async (input) => {
    if (!input || !input.trim()) {
      setProductOptions([]);
      return;
    }
    try {
      setLoadingProducts(true);
      const list = await recipesService.searchProducts(input, 20);
      setProductOptions(list.map(p => ({ value: p.id, label: p.name })));
    } finally {
      setLoadingProducts(false);
    }
  }, 250);

  const handleProductChange = async (option) => {
    // Cleared
    if (!option) {
      onChange(index, {
        productId: null,
        name: '',
        candidateName: '',
        rawText: (row.rawText || '').trim() || '',
      });
      return;
    }

    // Existing product
    if (!option.__isNew__) {
      onChange(index, {
        productId: option.value,
        name: option.label,
        candidateName: option.label,
        rawText: row.rawText || [row.amount, unitValue?.label, option.label, row.notes].filter(Boolean).join(' '),
      });
      return;
    }

    // New product path → create via /products
    const label = (option.label || '').trim();
    if (!label) return;

    try {
      const created = await recipesService.createProduct({
        name: label,
        // optional: we could send category/defaults later from a “missing info” flow
      });
      onChange(index, {
        productId: created.id,
        name: created.name,
        candidateName: created.name,
        rawText: row.rawText || [row.amount, unitValue?.label, created.name, row.notes].filter(Boolean).join(' '),
      });
    } catch (e) {
      console.error('Create product failed', e);
      // Fallback to just text
      onChange(index, {
        productId: null,
        name: label,
        candidateName: label,
        rawText: row.rawText || [row.amount, unitValue?.label, label, row.notes].filter(Boolean).join(' '),
      });
    }
  };

  const handleUnitChange = async (option) => {
    if (!option) {
      onChange(index, { unitId: null, unitName: '' });
      return;
    }
    if (!option.__isNew__) {
      onChange(index, { unitId: option.value, unitName: option.label });
      return;
    }
    // Create new unit
    const label = (option.label || '').trim();
    if (!label) return;
    const u = await recipesService.createUnit(label);
    onUnitCreated?.(u); // bubble so parent can refresh unit cache if needed
    onChange(index, { unitId: u.id, unitName: u.name });
  };

  // Heading row UI
  if (row.type === 'HEADING') {
    return (
      <tr>
        <td className="p-0">
          <button className="btn btn-ghost btn-xs" onClick={() => onRemove(index)}>✕</button>
        </td>
        <td colSpan={4} className="px-1">
          <input
            value={row.heading || ''}
            onChange={(e) => onChange(index, { heading: e.target.value, rawText: e.target.value })}
            className="input input-bordered input-xs w-full"
            placeholder="Section heading"
          />
        </td>
      </tr>
    );
  }

  // Item row UI
  return (
    <tr>
      <td className="p-0">
        <button className="btn btn-ghost btn-xs" onClick={() => onRemove(index)}>✕</button>
      </td>
      <td className="px-1">
        <input
          value={row.amount ?? ''}
          onChange={(e) => onChange(index, { amount: e.target.value })}
          className="input input-bordered input-xs w-full"
          placeholder="e.g. 1.5"
        />
      </td>
      <td className="px-1">
        <CreatableSelect
          classNamePrefix="lb-unit"
          value={unitValue}
          onChange={handleUnitChange}
          options={unitOptions}
          placeholder="cup, g, tbsp…"
          isClearable
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            control: (b) => ({ ...b, minHeight: 28, borderRadius: 6, fontSize: 12 }),
            valueContainer: (b) => ({ ...b, padding: '0 6px' }),
            indicatorsContainer: (b) => ({ ...b, padding: 0 }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      </td>
      <td className="px-1">
        <CreatableSelect
          classNamePrefix="lb-product"
          value={productValue}
          onChange={handleProductChange}
          onInputChange={(input) => loadProducts(input)}
          options={productOptions}
          placeholder="Ingredient name"
          isClearable
          isLoading={loadingProducts}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          formatCreateLabel={(input) => `Create "${input}"`}
          styles={{
            control: (b) => ({ ...b, minHeight: 28, borderRadius: 6, fontSize: 12 }),
            valueContainer: (b) => ({ ...b, padding: '0 6px' }),
            indicatorsContainer: (b) => ({ ...b, padding: 0 }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      </td>
      <td className="px-1">
        <input
          value={row.notes || ''}
          onChange={(e) => onChange(index, { notes: e.target.value })}
          className="input input-bordered input-xs w-full"
          placeholder="Notes"
        />
      </td>
    </tr>
  );
}