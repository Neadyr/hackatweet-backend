const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
  hashtag: String,
  tweets: Array
});

const Hashtag = mongoose.model('hashtags', hashtagSchema);

module.exports = Hashtag;