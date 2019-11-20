const express = require('express');
const advanceResults = require('../middleware/advancedResults');
const Course = require('../models/Course');

const { 
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
    } = require('../controllers/courses');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(addCourse);


router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;