import React, { useEffect, useRef, useState } from 'react';

// Modal de cámara en vivo. Pide permiso explícitamente con getUserMedia,
// intenta abrir la cámara TRASERA primero (ideal para fotos de platos) y,
// si el dispositivo no tiene trasera (ej. una laptop), cae a la frontal.
const CameraCaptureModal = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const attachStream = (stream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    setReady(true);
  };

  const describeError = (err) => {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'Necesitamos permiso para usar la cámara. Habilítalo en la configuración del navegador e intenta de nuevo.';
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'No se encontró ninguna cámara en este dispositivo.';
    }
    return 'No se pudo abrir la cámara. Intenta con "Subir archivo" en su lugar.';
  };

  const startCamera = async (preferred) => {
    setError('');
    setReady(false);
    stopCamera();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no permite acceder a la cámara acá. Si estás probando desde el celular con una IP local (http://), usa HTTPS o "Subir archivo" en su lugar.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: preferred } },
        audio: false,
      });
      attachStream(stream);
      setFacingMode(preferred);
    } catch (err) {
      // Si pedimos trasera y no existe (ej. laptop sin cámara trasera), probamos con cualquier cámara disponible
      if (preferred === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });
          attachStream(fallbackStream);
          setFacingMode('user');
        } catch (err2) {
          setError(describeError(err2));
        }
      } else {
        setError(describeError(err));
      }
    }
  };

  const switchCamera = () => {
    startCamera(facingMode === 'environment' ? 'user' : 'environment');
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.92)', zIndex: 700,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 480, marginBottom: 12 }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 16 }}>📷 Tomar foto</h3>
        <button type="button" onClick={handleClose} style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{
        width: '100%', maxWidth: 480, aspectRatio: '4 / 3', borderRadius: 12, overflow: 'hidden',
        background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {error ? (
          <p style={{ color: '#ef4444', fontSize: 13, padding: 24, textAlign: 'center' }}>{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ display: 'flex', gap: 10, marginTop: 16, width: '100%', maxWidth: 480 }}>
        {!error && (
          <button
            type="button"
            onClick={switchCamera}
            className="btn"
            style={{ background: '#334155', color: '#e2e8f0', flex: 1 }}
            title="Cambiar entre cámara trasera y frontal"
          >
            🔄 Cambiar cámara
          </button>
        )}
        {error ? (
          <button type="button" onClick={() => startCamera('environment')} className="btn btn-primary" style={{ flex: 1 }}>
            Reintentar
          </button>
        ) : (
          <button type="button" onClick={capture} disabled={!ready} className="btn btn-success" style={{ flex: 2 }}>
            📸 Capturar foto
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCaptureModal;