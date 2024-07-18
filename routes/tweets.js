var express = require('express');
var router = express.Router();

require('../models/connection');
const Tweet = require('../models/tweets');
const Hashtag = require('../models/hashtags');
const User = require('../models/users');

const checkForHashTags = (findHashtag, tweet, newTweet , tweetId) => {
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
        if (data) {
            console.log(data)
            const properData = {
                firstName: data[0].user.firstName,
                userName: data[0].user.userName,
                tweet: data[0].tweet,
                creationDate: data[0].creationDate,
                likes: data[0].like
            }
    
            res.json({properData})
        } else {
            res.json({result: false, message : "no tweet to find"})
        }
    })
})

router.delete('/', (req, res) => {
    User.findOne({ token: req.body.token }).then(data => {
        if (data) {
            Tweet.findOne({tweet : req.body.tweet})
            .then((data) => {
                const pattern = /#\S+/gi;
                const tweet = data.tweet
                const findHashtag = tweet.match(pattern)
                console.log(findHashtag);
                if (findHashtag !== null) {
                    for (const element of findHashtag) {
                        Hashtag.updateOne(
                        { hashtag : element },
                        { $pull : {tweets: data._id}})
                            .then(() => {
                                
                            })
                    // .then(() => {
                    //     Hashtag.find().then((data) => {
                    //         if (data.tweets.length = 0) {
                    //             Hashtag.deleteOne({hashtag: data.hashtag})
                    //         }
                    //     });
                    // })
                    }

                }

            })

            Tweet.deleteOne({tweet : req.body.tweet})
            .then((data) => {
                if (data.deletedCount === 0) {
                    res.json({result : false, message : 'No tweet to delete'})
                } else {
                    res.json({result : true, message : 'Tweet deleted'})
                }
                })  
            } else {
                res.json({ result: false, error: 'User not found' });
            }
      });

})

module.exports = router;