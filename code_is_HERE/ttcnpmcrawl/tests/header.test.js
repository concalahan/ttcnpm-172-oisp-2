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
})

test('The header has the correct text', async () => {
  const text = await page.getContentsOf('h1');

  expect(text).toEqual('Binggo');
});

test.only('Have the box for login', async () => {
  const text = await page.$eval('.dropdown_title', el => el.textContent);

  expect(text).toEqual('Đăng nhập');
});

test('Have the button for login', async () => {
  const text = await page.$eval('#btnLogin', el => el.textContent);

  expect(text).toEqual('Đăng nhập ');
});

// test('The user can login', async () => {
//   await page.type('#username', 'user@gmail.com');
//   await page.type('#password', 'user');
//   await page.click('#btnLogin');
//
//   // // await page.evaluate(() => {
//   // //   document.querySelector('#btnLogin').click();
//   // // });
//
//   await page.waitFor('#hello');
//   const text = await page.getContentsOf('#hello');
//
//   expect(text).toEqual('Xin chào user@gmail.com');
// });

test('Test search bar with random string that do not match any product', async () => {
  await page.type('.form-control', 'My Search Putin Musk');
  await page.click('#search-bar');
  await page.waitFor('h2');

  const text = await page.getContentsOf('h2');
  // console.log(text);
  expect(text).toEqual('Không tìm thấy sản phẩm!');
});
