const express = require('express');

const { getBootcamps,
     getBootcamp, 
     createBootcamp, 
     deleteBootcamp, 
     updateBootcamp,
     getBootcampsInRadius,
     bootcampPhotoUpload
    } = require('../controllers/bootcamps');

const advanceResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');



//unclude other resource routers
const courseRouter = require('./courses'); 

const router = express.Router();

//Re-route in other resource routers 
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/')
    .get(advanceResults(Bootcamp, 'courses'), getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);  
    
router
    .route('/:id/photo')
    .put(bootcampPhotoUpload);    

module.exports = router;