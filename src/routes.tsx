import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import { ProtectedRoute } from '@/lib/auth/auth-client';

const isDevelopment = import.meta.env.MODE === 'development';
const NotFoundPage = isDevelopment ? lazy(() => import('../dev-tools/src/PageNotFound')) : lazy(() => import('./pages/_404'));
const ListingsPage = lazy(() => import('./pages/listings'));
const ListingDetailPage = lazy(() => import('./pages/listing/[id]'));
const SellPage = lazy(() => import('./pages/sell'));
const AuthPage = lazy(() => import('./pages/auth'));
const LoginPage = lazy(() => import('./pages/auth/login'));
const ChatPage = lazy(() => import('./pages/chat'));
const ProfilePage = lazy(() => import('./pages/profile'));
const PremiumPage = lazy(() => import('./pages/premium'));

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/listings', element: <ListingsPage /> },
  { path: '/listing/:id', element: <ListingDetailPage /> },
  { path: '/sell', element: <ProtectedRoute><SellPage /></ProtectedRoute> },
  { path: '/auth', element: <AuthPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: '/premium', element: <PremiumPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export type Path = '/' | '/listings' | '/sell' | '/auth' | '/auth/login' | '/chat' | '/profile';
export type Params = Record<string, string | undefined>;
