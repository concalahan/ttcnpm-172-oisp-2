const Page = require('./helpers/page');

let page;

// init setup the environment
beforeEach(async () => {
  page = await Page.build();
  await page.goto('https://thinhthinh-namthinh1997.cs50.io/');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
  });

  test.only('Hhuhuhu', async () => {
    await page.waitFor('#hello');
    const text = await page.getContentsOf('#hello');

    expect(text).toEqual('Xin chào ');
  });
});
