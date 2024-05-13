const {instance} = require("../config/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

exports.capturePayment = async (req,res)=>{
    
    const {course_id} = req.body;
    const userId = req.user.id;

    if(!course_id){
        return res.json({
            success:false,
            message:"please provide valid course id"
        })
    };
    try {
        let course;
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"not find course"
            })
        }

        //convert user id(string) into object id
        const uid = new mongoose.Types.ObjectId(userId);

        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"user allready enrolled in course"
            })
        }

        const amount = course.price;
        const currency = "INR";

        const options = {
            amount : amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes:{
                courseId : course_id,
                userId,
            }
        }

        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success:true,
            message:"capture payment done successfully ",
            courseName:course.courseName,
            courseDescription : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse.id,
            currency : paymentResponse.currency,
            amount : paymentResponse.amount,
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"error in payment gatway controller"
        })
    }
}


exports.verifySignature = async(req,res) =>{
    const webhookSecret = "12345678";
    const signature = req.headers("x-razorpay-signature");

    const shasm = crypto.createHmac("sha256",webhookSecret);
    shasm.update(JSON.stringify(req.body));
    const digest = shasm.digest("hex");

    if(signature === digest){
        console.log("payment authorized");

        const {courseId,userId} = req.body.payload.payment.entity.notes;
        try {

            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {
                $push:{
                    studentsEnrolled:userId
                }
            },
            {new:true}
        );

        if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"course not found in payment controller"
            });
        }
        console.log(enrolledCourse);

        const enrolledstudent = await User.findOneAndUpdate(
            {_id:userId},
            {$push:{courses:courseId}},
            {new:true}
        );

        console.log(enrolledstudent);
        
        const emailResponse = await mailSender(
            enrolledstudent.email,
            "Congratulation ",
            "Congratulation you are enrolled in new Course",
            
         );

         console.log(emailResponse);


        return res.status(200).json({
            success:true,
            message:"signature verification and course added"
        })


            
        } catch (error) {
            return res.status(500).json({
            success:false,
            message:error.message
        })
        }
    }

    else{

        return res.status(400).json({
            success:false,
            message:"invalid request"

         })
    }

}





// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }
  
  // enroll the student in the courses
  const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }
  
    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnroled: userId } },
          { new: true }
        )
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" })
        }
        console.log("Updated course: ", enrolledCourse)
  
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        )
  
        console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
  
        console.log("Email sent successfully: ", emailResponse.response)
      } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: error.message })
      }
    }
  }