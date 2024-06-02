const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.js');

async function checkUserAuth(req, res, next ){
    let token 
    const { authorization } = req.headers
    if(authorization && 
        authorization.startsWith('Bearer')){
        try{
            // GET  TOKEN   FROM HEADERS
            token = authorization.split(' ')[1] 
            console.log("Token", token)
            console.log("Authorization",authorization)
            //verify Token 
            const{userID} = jwt.verify(token,process.env.JWT_SECRET_KEY)  
            console.log(userID);
            //get User from token 
            req.user = await UserModel.findById(userID).select('-password')
            console.log(req.user);
            next()
            }catch(error){
            console.log(error)
            res.status(401).send({ status: "failed", message: "Unauthorized User" });
            }
            }
        if(!token){
        res.status(401).send({ status: "failed" , message: "Unauthorized  User, no token "});
           }
        }    
        
module.exports = checkUserAuth ; 