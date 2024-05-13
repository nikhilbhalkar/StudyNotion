const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async(req,res)=>{
    try {
        
        const {dateOfBirth="",about="",contactNumber ,gender} = req.body;
        const id = req.user.id;

        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error while updating profile",
        })
    }
}

//delete account

exports.deleteAccount = async (req,res) =>{
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found",
            })
        }

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        await User.findByIdAndDelete({_id:id});

        //enroll user from all enroll courses

        return res.status(200).json({
            success:true,
            message:"Account deleted successfully",
        })
//cronjob find this concept ====== very inportant
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"error while deleting profile in profile controller",
        })
    }
}


exports.getAllUserDetails = async (req,res) =>{
    try {
        const id = req.user.id;

        const userDetails = await  User.findById(id).populate("additionalDetails");

        return res.status(200).json({
            success:true,
            message:"USer data successfully fetch",
            userDetails,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error while get all user details",
        })
    }
}

