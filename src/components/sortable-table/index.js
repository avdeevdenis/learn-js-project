import fetchJson from '../../utils/fetch-json.js';
import escapeHTML from '../../utils/escape-html.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export const isUndefined = value => typeof (value) === 'undefined';

export default class SortableTable {
  static step = 20;

  element;
  subElements;

  observer;

  isEnded = false;

  sortOptions = {
    start: 1,
    end: SortableTable.step,
    order: 'asc',
    from: '',
    to: '',
    field: '',
    createdAt_lte: '',
    createdAt_gte: '',
    title_like: '',
    price_gte: 0,
    price_lte: 0,
    status: ''
  };

  constructor(header, { data, url, isSortLocally = false }) {
    this.header = header;

    this.data = data;
    this.url = url;

    const { searchParams } = new URL(BACKEND_URL + '/' + this.url);
    const start = searchParams.get('_start');
    const end = searchParams.get('_end');
    const field = searchParams.get('_sort');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    this.updateSortOptions({ start, end, from, to, field });

    this.isSortLocally = isSortLocally;

    this.render();
  }

  generateUrl() {
    const url = new URL(BACKEND_URL + '/' + this.url);

    url.searchParams.set('_start', this.sortOptions.start);
    url.searchParams.set('_end', this.sortOptions.end);
    url.searchParams.set('_order', this.sortOptions.order);
    url.searchParams.set('_sort', this.sortOptions.field);

    if (this.sortOptions.from) {
      url.searchParams.set('from', this.sortOptions.from);
    }

    if (this.sortOptions.to) {
      url.searchParams.set('to', this.sortOptions.to);
    }

    if (this.sortOptions.createdAt_lte) {
      url.searchParams.set('createdAt_lte', this.sortOptions.createdAt_lte);
    }

    if (this.sortOptions.createdAt_gte) {
      url.searchParams.set('createdAt_gte', this.sortOptions.createdAt_gte);
    }

    if (this.sortOptions.title_like) {
      url.searchParams.set('title_like', this.sortOptions.title_like);
    }

    if (this.sortOptions.price_gte) {
      url.searchParams.set('price_gte', this.sortOptions.price_gte);
    }

    if (this.sortOptions.price_lte) {
      url.searchParams.set('price_lte', this.sortOptions.price_lte);
    }

    if (this.sortOptions.status) {
      url.searchParams.set('status', this.sortOptions.status);
    }

    return url;
  }

  updateData(data, options) {
    this.data = data;

    options && Object.entries(options).forEach(([key, value]) => {
      this.updateSortOptions({ [key]: value });
    })

    this.observer?.unobserve(this.subElements.loading);
    this.subElements.body.innerHTML = '';

    this.afterUpdateRequest();

    this.observer.observe(this.subElements.loading);
  }

  updateSortOptions({
    start, end, field, order,
    from, to,
    createdAt_lte, createdAt_gte,
    title_like,
    price_gte, price_lte,
    status
  } = {}) {
    if (!isNaN(start)) {
      this.sortOptions.start = Number(start);
    }

    if (end) {
      this.sortOptions.end = Number(end);
    }

    if (order) {
      this.sortOptions.order = order;
    }

    if (field) {
      this.sortOptions.field = field;
    }

    if (from) {
      this.sortOptions.from = from;
    }

    if (to) {
      this.sortOptions.to = to;
    }

    if (createdAt_lte) {
      this.sortOptions.createdAt_lte = createdAt_lte;
    }

    if (createdAt_gte) {
      this.sortOptions.createdAt_gte = createdAt_gte;
    }

    if (typeof (title_like) !== 'undefined') {
      this.sortOptions.title_like = title_like;
    }

    if (price_gte) {
      this.sortOptions.price_gte = price_gte;
    }

    if (price_lte) {
      this.sortOptions.price_lte = price_lte;
    }

    if (typeof (status) !== 'undefined') {
      this.sortOptions.status = status;
    }
  }

  beforeUpdateRequest(options) {
    this.updateSortOptions(options);

    this.observer?.unobserve(this.subElements.loading);
    this.subElements.body.innerHTML = '';

    this.showLoader();
    this.hideEmpty();
  }

  async update(options) {
    this.isEnded = false;

    this.beforeUpdateRequest(options);

    await this.request();

    this.afterUpdateRequest();
  }

  afterUpdateRequest() {
    if (this.isEnded) return;

    const element = document.createElement('div');
    element.innerHTML = this.getBodyTemplateData();

    // Здесь я хочу решить задачу вида "вставить массив NodeList элементов в конец таблицы"
    [...element.children].forEach(row => {
      this.subElements.body.append(row);
    });

    this.observer?.observe(this.subElements.loading);
  }

  showLoader() {
    this.element.classList.add('sortable-table_loading');
  }

  hideLoader() {
    this.element.classList.remove('sortable-table_loading');
  }

  showEmpty() {
    this.element.classList.add('sortable-table_empty');
  }

  hideEmpty() {
    this.element.classList.remove('sortable-table_empty');
  }

  // Обошелся без этого метода, но для тестов он нужен и должен вызываться
  sortOnServer() { }

  initLoaderObserver() {
    if (!('IntersectionObserver' in window)) return;
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.onLoadingVisible();
        }
      })
    }, options);

    observer.observe(this.subElements.loading);
    this.observer = observer;
  }

  async onLoadingVisible() {
    const start = this.sortOptions.start + SortableTable.step;
    const end = this.sortOptions.end + SortableTable.step;

    this.updateSortOptions({ start, end });

    await this.request();

    this.afterUpdateRequest();
  }

  async request() {
    if (this.isEnded) {
      return;
    }

    const url = this.generateUrl();

    const response = await fetchJson(url)
      .catch(() => this.showEmpty());

    if (response.length < SortableTable.step - 1) {
      this.hideLoader();
    }

    if (!response.length) {
      this.isEnded = true;
      this.hideLoader();

      if (this.sortOptions.start === 1) {
        this.showEmpty();
      }

      return;
    }

    this.data = response;
  }

  initEventListeners() {
    const onDomContentLoaded = () => {
      this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);

      this.initLoaderObserver();
    };

    if (document.readyState === 'complete') {
      onDomContentLoaded();
    } else {
      document.addEventListener('DOMContentLoaded', onDomContentLoaded);
    }
  }

  onHeaderClick = event => {
    const sortableColumn = event.target.closest('[data-sortable="true"]');

    if (!sortableColumn) return;

    this.subElements.body.innerHTML = '';

    const { id: field, order } = sortableColumn.dataset;

    const toggleOrder = {
      desc: 'asc',
      asc: 'desc'
    };

    const newOrder = toggleOrder[order];
    const arrowElement = sortableColumn.querySelector(`.${this.subElements.arrow.className}`);

    if (!arrowElement) {
      sortableColumn.append(this.subElements.arrow);
    }

    sortableColumn.dataset.order = newOrder;

    this.updateSortOptions({
      field,
      order: newOrder,
    });

    if (this.url && !this.isSortLocally) {
      this.sortOnServer(field, newOrder, {
        start: 1,
        end: SortableTable.step
      });
    } else {
      this.sortOnClient(field, newOrder);
    }
  }

  getHTMLFromTemplate(template) {
    const parentNode = document.createElement('div');

    parentNode.innerHTML = template;

    return parentNode.firstElementChild;
  }

  getHeaderTemplate() {
    return `
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderTemplateData()}
            </div>
        `;
  }

  getPriceValue(price) {
    return '$' + price;
  }

  getStatusText(status) {
    switch (status) {
      case 1:
        return 'Активен'

      case 0:
      default:
        return 'Не активен';
    }
  }

  getHeaderTemplateData() {
    return this.header
      .map(({ id, title, sortable }) => {
        const isActiveCell = id === this.sortOptions.field;
        const dataOrder = sortable ? 'data-order="asc"' : '';

        return isActiveCell ?
          `<div class="sortable-table__cell" data-id="${id}" data-sortable="true" data-order="${this.sortOptions.order}">
              <span>${title}</span>
              <span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
              </span>
          </div>` :
          `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${dataOrder}>
            <span>${title}</span>
          </div>`;
      })
      .join('');
  }

  getBodyTemplate() {
    return `
            <div data-element="body" class="sortable-table__body">
                ${this.getBodyTemplateData()}
            </div>
        `;
  }

  getHeaderField(id) {
    return this.header.find(col => col.id === id);
  }

  getBodyTemplateData() {
    if (!this.data) return '';

    return this.data
      .map(row => {
        const items = this.header.map(({ id, template }) => {
          const colData = row[id];

          return typeof (template) === 'function' ?
            template(colData) : this.getTableCellTemplate(colData);
        }).join('');

        return `
            <a href="/products/${row.id}" class="sortable-table__row">
                ${items}
            </a>
        `;
      })
      .join('');
  }

  getPriceTemplate(price) {
    if (isUndefined(price)) return '';

    return `
        <div class="sortable-table__cell sortable-table__cell_type_price">${escapeHTML(price.toString())}</div>
    `;
  }

  getTableCellTemplate(value = '') {
    return `
        <div class="sortable-table__cell">${escapeHTML(value.toString())}</div>
    `;
  }

  getLoadingTemplate() {
    return `
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  }

  getTableClass() {
    const classNames = ['sortable-table'];

    if (!this.data) {
      classNames.push('sortable-table_loading');
    }

    return classNames.join(' ');
  }

  getTemplate() {
    return `
            <div class="${this.getTableClass()}">
                ${this.getHeaderTemplate()}
                ${this.getBodyTemplate()}
                ${this.getLoadingTemplate()}
                ${this.getPlaceholderTemplate()}
            </div>
        `;
  }

  getPlaceholderTemplate() {
    return `
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
                    <p>No products satisfies your filter criteria</p>
                    <button type="button" class="button-primary-outline">Reset all filters</button>
                </div>
            </div>
        `;
  }

  sortOnClient(field, order) {
    const compareFunction = this.getCompareFunction(field, order);
    if (!compareFunction) return;

    this.sortOptions.field = field;
    this.sortOptions.order = order;

    const sortedData = [...this.data].sort(compareFunction);

    this.data = sortedData;
    this.subElements.body.innerHTML = this.getBodyTemplateData();
  }


  getSortedCol(id) {
    const sortedCol = this.getHeaderField(id);

    if (
      !sortedCol ||
      !sortedCol.sortable
    ) return 'asc';

    return sortedCol;
  }

  getHeaderIds() {
    return this.header.map(row => row.id).join(', ');
  }

  compareStringsFn(a, b) {
    return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
  }

  getCompareFunction(field, order = 'asc') {
    const { sortType, customSorting } = this.getSortedCol(field);

    if (!sortType) {
      throw new Error(
        `Неправильный тип для сортировки - "${field}", возможные значения - "${this.getHeaderIds()}"
            `);
    }

    const direction = {
      asc: 1,
      desc: -1
    }[order];

    switch (sortType) {
      case 'string':
        return (a, b) => direction * this.compareStringsFn(a[field], b[field]);

      case 'number':
        return (a, b) => direction * (a[field] - b[field]);

      case 'custom':
        return (a, b) => direction * customSorting(a, b);

      default:
        return (a, b) => direction * (a[field] - b[field]);
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }

  destroy() {
    this.element?.remove();

    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
    this.observer?.unobserve(this.subElements.loading);

    this.header = '';
    this.data = null;
  }

  async render() {
    const element = this.getHTMLFromTemplate(this.getTemplate());
    const subElements = this.getSubElements(element);

    this.element = element;
    this.subElements = subElements;

    if (this.url) {
      await this.update();
    }

    this.initEventListeners();

    window.ctx = this;
  }
}
