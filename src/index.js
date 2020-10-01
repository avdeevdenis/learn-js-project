import Router from './router/index.js';
import tooltip from './components/tooltip/index.js';
import sidebar from './utils/sidebar.js';

tooltip.initialize();
sidebar.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard', 'dashboard')
  .addRoute(/^products$/, 'products/list', 'products')
  .addRoute(/^products\/add$/, 'products/edit', 'products')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit', 'products')
  .addRoute(/^sales$/, 'sales', 'sales')
  .addRoute(/^categories$/, 'categories', 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();
