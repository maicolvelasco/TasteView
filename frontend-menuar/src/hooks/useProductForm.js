import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = () => ({
  name: '',
  description: '',
  history: '',
  ingredients: '',
  price: '',
  cost: '',
  category_id: '',
  preparation_time_min: 15,
  image_url: '',
  model_3d_url: '',
  is_available: true,
  is_combo: false,
});

/**
 * Encapsula el estado y el guardado del formulario de crear/editar producto:
 * datos básicos, ítems del combo y opciones/modificadores seleccionados.
 * Si recibe un `product`, precarga sus datos y trae sus opciones asignadas.
 */
export default function useProductForm(product, onSaved) {
  const [form, setForm] = useState(emptyForm());
  const [comboItems, setComboItems] = useState({}); // { [product_id]: quantity }
  const [modifierSelections, setModifierSelections] = useState({}); // { [modifier_id]: {checked,is_required,disabled_option_ids} }
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!product) {
      setForm(emptyForm());
      setComboItems({});
      setModifierSelections({});
      return;
    }

    setForm({
      name: product.name || '',
      description: product.description || '',
      history: product.history || '',
      ingredients: product.ingredients || '',
      price: product.price || '',
      cost: product.cost || '',
      category_id: product.category_id || '',
      preparation_time_min: product.preparation_time_min || 15,
      image_url: product.image_url || '',
      model_3d_url: product.model_3d_url || '',
      is_available: product.is_available !== false,
      is_combo: !!product.is_combo,
    });

    const comboMap = {};
    (product.combo_items || []).forEach((ci) => { comboMap[ci.product_id] = ci.quantity || 1; });
    setComboItems(comboMap);

    // El listado que alimenta esta pantalla sale del menú público
    // (/menu/{branch_code}), que no expone `cost` a propósito. Pedimos el
    // detalle completo al endpoint de admin para precargar el costo real;
    // si falla (por ejemplo, la ruta todavía no está agregada en el
    // backend), nos quedamos con lo que ya precargamos arriba.
    api
      .get(`/products/${product.id}/detail`)
      .then((res) => {
        const full = res.data.data;
        if (full && full.cost !== undefined && full.cost !== null) {
          setForm((prev) => ({ ...prev, cost: full.cost }));
        }
      })
      .catch(() => {});

    // Cargar qué opciones tiene asignadas actualmente este producto, para precargar el picker.
    setLoadingExtras(true);
    api
      .get(`/products/${product.id}/modifier-settings`)
      .then((res) => {
        const map = {};
        (res.data.data || []).forEach((row) => {
          map[row.modifier_id] = {
            checked: true,
            is_required: !!row.is_required,
            disabled_option_ids: row.disabled_option_ids || [],
          };
        });
        setModifierSelections(map);
      })
      .catch((err) => {
        console.error('Error cargando opciones del producto:', err);
        setModifierSelections({});
      })
      .finally(() => setLoadingExtras(false));
  }, [product]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleComboItem = (productId, checked) => {
    setComboItems((prev) => {
      const next = { ...prev };
      if (checked) next[productId] = 1; else delete next[productId];
      return next;
    });
  };

  const setComboQty = (productId, qty) => {
    setComboItems((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const combo_items = Object.entries(comboItems)
        .filter(([, qty]) => parseInt(qty) > 0)
        .map(([product_id, quantity]) => ({ product_id: parseInt(product_id), quantity: parseInt(quantity) }));

      if (form.is_combo && combo_items.length === 0) {
        alert('Selecciona al menos un producto para armar el combo');
        return;
      }

      const modifiersPayload = Object.entries(modifierSelections)
        .filter(([, cfg]) => cfg.checked)
        .map(([modifier_id, cfg]) => ({
          modifier_id: parseInt(modifier_id),
          is_required: !!cfg.is_required,
          disabled_option_ids: cfg.disabled_option_ids || [],
        }));

      const payload = {
        ...form,
        branch_id: 1,
        combo_items: form.is_combo ? combo_items : [],
        modifiers: modifiersPayload,
      };

      // Si el campo quedó vacío, no lo mandamos: así el backend usa su
      // propio default (crear) o conserva el valor existente (editar), en
      // vez de recibir '' y convertirlo en null.
      if (payload.cost === '' || payload.cost === null) {
        delete payload.cost;
      }

      if (product) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  return {
    form,
    setField,
    comboItems,
    toggleComboItem,
    setComboQty,
    modifierSelections,
    setModifierSelections,
    loadingExtras,
    handleSubmit,
  };
}
