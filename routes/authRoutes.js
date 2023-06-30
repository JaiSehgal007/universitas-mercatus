import express from 'express'
import {registerController,loginController,testController,forgotPasswordController} from '../controllers/authController.js'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
// router object -> as we are doing routing in seprate file
const router =express.Router()

// routing

// Register | Method POST
// when adding this in server.js file,then over there we would be apping api to it,
// after '/register' we have to write the callback function
// but here we are following the MVC pattern, so we would be creating seprate controller here

router.post('/register',registerController);

// Login || POST

router.post('/login',loginController);

// Forgot Password (Here we are using a question to track password, as the otp services are paid)
router.post('/forgot-password',forgotPasswordController);

// Test Routes

router.get('/test',requireSignIn,isAdmin,testController);

// protected user route auth

router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})

// protected admin route 

router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
})

export default router;
