if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const localStrategy = require('passport-local');
const user = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

// const helmet = require('helmet');

//requiring routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

//connect to database
const dbUrl = process.env.dbUrl || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
//error check
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');//setting up ejs
app.set('views', path.join(__dirname, 'views'));//making so that views dir is accessable from any dir not only parent dir(run code from anywhere)

app.use(express.urlencoded({ extended: true }));//telling express to parse body nedded for req.body and stuff
//expecting how our data should look like
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.secret || 'sekreet'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600
});

store.on("error",function(e){
    console.log("session store error",e);
})


const sessionConfig = {
    store,
    name: 'sesh',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //milsec sec min hour day
        maxAge: 1000 * 60 * 60 * 24 * 7,

    }
}

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());//store user in session
passport.deserializeUser(user.deserializeUser());//get user out of the session

app.use((req, res, next) => {
    res.locals.currentUser = req.user;//all templates now have currentUser
    res.locals.success = req.flash('success');//-II-
    res.locals.error = req.flash('error');
    next();
})
//prefixing routes/route handlders
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    res.status(status).render('error', { err })
})
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Port: ${port}`);
})