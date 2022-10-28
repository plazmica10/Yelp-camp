const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
//require db schema
const Campground = require('../models/campground')

//connect to database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//error check
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});
//function to pick random element from arr
const sample = arr => arr[Math.floor(Math.random() * arr.length)];

//making random campgrounds
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //my author id
            author: '6352d17b0f0c99415aa7bc97',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/ddv0smc0d/image/upload/v1666725283/Yelp/image_y2wcb7.jpg',
                    filename: 'Yelp/jg3hvoavsojx8ksys35g',
                },
                {
                    url: 'https://res.cloudinary.com/ddv0smc0d/image/upload/v1666643178/Yelp/xx31zp3iaug4di6gewy2.jpg',
                    filename: 'Yelp/um7hgpu8pkjt9hxjh9os',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt officia quasi cupiditate nisi odio delectus distinctio accusamus corporis veniam quas vitae illum magni dolor fuga, omnis, consequuntur totam, nobis qui!',
            price
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})