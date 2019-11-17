const express = require('express');

const { getBootcamps,
     getBootcamp, 
     createBootcamp, 
     deleteBootcamp, 
     updateBootcamp,
    getBootcampsInRadius
    } = require('../controllers/bootcamps');


//unclude other resource routers
const courseRouter = require('./courses'); 

const router = express.Router();

//Re-route in other resource routers 
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);    

module.exports = router;