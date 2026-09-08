import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { getAdminMenu } from '../services/menu';
import { useAuth } from '../context/AuthContext';
import { computeCartTotal, filterOrderProducts } from '../utils/orderForm';

/**
 * Encapsula todo el estado y las acciones de la toma de pedidos: catálogo
 * (categorías/productos/mesas/meseros), carrito, filtros (categoría +
 * búsqueda) y el envío del pedido. Usado tanto por Mesero como por Caja a
 * través de components/OrderForm.jsx, que solo se encarga de la UI.
 *
 * Antes esta pantalla tenía el mismo par de bugs que ya se corrigió en
 * Menú/Categorías: traía el catálogo del endpoint público con un código
 * de sucursal fijo (`SUC-001`), y al enviar el pedido mandaba siempre
 * `branch_id: 1` — así que cualquier mesero/cajero de una sucursal
 * distinta ni podía ver el menú correcto, ni el pedido quedaba
 * registrado en su propia sucursal. Ahora todo usa la sucursal real del
 * usuario logueado.
 */
export default function useOrderForm({ showWaiterSelect = false, onOrderCreated } = {}) {
  const { user } = useAuth();
  const branchId = user?.branch?.id ?? null;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedWaiterId, setSelectedWaiterId] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [modifierModal, setModifierModal] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || []);
    } catch (err) {
      console.error('Error cargando mesas:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getAdminMenu();
      if (res.data.status) {
        const cats = res.data.data.categories;
        setCategories(cats);
        setActiveCategory(cats[0]?.id);
        setProducts(cats.flatMap((c) => c.products));
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  }, []);

  const fetchWaiters = useCallback(() => {
    api.get('/waiters').then((res) => setWaiters(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchTables();
    if (showWaiterSelect) fetchWaiters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTable = useCallback(
    (tableId) => {
      const t = tables.find((t) => t.id === parseInt(tableId, 10));
      setSelectedTable(t || null);
    },
    [tables]
  );

  const handleAddProduct = useCallback((product) => {
    if (product.has_modifiers && product.modifiers?.length > 0) {
      setModifierModal(product);
    } else {
      addToCart(product, [], '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = useCallback((product, modifiers, itemNotes) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product_id === product.id && JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
      );

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 };
        if (itemNotes) next[existingIndex].notes = itemNotes;
        return next;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          notes: itemNotes || '',
          modifiers: modifiers || [],
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index, delta) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
    );
  }, []);

  const updateItemNotes = useCallback((index, note) => {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, notes: note } : item)));
  }, []);

  const submitOrder = useCallback(async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        notes: item.notes || undefined,
        modifiers: item.modifiers.length > 0
          ? item.modifiers.map((m) => ({ modifier_option_id: m.modifier_option_id, quantity: m.quantity || 1 }))
          : undefined,
      }));

      await api.post('/orders', {
        branch_id: branchId,
        table_id: selectedTable?.id || null,
        customer_name: customerName || undefined,
        order_type: orderType,
        notes: notes || undefined,
        waiter_id: showWaiterSelect && selectedWaiterId ? selectedWaiterId : undefined,
        items,
      });

      setSuccess('¡Pedido enviado exitosamente!');
      setCart([]);
      setSelectedTable(null);
      setSelectedWaiterId('');
      setCustomerName('');
      setNotes('');
      if (onOrderCreated) onOrderCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar pedido');
    } finally {
      setLoading(false);
    }
  }, [cart, selectedTable, customerName, orderType, notes, showWaiterSelect, selectedWaiterId, onOrderCreated, branchId]);

  const filteredProducts = useMemo(
    () => filterOrderProducts(products, { categoryId: activeCategory, searchTerm }),
    [products, activeCategory, searchTerm]
  );

  const cartTotal = useMemo(() => computeCartTotal(cart), [cart]);

  return {
    // catálogo
    categories,
    tables,
    waiters,
    filteredProducts,
    isSearching: searchTerm.trim().length > 0,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    // encabezado del pedido
    orderType,
    setOrderType,
    selectedTable,
    selectTable: handleSelectTable,
    selectedWaiterId,
    setSelectedWaiterId,
    customerName,
    setCustomerName,
    // carrito
    cart,
    cartTotal,
    handleAddProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemNotes,
    notes,
    setNotes,
    // modal de modificadores
    modifierModal,
    closeModifierModal: () => setModifierModal(null),
    // envío
    loading,
    success,
    submitOrder,
  };
}
