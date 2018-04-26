const puppeteer = require('puppeteer');
// const sessionFactory = require('../factories/sessionFactory');
// const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage(); // open new page
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        // the order matter: customPage > browser > page
        // customPage: our custom page with our write code
        // page: page of puppeteer
        // browser: browser of puppeteer
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  // async login() {
  //   const user = await userFactory(); // wait the mongoose user save
  //   const { session, sig } = sessionFactory(user);
  //   //const id = '5ad75ed41806cf114296947c';
  //
  //   await this.page.setCookie({name: 'session', value: session });
  //   await this.page.setCookie({name: 'session.sig', value: sig });
  //   await this.page.goto('localhost:8080');
  // }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
