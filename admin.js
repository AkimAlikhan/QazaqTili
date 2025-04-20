const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await User.findOne({ username: 'admin' });
  console.log('Admin record:', admin);
  console.log('Stored hash:', admin && admin.passwordHash);
  await mongoose.disconnect();
})();
