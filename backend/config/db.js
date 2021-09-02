const mongoose = require('mongoose');

let { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
DB_USERNAME = DB_USERNAME ? DB_USERNAME : '';
DB_PASSWORD = DB_PASSWORD ? `:${DB_PASSWORD}` : '';
DB_HOST = DB_USERNAME ? `/${DB_HOST}` : DB_HOST;
let mongoURI = `mongodb://${DB_USERNAME}${DB_PASSWORD}${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const mongoConnectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
};

mongoose.connect(mongoURI, mongoConnectionOptions)
    .then(() => console.log('Connected to mongodb'))
    .catch(err => { console.log(err) });
