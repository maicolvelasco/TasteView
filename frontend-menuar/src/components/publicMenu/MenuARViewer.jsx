import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Eye, X } from 'lucide-react';

/**
 * Visor de Realidad Aumentada de un producto. Se apoya en el web component
 * <model-viewer> (Google), que se asume registrado globalmente vía script
 * en public/index.html — igual que en la versión anterior de esta pantalla.
 * El fondo se mantiene oscuro a propósito: es la convención estándar de los
 * visores AR/3D (deja ver mejor la cámara y el modelo), independiente del
 * tema claro corporativo del resto de la app.
 */
const MenuARViewer = ({ modelUrl, onClose }) => (
  <AnimatePresence>
    {modelUrl && (
      <motion.div
        className="ar-viewer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="ar-viewer-panel"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="ar-viewer-header">
            <h3 className="ar-viewer-title">
              <Eye size={18} strokeWidth={2} />
              Realidad Aumentada
            </h3>
            <button type="button" className="ar-viewer-close" onClick={onClose} aria-label="Cerrar visor AR">
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="ar-viewer-stage">
            {/* eslint-disable-next-line react/no-unknown-property */}
            <model-viewer
              src={modelUrl}
              alt="Modelo 3D del platillo"
              camera-controls="true"
              auto-rotate="true"
              ar="true"
              ar-modes="webxr scene-viewer quick-look"
              shadow-intensity="1"
              exposure="1"
              className="ar-viewer-model"
            >
              <button slot="ar-button" className="ar-viewer-ar-btn">
                <Smartphone size={16} strokeWidth={2} />
                Ver en tu espacio
              </button>
            </model-viewer>
          </div>

          <p className="ar-viewer-hint">
            Toca el botón y apunta tu cámara a una superficie plana para ver el plato en AR.
          </p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MenuARViewer;
