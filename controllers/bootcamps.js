const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async'); 
const path = require('path');


// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    // copy req.query
    const reqQuery = {...req.query}

    //Fields to exlude αν δεν τα βγάλει τα καταλαβαίνει ως πεδία 
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //loop over removeFields and deete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);


    let queryStr = JSON.stringify(reqQuery);

    //Create operators ($gt, $gte, etc) he is going that because there were not $ for 
    //immediate quering
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    //SELECT FIELDS
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        console.log(fields);
        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10 ) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page -1 ) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

   // console.log("start index is ", startIndex);
   // console.log("end index is ", endIndex);
    //console.log("total is ", total);


    query = query.skip(startIndex).limit(limit);


    // Executing our query
    const bootcamps = await query;

    //Pagination result
    const pagination = {}

     if(endIndex < total) {
         console.log('ήρθε');
         pagination.next = {
             page: page + 1,
             limit
         }
     }

     if (startIndex > 0) {
         pagination.prev = {
             page: page - 1,
             limit
         }
     }


    res
        .status(200)
        . json({ success: true, count: bootcamps.length, pagination, data: bootcamps});

}); 

// @desc Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp =  await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next( new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp}); 
}); 

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res
    .status(201)
    .json({ 
        success: true,
        data: bootcamp
    });
});

// @desc Update a specific bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {    new: true,
        runValidators: true
    });

    
    if(!bootcamp) {
        return next( new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res
        .status(200)
        . json({ success: true, data: bootcamp});
});

// @desc Delete a specific bootcamp
// @route Delete /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async  (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next( new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    bootcamp.remove();

    res.status(200).json({ success: true, data: {} }); 

});

// @desc Get a bootcamp within a radius
// @route GET /api/v1/bootcamps/:radius/:zipcode/:diastance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async  (req, res, next) => {
    const {zipcode, distance} = req.params;

    //GET lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //calc radius using radians
    //Divide distance by radius of Earth = 3.963
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
    
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });

});

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
  
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is bootcamp owner
    /*
     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.params.id} is not authorized to update this bootcamp`,
          401
        )
      );
    }
     */

  
    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }
  
    const file = req.files.file;
    console.log(file);
  
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }
  
    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }
  
// Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
  
      await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
  
      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  });



//old way without async middleware

/*
    exports.getBootcamp = async (req, res, next) => {
    try{
        const bootcamp =  await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next( new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: bootcamp});


    } catch (err) {
         next(err);
    }  
}; 

*/