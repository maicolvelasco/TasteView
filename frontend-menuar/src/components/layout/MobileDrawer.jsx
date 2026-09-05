import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogOut } from '../../icons';
import NavLink from './NavLink';
import NavGroup from './NavGroup';
import UserBadge from './UserBadge';
import { isPathActive, isGroupActive } from '../../utils/navigation';

// Cajón lateral deslizable (celular y tablet). Se monta/desmonta con
// AnimatePresence para poder animar la salida, no solo la entrada.
const MobileDrawer = ({ isOpen, onClose, navItems, pathname, onNavigate, user, onLogout }) => (
  <AnimatePresence>
    {isOpen && (
      <React.Fragment>
        <motion.div
          className="dash-drawer-backdrop open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.aside
          className="dash-drawer open"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          <div className="dash-drawer-header">
            <span className="dash-brand">🍽️ Restaurant AR</span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              className="dash-hamburger"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </motion.button>
          </div>

          <nav className="dash-drawer-nav">
            {navItems.map((item) => (
              item.type === 'link' ? (
                <NavLink
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  active={isPathActive(pathname, item.path)}
                  fullWidth
                  onClick={() => onNavigate(item.path)}
                />
              ) : (
                <NavGroup
                  key={item.key}
                  group={item}
                  variant="accordion"
                  active={isGroupActive(pathname, item)}
                  isSubActive={(p) => isPathActive(pathname, p)}
                  onNavigate={onNavigate}
                />
              )
            ))}
          </nav>

          <div className="dash-drawer-footer">
            <UserBadge user={user} />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onLogout}
              className="btn dash-logout-btn"
              style={{ width: '100%', marginTop: 14 }}
            >
              <LogOut size={15} />
              Cerrar Sesión
            </motion.button>
          </div>
        </motion.aside>
      </React.Fragment>
    )}
  </AnimatePresence>
);

export default MobileDrawer;