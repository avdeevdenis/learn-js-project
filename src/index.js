import Router from './router/index';
import tooltip from './components/tooltip/index';
import sidebar from './utils/sidebar';

tooltip.initialize();
sidebar.initialize();

const router = Router.instance();

console.log('router', router);

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
