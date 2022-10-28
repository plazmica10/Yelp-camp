const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCamp } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
//campground model
const Campground = require('../models/campground');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCamp, catchAsync(campgrounds.createCampground))
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send("HI")
// })

//new(route) should be before id because it treats it like id if its after it
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCamp, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;