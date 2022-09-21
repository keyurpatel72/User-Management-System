
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mvc');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

const publicDirPath = path.join(__dirname, "public");

app.use('/public', express.static(publicDirPath));

app.use('/public', express.static('public'));

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.listen(5000,()=>{
    console.log('server running on 5000'); 
})


