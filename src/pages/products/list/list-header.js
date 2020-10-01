const header = [
  {
    id: 'images',
    title: 'Images',
    sortable: false,
    template: (data) => {
      const url = data && data[0] && data[0].url;
      const image = url ? `<img class="sortable-table-image" alt="Image" src="${url}"></img>` : '';

      return `
          <div class="sortable-table__cell">${image}</div>
        `;
    },
  },
  {
    id: 'title',
    title: 'Название',
    sortable: true,
    sortType: 'string',
  },
  {
    id: 'subcategory',
    title: 'Категория',
    sortable: true,
    sortType: 'custom',
    customSorting: (a, b) => a.subcategory.title.localeCompare(b.subcategory.title),
    template: (data) => `
          <div class="sortable-table__cell">${data.title}</div>
        `,
  },
  {
    id: 'quantity',
    title: 'Количество',
    sortable: true,
    sortType: 'number',
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
    sortType: 'number',
    template: (data) => `
          <div class="sortable-table__cell">$${data}</div>
        `,
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'custom',
    customSorting: ({ status: aStatus = 0 }, { status: bStatus = 0 }) => (aStatus > bStatus ? 1 : -1),
    template: (status) => `<div class="sortable-table__cell">
          ${status === 1 ? 'Активен' : 'Неактивен'}
        </div>`,
  },
];

export default header;
