import React from 'react';
import { motion } from 'framer-motion';
import { MenuIcon } from '../../icons';
import UserBadge from './UserBadge';
import BrandLogo from './BrandLogo';

// Barra angosta fija arriba, solo visible en celular/tablet (ver DashboardLayout.css).
const MobileHeader = ({ user, onOpenDrawer }) => (
  <header className="dash-mobile-header">
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      className="dash-hamburger"
      onClick={onOpenDrawer}
      aria-label="Abrir menú"
    >
      <MenuIcon size={22} />
    </motion.button>

    <BrandLogo company={user?.company} size={22} />

    <UserBadge user={user} size={34} compact />
  </header>
);

export default MobileHeader;