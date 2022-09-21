const UserModel= require('../models/UserModel');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const express = require('express');
let session = require('express-session');

const config = require('../config/config');
const randomstring = require('randomstring');
const Excel = require('exceljs');
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');


const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
// send  send mail

// const addUserMail = async(name,email,password,user_id)=>{
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
//             html:'<p>hii '+name+',please click hear<a href="http://localhost:5000/verify?id='+user_id+' ">verify <a/>your mail.</p><br><b>Email:-</br> '+email+'<br><b>Password:-</br>'+password+''
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

const loginadmin = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
const verifylogin = async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        const adminData = await UserModel.findOne({email:email});
            if (adminData) {
                const passwordMatch = await bcrypt.compare(password,adminData.password);
                if (passwordMatch) {
                    if (adminData.is_admin===0) {
                        res.render('login',{message:"please verify your mail."})
                    } else {
                        req.session.user_id = adminData._id; 
                        res.redirect('admin/home'); 
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
const Dashboard = async(req,res)=>{
    try {
        res.render('home'); 
    } catch (error) {
        console.log(error.message);
    }
}

const logoutadmin = async(req,res)=>{
    try {
        req.session.destroy();
    } catch (error) {
        console.log(error.message);
    }
}

const adminforget = async(req,res)=>{
    try {
        res.render('admin/forget');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetverify = async (req,res)=>{
    try {
        const email = req.email.email;
        const adminData = await UserModel.findOne({email:email});   
        if (adminData) {
            if (adminData.is_admin===0) {
                res.render('admin/forget',{message:'please verify your mail'});
            } else {
                const randomString = randomstring.generate(); 
                const updateData =  await UserModel.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(adminData.name,adminData.email,randomString);
                res.render('admin/forget',{message:'Please check you mail box.'});
            }
        } else {
            res.render('admin/forget',{message:'email is incorrect'});
        }
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
const resetpassword = async (req,res)=>{
    try {
        const passsword = req.body.passsword;
        const user_id = req.body.user_id;
    
        const hashPassword = await securePassword(passsword);
        const updateData = await UserModel.findByIdAndUpdate({_id:user_id},{$set:{passsword:hashPassword}});
        res.redirect('/admin');  
    } catch (error) {
        console.log(error.message)
    }
}
const adminDashboard = async(req,res)=>{
    try {
        var  search ='';
        if(req.query.search){
            search = req.query.search;
        }
        var page = 1 ;
        if(req.query.page ){
            page = req.query.page;
        }
        var limit =2;
        const userdata =  await UserModel.find({
            is_admin:0,
             $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}},
                {email:{$regex:'.*'+search+'.*',$options:'i'}},
                {mobile:{$regex:'.*'+search+'.*',$options:'i'}},
             ]   
        })
        .limit(limit *1)
        .skip((page -1)* limit)
        const count =  await UserModel.find({
            is_admin:0,
             $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}},
                {email:{$regex:'.*'+search+'.*',$options:'i'}},
                {mobile:{$regex:'.*'+search+'.*',$options:'i'}},
             ]   
        })
        .countDocuments();
        res.render('dashboard',{users:userdata,totalpages:Math.ceil(count/limit),currentpage:page}); 
    } catch (error) {
        console.log(error.message);
    }
}
const newUserload = async(req,res)=>{
    try {
        res.render('new-user')
    } catch (error) {
        console.log(error.message);
    }
}
const addUser = async(req,res)=>{    
    try {
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const img = req.file.filename;
        const password = randomstring.generate(8);

        
        const hashPassword = await securePassword(password);
        const user = new UserModel({
            name:name,
            email:email,
            mobile:mobile,
            img:img,
            password:hashPassword,
            is_admin:0
        })
     
        const adminData = await user.save();
       
        if (adminData) {
           // addUserMail(name,email,password,adminData._id)
            res.redirect('/admin/dashboard')
        } else {
            res.render('admin/new-user',{message:'something west to wrong'});
        }       
    } catch (error) {
        console.log(error.message);
    }
}
// const editUserload = async(req,res)=>{
//     try {
//         const id =req.query.id;
//         const adminData = await UserModel.findById({id:id});
//         if (condition) {
//             res.render('edit-user',{user:adminData})
//         } else {
//             res.redirect('/admin/dashboard')
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }
const editUserload = async(req,res)=>{
    try {
        const adminData = await UserModel.findById(req.params.id)
        res.render('edit-user',{user:adminData});
    } catch (error) {
        console.log(error.message);
    }
}


const updateUsers = async(req,res)=>{
    try {
      const adminData = await UserModel.findByIdAndUpdate({_id:req.params.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,is_verified:req.body.verify}})
    res.redirect('admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}
const deleteUsers = async(req,res)=>{
    try {
        const id = req.query.id;
        const adminData = await UserModel.findByIdAndDelete({_id:id});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}
const exportUsers = async (req,res)=>{
    try {
        const workbook = new  Excel.Workbook();
        const worksheet =workbook.addWorksheet('My User');

        worksheet.columns =[
            // {header:'S_no.',key:'_id', width: 30},
            {header:'Name',key:'name',width: 30},
            {header:'Email ID',key:'email',width:30},
            {header:'Mobile',key:'mobile',width:16},
            {header:'Img',key:'img',width:30},
            {header:'Is Admin',key:'is_admin',width:10},
            {header:'Is varified', key:'is_verified',width:10}
        ];
        let counter = 1;
        const adminData = await UserModel.find({is_admin:0});
        adminData.forEach((user)=>{
            user.S_no = counter;
            worksheet.addRow(user);
            counter++;
        });
        worksheet.getRow(1).eachCell((cell)=>{
            cell.font = {bold:true};    
        });

        res.setHeader(
            "Content-type",
            "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );

        res.setHeader("Content-Disposition",`attachment; filename=users.xlsx`);

        return workbook.xlsx.write(res).then(()=>{
            res.status(200);
        })
        
    } catch (error) {
        console.log(error.message);
    }
}

const exportUserPdf = async(req,res)=>{
    try {
    const users = await UserModel.find({is_admin:0});

    const data={    
    users:users
    }

    const FilePathName = path.resolve(__dirname,'../views/admin/htmlpdf.ejs');

    const htmlString = fs.readFileSync(FilePathName).toString();
    
    let option ={
        format: 'letter'
    }
    
    const ejsData =  ejs.render(htmlString,data);
    pdf.create(ejsData,option).toFile('users.pdf',(err,response)=>{
        if(err)console.log(err,"error bhai error");
        const filePath =    path.resolve(__dirname,'../users.pdf');

        fs.readFile(filePath,(err,file)=>{
        if(err){
            console.log(err,"hello pdf");
            return res.status(500).send('Could not download file');
        }

        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Dispostion','attachment;filename="users.pdf"');
        res.send(file); 
        console.log(file,"qweqwreeqffhhvbhvbh");
    })
    });
    } catch (error) {
        console.log(error,"12121211212");
    }


}
module.exports ={
    loginadmin,
    verifylogin,
    Dashboard,
    logoutadmin,
    adminforget,
    forgetverify,
    forgetPasswordLoad,
    resetpassword,
    adminDashboard,
    newUserload,
    addUser,
    editUserload,
    updateUsers,
    deleteUsers,
    exportUsers,
    exportUserPdf
 
    //addUserMail
}


