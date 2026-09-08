import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Loader2, RotateCcw, Search, UtensilsCrossed } from 'lucide-react';
import EmptyStateCard from '../../components/ui/EmptyStateCard';
import SearchInput from '../../components/ui/SearchInput';
import MenuHeader from '../../components/publicMenu/MenuHeader';
import MenuCategoryNav from '../../components/publicMenu/MenuCategoryNav';
import MenuProductCard from '../../components/publicMenu/MenuProductCard';
import MenuProductModal from '../../components/publicMenu/MenuProductModal';
import usePublicMenu from '../../hooks/usePublicMenu';
import useFavicon from '../../hooks/useFavicon';
import useAppliedTheme from '../../hooks/useAppliedTheme';
import '../../components/css/AdminCatalog.css';
import '../../components/css/SharedUI.css';
import './MenuPage.css';

/**
 * Menú Digital Público — pantalla que ve el cliente al escanear el QR de
 * su mesa (ruta pública /menu/:branchCode, sin autenticación). Toda la
 * lógica de datos vive en hooks/usePublicMenu.js y services/menu.js; este
 * archivo solo compone la UI con el tema corporativo (mismas variables
 * --color-* que el resto de la app, listas para el futuro selector de
 * colores del administrador).
 */
const MenuPage = () => {
  const { branchCode } = useParams();
  const {
    branch, tableNumber,
    categories,
    activeCategory, setActiveCategory,
    searchTerm, setSearchTerm, isSearching, visibleProducts,
    loading, error, refetch,
    selectedProduct, openProduct, closeProduct,
  } = usePublicMenu(branchCode);

  // El nombre/logo del NEGOCIO (Ajustes > Negocio) tiene prioridad sobre
  // el de la sucursal puntual — es la marca que el cliente reconoce,
  // aunque la sucursal internamente se llame "Sucursal 2" o similar. Si
  // la empresa todavía no configuró nada, se cae al nombre de la
  // sucursal y, si tampoco hay, al genérico del proyecto.
  const businessName = branch?.company?.name || branch?.name || 'Restaurant AR';
  const logoUrl = branch?.company?.logo_url || null;

  // Ícono de la pestaña del navegador = logo del negocio.
  useFavicon(logoUrl);

  // Colores del sistema = tema del negocio (Ajustes > Negocio > Colores).
  useAppliedTheme(branch?.company?.theme);

  // ─── Estado de carga ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="public-menu-page">
        <div className="page-loading public-menu-full-state">
          <Loader2 size={32} className="page-loading-spinner" />
          <p>Cargando menú...</p>
        </div>
      </div>
    );
  }

  // ─── Estado de error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="public-menu-page">
        <div className="page-error public-menu-full-state">
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button type="button" className="page-retry-btn" onClick={refetch}>
            <RotateCcw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ─── Vista principal ─────────────────────────────────────────────────────
  return (
    <div className="public-menu-page">
      <MenuHeader businessName={businessName} logoUrl={logoUrl} tableNumber={tableNumber} />

      {/* Barra fija: búsqueda + categorías */}
      <div className="public-menu-toolbar">
        <div className="public-menu-toolbar-inner">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar en el menú..."
          />
          {!isSearching && categories.length > 0 && (
            <MenuCategoryNav
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          )}
        </div>
      </div>

      {/* Contenido */}
      <main className="public-menu-content">
        {isSearching && (
          <p className="public-menu-search-summary">
            <Search size={14} strokeWidth={2} />
            {visibleProducts.length > 0
              ? `${visibleProducts.length} resultado${visibleProducts.length === 1 ? '' : 's'} para "${searchTerm}"`
              : `Sin resultados para "${searchTerm}"`}
          </p>
        )}

        {visibleProducts.length === 0 ? (
          <EmptyStateCard
            icon={isSearching ? Search : UtensilsCrossed}
            title={isSearching ? 'Sin resultados' : 'No hay productos en esta categoría'}
            message={
              isSearching
                ? 'Prueba con otra palabra o revisa las categorías del menú.'
                : 'Vuelve a intentarlo más tarde o elige otra categoría.'
            }
          />
        ) : (
          <div className="public-menu-product-list">
            {visibleProducts.map((product, i) => (
              <MenuProductCard
                key={product.id}
                product={product}
                categoryLabel={isSearching ? product._categoryName : null}
                delay={Math.min(i * 0.035, 0.3)}
                onSelect={openProduct}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="public-menu-footer">
        <UtensilsCrossed size={14} strokeWidth={2} />
        {businessName} · Menú Digital
      </footer>

      {selectedProduct && (
        <MenuProductModal product={selectedProduct} onClose={closeProduct} />
      )}
    </div>
  );
};

export default MenuPage;
