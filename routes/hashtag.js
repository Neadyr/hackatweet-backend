var express = require('express');
var router = express.Router();
const Hashtag = require('../models/hashtags');

/* GET home page. */
router.get('/', (req, res) => {
  Hashtag.find()
  .then(data => {
    res.json(data)
  })
});

router.get('/', (req, res) => {

})
module.exports = router;
