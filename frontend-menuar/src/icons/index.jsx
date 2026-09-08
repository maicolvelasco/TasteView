import React from 'react';
import {
  ClipboardList,
  ChefHat,
  Wallet,
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  SlidersHorizontal,
  Armchair,
  CalendarCheck,
  Building2,
  BarChart3,
  Users,
  Store,
  Settings,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';

// Mapa único: clave de texto -> componente de ícono. utils/navigation.js
// (lógica pura) solo conoce estas claves, nunca importa lucide-react
// directamente — así cambiar de librería de íconos el día de mañana
// implica tocar un solo archivo, no cada lugar donde se usa un ícono.
const ICON_MAP = {
  clipboardList: ClipboardList,
  chefHat: ChefHat,
  wallet: Wallet,
  layoutDashboard: LayoutDashboard,
  utensils: UtensilsCrossed,
  folderTree: FolderTree,
  sliders: SlidersHorizontal,
  armchair: Armchair,
  calendarCheck: CalendarCheck,
  building: Building2,
  barChart: BarChart3,
  users: Users,
  store: Store,
  settings: Settings,
  userProfile: User,
};

export function NavIcon({ name, size = 17, strokeWidth = 2, ...rest }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={strokeWidth} {...rest} />;
}

// Íconos de "chrome" del layout (no del árbol de navegación) se exportan directo.
export { Menu as MenuIcon, X, ChevronDown, LogOut };