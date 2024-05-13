const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {

        //extract token
        //const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "")
        const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token not found"
            })
        }
        //verify token
        try {

            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;


        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "token is invalied"
            })
        }
        console.log("At auth before next");
        next();


    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "something went wrong while validating"
        })
    }
}


exports.isStudent = async(req,res,next) => {
    try {

        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for student only"
            });
        }

        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while checking isStudent"
        })
    }
}



exports.isInstructor = async(req,res,next) => {
    try {

        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for instructor only"
            });
        }

        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while checking is instructor"
        })
    }
}



exports.isAdmin = async(req,res,next) => {
    try {

        if(req.user.accountType !== 'Admin'){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only"
            });
        }

        next();
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error while checking isAdmin"
        })
    }
}


