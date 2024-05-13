const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");


exports.createRating = async(req,res)=>{
    try {

        const userId = req.user.id;

        const {rating , review,courseId} = req.body;
        
        const courseDetails = await Course.findOne(
            {_id:courseId,
            studentsEnrolled:{$electMatch:{$eq:userId}}
        } );

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message : "student not enrolled in this course"
            })
        }

        const alreadyRevied = await RatingAndReview.findOne({user:userId, course:courseId})
        if(alreadyRevied){
            return res.status(403).json({
                success:false,
                message : "this cousealready revied by user"
            })
        }

        const ratinfReview = await RatingAndReview.create({rating,review,course:courseId, user:userId});

        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},{
            $push:{
                ratingAndReviews : ratinfReview._id,
            }
        },{new:true});

        console.log(updatedCourseDetails);

        return res.status(200).json({
            success:true,
            message : "review and rating added successfully"
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message : "error while creating rating in controller"
        })
    }
}

exports.getAverageRating = async (req,res)=>{
    try {
        const courseId = req.body.courseid;

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId({courseId}),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating : {$avg:"$rating"},
                }
            }
        ])

        if(result.length()> 0){
            return res.status(200).json({
                success:true,
                message : "average rating fetch successfully",
                averageRating : result[0].averageRating
            })
        }

        return res.status(200).json({
            success:true,
            message : " 0  average rating in controller, no rating ",
            averageRating:0
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "error while get average rating in controller"
        })
    }
}


exports.getAllRating = async (req,res)=>{
    try {
        
        const allReviews = await RatingAndReview.find({}).sort({rating:"desc"}).populate({
            path:"user",
            select:"firstName lastname email image"
        }).populate({
            path:"course",
            select:"courseName"
        }).exec();

        return res.status(200).json({
            success:true,
            message : "fetch all rating successfully",
            data : allReviews
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message : "error while get all rating in controller"
        })
    }
}