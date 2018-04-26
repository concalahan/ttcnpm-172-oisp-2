jest.setTimeout(30000); // 30 seconds

require('../models/user');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise; // use Node Promise
mongoose.connect(keys.mongoURI, { useMongoClient: true }); // useMongoClient advoid warning
