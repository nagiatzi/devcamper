const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');



const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/config.env'});

//connect to the db
connectDB();


//Routes files
const bootcamps = require('./routes/bootcamps'),
      courses  = require('./routes/courses'),
      auth  = require('./routes/auth'),
      users  = require('./routes/users'),
      reviews = require('./routes/reviews');

const app = express();

// File uploading
app.use(fileupload());

//body parser 
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

app.get('/', (req, res) => {
  res.send('This is a tutorial based backend API. Full documentation can be found at https://documenter.getpostman.com/view/9420864/SW7c3TGe?version=latest');
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

//error hanlder middleware

const PORT = process.env.PORT || 3000;

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);


app.use(errorHandler);


const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

//handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    //close server and exit process
    server.close(() => process.exit(1));
});

