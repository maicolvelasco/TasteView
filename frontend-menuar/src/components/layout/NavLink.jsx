import React from 'react';
import { motion } from 'framer-motion';
import { NavIcon } from '../../icons';
import { cn } from '../../utils/classNames';

// Botón de navegación individual (sin submenú). Un leve "levantamiento" al
// pasar el mouse y una compresión al hacer click le dan la sensación de
// interactividad, sin exagerar (nada de rebotes ni giros llamativos).
const NavLink = ({ icon, label, active, onClick, fullWidth = false, justify }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.97 }}
    className={cn('dash-navlink', active && 'active')}
    style={{ width: fullWidth ? '100%' : undefined, justifyContent: justify }}
  >
    <NavIcon name={icon} />
    <span>{label}</span>
  </motion.button>
);

export default NavLink;