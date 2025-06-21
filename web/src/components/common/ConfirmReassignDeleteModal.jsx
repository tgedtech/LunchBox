import React, { useState } from 'react';

function ConfirmReassignDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityType,           // "Category", "Location", etc
  entityName,           // e.g. "Staples"
  options,              // array of { id, name } to select for reassignment
  excludeId,            // the id of the thing being deleted
  loading = false,
  error = '',
}) {
  const [selectedId, setSelectedId] = useState('');

  React.useEffect(() => {
    if (isOpen) setSelectedId('');
  }, [isOpen]);

  const canDelete = !!selectedId && selectedId !== excludeId;

  return isOpen ? (
    <div className="modal modal-open">
      <div className="modal-box rounded-2xl border border-base-300">
        <h2 className="text-xl font-quicksand font-bold mb-2 text-error">Delete {entityType}</h2>
        <p className="mb-4 text-base font-nunito-sans">
          <b>{entityName}</b> is currently assigned to items in your inventory. <br />
          <span className="font-bold">Before deleting, select a new {entityType.toLowerCase()} to reassign all related items.</span>
        </p>
        <label className="block mb-2 font-quicksand">Reassign all items to:</label>
        <select
          className="select select-bordered w-full mb-4"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">-- Select {entityType} --</option>
          {options
            .filter(opt => opt.id !== excludeId)
            .map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
        {error && <div className="alert alert-error py-1 mb-2"><span>{error}</span></div>}
        <div className="flex justify-end space-x-2 mt-6 font-nunito-sans">
          <button className="btn btn-outline btn-error" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn-primary${loading ? " loading" : ""}`}
            onClick={() => onConfirm(selectedId)}
            disabled={!canDelete || loading}
          >
            Confirm & Delete
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  ) : null;
}

export default ConfirmReassignDeleteModal;