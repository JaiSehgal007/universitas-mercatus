import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from 'fs';
// fs stands for file system,it is used for product image

export const createProductController=async (req,res)=>{
    try {
        // console.log(req.fields);
       const {name,description,price,category,quantity}=req.fields;
       const {photo}= req.files;

    //    validation
    switch(true){
        case !name:
            return res.status(500).send({error:'Name is Required'});
        case !description:
            return res.status(500).send({error:'Description is Required'});
        case !price:
            return res.status(500).send({error:'price is Required'});
        case !category:
            return res.status(500).send({error:'category is Required'});
        case !quantity:
            return res.status(500).send({error:'quantity is Required'});
        case photo && photo.size > 1000000:
            return res.status(500).send({error:'Photo of size less than 1 mb is required'});
    }

    const products= new productModel({...req.fields,slug:slugify(name)});
    if(photo){
        products.photo.data= fs.readFileSync(photo.path);
        products.photo.contentType=photo.type;
    }
    await products.save();
    res.status(201).send({
        success:true,
        message:'Product created Successfully' ,
        products
    });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in Creating Product'
        })
    }
}

export const getProductController=async(req,res)=>{
    try {
        // now we do not want to increse the size of our request, so we will be using another api for photos
        // and we will merge and use it to maintain the performance of the application
        const products=await productModel.find({}).populate('category').select("-photo").limit(12).sort({createdAt:-1});

        res.status(200).send({
            success:true,
            message:'All Products',
            products,
            countTotal:products.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in getting Product'
        })
    }
}

// get single product
export const getSingleProductController=async(req,res)=>{
    try {
        const product =await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category");
        res.status(200).send({
            success:true,
            message:'Single product fetched',
            product
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in getting single Product'
        })
    }
}

export const productPhotoController=async(req,res)=>{
    try {
       const product =await productModel .findById(req.params.pid).select("photo");
       if(product.photo.data){
        res.set('Content-type',product.photo.contentType);
        return res.status(200).send(product.photo.data);
       }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in getting fetching photo'
        })
    }
}

export const deleteProductController=async(req,res)=>{
    try {
      await productModel.findByIdAndDelete(req.params.pid).select("-photo");
      res.status(200).send({
        success:true,
        message:"product deleted successfully",
      });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in deleting product'
        })
    }
}


export const updateProductController=async (req,res)=>{
    try {
        // console.log(req.fields);
       const {name,description,price,category,quantity}=req.fields;
       const {photo}= req.files;

    //    validation
    switch(true){
        case !name:
            return res.status(500).send({error:'Name is Required'});
        case !description:
            return res.status(500).send({error:'Description is Required'});
        case !price:
            return res.status(500).send({error:'price is Required'});
        case !category:
            return res.status(500).send({error:'category is Required'});
        case !quantity:
            return res.status(500).send({error:'quantity is Required'});
        case photo && photo.size > 1000000:
            return res.status(500).send({error:'Photo of size less than 1 mb is required'});
    }

    const products= await productModel.findByIdAndUpdate(req.params.pid,
        {...req.fields,slug:slugify(name)},{new:true}       
    )

    if(photo){
        products.photo.data= fs.readFileSync(photo.path);
        products.photo.contentType=photo.type;
    }
    await products.save();
    res.status(201).send({
        success:true,
        message:'Product Updated Successfully' ,
        products
    });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in Updated Product'
        })
    }
}