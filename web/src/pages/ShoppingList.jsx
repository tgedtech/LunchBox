import React, { useEffect, useState } from 'react';
import ShoppingListHeader from '../components/shoppingList/ShoppingListHeader.jsx';
import AddShoppingListItemModal from '../components/shoppingList/AddShoppingListItemModal';
import ManageStoresModal from '../components/shoppingList/ManageStoresModal';
import ManageCategoriesModal from '../components/shoppingList/ManageCategoriesModal';
import shoppingListService from '../services/shoppingListService';
import masterDataService from '../services/masterDataService';

function getCategoryName(item, categories) {
  return (
    item.product?.category?.name ||
    (item.categoryId && categories.find(c => String(c.id) === String(item.categoryId))?.name) ||
    'Uncategorized'
  );
}

function getStoreName(item, stores) {
  return (
    item.store?.name ||
    (item.storeId && stores.find(s => String(s.id) === String(item.storeId))?.name) ||
    ''
  );
}

function groupByCategory(items, categories) {
  const map = {};
  for (const item of items) {
    const cat = getCategoryName(item, categories);
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  }
  return map;
}

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStoresModal, setShowStoresModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [list, cats, str, prods] = await Promise.all([
      shoppingListService.getItems(),
      masterDataService.getCategories(),
      masterDataService.getStores(),
      masterDataService.getProducts(),
    ]);
    setItems(list);
    setCategories(cats);
    setStores(str);
    setProducts(prods);
    setSelected([]);
  }

  const grouped = groupByCategory(items, categories);

  const toggleSelect = (id) => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    await shoppingListService.bulkDelete(selected);
    fetchAll();
  };

  return (
    <div className="p-4 pb-24">
      <ShoppingListHeader
        onAdd={() => setShowAddModal(true)}
        onManageStores={() => setShowStoresModal(true)}
        onManageCategories={() => setShowCategoriesModal(true)}
      />

      <AddShoppingListItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        stores={stores}
        products={products}
        onSuccess={fetchAll}
      />

      <ManageStoresModal
        isOpen={showStoresModal}
        stores={stores}
        onClose={() => setShowStoresModal(false)}
        refresh={fetchAll}
      />
      <ManageCategoriesModal
        isOpen={showCategoriesModal}
        categories={categories}
        onClose={() => setShowCategoriesModal(false)}
        refresh={fetchAll}
      />

      <div className="mb-4">
        {selected.length > 0 && (
          <button
            className="btn btn-error btn-sm"
            onClick={handleBulkDelete}
          >
            Remove Selected ({selected.length})
          </button>
        )}
      </div>
      <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr>
              <th></th>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Notes</th>
              <th>Store</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([cat, rows]) => (
              <React.Fragment key={cat}>
                <tr className="bg-base-200 text-base font-bold">
                  <td colSpan={8}>{cat}</td>
                </tr>
                {rows.map(item => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td>
                      {item.product?.name || item.name}
                    </td>
                    <td>
                      {item.quantity}
                    </td>
                    <td>
                      {item.unit ||
                        item.product?.defaultUnit ||
                        item.product?.unit ||
                        ''}
                    </td>
                    <td>
                      {item.notes}
                    </td>
                    <td>
                      {getStoreName(item, stores)}
                    </td>
                    <td>
                      {getCategoryName(item, categories)}
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-outline btn-error"
                        onClick={() => {
                          shoppingListService.deleteItem(item.id).then(fetchAll);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="p-8 text-center text-gray-400">
            Your shopping list is empty.
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingList;