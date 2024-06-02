const UserModel = require ('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { transporter } = require('../config/emailConfig.js');

// REGISTRATIONS API :- 
async function userRegistration(req,res){
   try {
      const { name, email, password, password_confirmation, tc } = req.body;

      // Check if the user with the given email already exists
      const user = await UserModel.findOne({ email: email });
      if (user) {
         res.send({ status: 'failed', message: 'Email already exists' });
      } else {
         if (name && email && password && password_confirmation && tc) {
            if (password === password_confirmation) {

               // Hash the password
               const salt = await bcrypt.genSalt(10);
               const hashPassword = await bcrypt.hash(password, salt);

               // Create a new user document
               const doc = new UserModel({
                  name: name,
                  email: email,
                  password: hashPassword,
                  tc: tc
               });

               // Save the new user to the dataabase
               await doc.save();

               const saved_user = await UserModel.findOne({ email: email });
               //generate jwt token
               const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
               res.send({ status: 'success', message: 'User registered successfully', token: token });
            } else {
               res.send({ status: 'failed', message: 'Password and confirm password do not match' });
            }
         } else {
            res.send({ status: 'failed', message: 'All fields are required' });
         }
         }
         }catch (error) {
         console.error(error);
         return res.status(500).send({ status: 'failed', message: 'Unable to register' });
   }
}
// send otp
async function sendOTP(req,res) {
   const otpLength = 6;
   const digits = "0123456789";
   let OTP = "";
   for (let i = 0; i < otpLength; i++) {
       OTP += digits[crypto.randomInt(0, digits.length)];
   }
   return OTP;
}

// LOGIN WITH EMAIL AND PASSWORD API :-
async function userLogin(req,res){
   try {
      const { email, password } = req.body
      if (email && password) {
         const user = await UserModel.findOne({ email: email })
         if (user != null) {
            const isMatch = await bcrypt.compare(password, user.password)
            if ((user.email === email) && isMatch) {
               // generate JWT token 
               const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })

               res.send({ status: "success", message: "Login Success", token: token });
            } else {
               res.send({ status: "failed", message: "Email or Password is not valid" });
            }
         } else {
            res.send({ status: "failed", message: "you are not a Registered user" });
         }
      } else {
         res.send({ status: "failed", message: "all fields are Require" });
      }
   } catch (error) {
      console.log(error)
      res.send({ status: "failed", message: "unbale to login" });
   }

}

// CHANGE PASSWORD API:-  
async function changePassword(req,res){
   const { password, password_confirmation } = req.body
   if (password && password_confirmation) {
      if (password !== password_confirmation) {
         res.send({ status: "failed", message: "new password and confirm new password doesn't match" })
      } else {
         const salt = await bcrypt.genSalt(10)
         // console.log(req.user);
         const newHashPassword = await bcrypt.hash(password, salt)
         // console.log(req.user._id)
         await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
         res.send({ status: "success", message: "password changed succesfully" });
      }
   }
   else {
      res.send({ status: "failed", message: "All Fields are Required" });
   }
}

// LOGGED USER API:-
async function loggedUser(req,res){ 
    res.send({"user": req.user })
} 

// sendUserPasswordResetEmail [RESET PASSWORD ] APT :-
async function sendUserPasswordResetEmail(req, res){
   const { email } = req.body
   if (email) {
      const user = await UserModel.findOne({email: email});
      console.log(user)
      const secret = user._id + process.env.JWT_SECRET_KEY
      if (user){
         const token = jwt.sign({ userID:user._id }, secret, { expiresIn: '15m' })
         const link = `http:-//127.0.0.1.3000/api/user/reset/${user._id}/${token}`
         console.log(link);

         //SEND EMAIL
         let info = await transporter.sendMail({
            from : process.env.EMAIL_FROM,
            to : user.email,
            subject:"hello kashish sonare",
            html: `<a href = ${link}> Click Here </a> to Reset Your Password `,
            password: process.env.EMAIL_PASS
         })
         res.send({ status: "success", message: " Password Reset Email Sent... Please  check  your Email" , info });
         //api/user/reset/:id/:token
         } else {
          res.send({ status: "failed", meassage: " Email doesn't exists"});
         }
         } else {
         res.send({ status: "failed", message: "Email Field  is  Required "});
   }
}

// RESET PASSWORD API:-
async function userPasswordReset(req,res){
    const {password, password_confirmation} = req.body
    const {id, token} = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try{
       jwt.verify(token, new_secret)
       if(password && password_confirmation){
         if(password !== password_confirmation){
            res.send({ status: "failed", message :"new password and confirm new password doesn't match"});   
            }else{
               const salt = await bcrypt.genSalt(10);
               const newHashPassword = await bcrypt.hash(password,salt);
               await UserModel.findByIdAndUpdate(req._id,{$set:{password: newHashPassword}});
               res.send({status: "success", message:"Password Reset Successfully "});
            }
            }else{
            res.send({status:"failed", message: "all fields are Required"});
            }
            }catch(error){
            console.log(error);
            res.send({status:"failed",message:"Invalid Token"});
            }
}

//get data mogoose all data:-

async function getdata(req,res){
   try {
      console.log("first")
      const getdata = await UserModel.find();
      console.log(getdata,'hii');
      res.send(getdata);
  }
  catch (e) {
      res.status(400).send(e);
  }
}


// getdata  by id
async function getid(req,res){
   try {
      const id = req.params.id;
      const getMen = await UserModel.findById(id);
      res.send(getMen);
  }
  catch (e) {
      res.status(400).send(e);
  }
}


module.exports = { userRegistration , sendOTP ,userLogin, changePassword, loggedUser, sendUserPasswordResetEmail, userPasswordReset,getdata,getid }



