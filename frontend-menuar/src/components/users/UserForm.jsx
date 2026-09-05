import React, { useState } from 'react';
import { UserPlus, Save, User, Mail, Lock, Phone, Shield, Building2, Hash, CheckSquare } from 'lucide-react';

/**
 * Formulario de creación/edición de usuarios.
 * Recibe `initialData` (vacío para crear, o datos del usuario a editar)
 * y llama a `onSave(formData)` al enviar.
 * El modal que lo contiene (FormModal) gestiona el overlay y el cierre.
 */
const UserForm = ({ initialData, roles = [], branches = [], onSave, saving = false }) => {
  const [form, setForm] = useState({
    name:      initialData?.name      ?? '',
    email:     initialData?.email     ?? '',
    password:  '',
    role_id:   initialData?.role_id   ?? '',
    branch_id: initialData?.branch_id ?? '',
    phone:     initialData?.phone     ?? '',
    pin_code:  initialData?.pin_code  ?? '',
    is_active: initialData?.is_active ?? true,
  });

  const isEditing = Boolean(initialData?.id);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="user-form" noValidate>

      {/* ── Fila 1: Nombre completo ── */}
      <div className="form-field">
        <label htmlFor="uf-name">
          <User size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
          Nombre completo
        </label>
        <input
          id="uf-name"
          type="text"
          className="input"
          placeholder="Ej.: María González"
          value={form.name}
          onChange={set('name')}
          required
          autoComplete="off"
        />
      </div>

      {/* ── Fila 2: Email + Teléfono ── */}
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="uf-email">
            <Mail size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Correo electrónico
          </label>
          <input
            id="uf-email"
            type="email"
            className="input"
            placeholder="usuario@empresa.com"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label htmlFor="uf-phone">
            <Phone size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Teléfono <span className="form-field-optional">(opcional)</span>
          </label>
          <input
            id="uf-phone"
            type="tel"
            className="input"
            placeholder="Ej.: 70123456"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="off"
          />
        </div>
      </div>

      {/* ── Fila 3: Contraseña ── */}
      <div className="form-field">
        <label htmlFor="uf-password">
          <Lock size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
          Contraseña
          {isEditing && (
            <span className="form-field-optional"> (dejar vacío para no cambiar)</span>
          )}
        </label>
        <input
          id="uf-password"
          type="password"
          className="input"
          placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
          value={form.password}
          onChange={set('password')}
          {...(!isEditing && { required: true, minLength: 8 })}
          autoComplete="new-password"
        />
      </div>

      {/* ── Fila 4: Rol + Sucursal ── */}
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="uf-role">
            <Shield size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Rol
          </label>
          <select
            id="uf-role"
            className="input"
            value={form.role_id}
            onChange={set('role_id')}
            required
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="uf-branch">
            <Building2 size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Sucursal
          </label>
          <select
            id="uf-branch"
            className="input"
            value={form.branch_id}
            onChange={set('branch_id')}
            required
          >
            <option value="">Seleccionar sucursal...</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Fila 5: PIN + Activo ── */}
      <div className="form-field-row">
        <div className="form-field">
          <label htmlFor="uf-pin">
            <Hash size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            PIN de acceso rápido <span className="form-field-optional">(opcional)</span>
          </label>
          <input
            id="uf-pin"
            type="text"
            className="input"
            placeholder="Ej.: 1234"
            value={form.pin_code}
            onChange={set('pin_code')}
            maxLength={8}
            autoComplete="off"
          />
        </div>

        <div className="form-field form-field--center">
          <label className="form-checkbox" htmlFor="uf-active">
            <CheckSquare size={12} strokeWidth={2.5} style={{ marginRight: 5 }} />
            Estado
          </label>
          <label className="form-checkbox" htmlFor="uf-active">
            <input
              id="uf-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Usuario activo
          </label>
        </div>
      </div>

      {/* ── Acción principal ── */}
      <button
        type="submit"
        className="form-submit-btn"
        disabled={saving}
      >
        {saving
          ? <>Guardando...</>
          : isEditing
            ? <><Save size={16} strokeWidth={2} /> Guardar cambios</>
            : <><UserPlus size={16} strokeWidth={2} /> Crear usuario</>
        }
      </button>
    </form>
  );
};

export default UserForm;
