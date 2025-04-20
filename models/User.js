const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

UserSchema.statics.createAdmin = async function(username, password) {
  const hash = await bcrypt.hash(password, 10);
  return this.create({ username, passwordHash: hash, role: 'admin' });
};

module.exports = mongoose.model('User', UserSchema);
