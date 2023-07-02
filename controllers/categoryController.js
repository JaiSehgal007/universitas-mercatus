import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController= async(req,res)=>{
    try {
        const {name}=req.body
        if(!name){
            return res.status(401).send({
                message:'Name is required'
            });            
        }
        const existingCategory =await categoryModel.findOne({name});
        if(existingCategory){
            res.status(200).send({
                success:true,
                message:'Category Already Exists',
            })
        }
        const category =await new categoryModel({name,slug:slugify(name)}).save();
        res.status(201).send({
            success:true,
            message:'New Category Created',
            category
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in Category'
        })
    }
}

export const updateCategoryController=async(req,res)=>{
    try {
        
        const {name}=req.body;
        const {id}=req.params; // req.params means that we are going to get the id through the url
        const category= await categoryModel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true}); // the third parameter is passed inorder to update the category page, if not passes then the page wont get updated
        res.status(200).send({
            success:true,
            message:'category updated successfully',
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error while updating Category'
        })
    }
}

export const categoryController=async (req,res)=>{
    try {
        const category= await categoryModel.find({});
        res.status(200).send({
            success:true,
            message:'All categories List',
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error while getting all categories'
        })
    }
}

export const singleCategoryController=async(req,res)=>{
    try {
        const category=await categoryModel.findOne({slug:req.params.slug});
        res.status(200).send({
            success:true,
            category,
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error while getting single categories'
        })
    }
}   

export const daleteCategoryController=async(req,res)=>{
    try {
        const {id}=req.params;
        const category= await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success:true,
            message:'Category Deleted Successfully',
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error while getting single categories'
        })
    }
}