var express = require('express');
var router = express.Router();

require('../models/connection');
const Tweet = require('../models/tweets');
const Hashtag = require('../models/hashtags');
const User = require('../models/users');

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
                        Hashtag.find().then(() => {
                          console.log("Hashtags updated");
                        });
                    })
                }
            }) 
        }
    }
    return {result : true, message : "Tweet sent, hashtags have been updated", newTweet}
}


router.post('/', (req, res) => {
    const pattern = /#\S+/gi;
    const tweet = req.body.tweet
    const findHashtag = tweet.match(pattern)
    let tweetId;

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
            res.json(checkForHashTags(findHashtag, tweet, newTweet, data._id))
        })
            } else {
                res.json({result : false, message : "Missing or invalid token"})
            }
        })

        
    }
})

router.get('/', (req, res) => {
    Tweet.find()
    .populate('user')
    .then(data => {
        console.log(data[0].user.firstName)
        const properData = {
            firstName: data[0].user.firstName,
            userName: data[0].user.userName,
            tweet: data[0].tweet,
            creationDate: data[0].creationDate,
            likes: data[0].like
        }

        res.json(properData)
    })
})

router.delete('/', (req, res) => {
    Tweet.deleteOne({tweet : req.body.tweet})
})

module.exports = router;