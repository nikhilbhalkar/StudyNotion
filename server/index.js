const express = require("express");
const app = express();

const userRoutes = require("./routes/User.js");
const profileRoutes = require("./routes/Profile.js");
const paymentRoutes = require("./routes/Payment.js");
const courseRoutes = require("./routes/Course.js");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinary, cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const dotenv = require("dotenv");
const bodyParser = require('body-parser');
app.use(bodyParser.json());

 const PORT = process.env.PORT || 4000;

database.connect();

app.use(express.json());
//app.use(cookieParser);
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
}))

cloudinaryConnect();

// //route

app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);


app.get("/",(req,res)=>{
    return res.send("Working here....")
});


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});



// {
//     "firstName":"nikhil",
//     "lastName":"bhalkar",
//     "password":"123456",
//     "confirmPassword":"123456",
//     "email":"nikhilbhalkar@gmail.com",
//     "accountType":"Admin",
//     "otp":"130720",
//   }


// {
//     "firstName":"vishal",
//     "lastName":"bhalkar",
//     "password":"123456",
//     "confirmPassword":"123456",
//     "email":"bhalkarnikhil8@gmail.com",
//     "accountType":"Admin",
//     "otp":"973209"
//   }

// {
//     "firstName":"vivek",
//     "lastName":"patil",
//     "password":"123456",
//     "confirmPassword":"123456",
//     "email":"bhalkarnikhil23@gmail.com",
//     "accountType":"Instructor",
//     "otp":"579811"
//   }