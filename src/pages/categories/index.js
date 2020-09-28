import Category from '../../components/category/index.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async initComponents() {
    const data = await fetchJson('https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory');
    const categories = new Category(data);

    this.components.categories = categories;
  }

  get template() {
    return `
        <div class="sales full-height flex-column">
          <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
          </div>
          <div data-element="categoriesContainer"></div>
        </div>
      `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderCategories();

    return this.element;
  }

  renderCategories() {
    [...this.components.categories.element].forEach(categoryElement => {
      this.subElements.categoriesContainer.append(categoryElement);
    });
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
