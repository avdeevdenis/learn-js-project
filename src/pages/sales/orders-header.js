const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number',
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
    sortType: 'string',
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    sortType: 'custom',
    customSorting: ({ createdAt: ACreatedAt }, { createdAt: BCreatedAt }) => (Number(new Date(ACreatedAt)) > Number(new Date(BCreatedAt)) ? 1 : -1),
    template: (data) => {
      const date = new Date(data);
      const dateWithTimezone = Number(date) + date.getTimezoneOffset() * 60 * 1000;

      return `
          <div class="sortable-table__cell">
            ${new Date(dateWithTimezone).toLocaleString('ru', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })}
          </div>
        `;
    },
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: (data) => `
        <div class="sortable-table__cell">
          $${data}
        </div>
      `,
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
  },
];

export default header;
