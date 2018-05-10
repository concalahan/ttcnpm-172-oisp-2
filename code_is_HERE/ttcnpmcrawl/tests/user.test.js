const Page = require('./helpers/page');

let page;

// init setup the environment
beforeEach(async () => {
  page = await Page.build();
  if(process.env.NODE_ENV === 'ci'){
    await page.goto('http://localhost:3000');
  } else {
    await page.goto('http://localhost/');
  }
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
