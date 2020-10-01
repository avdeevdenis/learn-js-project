import renderPage from './render-page';

// performs routing on all links
export default class Router {
  constructor() {
    this.routes = [];

    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');

      if (href && href.startsWith('/')) {
        event.preventDefault();
        this.navigate(href);
      }
    });
  }

  static instance() {
    if (!this.selfInstance) {
      this.selfInstance = new Router();
    }
    return this.selfInstance;
  }

  async route() {
    const strippedPath = decodeURI(window.location.pathname)
      .replace(/^\/|\/$/, '');

    let match;
    let pageName = '';

    for (const route of this.routes) {
      match = strippedPath.match(route.pattern);

      if (match) {
        this.page = await this.changePage(route.path, match);
        pageName = route.name;
        break;
      }
    }

    if (!match) {
      this.page = await this.changePage(this.notFoundPagePath);
    }

    document.dispatchEvent(new CustomEvent('route', {
      detail: {
        page: this.page,
        pageName,
      },
    }));
  }

  async changePage(path, match) {
    if (this.page && this.page.destroy) {
      this.page.destroy();
    }

    return await renderPage(path, match);
  }

  navigate(path) {
    history.pushState(null, null, path);
    this.route();
  }

  addRoute(pattern, path, name) {
    this.routes.push({ pattern, path, name });
    return this;
  }

  setNotFoundPagePath(path) {
    this.notFoundPagePath = path;
    return this;
  }

  listen() {
    window.addEventListener('popstate', () => this.route());
    this.route();
  }
}
