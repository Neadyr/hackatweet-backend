const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  tweet: String,
  creationDate: Date,
  likes: Array,
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;