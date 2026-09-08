import { useEffect } from 'react';
import { applyThemeVariables, resetThemeVariables } from '../utils/theme';

/**
 * Aplica el tema de colores del negocio (Ajustes > Negocio > Colores)
 * sobreescribiendo las variables CSS de src/index.css al instante, sin
 * recompilar nada. Al desmontar (o si el tema cambia a null), restaura
 * los valores por defecto — por ejemplo, si un Super Admin navega entre
 * pantallas de dos empresas con temas distintos.
 */
export default function useAppliedTheme(theme) {
  const mode = theme?.mode;
  const primary = theme?.primary;
  const secondary = theme?.secondary;
  const font = theme?.font;

  useEffect(() => {
    if (!primary) return undefined;
    applyThemeVariables({ mode, primary, secondary, font });
    return () => resetThemeVariables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, primary, secondary, font]);
}
