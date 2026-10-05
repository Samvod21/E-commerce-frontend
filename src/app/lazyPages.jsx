import { lazy } from 'react';

export const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
export const ProductDetails = lazy(() => import('./pages/ProductDetails').then((module) => ({ default: module.ProductDetails })));
export const Cart = lazy(() => import('./pages/Cart').then((module) => ({ default: module.Cart })));
export const Checkout = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.Checkout })));
export const OrderHistory = lazy(() => import('./pages/OrderHistory').then((module) => ({ default: module.OrderHistory })));
export const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
export const Login = lazy(() => import('./pages/Login'));
export const Signup = lazy(() => import('./pages/Signup'));