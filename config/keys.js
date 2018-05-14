if (process.env.NODE_ENV === 'prod') {
  module.exports = require('./prod');
} if (process.env.NODE_ENV === 'ci') {
  module.exports = require('./ci');
} else {
  module.exports = require('./dev');
}
