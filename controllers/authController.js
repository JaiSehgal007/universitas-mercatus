import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import {comparePassword, hashPassword} from '../helpers/authHelper.js'
import JWT from 'jsonwebtoken'

// POST register

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address,answer } = req.body;

        // validation
        if (!name) {
            return res.send({success:false, message: "name is required" });
        }
        if (!email) {
            return res.send({success:false, message: "email is required" });
        }
        if (!password) {
            return res.send({success:false, message: "password is required" });
        }
        if (!phone) {
            return res.send({success:false, message: "phone number is required" });
        }
        if (!address) {
            return res.send({success:false, message: "address is required" });
        }
        if (!answer) {
            return res.send({success:false, message: "Please answer the question" });
        }

        // find existing user
        const existinguser = await userModel.findOne({ email });

        // existing user check
        if (existinguser) {
            return res.status(200).send({
                success:false,
                message: 'user already registered',
            });
        }

        // register user
        const hashedPassword =await hashPassword(password);

        // save
        const user = await new userModel({name,email,phone,address,password:hashedPassword,answer}).save();
        res.status(201).send({
            success:true,
            message:'User registered successfully',
            user,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: 'error in registeration',
            error
        })
    }
}


// POST LOGIN

export const loginController= async (req,res)=>{
    try {
        const {email,password}=req.body

        // validation
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:'Invalid email or password',
            })
        }
        
        // check user
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:'email is not registered'
            })
        }

        const match= await comparePassword(password,user.password)
        if(!match){
            return res.status(200).send({
                success:false,
                message:'invalid password'
            })
        }

        // token creation
        // useing this token we can protect the routes
        // we will generate a middleware, if the token exist, we will show the route else not
        const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        res.status(200).send({
            success:true,
            message:'login successfully',
            user:{
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role,
            },
            token,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: 'error in login',
            error
        })
    }
}

export const forgotPasswordController= async(req,res)=>{
    try {
        const {email,newPassword,answer}=req.body;
        if(!email){
            res.status(400).send("email is required");
        }
        if(!answer){
            res.status(400).send("please answer the question first");
        }
        if(!newPassword){
            res.status(400).send("New Password is required");
        }

        // check
        const user=await userModel.findOne({email,answer})
        // validation 
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Wrong Email or Answer to the question'
            });
        }
        const hashed =await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id,{password:hashed});
        res.status(200).send({
            success:true,
            message:'Password Reset Successfully'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'something went wrong',
            error
        })
    }
}


// test controller

export const testController=(req,res)=>{
    res.send('Protected Route');
}

// update profile
export const updateProfileController = async(req,res)=>{
    try {
        const { name,email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);
        //password
        if (password && password.length < 6) {
          return res.json({ error: "Passsword is required and 6 character long" });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(
          req.user._id,
          {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address,
          },
          { new: true }
        );
        res.status(200).send({
          success: true,
          message: "Profile Updated SUccessfully",
          updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success:false,
            message:'something went wrong in updating profile',
            error
        })
    }
}

export const  getOrdersController =async(req,res)=>{
    try {
        const orders =await orderModel.find({buyer:req.user._id}).populate('products',"-photo").populate('buyer','name');
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'something went wrong in getting orders',
            error
        })
    }
}

export const  getAllOrdersController =async(req,res)=>{
    try {
        const orders =await orderModel
        .find({})
        .populate('products',"-photo")
        .populate('buyer','name')
        .sort({createdAt:-1})
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'something went wrong in getting orders',
            error
        })
    }
}

export const orderStatusController= async(req,res)=>{
    try {
        const {orderId} =req.params;
        const {status} =req.body;
        const orders= await orderModel.findByIdAndUpdate(orderId,{status},{new:true});
        res.json(orders);
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'something went wrong in updating status',
            error
        })
    }
}
