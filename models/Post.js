const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  category: { 
    type: String,
    enum: ['7 класс','8 класс','9 класс','10 класс','11 класс','12 класс'],
    required: true
  },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
