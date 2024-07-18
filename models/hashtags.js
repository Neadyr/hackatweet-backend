const mongoose = require('mongoose');

const hashtagSchema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  tweet: String,
  creationDate: Date,
  like: Number,
  hashtag: {type: mongoose.Schema.Types.ObjectId, ref: 'hashtags'},
});

const Hashtag = mongoose.model('tweets', hashtagSchema);

module.exports = Hashtag;