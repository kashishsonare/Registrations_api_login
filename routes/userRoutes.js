const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController.js');
const checkUserAuth = require('../middlewares/auth-middleware.js');

//ROUTE LEVEL  MIDDLEWARE -  TO PROTECT ROUTE
router.use('/changepassword',checkUserAuth );
router.use('/loggeduser',checkUserAuth );


//Public Routes:-
router.post('/register',UserController.userRegistration);
router.post('/sendOTP',UserController.sendOTP);

router.post('/login' ,UserController.userLogin);
router.post('/send-reset-password-email',UserController.sendUserPasswordResetEmail);
router.post('/reset_password/:id/:token',UserController.userPasswordReset);

router.get('/getdatauser',UserController.getdata);
router.get('/getid',UserController.getid);

//Protected Routes:- 
router.post('/changepassword',UserController.changePassword);
router.get('/loggeduser',UserController.loggedUser);

module.exports = router ;