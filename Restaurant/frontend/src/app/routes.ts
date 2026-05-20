import { createBrowserRouter, redirect } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Orders } from './components/Orders';
import { Kitchen } from './components/Kitchen';
import { MenuPage } from './components/Menu';
import { Reports } from './components/Reports';
import { Profile } from './components/Profile';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, loader: () => redirect('/login') },
      { path: 'dashboard', Component: Dashboard },
      { path: 'orders', Component: Orders },
      { path: 'kitchen', Component: Kitchen },
      { path: 'menu', Component: MenuPage },
      { path: 'reports', Component: Reports },
      { path: 'profile', Component: Profile },
    ],
  },
]);
