import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../notification/index.js';

export default class Category {
  element;
  subElements;

  sortableLists = [];

  constructor(data) {
    this.data = data;

    this.render();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }


  getHTMLNodeFromTemplate(template) {
    const parentNode = document.createElement('div');

    parentNode.innerHTML = template;

    return parentNode.firstElementChild;
  }

  getTemplate() {
    const items = this.data.map(item => {
      const subcategories = item.subcategories.map(({ id, title, count }) => {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = `<li class="categories__sortable-list-item" data-grab-handle="" data-id="${id}" style="">
            <strong>${title}</strong>
            <span><b>${count}</b> products</span>
          </li>
        `;

        return wrapper.firstElementChild;
      });

      const sortableList = new SortableList({
        items: subcategories
      });

      this.sortableLists.push(sortableList.element);

      return `
        <div class="category category_open" data-id="bytovaya-texnika">
          <header class="category__header" data-togglable>
            ${item.title}
          </header>
          <div class="category__body">
            <div class="subcategory-list"></div>
          </div>
        </div>
      `;
    }).join('');

    return items;
  }

  async updateSubcategories(data) {
    await fetchJson('https://course-js.javascript.ru/api/rest/subcategories', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  addSortableLists(container) {
    [...container.querySelectorAll('.subcategory-list')].forEach((categoryList, i) => {
      categoryList.append(this.sortableLists[i]);
    });
  }

  initEventListeners () {
    this.sortableLists.forEach(sortableList => {
      sortableList.addEventListener('sortable-list-reorder', event => {
        const data = event.detail.data;

        this.updateSubcategories(data);

        this.notification.show(document.body, { bottom: '20px', right: '20px' });
      });
    });

    document.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = event => {
    const togglable = event.target.closest('[data-togglable]');

    if (togglable) {
      togglable.parentNode.classList.toggle('category_open');
    }
  }

  destroy() {
    [...this.element].forEach(child => child.remove());

    document.removeEventListener('pointerdown', this.onPointerDown);
  }

  render() {
    const container = document.createElement('div');
    container.innerHTML = this.getTemplate();

    this.addSortableLists(container);

    this.notification = new NotificationMessage('Category order saved', { type: 'success' });

    this.element = container.children;

    this.initEventListeners();
  }
}
