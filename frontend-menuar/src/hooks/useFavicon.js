import { useEffect } from 'react';

/**
 * Cambia el ícono de la pestaña del navegador (favicon) al logo del
 * negocio, una vez que se conoce su URL (Ajustes > Negocio). Si todavía
 * no hay logo configurado, no toca nada — queda el favicon por defecto
 * del proyecto (public/favicon.ico).
 *
 * Los favicons no se pueden cambiar por CSS ni son un <img> normal: hay
 * que reescribir el atributo `href` del/los <link rel="icon"> del
 * documento en caliente. Al desmontar, se restaura el favicon que había
 * antes, para no dejar "pegado" el logo de un negocio en otra pantalla
 * que no debería mostrarlo (por ejemplo, si SuperAdmin navega entre
 * empresas distintas).
 */
export default function useFavicon(logoUrl) {
  useEffect(() => {
    if (!logoUrl) return undefined;

    let links = Array.from(document.querySelectorAll("link[rel*='icon']"));
    const previous = links.map((link) => link.getAttribute('href'));

    if (links.length === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
      links = [link];
      previous.push(null);
    }

    links.forEach((link) => link.setAttribute('href', logoUrl));

    return () => {
      links.forEach((link, i) => {
        if (previous[i]) link.setAttribute('href', previous[i]);
        else link.removeAttribute('href');
      });
    };
  }, [logoUrl]);
}
