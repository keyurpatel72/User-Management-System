const { schema } = require("../models/UserModel");

const islogin = async(req,res,next)=>{
    try {
        if (req.session.user_id) {
                
        } else {
            res.redirect('/admin')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const islogout = async(req,res,next)=>{
    try {
        if (req.session.user_id) {
            res.redirect('/admin/home')
        }
        next();
        
    } catch (error) {
        
    }
}
 
module.exports ={
    islogin,
    islogout
}