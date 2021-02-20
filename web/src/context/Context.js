import { createContext } from 'react';

const AppContext = createContext({
  isFluid: true,
  isRTL: false,
  isDark: true,
  showBurgerMenu: false, // controls showing vertical nav on mobile
  currency: '$',
  isNavbarVerticalCollapsed: false,
  navbarStyle: 'vibrant',
  language: 'zh_cn',
});

export const EmailContext = createContext({ emails: [] });

export const ProductContext = createContext({ products: [] });

export const FeedContext = createContext({ feeds: [] });

export const AuthWizardContext = createContext({ user: {} });

export const ChatContext = createContext();

export const KanbanContext = createContext({ KanbanColumns: [], kanbanTasks: [] });

export default AppContext;
