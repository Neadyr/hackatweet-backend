var express = require('express');
var router = express.Router();

require('../models/connection');
const Tweet = require('../models/tweets');
const Hashtag = require('../models/hashtags');
const User = require('../models/users');

router.post('/newTweet', (req, res) => {
    const pattern = /#\S+/gi;
    const tweet = req.body.tweet
    const findHashtag = tweet.match(pattern)
    let tweetId = '';

    if (req.body.tweet === null ||req.body.tweet === '') {
        res.json({error: "Cannot send empty tweet"})
    } else {
        User.findOne({token: req.body.token})
        .then(data => {
            console.log(data._id);
            if (data !== null) {
                const newTweet = new Tweet ({
            user: data._id,
            tweet: req.body.tweet,
            creationDate: new Date(),
        })

        newTweet.save()
        .then(data => {
            console.log(data._id)
        })
        res.json(checkForHashTags(findHashtag, tweet, newTweet, tweetId))
            } else {
                res.json({result : false, message : "Missing or invalid token"})
            }
        })

        
    }
})
const checkForHashTags = (findHashtag, tweet, newTweet , tweetId) => {
    console.log(tweetId);
    if (findHashtag !== null) {
        for (const element of findHashtag) {
            Hashtag.find({ hashtag : element })
            .then(data => {
                if (data.length < 1) {
                    const newHashtag = new Hashtag ({
                        hashtag: element,
                        tweets: tweetId,
                    })
                    newHashtag.save()
                } else {
                    Hashtag.updateOne(
                    { hashtag : element },
                    { $push : {tweets: tweetId}})
                    .then(() => {
                        Hashtag.find().then(data => {
                          console.log("-------------------");
                        });
                    })
                }
            }) 
        }
    }
    return {result : true, message : "Tweet sent, hashtags have been updated", newTweet}
}
module.exports = router;