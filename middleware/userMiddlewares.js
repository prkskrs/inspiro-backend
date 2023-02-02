const User = require("../model/User.js")
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv")
dotenv.config()

const isLoggedIn=bigPromise(async(req,res,next)=>{
    const token=req.cookies.token||req.header("Authorization").replace("Bearer ","") || req.cookies.token
    // console.log(token)
    if(!token){
        return res.status(403).json({
            success:"false",
            message:"Login First to access this page"
        }) 
    }

    const decode = jwt.verify(token,process.env.JWT_SECRET)
    // console.log(decode)

    req.user=await User.findOne({_id:decode.id})
    return next()

})

const customRole=(...roles)=>{
    return(req,res,next)=>{
        if (!(req.user.role[0]==="admin")){
            return res.status(403).json({
                success:false,
                message:"you're not allowed for this resource."
            })
        }
        next()
    }
}

module.exports = {isLoggedIn,customRole}