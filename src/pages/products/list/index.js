import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';

import header from './list-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onRangeSelect = this.onRangeSelect.bind(this);
    this.onFilterStatusChange = this.onFilterStatusChange.bind(this);
  }

  async initComponents() {
    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000,
      formatValue: value => '$' + value
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=1&_end=20',
      isSortLocally: true
    });

    this.components.doubleSlider = doubleSlider;
    this.components.sortableTable = sortableTable;
  }

  get template() {
    return `
        <div class="products-list">
          <div class="content__top-panel">
            <h1 class="page-title">Товары</h1>
            <a href="/products/add" class="button-primary">Добавить товар</a>
          </div>
          <div class="content-box content-box_small">

          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Сортировать по:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
            </div>

            <div class="form-group" data-element="doubleSlider">
              <label class="form-label">Цена:</label>
            </div>

              <div class="form-group">
                <label class="form-label">Статус:</label>
                <select class="form-control" data-element="filterStatus">
                  <option value="" selected="">Любой</option>
                  <option value="1">Активный</option>
                  <option value="0">Неактивный</option>
                </select>
              </div>
            </form>
          </div>

          <div class="full-height flex-column">
            <!-- SortableTable component -->
            <div data-element="sortableTable"></div> 
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
    this.initEventListeners();

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

  async onTitleChange(event) {
    const value = event.target.value.trim().toLocaleLowerCase();

    const options = {
      title_like: value,
      start: 1,
      end: SortableTable.step
    };

    await this.components.sortableTable.update(options);
  }

  async onRangeSelect(event) {
    const { from, to } = event.detail;

    const options = {
      price_gte: from,
      price_lte: to,
      start: 1,
      end: SortableTable.step
    };

    await this.components.sortableTable.update(options);
  }

  async onFilterStatusChange(event) {
    const value = event.target.value;

    const options = {
      status: value,
      start: 1,
      end: SortableTable.step
    };

    await this.components.sortableTable.update(options);
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener('keyup', this.onTitleChange);
    this.subElements.doubleSlider.addEventListener('range-select', this.onRangeSelect);
    this.subElements.filterStatus.addEventListener('change', this.onFilterStatusChange);
  }

  removeEventListeners() {
    this.subElements.filterName.removeEventListener('keyup', this.onTitleChange);
    this.subElements.doubleSlider.removeEventListener('range-select', this.onRangeSelect);
    this.subElements.filterStatus.removeEventListener('change', this.onFilterStatusChange);
  }

  destroy() {
    this.removeEventListeners();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
