// server.js
const express    = require('express');
const mongoose   = require('mongoose');
const session    = require('express-session');
const passport   = require('passport');
const flash      = require('connect-flash');
const path       = require('path');

// 1️⃣ Import and apply passport config (strategies + serialize/deserialize)
require('dotenv').config();
const passportConfig = require('./config/passport');
passportConfig(passport);                                          // Must run _before_ passport.initialize() :contentReference[oaicite:4]{index=4}
const { ensureAdmin } = require('./config/passport');               // Correctly destructured

// 2️⃣ Models
const User = require('./models/User');
const Post = require('./models/Post');

const app = express();

// 3️⃣ Make `classes` available in all templates via res.locals
const CLASSES = ['7 сынып','8 сынып','9 сынып','10 сынып','11 сынып','12 сынып'];
app.use((req, res, next) => {
  res.locals.classes = CLASSES;                                     // res.locals holds request‑specific template vars :contentReference[oaicite:5]{index=5}
  next();
});

// --- Middleware ---
// 4️⃣ Body parser for form data
app.use(express.urlencoded({ extended: false }));

// 5️⃣ Session must come before passport.session()
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));                                                                 // Session support required for login sessions :contentReference[oaicite:6]{index=6}

app.use(passport.initialize());                                     // Initializes Passport authentication :contentReference[oaicite:7]{index=7}
app.use(passport.session());                                        // Restores login state from session :contentReference[oaicite:8]{index=8}
app.use(flash());                                                   // For flash messages

// 6️⃣ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 7️⃣ View engine & static files
app.set('view engine', 'ejs');
app.set('views',      path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---

// Home: choose class
app.get('/', (req, res) => {
  res.render('posts', { title: 'Классы' });
});

// Class posts
app.get('/class/:cls', async (req, res) => {
  const className = req.params.cls;
  const posts = await Post.find({ category: className }).sort({ createdAt: -1 });
  res.render('class-posts', { title: className, className, posts });
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: req.flash('error') });
});

// Handle login
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// ⚠️ Protected admin routes ⚠️
// Use router‑level middleware to secure all /admin paths :contentReference[oaicite:9]{index=9}
app.use('/admin', ensureAdmin, express.Router()
  .get('/', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('admin', {
      title:   'Admin',
      user:     req.user,
      posts,
      error:   req.flash('error'),
      success: req.flash('success')
    });
  })
  .post('/', async (req, res) => {
    const { title, body, category } = req.body;
    await Post.create({ title, body, category });
    req.flash('success', 'Post created');
    res.redirect('/admin');
  })
  .post('/delete/:id', async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Post deleted');
    res.redirect('/admin');
  })
);

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
