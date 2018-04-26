const Page = require('./helpers/page');

let page;

// init setup the environment
beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:8080');
});

afterEach(async () => {
  await page.close();
})

test('The header has the correct text', async () => {
  const text = await page.getContentsOf('h1');

  expect(text).toEqual('Aztechpro');
});
