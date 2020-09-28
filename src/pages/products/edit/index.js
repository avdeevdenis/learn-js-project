import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(id = '') {
    this.id = id;
  }

  async updateTableComponent(from, to) {
    const options = {
      start: 1,
      end: 20,
      createdAt_gte: from.toISOString(),
      createdAt_lte: to.toISOString()
    };

    await this.components.sortableTable.update(options);
  }

  async initComponents() {
    const productForm = new ProductForm(this.id);
    await productForm.render();

    this.components.productForm = productForm;
  }

  get template() {
    return `
        <div class="products-edit">
          <div class="content__top-panel">
            <h1 class="page-title">
              <a href="/products" class="link">Товары</a> / Редактировать
            </h1>
          </div>
          <div class="content-box">
            <div data-element="productForm" class="product-form"></div> 
          </div>
        </div>
      `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
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
