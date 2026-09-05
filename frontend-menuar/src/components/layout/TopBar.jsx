import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from '../../icons';
import NavLink from './NavLink';
import NavGroup from './NavGroup';
import UserBadge from './UserBadge';
import { isPathActive, isGroupActive } from '../../utils/navigation';

// Barra horizontal fija arriba, solo visible en PC (ver DashboardLayout.css).
const TopBar = ({ navItems, pathname, onNavigate, user, onLogout }) => (
  <header className="dash-topbar">
    <span className="dash-brand" style={{ fontSize: 18 }}>🍽️ Restaurant AR</span>

    <nav className="dash-topnav">
      {navItems.map((item) => (
        item.type === 'link' ? (
          <NavLink
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={isPathActive(pathname, item.path)}
            onClick={() => onNavigate(item.path)}
          />
        ) : (
          <NavGroup
            key={item.key}
            group={item}
            variant="dropdown"
            active={isGroupActive(pathname, item)}
            isSubActive={(p) => isPathActive(pathname, p)}
            onNavigate={onNavigate}
          />
        )
      ))}
    </nav>

    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <UserBadge user={user} align="right" />
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={onLogout}
        className="btn dash-logout-btn"
      >
        <LogOut size={15} />
        Salir
      </motion.button>
    </div>
  </header>
);

export default TopBar;