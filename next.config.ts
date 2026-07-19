import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'exam.mfah.me' },
    ],
  },
  // Disable static page caching during dev/iteration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Express backend on :2002 — singular /product/, NOT /products/
      { source: '/product/:path+', destination: 'http://127.0.0.1:2002/product/:path+' },
      { source: '/auth/:path+', destination: 'http://127.0.0.1:2002/auth/:path+' },
      { source: '/user/:path+', destination: 'http://127.0.0.1:2002/user/:path+' },
      { source: '/reg/:path+', destination: 'http://127.0.0.1:2002/reg/:path+' },
      { source: '/keeplogin/:path+', destination: 'http://127.0.0.1:2002/keeplogin/:path+' },
      { source: '/productdetail/:path+', destination: 'http://127.0.0.1:2002/productdetail/:path+' },
      { source: '/cart/cart', destination: 'http://127.0.0.1:2002/cart/cart' },
      { source: '/cart/cartproduct', destination: 'http://127.0.0.1:2002/cart/cartproduct' },
      { source: '/cart/editalamat', destination: 'http://127.0.0.1:2002/cart/editalamat' },
      { source: '/cart/getprotectcart', destination: 'http://127.0.0.1:2002/cart/getprotectcart' },
      { source: '/cartp/:path+', destination: 'http://127.0.0.1:2002/cartp/:path+' },
      { source: '/wishlist/:path+', destination: 'http://127.0.0.1:2002/wishlist/:path+' },
      { source: '/deletewishlist/:path+', destination: 'http://127.0.0.1:2002/deletewishlist/:path+' },
      { source: '/cartplus/:path+', destination: 'http://127.0.0.1:2002/cartplus/:path+' },
      { source: '/editcart/:path+', destination: 'http://127.0.0.1:2002/editcart/:path+' },
      { source: '/deletecart/:path+', destination: 'http://127.0.0.1:2002/deletecart/:path+' },
      { source: '/listorder/:path+', destination: 'http://127.0.0.1:2002/listorder/:path+' },
      { source: '/order/:path+', destination: 'http://127.0.0.1:2002/order/:path+' },
      { source: '/orders/:path+', destination: 'http://127.0.0.1:2002/orders/:path+' },
      { source: '/orderdetail/:path+', destination: 'http://127.0.0.1:2002/orderdetail/:path+' },
      { source: '/confirm/:path+', destination: 'http://127.0.0.1:2002/confirm/:path+' },
      { source: '/promo/:path+', destination: 'http://127.0.0.1:2002/promo/:path+' },
      { source: '/confirmtrx/:path+', destination: 'http://127.0.0.1:2002/confirmtrx/:path+' },
      { source: '/invoice/:path+', destination: 'http://127.0.0.1:2002/invoice/:path+' },
      { source: '/rating/:path+', destination: 'http://127.0.0.1:2002/rating/:path+' },
      { source: '/users/:path+', destination: 'http://127.0.0.1:2002/users/:path+' },
      { source: '/trx/:path+', destination: 'http://127.0.0.1:2002/trx/:path+' },
      { source: '/join/:path+', destination: 'http://127.0.0.1:2002/join/:path+' },
      { source: '/productlist/:path+', destination: 'http://127.0.0.1:2002/productlist/:path+' },
      { source: '/category/:path+', destination: 'http://127.0.0.1:2002/category/:path+' },
      { source: '/cat/:path+', destination: 'http://127.0.0.1:2002/cat/:path+' },
      { source: '/dashboard/:path+', destination: 'http://127.0.0.1:2002/dashboard/:path+' },
    ];
  },
};

export default nextConfig;
