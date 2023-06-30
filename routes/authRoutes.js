import express from 'express'
import {registerController,loginController,testController} from '../controllers/authController.js'
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

// Test Routes

router.get('/test',requireSignIn,isAdmin,testController);

// protected route auth
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})

export default router;
