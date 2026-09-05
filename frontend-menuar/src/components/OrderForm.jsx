import React from 'react';
import useOrderForm from '../hooks/useOrderForm';
import OrderMetaBar from './order/OrderMetaBar';
import SearchInput from './ui/SearchInput';
import CategoryChips from './order/CategoryChips';
import ProductGrid from './order/ProductGrid';
import CartPanel from './order/CartPanel';
import ModifierModal from './order/ModifierModal';
import './css/OrderForm.css';

// Formulario de toma de pedidos, reutilizado por el Mesero y por el Cajero
// (mismo tema corporativo en ambas pantallas: son la misma tarea de negocio).
// Toda la lógica (catálogo, carrito, envío) vive en hooks/useOrderForm.js —
// este archivo solo compone la UI con las piezas de components/order/.
const OrderForm = ({ showWaiterSelect = false, onOrderCreated }) => {
  const {
    categories,
    tables,
    waiters,
    filteredProducts,
    isSearching,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    orderType,
    setOrderType,
    selectedTable,
    selectTable,
    selectedWaiterId,
    setSelectedWaiterId,
    customerName,
    setCustomerName,
    cart,
    cartTotal,
    handleAddProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemNotes,
    notes,
    setNotes,
    modifierModal,
    closeModifierModal,
    loading,
    success,
    submitOrder,
  } = useOrderForm({ showWaiterSelect, onOrderCreated });

  return (
    <div className="order-form">
      <div className="order-form-main">
        <div className="order-panel order-panel--meta">
          <OrderMetaBar
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            tables={tables}
            selectedTable={selectedTable}
            onSelectTable={selectTable}
            showWaiterSelect={showWaiterSelect}
            waiters={waiters}
            selectedWaiterId={selectedWaiterId}
            onSelectWaiter={setSelectedWaiterId}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
          />
        </div>

        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar plato por nombre..." />

        {!isSearching && (
          <CategoryChips categories={categories} active={activeCategory} onChange={setActiveCategory} />
        )}

        <ProductGrid products={filteredProducts} onAdd={handleAddProduct} />
      </div>

      <CartPanel
        cart={cart}
        cartTotal={cartTotal}
        onRemove={removeFromCart}
        onChangeQuantity={updateQuantity}
        onChangeNotes={updateItemNotes}
        notes={notes}
        onNotesChange={setNotes}
        loading={loading}
        success={success}
        onSubmit={submitOrder}
      />

      {modifierModal && (
        <ModifierModal product={modifierModal} onClose={closeModifierModal} onAdd={addToCart} />
      )}
    </div>
  );
};

export default OrderForm;
