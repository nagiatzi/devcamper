const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    // res.status(200).json(res.advancedResults);
    const courses = await Course.find().populate({
        path: 'bootcamp',
        select: 'name description'
    });
    return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
  };

});

// @desc      Get course
// @route     GET /api/v1/course/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name desciprion'
    });

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
    }

  res.status(200).json({
        success: true,
        data: course
    });

});

// @desc      Add course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with the id of ${req.bootcampId}`, 404));
    }


    const course = await Course.create(req.body);

  res.status(200).json({
        success: true,
        data: course
    });

});


