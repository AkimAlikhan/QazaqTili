// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcrypt');
const User          = require('../models/User');

module.exports = function(passport) {
  // Configure LocalStrategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      // Compare plaintext password against stored hash
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return done(null, false, { message: 'Wrong password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session by ID
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => done(null, user))
      .catch(err  => done(err));
  });
};

// Middleware to protect admin routes
module.exports.ensureAdmin = (req, res, next) => {
  // req.isAuthenticated() comes from passport.session()
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
};
