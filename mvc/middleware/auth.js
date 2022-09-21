const authLogin =async(req,res,next)=>{
    try {
        if (req.session.user_id) {
            console.log(req.session.user_id,'authlogin');
        } else {
            res.redirect('/');
        }
        next();
    } catch (error) {
        console.log(error,"hello  ");
    }
}

const authLogout = async (req,res,next)=>{
    try {
        if (req.session.userid) {
            res.redirect('/home')
        }
        next();

    } catch (error) {
        console.log(error.message,"sads")
    }
}

module.exports ={
    authLogin,
    authLogout
}