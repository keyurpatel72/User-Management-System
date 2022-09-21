const express = require('express');
const adminRoute =express();
const session = require('express-session');
const config = require('../config/config');

adminRoute.use(session({ secret:config.sessionSecret,resave: false,saveUninitialized: true}));
const bodyParser = require('body-parser');

adminRoute.use(bodyParser.urlencoded({extended:true}));
adminRoute.use(bodyParser.json());

 
adminRoute.set('view engine', 'ejs');
adminRoute.set('views','./views/admin')


//const {upload} = require('../middleware/multer');
var multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, '../public/userImage/')
      cb(null,path.join(__dirname,'../public/userImage'));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)     
    }
});
//exports.upload = multer({ storage: storage }).single('img'); 
const upload = multer({ storage: storage }).single('img'); 



// const multer = require('multer');
const path = require('path');

//adminRoute.use(express.static('public'));

// const storage = multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,path.join(__dirname,'../public/userImage'));
//     },
//     filename:function(req,file,cb){
//         const name = Date.now()+'-'+file.originalname;
//         cb(null,name)
//     }
//     // destination: function (req, file, cb) {
//     //     cb(null, '../public/userImage')
//     //   },
//     //   filename: function (req, file, cb) {
//     //     cb(null, file.originalname)
        
//     //   }
// })
// const upload =multer({storage:storage});

const auth = require('../middleware/adminAuth');

const adminController = require('../controllers/adminController');
const { authLogin } = require('../middleware/auth');

adminRoute.get('/',auth.islogout,adminController.loginadmin);
adminRoute.post('/',adminController.verifylogin);
adminRoute.get('/home',auth.islogin,adminController.Dashboard);
adminRoute.get('/logout',auth.islogout,adminController.logoutadmin);
adminRoute.get('/forget',adminController.adminforget);
adminRoute.post('/forget',adminController.forgetverify);
adminRoute.get('/forget-password',adminController.forgetPasswordLoad);
adminRoute.post('/forget-password',adminController.resetpassword);
adminRoute.get('/dashboard',auth.islogin,adminController.adminDashboard);
adminRoute.get('/new-user',auth.islogin,adminController.newUserload);
adminRoute.post('/new-user',auth.islogin,upload,adminController.addUser);
adminRoute.get('/edit-user/:id',auth.islogin,adminController.editUserload);
adminRoute.post('/edit-user/:id',auth.islogin,adminController.updateUsers);
adminRoute.get('/delete-user',auth.islogin,adminController.deleteUsers);
adminRoute.get('/export-user',auth.islogin,adminController.exportUsers);
adminRoute.get('/export-user-pdf',auth.islogin,adminController.exportUserPdf);
adminRoute.get('*',(req,res)=>{
    res.redirect('/admin');
});
module.exports = adminRoute;
