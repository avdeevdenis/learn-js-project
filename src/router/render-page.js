const setActiveSidebar = (name) => {
  const list = [...document.querySelectorAll('[data-page]')];
  
  list.forEach(item => {
    if (item.dataset.page.toLocaleLowerCase() === name) {
      item.parentNode.classList.add('active');
    } else {
      item.parentNode.classList.remove('active');
    }
  });
};

export default async function(path, match, name) {
  const main = document.querySelector('main');

  main.classList.add('is-loading');

  setActiveSidebar(name);

  const options = match && match[1];

  const { default: Page } = await import(/* webpackChunkName: "[request]" */`../pages/${path}/index.js`);
  const page = new Page(options);
  const element = await page.render();

  main.classList.remove('is-loading');

  const contentNode = document.querySelector('#content');

  contentNode.innerHTML = '';
  contentNode.append(element);

  return page;
}
