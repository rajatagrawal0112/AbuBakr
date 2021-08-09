const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
var indexroutes = require("./routes");
const app = express();
const session = require('express-session');
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/AbuBakr",
{ useUnifiedTopology: true } ,
{ useNewUrlParser: true });
//new api
const flash = require('express-flash');


app.use(session({
    secret: 'userdetails',
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

// Set public folder
app.use(express.static(path.join(__dirname,'/public')));
//app.use(express.static(path.join(__dirname, 'logo')));

app.use(flash())

app.use("/", indexroutes);
console.log(process.env.ADMIN)

const PORT = 9000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));