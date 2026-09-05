import React, { useRef, useState } from 'react';
import { Camera, ImageIcon, Trash2, Upload } from 'lucide-react';
import api from '../services/api';
import CameraCaptureModal from './CameraCaptureModal';

// Botón para poner la foto de un producto/categoría. Ofrece DOS acciones bien
// diferenciadas en vez de dejar que el navegador decida:
// - "Tomar foto": abre una cámara en vivo (pide permiso, prueba la trasera primero).
// - "Subir archivo": abre el explorador de archivos/galería normal.
const ImageUploadButton = ({ value, onChange, label = 'Imagen' }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Solo para mostrar: el nombre del archivo, no la URL completa (http://...)
  const displayName = value ? decodeURIComponent(value.split('/').pop()) : '';

  const uploadFile = async (file) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadFile(file);
  };

  const handleCameraCapture = (file) => {
    setShowCamera(false);
    uploadFile(file);
  };

  return (
    <div className="image-upload-field">
      <label>{label}</label>
      <div className="image-upload-row">
        <div className="image-upload-thumb" style={value ? { backgroundImage: `url(${value})` } : undefined}>
          {!value && <ImageIcon size={22} />}
        </div>
        <div className="image-upload-controls">
          <input
            type="text"
            className="input"
            placeholder="Sin imagen todavía"
            value={displayName}
            readOnly
          />
          <div className="image-upload-actions">
            <button type="button" onClick={() => setShowCamera(true)} disabled={uploading} className="admin-action-btn admin-action-btn--duplicate">
              <Camera size={13} /> Tomar foto
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="admin-action-btn admin-action-btn--duplicate">
              <Upload size={13} /> Subir archivo
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className="admin-action-btn admin-action-btn--delete">
                <Trash2 size={13} /> Quitar
              </button>
            )}
          </div>
          {uploading && <p className="image-upload-hint">Subiendo...</p>}
          {/* Sin "capture": esto SIEMPRE abre el explorador de archivos/galería, nunca la cámara directamente */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />
          {error && <p className="image-upload-error">{error}</p>}
        </div>
      </div>

      {showCamera && (
        <CameraCaptureModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
};

export default ImageUploadButton;
