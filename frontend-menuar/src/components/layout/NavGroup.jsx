import React, { useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavIcon, ChevronDown } from '../../icons';
import { cn } from '../../utils/classNames';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useClickOutside } from '../../hooks/useClickOutside';
import NavLink from './NavLink';

// Ítem de navegación con submenú. Un mismo componente cubre los dos casos:
// - variant="dropdown" (PC): panel flotante que se cierra al hacer click afuera.
// - variant="accordion" (cajón móvil/tablet): se despliega hacia abajo in-place.
const NavGroup = ({ group, active, variant, isSubActive, onNavigate }) => {
  const { isOpen, toggle, close } = useDisclosure(false);
  const ref = useRef(null);
  const noop = useCallback(() => {}, []);

  useClickOutside(ref, variant === 'dropdown' ? close : noop);

  const isDropdown = variant === 'dropdown';

  return (
    <div ref={ref} className={isDropdown ? 'dash-dropdown' : undefined}>
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ y: isDropdown ? -1 : 0 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={isOpen}
        className={cn('dash-navlink', active && 'active')}
        style={{
          width: isDropdown ? undefined : '100%',
          justifyContent: isDropdown ? undefined : 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavIcon name={group.icon} />
          <span>{group.label}</span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', marginLeft: isDropdown ? 2 : 0 }}
        >
          <ChevronDown size={14} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isDropdown ? { opacity: 0, y: -6, scale: 0.98 } : { height: 0, opacity: 0 }}
            animate={isDropdown ? { opacity: 1, y: 0, scale: 1 } : { height: 'auto', opacity: 1 }}
            exit={isDropdown ? { opacity: 0, y: -6, scale: 0.98 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.17, ease: 'easeOut' }}
            className={isDropdown ? 'dash-dropdown-panel' : 'dash-drawer-submenu'}
            style={!isDropdown ? { overflow: 'hidden' } : undefined}
          >
            {group.items.map((sub) => (
              <NavLink
                key={sub.path}
                icon={sub.icon}
                label={sub.label}
                active={isSubActive(sub.path)}
                fullWidth
                onClick={() => { onNavigate(sub.path); close(); }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavGroup;