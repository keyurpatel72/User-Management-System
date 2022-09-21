const express = require('express');
const userRoute =express();
const session = require('express-session');
const config = require('../config/config');
userRoute.use(session({ secret:config.sessionSecret,resave: false,saveUninitialized: true}));

const auth = require('../middleware/auth');

const bodyParser = require('body-parser');

userRoute.use(bodyParser.urlencoded({extended:true}));
userRoute.use(bodyParser.json());

const multer = require('multer');
const path = require('path');

userRoute.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImage'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})
const upload =multer({storage:storage});
 
userRoute.set('view engine', 'ejs');
userRoute.set('views','./views/users')

const userController = require('../controllers/userController')

userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',upload.single('img'),userController.insertUser); 
//userRoute.post('/verify',userController.verifyMail);
userRoute.get('/',auth.authLogout,userController.login);
userRoute.get('/login',auth.authLogout,userController.login);
userRoute.post('/login',auth.authLogin,userController.postLogin);
userRoute.get('/home',auth.authLogin,userController.home);
userRoute.post('/logout',userController.logout);
userRoute.get('/forget',userController.forget);
userRoute.post('/forget',userController.forgotVerify);
userRoute.get('/forget-password',userController.forgetPasswordLoad);
userRoute.post('/forget-password',userController.resetPassword);
userRoute.get('/verification',userController.verificationload);
userRoute.post('/verification',userController.sentVerificationLink);
userRoute.get('/edit',userController.editLoad);
userRoute.post('/edit',upload.single('image'),userController.updateProfile)

module.exports =   userRoute;
