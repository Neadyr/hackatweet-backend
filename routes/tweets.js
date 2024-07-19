const moment = require ('moment');
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

router.put('/', (req, res) => {
    let user;
    User.findOne({token: req.body.token})
        .then(data => {
            if (data !== null) {
                user = data
                Tweet.findOne({tweet : req.body.tweet})
                .then(data => {
                    let tempArray = data.likes
                    if (tempArray.length < 1) {
                        console.log('array was empty');
                        Tweet.updateOne({tweet : req.body.tweet}, { $push : {likes: user._id}})
                        .then(()=> {
                            res.json({result : true, message: "Tweet liked"})
                        })

                    } else {
                        console.log('array has at least an element');
                        console.log('element :', tempArray[0], 'user' , user._id)
                        if (tempArray.some((e) => e.equals(user._id))) {
                            Tweet.updateOne({tweet : req.body.tweet}, { $pull : {likes: user._id}})
                            .then(()=> {
                            res.json({result : true, message: "Tweet unliked"})
                            })
                        } else {
                            Tweet.updateOne({tweet : req.body.tweet}, { $push : {likes: user._id}})
                            .then(()=> {
                            res.json({result : true, message: "Tweet liked"})
                            })
                        }  
                    }

                })
        } else {
            res.json({result : false, error: "Missing identification token"})
        }
    })
})

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
            let properData = []
            for (const elem of data) {
                const dateFromCreation = moment(elem.creationDate).fromNow()

                const newTweet = {
                firstName: elem.user.firstName,
                userName: elem.user.userName,
                tweet: elem.tweet,
                creationDate: dateFromCreation,
                likes: elem.likes
            }
            properData.push(newTweet)
            }

            res.json({result: true, properData})
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
                if (findHashtag !== null) {
                    for (const element of findHashtag) {
                        Hashtag.updateOne(
                        { hashtag : element },
                        { $pull : {tweets: data._id}})
                            .then(() => {
                                
                            })
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