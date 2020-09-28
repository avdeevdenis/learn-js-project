import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './orders-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

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
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));

    const rangePicker = new RangePicker({
      from,
      to
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?_start=1&_end=20&_sort=createdAt&_order=desc&createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      isSortLocally: true
    });

    this.components.sortableTable = sortableTable;
    this.components.rangePicker = rangePicker;
  }

  get template() {
    return `
        <div class="sales full-height flex-column">
          <div class="content__top-panel">
            <h1 class="page-title">Продажи</h1>
            <!-- RangePicker component -->
            <div data-element="rangePicker"></div>
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

  onDateSelect = event => {
    const { from, to } = event.detail;

    this.updateTableComponent(from, to);
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', this.onDateSelect);
  }

  removeEventListeners() {
    this.components.rangePicker.element.removeEventListener('date-select', this.onDateSelect);
  }

  destroy() {
    this.removeEventListeners();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
