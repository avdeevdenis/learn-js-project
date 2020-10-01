export default async function (path, match) {
  const main = document.querySelector('main');

  main.classList.add('is-loading');

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
