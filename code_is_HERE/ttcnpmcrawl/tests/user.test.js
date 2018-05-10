const Page = require('./helpers/page');

let page;

// init setup the environment
beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
  });

  test.only('Display the hello user at header', async () => {
    await page.waitFor('#hello');
    const text = await page.getContentsOf('#hello');

    expect(text).toEqual('Xin chào ');
  });
});
