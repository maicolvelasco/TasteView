import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Loader2, CheckSquare, UtensilsCrossed } from 'lucide-react';
import FormModal from '../ui/FormModal';
import SearchInput from '../ui/SearchInput';
import useDuplicateMenu from '../../hooks/useDuplicateMenu';

/**
 * Modal "Duplicar platos de otra sucursal": el admin elige una sucursal de
 * origen, ve sus platos y marca cuáles quiere copiar (todos o solo
 * algunos) hacia su propia sucursal (`currentBranch`), con toda su
 * información (imagen, precio, historia, ingredientes, modelo 3D/AR,
 * modificadores).
 *
 * Si el backend detecta que ya existe un plato con el mismo nombre en
 * destino (sin importar mayúsculas/espacios: "Pique" = "PIQUE" = " pique "),
 * no lo duplica de entrada — este modal se lo pregunta al usuario en un
 * segundo paso, y solo si confirma se duplica igual.
 */
const DuplicateBranchModal = ({ currentBranch, onClose, onDone }) => {
  const {
    branches, branchesLoading, branchesError, fetchBranches,
    sourceBranchId, sourceCategories, sourceLoading, sourceError, selectSourceBranch,
    saving, conflicts, createdCount, duplicate, reset,
  } = useDuplicateMenu(currentBranch?.id);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [forceSelectedIds, setForceSelectedIds] = useState(new Set());
  const [finished, setFinished] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceProducts = useMemo(
    () => sourceCategories.flatMap(
      (cat) => (cat.products || []).map((p) => ({ ...p, categoryName: cat.name }))
    ),
    [sourceCategories],
  );

  const visibleProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return sourceProducts;
    return sourceProducts.filter(
      (p) => p.name.toLowerCase().includes(term) || p.categoryName?.toLowerCase().includes(term)
    );
  }, [sourceProducts, productSearch]);

  const handleSelectBranch = (e) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setSelectedIds(new Set());
    setForceSelectedIds(new Set());
    setFinished(false);
    setProductSearch('');
    selectSourceBranch(id);
  };

  const toggleProduct = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // "Seleccionar todos" opera sobre lo que se está viendo (respeta el
  // buscador): si el admin filtró "pollo", selecciona solo esos, no los
  // 50 platos de la sucursal completa.
  const allVisibleSelected = visibleProducts.length > 0
    && visibleProducts.every((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleProducts.forEach((p) => next.delete(p.id));
      } else {
        visibleProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const toggleForce = (id) => {
    setForceSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDuplicate = async () => {
    if (selectedIds.size === 0) return;
    try {
      const { skipped } = await duplicate(Array.from(selectedIds));
      if (!skipped.length) setFinished(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolveConflicts = async () => {
    const ids = Array.from(forceSelectedIds);
    if (ids.length === 0) {
      setFinished(true);
      return;
    }
    try {
      await duplicate(ids, ids);
      setFinished(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFinish = () => {
    onDone();
    handleClose();
  };

  return (
    <FormModal title="Duplicar platos de otra sucursal" icon={Copy} onClose={handleClose} maxWidth={640}>
      <div className="duplicate-branch-modal">
        {finished ? (
          <div className="duplicate-branch-success">
            <CheckSquare size={32} strokeWidth={1.5} />
            <p>
              Se duplicaron <strong>{createdCount}</strong> plato(s) hacia{' '}
              <strong>{currentBranch?.name}</strong>.
            </p>
            <button type="button" className="admin-new-btn" onClick={handleFinish}>
              Listo
            </button>
          </div>
        ) : conflicts.length > 0 ? (
          <>
            <p className="duplicate-branch-hint">
              Estos platos ya existen en <strong>{currentBranch?.name}</strong> (aunque el nombre esté
              escrito distinto, en mayúsculas o minúsculas). Marca los que igual quieras duplicar:
            </p>

            <div className="duplicate-branch-conflict-list">
              {conflicts.map((c) => (
                <label key={c.product_id} className="duplicate-branch-conflict-item">
                  <input
                    type="checkbox"
                    checked={forceSelectedIds.has(c.product_id)}
                    onChange={() => toggleForce(c.product_id)}
                  />
                  <span>
                    <strong>{c.name}</strong> — ya tienes &quot;{c.existing.name}&quot;
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              className="form-submit-btn"
              onClick={handleResolveConflicts}
              disabled={saving}
            >
              {saving
                ? 'Duplicando...'
                : forceSelectedIds.size > 0
                  ? `Duplicar ${forceSelectedIds.size} de todas formas`
                  : 'Omitir y terminar'}
            </button>
          </>
        ) : (
          <>
            <div className="form-field">
              <label htmlFor="dup-source-branch">Duplicar platos desde...</label>

              {branchesLoading ? (
                <p className="duplicate-branch-hint">
                  <Loader2 size={14} className="spin-icon" /> Cargando sucursales...
                </p>
              ) : branchesError ? (
                <p className="duplicate-branch-hint duplicate-branch-hint--error">{branchesError}</p>
              ) : branches.length === 0 ? (
                <p className="duplicate-branch-hint">No hay otras sucursales activas para duplicar desde ellas.</p>
              ) : (
                <select
                  id="dup-source-branch"
                  className="input"
                  value={sourceBranchId ?? ''}
                  onChange={handleSelectBranch}
                >
                  <option value="">Selecciona una sucursal...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              )}
            </div>

            {sourceLoading && (
              <p className="duplicate-branch-hint">
                <Loader2 size={14} className="spin-icon" /> Cargando platos...
              </p>
            )}

            {sourceError && <p className="duplicate-branch-hint duplicate-branch-hint--error">{sourceError}</p>}

            {!sourceLoading && sourceBranchId && sourceProducts.length === 0 && !sourceError && (
              <p className="duplicate-branch-hint">Esa sucursal todavía no tiene platos cargados.</p>
            )}

            {sourceProducts.length > 0 && (
              <>
                <SearchInput
                  value={productSearch}
                  onChange={setProductSearch}
                  placeholder={`Buscar entre ${sourceProducts.length} platos...`}
                />

                <div className="duplicate-branch-select-all">
                  <button type="button" className="admin-hint-link" onClick={toggleAll}>
                    {allVisibleSelected ? 'Deseleccionar visibles' : 'Seleccionar visibles'}
                  </button>
                  <span>{selectedIds.size} de {sourceProducts.length} seleccionados</span>
                </div>

                <div className="duplicate-branch-product-list">
                  {visibleProducts.map((p) => (
                    <label key={p.id} className="duplicate-branch-product-item">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleProduct(p.id)}
                      />
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="duplicate-branch-product-thumb" />
                      ) : (
                        <div className="duplicate-branch-product-thumb duplicate-branch-product-thumb--placeholder">
                          <UtensilsCrossed size={16} strokeWidth={1.75} />
                        </div>
                      )}
                      <span className="duplicate-branch-product-info">
                        <span className="duplicate-branch-product-name">{p.name}</span>
                        <span className="duplicate-branch-product-cat">{p.categoryName}</span>
                      </span>
                    </label>
                  ))}

                  {visibleProducts.length === 0 && (
                    <p className="duplicate-branch-hint">Ningún plato coincide con &quot;{productSearch}&quot;.</p>
                  )}
                </div>

                <button
                  type="button"
                  className="form-submit-btn"
                  onClick={handleDuplicate}
                  disabled={selectedIds.size === 0 || saving}
                >
                  {saving
                    ? 'Duplicando...'
                    : `Duplicar ${selectedIds.size} plato(s) a ${currentBranch?.name}`}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </FormModal>
  );
};

export default DuplicateBranchModal;
