const UserModel= require('../models/UserModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
const config = require('../config/config');
const randomstring = require('randomstring');
const express = require('express');
let session = require('express-session');
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
//sendmail
// const sendVerifymail = async(name,email,user_id)=>{
//     try {
//     const trasporter = await nodemailer.createTestAccount({
//             host:'smtp.gmail.com',
//             port:587,
//             secure:false,
//             requireTLS:true,
//             auth:{
//                 user: config.emailUser  ,
//                 password: config.passwordUser
//             }
//         });
//         const mailOptions ={
//             from:'test@gmail.com',
//             to : 'email',
//             subject : 'for verification mail',
//             html:'<p>hii '+name+',please click hear<a href="http://localhost:5000/verify?id='+user_id+' ">verify <a/>your mail.</p> '
//         }
//         trasporter.sendMail(mailOptions,(error,info)=>{
//             if (error) {
//                     console.log(error)
//             } else {
//                 console.log('email has been send',info.response)
//             }
//         });

//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loadRegister = async(req,res)=>{
    try {
  
       res.render('register')
       
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async(req,res)=>{
    try {
            const hashPassword = await securePassword(req.body.password)
            const user = new UserModel({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            img:req.file.filename,
            password:hashPassword,
            is_admin:0,
        })   
        const  userData  =await  user.save();
        if (userData) {
            //sendVerifymail =(req.body.name,req.body.email,userData._id)

            res.render('login',{message:'you are registration has been sucessfull,please verify your mail'});   
        } else {
            
            res.render('register',{message:'you are registration has been failed'});
        }
    } catch (error) {
        console.log(error.message);
    }
}

// const verifyMail =  async(req,res)=>{
//     try {
//         const updateInfo = await UserModel.updateOne({_id:req.query.id},{$set:{is_verified:1}});
//         console.log(updateInfo);
//         res.render('email-verified');
//     } catch (error) {
//         console.log(error.message)
//     }
// }

//login user
const login  = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error);
    }
}

// const postLogin = async(req,res)=>{
//     try {
//         const email=req.body.email;
//         const password = req.body.password;
//         const userData = await UserModel.findOne({email:email});

//         if(userData){
//            session=req.session;
//            session.user_id=userData.id;
//           //  console.log(session.userid,"sedsfcds")
//             const passwordMatch =await bcrypt.compare(password,userData.password);
//             if (passwordMatch) {
//                 if (userData.is_verified === 0) {
//                     res.render('login',{message:"please verify your mail."})
//                 } else {
//                     //res.session.user_id = userData._id;
//                     //res.session.userId =userData.id;
//                     res.redirect('/home'); 
//                 }
                
//             } else {
//                 res.render('login',{message:"password has been failed"})
//             }
//         }else{
//             res.render('login',{message:"email  has been failed"})
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }
const postLogin = async (req,res)=>{
    // try {
    //     const email = req.body.email;
    //     const password = req.body.password;
    //     const userData = await UserModel.findOne({email:email});
        
    //     if (userData) {
    //         session=req.session;
    //         session.user_id=userData.id;
    //             const passwordMatch = await bcrypt.compare(password,userData.password);
    //             if (passwordMatch) {
    //                 if (userData.is_verified ===0) {
    //                     res.render('login',{message:"please verify your mail."})
    //                 } else {
    //                     req.session.user_id = userData._id; 
    //                   res.redirect('home')
    //                 }
    //             } else {
    //                 res.render('login',{message:"password has been failed"})
    //             }
    //         } else {
    //             res.render('login',{message:'email and password is incurrect'})
    //         }

    // } catch (error) {
    //     console.log(error.message,"data not");
       
    // }
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        const userData = await UserModel.findOne({email:email});
            if (userData) {
                const passwordMatch = await bcrypt.compare(password,userData.password);
                if (passwordMatch) {
                    if (userData.is_verified ===0) {
                        res.render('login',{message:"please verify your mail."})
                    } else {
                        req.session.user_id = userData._id; 
                        console.log(req.session.user_id,"user");
                        res.redirect('/home'); 
                        console.log('page');
                    }
                } else {
                    res.render('login',{message:"password has been failed"})
                }
            } else {
                res.render('login',{message:'email and passsword is incurrect'})
            }

    } catch (error) {
        console.log(error.message,"data and hash");
    }

}
 const logout = async(req,res)=>{
    try {
        req.session.destroy(); 
        res.redirect('/home') 

    } catch (error) {
        console.log(error.message);
    }
 }
 const forget = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
 }
 const forgotVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await UserModel.findOne({email:email});
        if (userData) {
                if(userData.id_verified === 0){
                    res.render('forget',{message:'please verfiy your mail'})
                }else{
                    const randomString = randomstring.generate(); 
                    const updateData =  await UserModel.updateOne({email:email},{$set:{token:randomString}});
                    sendResetPasswordMail(userData.name,userData.email,randomString);
                    res.render('forget',{message:'Please check you mail box.'});
       
                }

        } else {
            res.render('forget',{message:'email has been increate.'})
        }
    } catch (error) {
        console.log(error.message);
    }
 }

 
// reset password mail
const sendResetPasswordMail = async(name,email,user_id)=>{
    try {
    const trasporter = await nodemailer.createTestAccount({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user: config.emailUser  ,
                password: config.passwordUser
            }
        });
        const mailOptions ={
            from:'test@gmail.com',
            to : 'email',
            subject : 'for verification mail',
            html:'<p>hii '+name+',please click hear<a href="http://localhost:5000/verify?id='+user_id+' ">verify <a/>your mail.</p> '
        }
        trasporter.sendMail(mailOptions,(error,info)=>{
            if (error) {
                    console.log(error)
            } else {
                console.log('email has been send',info.response)
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}
const forgetPasswordLoad = async (req,res)=>{

    try {
        const token = req.query.token;
        const tokenData = await UserModel.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }else{
            res.render('404',{message:'token is invalid'});
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword = async (req,res)=>{
try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const securePassword = await securePassword(password);
    const updateData = await UserModel.findByIdAndUpdate({_id:user_id},{$set:{password:securePassword}});
    res.redirect('/'); 
} catch (error) {
    console.log(error.message);
}
}
const verificationload = async(req,res)=>{
    try {
        res.render('verification');
    } catch (error) {
        console.log(error.message)
    }
}
const sentVerificationLink = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData =await UserModel.findOne({email:email});
        if (userData) {
            sendVerifymail(userData.name,userData.email,userData._id);
            res.render('verification',{message:'reset verification mail id,please check your mail id.'})
        } else {
            res.render('verification',{message:"this email is does not exist."})
        }
    } catch (error) {
        console.log(error.message);
    }
} 

const home = async(req,res)=>{
    try {   
        const userData = await UserModel.findById({_id:req.session.user_id});
        res.render('home',{user:userData});
    } catch (error) {
        console.log(error);
    }
}

const editLoad = async(req,res)=>{
    try {
        const id = req.query.id;
        const userData = UserModel.findOne({id:id});
        res.render('edit',{user:userData});
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async(req,res)=>{
    try {
        if (req.file) {
            
            const userData= await UserModel.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,img:req.file.filename}})
            
        } else {
            const userData= await UserModel.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}})
            
        }
        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    //verifyMail ,
    login,
    logout,
    postLogin,
    home,
    editLoad,
    updateProfile,
    forget,
    forgotVerify,
    sendResetPasswordMail,
    forgetPasswordLoad,
    resetPassword,
    verificationload,
    sentVerificationLink
}


