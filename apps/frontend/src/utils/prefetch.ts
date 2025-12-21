type ImportFunction = () => Promise<unknown>;

const prefetchedModules = new Set<string>();

export function prefetchComponent(importFn: ImportFunction, name: string): void {
  if (prefetchedModules.has(name)) return;
  
  prefetchedModules.add(name);
  importFn().catch(() => {
    prefetchedModules.delete(name);
  });
}

export function prefetchOnIdle(importFn: ImportFunction, name: string): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => prefetchComponent(importFn, name), { timeout: 2000 });
  } else {
    setTimeout(() => prefetchComponent(importFn, name), 100);
  }
}

export function prefetchCriticalPages(): void {
  prefetchOnIdle(() => import('../features/category'), 'category');
  prefetchOnIdle(() => import('../features/productDetail'), 'productDetail');
  prefetchOnIdle(() => import('../features/search'), 'search');
  prefetchOnIdle(() => import('../features/cart/pages/CartPage'), 'cart');
  prefetchOnIdle(() => import('../features/login'), 'login');
  prefetchOnIdle(() => import('../features/profile'), 'profile');
}

export function prefetchSecondaryPages(): void {
  prefetchOnIdle(() => import('../features/wishlist'), 'wishlist');
  prefetchOnIdle(() => import('../features/orderHistory/pages/OrderHistoryPage'), 'orderHistory');
  prefetchOnIdle(() => import('../features/payment/pages/CheckoutPage'), 'checkout');
  prefetchOnIdle(() => import('../features/coupon'), 'coupon');
  prefetchOnIdle(() => import('../features/point'), 'point');
}
